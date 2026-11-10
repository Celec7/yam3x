# 基础

YAM3X 提供主题基础和 Vue 组件。页面层级、内容布局、自适应行为和产品专属样式仍由应用负责。本指南把 Material 3 Expressive 规范提炼为应用开发者和 agent 可执行的选择方法。官方链接提供设计依据，YAM3X 组件页说明当前实现的 API 和样式接口。

## 选择基础主题

- [布局与自适应结构](/zh/guide/foundations/layout)：Feed、List-detail、Supporting pane 与自适应行为。
- [排版](/zh/guide/foundations/typography)：文字角色、标题语义、Web 排版与语言高度。
- [颜色与主题](/zh/guide/foundations/color)：动态颜色、主题令牌与应用样式。
- [间距与密度](/zh/guide/foundations/spacing)：间距归属、应用布局间距与密度。
- [手势与交互](/zh/guide/foundations/gestures)：指针识别器与指针能力标志。

## 通过公开接口组合组件

选择符合任务的组件，并使用其组件页文档说明的 props 和 slots。只有组件页列出的 CSS 自定义属性才用于组件样式调整。页面结构、边距和布局规则放在应用自有容器上。宽泛选择器和固定尺寸覆盖可能绕过组件状态、文字缩放和内容适配。

主题角色与密度配置见[颜色与主题](/zh/guide/foundations/color)。指针输入与动效见[手势与交互](/zh/guide/foundations/gestures)和 Material 的[动效规范](https://m3.material.io/styles/motion/overview)。

## 消费项目中的 Agent 指南

CLI 初始化 YAM3X core 时，会将简短的设计指南入口复制到 **src/components/yam3x/AGENTS.md**，前提是目标文件尚不存在。这样指南只作用于复制后的 YAM3X 组件目录，并引导 agent 阅读本指南和组件文档。应用根目录已有的 **AGENTS.md** 与此独立；目标路径已有文件时 CLI 会保留。需要整合时，可参考[分发的指南源文件](https://github.com/Celec7/yam3x/blob/main/registry/foundations/AGENTS.md)。初始化流程见[安装与首次使用](/zh/guide/start/installation)。

## 更多指南

- [组件目录](/zh/components/)：当前实现的 API、示例和组件样式接口。
- [Material 3 Expressive 设计基础](https://m3.material.io/)：官方设计源。本指南已直接链接相关排版、间距与布局页面。

