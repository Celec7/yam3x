<script setup lang="ts">
import BreadcrumbExample from '../../components/demos/BreadcrumbExample.vue'
</script>

# Breadcrumb

Breadcrumb 以可导航路径显示当前页面及其父级位置。此项目拓展使用普通链接，路由由应用负责。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><BreadcrumbExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BreadcrumbExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { Breadcrumb } from './components/yam3x/breadcrumb'

const items = [
  { label: '首页', href: '/' },
  { label: '产品', href: '/products' },
  { label: '详情' },
]
</script>

<template>
  <Breadcrumb :items="items" />
</template>
```

## API

Breadcrumb 导航可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 文案。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`。已有标签覆盖属性优先。

| 属性             | 类型                                                                 | 默认值       | 说明                                                 |
| ---------------- | -------------------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| `items`          | `{ label, href?, target?, rel?, download?, disabled?, iconOnly? }[]` | `[]`         | 按层级顺序排列的面包屑项目。                         |
| `currentIndex`   | `number`                                                             | 最后一个项目 | 当前页面索引；`-1` 表示不标记当前页面。              |
| `ariaLabel`      | `string`                                                             | `Breadcrumb` | 导航地标名称。                                       |
| `ariaLabelledby` | `string`                                                             | —            | 可见标题的 ID；设置后优先于 `ariaLabel`。            |
| `wrap`           | `boolean`                                                            | `false`      | 换行路径项目；关闭时仅路径容器水平滚动，不扩大整页。 |

`#item({ item, index, current })` 可替换可见标签；`#icon` 提供前置图标；`#separator({ index })` 替换分隔符。图标独占项目时将 `iconOnly` 设为 `true`，`label` 仍作为无障碍名称。

## 行为与无障碍

链接保留浏览器的 Tab、Enter、上下文菜单、复制链接和修饰键行为。默认最后一项为当前页面：提供 `href` 时它仍是 `aria-current="page"` 的链接，并使用 on-surface 颜色；没有 `href` 时显示为当前文本。非链接祖先使用 on-surface-variant，且不显示指针光标。

每个项目在最小 48px 交互目标内使用 40px 的可见胶囊；hover、focus 和 pressed 反馈由同一个共享状态层提供，focus 为 3px secondary 外环加 2px 外偏移。

## 样式

在 Breadcrumb 根元素上设置以下项目自定义属性。标签文字默认映射到 System Label Large；颜色、间距密度和状态层透明度默认跟随共享 System token。`--yam3x-breadcrumb-item-container-height` 控制可见胶囊高度；交互目标通过 `--md-sys-touch-target-size` 保持至少 48px。

| 区域             | 支持的属性                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 项目布局         | `--yam3x-breadcrumb-item-container-height`、`--yam3x-breadcrumb-item-shape`、`--yam3x-breadcrumb-item-label-padding-inline`、`--yam3x-breadcrumb-item-icon-padding-inline`、`--yam3x-breadcrumb-item-icon-label-space` |
| 标签排版         | `--yam3x-breadcrumb-item-label-font-size`、`--yam3x-breadcrumb-item-label-font-weight`、`--yam3x-breadcrumb-item-label-line-height`、`--yam3x-breadcrumb-item-label-tracking`                                          |
| 图标与分隔符尺寸 | `--yam3x-breadcrumb-item-icon-size`、`--yam3x-breadcrumb-separator-icon-size`                                                                                                                                          |
| 颜色与禁用状态   | `--yam3x-breadcrumb-item-label-color`、`--yam3x-breadcrumb-item-icon-color`、`--yam3x-breadcrumb-item-last-color`、`--yam3x-breadcrumb-item-disabled-color`、`--yam3x-breadcrumb-item-disabled-opacity`                |
| 状态层颜色       | `--yam3x-breadcrumb-item-label-state-layer-color`、`--yam3x-breadcrumb-item-icon-state-layer-color`                                                                                                                    |

## 无障碍参考

[WAI-ARIA 面包屑模式](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
