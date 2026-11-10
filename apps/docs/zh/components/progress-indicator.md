<script setup lang="ts">
import ProgressIndicatorExample from '../../components/demos/ProgressIndicatorExample.vue'
</script>

# Progress indicators

Progress indicator 用于显示进行中任务的状态。有可用且有意义的进度值时使用确定进度，否则使用不确定进度。

Progress indicator 是 Material 3 Expressive 组件组。项目将 `LinearProgressIndicator` 和 `CircularProgressIndicator` 作为同一组组件导出。两者都支持平直和波浪两种 Material 3 Expressive 形态。线性组件增加 `buffer` 和 `query` 模式，它们是项目定义的扩展；圆形组件增加用于视觉内容的默认插槽。

## 示例

### 线性与圆形指示器

<div class="vp-raw yam3x-doc-demo-theme"><ProgressIndicatorExample /></div>

演示用进度滑块驱动线性数值，在 `determinate`、`indeterminate`、`buffer` 和 `query` 之间切换，并调整终点指示器尺寸。波浪控件同时作用于两种形状。圆形一列对比确定与不确定进度，控件会体现当前值和接受的模式。

::: details 查看演示源码

<<< ../../components/demos/ProgressIndicatorExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from './components/yam3x/progress-indicator'

const uploaded = ref(60)
</script>

<template>
  <section>
    <p id="upload-label">正在上传文件 · {{ uploaded }}%</p>
    <LinearProgressIndicator
      :value="uploaded"
      aria-labelledby="upload-label"
    />
    <CircularProgressIndicator
      :value="uploaded"
      aria-labelledby="upload-label"
    />
  </section>
</template>
```

`value` 可选，默认 `0`；`max` 默认 `100`。两个指示器都是表现型 progressbar，因此可见标签、数值格式以及重试或取消操作由周围应用负责。

::: details 模式、缓冲与圆形插槽

```vue
<script setup lang="ts">
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from './components/yam3x/progress-indicator'
</script>

<template>
  <!-- 进度未知 -->
  <LinearProgressIndicator
    mode="indeterminate"
    aria-label="正在检查更新"
  />
  <CircularProgressIndicator
    indeterminate
    aria-label="正在检查更新"
  />

  <!-- 缓冲播放 -->
  <LinearProgressIndicator
    mode="buffer"
    :value="42"
    :buffer-value="76"
    aria-label="缓冲播放"
  />

  <!-- 项目定义的查询模式 -->
  <LinearProgressIndicator
    mode="query"
    aria-label="正在搜索活动"
  />

  <!-- 圆形插槽内容仅用于视觉 -->
  <CircularProgressIndicator
    :value="64"
    aria-label="已用存储空间"
  >
    <span aria-hidden="true">64%</span>
  </CircularProgressIndicator>
</template>
```

`buffer` 显示已完成值、到 `bufferValue` 的实线范围，以及之后的点状余量。`query` 是带独立往返动画的不确定线性模式。圆形指示器的插槽内容居中显示在圆环内并对辅助技术隐藏；不确定模式下不会渲染，因此应保持装饰性，或在其他位置暴露相同信息。

:::

## 行为与无障碍

### 语义

- 两个组件都暴露 `role="progressbar"`、`aria-valuemin="0"` 和由解析后最大值得到的 `aria-valuemax`。
- 确定和缓冲模式暴露 `aria-valuenow`，其值为限制在范围内的传入数值。
- 不确定和查询模式省略 `aria-valuenow`。
- `aria-label`、`aria-labelledby` 和 `aria-valuetext` 等属性会透传到根元素。应提供一个名称，并在百分比不是最佳播报时提供可读数值。
- 指示器不接受输入，也不是焦点目标。暂停、取消或重试应使用单独控件。

### 数值与模式行为

- `value` 默认 `0`；`max` 默认 `100`。非正或非有限 `max` 回退到 `100`。
- 视觉比例限制在 `0–1`。`aria-valuenow` 报告限制在 `0–max` 的数值，而不是四舍五入后的比例。
- 线性确定模式使用终点指示器标记活动范围末端。尺寸来自 `stopSize`；设为 `0` 会移除。
- 活动轨道与容器或周围表面的对比度低于 3:1 时应保留终点指示器；只有对比度至少为 3:1 时，才能将 `stopSize` 设为 `0`。
- 不确定和圆形指示器不渲染终点指示器。
- 圆形默认插槽被 `aria-hidden` 且 `inert` 的容器包裹。

### 形态与动态效果

- `variant="flat"` 为默认值；`variant="wavy"` 使用 Expressive 波形。
- 波浪线性指示器的高度为轨道厚度加上下波幅。确定进度仅在已完成范围内绘制波浪；不确定进度的片段沿轨道移动，波形同时推进。
- 未启用减少动态效果时，圆形指示器用 500ms 插值显示数值变化。视觉圆弧可能滞后于立即可访问的 `aria-valuenow`。
- 减少动态效果会移除连续动画并保留可见静态状态。不确定形状仍保留可见的圆弧或片段。

### 方向与响应式布局

- 线性进度遵循书写方向。不确定和查询动画在 RTL 中反向，确定填充从逻辑边缘开始。
- Material 响应式指南允许圆形指示器为 24–240 dp，不建议在线性指示器所在元素宽度小于 40 dp 时使用。
- 放置位置和自定义尺寸由调用方控制。同一流程中的所有指示器应保持相同配置。

### 组件选择

进度属于宽区域（例如页面区块或上传条）时使用线性指示器。空间紧凑或位于单个操作旁时使用圆形指示器。短时等待且进度未知时，优先使用[加载指示器](/zh/components/loading-indicator)，而非不确定态圆形指示器。

## API

### 导出

| 导出                        | 类型 | 用途                                 |
| --------------------------- | ---- | ------------------------------------ |
| `LinearProgressIndicator`   | 组件 | 水平确定、不确定、缓冲或查询进度条。 |
| `CircularProgressIndicator` | 组件 | 圆形确定或不确定进度。               |

入口只导出组件；`ProgressVariant` 和 `LinearProgressMode` 定义在 `progress-utils.ts` 中，不从组件入口重新导出。

### `LinearProgressIndicator` 属性

| 属性          | 类型                                                      | 默认值          | 说明                                                 |
| ------------- | --------------------------------------------------------- | --------------- | ---------------------------------------------------- |
| `value`       | `number`                                                  | `0`             | 已完成进度，视觉上限制在范围内。                     |
| `max`         | `number`                                                  | `100`           | 最大进度。非正或非有限值回退到 `100`。               |
| `bufferValue` | `number`                                                  | `0`             | `buffer` 模式中缓冲范围的末端。                      |
| `mode`        | `'determinate' \| 'indeterminate' \| 'buffer' \| 'query'` | `'determinate'` | 视觉与 ARIA 模式。`buffer` 和 `query` 属于项目定义。 |
| `variant`     | `'flat' \| 'wavy'`                                        | `'flat'`        | 平直轨道或 Expressive 波形。                         |
| `stopSize`    | `number`                                                  | `4`             | 确定态终点指示器直径，单位为 CSS 像素；`0` 移除。    |

### `CircularProgressIndicator` 属性

| 属性            | 类型               | 默认值   | 说明                           |
| --------------- | ------------------ | -------- | ------------------------------ |
| `value`         | `number`           | `0`      | 确定态已完成进度。             |
| `max`           | `number`           | `100`    | 最大进度；非正值回退到 `100`。 |
| `indeterminate` | `boolean`          | `false`  | 显示不确定圆形动画。           |
| `variant`       | `'flat' \| 'wavy'` | `'flat'` | 平直圆环或 Expressive 波形。   |

### 事件

两个指示器都不发出事件。应由拥有任务的流程传入并更新数值。

### 插槽

| 组件                        | 插槽    | 作用域 | 用途                               |
| --------------------------- | ------- | ------ | ---------------------------------- |
| `CircularProgressIndicator` | default | —      | 圆环内的视觉内容；对辅助技术隐藏。 |
| `LinearProgressIndicator`   | —       | —      | 线性指示器不渲染插槽内容。         |

### 方法

两个指示器都不暴露实例方法。

## 样式

以下项目 CSS 属性可覆盖默认映射。颜色默认值引用 Material System 角色；几何默认值采用官方 progress indicator token 数值。属性名属于项目接口，不是 Material token 名称。

| 范围               | CSS 属性                                                          | 默认值                               | 用途                     |
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

线性终点指示器使用 `stopSize` 属性。默认 `4px`，并独立于轨道厚度测量。

## Material 参考

[Progress indicators 概览](https://m3.material.io/components/progress-indicators/overview) · [指南](https://m3.material.io/components/progress-indicators/guidelines) · [规格](https://m3.material.io/components/progress-indicators/specs) · [无障碍](https://m3.material.io/components/progress-indicators/accessibility)
