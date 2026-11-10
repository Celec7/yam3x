<script setup lang="ts">
import RadioGroupBasicExample from '../../components/demos/RadioGroupBasicExample.vue'
import RadioGroupExample from '../../components/demos/RadioGroupExample.vue'
</script>

# Radio button

单选按钮让用户从一组选项中只选择一个选项。只能从列表中选择一项时，请使用单选按钮而不是开关。

`RadioGroup` 与 `RadioButton` 在 Material 单选控件外组合了项目定义的分组包装：分组标签与说明、每个选项的补充说明、错误状态和 secondary 焦点环都是 Material 控件之外的扩展。Material 建议可见选项不超过五个时使用单选按钮。

## 示例

### 基础

分组拥有选中值并为整组命名。每个选项需要唯一的字符串 `value`，选项文字放在默认插槽中。

<div class="vp-raw yam3x-doc-demo-theme"><RadioGroupBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/RadioGroupBasicExample.vue{vue}

:::

### 选择、校验与表单

演示覆盖了项目行为：可预选并带禁用选项和选项说明的分组、从空值开始的必选分组、错误分组、带提交与重置的必选表单、分组级禁用、关联外部表单，以及不提交字段的分组。

<div class="vp-raw yam3x-doc-demo-theme"><RadioGroupExample /></div>

::: details 查看演示源码

<<< ../../components/demos/RadioGroupExample.vue{vue}

:::

未选择任何选项时，原生校验会把必选分组标记为错误；选中选项后该状态会清除。重置会恢复分组挂载时的值。

## 在应用中导入

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioButton, RadioGroup } from './components/yam3x/radio-group'

const delivery = ref<string | null>('pickup')
</script>

<template>
  <RadioGroup
    v-model="delivery"
    label="配送方式"
    name="delivery"
    required
  >
    <RadioButton value="pickup">自取</RadioButton>
    <RadioButton
      value="shipping"
      description="两个工作日内送达"
    >
      配送
    </RadioButton>
  </RadioGroup>
</template>
```

每个 `RadioButton` 都必须渲染在 `RadioGroup` 内，否则组件会报错。分组的 `name` 是提交字段名，`form` 可将它关联到子树之外的表单。

::: details 空选择、外部表单与禁用选项

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioButton, RadioGroup } from './components/yam3x/radio-group'

const layout = ref<string | null>(null)
</script>

<template>
  <form id="layout-form" />
  <RadioGroup
    v-model="layout"
    label="密度"
    name="layout"
    form="layout-form"
  >
    <RadioButton value="none">无</RadioButton>
    <RadioButton value="compact">紧凑</RadioButton>
    <RadioButton
      value="comfortable"
      disabled
    >
      舒适
    </RadioButton>
  </RadioGroup>
</template>
```

将模型保持为 `null` 可让分组从无选中状态开始，原生键盘行为允许这种状态。禁用选项仍保留在阅读顺序中，但无法被选中。若用户需要清除选择，请提供显式的“无”选项。

:::

## 行为与无障碍

### 分组语义

- 分组渲染 `role="radiogroup"`，可访问名称来自可见标签。分组说明描述整个集合；每个选项的说明与各自的 input 关联。
- `required` 设置 `aria-required` 和原生 input 的 `required`；约束校验失败时分组标记为 `aria-invalid`。
- `invalid` 为分组及其选项应用错误呈现。原生校验也会设置该状态，直到接受选择。
- 选项纵向排列。包装不提供横向方向属性。

### 选择与状态归属

- 只接受一个值。`v-model` 保存 `string | null`，`null` 表示未选择。
- 选择值是提议：保持模型不变即可拒绝，原生 input 会与接受值重新同步。
- 再次激活已选选项仍保持选中。需要清除时，请以编程方式将模型设为 `null`。
- 选项的 `disabled` 与分组的 `disabled` 合并；禁用分组会禁用所有原生单选控件。

### 键盘与焦点

- Tab 进入已选选项。没有任何选择时，Tab 进入第一个可用选项，Shift+Tab 进入最后一个。
- 方向键移动焦点和选择，在组内循环并跳过禁用选项。Space 选中聚焦的选项。
- 在 RTL 布局中，横向方向键跟随书写方向；左方向键移动到下一个选项。
- 焦点在 48px 目标区域内绘制 3px 的 `secondary` 圆环。

### 表单

- 选中的选项以分组的 `name` 提交其 `value`；未选择的分组不提交值，除非 `required` 阻止提交。
- 没有 `name` 的分组仍支持原生键盘导航，但会从提交表单数据中移除，因此不会虚构字段名。
- 原生重置恢复分组挂载时接受的值。禁用的分组不提交任何值。

## API

### 导出

| 导出          | 类型 | 用途                                     |
| ------------- | ---- | ---------------------------------------- |
| `RadioGroup`  | 组件 | 命名、校验并拥有选中值的分组。           |
| `RadioButton` | 组件 | 分组中的一个原生单选项；需要分组上下文。 |

### `RadioGroup` 属性与模型

| 属性 / 模型   | 类型             | 默认值  | 说明                                          |
| ------------- | ---------------- | ------- | --------------------------------------------- |
| `v-model`     | `string \| null` | `null`  | 接受的选中值；null 表示未选择。               |
| `label`       | `string`         | 必填    | 可见分组标签与可访问名称。                    |
| `description` | `string`         | —       | 与分组关联的补充说明。                        |
| `id`          | `string`         | —       | 分组元素 ID；标签和说明 ID 由此或生成值派生。 |
| `name`        | `string`         | 生成    | 提交字段名；未命名的分组不提交任何内容。      |
| `form`        | `string`         | —       | 按 ID 将 input 关联到表单。                   |
| `required`    | `boolean`        | `false` | 原生校验要求选择。                            |
| `disabled`    | `boolean`        | `false` | 禁用分组内所有选项。                          |
| `invalid`     | `boolean`        | `false` | 应用错误呈现与 `aria-invalid`。               |

### `RadioButton` 属性

| 属性          | 类型      | 默认值  | 说明                            |
| ------------- | --------- | ------- | ------------------------------- |
| `value`       | `string`  | 必填    | 选中该选项时提交的唯一值。      |
| `description` | `string`  | —       | 与该选项 input 关联的补充说明。 |
| `disabled`    | `boolean` | `false` | 禁止选择该选项。                |
| `id`          | `string`  | 生成    | 原生 input 的 ID。              |

默认插槽渲染可见的选项文字。

### 事件

| 事件                | 载荷             | 说明                                            |
| ------------------- | ---------------- | ----------------------------------------------- |
| `update:modelValue` | `string \| null` | 提议选中值；用 `v-model` 绑定。                 |
| `input`             | `Event`          | 从选中项转发的原生 input 事件。                 |
| `change`            | `Event`          | 转发的原生 change 事件。                        |
| `invalid`           | `Event`          | 转发的原生 invalid 事件；需要时可在分组上捕获。 |

### 插槽

`RadioButton` 有一个用于标签的默认插槽。`RadioGroup` 通过默认插槽放置选项内容。

### 方法

两个组件都不暴露实例方法。

## 样式

没有公开的组件级 CSS 自定义属性。组件映射共享 System 角色，请在 `--md-sys-color-*`、字阶、动效或密度根节点设置主题。

选项使用 20px 图标、40px 状态层和 48px 目标区域；焦点绘制 44px 的 `secondary` 圆环，描边 3px。选中与未选中图标映射到 `primary` 和 `on-surface-variant`，错误选项使用 `error`，标签使用 Body Large，说明使用 Body Medium。分组标签使用 Title Small，其说明使用 Body Medium。

## Material 参考

[Radio button 概览](https://m3.material.io/components/radio-button/overview) · [指南](https://m3.material.io/components/radio-button/guidelines) · [规格](https://m3.material.io/components/radio-button/specs) · [无障碍](https://m3.material.io/components/radio-button/accessibility)
