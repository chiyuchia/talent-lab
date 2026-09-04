# Talent Lab 焦茶暖木主题迁移计划

状态：可执行，等待 Anti-Gravity 实施。

日期：2026-09-02。

## 1. 设计判断

Design Read：这是一次桌面优先的个人求职工作台视觉升级，面向需要长期阅读简历、比较职位和追踪申请进度的用户。采用克制、温暖、出版物式的品牌语言，同时保留高密度产品界面的清晰度。

- 重设计模式：`Redesign - Preserve`
- `DESIGN_VARIANCE: 4`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 7`
- 实现基础：保留 React、Tailwind v3、现有 UI 原语、Lucide 和 CSS 语义变量
- 不引入新的组件库、图标库、字体依赖、纹理图片或动画库
- 不改变信息架构、路由、业务逻辑、接口、文案和交互流程

焦茶暖木只负责品牌气质，不能把数据状态、表格、表单和图表全部染成棕色。

## 2. 输入与事实来源

执行前必须阅读：

- 焦茶暖木参考页：`/Users/yoga/.gemini/antigravity/brain/9344ad9a-6f68-4e64-8b6e-59d50e876b29/palette_preview.html`
- 现有主题变量：`frontend/src/styles/index.css`
- Tailwind 映射：`frontend/tailwind.config.ts`
- 前端设计规范：`docs/frontend-design-guidelines.md`
- 历史产品审视报告：`artifacts/product-design-audit/2026-08-14/audit.md`

历史截图只能用来了解界面，不可作为本次完成证据。本次改动前后必须在同一数据、主题和 viewport 下重新截图。

## 3. 不可触碰的边界

本次不处理历史审视中提到的这些问题：

- Dashboard 任务导向不足
- 候选人移动端默认视图
- 路由切换后的滚动位置
- 职位工作区的信息架构
- 字段、按钮文案和导航名称
- 后端、API、数据库和 SSE 行为

计划编写时，工作树已有未提交改动。实施前必须重新运行 `git status --short`，保留所有不属于本任务的用户改动。以下文件在计划编写时已经处于修改状态，本任务不得修改：

- `AGENTS.md`
- `Makefile`
- `README.md`
- `backend/tests/test_business_api.py`
- `docs/development.md`

禁止使用 reset、checkout 或覆盖式格式化清理这些文件。

## 4. 目标视觉契约

### 4.1 核心主题变量

以下十六进制颜色是设计源值。写入 CSS 时使用括号中的 HSL 三元组。

| Token | 浅色 | 深色 |
|---|---|---|
| `background` | `#F8F6F1` (`43 33% 96%`) | `#1F1A18` (`17 13% 11%`) |
| `foreground` | `#262322` (`15 6% 14%`) | `#F1ECE4` (`37 32% 92%`) |
| `card` | `#FCFBF8` (`45 40% 98%`) | `#28221F` (`20 13% 14%`) |
| `card-foreground` | `#262322` | `#F1ECE4` |
| `muted` | `#EFEAE0` (`40 32% 91%`) | `#342C28` (`20 13% 18%`) |
| `muted-foreground` | `#6B625D` (`21 7% 39%`) | `#B9ADA3` (`27 14% 68%`) |
| `border` | `#E7E2D8` (`40 24% 88%`) | `#4A403A` (`22 12% 26%`) |
| `control-border` | `#978A82` (`23 9% 55%`) | `#776960` (`23 11% 42%`) |
| `primary` | `#543D37` (`12 21% 27%`) | `#D0A78E` (`23 41% 69%`) |
| `primary-foreground` | `#F8F6F1` | `#211816` (`11 20% 11%`) |
| `accent` | `#EFEAE0` | `#3A302C` (`20 14% 20%`) |
| `accent-foreground` | `#262322` | `#F1ECE4` |
| `ring` | `#6F4F46` (`13 23% 35%`) | `#E0B89F` (`23 51% 75%`) |
| `primary-deep` | `#3A2925` (`11 22% 19%`) | `#3A2925` |
| `primary-deep-foreground` | `#F8F6F1` | `#F8F6F1` |
| `success` | `#2F6A4F` (`153 39% 30%`) | `#7DB293` (`145 26% 59%`) |
| `warning` | `#935A1F` (`31 65% 35%`) | `#D6A761` (`36 59% 61%`) |
| `destructive` | `#A33D36` (`4 50% 43%`) | `#E6857D` (`5 68% 70%`) |

`border` 只用于分隔线和非交互容器。输入框、选择框、未选中 checkbox 和 outline 按钮使用新增的 `control-border`。

### 4.2 图表和终端

- `chart-pending`：浅色 `#7D746E`，深色 `#A89D94`
- `chart-passed`：浅色 `#6F4F46`，深色 `#D0A78E`
- `chart-interviewing`：与 `warning` 对齐
- `chart-hired`：与 `success` 对齐
- `chart-rejected`：与 `destructive` 对齐
- SSE 终端继续保持深色，不做纸张底色
- 终端强调色改为暖铜色：浅色 `#D09B78`，深色 `#DCAA87`
- 保留终端红、黄、绿状态灯，不将它们改成品牌色

### 4.3 字体

正文、表格、按钮、表单和数据继续使用 Inter。

新增 Tailwind `font-display`：

```text
"Iowan Old Style", "Songti SC", "STSong",
"Noto Serif CJK SC", "Source Han Serif SC",
"SimSun", Georgia, "Times New Roman", serif
```

只在以下位置使用：

- 登录页主品牌标题
- 桌面和移动侧栏的 `Talent Lab`
- 页面内容区的一级标题
- 候选人姓名、职位标题等文档型主标题
- Dashboard 的主要区块标题
- 简历画像的主标题

以下位置保持无衬线：

- 顶栏当前页名称
- 表格标题与单元格
- 按钮、标签、Badge、输入框
- 筛选器、分页器、图表标签
- 卡片中的普通字段名
- 数字和评分

不要照搬参考页中的章节编号、Mono 标签或 Emoji。

### 4.4 形状与材质

- 保持现有 8px 卡片、6px 控件、4px 微型元素规则
- 普通卡片不增加阴影
- 只有登录品牌面板、抽屉和浮动操作栏可以有层级阴影
- 不添加全局纸张纹理、噪点覆盖层、渐变光晕或木纹图片
- 纸张感主要由底色、边框、字体和留白形成

## 5. 分阶段执行

### 阶段 A：建立本次基线

1. 运行 `git status --short`，把结果写入审计报告。
2. 记录当前 commit SHA。
3. 使用本地 `AI_MODE=mock` 和模拟简历，不在截图中暴露真实简历或个人数据。
4. 在改代码前捕捉规定的 baseline 截图。
5. 创建：

```text
artifacts/product-design-audit/2026-09-02-walnut-theme/
  audit.md
  before/
  after/
```

图片已被 `.gitignore` 忽略，`audit.md` 可以纳入评审。

**Gate A：**没有 baseline、viewport、主题和数据状态记录，不得开始改样式。

### 阶段 B：主题基础设施

修改：

- `frontend/src/styles/index.css`
- `frontend/tailwind.config.ts`
- `frontend/package.json`
- 新建 `frontend/scripts/check-theme-contrast.mjs`

任务：

1. 按目标表替换浅色和深色 token。
2. 增加 `--control-border`。
3. 在 Tailwind 中增加 `control` 颜色映射。
4. 增加 `font-display`。
5. 不改主题 localStorage key 和 `.dark` class 机制。
6. 添加无第三方依赖的主题对比度检查脚本。
7. 在 `package.json` 增加：

```json
"check:theme": "node scripts/check-theme-contrast.mjs"
```

脚本至少断言：

- `foreground/background >= 7:1`
- `card-foreground/card >= 7:1`
- `muted-foreground/background >= 4.5:1`
- primary、success、warning、destructive 文字与背景 `>= 4.5:1`
- `primary-foreground/primary >= 4.5:1`
- `ring/background >= 3:1`
- `control-border/background >= 3:1`

装饰性 `border` 只记录比值，不要求达到 3:1，但不得被交互控件使用。

**Gate B：**浅色和深色对比度脚本全部通过。

### 阶段 C：基础 UI 原语

检查并按需修改：

- `frontend/src/components/ui/input.tsx`
- `frontend/src/components/ui/select.tsx`
- `frontend/src/components/ui/checkbox.tsx`
- `frontend/src/components/ui/button.tsx`
- `frontend/src/components/ui/badge.tsx`
- `frontend/src/components/ui/card.tsx`
- `frontend/src/components/ui/table.tsx`

要求：

- Input、Textarea、Select 使用 `border-control`
- Checkbox 未选中边界使用 `border-control`
- outline 按钮使用 `border-control`
- focus ring 必须在两种主题下明显
- Card 和 Table 继续使用装饰性 `border`
- Badge 保留成功、警告、错误等语义色
- 不在业务组件写新 hex、RGB 或 HSL
- 不复制新的按钮、表单或 Badge 样式

**Gate C：**键盘焦点、hover、active、disabled 和错误状态在两种主题下均可辨认。

### 阶段 D：品牌与标题层

检查并按需修改：

- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/components/app-shell/DesktopSidebar.tsx`
- `frontend/src/components/app-shell/MobileSidebar.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/ResumesPage.tsx`
- `frontend/src/pages/ResumeAddPage.tsx`
- `frontend/src/pages/CandidateDetailPage.tsx`
- `frontend/src/components/jobs/JobsList.tsx`
- `frontend/src/components/jobs/JobFormPanel.tsx`
- `frontend/src/components/jobs/JobWorkspace.tsx`
- `frontend/src/components/candidate-detail/ProfilePreview.tsx`

要求：

- 只给前述允许位置增加 `font-display`
- 页面主标题建议使用 `tracking-tight`
- 登录页深色品牌区域使用 `primary-deep`
- 顶栏、筛选栏、表格和表单不使用衬线字体
- 不重新排版、不添加营销文案、不改变标题内容
- 不为达到书卷感增加章节编号、装饰标签或假元数据

**Gate D：**界面能看出焦茶暖木品牌，但仍然首先像工作台，而不是简历模板网站。

### 阶段 E：业务表面检查

逐项检查，不做结构重写：

- Dashboard 指标与图表
- 简历表格和卡片视图
- 技能标签、状态 Badge、选择操作栏
- 候选人画像、教育和工作时间线
- 职位卡片、收藏状态、申请时间线
- JD 解析预览
- 对比抽屉
- 上传队列和 SSE 终端
- 空、加载、错误、禁用状态

重点防止：

- 图表类别被棕色吞并
- muted 文字在米色背景上变淡
- 卡片和页面背景无法区分
- 表单边界过弱
- 暗色主题变成一整片低对比棕黑
- 衬线字体进入表格、按钮和小字号标签
- 多层米色卡片套卡片导致信息层级浑浊

### 阶段 F：更新规范

只修改：

- `docs/frontend-design-guidelines.md`

更新内容：

- 定位中的品牌蓝改为焦茶暖木主色
- 增加 `control-border` 的职责
- 记录 display serif 的允许范围
- 记录浅色纸张主题和深色炭木主题
- 保留所有现有布局、组件、响应式、状态和无障碍约定

不要修改当前已脏的 `docs/development.md`。

## 6. 截图审计矩阵

所有 before/after 必须使用相同 viewport、主题和模拟数据。

### 1440 x 900，浅色与深色各一组

1. `/login`
2. `/`
3. `/resumes` 表格视图
4. `/resumes` 卡片视图和已选择操作栏
5. `/resumes/new` 空上传状态
6. `/resumes/new` 解析队列和 SSE 终端
7. `/resumes/:id` 顶部和简历画像
8. `/resumes/:id` 评分与时间线
9. `/jobs` 职位列表
10. `/jobs` 职位工作区
11. 职位编辑和 JD 解析预览
12. 简历对比抽屉

### 响应式抽查

- 375 x 812：登录、移动侧栏、简历卡片、上传、候选人详情、职位
- 768 x 1024：简历列表、候选人详情、职位工作区
- 1024 x 768：Dashboard、表格、候选人详情
- 200% zoom：登录表单、简历筛选、职位表单

截图命名示例：

```text
before/03-resumes-table-1440-light.png
after/03-resumes-table-1440-light.png
```

## 7. 必须执行的验证

```bash
cd frontend && npm run check:theme
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
make check-badchars
git diff --check
git status --short
```

额外人工验证：

- 仅用键盘完成登录页、侧栏、筛选、主题切换和主要表单导航
- 两种主题下检查所有 focus ring
- 状态仍有文字或图标，不能只靠颜色
- 375、768、1024、1440 宽度无新增溢出或遮挡
- `prefers-reduced-motion` 下动画接近静态
- 中英文均不出现标题裁切或按钮换行
- 构建产物没有因为字体或图片新增而明显增大
- 所有修改后的 `.ts` 和 `.tsx` 文件仍不超过 200 行

## 8. 审计报告必须包含

`audit.md` 必须记录：

1. 改动目标和非目标
2. 开始和结束 commit SHA
3. 开始和结束 `git status --short`
4. 修改文件清单
5. 最终 token 表
6. 浅色和深色对比度结果
7. before/after 截图索引
8. 每个验证命令及退出结果
9. 已验证的交互状态
10. 未覆盖范围和已知限制
11. 与历史审视问题的区分
12. 是否存在真实个人数据泄露风险

## 9. Definition of Done

只有同时满足以下条件才算完成：

- 焦茶暖木主题在浅色和深色模式下完整成立
- 品牌主色只有一个，语义状态色保持独立
- 表单边界和焦点达到非文字 3:1
- 正文和辅助文字达到 WCAG AA
- 正文仍为 Inter，衬线字体仅用于批准的位置
- 路由、数据、API、文案和交互没有变化
- 没有新增设计系统、字体包、图片或动画依赖
- 所有命令通过
- 截图矩阵完成
- `audit.md` 能从每个结论追溯到截图、token 或命令结果
- 当前已有的无关工作树改动保持原样

## 10. Git 边界

本次不要自动提交，先交付 diff 和审计报告供检查。

如果之后需要拆分提交，建议顺序：

1. `feat(frontend): add warm walnut theme tokens`
2. `feat(frontend): apply editorial hierarchy to core surfaces`
3. `docs(design): document warm walnut visual system`

实施完成时，Anti-Gravity 必须返回：

- 修改文件清单
- 验证命令及结果
- 对比度检查结果
- before/after 截图索引
- `audit.md` 路径
- 未解决问题和已知限制
