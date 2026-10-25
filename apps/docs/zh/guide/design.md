# 使用 YAM3X 应用 Material 3 Expressive

YAM3X 提供主题基础和 Vue 组件。页面层级、内容布局、自适应行为和产品专属样式仍由应用负责。本指南把 Material 3 Expressive 规范提炼为应用开发者和 agent 可执行的选择方法。官方链接提供设计依据，YAM3X 组件页说明当前实现的 API 和样式接口。

## 根据内容和任务选择布局

根据任务以及内容之间的关系选择页面结构：

- 用 Feed 网格呈现大量同级内容，例如供人快速浏览的卡片。
- 用 List-detail 让人从集合中选中一项，再查看详情，适合父子内容关系。
- 当次要内容只有结合主要内容才有意义时，使用 Supporting pane，例如属性、评论、课程或工具。

Material 的[经典布局示例](https://m3.material.io/foundations/layout/canonical-examples/overview)展示了这些模式在 compact、medium、expanded 尺寸下的适配：[Feed](https://m3.material.io/foundations/layout/canonical-examples/feed)、[List-detail](https://m3.material.io/foundations/layout/canonical-examples/list-detail)和[Supporting pane](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane)。以这些示例为起点，再根据内容和任务调整。

自适应设计可以随着窗口尺寸变化、用户导航以及设备和输入场景不同，改变布局结构、组件位置或行为。根据任务采用缩放、重排、按需显示或隐藏内容、改变呈现方式等策略；不要只把同一套界面整体缩小。选择能维持内容关系与窗格可用性的阈值。设计时同时考虑触控、指针和键盘输入；视觉排列变化后，保持阅读顺序与焦点顺序合理。参阅[自适应设计](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)、[布局概览](https://m3.material.io/foundations/layout/layout-overview/overview)和[RTL 双向布局](https://m3.material.io/foundations/layout/bidirectionality-rtl)。

Material 的 Supporting pane 示例在 compact 和 medium 尺寸下将辅助内容放在主要区域下方，在 expanded 尺寸下将其放在主要区域旁边。YAM3X SplitPane 是基于此模式的项目扩展。其[组件页](/zh/components/split-pane)说明项目定义的紧凑行为；路由仍由应用负责。

## 建立清晰的排版层级

Material 字阶包含五种文字角色，每种有 large、medium、small 三种尺寸：

- Display：简短而重要的文字或数字。
- Headline：简短的高强调内容或主要内容区域标题。
- Title：中等强调的章节标题和次要区域标题。
- Body：较长的阅读内容。
- Label：控件标签、说明等简短实用文字。

按内容用途选择角色，不要只把它当成一组依次放大的字号。YAM3X Heading 映射 Display、Headline、Title 和 Label 角色；用 **level** 确定文档标题语义，并独立设置控制外观的 **variant**、**size** 和 **emphasized**。普通阅读文本应使用正常正文语义。参阅 [Heading](/zh/components/heading) 和 Material 的[排版应用指南](https://m3.material.io/styles/typography/applying-type)。

Material 定义了 15 种 baseline 和 15 种 emphasized 样式，但产品无需全部使用。默认使用 baseline。只有当选中状态、操作、标题或其他重要状态需要更突出时，才使用同角色、同尺寸的 emphasized 样式；Material 组件默认不使用 emphasized。参阅[字阶与 token](https://m3.material.io/styles/typography/type-scale-tokens)。

Web 文本的行高决定文字边界盒的高度，字体度量决定字形在盒内的位置。用 padding 设置该盒与相邻元素、容器边缘之间的空间，不要固定内容高度。若定义自有字阶，Material 建议 Display、Headline、Title 的行高约为字号的 1.2 倍，Body 和 Label 约为 1.5 倍；优先使用合适的 YAM3X 排版 token。参阅 [Applying type](https://m3.material.io/styles/typography/applying-type) 中的排版图示。

为本地化内容添加正确的 **lang**。YAM3X 会把常见语言标签映射到脚本高度类别来调整行高，默认使用 medium，也可在子树上通过 **data-md-language-height** 覆盖。较高脚本和翻译文本需要空间换行和增长；固定高度元素可能裁切或重叠。文字放大到 200% 时，保留默认间距关系并允许内容重排，不要等比例放大每个间隔。参阅[语言高度支持](https://m3.material.io/styles/typography/type-scale-tokens)和[间距应用指南](https://m3.material.io/styles/spacing/applying-spacing)。

表格和计时器等频繁变化的数字使用等宽数字，让数值保持对齐。参阅[确保可读性](https://m3.material.io/styles/typography/applying-type)。

## 按归属使用间距

Material 间距以 8 dp 为基础，并提供推荐值；它不要求所有位置使用同一种间距。若推荐值不适合重复使用的模式，Material 允许产品按一致的比例扩展间距刻度。参阅[间距概览](https://m3.material.io/styles/spacing/overview)、[间距 token](https://m3.material.io/styles/spacing/tokens)和[间距应用指南](https://m3.material.io/styles/spacing/applying-spacing)。

组件内部使用父容器的 padding 和 gap 来组织内容；Material 建议优先使用这两种方式，而不是在子元素上设置 margin。组件自己的内部间距遵循对应设计指南。页面层面由应用外壳组织窗格、页面边距和留白，再用 padding 和 gap 组织各窗格中的内容。使用逻辑方向属性，让 leading/trailing 随文字方向切换。

YAM3X 基础样式表提供 **--md-sys-spacing-16**、**--md-sys-spacing-24** 等项目 CSS 变量，可用于应用自有布局：

```css
.page-layout {
  display: grid;
  gap: var(--md-sys-spacing-24);
  padding-inline: var(--md-sys-spacing-16);
}
```

这些变量名称和 CSS 像素值属于 YAM3X 的 Web 实现，并非 Material 官方 CSS token 名称。[主题指南](/zh/guide/theme#应用布局间距)列出可用值和 Tailwind 别名。YAM3X 的 density 设置会缩放这些共享间距变量，包括应用布局所用的值，因此请检查应用实际密度下的页面空间是否合适。

## 通过公开接口组合组件

选择符合任务的组件，并使用其组件页文档说明的 props 和 slots。只有组件页列出的 CSS 自定义属性才用于组件样式调整。页面结构、边距和布局规则放在应用自有容器上。宽泛选择器和固定尺寸覆盖可能绕过组件状态、文字缩放和内容适配。

主题角色与密度配置见[颜色与主题](/zh/guide/theme)。指针输入与动效见[手势与交互](/zh/guide/gestures)和 Material 的[动效规范](https://m3.material.io/styles/motion/overview)。

## 消费项目中的 Agent 指南

CLI 初始化 YAM3X core 时，会将简短的设计指南入口复制到 **src/components/yam3x/AGENTS.md**，前提是目标文件尚不存在。这样指南只作用于复制后的 YAM3X 组件目录，并引导 agent 阅读本指南和组件文档。应用根目录已有的 **AGENTS.md** 与此独立；目标路径已有文件时 CLI 会保留。需要整合时，可参考[分发的指南源文件](https://github.com/Celec7/yam3x/blob/main/registry/foundations/AGENTS.md)。初始化流程见[安装与首次使用](/zh/guide/installation)。

## 更多指南

- [组件目录](/zh/components/)：当前实现的 API、示例和组件样式接口。
- [Material 3 Expressive 设计基础](https://m3.material.io/)：官方设计源。本指南已直接链接相关排版、间距与布局页面。
