<script setup lang="ts">
import LoadingIndicatorExample from '../../components/demos/LoadingIndicatorExample.vue'
import LoadingIndicatorSizesExample from '../../components/demos/LoadingIndicatorSizesExample.vue'
</script>

# Loading indicator

Loading indicator 表示操作仍在进行，但无法确定完成进度。可用于等待状态，并尽可能保留周围内容的可用性。

Loading indicator 是 Material 3 Expressive 组件。项目渲染一个不确定的 `progressbar`，使用 Expressive 形状变形动画；通过 CLI 复制的源码提供与其他组件相同的公开样式接口。它适合预计较短的等待；当任务能够报告数值时，应改用[进度指示器](/zh/components/progress-indicator)。

## 示例

### 基础与容器形态

<div class="vp-raw yam3x-doc-demo-theme"><LoadingIndicatorExample /></div>

指示器默认无容器。控件可切换到 `contained`，增加 primary-container 表面和匹配的 on-primary-container 活动形状。无障碍名称描述任务，而不是动画。

::: details 查看演示源码

<<< ../../components/demos/LoadingIndicatorExample.vue{vue}

:::

### 尺寸、颜色接口与状态文本

<div class="vp-raw yam3x-doc-demo-theme"><LoadingIndicatorSizesExample /></div>

画廊保留默认 `48px` 占位，并通过 `--yam3x-loading-indicator-container-size` 对比更小和更大的尺寸。颜色示例覆盖活动形状，容器示例同时修改容器和前景色。状态示例将 progressbar 与列表区域的可见等待文字搭配。

::: details 查看演示源码

<<< ../../components/demos/LoadingIndicatorSizesExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LoadingIndicator } from './components/yam3x/loading-indicator'

const loading = ref(true)
</script>

<template>
  <section aria-busy="true">
    <LoadingIndicator
      v-if="loading"
      aria-label="正在加载文章"
    />
    <p>下一批内容加载时，现有文章仍可阅读。</p>
  </section>
</template>
```

始终提供 `aria-label` 或 `aria-labelledby`。组件会将其他属性透传到根元素。它本身没有可见文字，因此无障碍名称是随 progressbar 一起播报的唯一任务描述。

::: details 容器颜色与减少动态效果

```vue
<template>
  <LoadingIndicator
    variant="contained"
    aria-label="正在加载预览"
    style="
      --yam3x-loading-indicator-container-size: 64px;
      --yam3x-loading-indicator-contained-container-color: var(--md-sys-color-tertiary-container);
      --yam3x-loading-indicator-contained-active-indicator-color: var(--md-sys-color-on-tertiary-container);
    "
  />
</template>
```

应同时修改容器和前景颜色，确保活动形状保持至少 3:1 对比度。启用 `prefers-reduced-motion: reduce` 时，两个动画都会停止，活动形状停留在首个 soft-burst 形态。

:::

## 行为与无障碍

### 语义

- 根元素具有 `role="progressbar"`、`aria-valuemin="0"` 和 `aria-valuemax="100"`。
- 组件从不设置 `aria-valuenow`，因此状态是不确定的。
- 动画容器和活动形状对辅助技术隐藏。
- 指示器是被动的：没有焦点目标、没有点击处理，并使用 `pointer-events: none`。
- Loading indicator 不是实时区域。任务开始或结束时，如需播报等待状态变化，应使用邻近文字或单独的状态元素。

### 动画与减少动态效果

活动形状在七种 Material Shape Library 形态之间变形，同时外层容器旋转。周期为 4666ms。启用减少动态效果后，两个 CSS 动画都会被移除，形状保持静态。强制颜色模式下，活动形状使用 `CanvasText` 绘制；有容器时还会增加带 `GrayText` 轮廓的 `Canvas` 表面。

### 放置与尺寸

默认占位为 `48px` 正方形，活动形状约为 `38px`。Material 建议整体尺寸在 24 到 240 dp 之间，默认 48 dp。更大尺寸需要周围空间足以支撑。CSS 接口不会把值限制在该范围内。

将指示器放在它所描述的区域中，并在操作不阻塞时保留受影响内容。用于下拉刷新时，还应提供不依赖手势的刷新操作。

### 组件选择

短时等待且进度未知时使用加载指示器。Material 推荐用它代替不确定态圆形进度指示器。当流程可能转为确定进度或需要显示数值时，应使用进度指示器。

## API

### 导出

| 导出               | 类型 | 用途                         |
| ------------------ | ---- | ---------------------------- |
| `LoadingIndicator` | 组件 | 带形状动画的不确定加载进度。 |

### 属性

| 属性      | 类型                           | 默认值          | 说明                                                     |
| --------- | ------------------------------ | --------------- | -------------------------------------------------------- |
| `variant` | `'uncontained' \| 'contained'` | `'uncontained'` | `uncontained` 直接在表面绘制；`contained` 增加有色容器。 |

原生和 ARIA 属性（包括 `aria-label` 与 `aria-labelledby`）会透传到根元素。

### 事件

LoadingIndicator 不发出事件。

### 插槽

LoadingIndicator 不渲染插槽内容。

### 方法

LoadingIndicator 不暴露实例方法。

## 样式

以下项目自定义属性设置在根元素上。默认值映射到 Material 组件要求和 System token。组件不会把占位或活动形状限制在建议范围内。

| 范围     | 属性                                                         | 默认值                                | 用途                                |
| -------- | ------------------------------------------------------------ | ------------------------------------- | ----------------------------------- |
| 两种形式 | `--yam3x-loading-indicator-container-size`                   | `48px`                                | 整体正方形占位尺寸。                |
| 两种形式 | `--yam3x-loading-indicator-container-shape`                  | `--md-sys-shape-corner-full`          | 可选容器的形状。                    |
| 两种形式 | `--yam3x-loading-indicator-active-indicator-size`            | `calc(container size × 0.79166667)`   | 活动形状尺寸；默认占位下为 `38px`。 |
| 无容器   | `--yam3x-loading-indicator-active-indicator-color`           | `--md-sys-color-primary`              | 表面上的活动形状颜色。              |
| 有容器   | `--yam3x-loading-indicator-contained-container-color`        | `--md-sys-color-primary-container`    | 可选容器背景色。                    |
| 有容器   | `--yam3x-loading-indicator-contained-active-indicator-color` | `--md-sys-color-on-primary-container` | 容器背景上的活动形状颜色。          |

这些 CSS 属性名是项目接口，不是 Material token 名称。应搭配修改有容器形式的两个颜色，确保活动形状保持足够对比度。

## Material 参考

[Loading indicator 概览](https://m3.material.io/components/loading-indicator/overview) · [指南](https://m3.material.io/components/loading-indicator/guidelines) · [规格](https://m3.material.io/components/loading-indicator/specs) · [无障碍](https://m3.material.io/components/loading-indicator/accessibility)
