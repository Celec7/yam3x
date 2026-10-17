<script setup lang="ts">
import BadgeExample from '../../components/demos/BadgeExample.vue'
</script>

# Badges

Badge 在相关项目旁显示简短数量或状态。应让对应关系清晰，也不要用 badge 代替控件的操作或标签。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <BadgeExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/BadgeExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import Badge from './components/yam3x/badge/badge.vue'
</script>

<template>
  <button
    id="inbox"
    type="button"
  >
    收件箱
  </button>
  <Badge
    for="inbox"
    aria-label="3 条未读消息"
    >3</Badge
  >
</template>
```

## API

| 属性         | 类型                                                                                              | 默认值                       | 说明                                                           |
| ------------ | ------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------- |
| `position`   | `above-after \| above-before \| below-before \| below-after \| before \| after \| above \| below` | `above-after`                | 相对锚点的逻辑位置，RTL 会镜像 before/after。                  |
| `for`        | `string`                                                                                          | —                            | 同文档或 shadow root 中目标元素的 ID；设置后随目标移动和缩放。 |
| `dir`        | `ltr \| rtl`                                                                                      | 继承                         | 显式指定徽标的方向。                                           |
| `aria-label` | `string`                                                                                          | 点状徽标为“New notification” | 提供更清楚的可访问名称。                                       |
| 默认 slot    | `VNode`                                                                                           | 空                           | 无实际渲染内容时显示 small 圆点；有内容时显示 large 文字徽标。 |
| `hidden`     | 原生布尔属性                                                                                      | `false`                      | 隐藏徽标。父级在用户查看对应目标后控制此状态。                 |

## 行为与无障碍

文字徽标最多显示四个字符；更长的数量应由调用方缩写，例如 `999+`。默认颜色使用 `error` 和 `on-error` 色彩角色。自定义颜色应保证徽标与周围内容之间、文字与背景之间的对比度至少为 3:1。组件根据 slot 的实际渲染内容选择圆点或文字样式；是否隐藏由父级控制。

## 样式

| 属性                                 | 默认值                          | 说明                                                             |
| ------------------------------------ | ------------------------------- | ---------------------------------------------------------------- |
| `--yam3x-badge-container-color`      | System `error`                  | 徽标容器颜色。与周围内容的对比度至少为 3:1。                     |
| `--yam3x-badge-color`                | System `on-error`               | 徽标文字颜色。与容器的对比度至少为 3:1。                         |
| `--yam3x-badge-large-size`           | `16px`                          | large 徽标的高度和最小宽度。                                     |
| `--yam3x-badge-large-font-size`      | System Label Small              | large 徽标文字字号。                                             |
| `--yam3x-badge-large-font-weight`    | System Label Small              | large 徽标文字字重。                                             |
| `--yam3x-badge-large-line-height`    | System Label Small              | large 徽标文字行高。                                             |
| `--yam3x-badge-large-tracking`       | System Label Small              | large 徽标文字字间距。                                           |
| `--yam3x-badge-long-label-font-size` | `10px`                          | 超过两个字符时使用的字号。                                       |
| `--yam3x-badge-long-label-tracking`  | `0.1px`                         | 超过两个字符时使用的字间距。                                     |
| `--yam3x-badge-small-offset`         | small 为 `6px`，large 为 `14px` | 锚点偏移，单位为像素。传入单个数值时，会同时用于水平和垂直位置。 |

这些项目覆盖属性映射到 Badge 规范和 System token。small 圆点尺寸与形状由组件映射固定。

## Material 参考

[Badges 概览](https://m3.material.io/components/badges/overview) · [指南](https://m3.material.io/components/badges/guidelines) · [规格](https://m3.material.io/components/badges/specs) · [无障碍](https://m3.material.io/components/badges/accessibility)
