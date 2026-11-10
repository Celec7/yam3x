# 布局与自适应结构

根据任务以及内容之间的关系选择页面结构，并随着窗口变化有意识地调整布局。

## 根据内容和任务选择布局

根据任务以及内容之间的关系选择页面结构：

- 用 Feed 网格呈现大量同级内容，例如供人快速浏览的卡片。
- 用 List-detail 让人从集合中选中一项，再查看详情，适合父子内容关系。
- 当次要内容只有结合主要内容才有意义时，使用 Supporting pane，例如属性、评论、课程或工具。

Material 的[经典布局示例](https://m3.material.io/foundations/layout/canonical-examples/overview)展示了这些模式在 compact、medium、expanded 尺寸下的适配：[Feed](https://m3.material.io/foundations/layout/canonical-examples/feed)、[List-detail](https://m3.material.io/foundations/layout/canonical-examples/list-detail)和[Supporting pane](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane)。以这些示例为起点，再根据内容和任务调整。

自适应设计可以随着窗口尺寸变化、用户导航以及设备和输入场景不同，改变布局结构、组件位置或行为。根据任务采用缩放、重排、按需显示或隐藏内容、改变呈现方式等策略；不要只把同一套界面整体缩小。选择能维持内容关系与窗格可用性的阈值。设计时同时考虑触控、指针和键盘输入；视觉排列变化后，保持阅读顺序与焦点顺序合理。参阅[自适应设计](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)、[布局概览](https://m3.material.io/foundations/layout/layout-overview/overview)和[RTL 双向布局](https://m3.material.io/foundations/layout/bidirectionality-rtl)。

Material 的 Supporting pane 示例在 compact 和 medium 尺寸下将辅助内容放在主要区域下方，在 expanded 尺寸下将其放在主要区域旁边。YAM3X SplitPane 是基于此模式的项目扩展。其[组件页](/zh/components/split-pane)说明项目定义的紧凑行为；路由仍由应用负责。


## Material 参考

[布局概览](https://m3.material.io/foundations/layout/layout-overview/overview) · [经典布局](https://m3.material.io/foundations/layout/canonical-examples/overview) · [自适应设计](https://m3.material.io/foundations/layout/layout-overview/adaptive-design) · [双向布局与 RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl)
