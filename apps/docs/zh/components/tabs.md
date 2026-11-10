<script setup lang="ts">
import TabsBasicExample from '../../components/demos/TabsBasicExample.vue'
import TabsExample from '../../components/demos/TabsExample.vue'
</script>

# Tabs

Tab 用于在信息层级相同的相关视图间切换。`Tabs` 是 Material 3 Expressive 标签行，提供 primary 与 secondary 变体、固定与滚动布局、图标、徽章，以及跟随书写方向的选择指示器。

Tab 适合可以任意顺序阅读的相关内容，不用于有固定顺序的步骤或通用站点导航。Primary tab 位于应用栏下方，用于主要内容目的地；secondary tab 在内容区域内组织第二层级。标签应简洁，图标只在能增加含义时使用。

## 示例

### 基础

基础示例使用带图标的 primary tab，并包含徽章、禁用标签和每个标签对应的面板。选择标签会移动指示器并显示关联面板；禁用的“归档”标签仍然可见，但无法选择。

<div class="vp-raw yam3x-doc-demo-theme"><TabsBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TabsBasicExample.vue{vue}

:::

### 变体、布局与交互状态

交互演示可切换 primary 与 secondary、固定与滚动布局、标签栏位置，最多增加到七个标签，并可调整分页按钮显示与内容滑动。控件和事件日志让禁用标签、徽章、选择变化与指示器方向都可观察。

<div class="vp-raw yam3x-doc-demo-theme"><TabsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TabsExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/installation)后，从应用中导入复制后的组件。请使用 `./components/yam3x/` 之类的调用方路径；演示源码中的 `@registry` 路径仅用于文档站点。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, type TabItem } from './components/yam3x/tabs'

const current = ref('overview')
const items: TabItem[] = [
  { value: 'overview', label: '概览' },
  { value: 'activity', label: '动态', badge: 4 },
  { value: 'files', label: '文件' },
]
</script>

<template>
  <Tabs
    v-model="current"
    label="项目分区"
    :items="items"
    variant="primary"
  >
    <template #panel="{ item }">
      <p>{{ item.label }}内容</p>
    </template>
  </Tabs>
</template>
```

`v-model` 保存当前标签值。绑定的值缺失或已禁用时，首个可用标签成为当前项，并同步更新模型。面板保持挂载，因此表单状态和滚动位置在切换标签后仍然保留；页面仍负责内容以及需要跨切换保留的状态。

::: details 图标与自定义标签内容

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, type TabItem } from './components/yam3x/tabs'
import { Icon } from './components/yam3x/icon'

const current = ref('photos')
const items: TabItem[] = [
  { value: 'photos', label: '照片' },
  { value: 'videos', label: '视频' },
]
</script>

<template>
  <Tabs
    v-model="current"
    label="媒体"
    :items="items"
    variant="primary"
  >
    <template #icon="{ item }"><Icon :name="item.value" /></template>
  </Tabs>
</template>
```

:::

Primary tab 仅在提供 `icon` 插槽时渲染图标。图标或徽章让可见标签含糊时使用 `ariaLabel`；否则无障碍名称回退到 `label`。

## 行为与无障碍

### 激活与选择

- 方向键只移动焦点；Space、Enter 或点击会激活聚焦的标签并更新面板。
- `update:modelValue` 先于 `select(item)` 触发。再次激活当前标签只触发 `select`，不会再次更新模型。禁用标签不触发任何事件。
- 标签行始终与一个可见面板保持同步。在滚动布局中激活标签时，还会将其滚动到可见区域。
- 禁用标签保留视觉位置，并会被键盘与滑动导航跳过。

### 键盘与焦点

- 左右方向键在可用标签间移动并循环；Home 与 End 移到首个和末个可用标签。RTL 会反转水平方向。
- 每个可用标签都是 Tab 停靠点，因此 Tab 会离开标签行，而不会在行内循环。禁用标签不可聚焦。
- 选中的面板是 `tabpanel`，由对应标签标记名称，并可通过 `tabindex="0"` 聚焦。未选中的面板为 inert，并从无障碍树隐藏。
- 可见焦点、悬停和按下状态使用独立状态层；焦点轮廓不会移除。

### 布局与溢出

- `layout="auto"` 在不超过四项时使用固定布局，超过四项时使用滚动布局。内容需要时显式设置 `fixed` 或 `scrollable`。
- 滚动行保留 52 px 起始内缩，标签可以扩展，不使用固定宽度或行数截断。上一页和下一页分页按钮只滚动标签行，并在两端禁用。
- `disablePagination="auto"` 在粗指针设备上隐藏这些按钮；`true` 始终隐藏。分页只负责滚动，从不改变选择。
- `stretch` 让标签占满可用宽度。`header-position="after"` 将标签行放在面板下方；这是项目扩展，因为 Material 将 tabs 放在内容之前。

### 面板与动效

- 面板保持挂载，通过 `v-show` 显示。未激活面板为 `inert`、`aria-hidden`，并退出布局。
- 切换时，指示器向目标延展，进入和离开的面板沿切换方向滑入。点击标签会产生裁切在标签形状内的 ripple。
- 减少动态效果会移除指示器过渡、面板动画和平滑滚动。选择仍会立即变化。

### 响应式、RTL 与状态归属

- 标签行测量自身溢出，不依赖视口。调整尺寸或条目变化后，滚动行会让当前标签保持可见。
- RTL 反转方向键、指示器移动和滑动方向。标签和徽章跟随书写方向。
- 固定布局中，在面板区域的水平触摸滑动会选择下一个可用标签；滚动布局中同一手势用于滚动标签行。从按钮、链接、输入框或其他交互内容开始的滑动会被忽略；`disable-swipe` 可关闭该行为。
- 页面负责面板内容、路由以及必须跨标签切换保留的状态。组件负责当前值、溢出测量、滚动位置和临时动效状态。

## API

内置文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。显式 `locale`、`previousPageLabel` 或 `nextPageLabel` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                   | 类型 | 用途                         |
| -------------------------------------- | ---- | ---------------------------- |
| `Tabs`                                 | 组件 | 标签行及关联面板。           |
| `TabItem`、`TabsLayout`、`TabsVariant` | 类型 | 条目结构以及布局、变体取值。 |

### 属性与模型

| 属性与模型               | 类型                                | 默认值                   | 用途                                             |
| ------------------------ | ----------------------------------- | ------------------------ | ------------------------------------------------ |
| `items`                  | `TabItem[]`                         | 必填                     | 按显示顺序排列的标签。                           |
| `label`                  | `string`                            | —                        | 标签行的无障碍名称；回退到 `aria-label` 属性。   |
| `modelValue` / `v-model` | `string`                            | 首个可用项               | 当前标签值。                                     |
| `variant`                | `'primary' \| 'secondary'`          | `'secondary'`            | 主要内容标签或内容区内的次级标签。               |
| `layout`                 | `'auto' \| 'fixed' \| 'scrollable'` | `'auto'`                 | 固定、滚动或按条目数量自动选择。                 |
| `headerPosition`         | `'before' \| 'after'`               | `'before'`               | 将标签行放在面板上方或下方；`after` 是项目扩展。 |
| `stretch`                | `boolean`                           | `false`                  | 让标签占满可用宽度。                             |
| `disablePagination`      | `boolean \| 'auto'`                 | `false`                  | 隐藏溢出按钮；`auto` 在粗指针设备上隐藏。        |
| `disableSwipe`           | `boolean`                           | `false`                  | 禁用固定布局中的触摸滑动选择。                   |
| `previousPageLabel`      | `string`                            | 本地化 `Previous page`   | 上一页按钮的无障碍名称。                         |
| `nextPageLabel`          | `string`                            | 本地化 `Next page`       | 下一页按钮的无障碍名称。                         |
| `locale`                 | `string`                            | Provider，再回退 `en-US` | 内置界面文案的语言。                             |

### 标签条目结构

| 字段        | 类型               | 用途                                 |
| ----------- | ------------------ | ------------------------------------ |
| `value`     | `string`           | 必填且唯一，供模型使用。             |
| `label`     | `string`           | 必填的可见标签文字。                 |
| `ariaLabel` | `string`           | 可见标签含糊或仅图标时的无障碍名称。 |
| `disabled`  | `boolean`          | 保持可见，但阻止激活并在导航中跳过。 |
| `badge`     | `string \| number` | 徽章文字；超过四个字符会缩写。       |

### 事件

| 事件     | 参数      | 用途                               |
| -------- | --------- | ---------------------------------- |
| `select` | `TabItem` | 标签被激活，包括再次激活当前标签。 |

### 插槽

| 插槽            | 作用域               | 用途                                        |
| --------------- | -------------------- | ------------------------------------------- |
| `panel`         | `{ item, selected }` | 每个面板的内容。                            |
| `tab-content`   | `{ item, selected }` | 替换每个标签默认的图标、文字和徽章。        |
| `icon`          | `{ item }`           | 前置图标插槽；提供时在 primary tab 中渲染。 |
| `badge`         | `{ item }`           | 替换徽章内容。                              |
| `previous-icon` | —                    | 替换上一页图标。                            |
| `next-icon`     | —                    | 替换下一页图标。                            |

### 方法

`Tabs` 不提供方法。使用 `v-model` 控制选择，使用 `layout` 或 `stretch` 控制尺寸。

## 样式

在 Tabs 根元素上设置以下项目自定义属性。标签行将选中的 primary 内容映射为 Primary，选中的 secondary 文字映射为 On Surface，未激活文字映射为 On Surface Variant，指示器映射为 Primary。

| 属性                                              | 默认值                                    | 用途                                          |
| ------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| `--yam3x-tabs-active-indicator-color`             | System `primary`                          | 两种变体的活动指示器颜色。                    |
| `--yam3x-tabs-primary-active-indicator-thickness` | `3px`                                     | Primary 活动指示器厚度。                      |
| `--yam3x-tab-selected-color`                      | Primary `primary`；Secondary `on-surface` | 已选标签文字与图标颜色。                      |
| `--yam3x-tab-font-size`                           | `14px`                                    | 标签文字字号。                                |
| `--yam3x-tab-spacing`                             | `8px`                                     | 行内标签内容间距，包括自定义 `#tab-content`。 |

避免使用会让标签目标小于 48 × 48 CSS 像素的密度。滚动标签会扩展而不是截断；52 px 起始内缩属于滚动布局，不是调用方覆盖项。

## Material 参考

[Tabs 概览](https://m3.material.io/components/tabs/overview) · [指南](https://m3.material.io/components/tabs/guidelines) · [规格](https://m3.material.io/components/tabs/specs) · [无障碍](https://m3.material.io/components/tabs/accessibility)
