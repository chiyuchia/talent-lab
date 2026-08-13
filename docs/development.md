# talent-lab 开发文档

本文档面向项目开发者，介绍 talent-lab 的整体架构、模块职责、本地开发流程、测试方式与编码约定。产品需求见 [prd.md](prd.md)，实施规划见 [implementation-plan.md](implementation-plan.md)。

## 1. 架构概览

talent-lab 采用前后端分离架构；开发环境由 Vite 代理 API，生产环境的前端与后端分别部署：

```text
浏览器
  |
  |-- 开发环境：Vite Dev Server (5173) --proxy--> Flask (8000)
  |
  `-- 生产环境：Cloudflare Pages（前端静态资源）
          |
          `-- HTTPS /api --> 宿主机 Nginx --> Gunicorn + Flask（REST API + SSE）
```

核心数据流（简历处理链路）：

```text
PDF 上传 (POST /api/uploads/resumes)
   |
   v
SSE 事件流 (GET /api/uploads/:id/events)
   |  1. 提取 PDF 文本（PyMuPDF）
   |  2. 清洗文本（clean_resume_text）
   |  3. AI 结构化提取（AiService，mock/real 双模式）
   |  4. 写入 Candidate + ResumeProfile
   v
评分 (POST /api/scores) --> ScoreResult（关联 Candidate 与 JobDescription）
```

## 2. 后端（backend/）

### 2.1 技术栈

- Python >= 3.12，Flask + Gunicorn
- Flask-SQLAlchemy（ORM），SQLite（默认，可用 `DATABASE_URL` 切换）
- PyMuPDF：PDF 文本提取
- OpenAI 兼容 SDK：对接 OpenAI / Moonshot / DeepSeek

### 2.2 模块职责

| 模块 | 文件 | 职责 |
|------|------|------|
| 应用工厂 | `app/__init__.py` | 创建 Flask app、注册蓝图、初始化扩展、`init-db` 命令 |
| 配置 | `app/config.py` | 环境变量读取、生产环境必填项校验、运行时目录准备 |
| 扩展 | `app/extensions.py` | SQLAlchemy 实例等 Flask 扩展单例 |
| 认证 | `app/security.py` | 单密钥登录校验（`hmac.compare_digest`）、`require_auth` 装饰器 |
| 蓝图 | `app/blueprints/` | REST API：`auth`、`uploads`、`candidates`、`jobs`、`scores`、`health` |
| 模型 | `app/models/` | `Candidate`、`ResumeProfile`、`JobDescription`、`ScoreResult` |
| AI 服务 | `app/services/ai_service.py` | `AiService`：简历结构化提取、JD 解析与岗位评分，支持 mock/real 模式 |
| JD 解析 | `app/services/job_parser.py` | 从粘贴的 JD 文本提取岗位名称、必备技能与加分技能 |
| PDF 服务 | `app/services/pdf_service.py` | `extract_pdf_text` / `clean_resume_text` |
| Prompt | `app/services/prompts.py` | AI 提取与评分的提示词模板 |
| 工具 | `app/utils/` | 统一响应格式（`responses.py`）、序列化（`serializers.py`）、路径（`paths.py`） |

### 2.3 关键约定

- **统一响应**：成功与错误响应都通过 `app/utils/responses.py` 输出，新增接口时不要手写散装 `jsonify` 结构。
- **认证**：除 `auth/login` 与 `health` 外，所有 API 需经 `@require_auth`；会话基于签名 Cookie（`PERMANENT_SESSION_LIFETIME = 12h`）。
- **SSE 事件**：`uploads.py` 中的 `sse_event(event, data)` 统一序列化事件帧（`event:` + `data:` + 空行）。事件覆盖批次状态、单份简历进度、提取结果与错误等，前端 `ResumeStreamViewer` 逐步渲染。
- **AI 模式**：`AI_MODE=mock` 时不调用外部 API，返回本地生成的结构，便于无 Key 开发与测试；`real` 模式按 `AI_PROVIDER` 路由到对应服务商（`OPENAI_BASE_URL` 支持任意 OpenAI 兼容端点）。
- **生产校验**：`ENV=production` 时启动会强制校验 `APP_ACCESS_KEY` 与 `FLASK_SECRET_KEY`，缺失或仍为默认值会直接抛错。
- **上传限制**：`MAX_CONTENT_LENGTH = 50MB`，仅接受 PDF，批量上限为 10 份。

### 2.4 本地开发

首次安装在项目根目录执行：

```bash
make backend-install
cp backend/.env.example backend/.env
make backend-init
```

日常启动执行 `make backend-dev`。该命令直接使用 `backend/.venv` 中的 Flask，无需手动激活虚拟环境。可按需修改 `backend/.env` 中的 `APP_ACCESS_KEY`。

数据库与上传文件默认落在 `backend/instance/` 下（相对路径基于 instance 目录解析）。

### 2.5 测试

```bash
make backend-test   # 使用 backend/.venv 中的 pytest
```

测试位于 `backend/tests/`：

| 文件 | 覆盖范围 |
|------|----------|
| `test_auth.py` | 登录/登出/会话校验 |
| `test_business_api.py` | 候选人、JD、评分等业务接口 |
| `test_ai_service.py` | AI 提取与评分逻辑（mock 模式） |

新增接口或修改服务逻辑时应同步补测试，优先复用现有 fixture 与 mock 模式，避免在测试中发起真实网络请求。

## 3. 前端（frontend/）

### 3.1 技术栈

- Vite + React 18 + TypeScript，React Router
- TanStack Query：服务端状态（列表、详情、评分等数据获取与缓存）
- Zustand：UI 状态（主题、对比选择等）
- i18next + react-i18next：中英文界面与浏览器语言检测（非中文环境默认英文，手动选择会保存在 localStorage）
- Tailwind CSS + lucide-react 图标，Recharts 图表

视觉令牌、组件样式和交互约束见 [前端设计规范](frontend-design-guidelines.md)。

### 3.2 目录与职责

| 目录 | 职责 |
|------|------|
| `src/app/router.tsx` | 路由定义，受保护页面包在 `ProtectedRoute` 内 |
| `src/pages/` | 页面：登录、仪表盘、上传、候选人列表/详情、对比、JD |
| `src/components/` | 共享组件：`AppShell`、`ResumeStreamViewer`、`CompareResultPanel`、状态徽标、空态、骨架屏等 |
| `src/lib/api.ts` | 统一 API 客户端（fetch 封装、错误归一化、SSE 解析） |
| `src/i18n/` | 国际化初始化与中英文翻译资源 |
| `src/lib/query-client.ts` | TanStack Query 客户端配置 |
| `src/lib/*-store.ts` | Zustand store（UI 状态、对比选择） |
| `src/types/api.ts` | 与后端响应对齐的 TypeScript 类型 |

### 3.3 关键约定

- **数据获取走 TanStack Query**：不要在组件里裸用 `fetch`；mutation 后按需 `invalidateQueries`。
- **UI 状态与服务器状态分离**：本地偏好（主题、视图模式）进 Zustand/localStorage，后端数据一律进 Query 缓存。
- **类型对齐**：接口字段变更时同时更新后端序列化器与 `src/types/api.ts`。
- **登录态处理**：401 统一由 API 客户端归一化错误，配合 `ProtectedRoute` 跳转登录页；登录成功后立即刷新 session 缓存（见提交 `40ff0a2`）。
- **SSE**：上传解析进度通过 `GET /api/uploads/:id/events` 订阅，组件需处理流中断与错误事件。

### 3.4 本地开发

首次安装在项目根目录执行：

```bash
make frontend-install
```

日常启动执行 `make frontend-dev`。开发服务器默认 `http://localhost:5173`，`/api` 经 Vite proxy 转发到 `http://localhost:8000`。

## 4. 数据模型

```text
Candidate (id, upload_batch_id, status, parse_status, pdf_path, created_at...)
  1:1  ResumeProfile (姓名、电话、邮箱、城市、教育、工作、技能、项目，JSON 字段)
  1:n  ScoreResult  (overall_score, skill/experience/education 子分, ai_comment)

JobDescription (title, description, required_skills, bonus_skills)
  1:n  ScoreResult
```

- 状态机：待筛选 → 初筛通过 → 面试中 → 已录用 / 已淘汰，枚举值见 `app/constants.py`。
- 结构化简历字段以 JSON 存储在 `ResumeProfile` 中，写入前经 `uploads.py` 的 `normalize_profile` 规整。

## 5. 常用命令

```bash
make backend-install  # 首次安装后端依赖
make backend-init     # 首次初始化数据库
make backend-dev      # 后端开发服务器 :8000
make frontend-install # 首次安装前端依赖
make frontend-dev     # 前端开发服务器 :5173
make backend-test     # 后端测试
make compose-up       # Docker 构建并启动
make compose-down     # 停止 Docker 服务
```

## 6. 部署要点

- **前端**部署在 Cloudflare Pages，生产地址为 <https://talent-lab.440115.xyz/>；Pages 关联 `master` 分支，分支更新后自动构建并发布。
- Cloudflare Pages 构建时通过 `VITE_API_BASE_URL` 指向生产后端 API；后端的 `FRONTEND_ORIGIN` 应设置为 `https://talent-lab.440115.xyz`，以允许携带 Cookie 的跨域请求。
- **后端**通过 `deploy/docker-compose.yml` 部署；仓库中的容器内 Nginx 配置仍可用于完整的 Docker 自托管部署。
- 宿主机反代参考 `deploy/nginx/nginx-host.conf.example` 与 `vps-backend.conf.example`，注意：
  - SSE 必须 `proxy_buffering off`，并配置较长超时；
  - `client_max_body_size 50m` 支持批量上传；
  - 有域名时启用 HTTPS 并设 `SESSION_COOKIE_SECURE=true`。
- SQLite 与上传文件通过 volume 持久化，容器重启不丢数据。

## 7. 编码规范

- **提交信息**：遵循 Conventional Commits，格式与示例见本文 §7.1。
- **文件规模**：单个源码文件不超过 200 行，细则见本文 §7.2。
- **后端**：遵循 PEP 8；业务逻辑下沉到 `services/`，蓝图保持薄层只做参数解析与响应。
- **前端**：函数组件 + Hooks；共享逻辑放 `lib/` 或自定义 Hook；样式优先 Tailwind 原子类，避免散落行内样式。
- **环境变量**：新增配置项需同步更新 README 环境变量表与部署示例文件；`.env` 一律不入库。

### 7.1 提交信息规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/)，格式为：

```text
<type>(<scope>): <subject>
```

常用 `type`：

| 类型 | 说明 |
|------|------|
| `feat` | 新增功能 |
| `fix` | 修复问题 |
| `docs` | 文档更新 |
| `style` | 不影响逻辑的格式或样式调整 |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 工程配置、依赖、脚本等维护工作 |
| `build` | 构建或部署相关 |
| `ci` | CI/CD 配置 |

示例：

```text
feat(auth): add access key login
fix(upload): handle invalid PDF files
docs(readme): add deployment instructions
```

### 7.2 文件规模规范

单个源码文件不超过 **200 行**（`wc -l` 口径，含空行与注释）。

**适用范围**

- 后端：`backend/app/**/*.py`
- 前端：`frontend/src/**/*.{ts,tsx}`

**豁免**

- 测试文件（如 `backend/tests/`）：测试长是常态，硬拆反而伤可读性。
- 自动生成的文件。

**执行方式**

- 新文件一律遵守；改动既有文件时若超限，应在本次改动中顺带拆分。
- 拆分方向按职责划分：后端下沉 `services/` 或 `utils/`，前端提取子组件、常量配置或自定义 Hook（参考 `components/candidates/`、`components/stream/` 等既有拆分）。
- 行数只是复杂度的代理信号，真正目标是单一职责：一个 210 行的内聚模块不必硬拆，一个 150 行塞了多件事的文件也应该拆。

**现状与工具**

- 当前全库达标（2026-08 完成存量重构）。
- 工具落地为可选增强：前端可在 ESLint 配置 `max-lines: ["warn", { max: 200, skipBlankLines: true, skipComments: true }]`；后端可用 CI 脚本对 `backend/app/` 做 `wc -l` 检查。未配置前以 code review 人工把关。

## 8. 新增一个 API 的推荐流程

1. 在对应蓝图文件中新增路由，挂 `@require_auth`。
2. 业务逻辑放入 `services/` 或在蓝图内复用现有 helper。
3. 用 `utils/responses.py` 输出统一响应，序列化走 `utils/serializers.py`。
4. 在 `backend/tests/` 补充接口测试。
5. 前端在 `lib/api.ts` 添加客户端方法与类型，页面通过 TanStack Query 消费。
6. 更新 README API 概览表与本文件相关章节。
