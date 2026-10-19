<script setup lang="ts">
import CarouselExample from '../../components/demos/CarouselExample.vue'
</script>

# Carousel

Carousel 以可滚动序列呈现相关项目。应选择便于阅读内容、且能让用户看出还有更多项目的布局。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><CarouselExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CarouselExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { Carousel } from './components/yam3x/carousel'
import type { CarouselItem, CarouselLayout } from './components/yam3x/carousel'

const items: CarouselItem[] = [
  { key: 'coast', label: '海岸线' },
  { key: 'garden', label: '花园' },
  { key: 'forest', label: '森林' },
]
const layout: CarouselLayout = 'uncontained'
</script>

<template>
  <Carousel
    :items="items"
    :layout="layout"
    label="精选地点"
  >
    <template #default="{ item }">
      <div class="destination">{{ item.label }}</div>
    </template>
  </Carousel>
</template>

<style scoped>
.destination {
  display: grid;
  height: 100%;
  place-items: center;
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
</style>
```

## API

该组件的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`。应用提供区域名称和项目标签。

`actions.carouselItem(position, total, label)` 格式化每项的无障碍名称，位置从 1 开始；项目标签由应用提供。

`items` 中的每项需要稳定 `key` 和可读 `label`，可选 `href`、`actionable`、`disabled`、`image` 与 `aspectRatio`。默认 slot 收到 `{ item, index, sizeRole }`，由调用方渲染内容。

| 属性 / 事件          | 类型                   | 默认值               | 说明                                                                                                                                                 |
| -------------------- | ---------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`              | `CarouselItem[]`       | 必填                 | 要浏览的数据项。每项需有稳定的 `key` 和可访问名称 `label`。                                                                                          |
| `label`              | `string`               | 必填                 | Carousel 的可访问名称。                                                                                                                              |
| `layout`             | `CarouselLayout`       | `multi-browse`       | 基于 M3 布局及配置的六个受支持值之一。                                                                                                               |
| `activeIndex`        | `number`               | `0`                  | 当前项索引；支持 `v-model:active-index`。                                                                                                            |
| `snap`               | `boolean`              | 随布局决定           | 使用 CSS scroll snap。默认用于 Multi-browse、Hero 和 Full-screen；Uncontained 与 Uncontained multi-aspect ratio 默认自由滚动。Full-screen 始终启用。 |
| `preferredItemWidth` | `CarouselLength`       | 响应式               | Multi-browse 和 Hero 布局的大项首选宽度。数值按 CSS 像素解释，字符串为 CSS 长度。                                                                    |
| `itemWidth`          | `CarouselLength`       | 响应式               | Uncontained 布局的固定项目宽度。数值按 CSS 像素解释，字符串为 CSS 长度；多纵横比布局仍按 `aspectRatio` 计算宽度。                                    |
| `itemSpacing`        | `CarouselLength`       | `8px`（全屏 `16px`） | 项目之间的间距。数值按 CSS 像素解释，字符串为 CSS 长度。                                                                                             |
| `contentPadding`     | `CarouselLength`       | 随布局决定           | 轨道的 CSS padding 简写值；默认值遵循 M3 布局间距。数值按 CSS 像素解释，字符串可使用有效的 CSS padding 值。                                          |
| `itemHeight`         | `string`               | `320px`              | 一般布局的项目轨道内容高度（项目扩展）；全屏与多纵横比布局自行计算高度。                                                                             |
| `change`             | `(index, item)`        | —                    | 浏览导致当前项变化时触发。                                                                                                                           |
| `activate`           | `(item, index, event)` | —                    | 激活可用链接或 `actionable` 项目时触发。                                                                                                             |

`CarouselLength` 接受 CSS 长度字符串或按像素解释的数值。

## 行为与无障碍

设置 `href` 会渲染原生链接，设置 `actionable: true` 会渲染原生按钮；两者激活时 Carousel 都会触发 `activate(item, index, event)`，禁用项不会触发。链接仍执行原生导航，除非事件处理器调用 `preventDefault()`。`activeIndex` 会在用户滚动或用方向键浏览时同步；滚动动画遵循减少动态效果偏好。全屏布局的适用范围由调用方负责，仅应在竖屏紧凑或中等宽度下使用。纵向页面应在 Carousel 之外提供“浏览全部”操作或等效入口。横向内容较多时优先考虑 Uncontained 布局，保持标签易读。

## 样式

多比例布局的宽度根据容器和各项 `aspectRatio` 计算。一般布局默认项目间距为 8px，全屏为 16px；普通水平布局的内联两侧留白为 16px、块方向为 8px，无边界布局只保留起始侧 16px 和块方向 8px，全屏不留白。

## Material 参考

[Carousel 概览](https://m3.material.io/components/carousel/overview) · [指南](https://m3.material.io/components/carousel/guidelines) · [规格](https://m3.material.io/components/carousel/specs) · [无障碍](https://m3.material.io/components/carousel/accessibility)
