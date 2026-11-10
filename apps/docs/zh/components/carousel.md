<script setup lang="ts">
import CarouselExample from '../../components/demos/CarouselExample.vue'
import CarouselGalleryExample from '../../components/demos/CarouselGalleryExample.vue'
</script>

# 轮播

轮播以可滚动序列呈现相关项目。应选择便于阅读内容、且能让用户看出还有更多项目的布局。

轮播是 Material 3 基线组件，包含六种布局：多项浏览、无边界、无边界多纵横比、主视觉、居中主视觉和全屏。全屏适用范围、`itemHeight` 以及演示中的布局说明是项目决策；尺寸、间距和吸附默认值遵循 Material 布局。

## 示例

### 布局与浏览

<div class="vp-raw yam3x-doc-demo-theme"><CarouselExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CarouselExample.vue{vue}

:::

演示在相同的五个项目之间切换全部六种布局。它显示当前项目，只在竖屏紧凑和中等宽度下启用全屏，并在轮播之外提供“浏览全部”区域。拖拽会水平滚动而不会激活项目；点击可操作的“城市”项目会报告激活结果。

### 吸附与项目状态

<div class="vp-raw yam3x-doc-demo-theme"><CarouselGalleryExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CarouselGalleryExample.vue{vue}

:::

画廊用固定内容对比多项浏览、主视觉和无边界布局。多项浏览会调整相邻项目尺寸，主视觉保留一组大预览，无边界保持单一项目宽度并使用普通滚动。禁用的“版画”项目保持可见，但会被方向键导航跳过。

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Carousel, type CarouselItem, type CarouselLayout } from './components/yam3x/carousel'

const items: CarouselItem[] = [
  { key: 'coast', label: '海岸线' },
  { key: 'garden', label: '花园' },
  { key: 'forest', label: '森林' },
]
const layout = ref<CarouselLayout>('uncontained')
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
```

每个项目都需要稳定的 `key` 和可读的 `label`；`href`、`actionable`、`disabled`、`image` 和 `aspectRatio` 都是可选的。默认 slot 收到 `{ item, index, sizeRole }` 并负责视觉内容。`image` 只提供给该 slot，组件本身不会渲染它。

::: details 全屏与自定义项目宽度

```vue
<script setup lang="ts">
import { Carousel } from './components/yam3x/carousel'

const portraits = [
  { key: 'one', label: '第一个故事' },
  { key: 'two', label: '第二个故事' },
]
</script>

<template>
  <Carousel
    :items="portraits"
    layout="full-screen"
    label="故事流"
  >
    <template #default="{ item }">
      <article>{{ item.label }}</article>
    </template>
  </Carousel>
</template>
```

全屏是纵向、贴边的布局，强制吸附且没有轨道内边距。组件不会检查视口方向或尺寸，因此只在竖屏紧凑或中等宽度下使用它，并在其他环境中提供替代布局。水平布局中，`preferredItemWidth` 调整多项浏览、主视觉和居中主视觉的大项目宽度；`itemWidth` 固定无边界项目宽度。

:::

## 行为与无障碍

### 布局

- 多项浏览显示大、中、小项目，并随当前项目变化调整尺寸。
- 无边界保持单一项目宽度，默认自由滚动。无边界多纵横比根据每个项目的 `aspectRatio` 和自身高度计算宽度。
- 主视觉显示一个大项目及后续预览。居中主视觉居中显示一个大项目，两侧都有预览；项目多于两个时从第二项开始。
- 全屏每个视口块放一个项目，并始终使用纵向吸附。它不添加水平拖拽处理。

### 滚动与吸附

- 多项浏览、主视觉、居中主视觉和全屏默认吸附。无边界布局默认不吸附，除非显式启用 `snap`；全屏无法关闭吸附。
- 原生触摸和触控板滚动保持可用。鼠标主键拖拽会滚动水平轮播，并抑制原本会激活指针下项目的点击。
- 当前项目跟随滚动和焦点。设置 `activeIndex` 会把新项目滚动到视图中。
- 轨道自行承载水平溢出，不会撑宽页面。

### 键盘与焦点

- 每个启用项目都是 Tab 停靠点。在从左到右布局中，左方向键和右方向键移动焦点；RTL 中方向键会镜像。上方向键和下方向键会离开水平轮播，进入相邻页面内容。
- 全屏布局中，上方向键和下方向键在项目之间移动。
- 组件不拦截 Home 和 End；项目导航请使用方向键。
- 禁用项目会从 Tab 顺序中移除，并被方向键导航跳过。
- Space 激活链接项目；Enter 使用链接和按钮的原生激活行为。

### 激活

- `href` 渲染原生链接；`actionable: true` 渲染原生按钮。两者都会触发 `activate(item, index, event)`。
- 非可操作项目是带幻灯片可访问名称的可聚焦分组；它不会激活。
- 除非应用调用 `preventDefault()`，链接导航保持原生行为。禁用项目不会激活或导航。

### 减少动态效果

- 平滑滚动变为即时滚动，视差被移除，项目尺寸过渡停止，非大项目使用大项目宽度，确保序列仍然可读。
- 轮播不会自动播放。没有用户输入时不会移动或前进。

### 空与加载状态

- `items` 为空数组时会渲染带名称的空分组。轮播没有空状态 slot 或加载属性；请在轮播之外或替代轮播的位置渲染自己的消息或占位内容。
- 组件不获取数据、不报告加载状态，也不提供上一项/下一项控件。

### 状态归属

- `v-model:active-index` 拥有当前项目。未绑定时，组件维护自己的索引，并在浏览改变时触发 `change`。
- 应用拥有项目集合、每个项目的目标或 `actionable` 行为，以及在水平滚动页面之外暴露全部项目的操作。

## API

内置界面文案继承 [LocaleProvider](/zh/components/localization) 的 `actions` 命名空间。`locale` 覆盖语言，默认使用 provider，再回退到 `en-US`。应用提供 `label` 和项目标签。

`actions.carouselItem(position, total, label)` 使用从 1 开始的位置格式化每个项目的可访问名称。

### 导出

| 导出                    | 说明                                              |
| ----------------------- | ------------------------------------------------- |
| `Carousel`              | 支持六种布局的可滚动项目序列。                    |
| `CarouselItem`          | 项目结构，包括目标、操作和布局数据。              |
| `CarouselItemSlotProps` | 默认 slot 作用域：`item`、`index` 和 `sizeRole`。 |
| `CarouselLayout`        | 六种布局名称的联合类型。                          |
| `CarouselLength`        | CSS 长度字符串或按像素解释的数值。                |

### 属性与模型

| 属性                 | 默认值                   | 说明                                                                                                              |
| -------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `items`              | 必填                     | 要浏览的项目。每项需要唯一 `key` 和可读 `label`。                                                                 |
| `label`              | 必填                     | 轮播分组的可访问名称。                                                                                            |
| `layout`             | `multi-browse`           | `multi-browse`、`uncontained`、`uncontained-multi-aspect-ratio`、`hero`、`center-aligned-hero` 或 `full-screen`。 |
| `snap`               | 随布局决定               | 启用 CSS 滚动吸附。除无边界布局外默认开启；全屏始终吸附。                                                         |
| `preferredItemWidth` | 响应式                   | 多项浏览、主视觉和居中主视觉布局的大项目首选宽度。数值按像素解释。                                                |
| `itemWidth`          | 响应式                   | 无边界布局的固定项目宽度。数值按像素解释；多纵横比宽度使用 `aspectRatio`。                                        |
| `itemSpacing`        | `8px`，全屏 `16px`       | 项目之间的间距。数值按像素解释。                                                                                  |
| `contentPadding`     | 随布局决定               | 轨道的 CSS padding 简写值。数值按像素解释。                                                                       |
| `itemHeight`         | `320px`                  | 一般布局的项目内容高度（项目扩展）；全屏与多纵横比布局自行计算高度。                                              |
| `locale`             | Provider，再回退 `en-US` | 内置幻灯片名称的语言。                                                                                            |
| `activeIndex`        | `0`                      | 当前项目索引；支持 `v-model:active-index`。                                                                       |

`CarouselItem`：

| 字段          | 类型               | 用途                                           |
| ------------- | ------------------ | ---------------------------------------------- |
| `key`         | `string \| number` | 稳定且唯一的键。                               |
| `label`       | `string`           | 用于幻灯片可访问名称的可读项目名称。           |
| `href`        | `string`           | 渲染原生链接。                                 |
| `actionable`  | `boolean`          | 为非链接项目渲染原生按钮。                     |
| `disabled`    | `boolean`          | 保持可见，但移除激活能力和 Tab 停靠点。        |
| `image`       | `string`           | 提供给默认 slot 的图片 URL；组件本身不会渲染。 |
| `aspectRatio` | `string`           | 例如 `16:9` 的比例，用于无边界多纵横比布局。   |

### 事件

| 事件       | 载荷                   | 说明                           |
| ---------- | ---------------------- | ------------------------------ |
| `change`   | `(index, item)`        | 浏览或焦点移动了当前项目。     |
| `activate` | `(item, index, event)` | 启用的链接或可操作项目被激活。 |

### 插槽

| 插槽      | 作用域                      | 用途                                                   |
| --------- | --------------------------- | ------------------------------------------------------ |
| `default` | `{ item, index, sizeRole }` | 项目内容。`sizeRole` 为 `large`、`medium` 或 `small`。 |

### 方法

轮播不暴露实例方法。使用 `v-model:active-index` 以编程方式移动序列。

## 样式

轮播不暴露公共自定义属性约定。项目尺寸、间距、内边距和高度通过属性控制；颜色、焦点、形状和动效使用内部 Material 映射。焦点外圈是 3 px Secondary，偏移 2 px；水平布局中的项目圆角在 28 px、21 px 与按下值之间以弹簧效果过渡。

## Material 参考

[轮播概览](https://m3.material.io/components/carousel/overview) · [指南](https://m3.material.io/components/carousel/guidelines) · [规格](https://m3.material.io/components/carousel/specs) · [无障碍](https://m3.material.io/components/carousel/accessibility)
