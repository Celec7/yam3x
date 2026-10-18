<script setup>
import BottomSheetExample from '../../components/demos/BottomSheetExample.vue'
</script>

# Bottom sheets

Bottom sheet 从屏幕边缘呈现辅助内容或操作。Standard sheet 与主界面并存；modal sheet 会暂时阻止与背景交互。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><BottomSheetExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BottomSheetExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BottomSheet, BottomSheetAction } from './components/yam3x/bottom-sheet'

const open = ref(false)
</script>

<template>
  <button
    type="button"
    @click="open = true"
  >
    打开选项
  </button>
  <BottomSheet
    v-model:open="open"
    variant="modal"
    label="更多选项"
  >
    <template #header>更多选项</template>
    <p>选择所需操作。</p>
    <BottomSheetAction>完成</BottomSheetAction>
  </BottomSheet>
</template>
```

## API

该组件 的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

| 属性            | 类型                                | 默认值                                                                | 说明                                                                                                                      |
| --------------- | ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variant`       | `'standard' \| 'modal'`             | `'standard'`                                                          | 标准 sheet 与页面并存；模态 sheet 管理焦点并遮罩背景。Material 指引将模态 sheet 用于移动应用。                            |
| `open`          | `v-model:open: boolean`             | `false`                                                               | 控制显示状态。                                                                                                            |
| `detent`        | `v-model:detent: BottomSheetDetent` | 标准 `fit`，模态 `partially-expanded`                                 | 当前停靠高度，必须包含在 `detents` 中。可用值：`collapsed`、`fit`、`partially-expanded`、`expanded`、百分比、像素或数字。 |
| `detents`       | `BottomSheetDetent[]`               | 标准 `['fit', 'expanded']`；模态 `['partially-expanded', 'expanded']` | 按高度从低到高排列的停靠点。模态默认在视口高度不超过一半的最高停靠点打开。                                                |
| `hideable`      | `boolean`                           | `false`                                                               | 是否允许标准 sheet 通过向下手势或手柄操作隐藏；模态 sheet 仍可通过向下滑动关闭。                                          |
| `handle`        | `boolean`                           | `false`                                                               | 显示可拖动且可通过键盘激活的调整手柄。                                                                                    |
| `label`         | `string`                            | —                                                                     | sheet 的可访问名称；未提供时使用 `header` 标题。                                                                          |
| `closeLabel`    | `string`                            | 本地化默认值                                                          | 关闭按钮的可访问名称；标准 sheet 在各高度都提供明确的关闭按钮。                                                           |
| `collapseLabel` | `string`                            | 本地化默认值                                                          | 标准 sheet 展开时回到较低停靠点的操作名称。                                                                               |
| `maxWidth`      | `string`                            | `640px`                                                               | 自定义最大宽度。                                                                                                          |

默认 slot 放正文，`trigger` slot 接收 `triggerProps` 和 `activate`，`header` slot 放标题，`handle` slot 替换手柄图形。多停靠点且没有拖动手柄时，默认 Resize 按钮提供单指替代操作；`resize-control` slot 可替换该按钮。有拖动手柄时，手柄本身支持拖动和单指切换停靠点。标准 sheet 始终提供标注明确的关闭按钮；展开时另有独立的收起操作。`BottomSheetAction` 是激活后请求关闭的原生按钮。

## 行为与无障碍

关闭时会保留当前停靠点，再次打开时恢复。受控的 `detent` 值优先，包括 modal 首次打开时。生命周期事件包括 `opening`、`opened`、`closing`、`closed`、`cancel`。`opening`、`closing`、`cancel` 的 `preventDefault()` 只会取消组件内部发起的请求；父级直接更新 `v-model:open` 时以父级状态为准，事件不能撤销。数字停靠点按 CSS px 解释。`collapsed`、`fit`、百分比、像素和数字停靠点属于项目扩展。

## 样式

以下项目覆盖属性可设置在 sheet 或 scrim 元素上。运行时停靠高度和 `maxWidth` 属性由组件内部管理。

| 属性                                                | 默认值                                         | 说明                                              |
| --------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| `--yam3x-bottom-sheet-container-color`              | System `surface-container-low`                 | sheet 容器颜色。                                  |
| `--yam3x-bottom-sheet-color`                        | System `on-surface`                            | sheet 内容颜色。                                  |
| `--yam3x-bottom-sheet-container-shape`              | System extra-large 圆角                        | sheet 顶部圆角。                                  |
| `--yam3x-bottom-sheet-minimized-container-shape`    | `0`                                            | sheet 关闭时的顶部圆角。                          |
| `--yam3x-bottom-sheet-expanded-container-shape`     | 容器 shape                                     | sheet 展开停靠点的顶部圆角。                      |
| `--yam3x-bottom-sheet-elevation`                    | System elevation level 1                       | sheet 阴影。                                      |
| `--yam3x-bottom-sheet-expanded-elevation`           | sheet elevation                                | sheet 展开时的阴影。                              |
| `--yam3x-bottom-sheet-modal-elevation`              | sheet elevation                                | modal sheet 未完全展开时的阴影。                  |
| `--yam3x-bottom-sheet-z-index`                      | modal 为 `61`；standard 为 `30`                | sheet 的堆叠顺序。                                |
| `--yam3x-bottom-sheet-width`                        | 可用宽度                                       | `max-width` 前应用的可选宽度上限。                |
| `--yam3x-bottom-sheet-max-width`                    | `640px`                                        | CSS 最大宽度；`maxWidth` 属性还可施加第二个上限。 |
| `--yam3x-bottom-sheet-top-space`                    | `56px`                                         | 宽视口下 sheet 顶部保留的空间。                   |
| `--yam3x-bottom-sheet-compact-top-space`            | `72px`                                         | 宽度不超过 640px 时 sheet 顶部保留的空间。        |
| `--yam3x-bottom-sheet-peek-height`                  | `96px`                                         | 项目 `collapsed` 停靠点使用的高度。               |
| `--yam3x-bottom-sheet-padding-inline`               | `24px` × System density scale                  | 标题和内容区的行内间距。                          |
| `--yam3x-bottom-sheet-padding-block`                | 标题 `8px`；内容 `24px` × System density scale | 标题和内容区的块间距。                            |
| `--yam3x-bottom-sheet-header-font-size`             | `24px`                                         | 项目标题字号。                                    |
| `--yam3x-bottom-sheet-header-font-weight`           | `400`                                          | 项目标题字重。                                    |
| `--yam3x-bottom-sheet-header-line-height`           | `32px` × System line-height scale              | 项目标题行高。                                    |
| `--yam3x-bottom-sheet-header-tracking`              | `0`                                            | 项目标题字间距。                                  |
| `--yam3x-bottom-sheet-content-font-size`            | `16px`                                         | 内容字号。                                        |
| `--yam3x-bottom-sheet-content-font-weight`          | `400`                                          | 内容字重。                                        |
| `--yam3x-bottom-sheet-content-line-height`          | `24px` × System line-height scale              | 内容行高。                                        |
| `--yam3x-bottom-sheet-content-tracking`             | `0.5px`                                        | 内容字间距。                                      |
| `--yam3x-bottom-sheet-drag-handle-container-height` | `48px`                                         | 可选拖动手柄预留的高度。                          |
| `--yam3x-bottom-sheet-handle-width`                 | `32px`                                         | 拖动手柄宽度。                                    |
| `--yam3x-bottom-sheet-handle-height`                | `4px`                                          | 拖动手柄高度。                                    |
| `--yam3x-bottom-sheet-handle-shape`                 | `999px`                                        | 拖动手柄圆角。                                    |
| `--yam3x-bottom-sheet-handle-color`                 | System `on-surface-variant`                    | 拖动手柄颜色。                                    |
| `--yam3x-bottom-sheet-handle-focus-ring-offset`     | `2px`                                          | 手柄和 sheet 控件焦点轮廓的偏移。                 |
| `--yam3x-bottom-sheet-scrim-color`                  | System `scrim`                                 | modal scrim 颜色。                                |
| `--yam3x-bottom-sheet-scrim-opacity`                | 共享 overlay 默认值（`32%`）                   | modal scrim 不透明度；共享默认值是项目决策。      |

Material 定义组件角色与尺寸；这些 CSS 属性名和覆盖行为属于项目 API。

## Material 参考

[Bottom sheets 概览](https://m3.material.io/components/bottom-sheets/overview) · [指南](https://m3.material.io/components/bottom-sheets/guidelines) · [规格](https://m3.material.io/components/bottom-sheets/specs) · [无障碍](https://m3.material.io/components/bottom-sheets/accessibility)
