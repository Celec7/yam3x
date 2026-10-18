<script setup>
import TimePickerExample from '../../components/demos/TimePickerExample.vue'
</script>

# Time pickers

Time picker 通过表盘或文本输入帮助用户选择时间。`TimePicker` 提供独立表盘，`TimeInput` 提供手动输入，`TimePickerDialog` 则将控件组合进对话框，并在确认前保留临时选择。停靠呈现、紧凑布局自动适配和可选秒数属于项目扩展。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><TimePickerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TimePickerExample.vue{vue}

:::

## 在应用中导入

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

若需要自定义布局，可以让表盘和输入共用一个 `TimeValue`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TimeInput, TimePicker, type TimeValue } from './components/yam3x/time-picker'

const time = ref<TimeValue>({ hour: 18, minute: 0 })
</script>

<template>
  <TimePicker v-model="time" />
  <TimeInput v-model="time" />
</template>
```

## API

三个组件均可继承 [LocaleProvider](/zh/components/localization) 的语言和 `timePicker` 文案。显式 `locale`、独立标签属性与 `dialValueLabel` 优先。未配置 provider 时，客户端仍使用浏览器语言，服务端使用 `en-US`；SSR 应显式配置相同语言。

| 组件               | 职责                                                     |
| ------------------ | -------------------------------------------------------- |
| `TimePicker`       | 独立表盘控件，用户选择时立即更新 `v-model`。             |
| `TimeInput`        | 独立的数字时间输入，使用与 `TimePicker` 相同的值结构。   |
| `TimePickerDialog` | 触发器和对话框组合封装；确认前，编辑内容保留为临时选择。 |

`TimeValue` 的结构为 `{ hour: number, minute: number, second?: number }`，无论显示时制如何，小时都使用 24 小时值（`0–23`）。秒数属于项目扩展。`minTime`、`maxTime` 接受 `TimeValue` 对象，`isTimeSelectable` 接收一个 `TimeValue`。

`TimePickerDialog` 支持 `open`（`v-model:open`）、`presentation`（`'modal' | 'docked'`）、`mode`（`'dial' | 'input'`）、`orientation`（`'auto' | 'vertical' | 'horizontal'`）、`format`（`'12' | '24' | 'auto'`）、`variant`（`'standard' | 'vibrant'`）、`showSeconds`、时间边界、`isTimeSelectable`、`locale`、`label`、`triggerLabel`、`disabled` 和无障碍标签（`hourLabel`、`minuteLabel`、`secondLabel`、`periodLabel`、`dialLabel`、`inputLabel`、`modeToggleLabel`、`useDialLabel`、`cancelLabel`、`confirmLabel`）。`dialValueLabel` 根据 `{ value, unit, max }` 格式化每个表盘目标的读屏名称；`hideModeToggle` 会隐藏表盘/输入切换按钮。停靠呈现、紧凑布局自动适配、秒数以及 `variant="vibrant"` 属于项目扩展。独立 `TimePicker` 还接受 `layoutType`（`'vertical' | 'horizontal'`）。

## 行为与无障碍

项目决策：语言切换保留当前模式、弹窗草稿和无效输入，不确认弹窗或提交新值。自动小时制下，无效输入保留编辑时的小时周期，直到修正或丢弃，以防重新解释输入；文案仍跟随当前语言。空验证文案不会使确认按钮变为可用。

独立控件会在值变化时立即触发 `update:modelValue` 和 `change`。`TimePickerDialog` 只在确认时触发一次 `update:modelValue` 和 `change`，在对话框状态变化时触发 `update:open`，并在用户切换表盘/输入模式时触发 `update:mode`。Cancel、Escape 和点击遮罩会放弃临时选择，并把焦点还给触发器。其 `trigger` 插槽接收 `value` 和 `open`，可自定义触发器内容。若要自行组合布局，可让 `TimePicker` 与 `TimeInput` 共用同一个 `v-model`。

## Material 参考

[时间选择器概览](https://m3.material.io/components/time-pickers/) · [指南](https://m3.material.io/components/time-pickers/guidelines) · [规格](https://m3.material.io/components/time-pickers/specs) · [无障碍](https://m3.material.io/components/time-pickers/accessibility)
