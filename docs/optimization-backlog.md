# talent-lab 可优化项清单

> 调研日期：2026-08-12
> 范围：`backend/`（Flask）、`frontend/`（React/Vite）、`deploy/` + 工程化配置
> 说明：所有条目均已在代码中逐条核实，附文件与行号证据。优先级分高 / 中 / 低三档。
> 后续进展：路由懒加载、Inter Latin 子集加载、简历列表偏好持久化及上传数量文档对齐已于 2026-08-13 至 2026-08-14 完成。2026-08-14 上传与候选人入口整合为简历工作区，并修复前端 SSE 生命周期和事件风暴问题；其余条目及行号以再次核查为准。

## 一、高优先级（正确性 / 数据安全问题）

### 1. [已完成] 前端 SSE error 处理器是过期闭包，单个候选人失败会掐断整批流

- 证据：`frontend/src/pages/UploadPage.tsx:94`。`queue.every(...)` 引用的是订阅时捕获的旧 `queue`（首次上传为 `[]`，`[].every()` 恒为 `true`），任一候选人失败的 server `error` 事件、甚至一次连接级抖动都会立即 `source.close()`，其余候选人的进度事件全部丢失，UI 永远停在"解析中"。
- 建议：error 处理器内读取最新状态（ref 或函数式更新），并按候选人维度隔离失败，不应关闭整批流。
- 进展：统一简历工作区使用终态候选人 ID 集合跟踪批次完成情况，不再读取过期队列闭包。

### 2. 简历编辑的 JSON 字段静默丢数据

- 证据：`ProfileEditForm.tsx:60-65` 把教育 / 工作 / 项目经历暴露为裸 JSON textarea，提交时 `parseJsonArray`（`frontend/src/lib/format.ts:30-37`，调用点 `CandidateDetailPage.tsx:96-99`）把非法 JSON 静默降级为 `[]`。用户写错一个逗号，保存后该段数据被清空且无任何提示。
- 建议：提交前校验 JSON 合法性并显式报错，或换成结构化表单。

### 3. 登录接口无速率限制

- 证据：`backend/app/blueprints/auth.py:9-21`。单密钥登录接口无任何限流 / 锁定 / 退避，`compare_digest` 只防时序侧信道，不防在线穷举。这是系统唯一认证防线。
- 建议：加 IP 维度限流或指数退避（如 Flask-Limiter，或简单的内存计数器）。

### 4. [已完成] 后端镜像构建上下文缺少 `.dockerignore`

- 原问题：后端构建上下文包含整个仓库，构建慢且缓存易失效。
- 进展：仓库根 `.dockerignore` 仅允许后端生产文件进入构建上下文；前端统一由 Cloudflare Pages 构建，不再保留 Docker 镜像链路。

### 5. [已完成] 端口文档与实际配置矛盾

- 原问题：部署文档与旧 Nginx 示例使用 `8080`，Compose 实际绑定 `127.0.0.1:8000`。
- 进展：部署文档与 Compose 已统一为 `8000`，旧 Nginx 示例已移除。

### 6. 候选人列表全表加载 + 内存过滤分页

- 证据：`backend/app/blueprints/candidates.py:35` `query.all()` 把全部候选人（含 `raw_text` 大字段）加载进内存，随后 `matches_query`/`has_skills`/`sort_candidates` 全在 Python 中过滤排序（`services/candidate_query.py:8-116`），最后才切片分页。
- 影响：数据量增长后是全表扫描 + 内存放大。
- 建议：关键词 / 技能 / 排序 / 分页下沉 SQL；列表查询排除 `raw_text` 等大字段。

### 7. 关键路径测试盲区

- 后端：SSE 事件流 `upload_events`（`backend/app/blueprints/uploads.py:69-161`）是全后端最复杂、状态最多的接口，零测试；解析成功 / 失败 / 批次不存在 / 已完成重放等分支均无保障。候选人删除、状态更新、compare 正常路径、JD 更新 / 删除、`list_scores`、重复评分 upsert 分支（`scores.py:57-60`）、`_normalize_score` 与 `clamp_score` 边界均未覆盖。
- 前端：全库无 `*.test.*` / `*.spec.*`，无 vitest/testing-library 依赖，`package.json` 无 test script。建议至少补 `lib/` 纯函数单测：`repairJson`/`parsePartialJson`（流式 JSON 修复逻辑复杂且无回归保护）、`format.ts`、两个 zustand store 均为低成本高价值目标。

## 二、中优先级

### 后端

**1. 蓝图承载业务逻辑（违反"薄蓝图"约定）**

- `backend/app/blueprints/uploads.py:69-161`：`upload_events` SSE 处理器约 90 行，包含 PDF 文本提取、AI 调用、profile 规整、DB 状态机写入，应下沉到 `services/`。
- `uploads.py:131` 调用 `AiService` 私有方法 `ai._extract_json(...)`，跨层破坏封装；应将"流式累积 → 解析 JSON → 失败兜底"封装为 `AiService` 公开方法。
- `backend/app/blueprints/scores.py:34-80`：`create_score` 包含评分调用、ScoreResult upsert、字段 clamp 等业务逻辑，应提取到 service。

**2. N+1 查询**

- `ResumeProfile` 通过 backref 默认 lazy 加载（`models/__init__.py:35`），列表序列化时每个 candidate 触发一次 profile 查询；`matches_query`/`has_skills` 同样逐条访问 `candidate.profile`。
- `serializers.py:42` `serialize_score` 访问 `score.job.title`，`ScoreResult.job` 是 lazy，`list_scores`（`scores.py:28`）逐条查 job。
- 建议：`selectinload` / `joinedload`。

**3. SSE 长连接的并发与事务问题**

- 每条 SSE 连接在整个解析期间独占一个线程（gunicorn 2 workers × 4 threads = 并发上限 8）；期间多次 `db.session.commit()`（`uploads.py:98,110,138,151`）持有 SQLite 写锁，并发上传时易触发 `database is locked`。
- mock 流式分支里 `time.sleep(0.02)`（`ai_service.py:92-95`）阻塞 worker 线程，建议只在 debug 下启用。
- 注：gunicorn `timeout = 120`（`gunicorn.conf.py:4`）当前**不会**掐断 SSE：配置了 `threads = 4`（gthread worker，心跳在主线程）。但若未来去掉 `threads`，此处会变成真问题；且与 nginx `proxy_read_timeout 300s` 数值不一致，建议对齐。

**4. 流式解析失败的兜底导致 AI 双倍调用**

- 证据：`uploads.py:130-133`。累积的流式 JSON 解析失败时，兜底再完整调一次 `ai.extract_resume(text)`，同一份简历产生两次付费 API 调用，且第二次非流式调用拉长 SSE 占用时间。
- 建议：限定兜底条件（如仅在明确可重试的错误上），或直接使用累积结果的部分解析。

**5. 内部异常信息泄露给客户端**

- 证据：`uploads.py:148-159`。`except Exception` 后把 `str(exc)` 原样写进 SSE error 事件和 `error_message` 字段，并经 `serializers.py:66` 的 summary 序列化长期暴露在前端列表。文件系统路径、AI 服务商报错细节（可能含端点 / 模型信息）都会泄露。
- 建议：对客户端返回通用文案，细节只进服务端日志。

**6. 上传校验弱 + 孤儿文件**

- `uploads.py:164-171`：仅校验扩展名和客户端自报的 mimetype，无 PDF magic bytes（`%PDF-`）校验。
- `uploads.py:39-47`：批量上传循环中逐文件 `file.save()` 后才继续校验后续文件，任一文件失败直接 return，已保存的 PDF 成为磁盘孤儿（DB 未提交）。
- `candidates.py:70-82`：`delete_candidate` 删除 DB 记录但不删除磁盘 PDF 文件，长期堆积孤儿文件。

**7. 生产配置强制校验依赖 `FLASK_ENV=production`，compose 未显式设置**

- 证据：`backend/app/config.py:7`（`ENV` 默认 `development`）、`config.py:33-40`（仅 `ENV == "production"` 时才校验 `APP_ACCESS_KEY`/`FLASK_SECRET_KEY` 非默认值）；`deploy/docker-compose.yml:6-10` 的 env_file/environment 中均未出现 `FLASK_ENV`。
- 影响：若 `.env.production` 漏配，生产防护静默失效，默认弱密钥也能启动。
- 建议：`docker-compose.yml` 的 `environment` 显式加 `FLASK_ENV: production` 兜底。

**8. 代码重复与日志缺失**

- `ensure_list` 两份实现且语义不一致：`utils/payloads.py:1-6`（list 原样返回、str 不拆分）vs `jobs.py:75-80`（按逗号拆分并 strip）。jobs.py 应删掉本地版本复用 utils，并明确逗号拆分的取舍。
- AI 客户端构建逻辑重复：`ai_service.py:53-83`（流式）与 `ai_service.py:111-137`（非流式）几乎逐行重复，应抽 `_make_client()` 公共方法。
- 服务端日志基本缺失：全 `app/` 仅 `__init__.py:57` 的兜底 errorhandler 有日志。上传解析失败（`uploads.py:148`）、AI 调用失败、评分流程均无 logger 调用，线上排障只能靠用户截图里的 `error_message`。

**9. AI 调用健壮性**

- AI 客户端未显式配置超时与重试（`ai_service.py:60-64,118-122`），real 模式下慢响应会拖死 SSE 线程。
- 对 Moonshot/Kimi 请求硬编码伪装 `User-Agent: claude-code/1.0.0`（`ai_service.py:58,116`），做法可疑且无注释说明原因。

**10. 依赖锁定不完整**

- `backend/requirements.txt`：`Flask-Cors>=4.0.0`、`PyMuPDF>=1.26.0,<2.0.0` 是范围约束，`httpx<0.28.0` 只有上限，无 hash 校验，无 lock 文件，构建不可完全复现；`openai==1.40.6` 偏旧；运行时与开发依赖（pytest、ruff）混在同一文件，生产镜像无谓变大。

### 前端

**1. [已完成] EventSource 生命周期管理缺失**

- 流正常结束后不主动 close：后端生成器处理完即结束响应（`uploads.py:161`），EventSource 默认重连，后端对已 completed 候选人会重发 `uploaded`/`completed`（`uploads.py:82-93`），形成重连-重放循环。应在 `completed` 计数达标后关闭。
- 无卸载清理：`source` 未存 ref、无 `useEffect` cleanup，上传中途 SPA 路由跳走后连接悬挂。
- 进展：当前组件会在批次全部进入终态或页面卸载时主动关闭连接；工作区内部切换视图不会卸载上传面板。

**2. 性能三连：代码分割 / 字体子集 / 搜索防抖**

- 无路由级代码分割：`src/app/router.tsx:5-10` 全部静态 import，构建产物单 JS 块 810KB（含 recharts 全量）。建议 `React.lazy` 按页拆分，至少把 recharts 图表懒加载。
- 字体全量引入：`src/main.tsx:10` `import "@fontsource-variable/inter"` 引入全部子集，dist 产出 7 个 woff2 共约 250KB，中文站点只需 latin，可改 `@fontsource-variable/inter/latin.css`。
- 搜索无防抖：`CandidatesPage.tsx:73-76` 每个击键直接改 `q` 进入 queryKey 即发请求，全库无 `debounce`/`useDeferredValue`。

**3. [已完成] SSE 事件风暴式 invalidate**

- 证据：`UploadPage.tsx:65`。每个进度事件（5 种事件 × N 个候选人）都 `invalidateQueries(["candidates"])`，一次 5 份上传可触发二十余次列表 refetch。
- 建议：只在 `completed`/`error` 终态事件刷新。
- 进展：当前仅在批次建立和单份简历进入终态时刷新简历查询。

**4. 状态管理约定偏离**

- `runCompare` 在 store 里手动管理 `isComparing/compareResult/compareError`（`src/lib/compare-store.ts:60-73`），服务器状态应进 TanStack Query（改 `useMutation`），还能省掉手写 try/catch 错误归一化。
- 视图模式 `view`（`useCandidateList.ts:21`）与侧栏折叠态 `sidebarCollapsed`（`AppShell.tsx:22`）是普通 useState，违反 development.md §3.3"本地偏好进 Zustand/localStorage"，刷新即丢失。

**5. 查询失败时页面级无错误态**

- 证据：`CandidatesPage.tsx:124` 在 `isError` 时照样显示"暂无候选人，前往上传"空态（`candidates` 兜底为空数组）；`DashboardPage.tsx:130`、`JobsPage.tsx:159` 同理。全局 toast 虽有提示，但页面本体没有错误说明 / 重试入口。

**6. `react-router-dom` 已知漏洞**

- `npm audit` 报 3 个 moderate：`react-router-dom` 6.x 依赖的 `@remix-run/router` 存在开放重定向漏洞（GHSA-2j2x-hqr9-3h42），`npm audit fix` 升到 6.30.4 即可修。

**7. session 查询出错被当作未登录**

- 证据：`ProtectedRoute.tsx:17-19`。500 等非 401 错误时 `data` 为 undefined → 直接跳登录页，服务异常被表现成登出。另外 `api.ts:52-54` 401 用 `window.location.assign` 整页跳转，与 ProtectedRoute 的 SPA 跳转重复且丢内存状态。

### 部署与工程化

**1. 后端镜像单阶段构建，编译工具链残留在最终镜像**

- 证据：`backend/Dockerfile:9-11` 安装 `build-essential` 且全程单阶段，最终镜像带 gcc 等编译工具，体积与攻击面都偏大。
- 建议：多阶段构建（builder 阶段构建 wheels，运行阶段仅拷贝 site-packages）。

**2. 容器以 root 运行**

- 证据：`backend/Dockerfile` 无 `USER` 指令。
- 建议：后端建非 root 用户，并处理 `/data`、`/uploads` volume 属主。

**3. [已完成] 无健康检查**

- 进展：Compose 已使用 Python 标准库请求 `GET /api/health`，部署脚本会等待容器进入 healthy 状态。

**4. [已完成] "完整 Docker 自托管"链路断裂**

- 进展：前端部署方式已统一为 Cloudflare Pages，未使用的前端 Dockerfile 和 Nginx 配置已移除；Compose 明确只负责后端。

**5. [已完成] 旧 VPS Nginx 示例不完整**

- 进展：不完整的通用示例已移除；生产文档要求在现有反向代理或 1Panel 中将 API 请求转发到 `127.0.0.1:8000`。

**6. [已完成] README 引用的 `deploy/.env.production.example` 不存在**

- 进展：已补充不含真实密钥的 `deploy/.env.production.example`，并在部署文档中说明初始化步骤。

**7. [已完成] 完全没有 CI 流水线**

- 进展：GitHub Actions 已覆盖后端测试、字符检查、GHCR 镜像发布和 `master` 生产部署。

## 三、低优先级（顺手清理）

**后端**

- 文档不一致：`docs/development.md:65` 写"批量上限为 10 份"，实际 `backend/app/constants.py:5` 是 `MAX_UPLOAD_FILES = 5`（测试也按 5 断言），需对齐一方。
- `datetime.utcnow` 在 `models/__init__.py` 出现 7 处，Python 3.12 起 DeprecationWarning，建议 `datetime.now(timezone.utc)`。
- `Query.get()` 是 SQLAlchemy 2.x legacy 用法（`candidates.py:64,73,88,111,147`、`scores.py:43`、`jobs.py:42,66`），建议 `db.session.get(Model, id)`。
- `config.py:50-55`：相对 sqlite 路径已按 instance 目录建过一次目录，第 55 行又对 cwd 相对路径重复 `mkdir`，可能在当前工作目录产生游离目录。
- `constants.py:3` `PARSE_STATUSES` 定义后从未使用，`uploads.py` 里全是状态字符串字面量。
- `serializers.py:9` 给 naive datetime 直接拼 `"Z"`，时间语义不严谨。
- `ScoreResult.job_id` 无独立索引（`models/__init__.py:58`），按 `job_id` 过滤（`scores.py:26-27`）走全表扫描；当前量级影响小。
- `MAX_UPLOAD_FILES` 硬编码在 `constants.py:5`，其余上传配置在 `config.py`，建议统一进 Config 并支持环境变量。
- `app/schemas/__init__.py` 是空壳占位（仅 docstring），要么落地要么删除。
- `auth/logout`、`auth/session` 未挂 `@require_auth`（`auth.py:24,30`），功能无害但与"除 login 与 health 外都挂"的字面约定不一致，可明确豁免或补上。
- 测试工程：`make_client`/`make_app` 在 `test_auth.py:5` 与 `test_business_api.py:8` 重复定义，应提取 `conftest.py` 共享 fixture。

**前端**

- `ResumeStreamViewer.tsx:24` `parsePartialJson(streamText)` 每次渲染都对整条累积文本做多趟 O(n) 修复解析，无 `useMemo`；`:36-40` 每个 chunk 触发一次 smooth `scrollIntoView`，高频下抖动。
- `JSON.parse(event.data)` 无 try/catch（`UploadPage.tsx:70,76,91`），一帧畸形数据就抛进全局错误 toast。
- 重复代码：`stream/StreamEducationTab.tsx` 与 `candidate-detail/ProfileEducationTab.tsx` 等三对组件时间线 markup 近乎逐行相同，可抽共享 Timeline 组件；`TagInput.tsx:14-19` 的 `splitTags` 与 `lib/format.ts:19-24` 的 `splitSkills` 完全重复。
- 死代码：`ui-store.ts` 的 `startLoading/loadingCount` 全库无人调用；`frontend/src/hooks/` 是空目录；`AppShell.tsx:68` 用 `querySelector('input[placeholder*="搜索"]')` 定位搜索框，脆弱且与文案耦合。
- 接口类型过弱：`src/types/api.ts:32-35` 的 `education/work_experience/projects` 是 `unknown[]`，而 `src/lib/resume-stream.ts` 已有精确类型，复用后可消除 `profile-utils.ts` 里的防御性体操。
- 登录表单无空值校验：`LoginPage.tsx:69` 提交按钮未禁用空密钥、input 无 `required`。
- 行内样式：`ResumeStreamViewer.tsx:173` 的 `style={{ verticalAlign: 'middle' }}` 可换 Tailwind `align-middle`。
- `vite.config.ts` 仅 16 行，无 `build.manualChunks`，可配合路由懒加载做 vendor 拆分。
- 依赖大版本普遍落后一代（React 18→19、Vite 5→8、Tailwind 3→4、zustand 4→5、recharts 2→3、ESLint 8→10），均为可选升级。
- development.md §7.2 建议的 ESLint `max-lines` 规则未启用（文档标注为可选增强）。

**部署**

- 无日志轮转与资源限制：`deploy/docker-compose.yml` 无 `logging`（json-file `max-size`/`max-file`）配置，容器日志会无限增长。
- 容器内 nginx 缺 gzip、静态资源缓存头（Vite 产物 `/assets/*` 带 hash，适合 `immutable` 长缓存）、安全响应头（当前生产前端在 Cloudflare Pages，仅影响 Docker 自托管路径）。
- SSE 响应未设 `Cache-Control: no-cache` 与 `X-Accel-Buffering: no`（`uploads.py:161`），当前 nginx `proxy_buffering off` 下可用，但对链路上其他中间层（如 Cloudflare）无防御。
- 无 pre-commit 钩子；`.ruff_cache/` 在 `.gitignore` 中但 `backend/` 下未见 ruff 配置文件，属有工具意图未落地。
- Makefile 缺 `frontend-typecheck`/`frontend-lint`/`check` 聚合目标，与 AGENTS.md 验证要求不对齐。

## 四、已核查无问题的项（无需改动）

- 文件规模：前后端全部源码文件 ≤200 行（后端最大 `ai_service.py` 177 行，前端最大 `CandidatesPage.tsx` 191 行）。
- 响应统一走 `ok_response`/`error_response`；业务接口均挂 `@require_auth`。
- 无 SQL 注入风险（全部走 ORM 参数化）；无硬编码密钥。
- `.env`、`deploy/.env.production` 均正确 gitignore 且未被 git 跟踪（`git ls-files` 验证）。
- 前端无裸 `fetch`（统一封装在 `lib/api.ts:41`）、无 `any` 滥用、无 console 残留（`ErrorBoundary.tsx:30` 的 `console.error` 属合理）。
- 生产反向代理仍需为 SSE 关闭缓冲并配置长超时。
- 端口绑定 `127.0.0.1:8000` 不直接暴露公网；`restart: unless-stopped` 已配置。
- README/development.md 中的 make 命令、开发端口、`/api/health`、环境变量表与 `backend/app/config.py` 实际读取的变量一致。
- 骨架屏、空态、`aria-label`、上传数量前端校验、删除确认均已覆盖。

## 建议处理顺序

1. 前端 SSE 闭包 bug（一.1）→ JSON 编辑静默丢数据（一.2）：小改动、直接影响正确性与数据安全。
2. 登录限流（一.3）、`.dockerignore` + `npm ci`（一.4）、端口文档统一（一.5）：低成本的安全与部署修复。
3. 测试基座（一.7）：后端 SSE 接口测试 + 前端 vitest + `npm audit fix`。
4. 性能项：列表 SQL 下沉（一.6）、路由懒加载 / 字体子集 / 防抖（二.前端.2）。
5. 其余中低优先级项随相关改动顺带清理。
