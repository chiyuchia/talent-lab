# talent-lab

<p align="center">
  <b>AI 赋能的简历分析与求职机会管理平台</b>
</p>

<p align="center">
  管理多版简历 · 结构化职位机会 · AI 匹配分析 · 申请进度追踪
</p>

<p align="center">
  <a href="https://talent-lab.440115.xyz/">访问生产环境</a>
</p>

---

talent-lab 是一个带单密钥访问控制的个人求职工作台：集中管理多版 PDF 简历与职位机会，利用 AI 完成结构化提取、匹配评分和改写建议，并通过申请时间线持续跟踪后续进展。

## 特性

- **统一简历工作区**：在同一模块完成 PDF 上传、解析进度查看、搜索、筛选与版本管理
- **批量 PDF 上传**：支持拖拽上传和点击上传，单次最多 5 份 PDF 简历
- **SSE 流式解析**：实时展示 PDF 文本提取和 AI 信息提取进度
- **AI 结构化提取**：自动提取姓名、联系方式、教育背景、工作经历、技能标签、项目经历
- **职位机会管理**：记录来源、地点、任职要求、薪酬、联系人、个人判断和下一步行动，并支持搜索、状态筛选、收藏和优先级
- **JD 粘贴解析**：提取公司、职位、职责、经验、学历、技能和薪资，确认预览后再应用到表单
- **多简历匹配**：每个职位可匹配多份简历并保留结果，展示匹配优势、技能缺口和简历定制建议
- **申请时间线**：跟踪未申请、准备、已投递、笔试、面试、Offer 等状态，并可补录备注和待办事项
- **简历库管理**：表格/卡片视图切换、关键字搜索、技能筛选、评分排序、分页浏览，视图与分页偏好自动保存
- **简历对比**：支持 2-3 份简历并排对比各维度评分和 AI 评语
- **状态流转**：待筛选 → 初筛通过 → 面试中 → 已录用 / 已淘汰
- **中英双语**：根据浏览器语言自动选择中文或英文，也可手动切换并保存偏好
- **主题切换**：支持暗色/亮色主题并保存偏好

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vite + React 18 + TypeScript + React Router + Tailwind CSS |
| 状态管理 | TanStack Query (服务端状态) + Zustand (UI 状态) |
| 国际化 | i18next + react-i18next |
| 数据可视化 | Recharts |
| 后端 | Python + Flask + Gunicorn |
| ORM | Flask-SQLAlchemy |
| 数据库 | SQLite |
| PDF 解析 | PyMuPDF |
| AI 接口 | OpenAI 兼容 API（OpenAI / Moonshot / DeepSeek）+ 本地 Mock |
| 部署 | Cloudflare Pages（前端）+ GitHub Actions / GHCR / Docker Compose / OpenResty（后端） |

## 项目结构

```text
talent-lab/
├── backend/              # Flask REST API
│   ├── app/
│   │   ├── blueprints/   # API 路由 (auth, uploads, candidates, jobs, scores)
│   │   ├── models/       # SQLAlchemy 数据模型
│   │   ├── services/     # AI、PDF、JD 解析、职位数据与数据库迁移服务
│   │   ├── utils/        # 统一响应、序列化与通用工具
│   │   ├── config.py     # 应用配置
│   │   └── security.py   # 认证装饰器
│   ├── tests/            # 后端测试
│   ├── Dockerfile
│   ├── requirements.txt
│   └── wsgi.py           # 应用入口
├── frontend/             # React 前端
│   ├── src/
│   │   ├── app/          # 路由配置
│   │   ├── components/   # 共享组件
│   │   ├── pages/        # 页面组件
│   │   ├── i18n/         # 中英文翻译资源
│   │   ├── lib/          # API 客户端、工具函数、状态管理
│   │   └── types/        # TypeScript 类型定义
│   └── package.json
├── deploy/               # VPS 后端部署包
│   ├── docker-compose.yml
│   ├── deploy.sh
│   ├── .env.production.example
│   └── README.md
├── .github/workflows/
│   └── backend-image.yml # 后端测试、镜像发布与生产部署
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- Python >= 3.12
- Docker & Docker Compose（部署用）

### 首次安装

```bash
# 在项目根目录执行
make backend-install
cp backend/.env.example backend/.env
make backend-init
make frontend-install
```

可按需修改 `backend/.env` 中的 `APP_ACCESS_KEY`。本地默认使用 `AI_MODE=mock`，无需真实 AI Key 即可跑通完整流程。

### 日常启动

在项目根目录执行：

```bash
# 同时启动前端与后端开发服务器
make dev
```

或分别打开两个终端执行：

```bash
# 终端一：后端开发服务器 :8000
make backend-dev

# 终端二：前端开发服务器 :5173
make frontend-dev
```

打开 `http://localhost:5173`。前端通过 Vite proxy 访问 `http://localhost:8000/api`。

### 登录

项目采用单密钥访问控制，无用户注册系统。首次访问需输入访问密钥登录。

本地开发可使用 `backend/.env.example` 提供的开发访问密钥；**生产环境必须替换为高强度随机密钥**。

## 环境变量

### 后端

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `FLASK_ENV` | 运行环境；生产部署设为 `production` | `development` |
| `FLASK_SECRET_KEY` | Cookie 签名密钥（生产环境必填） | `dev-secret-change-me` |
| `APP_ACCESS_KEY` | 访问密钥（生产环境必填） | 未设置 |
| `DATABASE_URL` | 数据库地址 | `sqlite:///talent-lab.sqlite3` |
| `UPLOAD_DIR` | PDF 上传目录 | `instance/uploads` |
| `RESUME_STORAGE_BACKEND` | 简历文件存储：`local` 或 `r2` | `local` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID（R2 模式必填） | 未设置 |
| `R2_ACCESS_KEY_ID` | R2 S3 API Access Key ID（R2 模式必填） | 未设置 |
| `R2_SECRET_ACCESS_KEY` | R2 S3 API Secret Access Key（R2 模式必填） | 未设置 |
| `R2_BUCKET_NAME` | 私有 R2 bucket 名称（R2 模式必填） | 未设置 |
| `R2_OBJECT_PREFIX` | R2 内简历对象前缀 | `resumes` |
| `AI_MODE` | AI 模式：`mock` 或 `real` | `mock` |
| `AI_PROVIDER` | AI 提供商：`openai` / `moonshot` / `deepseek` | `openai` |
| `OPENAI_API_KEY` | OpenAI API Key | 未设置 |
| `OPENAI_BASE_URL` | OpenAI 兼容接口地址 | 未设置 |
| `OPENAI_MODEL` | OpenAI 模型名称 | 未设置 |
| `MOONSHOT_API_KEY` | Moonshot API Key | 未设置 |
| `MOONSHOT_BASE_URL` | Moonshot 兼容接口地址 | `https://api.moonshot.cn/v1` |
| `MOONSHOT_MODEL` | Moonshot 模型名称 | `moonshot-v1-8k` |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 未设置 |
| `DEEPSEEK_BASE_URL` | DeepSeek 兼容接口地址 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | DeepSeek 模型名称 | `deepseek-chat` |
| `FRONTEND_ORIGIN` | 前端域名（CORS 用） | 未设置 |
| `SESSION_COOKIE_SAMESITE` | 会话 Cookie 的 SameSite 策略 | `Lax` |
| `SESSION_COOKIE_SECURE` | Cookie 仅 HTTPS 传输 | `false` |

### Cloudflare R2 简历存储

R2 模式下，后端通过 S3 兼容 API 将简历保存到**私有** bucket；浏览器仍通过已鉴权的
`GET /api/candidates/:id/pdf` 获取预览，不需要设置公开 bucket、公开域名或 R2 CORS。

1. 在 Cloudflare R2 创建一个 Standard bucket，例如 `talent-lab-resumes`。
2. 创建仅针对该 bucket 的 R2 API token，权限设为 `Object Read & Write`；不要使用账户级
   管理 token。
3. 将 Account ID、Access Key ID 和 Secret Access Key 写入部署环境，设置：

   ```dotenv
   RESUME_STORAGE_BACKEND=r2
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key-id
   R2_SECRET_ACCESS_KEY=your-secret-access-key
   R2_BUCKET_NAME=talent-lab-resumes
   R2_OBJECT_PREFIX=resumes
   ```

4. 重启后端。新上传的简历会写入 R2；已有记录保留其原本的 `local` 存储标记，仍从本地读取。

R2 凭据只能放在后端环境变量中，不能写入前端代码、提交到仓库，或通过公开 URL 暴露简历。

### 前端

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | API 基础路径 | `/api` |

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 密钥登录 |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/session` | 检查会话状态 |
| POST | `/api/uploads/resumes` | 批量上传 PDF |
| GET | `/api/uploads/:id/events` | SSE 流式解析进度 |
| GET | `/api/candidates` | 候选人列表（搜索/筛选/排序/分页） |
| GET | `/api/candidates/:id` | 候选人详情 |
| PATCH | `/api/candidates/:id/profile` | 更新候选人简历信息 |
| PATCH | `/api/candidates/:id/status` | 更新候选人状态 |
| POST | `/api/candidates/compare` | 2-3 人对比 |
| GET | `/api/candidates/:id/pdf` | 下载原始 PDF |
| GET | `/api/jobs` | 职位机会列表（支持关键字、状态与收藏筛选） |
| POST | `/api/jobs/parse` | 结构化解析粘贴的 JD 文本 |
| POST | `/api/jobs` | 创建职位机会 |
| PATCH | `/api/jobs/:id` | 更新职位机会 |
| DELETE | `/api/jobs/:id` | 删除职位机会 |
| GET | `/api/jobs/:id/events` | 申请时间线 |
| POST | `/api/jobs/:id/events` | 补录申请事件 |
| GET | `/api/scores` | 评分结果列表 |
| POST | `/api/scores` | 对一份简历与一个或多个职位执行匹配评分 |
| GET | `/api/health` | 健康检查 |

## 生产部署

### 前端（Cloudflare Pages）

生产环境前端部署在 Cloudflare Pages：<https://talent-lab.440115.xyz/>。

Cloudflare Pages 关联本仓库的 `master` 分支；`master` 更新后会自动执行前端构建并发布。构建时需配置 `VITE_API_BASE_URL`，使前端请求指向生产环境后端 API。

当前 Pages 构建配置：

```text
Build command: cd frontend && npm ci && npm run build
Build output directory: frontend/dist
Production branch: master
VITE_API_BASE_URL: https://talentlensapi.440115.xyz:8443/api
```

### 后端（Docker Compose）

推送到 `master` 或 `main` 且改动涉及后端构建输入时，GitHub Actions 会先运行后端测试与字符检查，再构建并发布带提交 SHA 标签的后端镜像到 GitHub Container Registry：`ghcr.io/chiyuchia/talent-lab-backend`。`master` 构建成功后会通过 SSH 自动部署镜像摘要；`main` 只构建镜像。纯前端或文档改动不会触发该工作流，也可通过 `workflow_dispatch` 手动运行。VPS 仅拉取并运行通过测试的不可变镜像，不再从源码构建。

#### 1. 配置生产环境变量

将 `deploy/` 目录安装到 VPS 的 `/opt/talent-lab/deploy`，并从 `.env.production.example` 创建不入库的 `.env.production`。至少设置 `APP_ACCESS_KEY`、`FLASK_SECRET_KEY` 和 `AI_MODE`；真实 AI 模式还需配置对应服务商的 API Key 与模型。

部署目录及其中的脚本、Compose 和环境文件必须由 root 所有，不得放在 `deploy` 用户可改写的路径后再通过 sudo 执行。完整初始化步骤见 [`deploy/README.md`](deploy/README.md)。

#### 2. 部署镜像

```bash
sudo /opt/talent-lab/deploy/deploy.sh \
  ghcr.io/chiyuchia/talent-lab-backend@sha256:<64-hex-digest>
```

脚本会验证镜像来源、拉取镜像、备份 SQLite、执行幂等迁移、等待健康检查，将当前镜像写入 `.env.release`，然后清理该后端仓库中不再使用的旧镜像。Compose 默认将后端服务绑定到宿主机 `127.0.0.1:8000`。

#### 3. 配置宿主机反向代理

在宿主机 OpenResty 中，将生产 API 域名的 `/api/` 请求转发到 `http://127.0.0.1:8000`。注意：

- 为 SSE 配置 `proxy_buffering off`
- 配置较长代理超时，避免 AI 提取期间连接被关闭
- 配置 `client_max_body_size 50m` 以支持批量上传
- 有域名时启用 HTTPS
- 将 `FRONTEND_ORIGIN` 设置为 `https://talent-lab.440115.xyz`，允许 Cloudflare Pages 前端携带 Cookie 跨域访问 API

#### 4. 数据持久化

SQLite 数据库始终通过 Docker volume 持久化。使用 `RESUME_STORAGE_BACKEND=local` 时，上传的 PDF 也保存在 Docker volume；使用 `r2` 时，PDF 保存在私有 Cloudflare R2 bucket。容器重启不会删除这些数据。

## 常用命令

```bash
# 本地开发
make dev                # 同时启动前端与后端开发服务器
make backend-install    # 首次安装后端依赖
make backend-init       # 首次初始化数据库
make backend-dev        # 执行幂等数据库迁移并启动后端开发服务器
make frontend-install   # 首次安装前端依赖
make frontend-dev       # 启动前端开发服务器

# 测试
make backend-test       # 运行后端测试
make check-badchars     # 检查禁用字符清单

# Docker
make compose-up         # 使用 deploy/.env.release 中的镜像启动服务
make compose-down       # 停止 Docker 服务
```

## 数据模型

```text
Candidate          候选人（上传批次、状态、PDF 路径、解析状态）
  └── ResumeProfile    简历结构化信息（姓名、联系方式、教育、工作、技能、项目）
  └── ScoreResult      职位匹配结果（综合分、各维度分、AI 评语、匹配洞察）

JobDescription     职位机会（JD、结构化要求、薪酬、申请状态、投递版本）
  └── ApplicationEvent  申请时间线（状态、笔试、面试、Offer、备注、待办）
  └── ScoreResult      关联的候选人评分
```

## 开发规范

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)，详细规则见 [docs/development.md](docs/development.md) §7.1。

## 许可证

[MIT](LICENSE)
