<script setup lang="ts">
import LoadingIndicatorExample from '../../components/demos/LoadingIndicatorExample.vue'
</script>

# Loading indicator

Loading indicator 表示操作仍在进行，但无法确定完成进度。可用于等待状态，并尽可能保留周围内容的可用性。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><LoadingIndicatorExample /></div>

::: details 查看演示源码

<<< ../../components/demos/LoadingIndicatorExample.vue{vue}

:::

## 在应用中导入

安装后，从复制到应用的组件目录导入：

```vue
<script setup lang="ts">
import { LoadingIndicator } from './components/yam3x/loading-indicator'
</script>

<template>
  <LoadingIndicator aria-label="正在加载文章" />
</template>
```

## API

| 属性      | 默认值        | 说明                                                       |
| --------- | ------------- | ---------------------------------------------------------- |
| `variant` | `uncontained` | `uncontained` 在表面上直接显示；`contained` 增加有色容器。 |

## 行为与无障碍

为每个实例提供描述正在加载内容的 `aria-label` 或 `aria-labelledby`。组件暴露不确定的 `progressbar` 语义，没有当前数值，也没有点击或键盘操作。减少动态效果时显示静态形状。用于下拉刷新时，调用方还应提供无需手势的刷新操作。

用于进度未知的短时等待，包括下拉刷新。Material 推荐用它代替不确定态圆形[进度指示器](/zh/components/progress-indicator)；流程可能转为确定进度时，应使用进度指示器。

## 样式

响应式尺寸由调用方通过 `--yam3x-loading-indicator-container-size` 控制。Material 建议整体尺寸为 24–240 dp，默认 48 dp；仅在周围空间适合时使用较大尺寸。除非显式设置 `--yam3x-loading-indicator-active-indicator-size`，活动形状保持容器尺寸的 79.17%。CSS 变量不会自动将尺寸限制在 Material 建议范围内。

以下 CSS 属性是项目扩展接口，不是 Material token 名称。默认值映射到 Material 组件要求和 System token。

| 范围     | CSS 属性                                                     | 默认值                                | 含义                                              |
| -------- | ------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------- |
| 两种形式 | `--yam3x-loading-indicator-container-size`                   | `48px`                                | 整体正方形占位尺寸。                              |
| 两种形式 | `--yam3x-loading-indicator-container-shape`                  | `--md-sys-shape-corner-full`          | 可选容器的形状。                                  |
| 两种形式 | `--yam3x-loading-indicator-active-indicator-size`            | `calc(container size × 0.79166667)`   | 活动形状尺寸；整体尺寸为 `48px` 时默认是 `38px`。 |
| 无容器   | `--yam3x-loading-indicator-active-indicator-color`           | `--md-sys-color-primary`              | 表面上的活动形状颜色。                            |
| 有容器   | `--yam3x-loading-indicator-contained-container-color`        | `--md-sys-color-primary-container`    | 可选容器背景色。                                  |
| 有容器   | `--yam3x-loading-indicator-contained-active-indicator-color` | `--md-sys-color-on-primary-container` | 容器背景上的活动形状颜色。                        |

搭配使用有容器形式的颜色属性，确保活动形状保持足够对比度。

## Material 参考

[Loading indicator 概览](https://m3.material.io/components/loading-indicator/overview) · [指南](https://m3.material.io/components/loading-indicator/guidelines) · [规格](https://m3.material.io/components/loading-indicator/specs) · [无障碍](https://m3.material.io/components/loading-indicator/accessibility)
