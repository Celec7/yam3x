<script setup lang="ts">
import ChipActionsExample from '../../components/demos/ChipActionsExample.vue'
import ChipFiltersExample from '../../components/demos/ChipFiltersExample.vue'
import ChipInputsExample from '../../components/demos/ChipInputsExample.vue'
import ChipStaticExample from '../../components/demos/ChipStaticExample.vue'
</script>

# Chips

上下文操作使用 assist chip，推荐操作使用 suggestion chip，筛选选择使用 filter chip，用户输入的值使用 input chip。`Chip`、`ChipSet`、`FilterChipSet` 和 `InputChipSet` 是项目辅助组件。

## 交互示例

### 操作与建议

<div class="vp-raw yam3x-doc-demo-theme"><ChipActionsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipActionsExample.vue{vue}

:::

### 筛选

<div class="vp-raw yam3x-doc-demo-theme"><ChipFiltersExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipFiltersExample.vue{vue}

:::

### 输入

<div class="vp-raw yam3x-doc-demo-theme"><ChipInputsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipInputsExample.vue{vue}

:::

### 展示与分组

<div class="vp-raw yam3x-doc-demo-theme"><ChipStaticExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipStaticExample.vue{vue}

:::

## 在应用中使用

按[安装指南](/zh/guide/installation)复制组件后，从应用中导入：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FilterChipSet } from './components/yam3x/filter-chip-set'

const topic = ref<string | null>(null)
const topics = [
  { label: '设计', value: 'design' },
  { label: '代码', value: 'code' },
]
</script>

<template>
  <FilterChipSet
    v-model="topic"
    label="主题"
    :options="topics"
  />
</template>
```

## API

`InputChip` 可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 文案。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`。已有标签覆盖属性优先；应用标签、数值与选择状态保留原值。

`FilterChip` 的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

### 操作与建议

`AssistChip` 和 `SuggestionChip` 接受 `variant`（默认 `outlined`，也可设为 `elevated`）、`href`、`disabled`，以及原生链接或按钮属性（`target`、`rel`、`download`、`type`、`name`、`value`、`form`）。两者发出 `click(MouseEvent)`，提供默认标签插槽和 `#icon`。

### 筛选

`FilterChip` 提供 `v-model:selected`（默认 `false`）、`variant`、`disabled`、`selectionIndicator` 和 `trailingActionLabel`。默认插槽提供标签；`#icon` 和 `#trailing-action` 添加可选内容。尾部操作发出 `action(MouseEvent)`。

`FilterChipSet` 必须提供 `options: { label, value, disabled? }[]` 和 `label`。默认单选模式下，`v-model` 为 `string | null`；设置 `multi` 后为 `string[]`。`disabled`、`vertical`、`variant`、`hideSelectionIndicator`、`name` 和 `form` 配置分组。组件发出 `change(value)`，并提供 `#icon({ option })`。

### 输入

`InputChip` 必须提供 `label`，并提供 `v-model:selected`（默认 `false`）、`value`、`variant`、`disabled`、`removable` 和 `removeLabel`。默认插槽可替换可见标签；`#avatar`、`#icon` 和 `#remove-icon` 添加内容。组件发出 `click(MouseEvent)` 和 `remove(value, MouseEvent | KeyboardEvent)`。

`InputChipSet` 必须提供 `label`，其 `string[]` 类型 `v-model` 默认为 `[]`。组件接受 `placeholder`、`disabled`、`maxChips`、`vertical`、`reorderable`、`name` 和 `form`。`#avatar({ value })` 和 `#icon({ value })` 可自定义各个 chip。`change` 事件报告添加、移除、编辑或重排；重排时包含索引。

### 展示辅助组件

`Chip` 仅用于展示，接受 `variant`（默认 `outlined`，也可设为 `elevated`）和可选 `value`，提供默认标签插槽、`#icon` 与 `#trailing`。`ChipSet` 排列子项，接受 `vertical` 和可选的无障碍 `label`。

## 行为与无障碍

为每个组提供可见或程序化标签。chip 图标是装饰内容，不能代替标签。操作 chip 使用原生按钮或链接行为；`Chip` 不提供激活行为。

独立的 `FilterChip` 使用按钮与 `aria-pressed` 语义。`FilterChipSet` 使用带标签的网格：Tab 进入一个选项，方向键移动焦点，Space 或 Enter 更改选择。单选可清空为 `null`；`multi` 启用独立多选。设置 `name` 后，选中值参与表单提交。

独立的 `InputChip` 在主操作时切换选中状态；`@click.prevent` 可取消该变化。独立的移除操作是项目拓展，默认无障碍名称为 `Remove {label}`。`InputChipSet` 将主操作用于编辑；Enter 添加值，重复值会被忽略，连续按两次 Backspace 可移除最后一个 chip。`maxChips` 在焦点离开组时收起溢出项；`reorderable` 启用拖动及 Alt+方向键重排。`name` 将当前值提交到表单。

## Material 参考

[概览](https://m3.material.io/components/chips/overview) · [指南](https://m3.material.io/components/chips/guidelines) · [规格](https://m3.material.io/components/chips/specs) · [无障碍](https://m3.material.io/components/chips/accessibility)
