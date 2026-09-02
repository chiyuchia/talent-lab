# AGENTS.md

面向 AI coding agent 的操作指南。人类开发者文档见 [README.md](README.md) 与 [docs/development.md](docs/development.md)（架构、模块职责、数据模型、部署细节以 development.md 为准）。

## 项目概述

talent-lab：AI 简历分析平台。Flask REST API（`backend/`）+ React/Vite SPA（`frontend/`），SQLite 存储；前端部署到 Cloudflare Pages，后端通过 GitHub Actions、GHCR 和 Docker Compose 部署（`deploy/`）。

## 常用命令

```bash
make dev                             # 同时启动前端与后端开发服务器
make backend-dev                     # 后端开发服务器 :8000
make frontend-dev                    # 前端开发服务器 :5173
make backend-test                    # 后端测试 (pytest)
make check-badchars                  # 检查禁用字符清单
cd frontend && npm run typecheck     # 前端类型检查
cd frontend && npm run lint          # 前端 lint
```

## 关键约定（摘要，详见 docs/development.md）

- **提交信息**：遵循 Conventional Commits，格式与示例见 `docs/development.md` §7.1。
- **文件规模**：单个源码文件不超过 200 行（测试文件豁免），超限按职责拆分；细则见 `docs/development.md` §7.2。
- **字符兼容**：仓库文本不得包含 `vscode-highlight-bad-chars` 清单中的字符；文案改用 ASCII 标点，解析兼容场景使用 Unicode 转义；细则见 `docs/development.md` §7.3。
- **后端**：业务逻辑下沉 `services/`，蓝图保持薄层只做参数解析与响应；统一响应走 `app/utils/responses.py`；除 `auth/login` 与 `health` 外所有 API 挂 `@require_auth`。
- **前端**：数据获取一律走 TanStack Query，不要裸用 `fetch`；UI 状态进 Zustand；接口字段变更需同步后端序列化器与 `src/types/api.ts`。
- **环境变量**：新增配置项需同步 README 环境变量表与部署示例文件；`.env` 不入库。

## 验证要求

- 改动后端 → 跑 `make backend-test`
- 改动前端 → 跑 `npm run typecheck` 和 `npm run lint`
- 所有改动 → 跑 `make check-badchars`
- 新增 API → 按 `docs/development.md` §8 流程，同步补测试与文档

## 注意事项

- 不要提交真实密钥；生产环境必填 `APP_ACCESS_KEY` 与 `FLASK_SECRET_KEY`。
- AI 调用默认 `AI_MODE=mock`；测试中不得发起真实 AI 网络请求。
- SSE 相关改动注意部署要求：OpenResty 必须 `proxy_buffering off` 并配置长超时。
