<script setup lang="ts">
import ProgressIndicatorExample from '../../components/demos/ProgressIndicatorExample.vue'
</script>

# Progress indicators

Progress indicator 用于显示进行中任务的状态。有可用且有意义的进度值时使用 determinate 状态，否则使用 indeterminate 状态。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><ProgressIndicatorExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ProgressIndicatorExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import LinearProgressIndicator from './components/yam3x/progress-indicator/linear-progress-indicator.vue'
import CircularProgressIndicator from './components/yam3x/progress-indicator/circular-progress-indicator.vue'
</script>

<template>
  <LinearProgressIndicator
    :value="60"
    aria-label="上传文件"
  />
  <CircularProgressIndicator
    :value="60"
    aria-label="准备预览"
  />
</template>
```

## API

| 组件                        | 属性            | 默认值        | 说明                                                                    |
| --------------------------- | --------------- | ------------- | ----------------------------------------------------------------------- |
| `LinearProgressIndicator`   | `value`, `max`  | `0`, `100`    | 已完成和最大进度；视觉值限制在有效范围内。                              |
| `LinearProgressIndicator`   | `bufferValue`   | `0`           | 缓冲范围的末端值。                                                      |
| `LinearProgressIndicator`   | `mode`          | `determinate` | `determinate`, `indeterminate`, `buffer`, `query`。                     |
| `LinearProgressIndicator`   | `stopSize`      | `4px`         | 直径，单位为 CSS px。仅当轨道与背景对比度至少为 3:1 时可设为 `0` 隐藏。 |
| 两者                        | `variant`       | `flat`        | `flat` 或 `wavy`。                                                      |
| `CircularProgressIndicator` | `value`, `max`  | `0`, `100`    | 确定态的已完成和最大进度。                                              |
| `CircularProgressIndicator` | `indeterminate` | `false`       | 显示未知进度的圆形动画。                                                |
| `CircularProgressIndicator` | 默认插槽        | —             | 在圆形指示器中显示视觉内容，不参与读屏器播报。                          |

## 行为与无障碍

两种组件都暴露 `role="progressbar"`、最小值、最大值和确定状态的当前值。请使用 `aria-label` 或 `aria-labelledby` 描述正在进行的任务。不确定状态不暴露 `aria-valuenow`。指示器本身不接受输入或焦点。

同一流程中的指示器应保持相同配置。短时等待且进度未知时，优先使用[加载指示器](/zh/components/loading-indicator)，而非不确定态圆形指示器。

Material 的响应式指南允许圆形指示器为 24–240 dp，不建议在线性指示器所在元素宽度小于 40 dp 时使用。放置位置和自定义尺寸由调用方控制。`buffer` 和 `query` 是项目定义的线性模式；平直和波浪形态属于 Material 3 Expressive 官方配置。

线性确定态的终点指示器默认直径为 4px，可独立于轨道厚度调整。轨道与容器或周围表面的对比度低于 3:1 时应保留该指示器；只有对比度至少为 3:1 时，才能将 `stopSize` 设为 `0` 隐藏。线性不确定态和圆形指示器不显示终点指示器。

波浪线性指示器的高度为轨道厚度加上上下波幅。确定进度仅在已完成范围内绘制波浪；不确定进度的片段沿轨道移动，波形同时持续推进。`buffer` 模式在已完成值和缓冲值之间显示实线轨道，缓冲值之后显示点状余量。系统启用减少动态效果时，连续动画会停在可见状态。

## 样式

以下项目 CSS 属性可覆盖组件默认映射。颜色默认值引用 Material System 角色，几何默认值采用官方 progress indicator token 数值。

| 范围               | CSS 属性                                                          | 默认值                               | 说明                     |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------ | ------------------------ |
| 两者               | `--yam3x-progress-indicator-color`                                | `--md-sys-color-primary`             | 活动指示器颜色。         |
| 两者               | `--yam3x-progress-indicator-track-color`                          | `--md-sys-color-secondary-container` | 轨道颜色。               |
| 线性               | `--yam3x-linear-progress-indicator-thickness`                     | `4px`                                | 轨道和活动指示器的厚度。 |
| 线性               | `--yam3x-linear-progress-indicator-end-inset`                     | `4px`                                | 两端的最小内缩距离。     |
| 线性               | `--yam3x-linear-progress-indicator-shape`                         | `4px`                                | 轨道圆角半径。           |
| 线性、波浪         | `--yam3x-linear-wavy-progress-indicator-amplitude`                | `3px`                                | 波幅。                   |
| 线性、波浪         | `--yam3x-linear-wavy-progress-indicator-wavelength`               | `40px`                               | 确定进度的波长。         |
| 线性、波浪不确定态 | `--yam3x-linear-wavy-indeterminate-progress-indicator-wavelength` | `20px`                               | 不确定进度的波长。       |
| 圆形、平直         | `--yam3x-circular-flat-progress-indicator-diameter`               | `40px`                               | 指示器直径。             |
| 圆形、波浪         | `--yam3x-circular-wavy-progress-indicator-diameter`               | `48px`                               | 指示器直径。             |
| 圆形               | `--yam3x-circular-progress-indicator-thickness`                   | `4px`                                | 轨道和活动指示器的厚度。 |
| 圆形、波浪         | `--yam3x-circular-wavy-progress-indicator-amplitude`              | `1.6px`                              | 波幅。                   |
| 圆形、波浪         | `--yam3x-circular-wavy-progress-indicator-wavelength`             | `15px`                               | 波长。                   |

这些 CSS 属性是项目扩展接口，不是 Material token 名称。使用 `stopSize` 属性调整线性终点指示器。

## Material 参考

[Progress indicators 概览](https://m3.material.io/components/progress-indicators/overview) · [指南](https://m3.material.io/components/progress-indicators/guidelines) · [规格](https://m3.material.io/components/progress-indicators/specs) · [无障碍](https://m3.material.io/components/progress-indicators/accessibility)
