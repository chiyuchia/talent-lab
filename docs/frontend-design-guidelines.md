# 前端设计规范

本文是 talent-lab 前端界面的设计与实现基线，适用于新增页面、组件重构和代码评审。规范以当前代码为事实来源，不另建一套脱离实现的视觉系统。

## 1. 设计定位

talent-lab 是招聘场景的桌面优先 SaaS 工具，视觉关键词为：专业、克制、清晰、紧凑、易扫描。

- 信息优先于装饰，主要层级依靠字号、字重、间距和边框建立。
- 界面只使用一个品牌蓝作为主要强调色，成功、警告、错误色仅表达语义状态。
- 同时支持浅色与深色主题，业务组件不得写死只适用于单一主题的颜色。
- 高频操作应保持稳定位置，并提供 hover、active、focus、disabled 和 loading 状态。
- 优先复用 UI 原语，禁止在页面内重复拼装同类表单控件。

## 2. 技术与事实来源

| 内容 | 事实来源 |
|------|----------|
| 颜色、终端和图表令牌 | `frontend/src/styles/index.css` |
| Tailwind 映射、圆角、动画 | `frontend/tailwind.config.ts` |
| 基础 UI 组件 | `frontend/src/components/ui/` |
| 页面容器与导航布局 | `frontend/src/components/AppShell.tsx` |
| UI 状态与主题切换 | `frontend/src/lib/ui-store.ts` |

样式使用 Tailwind 原子类；条件类统一通过 `cn()` 合并。组件变体优先使用 `class-variance-authority`。

## 3. 颜色系统

业务代码只使用语义色，不直接写十六进制颜色或复制 HSL 数值。

| 令牌 | 用途 |
|------|------|
| `background` / `foreground` | 页面底色与主要文字 |
| `card` / `card-foreground` | 卡片、侧栏、浮层内容 |
| `muted` / `muted-foreground` | 次级表面、说明文字、禁用提示 |
| `border` | 卡片、表单、分隔线 |
| `primary` / `primary-foreground` | 主操作、选中态、链接、焦点反馈 |
| `accent` / `accent-foreground` | 次级按钮和 hover 背景 |
| `success` | 完成、录用、成功 |
| `warning` | 面试中、等待用户注意 |
| `destructive` / `destructive-foreground` | 删除、失败、淘汰 |
| `ring` | 键盘焦点环 |

专用令牌仅在对应场景使用：`terminal-*` 用于 SSE 解析终端，`chart-*` 用于图表，`scrim` 用于遮罩，`primary-deep` 用于登录品牌面板。

状态不能只依赖颜色表达，必须同时提供文字或图标。半透明语义背景采用 `primary/10`、`success/10` 等形式，边框通常采用同色 `/20`。

## 4. 字体与文字层级

全局字体为 Inter Variable，中文回退依次使用系统无衬线字体、苹方、冬青黑体和微软雅黑。

| 层级 | 推荐样式 | 使用场景 |
|------|----------|----------|
| 页面标题 | `text-2xl font-semibold` | 页面内容区主标题 |
| 应用栏标题 | `text-base font-semibold` | 顶部导航当前页面名 |
| 区块标题 | `text-lg font-medium` 或 `font-medium` | 卡片、面板标题 |
| 正文与控件 | `text-sm` | 表格、表单、按钮、正文 |
| 辅助信息 | `text-xs text-muted-foreground` | 标签、说明、时间、次要数据 |
| 核心指标 | `text-3xl font-semibold tabular-nums` | 仪表盘数字 |

- 默认正文使用正常字重；重要名称使用 `font-medium`，页面标题使用 `font-semibold`。
- 数字对齐场景使用 `tabular-nums`。
- 表格标题、按钮和徽标默认 `whitespace-nowrap`。
- 长名称、邮箱和标签根据语义使用 `truncate`、`break-all` 或明确的最大宽度。

## 5. 布局与间距

应用壳层固定规则：

- 顶栏高度为 64px，即 `h-16`。
- 桌面侧栏展开宽度为 224px，即 `w-56`；收起宽度为 64px，即 `w-16`。
- 常规页面最大宽度为 1280px，即 `max-w-7xl`。
- 页面内边距为移动端 16px、桌面端 32px，垂直内边距为 24px。
- 全高页面使用 `min-h-dvh`，不使用 `h-screen`。

间距优先从 4、6、8、12、16、20、24、32px 中选择：

- 紧密元素：`gap-1.5` 或 `gap-2`。
- 同组控件：`gap-3`。
- 卡片或主要区块：`gap-4`。
- 大区块分隔：`gap-6` 或 `gap-8`。
- 标准卡片内边距：`p-5`；紧凑列表和移动端卡片可使用 `p-3` 或 `p-4`。

响应式遵循 Tailwind 默认断点：`sm` 640px、`md` 768px、`lg` 1024px、`xl` 1280px。移动端默认单列，`md` 后可进入双列，三列卡片通常从 `xl` 开始。

## 6. 形状、边框与阴影

- 卡片、面板、表格外框统一使用 `rounded-lg`，对应 8px。
- 按钮、输入框、选择框、徽标统一使用 `rounded-md`，对应 6px。
- 微型按钮和内部标记可使用 `rounded-sm`，对应 4px。
- 常规容器使用 `border border-border`，分组列表使用单向分隔线，避免重复套边框。
- 阴影只用于抽屉、错误通知或确有层级差的浮层。普通卡片依靠边框和背景区分。
- 可点击卡片允许轻微上浮，但不得造成周围布局跳动。

## 7. 基础组件

新增界面必须优先使用 `frontend/src/components/ui/` 中的组件。

### Button

- 变体：`primary`、`secondary`、`outline`、`ghost`、`destructive`。
- 尺寸：`sm` 为 32px，`md` 为 40px，`icon` 为 36px 方形。
- 普通图标为 16px，即 `h-4 w-4`；图标按钮必须提供 `aria-label`。
- 主操作每个局部区域通常只有一个，删除操作使用 `destructive`。

### Input、Textarea、Select

- 标准控件高度为 40px；紧凑型 `Select` 高度为 36px。
- 水平文字内边距为 12px；选择框右侧为箭头预留 36px。
- 使用 `border-border`、`bg-background`、`text-sm` 和 2px `ring` 焦点反馈。
- 禁止直接写原生 `<select>` 的视觉样式，统一使用 `Select`。
- Textarea 默认最小高度为 112px，可按内容增加，不应固定到导致内容裁切。

### Checkbox

- 统一使用 16px 的 `Checkbox`，不要直接使用浏览器原生 checkbox。
- 未选中时使用背景色与中性色边框；选中时使用品牌蓝和对勾。
- 可点击区域不能被相邻内容遮挡，列表首列水平内边距至少为 16px。

### Card、Badge

- `Card` 负责表面、边框和圆角；标题与内容分别使用 `CardHeader`、`CardContent`。
- `Badge` 用于状态和短标签，不用于普通按钮。
- Badge 文本保持单行；超长技能标签由外层列表限制数量或截断。

## 8. 表单规范

- 标签位于控件上方，使用 `text-sm font-medium`；紧凑筛选标签可使用 `text-xs font-semibold text-muted-foreground`。
- 标签与控件间距为 6px，即 `mb-1.5`。
- 相关字段组使用 `space-y-4`，多列字段使用 `gap-3` 或 `gap-4`。
- 表单使用受控组件，提交期间禁用重复操作。
- placeholder 只提供示例或输入提示，不能代替可访问标签。
- 校验错误紧邻字段显示，使用 `text-sm text-destructive`；全局错误交给 `GlobalFeedback`。
- 搜索、标签筛选等高频输入应避免每次按键触发昂贵请求，使用防抖或延迟值。

## 9. 表格、列表与数据展示

- 表头使用次级表面 `bg-muted/50` 和 `text-muted-foreground`。
- 表头文字使用 `font-medium whitespace-nowrap`，不得折行。
- 表格单元格默认水平内边距 16px；标题行垂直内边距 12px，内容行 16px。
- 数字列保持对齐，操作列右对齐，选择列使用固定窄宽度。
- 行 hover 使用轻量背景变化；选中行使用 `bg-primary/5`。
- 技能等多值内容使用 `TagList` 并限制显示数量，剩余数量显示为 `+N`。
- 小屏空间不足时切换卡片视图或提供横向滚动，不允许压缩标题到换行。

## 10. 图标与数据图表

- 图标统一来自 `lucide-react`，同一控件内不混用其他图标库或 Emoji。
- 常规图标 16px，强调图标 20px，装饰图标不得抢占文字层级。
- 图标与文字间距通常为 6px，即 `gap-1.5`。
- Recharts 图表颜色必须读取 `chart-*` 令牌，不能在组件内另建状态颜色。
- 图表必须带标题、可理解的标签或 tooltip，不能只靠颜色区分类别。

## 11. 交互、动效与反馈

- hover 和颜色切换控制在 150-300ms，常规使用 `transition-colors duration-200`。
- 按钮 active 状态使用轻微 `scale-[0.97]`，禁用时取消缩放。
- 页面进入使用 350-500ms 的淡入上移动效；列表延迟最多约 330ms，避免拖慢操作感。
- 动效只用于进入、状态变化和操作反馈，不用于静态装饰。
- 全局加载条延迟显示，局部内容使用与最终布局一致的 Skeleton。
- 空状态说明当前原因并给出下一步；错误信息说明失败操作和可恢复路径。
- 删除等不可逆操作需要确认，提交或 mutation 期间禁用重复点击。
- 所有动效必须尊重 `prefers-reduced-motion`。

## 12. 可访问性

- 所有交互元素必须可通过键盘访问，并具有清晰的 `focus-visible` 状态。
- 图标按钮必须提供准确的 `aria-label`；纯装饰图标使用 `aria-hidden`。
- 输入控件必须与 `<label>` 关联，或在无可见标签时提供 `aria-label`。
- 正文和控件文字至少满足 WCAG AA 4.5:1 对比度。
- 状态不能只依靠颜色；加载与动态更新区域按需使用 `role="status"`、`aria-live`。
- 触控目标建议不小于 36px；16px checkbox 需要由外层可点击区域扩展命中范围。

## 13. 禁止事项

- 不在页面内复制 Button、Select、Checkbox、Badge 等基础组件样式。
- 不在业务组件写死主题颜色、十六进制颜色或任意 RGB/HSL，专用遮罩除外。
- 不混用图标库，不使用 Emoji 代替功能图标。
- 不使用 placeholder 充当字段标签。
- 不通过颜色单独表达成功、警告或错误。
- 不为普通卡片添加重阴影、霓虹光晕或无意义动画。
- 不使用随意的圆角、间距和字号；新增尺寸应先判断能否复用现有尺度。
- 不让表头、按钮文字和状态徽标折行。

## 14. 交付检查

前端改动提交前至少确认：

1. 复用了现有 UI 原语和语义令牌。
2. 浅色与深色主题下层级、边框和状态均清晰。
3. 375px、768px、1024px、1440px 宽度下无意外遮挡或横向溢出。
4. 键盘焦点、hover、active、disabled、loading、empty、error 状态完整。
5. 表单标签、图标按钮和动态区域具备必要的无障碍属性。
6. 执行 `npm run typecheck` 与 `npm run lint`；涉及构建配置时再执行 `npm run build`。

存量页面若与本文不一致，应在相关功能改动时逐步迁移，避免一次性视觉重写影响业务稳定性。
