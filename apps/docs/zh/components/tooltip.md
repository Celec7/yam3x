<script setup lang="ts">
import TooltipExample from '../../components/demos/TooltipExample.vue'
import TooltipInteractionExample from '../../components/demos/TooltipInteractionExample.vue'
</script>

# Tooltips

Tooltip 显示简短标签或消息。使用 tooltip 为按钮或其他界面元素补充上下文。

Tooltip 有两种变体：普通与富提示。`Tooltip` 是普通变体；`RichTooltip` 额外提供子标题、链接和最多两个文字按钮。

## 示例

### 普通与富提示

普通 tooltip 简要描述界面元素，最适合为没有文字的界面元素（如图标按钮和输入框）提供标签。富 tooltip 为界面元素提供更多上下文，可选包含子标题、按钮和超链接。

<div class="vp-raw yam3x-doc-demo-theme"><TooltipExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TooltipExample.vue{vue}

:::

### 延迟、禁用状态与 RTL

`showDelay` 控制悬停或键盘焦点打开前的等待时间。`disabled` 使 tooltip 保持关闭。`before` 与 `after` 位置会遵循目标的阅读方向。

<div class="vp-raw yam3x-doc-demo-theme"><TooltipInteractionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TooltipInteractionExample.vue{vue}

:::

## 在应用中导入

两个组件都需要 `for`，用于指向已有控件的 ID。从 `./components/yam3x/tooltip` 导入：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RichTooltip, Tooltip } from './components/yam3x/tooltip'

const open = ref(false)
</script>

<template>
  <button
    id="save"
    type="button"
    aria-label="保存"
  >
    保存
  </button>
  <Tooltip for="save">保存此文档</Tooltip>

  <button
    id="sharing"
    type="button"
  >
    共享
  </button>
  <RichTooltip
    v-model:open="open"
    for="sharing"
    aria-label="共享设置"
  >
    <template #subhead>新的共享设置</template>
    调整图片质量并管理共享相册的存储空间。
  </RichTooltip>
</template>
```

## 行为与无障碍

### 位置

- 默认情况下，普通 tooltip 直接位于父元素上方。如果元素位于应用栏中，普通 tooltip 会显示在元素下方，并保持相同距离。
- 如果有可见边界（例如按钮），距离为 4dp；如果没有可见边界（例如文字基线），距离为 8dp。可用 `offset` 以 CSS 像素固定该距离。
- 为避免超出屏幕，tooltip 位置会按 8dp 增量调整。`position` 只声明期望的方位，组件仍会翻转并避开视口边缘。Tooltip 不应遮住父元素。
- `before` 与 `after` 依据目标文字方向解析，因此在 RTL 中会镜像。
- 默认情况下，富 tooltip 在触屏优先设备上对齐父元素的右下侧，在精细指针桌面设备上居中显示于下方。`below-after` 等角落值可把 tooltip 对齐到目标的某一边。

### 交互与延迟

- 在桌面端悬停父元素，或在移动端长按元素即可显示 tooltip。持久富 tooltip 仅在点击或点按时出现。
- 临时的普通与富 tooltip 在指针离开目标区域 1.5 秒后消失。可用 `hideDelay` 调整该延迟，用 `showDelay` 延迟打开。
- 触发新的 tooltip 会立即关闭其他已打开的 tooltip。同一时间只显示一个 tooltip。
- 按 Escape 关闭已打开的 tooltip。
- 带操作的富 tooltip 会在悬停、键盘可见焦点或触屏长按时出现。打开时点击触发控件会将其固定，方便继续使用其中的链接和按钮。
- `persistent` 富 tooltip 仅通过点击或 `v-model:open` 打开，不响应悬停，并在用户操作其他元素后关闭。不要在图标按钮上使用持久富 tooltip。
- 应用可用 `v-model:open`、`show()` 和 `hide()` 直接控制显隐。

### 禁用

- `disabled` 阻止 tooltip 打开，并从目标的 `aria-describedby` 中移除其 ID。
- 当目标匹配 `:disabled` 或 `aria-disabled="true"` 时，tooltip 也不会打开。

### 无障碍关联

- 在启用且非交互状态下，组件会把自己的 ID 加入目标的 `aria-describedby`；禁用或富 tooltip 变为可交互后移除该条目。
- 普通 tooltip 表面使用 `role="tooltip"`。Tooltip 不可聚焦，也不会困住焦点。
- 富 tooltip 容器不应遮挡重要信息或阻止用户完成操作。避免把屏幕阅读器和键盘焦点困在富 tooltip 内。
- 富 tooltip 内包含链接或按钮时，表面切换为 `role="dialog"`，目标获得 `aria-haspopup="dialog"`、`aria-expanded` 和 `aria-controls`。表面由 `#subhead` 命名；没有子标题时使用 `ariaLabel`，正文作为其描述。
- 焦点在目标之后按页面顺序进入 tooltip。操作按钮应包在 `RichTooltipAction` 内；激活后关闭 tooltip 并把焦点交还目标，除非设置了 `disableRestoreFocus`。

### 内容指引

- 普通 tooltip 简要描述界面元素。避免文字换行或包含过多信息；内容超过视口安全高度时可以滚动查看，不会被裁切。
- 富 tooltip 的子标题应简短，理想情况为一行。最多使用两个文字按钮，并尽量并排，不要把关键信息只放在 tooltip 中。

## API

### 导出

`Tooltip`、`RichTooltip`、`RichTooltipAction`，以及 `TooltipPosition`、`RichTooltipPosition`、`TooltipTouchGestures` 类型。

### `Tooltip`

| 属性            | 类型                                        | 默认值                                      | 说明                                                 |
| --------------- | ------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `for`           | `string`                                    | 必填                                        | Tooltip 所描述控件的 ID。                            |
| `id`            | `string`                                    | 自动生成 `yam3x-tooltip-*`                  | Tooltip 表面 ID，同时写入目标的 `aria-describedby`。 |
| `position`      | `'above' \| 'below' \| 'before' \| 'after'` | `above`；目标位于应用栏或页眉时使用 `below` | 期望的方位。                                         |
| `showDelay`     | `number`                                    | `0`                                         | 悬停或键盘聚焦打开前的毫秒数。                       |
| `hideDelay`     | `number`                                    | `1500`                                      | 指针或焦点离开后关闭前的毫秒数。                     |
| `offset`        | `number`                                    | 未设置时：有可见边界的控件 4px，其余 8px    | 目标与 tooltip 之间的像素距离。                      |
| `disabled`      | `boolean`                                   | `false`                                     | 阻止打开，并移除 `aria-describedby` 条目。           |
| `touchGestures` | `'auto' \| 'on' \| 'off'`                   | `'auto'`                                    | 触屏长按行为，见下方说明。                           |
| `open`          | `v-model:open: boolean`                     | `false`                                     | 显隐状态。                                           |

`touchGestures` 取值：

| 值       | 行为                                                                  |
| -------- | --------------------------------------------------------------------- |
| `'auto'` | 触屏长按 500ms 后打开临时 tooltip；目标保留默认的文字选择与点按样式。 |
| `'on'`   | 同样支持长按，并在关联期间关闭目标的文字选择、拖拽和点按高亮。        |
| `'off'`  | 长按不会打开 tooltip；指针悬停与键盘焦点仍可打开，点击仍会激活目标。  |

### `RichTooltip`

| 属性            | 类型                                                                                                              | 默认值                                               | 说明                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `for`           | `string`                                                                                                          | 必填                                                 | Tooltip 所描述控件的 ID。                       |
| `id`            | `string`                                                                                                          | 自动生成 `yam3x-rich-tooltip-*`                      | Tooltip 表面 ID。                               |
| `position`      | `'above' \| 'below' \| 'before' \| 'after' \| 'above-before' \| 'above-after' \| 'below-before' \| 'below-after'` | 精细指针设备为 `below`；触屏优先设备为 `below-after` | 期望的方位，支持角落对齐。                      |
| `showDelay`     | `number`                                                                                                          | `0`                                                  | 悬停或键盘聚焦打开前的毫秒数。                  |
| `hideDelay`     | `number`                                                                                                          | `1500`                                               | 指针或焦点离开后关闭前的毫秒数。                |
| `offset`        | `number`                                                                                                          | `8`                                                  | 目标与 tooltip 之间的像素距离。                 |
| `disabled`      | `boolean`                                                                                                         | `false`                                              | 阻止打开，并移除 `aria-describedby` 条目。      |
| `persistent`    | `boolean`                                                                                                         | `false`                                              | 保持打开，直到用户操作其他元素。                |
| `ariaLabel`     | `string`                                                                                                          | —                                                    | 没有 `#subhead` 的可交互 tooltip 的可访问名称。 |
| `touchGestures` | `'auto' \| 'on' \| 'off'`                                                                                         | `'auto'`                                             | 触屏长按行为。                                  |
| `open`          | `v-model:open: boolean`                                                                                           | `false`                                              | 显隐状态。                                      |

### `RichTooltipAction`

| 属性                  | 类型      | 默认值  | 说明                                         |
| --------------------- | --------- | ------- | -------------------------------------------- |
| `disableRestoreFocus` | `boolean` | `false` | 关闭后不把焦点交还目标，而是保持在当前位置。 |

### 事件

| 事件           | 载荷             | 说明                                                  |
| -------------- | ---------------- | ----------------------------------------------------- |
| `beforetoggle` | `(event: Event)` | Tooltip 打开或关闭前触发；`preventDefault()` 可取消。 |
| `toggle`       | `(event: Event)` | Tooltip 打开或关闭后触发。                            |

两个组件发出相同的事件。

### 插槽

| 组件                | 插槽      | 说明                                       |
| ------------------- | --------- | ------------------------------------------ |
| `Tooltip`           | 默认插槽  | 正文文字。                                 |
| `RichTooltip`       | 默认插槽  | 正文内容；包含链接和按钮时变为可交互。     |
| `RichTooltip`       | `subhead` | 可选的一行子标题。                         |
| `RichTooltip`       | `actions` | 操作区，最多放置两个 `RichTooltipAction`。 |
| `RichTooltipAction` | 默认插槽  | 按钮或链接内容；激活后会关闭 tooltip。     |

### 方法

| 方法     | 说明           |
| -------- | -------------- |
| `show()` | 打开 tooltip。 |
| `hide()` | 关闭 tooltip。 |

两个组件都暴露这两个方法。

## 样式

Tooltip 样式通过组件自有 token 映射 Material 角色与文字样式。以下属性是支持的消费者覆盖项；可将它们设置在 tooltip 组件或其主题作用域内的祖先元素上。这些是项目扩展点，不是 Material token 名称。

::: details 样式属性

| 属性                                         | 作用对象       | 默认值                      |
| -------------------------------------------- | -------------- | --------------------------- |
| `--yam3x-tooltip-container-color`            | 普通提示容器   | System `inverse-surface`    |
| `--yam3x-tooltip-supporting-text-color`      | 普通提示正文   | System `inverse-on-surface` |
| `--yam3x-tooltip-shape`                      | 普通提示容器   | System `corner-extra-small` |
| `--yam3x-tooltip-max-width`                  | 普通提示容器   | 200px，受视口宽度限制       |
| `--yam3x-rich-tooltip-container-color`       | 富提示容器     | System `surface-container`  |
| `--yam3x-rich-tooltip-supporting-text-color` | 富提示正文     | System `on-surface-variant` |
| `--yam3x-rich-tooltip-subhead-color`         | 富提示子标题   | System `on-surface-variant` |
| `--yam3x-rich-tooltip-shape`                 | 富提示容器     | System `corner-medium`      |
| `--yam3x-rich-tooltip-elevation`             | 富提示容器阴影 | System elevation level 3    |
| `--yam3x-rich-tooltip-max-width`             | 富提示容器     | 320px，受视口宽度限制       |

:::

普通提示的文字与几何尺寸、富提示的文字与间距，以及动效，都通过组件映射使用 System token。

## Material 参考

[Tooltips 概览](https://m3.material.io/components/tooltips/overview) · [指南](https://m3.material.io/components/tooltips/guidelines) · [规格](https://m3.material.io/components/tooltips/specs) · [无障碍](https://m3.material.io/components/tooltips/accessibility)
