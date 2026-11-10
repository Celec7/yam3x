<script setup lang="ts">
import DividerHorizontalExample from '../../components/demos/DividerHorizontalExample.vue'
import DividerVerticalExample from '../../components/demos/DividerVerticalExample.vue'
</script>

# Divider

Divider 是分隔相关内容的非交互线条。仅当间距本身不足以清楚表达分组时使用。

Divider 是 M3 baseline 组件。项目导出 `HorizontalDivider` 和 `VerticalDivider`。两者默认以 outline variant 颜色绘制，并默认是装饰性的。将 `decorative` 设为 `false` 会暴露分隔器角色及其方向；这一按需语义属于项目扩展。

## 示例

### 水平分隔线

<div class="vp-raw yam3x-doc-demo-theme"><DividerHorizontalExample /></div>

演示对比了完整宽度、`inset`、`inset-start` 和 `inset-end` 线条，然后直接设置 `thickness` 和 `color`。内缩作用于线条，因此分隔器根元素保留完整宽度，线条从逻辑边缘收缩。数字 `thickness` 按 CSS 像素处理；字符串接受任意 CSS 长度。

::: details 查看演示源码

<<< ../../components/demos/DividerHorizontalExample.vue{vue}

:::

### 垂直分隔线

<div class="vp-raw yam3x-doc-demo-theme"><DividerVerticalExample /></div>

`VerticalDivider` 会拉伸到 flex 父容器的块尺寸，因此父容器需要有明确高度。演示设置 `decorative="false"`，在带标签的分组之间暴露 `role="separator"` 和 `aria-orientation="vertical"`。

::: details 查看演示源码

<<< ../../components/demos/DividerVerticalExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { HorizontalDivider, VerticalDivider } from './components/yam3x/divider'
</script>

<template>
  <section>
    <p>第一部分</p>
    <HorizontalDivider />
    <p>第二部分</p>
  </section>
  <div style="display: flex; block-size: 48px">
    <span>相关内容</span>
    <VerticalDivider :decorative="false" />
    <span>操作</span>
  </div>
</template>
```

分隔器本身不承载内容。将它放在要分隔的分组之间，或放在 flex 行中作为垂直线。不要用额外元素包裹它，否则父容器高度可能被接管。

需要在主题作用域中重复覆盖时，可设置 `--yam3x-divider-thickness`、`--yam3x-divider-color` 以及内缩属性。显式 `thickness` 或 `color` 属性优先于对应自定义属性。内缩属性不会改变根元素几何，只改变内部线条。

## 行为与无障碍

### 方向与尺寸

- `HorizontalDivider` 占满可用行内尺寸，默认粗细为 `1px`。
- `VerticalDivider` 占满可用块尺寸，默认宽度为 `1px`。它使用 `align-self: stretch`，因此父容器必须提供高度。
- 根元素保留测得的粗细作为高度或宽度，线条填充剩余的行内或块空间。
- 组件不会因内容而增长，并具有 `pointer-events: none`，因此无法获得焦点或接收指针输入。

### 语义

- 装饰性分隔器通过 `aria-hidden="true"` 对辅助技术隐藏，且没有角色。
- `decorative="false"` 会移除隐藏状态并暴露 `role="separator"`。垂直分隔器还会获得 `aria-orientation="vertical"`。
- 结构应优先通过有意义的标题和分组表达。只有视觉线条同时表示真实的辅助技术分隔时，才适合使用分隔器角色。

### 内缩与 RTL

- `inset` 在逻辑两侧应用相同内缩。`insetStart` 和 `insetEnd` 分别应用单侧，并可同时使用。
- 内缩是逻辑方向。在从右到左布局中，起始内缩移到右边缘，末尾内缩移到左边缘。
- 默认内缩为 `16px`，可通过下文的样式接口按侧调整。

### 强制颜色

在强制颜色模式下，线条使用系统 `GrayText` 颜色绘制，以便在系统画布上保持可见。

## API

### 导出

| 导出                | 类型 | 用途                                    |
| ------------------- | ---- | --------------------------------------- |
| `HorizontalDivider` | 组件 | 水平分隔线。                            |
| `VerticalDivider`   | 组件 | 用于有尺寸 flex 父容器的垂直分隔线。    |
| `DividerThickness`  | 类型 | `thickness` 接受的 `number \| string`。 |

### `HorizontalDivider` 属性

| 属性         | 类型               | 默认值            | 说明                                                 |
| ------------ | ------------------ | ----------------- | ---------------------------------------------------- |
| `thickness`  | `number \| string` | `1px`             | 线条粗细。数字按 CSS 像素处理；字符串接受 CSS 长度。 |
| `color`      | `string`           | `outline-variant` | 线条的 CSS 颜色。                                    |
| `inset`      | `boolean`          | `false`           | 在逻辑两侧应用默认内缩。                             |
| `insetStart` | `boolean`          | `false`           | 仅在逻辑起始侧应用默认内缩。                         |
| `insetEnd`   | `boolean`          | `false`           | 仅在逻辑末尾侧应用默认内缩。                         |
| `decorative` | `boolean`          | `true`            | 对辅助技术隐藏线条；设为 `false` 暴露分隔器语义。    |

### `VerticalDivider` 属性

| 属性         | 类型               | 默认值            | 说明                                                 |
| ------------ | ------------------ | ----------------- | ---------------------------------------------------- |
| `thickness`  | `number \| string` | `1px`             | 线条粗细。数字按 CSS 像素处理；字符串接受 CSS 长度。 |
| `color`      | `string`           | `outline-variant` | 线条的 CSS 颜色。                                    |
| `inset`      | `boolean`          | `false`           | 在逻辑两侧应用默认内缩。                             |
| `insetStart` | `boolean`          | `false`           | 仅在逻辑起始侧应用默认内缩。                         |
| `insetEnd`   | `boolean`          | `false`           | 仅在逻辑末尾侧应用默认内缩。                         |
| `decorative` | `boolean`          | `true`            | 对辅助技术隐藏线条；设为 `false` 暴露分隔器语义。    |

### 事件

两个组件都不发出事件。

### 插槽

两个组件都不渲染插槽内容。

### 方法

两个组件都不暴露实例方法。

## 样式

公开接口是设置在根元素上的项目自定义属性。显式 `thickness` 或 `color` 属性优先于对应属性。

| 属性                               | 默认值                   | 用途                          |
| ---------------------------------- | ------------------------ | ----------------------------- |
| `--yam3x-divider-thickness`        | `1px`                    | 未设置 `thickness` 时的线粗。 |
| `--yam3x-divider-color`            | System `outline-variant` | 未设置 `color` 时的线条颜色。 |
| `--yam3x-divider-inset-size`       | `16px`                   | 两侧使用的默认内缩。          |
| `--yam3x-divider-inset-start-size` | 继承默认内缩             | 逻辑起始侧内缩。              |
| `--yam3x-divider-inset-end-size`   | 继承默认内缩             | 逻辑末尾侧内缩。              |

## Material 参考

[Divider 概览](https://m3.material.io/components/divider/overview) · [指南](https://m3.material.io/components/divider/guidelines) · [规格](https://m3.material.io/components/divider/specs) · [无障碍](https://m3.material.io/components/divider/accessibility)
