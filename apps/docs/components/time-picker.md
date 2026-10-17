<script setup>
import TimePickerExample from './demos/TimePickerExample.vue'
</script>

# Time pickers

Time pickers help people choose a time with a dial or text input. `TimePicker` provides the dial, `TimeInput` provides manual entry, and `TimePickerDialog` composes either control in a dialog with provisional selection and confirmation. The docked presentation, automatic compact layout, and optional seconds are project extensions.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><TimePickerExample /></div>

::: details View demo source

<<< ./demos/TimePickerExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TimePickerDialog, type TimeValue } from './components/yam3x/time-picker'

const time = ref<TimeValue>({ hour: 18, minute: 0 })
</script>

<template>
  <TimePickerDialog
    v-model="time"
    label="Reminder time"
    format="24"
  />
</template>
```

For a custom layout, compose the dial and input with one shared `TimeValue`:

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

| Component          | Role                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| `TimePicker`       | Standalone dial control. Updates `v-model` as the user selects a value.                 |
| `TimeInput`        | Standalone numeric time fields. Updates the same value shape as `TimePicker`.           |
| `TimePickerDialog` | Trigger and dialog convenience composition; keeps edits provisional until confirmation. |

`TimeValue` is `{ hour: number, minute: number, second?: number }`, using 24-hour values (`0–23`) regardless of display format. Seconds are a project extension. Pass `TimeValue` objects for `minTime` and `maxTime`; `isTimeSelectable` receives a `TimeValue`.

`TimePickerDialog` supports `open` (`v-model:open`), `presentation` (`'modal' | 'docked'`), `mode` (`'dial' | 'input'`), `orientation` (`'auto' | 'vertical' | 'horizontal'`), `format` (`'12' | '24' | 'auto'`), `variant` (`'standard' | 'vibrant'`), `showSeconds`, time bounds, `isTimeSelectable`, `locale`, `label`, `triggerLabel`, `disabled`, and accessible labels (`hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel`, `dialLabel`, `inputLabel`, `modeToggleLabel`, `useDialLabel`, `cancelLabel`, `confirmLabel`). `dialValueLabel` formats each dial target's spoken name from `{ value, unit, max }`; `hideModeToggle` removes the dial/input switch. Docked presentation, automatic compact layout, seconds, and `variant="vibrant"` are project extensions. Standalone `TimePicker` also accepts `layoutType` (`'vertical' | 'horizontal'`).

## Behavior and accessibility

Standalone controls emit `update:modelValue` and `change` immediately. `TimePickerDialog` emits `update:modelValue` and `change` once on confirmation, `update:open` when its dialog state changes, and `update:mode` when the user switches between dial and input. Cancel, Escape, and scrim dismissal discard its draft and restore focus to the trigger. Its `trigger` slot receives `value` and `open` and can customize the trigger content. Use `TimePicker` and `TimeInput` together with the same `v-model` when composing your own layout.

## Material references

[Time pickers overview](https://m3.material.io/components/time-pickers/) · [guidelines](https://m3.material.io/components/time-pickers/guidelines) · [specs](https://m3.material.io/components/time-pickers/specs) · [accessibility](https://m3.material.io/components/time-pickers/accessibility)
