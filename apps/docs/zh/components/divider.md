<script setup lang="ts">
import DividerHorizontalExample from '../../components/demos/DividerHorizontalExample.vue'
import DividerVerticalExample from '../../components/demos/DividerVerticalExample.vue'
</script>

# Divider

Divider 是分隔相关内容组的非交互线条。仅当间距本身不足以清楚表达分组时才使用。

## 交互示例

### 水平分隔线

<div class="vp-raw yam3x-doc-demo-theme"><DividerHorizontalExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DividerHorizontalExample.vue{vue}

:::

### 垂直分隔线

<div class="vp-raw yam3x-doc-demo-theme"><DividerVerticalExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DividerVerticalExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { HorizontalDivider, VerticalDivider } from './components/yam3x/divider'
</script>

<template>
  <div>
    <p>第一部分</p>
    <HorizontalDivider />
    <p>第二部分</p>
  </div>
  <div style="display: flex; align-items: stretch; height: 48px">
    <span>左侧</span>
    <VerticalDivider />
    <span>右侧</span>
  </div>
</template>
```

## API

| 属性                     | 类型               | 默认值            | 说明                                                                       |
| ------------------------ | ------------------ | ----------------- | -------------------------------------------------------------------------- |
| `thickness`              | `number \| string` | `1px`             | 线条粗细。数字按 px 处理；字符串接受 CSS 长度。                            |
| `color`                  | `string`           | `outline-variant` | 线条的 CSS 颜色。                                                          |
| `inset`                  | `boolean`          | `false`           | 起始侧和末尾侧均按默认值内缩 16px。                                        |
| `insetStart`, `insetEnd` | `boolean`          | `false`           | 仅将逻辑起始侧或末尾侧按默认值内缩 16px。                                  |
| `decorative`             | `boolean`          | `true`            | 装饰线默认对辅助技术隐藏；设为 `false` 后暴露 separator 角色（项目扩展）。 |

## 行为与无障碍

`HorizontalDivider` 横跨容器宽度。`VerticalDivider` 横跨父容器高度，因此父容器需要有明确高度。

装饰性分隔线不应被屏幕阅读器重复播报。内容分组应通过有意义的 DOM 结构表达。

## 样式

未设置 `thickness` 或 `color` 时，可通过对应的 `--yam3x-divider-thickness` 或 `--yam3x-divider-color` CSS 自定义属性覆盖主题值；显式 prop 优先。内缩尺寸可通过 `--yam3x-divider-inset-size`、`--yam3x-divider-inset-start-size` 和 `--yam3x-divider-inset-end-size` 自定义。

## Material 参考

[Divider 概览](https://m3.material.io/components/divider/overview) · [指南](https://m3.material.io/components/divider/guidelines) · [规格](https://m3.material.io/components/divider/specs) · [无障碍](https://m3.material.io/components/divider/accessibility)
