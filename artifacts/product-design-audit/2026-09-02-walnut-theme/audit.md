# Talent Lab 焦茶暖木主题迁移审计

开始日期：2026-09-02；完成日期：2026-09-03
执行：Kimi Code CLI（严格按 `docs/walnut-theme-migration-plan.md` 实施）

## 1. 改动目标与非目标

目标：

- 浅色/深色主题 token 从品牌蓝迁移到焦茶暖木（纸张浅色 + 炭木深色）。
- 新增 `--control-border`，用于输入框、选择框、未选中 Checkbox、outline 按钮。
- 新增 Tailwind `control` 颜色映射与 `font-display` 衬线字族（纯系统字体栈）。
- 新增无第三方依赖的对比度检查脚本 `npm run check:theme`。
- 更新 `docs/frontend-design-guidelines.md` 的品牌色、令牌职责与字体范围。

非目标（本次明确不做）：

- 路由、业务逻辑、API、数据库结构、SSE 行为、文案、信息架构。
- 历史审视（2026-08-14）列出的问题：Dashboard 任务导向、候选人移动端默认视图、路由切换滚动位置、职位工作区信息架构、字段与按钮文案和导航名称。
- 新组件库、图标库、字体包、纹理图片、动画库。
- 计划编写时已脏的文件（`AGENTS.md`、`Makefile`、`README.md`、`backend/tests/test_business_api.py`、`docs/development.md`）以及本次开始时已脏的 `backend/.env.example`。

## 2. 基线（Gate A）

### Git 状态

- 开始 commit SHA：`981d1fe187e0e084a32fe29282798f970fbd2204`
- 结束 commit SHA：`981d1fe187e0e084a32fe29282798f970fbd2204`（未提交，按要求只交付 diff）

开始 `git status --short`：

```text
 M backend/.env.example
?? docs/walnut-theme-migration-plan.md
```

结束 `git status --short`：

```text
 M backend/.env.example                  <- 用户改动，未触碰
 M docs/frontend-design-guidelines.md
 M frontend/package.json
 M frontend/src/components/app-shell/DesktopSidebar.tsx
 M frontend/src/components/app-shell/MobileSidebar.tsx
 M frontend/src/components/candidate-detail/ProfilePreview.tsx
 M frontend/src/components/jobs/JobFormPanel.tsx
 M frontend/src/components/jobs/JobWorkspace.tsx
 M frontend/src/components/jobs/JobsList.tsx
 M frontend/src/components/ui/button.tsx
 M frontend/src/components/ui/checkbox.tsx
 M frontend/src/components/ui/input.tsx
 M frontend/src/components/ui/select.tsx
 M frontend/src/pages/CandidateDetailPage.tsx
 M frontend/src/pages/DashboardPage.tsx
 M frontend/src/pages/LoginPage.tsx
 M frontend/src/pages/ResumeAddPage.tsx
 M frontend/src/pages/ResumesPage.tsx
 M frontend/src/styles/index.css
 M frontend/tailwind.config.ts
?? artifacts/product-design-audit/2026-09-02-walnut-theme/
?? docs/walnut-theme-migration-plan.md   <- 计划文件本身，未触碰
?? frontend/scripts/
```

说明：计划编写时列出的脏文件在本次执行前已不再脏，且全程未触碰。Playwright MCP 的 `.playwright-mcp/` 快照暂存目录已在交付前删除。截图 PNG 被 `.gitignore`（`artifacts/**/*.png`）忽略，符合预期。

### 运行环境与数据状态

- 前端：Vite dev server `http://localhost:5173`（用户原有进程，未重启）。
- 后端：原进程使用 `backend/.env` 中的真实密钥与真实库 `instance/talentlens.sqlite3`（含 30+ 份真实简历）。因为密钥文件不可读取、计划又要求截图不含真实个人数据，执行期间改用显式环境变量重启：
  - `APP_ACCESS_KEY=walnut-audit-key`、`AI_MODE=mock`、`FLASK_SECRET_KEY=dev-secret-change-me`
  - `DATABASE_URL=sqlite:////tmp/talent-lab-mock/audit.sqlite3`（独立审计库）
  - `UPLOAD_DIR=/tmp/talent-lab-mock/uploads`
- 数据状态（before/after 共用，审计库）：
  - 5 份全合成简历 PDF（pymupdf 现场生成，姓名 Chen Mo / Li Wanyu / Zhao Qiming / Wang Shihan / Sun Yixuan，邮箱均为 example.com，电话为 138-0000-000X 假号），经 UI 上传并由 mock AI 解析完成。
  - 3 个虚构职位（Starlane Tech / Northwind Digital / Helio Labs），含申请状态、优先级、收藏与时间线事件。
  - 15 条候选人 x 职位 mock 评分。
- 截图会话全程不接触真实简历数据。
- 执行结束后：审计期间误入用户真实库的 5 个合成候选人（id 35-39）已通过 API 删除（连带清理 `instance/uploads/` 中的对应 PDF），用户库恢复到候选人 32 条、职位 3 条；后端已按用户原始配置（`.env` + `--debug`）重启并通过健康检查。

### 截图基线

- 主矩阵 1440x900，浅色 + 深色各 12 张。
- 响应式抽查（浅色）：375x812 六张、768x1024 三张、1024x768 三张。
- 200% zoom 抽查（浅色）：1440x900 视口 + `documentElement.style.zoom = "2"`，三张。
- 主题切换机制 `localStorage["talent-lab-theme"]` + `.dark` class 未改动，截图通过该机制切换。
- 同一数据、同一 viewport、同一主题下的 before/after 一一对应（before 39 张，after 39 张 + 6 张验证证据图）。

## 3. 修改文件清单

| 文件 | 改动 |
|---|---|
| `frontend/src/styles/index.css` | 浅色/深色 token 全量替换为焦茶暖木；新增 `--control-border`；chart-* 对齐新语义色；terminal-accent 改暖铜色；terminal 保持深色 |
| `frontend/tailwind.config.ts` | 新增 `control` 颜色映射与 `fontFamily.display` |
| `frontend/package.json` | 新增 `check:theme` 脚本 |
| `frontend/scripts/check-theme-contrast.mjs` | 新建，无依赖的 WCAG 对比度断言脚本（101 行） |
| `frontend/src/components/ui/input.tsx` | Input/Textarea 边框 `border-border` 改 `border-control` |
| `frontend/src/components/ui/select.tsx` | Select 边框改 `border-control` |
| `frontend/src/components/ui/checkbox.tsx` | 未选中边界改 `border-control` |
| `frontend/src/components/ui/button.tsx` | outline 变体边框改 `border-control` |
| `frontend/src/pages/LoginPage.tsx` | 品牌主标题与表单侧 h1 加 `font-display tracking-tight`（品牌面板本就用 `primary-deep`） |
| `frontend/src/components/app-shell/DesktopSidebar.tsx` | 字标加 `font-display` |
| `frontend/src/components/app-shell/MobileSidebar.tsx` | 字标加 `font-display` |
| `frontend/src/pages/DashboardPage.tsx` | 页面标题与两个主要区块标题加 `font-display` |
| `frontend/src/pages/ResumesPage.tsx` | 页面标题加 `font-display tracking-tight` |
| `frontend/src/pages/ResumeAddPage.tsx` | 页面标题加 `font-display tracking-tight` |
| `frontend/src/pages/CandidateDetailPage.tsx` | 候选人姓名主标题加 `font-display tracking-tight` |
| `frontend/src/components/jobs/JobsList.tsx` | 页面标题加 `font-display tracking-tight` |
| `frontend/src/components/jobs/JobFormPanel.tsx` | 表单页标题加 `font-display tracking-tight` |
| `frontend/src/components/jobs/JobWorkspace.tsx` | 职位标题加 `font-display`（原有 `tracking-tight`） |
| `frontend/src/components/candidate-detail/ProfilePreview.tsx` | 简历画像主标题加 `font-display` |
| `docs/frontend-design-guidelines.md` | 品牌蓝改焦茶暖木；记录纸张/炭木主题；新增 `control-border` 职责；记录 `font-display` 允许范围；Input/Checkbox 描述同步 |

新建目录：`artifacts/product-design-audit/2026-09-02-walnut-theme/`（本报告 + before/ + after/）。

## 4. 最终 token 表

写入 `frontend/src/styles/index.css`（HSL 三元组，设计源值见计划 §4.1）：

| Token | 浅色 | 深色 |
|---|---|---|
| `background` | 43 33% 96% (#F8F6F1) | 17 13% 11% (#1F1A18) |
| `foreground` | 15 6% 14% (#262322) | 37 32% 92% (#F1ECE4) |
| `card` | 45 40% 98% (#FCFBF8) | 20 13% 14% (#28221F) |
| `card-foreground` | 15 6% 14% | 37 32% 92% |
| `muted` | 40 32% 91% (#EFEAE0) | 20 13% 18% (#342C28) |
| `muted-foreground` | 21 7% 39% (#6B625D) | 27 14% 68% (#B9ADA3) |
| `border` | 40 24% 88% (#E7E2D8) | 22 12% 26% (#4A403A) |
| `control-border` | 23 9% 55% (#978A82) | 23 11% 43% (#7A6A62) * |
| `primary` | 12 21% 27% (#543D37) | 23 41% 69% (#D0A78E) |
| `primary-foreground` | 43 33% 96% (#F8F6F1) | 11 20% 11% (#211816) |
| `accent` | 40 32% 91% | 20 14% 20% (#3A302C) |
| `accent-foreground` | 15 6% 14% | 37 32% 92% |
| `ring` | 13 23% 35% (#6F4F46) | 23 51% 75% (#E0B89F) |
| `primary-deep` | 11 22% 19% (#3A2925) | 11 22% 19% |
| `primary-deep-foreground` | 43 33% 96% | 43 33% 96% |
| `success` | 153 39% 30% (#2F6A4F) | 145 26% 59% (#7DB293) |
| `warning` | 31 65% 35% (#935A1F) | 36 59% 61% (#D6A761) |
| `destructive` | 4 50% 43% (#A33D36) | 5 68% 70% (#E6857D) |
| `destructive-foreground` | 43 33% 96% | 11 20% 11% |
| `chart-pending` | 24 6% 46% (#7D746E) | 27 10% 62% (#A89D94) |
| `chart-passed` | 13 23% 35% (#6F4F46) | 23 41% 69% (#D0A78E) |
| `chart-interviewing` | 同 warning | 同 warning |
| `chart-hired` | 同 success | 同 success |
| `chart-rejected` | 同 destructive | 同 destructive |
| `terminal-accent` | 24 48% 64% (#D09B78) | 25 55% 70% (#DCAA87) |
| `terminal-bg/fg/dim/line`、`scrim` | 不变（终端保持深色，状态灯红黄绿保留） | 不变 |

\* 唯一偏差：深色 `control-border` 由计划的 23 11% 42% (#776960) 微调为 23 11% 43% (#7A6A62)。原因：表单控件实际落在 card 表面，计划源值在 card 上为 2.97:1，略低于计划 §9 Definition of Done 要求的非文字 3:1；+1% 亮度后 card 上 3.05:1、background 上 3.34:1，双表面达标。浅色值未动。

## 5. 对比度检查结果

`npm run check:theme` 最终输出（退出码 0）：

```text
[light]
  pass  foreground/background = 14.54:1 (min 7:1)
  pass  card-foreground/card = 15.13:1 (min 7:1)
  pass  muted-foreground/background = 5.57:1 (min 4.5:1)
  pass  muted-foreground/card = 5.80:1 (min 4.5:1)
  pass  primary/background = 9.39:1 (min 4.5:1)
  pass  success/background = 5.89:1 (min 4.5:1)
  pass  warning/background = 5.17:1 (min 4.5:1)
  pass  destructive/background = 5.84:1 (min 4.5:1)
  pass  primary-foreground/primary = 9.39:1 (min 4.5:1)
  pass  destructive-foreground/destructive = 5.84:1 (min 4.5:1)
  pass  primary-deep-foreground/primary-deep = 12.64:1 (min 4.5:1)
  pass  ring/background = 6.90:1 (min 3:1)
  pass  control-border/background = 3.11:1 (min 3:1)
  pass  control-border/card = 3.24:1 (min 3:1)
  info  border/background = 1.19:1 (decorative, no threshold)
  info  border/card = 1.24:1 (decorative, no threshold)

[dark]
  pass  foreground/background = 14.58:1 (min 7:1)
  pass  card-foreground/card = 13.32:1 (min 7:1)
  pass  muted-foreground/background = 7.75:1 (min 4.5:1)
  pass  muted-foreground/card = 7.08:1 (min 4.5:1)
  pass  primary/background = 7.93:1 (min 4.5:1)
  pass  success/background = 7.01:1 (min 4.5:1)
  pass  warning/background = 7.82:1 (min 4.5:1)
  pass  destructive/background = 6.66:1 (min 4.5:1)
  pass  primary-foreground/primary = 8.01:1 (min 4.5:1)
  pass  destructive-foreground/destructive = 6.72:1 (min 4.5:1)
  pass  primary-deep-foreground/primary-deep = 12.64:1 (min 4.5:1)
  pass  ring/background = 9.37:1 (min 3:1)
  pass  control-border/background = 3.34:1 (min 3:1)
  pass  control-border/card = 3.05:1 (min 3:1)
  info  border/background = 1.71:1 (decorative, no threshold)
  info  border/card = 1.56:1 (decorative, no threshold)

All theme contrast assertions passed.
```

计划要求的断言（foreground/background >= 7、card-foreground/card >= 7、muted-foreground/background >= 4.5、primary/success/warning/destructive 文字 >= 4.5、primary-foreground/primary >= 4.5、ring/background >= 3、control-border/background >= 3）全部通过；脚本额外断言 muted-foreground/card、control-border/card、destructive-foreground/destructive、primary-deep-foreground/primary-deep，未删减任何计划验证项、未降低任何门槛。装饰性 `border` 只记录，且交互控件已全部改用 `control-border`。

## 6. 验证命令及退出结果

| 命令 | 退出码 | 备注 |
|---|---|---|
| `cd frontend && npm run check:theme` | 0 | 输出见第 5 节 |
| `cd frontend && npm run typecheck` | 0 | tsc -b 无错误 |
| `cd frontend && npm run lint` | 0 | eslint --max-warnings 0 通过 |
| `cd frontend && npm run build` | 0 | 构建成功；CSS 39.44 kB (gzip 8.31 kB)，无字体/图片/依赖新增 |
| `make check-badchars` | 0 | 通过 |
| `git diff --check` | 2 | 唯一告警为 `backend/.env.example:15 new blank line at EOF`，属用户既有改动；本任务文件单独跑 `git diff --check -- docs/frontend-design-guidelines.md frontend/` 退出码 0 |
| `git status --short` | 0 | 见第 2 节 |

后端本次无改动，按要求未触发 `make backend-test`；为确认无回归仍可在需要时运行。

## 7. before/after 截图索引

主矩阵 1440x900（浅色/深色各一）：

| 场景 | before | after |
|---|---|---|
| 登录 | `before/01-login-1440-{light,dark}.png` | `after/01-login-1440-{light,dark}.png` |
| Dashboard | `02-dashboard-1440-*` | 同 |
| 简历表格 | `03-resumes-table-1440-*` | 同 |
| 简历卡片+选择操作栏 | `04-resumes-cards-selected-1440-*` | 同 |
| 上传空状态 | `05-upload-empty-1440-*` | 同 |
| 解析队列+SSE 终端 | `06-upload-queue-terminal-1440-*` | 同 |
| 候选人顶部+画像 | `07-candidate-profile-1440-*` | 同 |
| 评分与时间线 | `08-candidate-score-timeline-1440-*` | 同 |
| 职位列表 | `09-jobs-list-1440-*` | 同 |
| 职位工作区 | `10-job-workspace-1440-*` | 同 |
| 职位编辑+JD 解析预览 | `11-job-edit-jd-preview-1440-*` | 同 |
| 简历对比抽屉 | `12-compare-drawer-1440-*` | 同 |

响应式与 zoom 抽查（浅色）：`r375-{login,mobile-sidebar,resumes-cards,upload,candidate-detail,jobs}-light.png`、`r768-{resumes-list,candidate-detail,job-workspace}-light.png`、`r1024-{dashboard,resumes-table,candidate-detail}-light.png`、`z200-{login-form,resume-filter,job-form}-light.png`，before/after 各一套。

交互验证证据（仅 after/）：`verify-focus-login-input-{light,dark}.png`、`verify-focus-login-button-{light,dark}.png`、`verify-login-error-{light,dark}.png`、`verify-en-resumes-light.png`。

## 8. 已验证的交互状态

- 键盘 Tab 顺序（登录页）：语言切换 -> 访问密钥输入框 -> 提交按钮，顺序正确。
- 焦点环（两主题实测 computed style）：登录输入框 ring 2px（浅色 #6E4E45 / 深色 #E0B89F）、主按钮 ring 2px、筛选 Select ring 2px、Checkbox ring 2px + 2px offset；均清晰可辨（证据图 + box-shadow 实测值）。
- 主题切换可纯键盘完成（Enter 与 Space 双向切换，localStorage 同步更新）。
- 错误状态：登录失败文案 `text-destructive` 在两主题下可读（证据图）。
- hover/active/disabled：outline 按钮 hover 走 accent 背景、按钮 active 缩放、分页 disabled 置灰均在截图矩阵中可见；样式机制未改动，仅颜色令牌变化。
- 状态不只靠颜色：Badge 全部带文字，图表带轴标签与 tooltip，评分有数字。
- 375/768/1024/1440 四档宽度 x 五个关键页面（/、/resumes、/resumes/3、/jobs、/resumes/new）无横向溢出（scrollWidth === clientWidth 全过）。
- `prefers-reduced-motion` 模拟下动画与过渡时长收敛到 0.01ms（既有媒体查询，未改动）。
- 中英文均未见标题裁切或按钮换行（中文全矩阵 + `verify-en-resumes-light.png`）。
- 构建产物未因字体或图片增大：`font-display` 为纯系统字体栈，无新依赖。
- 修改后的 .ts/.tsx 均 <= 200 行（最大 CandidateDetailPage 196 行；index.css 为 234 行但不在计划 .ts/.tsx 检查范围内，仅新增 2 行）。

## 9. 未覆盖范围和已知限制

- 上传/解析是秒级完成的（mock AI），场景 06 捕获的是队列完成态 + 完整 SSE 终端日志，而非进行中的瞬间；before/after 同为完成态，可对比。
- 响应式与 zoom 抽查只在浅色主题执行（计划未要求响应式抽查覆盖深色）；深浅双主题由 1440 主矩阵覆盖。
- 200% zoom 用 CSS `zoom` 模拟，与浏览器原生缩放渲染等价但非同一机制。
- 简历列表中部分筛选控件（如简历状态 Select）缺少显式 aria-label，属 2026-08-14 历史审视已记录的既有问题，本次按计划边界未修改。
- 深色 `control-border` 相对计划源值有 +1% 亮度偏差（理由见第 4 节）。
- 审计期间重启过本地后端 dev server（原进程 PID 32461 被停止）；结束后已按用户原始配置恢复运行。`backend/.env` 全程未读取、未修改。
- 审计数据库与上传文件位于 `/tmp/talent-lab-mock/`，属临时产物，未入库。
- `frontend/src/styles/index.css` 中 `--scrim`、`--terminal-bg/fg/dim/line` 保留原蓝灰值（计划只要求终端强调色改暖铜色），终端外壳在两主题下保持深色，与炭木主题并存时可观察到轻微冷暖差，属计划允许范围。

## 10. 与历史审视问题的区分

本任务只做视觉主题迁移。2026-08-14 审视中的以下问题均未触碰、也不构成本次回归：Dashboard 任务导向不足、候选人移动端默认视图（本次移动端仍默认表格视图，截图中手动切卡片仅为覆盖矩阵场景）、路由切换滚动位置、职位工作区信息架构、字段与按钮文案和导航名称、触达目标尺寸与无障碍命名改进。这些问题仍是后续任务。

## 11. 真实个人数据泄露风险

无。截图会话使用独立审计库与全合成数据（虚构姓名、example.com 邮箱、假电话）；用户真实库（含真实简历）未出现在任何截图中；审计期间误入真实库的 5 条合成记录已删除并验证（候选人 37 -> 32，上传文件同步清除）。仓库内截图 PNG 被 .gitignore 忽略，不会入库。
