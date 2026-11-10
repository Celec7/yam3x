<script setup lang="ts">
import ChipActionsExample from '../../components/demos/ChipActionsExample.vue'
import ChipFiltersExample from '../../components/demos/ChipFiltersExample.vue'
import ChipInputsExample from '../../components/demos/ChipInputsExample.vue'
import ChipStaticExample from '../../components/demos/ChipStaticExample.vue'
</script>

# Chips

Chip 是用于操作、建议、筛选和已输入值的紧凑上下文元素。Material 3 定义了四种 chip 变体：Assist、Suggestion、Filter 和 Input。请在相关组中使用它们作为补充选择，而不要用于完成或推进主要任务；主要操作请使用[按钮](/zh/components/button)。

本项目提供四种 Material 变体，并增加用于组合的辅助组件。`Chip` 是仅展示的标签（最接近的 Compose 组合：带标签的 `Surface`），`ChipSet` 只负责布局（最接近的组合：`FlowRow`），`FilterChipSet` 与 `InputChipSet` 协调选择或输入（最接近的组合：`FlowRow` 配合对应 chip，以及文本框配合 `InputChip` 子项）。这些辅助组件是项目扩展，不是额外的 Material 变体。

上下文或自动操作使用 Assist，产品生成的下一步使用 Suggestion，集合条件使用 Filter，用户输入的值使用 Input。同一体验中只使用一种选择模式。

## 示例

### 操作与建议

Assist 与 Suggestion chip 是按钮或链接。演示报告激活次数，展示 outlined 与 elevated 样式，并包含一个兼容性的禁用 chip。图标用于强调操作，但绝不能替代标签。

<div class="vp-raw yam3x-doc-demo-theme"><ChipActionsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipActionsExample.vue{vue}

:::

### 筛选

Filter chip 用于选择条件。`FilterChipSet` 渲染带标签的 toolbar，支持单选或多选、方向键移动以及可选可见标题。独立 chip 展示选中、可交互、尾部操作和禁用状态。

<div class="vp-raw yam3x-doc-demo-theme"><ChipFiltersExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipFiltersExample.vue{vue}

:::

### 输入

`InputChip` 表示一个已输入的值，并将主操作与移除操作分开。`InputChipSet` 组合文本框与多个值，支持编辑、去重、溢出、重排以及可选的表单提交。

<div class="vp-raw yam3x-doc-demo-theme"><ChipInputsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipInputsExample.vue{vue}

:::

### 展示与分组

`Chip` 仅用于展示：没有激活行为、没有焦点目标，也没有选择。`ChipSet` 只排列 chip，保持至少 8 px 间距，并可为组提供标签或纵向堆叠。

<div class="vp-raw yam3x-doc-demo-theme"><ChipStaticExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ChipStaticExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

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

## 行为与无障碍

### 操作与建议

- Assist 与 Suggestion chip 默认渲染原生 button；设置 `href` 后渲染原生链接。两者都发出 `click`；禁用 chip 会取消激活。
- 链接 chip 遵循 `target`、`rel` 和 `download`。禁用链接保留链接语义、暴露 `aria-disabled`、移除 `href` 并离开 Tab 顺序。
- 图标是装饰内容，对辅助技术隐藏。请让可见标签本身表达完整含义。
- Assist 用于作用于当前上下文的操作，Suggestion 用于提议的下一步。两者都不应推进主要工作流。

### 筛选

- 独立的 `FilterChip` 使用按钮语义与 `aria-pressed`。选择指示器是前置勾选图标，可通过 `selectionIndicator="false"` 隐藏。
- `FilterChipSet` 渲染带标签的 toolbar，而不是 grid。Tab 从一个 chip 进入；方向键在启用 chip 间移动焦点但不选择；Space 或 Enter 选择或取消选择聚焦的 chip。
- 水平 toolbar 使用左右方向键；`vertical` 使用上下方向键。方向在 RTL 中镜像，Home 与 End 移到第一个和最后一个启用 chip。
- 单选从空开始，激活已选中的 chip 会清空为 `null`。`multi` 独立切换每个值，所有值都可以清空。
- 尾部操作是独立按钮，拥有自己的无障碍名称（`trailingActionLabel`，否则使用本地化的 `actions.moreActions` 文案）。触发它只发出 `action`，不改变选择。
- 当可见标题为组命名时，`ariaLabelledby` 会替代 `label` 作为无障碍名称。`name` 与 `form` 提交选中值。
- 在强制颜色模式下，选中 chip 使用 Highlight/HighlightText，未选中的可交互 chip 保留 CanvasText 边框。

### 输入

- 独立 `InputChip` 在主操作时切换 `selected`；`@click.prevent` 会保持状态不变。主操作与移除操作是独立的 48 px 目标。
- 移除操作的无障碍名称来自 `removeLabel`，否则使用本地化的 `actions.removeItem(label)` 文案。`removable="false"` 会隐藏它。
- `InputChipSet` 将 chip 的主操作映射为编辑：点击 chip 会把值载入输入框并选中文本。Enter 添加或重命名值，Escape 取消编辑，重复值会被忽略。
- 在空输入框中连续按两次 Backspace 会移除最后一个 chip；第一次按下显示待移除选择。Backspace 或 Delete 会移除聚焦的 chip。
- `maxChips` 会在焦点离开组时把多余值折叠为 `+N` 指示器，并在组获得焦点时展开。
- `reorderable` 启用拖动重排与 Alt+方向键重排；`change` 报告 `add`、`remove`、`edit` 或 `reorder`，重排时包含索引。`name` 会将每个值随表单提交。
- 方向键在 chip 与文本框之间移动。移动在 RTL 中镜像，设置 `vertical` 后改为上下方向键。

### 展示与分组

- `Chip` 没有 button 或 link 角色，也不可聚焦。不要给它绑定事件处理器，也不要将它用于操作、筛选或输入值。
- `ChipSet` 只应用布局；选择与输入行为仍由单独的 chip 或专用的集合辅助组件负责。
- 可交互 chip 保留 48 px 交互目标，chip 之间至少 8 px，包括换行后的行之间。组标签可以是可见的或程序化的。

## API

内置界面文案可继承共享的 [LocaleProvider](/zh/components/localization) 配置。显式 `locale` 与标签属性优先；没有 provider 时，语言默认是 `en-US`。

### 导出

| 导出                           | 说明                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| `AssistChip`, `SuggestionChip` | 上下文操作与建议的下一步。                                         |
| `FilterChip`, `FilterChipSet`  | 筛选条件与带标签的选择组。                                         |
| `InputChip`, `InputChipSet`    | 已输入值与“文本框加值”的组合。                                     |
| `Chip`, `ChipSet`              | 仅展示标签与仅布局的分组。                                         |
| `FilterChipOption`             | `FilterChipSet` 选项类型：`label`、唯一 `value`、可选 `disabled`。 |

### `AssistChip` 属性与模型

| 属性 / 模型 | 类型                       | 默认值       | 说明                              |
| ----------- | -------------------------- | ------------ | --------------------------------- |
| `variant`   | `'outlined' \| 'elevated'` | `'outlined'` | 视觉样式；elevated 用于复杂背景。 |
| `disabled`  | `boolean`                  | `false`      | 阻止激活。                        |

::: details 原生按钮与链接属性

`href`、`target`、`rel` 和 `download` 渲染链接。`type`（`'button' | 'submit' | 'reset'`，默认 `'button'`）、`name`、`value` 与 `form` 在 button 模式下生效。其他属性与监听器会转发。

:::

### `AssistChip` 事件

| 事件    | 载荷         | 说明                |
| ------- | ------------ | ------------------- |
| `click` | `MouseEvent` | chip 被激活时触发。 |

### `AssistChip` 插槽

| 插槽      | 说明                         |
| --------- | ---------------------------- |
| `default` | 可见标签；无障碍名称所必需。 |
| `icon`    | 装饰性前置图标。             |

### `SuggestionChip` 属性与模型

| 属性 / 模型 | 类型                       | 默认值       | 说明                              |
| ----------- | -------------------------- | ------------ | --------------------------------- |
| `variant`   | `'outlined' \| 'elevated'` | `'outlined'` | 视觉样式；elevated 用于复杂背景。 |
| `disabled`  | `boolean`                  | `false`      | 阻止激活。                        |

::: details 原生按钮与链接属性

`href`、`target`、`rel` 和 `download` 渲染链接。`type`、`name`、`value` 与 `form` 在 button 模式下生效。其他属性与监听器会转发。

:::

### `SuggestionChip` 事件

| 事件    | 载荷         | 说明                |
| ------- | ------------ | ------------------- |
| `click` | `MouseEvent` | chip 被激活时触发。 |

### `SuggestionChip` 插槽

| 插槽      | 说明                         |
| --------- | ---------------------------- |
| `default` | 可见标签；无障碍名称所必需。 |
| `icon`    | 装饰性前置图标。             |

### `FilterChip` 属性与模型

| 属性 / 模型           | 类型                        | 默认值             | 说明                                 |
| --------------------- | --------------------------- | ------------------ | ------------------------------------ |
| `selected`            | `v-model:selected: boolean` | `false`            | 选中状态，通过 `aria-pressed` 暴露。 |
| `variant`             | `'outlined' \| 'elevated'`  | `'outlined'`       | 视觉样式。                           |
| `disabled`            | `boolean`                   | `false`            | 阻止选择与尾部操作。                 |
| `selectionIndicator`  | `boolean`                   | `true`             | 选中时显示前置勾选图标。             |
| `trailingActionLabel` | `string`                    | 本地化文案         | 独立尾部操作的无障碍名称。           |
| `locale`              | `string`                    | Provider → `en-US` | 覆盖内置界面语言。                   |

### `FilterChip` 事件

| 事件     | 载荷         | 说明                           |
| -------- | ------------ | ------------------------------ |
| `action` | `MouseEvent` | 由尾部操作触发，而非选择操作。 |

### `FilterChip` 插槽

| 插槽              | 说明                     |
| ----------------- | ------------------------ |
| `default`         | 可见标签。               |
| `icon`            | 可选装饰性前置图标。     |
| `trailing-action` | 独立尾部操作按钮的内容。 |

### `FilterChipSet` 属性与模型

| 属性 / 模型              | 类型                                  | 默认值       | 说明                                                      |
| ------------------------ | ------------------------------------- | ------------ | --------------------------------------------------------- |
| `options`                | `FilterChipOption[]`                  | 必填         | 包含 `label`、唯一 `value` 和可选 `disabled` 的选项。     |
| `label`                  | `string`                              | 必填         | 无障碍名称；没有 `ariaLabelledby` 时也作为 toolbar 标签。 |
| `modelValue`             | `v-model: string \| string[] \| null` | `null`       | 选中值、值集合或未选择。                                  |
| `multi`                  | `boolean`                             | `false`      | 启用独立多选。                                            |
| `ariaLabelledby`         | `string`                              | 未定义       | 引用可见标题；优先于 `label`。                            |
| `disabled`               | `boolean`                             | `false`      | 禁用整个 toolbar。                                        |
| `vertical`               | `boolean`                             | `false`      | 使用纵向 toolbar 与上下移动。                             |
| `variant`                | `'outlined' \| 'elevated'`            | `'outlined'` | 每个 chip 的视觉样式。                                    |
| `hideSelectionIndicator` | `boolean`                             | `false`      | 隐藏选中 chip 的前置勾选图标。                            |
| `name`, `form`           | `string`                              | 未定义       | 提交选中值；可选地关联其他表单。                          |

### `FilterChipSet` 事件

| 事件     | 载荷                         | 说明             |
| -------- | ---------------------------- | ---------------- |
| `change` | `string \| string[] \| null` | 报告新的模型值。 |

### `FilterChipSet` 插槽

| 插槽   | 作用域       | 说明                 |
| ------ | ------------ | -------------------- |
| `icon` | `{ option }` | 每个选项的前置图标。 |

### `InputChip` 属性与模型

| 属性 / 模型   | 类型                        | 默认值             | 说明                                            |
| ------------- | --------------------------- | ------------------ | ----------------------------------------------- |
| `label`       | `string`                    | 必填               | 可见标签与默认无障碍名称。                      |
| `value`       | `string`                    | 未定义             | 移除事件的值与 `data-value`；都回退到 `label`。 |
| `selected`    | `v-model:selected: boolean` | `false`            | 主操作的选中状态。                              |
| `variant`     | `'outlined' \| 'elevated'`  | `'outlined'`       | 视觉样式。                                      |
| `disabled`    | `boolean`                   | `false`            | 禁用两个操作。                                  |
| `removable`   | `boolean`                   | `true`             | 显示独立的移除操作。                            |
| `removeLabel` | `string`                    | 本地化文案         | 移除操作的无障碍名称。                          |
| `locale`      | `string`                    | Provider → `en-US` | 覆盖内置界面语言。                              |

### `InputChip` 事件

| 事件     | 载荷                                                  | 说明                                 |
| -------- | ----------------------------------------------------- | ------------------------------------ |
| `click`  | `MouseEvent`                                          | 由主操作触发；阻止它可保持选择不变。 |
| `remove` | `(value: string, event: MouseEvent \| KeyboardEvent)` | 由移除操作或 Backspace/Delete 触发。 |

### `InputChip` 插槽

| 插槽          | 说明                      |
| ------------- | ------------------------- |
| `default`     | 替换可见标签。            |
| `avatar`      | 可选头像；优先于 `icon`。 |
| `icon`        | 可选装饰性前置图标。      |
| `remove-icon` | 替换默认关闭图标。        |

### `InputChipSet` 属性与模型

| 属性 / 模型    | 类型                | 默认值  | 说明                              |
| -------------- | ------------------- | ------- | --------------------------------- |
| `label`        | `string`            | 必填    | 组标签与文本框的无障碍名称。      |
| `modelValue`   | `v-model: string[]` | `[]`    | 已接受的值。                      |
| `placeholder`  | `string`            | `''`    | 文本框占位符。                    |
| `disabled`     | `boolean`           | `false` | 禁用输入与所有 chip。             |
| `maxChips`     | `number \| null`    | `null`  | 焦点离开组时把多余值折叠为 `+N`。 |
| `vertical`     | `boolean`           | `false` | 纵向堆叠值并改变方向键移动。      |
| `reorderable`  | `boolean`           | `false` | 启用拖动与 Alt+方向键重排。       |
| `name`, `form` | `string`            | 未定义  | 提交每个值；可选地关联其他表单。  |

### `InputChipSet` 事件

| 事件     | 载荷                                                                                                 | 说明               |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| `change` | `{ type: 'add' \| 'remove' \| 'edit' \| 'reorder', value: string, oldValue?, fromIndex?, toIndex? }` | 报告已接受的变更。 |

### `InputChipSet` 插槽

| 插槽     | 作用域      | 说明                   |
| -------- | ----------- | ---------------------- |
| `avatar` | `{ value }` | 每个 chip 的头像内容。 |
| `icon`   | `{ value }` | 每个 chip 的前置图标。 |

### `Chip` 属性与模型

| 属性      | 类型                       | 默认值       | 说明                      |
| --------- | -------------------------- | ------------ | ------------------------- |
| `variant` | `'outlined' \| 'elevated'` | `'outlined'` | 视觉样式。                |
| `value`   | `string`                   | 未定义       | 标签的可选 `data-value`。 |

`Chip` 仅用于展示：没有模型、事件或激活行为。

### `Chip` 插槽

| 插槽       | 说明             |
| ---------- | ---------------- |
| `default`  | 可见标签。       |
| `icon`     | 装饰性前置图标。 |
| `trailing` | 装饰性尾部内容。 |

### `ChipSet` 属性与模型

| 属性       | 类型      | 默认值  | 说明                                      |
| ---------- | --------- | ------- | ----------------------------------------- |
| `vertical` | `boolean` | `false` | 纵向堆叠 chip。                           |
| `label`    | `string`  | 未定义  | 设置后渲染 group 角色并使用该无障碍名称。 |

### `ChipSet` 事件与插槽

`ChipSet` 不发出事件。默认插槽接收需要排列的 chip。

### 方法

所有 chip 组件都不暴露公开实例方法。

## 样式

Chip 的表面、描边、标签、选择和高度遵循 Material 系统角色，强制颜色模式仍保持选中 chip 可见。组件不提供公开自定义属性钩子：32 px 容器、8 px 圆角、48 px 交互目标、状态层与焦点处理都保留在内部。

::: details 几何与分组

可交互与仅展示 chip 共享 32 px 高度和 8 px 圆角。焦点指示器是 3 px 的 `secondary` 外环，偏移 2 px。`ChipSet`、`FilterChipSet` 与 `InputChipSet` 在各种密度设置下都保持 chip 之间至少 8 px 间距，包括换行后的行之间。Input chip set 会在组周围绘制字段描边，并在焦点位于内部时使用 `primary` 高亮。

:::

## Material 参考

[Chips 概览](https://m3.material.io/components/chips/overview) · [指南](https://m3.material.io/components/chips/guidelines) · [规格](https://m3.material.io/components/chips/specs) · [无障碍](https://m3.material.io/components/chips/accessibility)
