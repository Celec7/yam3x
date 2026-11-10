<script setup lang="ts">
import ShapeExample from '../../components/demos/ShapeExample.vue'
</script>

# Shape

Shape 用于呈现 Material Shape Library 中的装饰形状。可用它柔化或强调媒体、插画和容器表面；不要用它承载状态，也不要替代图标的含义。

Shape 是项目扩展。它沿用 Material Shape Library 的 35 个名称，但 Material 并未发布独立的 Shape 组件。在 Compose Material 3 中，最接近的参考是带形状形变的 `MaterialShapes`，通过裁切应用；本项目改为提供归一化的 120 点多边形和 CSS `clip-path` 过渡。几何归一化与形变过渡属于项目决策。

## 示例

### 基础画廊与形变

<div class="vp-raw yam3x-doc-demo-theme"><ShapeExample /></div>

第一行展示基础形状、较大的媒体遮罩以及填充色变化。选择器下方的两个 `Shape` 会预览任意形变：为任一侧选择不同形状后，裁切路径会插值过渡。完整画廊列出所有可用名称，每项默认是 `48px` 正方形。

::: details 查看演示源码

<<< ../../components/demos/ShapeExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { Shape } from './components/yam3x/shape'
</script>

<template>
  <Shape
    name="sunny"
    aria-hidden="true"
  />
  <Shape
    name="pill"
    aria-hidden="true"
    style="--yam3x-shape-size: 96px; --yam3x-shape-container-color: var(--md-sys-color-tertiary-container)"
  >
    <img
      src="/avatar-example.svg"
      alt=""
    />
  </Shape>
</template>
```

将形状放在装饰性表面或媒体周围。插槽内容会被所选多边形裁切；图片和视频以 `object-fit: cover` 填满正方形。未设置 `name` 时，Shape 不绘制裁切和容器背景，可作为普通包装层。

::: details 名称与媒体内容

```vue
<script setup lang="ts">
import { Shape, shapeNames } from './components/yam3x/shape'
</script>

<template>
  <Shape
    v-for="name in shapeNames"
    :key="name"
    :name="name"
    aria-hidden="true"
  />
  <Shape
    name="arch"
    :style="{ '--yam3x-shape-size': '160px' }"
  >
    <video
      src="/clip.mp4"
      muted
      loop
      playsinline
      aria-hidden="true"
    />
  </Shape>
</template>
```

`shapeNames` 是 35 个有效名称的运行时列表。传入未知字符串会回退到不裁切形式，而不会抛出错误。

:::

## 行为与无障碍

### 渲染与几何

- 根元素是行内块正方形。`--yam3x-shape-size` 同时控制宽高，默认 `48px`。
- 有效 `name` 会设置 `data-name`，通过 `clip-path` 应用多边形，并在插槽内容后绘制容器颜色。
- 省略 `name` 或传入未知值时，不绘制裁切和背景，插槽内容保持未裁切。
- 插槽中的 `img` 和 `video` 会绝对定位、填满形状，并使用 `object-fit: cover`。
- 形状变化会对 `clip-path` 过渡。默认过渡使用 System `spring-slow-spatial`。
- 包装层使用 `overflow: hidden` 和隔离，裁切内容不会绘制到形状之外。
- 元素遵循原生 `hidden` 属性。

### 无障碍

- Shape 不设置角色、标签或隐藏状态。装饰性实例应设置 `aria-hidden="true"`。
- 裁切内容传达信息时，应通过图片 `alt` 或邻近文字提供文本替代。不要依赖多边形名称表达含义。
- 组件不可聚焦，也不增加交互。
- 启用 `prefers-reduced-motion: reduce` 时，形变过渡会被移除。
- 强制颜色模式下，命名形状使用 `CanvasText` 绘制容器，以保持形状可见。

## API

### 导出

| 导出         | 类型 | 用途                            |
| ------------ | ---- | ------------------------------- |
| `Shape`      | 组件 | 裁切的装饰表面或媒体遮罩。      |
| `shapeNames` | 值   | 35 个有效形状名称的运行时数组。 |
| `ShapeName`  | 类型 | `name` 接受的名称联合类型。     |

### 属性

| 属性   | 类型                | 默认值 | 说明                                          |
| ------ | ------------------- | ------ | --------------------------------------------- |
| `name` | `ShapeName \| null` | `null` | 命名多边形；`null` 或未知运行时值会禁用裁切。 |

原生 HTML 和 ARIA 属性会透传到根元素。

### 事件

Shape 不发出事件。

### 插槽

| 插槽    | 作用域 | 用途                   |
| ------- | ------ | ---------------------- |
| default | —      | 被所选形状裁切的内容。 |

### 方法

Shape 不暴露实例方法。

::: details 形状名称

`4-leaf-clover`、`4-sided-cookie`、`6-sided-cookie`、`7-sided-cookie`、`8-leaf-clover`、`9-sided-cookie`、`12-sided-cookie`、`arch`、`arrow`、`boom`、`bun`、`burst`、`circle`、`diamond`、`fan`、`flower`、`gem`、`ghost-ish`、`heart`、`hexagon`、`oval`、`pentagon`、`pill`、`pixel-circle`、`pixel-triangle`、`puffy`、`puffy-diamond`、`semicircle`、`slanted`、`soft-boom`、`soft-burst`、`square`、`sunny`、`triangle`、`very-sunny`。

名称与 Material Shape Library 一致。120 点归一化几何不是 Material token；它是为 CSS 裁切与插值适配的项目几何。

:::

## 样式

以下项目接口设置在 Shape 根元素上。System 主题仍提供填充角色和动效 token 默认值。

| 属性                            | 默认值                                               | 用途                   |
| ------------------------------- | ---------------------------------------------------- | ---------------------- |
| `--yam3x-shape-size`            | `48px`                                               | 正方形宽高。           |
| `--yam3x-shape-container-color` | System `primary`                                     | 裁切内容背后的填充色。 |
| `--yam3x-shape-transition`      | `clip-path var(--md-sys-motion-spring-slow-spatial)` | 形状变化时使用的过渡。 |

Material 圆角 token 用于组件圆角，与装饰形状库没有映射关系。仅在装饰性实例上使用这些接口，并确保视觉结果符合意图。

## Material 参考

[形状原则](https://m3.material.io/styles/shape/overview-principles) · [Shape morph](https://m3.material.io/styles/shape/shape-morph) · [圆角比例](https://m3.material.io/styles/shape/corner-radius-scale)
