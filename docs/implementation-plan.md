# talent-lab 实施计划

> 本文保留首版实施规划与验收基线。项目当前能力与部署方式以 [README](../README.md)、[产品需求](prd.md) 和 [开发文档](development.md) 为准。

## 1. 项目目标与技术栈

talent-lab 是一个 AI 赋能的智能简历分析平台，用于招聘场景中的简历上传、PDF 解析、AI 结构化提取、岗位匹配评分和候选人管理。首版目标是交付一个可本地开发、可 Docker 部署到 VPS、具备完整演示链路的全栈应用。

核心技术栈：

- 前端：Vite、React、TypeScript、React Router、TanStack Query、Zustand。
- UI：Tailwind CSS、shadcn/ui 或等价组件体系、lucide-react、Recharts。
- 后端：Python、Flask、Gunicorn、SQLAlchemy。
- 数据库：SQLite，生产环境通过 Docker volume 持久化。
- PDF 解析：PyMuPDF。
- AI：OpenAI 兼容 API + 本地 Mock 双模式。
- 通信：RESTful API + SSE 流式事件。
- 部署：Cloudflare Pages、GitHub Actions、GHCR、Docker Compose、OpenResty 反向代理。

前端实现阶段使用 UI/UX Pro Max skill 辅助进行页面结构、视觉系统、可访问性、响应式和交互质量检查。

## 2. 最终架构与目录规划

项目采用前后端分离开发和跨域生产访问。前端由 Cloudflare Pages 构建并托管静态资源；后端由 GitHub Actions 构建为 GHCR 不可变镜像，通过 Docker Compose 在 VPS 运行；OpenResty 将生产 API 域名反向代理到后端绑定的本机端口。

推荐目录结构：

```text
talent-lab/
  backend/
    app/
      __init__.py
      blueprints/
      models/
      services/
      schemas/
      utils/
    tests/
    Dockerfile
    requirements.txt
    gunicorn.conf.py
  frontend/
    src/
      app/
      components/
      features/
      hooks/
      lib/
      pages/
      styles/
      types/
    package.json
  deploy/
    docker-compose.yml
    deploy.sh
    README.md
    .env.production.example
  .github/
    workflows/
      backend-image.yml
  docs/
    implementation-plan.md
  README.md
```

## 3. 密钥登录方案

首版不做用户系统、角色系统、注册登录和多租户，只做单密钥访问控制。

后端认证行为：

- 通过 Docker 环境变量 `APP_ACCESS_KEY` 读取唯一访问密钥。
- 通过环境变量 `FLASK_SECRET_KEY` 签发服务端会话 Cookie。
- 生产环境缺少 `APP_ACCESS_KEY` 或 `FLASK_SECRET_KEY` 时后端启动失败。
- 密钥校验使用 constant-time compare，避免时序侧信道。
- 登录失败返回统一错误，不暴露密钥是否为空、格式是否正确等细节。

认证接口：

- `POST /api/auth/login`：提交访问密钥，校验成功后写入 HttpOnly Cookie。
- `POST /api/auth/logout`：清除 Cookie。
- `GET /api/auth/session`：返回当前登录状态。

认证保护范围：

- 放行登录接口、健康检查接口、前端静态资源。
- 保护所有业务 API。
- 保护 SSE 接口；生产环境的跨域 EventSource 使用 `withCredentials` 携带 Cookie，并由后端 CORS 仅放行 `FRONTEND_ORIGIN`。

前端认证行为：

- 提供独立登录页。
- 未登录访问业务页面时跳转登录页。
- 登录成功后回到原目标页面。
- 前端不把密钥写入 LocalStorage 或 SessionStorage。
- 刷新页面后通过 `GET /api/auth/session` 恢复登录态。

## 4. 后端模块与 API 设计

Flask 使用 Blueprint 分层：

- `auth`：密钥登录、退出、会话检查。
- `uploads`：PDF 上传、上传任务、SSE 解析进度。
- `candidates`：候选人列表、详情、状态、人工修正、对比。
- `jobs`：JD 创建、编辑、列表。
- `scores`：岗位匹配评分、评分结果读取。
- `ai`：AI 提取和评分服务适配。

数据模型：

- `Candidate`：候选人 ID、状态、上传时间、PDF 路径、原始文本、解析状态、错误信息。
- `ResumeProfile`：候选人 ID、姓名、电话、邮箱、城市、教育经历、工作经历、技能标签、项目经历。
- `JobDescription`：JD ID、岗位名称、岗位描述、必备技能、加分技能、创建时间、更新时间。
- `ScoreResult`：候选人 ID、JD ID、综合分、技能分、经验分、教育分、AI 评语、评分详情。

核心 API：

- `POST /api/uploads/resumes`：批量上传 PDF，至少支持同时上传 5 份。
- `GET /api/uploads/:id/events`：SSE 推送上传、解析和 AI 提取进度。
- `GET /api/candidates`：候选人列表，支持搜索、筛选、排序、分页。
- `GET /api/candidates/:id`：候选人详情，包含结构化简历、评分、PDF 地址。
- `PATCH /api/candidates/:id/profile`：保存人工修正后的结构化简历。
- `PATCH /api/candidates/:id/status`：更新候选人状态。
- `POST /api/jobs`：创建 JD。
- `GET /api/jobs`：获取 JD 列表。
- `PATCH /api/jobs/:id`：更新 JD。
- `DELETE /api/jobs/:id`：删除 JD。
- `POST /api/scores`：对候选人与一个或多个 JD 执行评分。
- `GET /api/scores`：按候选人或 JD 查询评分结果。
- `POST /api/candidates/compare`：返回 2-3 个候选人的横向对比数据。
- `GET /api/health`：健康检查。

AI 服务：

- 通过 `AI_MODE=mock|real` 切换模式。
- Mock 模式返回稳定结构，便于本地开发、测试和演示。
- Real 模式读取 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`。
- AI 提取输出必须符合结构化 schema，后端对结果做字段校验和容错处理。
- 评分输出必须包含综合分、技能匹配度、经验相关性、教育背景契合度、AI 评语。

SSE 事件：

- `uploaded`：文件上传完成。
- `parsing`：PDF 文本解析中。
- `extracting`：AI 信息提取中。
- `partial_result`：返回阶段性结构化结果。
- `completed`：流程完成。
- `error`：流程失败，包含错误码和可读错误信息。

## 5. 前端页面与交互设计

前端整体原则：

- 优先构建真实可用的管理后台体验，不做营销型首页。
- 视觉风格应偏招聘 SaaS / 运营工具：清晰、克制、信息密度适中、便于扫描。
- 所有按钮、表单、表格、卡片、状态徽章、图表保持统一设计系统。
- 页面至少适配桌面端 `>=1280px`，同时保证窄屏基本可用。
- 使用 UI/UX Pro Max skill 做前端实现前后的设计质量检查。

主要页面：

- 登录页：密钥输入、错误提示、加载状态。
- Dashboard：简历数量、简历状态分布、评分分布、最近上传。
- Resumes：在统一工作区内提供简历库和上传视图，覆盖批量队列、解析进度、搜索、筛选、排序与分页。
- ResumeDetail：结构化简历、字段编辑、评分详情、原始 PDF 预览、状态流转。
- JDManager：JD 编辑器、必备技能、加分技能、JD 列表。
- Compare：选择 2-3 份简历，并排比较评分维度、技能、教育、经验和 AI 评语。

前端状态与数据：

- TanStack Query 负责服务端数据获取、缓存、刷新和错误状态。
- Zustand 负责主题、侧边栏、视图偏好、上传面板等 UI 状态。
- API client 统一处理 Cookie 请求、错误响应和 401 跳转。
- SSE client 负责订阅解析进度，并将事件映射到上传队列和候选人状态。

交互增强：

- 暗色 / 亮色主题切换，并持久化到 localStorage。
- 骨架屏覆盖列表、详情、评分图表和上传队列。
- Toast 用于上传成功、保存成功、状态变更、错误提示。
- 键盘快捷键：`/` 进入简历库并聚焦搜索，`u` 打开简历上传视图，`j` 进入 JD 管理。
- 状态变更提供明确的视觉反馈。
- 动画遵循 `prefers-reduced-motion`。

## 6. Cloudflare Pages、GHCR 与 VPS 部署方案

当前部署方案：

- 前端由 Cloudflare Pages 从 `master` 构建，命令为 `cd frontend && npm ci && npm run build`，发布目录为 `frontend/dist`。
- 推送到 `main` 或 `master` 且改动涉及后端构建输入时，GitHub Actions 运行后端测试与字符检查，并将后端镜像发布到 GHCR；纯前端或文档改动不触发后端工作流。
- `master` 构建成功后，GitHub Actions 通过专用 SSH 用户调用 VPS 上的 root-owned `deploy.sh`，按镜像 digest 部署。
- Docker Compose 只运行后端，不在 VPS 托管前端静态资源。
- 不使用 PM2。
- 容器进程守护由 Docker `restart: unless-stopped` 完成。
- VPS 上已有 OpenResty，负责 API 公网入口和 HTTPS。

Docker Compose 服务：

- `backend`：运行 Flask + Gunicorn。

端口策略：

- Compose 只绑定 `127.0.0.1:8000:8000`。
- OpenResty 将生产 API 域名的 `/api/` 请求反向代理到 `http://127.0.0.1:8000`。

宿主机反向代理要求：

- 为 SSE 配置 `proxy_buffering off`。
- 配置较长代理超时，避免 AI 提取期间连接被关闭。
- 配置 `client_max_body_size 50m`。
- 启用 HTTPS，并保持 API 域名证书有效。

生产环境变量：

- `FLASK_ENV`：固定为 `production`。
- `APP_ACCESS_KEY`：访问密钥。
- `FLASK_SECRET_KEY`：Cookie 签名密钥。
- `FRONTEND_ORIGIN`：Cloudflare Pages 前端 Origin。
- `SESSION_COOKIE_SECURE`：生产环境设为 `true`。
- `AI_MODE`：`mock` 或 `real`。
- `OPENAI_API_KEY`：真实 AI 模式使用。
- `OPENAI_BASE_URL`：OpenAI 兼容接口地址。
- `OPENAI_MODEL`：模型名称。
- `RESUME_STORAGE_BACKEND`：`local` 或 `r2`；R2 模式还需配置对应凭据和 bucket。

持久化：

- SQLite 数据库存放在 `talent-lab-data` volume。
- 本地存储模式的 PDF 存放在 `talent-lab-uploads` volume；R2 模式存放在私有 bucket。
- `deploy.sh` 在更新前使用 SQLite online backup API 将数据库备份到 data volume 的 `backups/`。
- 日志默认输出到 stdout，便于 `docker compose logs` 查看。

部署文档必须覆盖：

- VPS 安装 Docker 和 Docker Compose。
- 将 root-owned 部署包安装到 `/opt/talent-lab/deploy`。
- 配置 `.env.production`、root 的 GHCR 登录和专用 SSH deploy 用户。
- 配置 GitHub `production` Environment Secrets 与严格的 SSH host key 校验。
- 使用不可变镜像 digest 调用 `deploy.sh`，并等待容器健康检查。
- 查看日志、验证 `/api/health`、重启服务和更新版本。
- 备份和恢复 SQLite 数据与上传文件。

## 7. 执行里程碑

1. 项目脚手架
   - 初始化 `frontend/` 和 `backend/`。
   - 配置 TypeScript、ESLint、格式化、基础环境变量。
   - 建立基础 README 运行说明。

2. 密钥登录
   - 实现后端认证接口和认证中间件。
   - 实现前端登录页、路由守卫、会话恢复。
   - 验证业务 API 和 SSE 未登录不可访问。

3. 后端基础能力
   - 建立 SQLAlchemy 模型。
   - 实现候选人、JD、评分结果基础 CRUD。
   - 实现 PDF 上传、文件校验、批量上传。

4. PDF 解析与 AI 提取
   - 使用 PyMuPDF 提取多页 PDF 文本。
   - 实现文本清洗。
   - Mock 模式打通完整 AI 提取流程。
   - Real 模式接入 OpenAI 兼容 API。
   - 实现 SSE 流式进度。

5. 前端主流程
   - 上传页、上传队列、进度展示、PDF 首页缩略图。
   - 候选人列表、搜索、筛选、排序、分页。
   - 候选人详情、结构化简历展示、人工修正保存。

6. JD 与评分
   - JD 管理页面。
   - 单候选人对多个 JD 评分。
   - 评分图表展示。
   - 评分结果持久化。

7. 管理增强
   - 候选人状态流转。
   - 表格 / 卡片视图切换。
   - 候选人 2-3 人并排对比。
   - 主题切换、骨架屏、Toast、快捷键、动画。

8. 前后端生产部署
   - 配置 Cloudflare Pages 的前端构建命令、输出目录和生产 API 地址。
   - 编写后端 Dockerfile、Docker Compose 和 root-owned 部署脚本。
   - 配置 GitHub Actions 测试、GHCR 镜像发布和 `master` 自动部署。
   - 配置专用 SSH deploy 用户、严格 host key 校验和最小 sudo 权限。
   - 在 OpenResty 中配置后端 API 反向代理。

9. 最终验收
   - 本地开发环境验收。
   - Docker Compose 环境验收。
   - VPS 访问、登录、上传、SSE、AI Mock、数据持久化验收。

## 8. 测试与验收清单

后端测试：

- 未登录访问业务 API 返回 401。
- 错误密钥登录失败。
- 正确密钥登录成功并写入 HttpOnly Cookie。
- 退出登录后 Cookie 失效。
- PDF 格式校验正确。
- 同时上传至少 5 份 PDF 成功。
- 多页 PDF 能提取完整文本。
- 损坏 PDF 返回可读错误。
- AI Mock 输出符合 schema。
- JD 创建、更新、删除正常。
- 评分结果保存和查询正常。
- 候选人对比接口只接受 2-3 人。

前端测试：

- 未登录访问业务页跳转登录页。
- 登录后刷新仍保持会话。
- 上传队列显示每个文件的进度和状态。
- SSE 事件能逐步更新 UI。
- 候选人列表搜索、筛选、排序、分页可用。
- 详情页字段编辑后能保存。
- 状态变更有明确视觉反馈。
- 主题切换可用并持久化。
- 快捷键可用且不干扰表单输入。
- 关键页面在桌面端和窄屏下不出现明显布局错位。

部署验收：

- Cloudflare Pages 能从 `master` 构建并发布 `frontend/dist`。
- GitHub Actions 能完成测试、GHCR 镜像发布和 `master` 自动部署。
- `docker compose ps` 显示后端容器为 healthy，公网 `/api/health` 返回 `ok`。
- `.env.release` 记录当前运行的 GHCR 镜像 digest。
- `APP_ACCESS_KEY` 是进入系统的唯一访问凭证。
- 容器重启后 SQLite 数据和上传 PDF 不丢失。
- `AI_MODE=mock` 时无需真实 API Key 也可完整演示。
- `AI_MODE=real` 且配置完整时可调用真实模型。
- SSE 在 OpenResty 反向代理后仍能正常持续返回事件。

## 9. 默认假设与不做范围

默认假设：

- 产品需求以 `docs/prd.md` 为准。
- 前端部署在 Cloudflare Pages，后端部署在单机 VPS。
- 宿主机已有 OpenResty。
- Docker Compose 只运行后端。
- 不使用 PM2。
- 访问密钥通过 Docker 环境变量 `APP_ACCESS_KEY` 注入。
- 登录态使用 HttpOnly Cookie。
- SQLite 满足首版演示与小规模使用。

首版不做：

- 用户注册、用户表、角色权限、多租户。
- Kubernetes、多节点编排、蓝绿发布和金丝雀发布。
- PostgreSQL 迁移。
- OCR 扫描版 PDF 识别。
- 简历去重和高级人才库分析。
- 邮件通知、面试日程、ATS 集成。
