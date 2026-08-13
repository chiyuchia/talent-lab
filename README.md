# talent-lab

<p align="center">
  <b>AI 赋能的智能简历分析平台</b>
</p>

<p align="center">
  管理多版简历 · 结构化职位机会 · AI 匹配分析 · 申请进度追踪
</p>

<p align="center">
  <a href="https://talent-lab.440115.xyz/">访问生产环境</a>
</p>

---

## 特性

- **批量 PDF 上传** — 支持拖拽上传和点击上传，单次最多 10 份 PDF 简历
- **SSE 流式解析** — 实时展示 PDF 文本提取和 AI 信息提取进度
- **AI 结构化提取** — 自动提取姓名、联系方式、教育背景、工作经历、技能标签、项目经历
- **职位机会管理** — 记录来源、地点、任职要求、薪酬、联系人、个人判断和下一步行动
- **JD 粘贴解析** — 提取公司、职位、职责、经验、学历、技能和薪资，确认预览后再应用到表单
- **多简历匹配** — 每个职位可匹配多份简历，并记录实际投递版本、技能缺口和定制建议
- **申请时间线** — 保存状态变化，并可补录笔试、面试、Offer、备注和待办事项
- **候选人管理** — 表格/卡片视图切换、关键字搜索、技能筛选、评分排序、分页浏览
- **候选人对比** — 支持 2-3 人并排对比各维度评分和 AI 评语
- **状态流转** — 待筛选 → 初筛通过 → 面试中 → 已录用 / 已淘汰
- **主题切换** — 支持暗色/亮色主题，偏好持久化到 localStorage

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vite + React 18 + TypeScript + Tailwind CSS |
| 状态管理 | TanStack Query (服务端状态) + Zustand (UI 状态) |
| 数据可视化 | Recharts |
| 后端 | Python + Flask + Gunicorn |
| ORM | Flask-SQLAlchemy |
| 数据库 | SQLite |
| PDF 解析 | PyMuPDF |
| AI 接口 | DeepSeek |
| 部署 | Cloudflare Pages（前端）+ Docker Compose / Nginx（后端） |

## 项目结构

```text
talent-lab/
├── backend/              # Flask REST API
│   ├── app/
│   │   ├── blueprints/   # API 路由 (auth, uploads, candidates, jobs, scores)
│   │   ├── models/       # SQLAlchemy 数据模型
│   │   ├── services/     # 业务服务 (AI 服务、PDF 解析)
│   │   ├── utils/        # 工具函数
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
│   │   ├── lib/          # API 客户端、工具函数、状态管理
│   │   └── types/        # TypeScript 类型定义
│   ├── Dockerfile
│   └── package.json
├── deploy/               # Docker Compose 与 Nginx 配置
│   ├── docker-compose.yml
│   └── nginx/
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

分别打开两个终端，在项目根目录执行：

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
| `FLASK_SECRET_KEY` | Cookie 签名密钥（生产环境必填） | `dev-secret-change-me` |
| `APP_ACCESS_KEY` | 访问密钥（生产环境必填） | — |
| `DATABASE_URL` | 数据库地址 | `sqlite:///talent-lab.sqlite3` |
| `UPLOAD_DIR` | PDF 上传目录 | `instance/uploads` |
| `AI_MODE` | AI 模式：`mock` 或 `real` | `mock` |
| `AI_PROVIDER` | AI 提供商：`openai` / `moonshot` / `deepseek` | `openai` |
| `OPENAI_API_KEY` | OpenAI API Key | — |
| `OPENAI_BASE_URL` | OpenAI 兼容接口地址 | — |
| `OPENAI_MODEL` | OpenAI 模型名称 | — |
| `MOONSHOT_API_KEY` | Moonshot API Key | — |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | — |
| `FRONTEND_ORIGIN` | 前端域名（CORS 用） | — |
| `SESSION_COOKIE_SECURE` | Cookie 仅 HTTPS 传输 | `false` |

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
| GET | `/api/jobs` | 职位机会列表（兼容原 JD 路径） |
| POST | `/api/jobs/parse` | 结构化解析粘贴的 JD 文本 |
| POST | `/api/jobs` | 创建职位机会 |
| PATCH | `/api/jobs/:id` | 更新职位机会 |
| DELETE | `/api/jobs/:id` | 删除职位机会 |
| GET | `/api/jobs/:id/events` | 申请时间线 |
| POST | `/api/jobs/:id/events` | 补录申请事件 |
| GET | `/api/scores` | 评分结果列表 |
| POST | `/api/scores` | 对候选人执行评分 |
| GET | `/api/health` | 健康检查 |

## 生产部署

### 前端（Cloudflare Pages）

生产环境前端部署在 Cloudflare Pages：<https://talent-lab.440115.xyz/>。

Cloudflare Pages 关联本仓库的 `master` 分支；`master` 更新后会自动执行前端构建并发布。构建时需配置 `VITE_API_BASE_URL`，使前端请求指向生产环境后端 API。

### 后端（Docker Compose）

#### 1. 配置生产环境变量

```bash
cp deploy/.env.production.example deploy/.env.production
# 编辑 deploy/.env.production，设置以下必填项：
# APP_ACCESS_KEY、FLASK_SECRET_KEY、AI_MODE 等
```

#### 2. 启动服务

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

Compose 默认将容器内 Web 服务绑定到宿主机 `127.0.0.1:8080`。

#### 3. 配置宿主机 Nginx

参考 `deploy/nginx/nginx-host.conf.example` 配置反向代理。注意：

- 为 SSE 配置 `proxy_buffering off`
- 配置较长代理超时，避免 AI 提取期间连接被关闭
- 配置 `client_max_body_size 50m` 以支持批量上传
- 有域名时启用 HTTPS
- 将 `FRONTEND_ORIGIN` 设置为 `https://talent-lab.440115.xyz`，允许 Cloudflare Pages 前端携带 Cookie 跨域访问 API

#### 4. 数据持久化

SQLite 数据库和上传的 PDF 文件通过 Docker volume 持久化，容器重启后数据不丢失。

## 常用命令

```bash
# 本地开发
make backend-install    # 首次安装后端依赖
make backend-init       # 首次初始化数据库
make backend-dev        # 执行幂等数据库迁移并启动后端开发服务器
make frontend-install   # 首次安装前端依赖
make frontend-dev       # 启动前端开发服务器

# 测试
make backend-test       # 运行后端测试

# Docker
make compose-up         # 构建并启动 Docker 服务
make compose-down       # 停止 Docker 服务
```

## 数据模型

```text
Candidate          候选人（上传批次、状态、PDF 路径、解析状态）
  └── ResumeProfile    简历结构化信息（姓名、联系方式、教育、工作、技能、项目）
  └── ScoreResult      岗位评分结果（综合分、各维度分、AI 评语）

JobDescription     职位机会（JD、结构化要求、薪酬、申请状态、投递版本）
  └── ApplicationEvent  申请时间线（状态、笔试、面试、Offer、备注、待办）
  └── ScoreResult      关联的候选人评分
```

## 开发规范

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)，详细规则见 [docs/development.md](docs/development.md) §7.1。

## 许可证

[MIT](LICENSE)
