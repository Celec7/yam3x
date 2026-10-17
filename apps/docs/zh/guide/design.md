# 设计基础

Material 3 Expressive 涉及颜色、排版、形状、动效和组件状态。本项目目前提供动态主题、基础样式、手势工具和一组 Vue 组件。应用可以按自己的内容与操作需求组合这些能力；设计规范见 [Material 3](https://m3.material.io/)。

| 想做什么                                 | 从哪里开始                        | Material 规范                                                                                                                                                                                  |
| ---------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 从品牌色生成明暗主题、调整对比度         | [颜色与主题](/zh/guide/theme)     | [颜色](https://m3.material.io/styles/color/overview)                                                                                                                                           |
| 使用 Roboto 字体角色并建立清楚的文字层级 | [Heading](/zh/components/heading) | [排版](https://m3.material.io/styles/typography/overview)、[字阶与 token](https://m3.material.io/styles/typography/type-scale-tokens) 和[字体](https://m3.material.io/styles/typography/fonts) |
| 选用尺寸、形状和操作层级                 | [组件目录](/zh/components/)       | [组件](https://m3.material.io/components)                                                                                                                                                      |
| 配置动效并照顾减少动态效果的偏好         | [颜色与主题](/zh/guide/theme)     | [动效](https://m3.material.io/styles/motion/overview)                                                                                                                                          |
| 实现拖动、长按等指针交互                 | [手势与交互](/zh/guide/gestures)  | [设计基础](https://m3.material.io/foundations/)                                                                                                                                                |

组件页列出实际 API、交互示例和使用限制。仓库 `docs/specs/` 记录实现目标与平台差异。

共享字阶包含 baseline 和 emphasized 角色。默认使用 baseline；仅在需要表达选择层级或状态时使用 emphasized。请为本地化内容添加 `lang`，让排版 token 和组件行高按脚本需求调整。默认高度类别是 medium；可在子树上设置 `data-md-language-height="small|medium|large|extra-large"` 覆盖。固定高度组件可能需要为较高脚本预留额外纵向空间。
