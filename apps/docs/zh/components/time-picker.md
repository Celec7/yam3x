<script setup>
import TimePickerExample from '../../components/demos/TimePickerExample.vue'
</script>

# 时间选择器

时间选择器帮助用户选择并设定一个具体时间。

`TimePicker`、`TimeInput` 和 `TimePickerDialog` 是 Material 3 时间选择器。`TimePicker` 提供表盘，`TimeInput` 提供手动输入，`TimePickerDialog` 将任一控件组合到触发器之后。对话框在确认前保留临时编辑；独立控件会立即更新。

Material 定义表盘、输入和模态流程。停靠呈现、紧凑布局自动适配、可选秒数以及 `vibrant` 变体属于项目拓展。

## 示例

### 对话框选择

演示打开一个对话框，其中绑定了时间、12 或 24 小时制、可选秒数，并限制在 08:00–20:00。可在表盘和手动输入之间切换，尝试超出范围的值以查看被阻止的确认，然后提交或取消。底部的独立表盘和输入共享同一个值，展示组合 API。

<div class="vp-raw yam3x-doc-demo-theme"><TimePickerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TimePickerExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件。使用 `./components/yam3x/` 之类的使用者路径；演示源码中的 `@registry` 路径仅用于本站。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TimePickerDialog, type TimeValue } from './components/yam3x/time-picker'

const time = ref<TimeValue>({ hour: 18, minute: 0 })
</script>

<template>
  <TimePickerDialog
    v-model="time"
    label="提醒时间"
    format="24"
  />
</template>
```

`TimeValue` 的结构为 `{ hour: number, minute: number, second?: number }`，无论显示时制如何，小时都使用 0 到 23 的 24 小时值。对话框只在点击“确定”后提交确认值。

::: details 自行组合表盘和输入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TimeInput, TimePicker, type TimeValue } from './components/yam3x/time-picker'

const time = ref<TimeValue>({ hour: 8, minute: 30 })
</script>

<template>
  <TimePicker
    v-model="time"
    format="12"
    :min-time="{ hour: 8, minute: 0 }"
  />
  <TimeInput
    v-model="time"
    format="12"
  />
</template>
```

两个独立控件都会在值变化时立即触发 `update:modelValue` 和 `change`。绑定同一个模型可让表盘和输入保持同步。

:::

::: details 自定义触发器

```vue
<TimePickerDialog v-model="time" label="提醒时间">
  <template #trigger="{ value }">
    <span>{{ value || '选择时间' }}</span>
  </template>
</TimePickerDialog>
```

`trigger` 插槽替换触发器内容。外层按钮保留对话框的无障碍名称、展开状态和打开行为。

:::

## 行为与无障碍

### 表盘与输入模式

- 表盘依次选择小时、分钟和可选的秒。在对话框中，只有确认操作才会提交值。
- 手动输入使用独立命名的时、分和可选秒字段。字段聚焦时保留一位数字，失焦时补零。
- 模式切换按钮在表盘和手动输入之间切换。在受限布局中，对话框可能直接以仅输入模式打开，同时保留模式切换。

### 12 与 24 小时制

- `format="auto"` 跟随语言区域。12 小时制显示上午/下午单选组；24 小时制使用 0 到 23 的小时，且没有时段控件。
- `showSeconds` 增加秒字段和表盘上的秒面。
- 在自动小时制模式下，无效输入会保留编辑时的小时周期，直到修正或丢弃，因此语言切换不会重新解释草稿。文案仍跟随当前语言。

### 范围与校验

- `minTime` 和 `maxTime` 接受 `TimeValue` 对象，并同时约束表盘和输入。`isTimeSelectable` 可以拒绝单个值。
- 超出范围的手动输入会显示错误、将字段标记为无效，并禁用确认，直到修正。空校验文案不会使确认变为可用。
- 草稿无效时，对话框的确认保持禁用；错误会作为 alert 播报。

### 键盘与焦点

- 表盘上的值是按钮；方向键在表盘间移动，Enter 或 Space 选择值，时段选项组成单选组。
- Tab 从时间选择器移到时段组，再到操作行。焦点指示器使用 3px secondary 轮廓，偏移 2px。
- 输入字段是由时、分、秒标签命名的文本框；输入、方向键、Home 和 End 保留原生编辑行为。

### 关闭与焦点

- 取消、Escape 和点击遮罩会放弃草稿，并将焦点还给触发器。停靠面板也会在 Escape 或外部交互时关闭。
- 触发器公开 `aria-haspopup="dialog"`、`aria-expanded`，打开时还公开 `aria-controls`。
- 模态对话框会限制焦点，并在关闭时将焦点返回触发器。

### 响应式与从右向左

- `orientation="auto"` 在空间足够时保持纵向表盘，在高度受限时切换为横向表盘，在两者都无法完整显示时使用仅输入模式。
- 停靠面板保持在视口内，并维持与触发器的关联。方向跟随语言区域或外层 `dir`；时间值和表盘推进顺序保持时间顺序。

### 状态归属

`v-model` 拥有确认后的值。对话框在确认或关闭前拥有草稿和校验状态。`v-model:open` 控制可见性，`v-model:mode` 通过 `update:mode` 跟随或控制当前的表盘或输入模式。独立的 `TimePicker` 和 `TimeInput` 只拥有本地草稿，并立即发布每次变化。

## API

三个组件均可继承 [LocaleProvider](/zh/components/localization) 的语言和 `timePicker` 文案。显式 `locale`、独立标签属性与 `dialValueLabel` 优先。未配置 provider 时，客户端仍使用浏览器语言，服务端使用 `en-US`；SSR 应显式配置相同语言。

### 导出

| 导出                    | 说明                                                  |
| ----------------------- | ----------------------------------------------------- |
| `TimePicker`            | 独立表盘控件。                                        |
| `TimeInput`             | 独立手动输入控件。                                    |
| `TimePickerDialog`      | 触发器、对话框或停靠面板，以及临时选择。              |
| `TimeValue`             | `{ hour: number, minute: number, second?: number }`。 |
| `TimePickerFormat`      | `'12' \| '24' \| 'auto'`。                            |
| `TimePickerView`        | `'hour' \| 'minute' \| 'second'`。                    |
| `TimePickerMode`        | `'dial' \| 'input'`。                                 |
| `TimePickerLayoutType`  | `'vertical' \| 'horizontal'`。                        |
| `TimePickerVariant`     | `'standard' \| 'vibrant'`。                           |
| `TimePickerCommonProps` | 三个组件共享的属性。                                  |
| `TimePickerProps`       | `TimePicker` 的属性。                                 |
| `TimeInputProps`        | `TimeInput` 的属性。                                  |
| `TimePickerDialogProps` | `TimePickerDialog` 的属性。                           |

### `TimePicker` 属性与模型

| 属性                                                     | 类型                               | 默认值                | 说明                           |
| -------------------------------------------------------- | ---------------------------------- | --------------------- | ------------------------------ |
| `modelValue` / `v-model`                                 | `TimeValue \| null`                | `null`                | 当前时间；立即更新。           |
| `format`                                                 | `TimePickerFormat`                 | `'auto'`              | 小时制；`auto` 跟随语言区域。  |
| `showSeconds`                                            | `boolean`                          | `false`               | 在表盘和选择器中增加秒。       |
| `minTime`, `maxTime`                                     | `TimeValue`                        | 无                    | 包含边界的时间范围。           |
| `isTimeSelectable`                                       | `(value: TimeValue) => boolean`    | 全部允许              | 返回 `false` 时拒绝该时间。    |
| `layoutType`                                             | `TimePickerLayoutType`             | `'vertical'`          | 纵向或横向表盘组合。           |
| `locale`                                                 | `string`                           | Provider → 浏览器语言 | 表盘标签、时段名称和朗读值。   |
| `hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel` | `string`                           | 本地化默认值          | 各选择器和时段组的无障碍名称。 |
| `dialValueLabel`                                         | `({ value, unit, max }) => string` | 本地化默认值          | 格式化每个表盘目标的读屏名称。 |
| `dialLabel`, `inputLabel`                                | `string`                           | 本地化默认值          | 表盘和输入模式的名称。         |

### `TimeInput` 属性与模型

| 属性                                                     | 类型                               | 默认值                | 说明                                 |
| -------------------------------------------------------- | ---------------------------------- | --------------------- | ------------------------------------ |
| `modelValue` / `v-model`                                 | `TimeValue \| null`                | `null`                | 当前时间；立即更新。                 |
| `format`                                                 | `TimePickerFormat`                 | `'auto'`              | 小时制；`auto` 跟随语言区域。        |
| `showSeconds`                                            | `boolean`                          | `false`               | 增加秒字段。                         |
| `minTime`, `maxTime`                                     | `TimeValue`                        | 无                    | 包含边界的时间范围。                 |
| `isTimeSelectable`                                       | `(value: TimeValue) => boolean`    | 全部允许              | 返回 `false` 时拒绝该时间。          |
| `locale`                                                 | `string`                           | Provider → 浏览器语言 | 字段标签、时段名称和校验消息。       |
| `hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel` | `string`                           | 本地化默认值          | 各字段和时段组的无障碍名称。         |
| `dialValueLabel`                                         | `({ value, unit, max }) => string` | 本地化默认值          | 为组合对称而接受；输入模式没有表盘。 |
| `dialLabel`, `inputLabel`                                | `string`                           | 本地化默认值          | 表盘和输入模式的名称。               |

### `TimePickerDialog` 属性与模型

| 属性                                                     | 类型                                   | 默认值                 | 说明                                 |
| -------------------------------------------------------- | -------------------------------------- | ---------------------- | ------------------------------------ |
| `modelValue` / `v-model`                                 | `TimeValue \| null`                    | `undefined`            | 确认后的时间；仅在确认时变化。       |
| `open` / `v-model:open`                                  | `boolean`                              | 非受控                 | 控制对话框或面板的可见性。           |
| `mode` / `v-model:mode`                                  | `TimePickerMode`                       | `'dial'`               | 当前表盘或输入模式；变化会更新模型。 |
| `presentation`                                           | `'modal' \| 'docked'`                  | `'modal'`              | 对话框表面或锚定面板。               |
| `orientation`                                            | `'auto' \| 'vertical' \| 'horizontal'` | `'auto'`               | 表盘方向；`auto` 根据可用空间适配。  |
| `variant`                                                | `TimePickerVariant`                    | `'standard'`           | 颜色映射；`vibrant` 属于项目拓展。   |
| `format`                                                 | `TimePickerFormat`                     | `'auto'`               | 小时制；`auto` 跟随语言区域。        |
| `showSeconds`                                            | `boolean`                              | `false`                | 在表盘和字段中增加秒。               |
| `minTime`, `maxTime`                                     | `TimeValue`                            | 无                     | 包含边界的时间范围。                 |
| `isTimeSelectable`                                       | `(value: TimeValue) => boolean`        | 全部允许               | 返回 `false` 时拒绝该时间。          |
| `locale`                                                 | `string`                               | Provider → 浏览器语言  | 标签、时段名称、朗读值和校验文案。   |
| `label`                                                  | `string`                               | 本地化 `Select time`   | 对话框名称和默认触发器内容。         |
| `triggerLabel`                                           | `string`                               | 本地化 `label`         | 触发器的无障碍名称。                 |
| `disabled`                                               | `boolean`                              | `false`                | 禁用触发器。                         |
| `hideModeToggle`                                         | `boolean`                              | `false`                | 移除表盘/输入切换。                  |
| `hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel` | `string`                               | 本地化默认值           | 各选择器和时段组的无障碍名称。       |
| `dialValueLabel`                                         | `({ value, unit, max }) => string`     | 本地化默认值           | 格式化每个表盘目标的读屏名称。       |
| `dialLabel`, `inputLabel`                                | `string`                               | 本地化默认值           | 表盘和输入模式的名称。               |
| `modeToggleLabel`, `useDialLabel`                        | `string`                               | 本地化默认值           | 输入模式和表盘模式切换操作的名称。   |
| `cancelLabel`, `confirmLabel`                            | `string`                               | 本地化 `Cancel` / `OK` | 操作标签。                           |

### 事件

| 组件                      | 事件                | 载荷                | 说明                           |
| ------------------------- | ------------------- | ------------------- | ------------------------------ |
| `TimePicker`, `TimeInput` | `update:modelValue` | `TimeValue`         | 每次值变化。                   |
| `TimePicker`, `TimeInput` | `change`            | `TimeValue`         | 每次值变化。                   |
| `TimePickerDialog`        | `update:modelValue` | `TimeValue`         | 确认后的值，每次确认触发一次。 |
| `TimePickerDialog`        | `change`            | `TimeValue`         | 确认后的值，每次确认触发一次。 |
| `TimePickerDialog`        | `update:open`       | `boolean`           | 对话框或面板可见性发生变化。   |
| `TimePickerDialog`        | `update:mode`       | `'dial' \| 'input'` | 用户在表盘和手动输入之间切换。 |

### 插槽

| 组件               | 插槽      | 属性              | 说明                                                          |
| ------------------ | --------- | ----------------- | ------------------------------------------------------------- |
| `TimePickerDialog` | `trigger` | `{ value, open }` | 替换触发器内容。`value` 是格式化后的时间，`open` 打开选择器。 |

`TimePicker` 和 `TimeInput` 不渲染插槽。

## 样式

时间选择器不公开文档化的自定义属性。它直接将 Material 的表面、选中状态和焦点角色映射到样式，`variant="vibrant"` 会选择项目定义的三级颜色映射。表盘几何、选择器尺寸和操作位置遵循 Material 时间选择器规格。

## Material 参考

[时间选择器概览](https://m3.material.io/components/time-pickers/overview) · [指南](https://m3.material.io/components/time-pickers/guidelines) · [规格](https://m3.material.io/components/time-pickers/specs) · [无障碍](https://m3.material.io/components/time-pickers/accessibility)
