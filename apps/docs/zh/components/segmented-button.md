<script setup lang="ts">
import SegmentedButtonExample from '../../components/demos/SegmentedButtonExample.vue'
import SegmentedButtonMultiExample from '../../components/demos/SegmentedButtonMultiExample.vue'
</script>

# Segmented buttons

Segmented button 是 Material 的经典控件，用于在简短、可见的选项集合中选择一个或多个值。本项目继续支持经典控件。Material 现在建议新的紧凑选择设计使用[按钮组](/zh/components/button-group)；本页不定义替代方案或迁移路径。

单选用 `SingleChoiceSegmentedButtonRow` 管理一个值，多选用 `MultiChoiceSegmentedButtonRow` 管理一组值。行内的每个 `SegmentedButton` 提供一个分段；选择、焦点和表单值由行负责。

## 示例

### 单选

该行使用 radio 语义。选中的分段显示其 icon 插槽的选中内容，禁用的分段会被跳过，`change` 事件报告前后值。表单通过 `name="view"` 提交选中值。

<div class="vp-raw yam3x-doc-demo-theme"><SegmentedButtonExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SegmentedButtonExample.vue{vue}

:::

### 多选

该行使用 checkbox 语义，并让每个值相互独立。`density="2"` 会降低视觉高度，禁用整行会将它的值从表单提交中移除。

<div class="vp-raw yam3x-doc-demo-theme"><SegmentedButtonMultiExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SegmentedButtonMultiExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from './components/yam3x/segmented-button'

const view = ref<string | null>('list')
const filters = ref(['recent'])
</script>

<template>
  <SingleChoiceSegmentedButtonRow
    v-model="view"
    aria-label="显示方式"
  >
    <SegmentedButton value="list">列表</SegmentedButton>
    <SegmentedButton value="grid">网格</SegmentedButton>
  </SingleChoiceSegmentedButtonRow>

  <MultiChoiceSegmentedButtonRow
    v-model="filters"
    aria-label="内容筛选"
  >
    <SegmentedButton value="recent">最近</SegmentedButton>
    <SegmentedButton value="saved">收藏</SegmentedButton>
  </MultiChoiceSegmentedButtonRow>
</template>
```

::: details 图标、禁用分段与表单提交

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from './components/yam3x/segmented-button'
import { Icon } from './components/yam3x/icon'

const view = ref<string | null>(null)
</script>

<template>
  <form @submit.prevent>
    <SingleChoiceSegmentedButtonRow
      v-model="view"
      name="view"
      aria-label="显示方式"
    >
      <SegmentedButton value="list">
        <template #icon="{ selected }">
          <Icon :name="selected ? 'check' : 'view_list'" />
        </template>
        列表
      </SegmentedButton>
      <SegmentedButton
        value="map"
        disabled
      >
        地图
      </SegmentedButton>
    </SingleChoiceSegmentedButtonRow>
  </form>
</template>
```

:::

每个 `value` 在其行内必须唯一。行的无障碍名称来自 `aria-label` 或 `aria-labelledby`；通常可见标题更清晰。初始模型和提交内容由应用负责。

## 行为与无障碍

### 选择语义

- 单流行暴露 `role="radiogroup"` 与 radio 分段。激活另一个分段会选中它；激活已选中的分段不会产生变化。传入 `null` 可以从无选择状态开始。
- 多流行暴露 `role="group"` 与 checkbox 分段。每次激活独立添加或移除该值，所有值都可以清空。
- 模型更新后，`change` 报告 `{ previousValue, value }`。单流行报告 `string | null`，多流行报告 `string[]`。
- 行级 `disabled` 禁用所有分段。分段自身的 `disabled` 会在选择和键盘移动中跳过它。
- 设置 `name` 后，选中的启用值会渲染为隐藏输入；禁用行不提交任何值。

### 键盘与焦点

- Tab 从某个启用分段进入行；进入后焦点停留在最近聚焦的分段。LTR 的初始停靠点是第一个启用分段，RTL 是最后一个启用分段。
- 左右方向键在启用分段间移动焦点并循环，但不会改变选择。
- Home 与 End 将焦点移到第一个和最后一个启用分段；这些按键是项目扩展。
- Space 或 Enter 通过分段原生按钮行为激活它。
- 焦点环包围 40 px 视觉分段而不是 48 px 交互目标，并且首尾分段保留整组的外侧圆角。

### 表单

- 单流行通过 `name` 提交一个隐藏值；多流行每个选中值提交一个隐藏输入。
- 禁用分段和禁用行不会提交值。原生表单重置不会改变已接受的模型。
- 隐藏输入仅用于展示且不可聚焦；分段本身才是表单控件。

### 响应式与 RTL

- 行不会换行。请保持标签简短，并让外层布局提供行内空间；相比压缩分段，横向滚动区域更合适。
- RTL 会镜像方向键方向与初始 Tab 停靠点。焦点移动和圆角半径遵循书写方向。
- 经典几何保留 48 px 交互目标；`density` 会降低视觉高度，但不会改变该目标或外侧圆角。

## API

### 导出

| 导出                                                  | 说明                             |
| ----------------------------------------------------- | -------------------------------- |
| `SegmentedButton`                                     | 行内的一个分段。                 |
| `SingleChoiceSegmentedButtonRow`                      | 单选值并使用 radio 语义的行。    |
| `MultiChoiceSegmentedButtonRow`                       | 多选值并使用 checkbox 语义的行。 |
| `SegmentedButtonChangeDetail`, `SegmentedButtonValue` | 变化载荷与模型值类型。           |

### `SingleChoiceSegmentedButtonRow` 属性与模型

| 属性 / 模型  | 类型                      | 默认值  | 说明                              |
| ------------ | ------------------------- | ------- | --------------------------------- |
| `modelValue` | `v-model: string \| null` | `null`  | 选中的分段值；`null` 表示未选择。 |
| `disabled`   | `boolean`                 | `false` | 禁用所有分段。                    |
| `name`       | `string`                  | 未定义  | 将选中的启用值作为表单字段提交。  |
| `density`    | `0 \| 1 \| 2 \| 3`        | `0`     | 每级将视觉高度降低 4 px。         |

`aria-label` 与 `aria-labelledby` 通过 attrs 转发为组名称。

### `SingleChoiceSegmentedButtonRow` 事件

| 事件     | 载荷                                                       | 说明           |
| -------- | ---------------------------------------------------------- | -------------- |
| `change` | `{ previousValue: string \| null, value: string \| null }` | 选择发生变化。 |

### `SingleChoiceSegmentedButtonRow` 插槽

| 插槽      | 说明                                        |
| --------- | ------------------------------------------- |
| `default` | `SegmentedButton` 子项；每个 `value` 唯一。 |

### `MultiChoiceSegmentedButtonRow` 属性与模型

| 属性 / 模型  | 类型                | 默认值  | 说明                                 |
| ------------ | ------------------- | ------- | ------------------------------------ |
| `modelValue` | `v-model: string[]` | `[]`    | 选中的分段值；所有值都可以清空。     |
| `disabled`   | `boolean`           | `false` | 禁用所有分段。                       |
| `name`       | `string`            | 未定义  | 将每个选中的启用值作为表单字段提交。 |
| `density`    | `0 \| 1 \| 2 \| 3`  | `0`     | 每级将视觉高度降低 4 px。            |

`aria-label` 与 `aria-labelledby` 通过 attrs 转发为组名称。

### `MultiChoiceSegmentedButtonRow` 事件

| 事件     | 载荷                                           | 说明           |
| -------- | ---------------------------------------------- | -------------- |
| `change` | `{ previousValue: string[], value: string[] }` | 选择发生变化。 |

### `MultiChoiceSegmentedButtonRow` 插槽

| 插槽      | 说明                                        |
| --------- | ------------------------------------------- |
| `default` | `SegmentedButton` 子项；每个 `value` 唯一。 |

### `SegmentedButton` 属性与模型

| 属性       | 类型      | 默认值  | 说明               |
| ---------- | --------- | ------- | ------------------ |
| `value`    | `string`  | 必填    | 在其行内唯一的值。 |
| `disabled` | `boolean` | `false` | 仅禁用此分段。     |

`SegmentedButton` 自身没有模型；选择由所在行负责。属性与监听器会转发到它的原生 button。

### `SegmentedButton` 事件

`SegmentedButton` 不发出事件。选择与 `change` 由行报告。

### `SegmentedButton` 插槽

| 插槽      | 作用域         | 说明                                             |
| --------- | -------------- | ------------------------------------------------ |
| `default` | —              | 可见标签。                                       |
| `icon`    | `{ selected }` | 前置图标内容；未提供时，选中的分段显示勾选图标。 |

### 方法

行与分段都不暴露公开实例方法。

## 样式

经典控件使用 40 px 视觉高度、1 px 描边、完整外侧圆角和 48 px 交互目标。选中分段使用 `secondary-container` 与 `on-secondary-container`；标签居中，至少 12 px 行内内边距，图标与标签间距 8 px。这些尺寸由经典规范固定。

::: details 密度与几何

`density` 每级移除 4 px 视觉高度，同时交互目标与外侧圆角保持不变。焦点环绘制在 40 px 表面周围：3 px `secondary` 外环、2 px 间隙与 8 px 内侧圆角。该组件不暴露公开自定义属性。

:::

## Material 参考

[分段按钮概览](https://m3.material.io/components/segmented-buttons/overview) · [指南](https://m3.material.io/components/segmented-buttons/guidelines) · [规格](https://m3.material.io/components/segmented-buttons/specs) · [无障碍](https://m3.material.io/components/segmented-buttons/accessibility)
