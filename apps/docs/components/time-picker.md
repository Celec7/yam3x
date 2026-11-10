<script setup>
import TimePickerExample from './demos/TimePickerExample.vue'
</script>

# Time pickers

Time pickers help people select and set a specific time.

`TimePicker`, `TimeInput`, and `TimePickerDialog` are Material 3 time pickers. `TimePicker` provides the dial, `TimeInput` provides manual entry, and `TimePickerDialog` composes either control behind a trigger. The dialog keeps edits provisional until confirmation; the standalone controls update immediately.

Material defines the dial, input, and modal flow. The docked presentation, automatic compact layout, optional seconds, and the `vibrant` variant are project extensions.

## Examples

### Dialog selection

The demo opens a dialog with a bound time, a 12- or 24-hour format, optional seconds, and a restricted 08:00–20:00 range. Switch between the dial and manual entry, try an out-of-range value to see the blocked confirmation, then commit or cancel. The standalone dial and input at the bottom share one value and show the composition API.

<div class="vp-raw yam3x-doc-demo-theme"><TimePickerExample /></div>

::: details View demo source

<<< ./demos/TimePickerExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

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

`TimeValue` is `{ hour: number, minute: number, second?: number }` with 24-hour values from 0 to 23, regardless of the display format. The dialog emits a confirmed value only after OK.

::: details Compose the dial and input yourself

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

Both standalone controls emit `update:modelValue` and `change` as soon as the value changes. Bind the same model to keep the dial and input synchronized.

:::

::: details Custom trigger

```vue
<TimePickerDialog v-model="time" label="Reminder time">
  <template #trigger="{ value }">
    <span>{{ value || 'Choose a time' }}</span>
  </template>
</TimePickerDialog>
```

The `trigger` slot replaces the trigger content. The surrounding button keeps the dialog's accessible name, expanded state, and open behavior.

:::

## Behavior and accessibility

### Dial and input modes

- The dial selects hour, then minute, then an optional second. In the dialog, the value is committed only through the confirmation action.
- Manual entry uses separate labeled hour, minute, and optional second fields. A one-digit value stays editable while its field is focused and is padded on blur.
- The mode toggle switches between the dial and manual entry. In constrained layouts, the dialog may open directly in input-only mode while keeping the mode toggle available.

### 12- and 24-hour time

- `format="auto"` follows the locale. The 12-hour format shows an AM/PM radio group; the 24-hour format uses hours from 0 to 23 and no period control.
- `showSeconds` adds a seconds field and a seconds face to the dial.
- In automatic hour-cycle mode, invalid input keeps its editing cycle until it is corrected or discarded, so a language change cannot reinterpret the draft. Text still follows the current language.

### Bounds and validation

- `minTime` and `maxTime` accept `TimeValue` objects and apply to both the dial and input. `isTimeSelectable` can reject individual values.
- Out-of-range manual input shows an error, marks the field invalid, and disables confirmation until it is corrected. Empty validation text does not enable confirmation.
- The dialog's confirmation remains disabled while the draft is invalid; the error is announced as an alert.

### Keyboard and focus

- Dial values are buttons; arrow keys move through the dial, Enter or Space selects a value, and the period options form a radio group.
- Tab moves from the time selectors to the period group and then to the action row. Focus indicators use a 3px secondary ring with a 2px offset.
- Input fields are text boxes named by the hour, minute, and second labels; typing, arrow keys, Home, and End keep their native editing behavior.

### Dismissal and focus

- Cancel, Escape, and scrim dismissal discard the draft and restore focus to the trigger. Docked panels also close on Escape or outside interaction.
- The trigger exposes `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` while open.
- The dialog traps focus while modal and returns focus to the trigger on close.

### Responsive and RTL

- `orientation="auto"` keeps the vertical dial when it fits, switches to a horizontal dial when height is constrained, and uses input-only mode when neither fits without scrolling.
- Docked panels stay inside the viewport and keep their trigger association. Direction follows the locale or the surrounding `dir`; time values and dial progression stay chronological.

### State ownership

`v-model` owns the confirmed value. The dialog owns its draft and validation state until confirmation or dismissal. `v-model:open` controls visibility, and `v-model:mode` follows or controls the active dial or input mode through `update:mode`. Standalone `TimePicker` and `TimeInput` own only their local draft and publish every change immediately.

## API

All three components can inherit [LocaleProvider](/components/localization) language and `timePicker` messages. Explicit `locale`, individual label props, and `dialValueLabel` take precedence. Without a provider, the client retains its browser-locale default and the server uses `en-US`; configure the same explicit locale for SSR.

### Exports

| Export                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `TimePicker`            | Standalone dial control.                                    |
| `TimeInput`             | Standalone manual-entry control.                            |
| `TimePickerDialog`      | Trigger, dialog or docked panel, and provisional selection. |
| `TimeValue`             | `{ hour: number, minute: number, second?: number }`.        |
| `TimePickerFormat`      | `'12' \| '24' \| 'auto'`.                                   |
| `TimePickerView`        | `'hour' \| 'minute' \| 'second'`.                           |
| `TimePickerMode`        | `'dial' \| 'input'`.                                        |
| `TimePickerLayoutType`  | `'vertical' \| 'horizontal'`.                               |
| `TimePickerVariant`     | `'standard' \| 'vibrant'`.                                  |
| `TimePickerCommonProps` | Props shared by all three components.                       |
| `TimePickerProps`       | Props of `TimePicker`.                                      |
| `TimeInputProps`        | Props of `TimeInput`.                                       |
| `TimePickerDialogProps` | Props of `TimePickerDialog`.                                |

### `TimePicker` props and models

| Prop                                                     | Type                               | Default                   | Description                                          |
| -------------------------------------------------------- | ---------------------------------- | ------------------------- | ---------------------------------------------------- |
| `modelValue` / `v-model`                                 | `TimeValue \| null`                | `null`                    | Current time; updates immediately.                   |
| `format`                                                 | `TimePickerFormat`                 | `'auto'`                  | Hour cycle; `auto` follows the locale.               |
| `showSeconds`                                            | `boolean`                          | `false`                   | Adds seconds to the dial and selectors.              |
| `minTime`, `maxTime`                                     | `TimeValue`                        | None                      | Inclusive time bounds.                               |
| `isTimeSelectable`                                       | `(value: TimeValue) => boolean`    | All allowed               | Return `false` to reject a time.                     |
| `layoutType`                                             | `TimePickerLayoutType`             | `'vertical'`              | Vertical or horizontal dial composition.             |
| `locale`                                                 | `string`                           | Provider → browser locale | Dial labels, period names, and spoken values.        |
| `hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel` | `string`                           | Localized defaults        | Accessible names for each selector and period group. |
| `dialValueLabel`                                         | `({ value, unit, max }) => string` | Localized defaults        | Formats each dial target's spoken name.              |
| `dialLabel`, `inputLabel`                                | `string`                           | Localized defaults        | Names of the dial and input modes.                   |

### `TimeInput` props and models

| Prop                                                     | Type                               | Default                   | Description                                                    |
| -------------------------------------------------------- | ---------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `modelValue` / `v-model`                                 | `TimeValue \| null`                | `null`                    | Current time; updates immediately.                             |
| `format`                                                 | `TimePickerFormat`                 | `'auto'`                  | Hour cycle; `auto` follows the locale.                         |
| `showSeconds`                                            | `boolean`                          | `false`                   | Adds a seconds field.                                          |
| `minTime`, `maxTime`                                     | `TimeValue`                        | None                      | Inclusive time bounds.                                         |
| `isTimeSelectable`                                       | `(value: TimeValue) => boolean`    | All allowed               | Return `false` to reject a time.                               |
| `locale`                                                 | `string`                           | Provider → browser locale | Field labels, period names, and validation messages.           |
| `hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel` | `string`                           | Localized defaults        | Accessible names for each field and period group.              |
| `dialValueLabel`                                         | `({ value, unit, max }) => string` | Localized defaults        | Accepted for composition symmetry; the input mode has no dial. |
| `dialLabel`, `inputLabel`                                | `string`                           | Localized defaults        | Names of the dial and input modes.                             |

### `TimePickerDialog` props and models

| Prop                                                     | Type                                   | Default                   | Description                                               |
| -------------------------------------------------------- | -------------------------------------- | ------------------------- | --------------------------------------------------------- |
| `modelValue` / `v-model`                                 | `TimeValue \| null`                    | `undefined`               | Confirmed time; changes only on confirmation.             |
| `open` / `v-model:open`                                  | `boolean`                              | Uncontrolled              | Controls dialog or panel visibility.                      |
| `mode` / `v-model:mode`                                  | `TimePickerMode`                       | `'dial'`                  | Active dial or input mode; changes update the model.      |
| `presentation`                                           | `'modal' \| 'docked'`                  | `'modal'`                 | Dialog surface or anchored panel.                         |
| `orientation`                                            | `'auto' \| 'vertical' \| 'horizontal'` | `'auto'`                  | Dial orientation; `auto` adapts to available space.       |
| `variant`                                                | `TimePickerVariant`                    | `'standard'`              | Color mapping; `vibrant` is a project extension.          |
| `format`                                                 | `TimePickerFormat`                     | `'auto'`                  | Hour cycle; `auto` follows the locale.                    |
| `showSeconds`                                            | `boolean`                              | `false`                   | Adds seconds to the dial and fields.                      |
| `minTime`, `maxTime`                                     | `TimeValue`                            | None                      | Inclusive time bounds.                                    |
| `isTimeSelectable`                                       | `(value: TimeValue) => boolean`        | All allowed               | Return `false` to reject a time.                          |
| `locale`                                                 | `string`                               | Provider → browser locale | Labels, period names, spoken values, and validation text. |
| `label`                                                  | `string`                               | Localized `Select time`   | Dialog name and default trigger content.                  |
| `triggerLabel`                                           | `string`                               | Localized `label`         | Accessible name of the trigger.                           |
| `disabled`                                               | `boolean`                              | `false`                   | Disables the trigger.                                     |
| `hideModeToggle`                                         | `boolean`                              | `false`                   | Removes the dial/input switch.                            |
| `hourLabel`, `minuteLabel`, `secondLabel`, `periodLabel` | `string`                               | Localized defaults        | Accessible names for each selector and period group.      |
| `dialValueLabel`                                         | `({ value, unit, max }) => string`     | Localized defaults        | Formats each dial target's spoken name.                   |
| `dialLabel`, `inputLabel`                                | `string`                               | Localized defaults        | Names of the dial and input modes.                        |
| `modeToggleLabel`, `useDialLabel`                        | `string`                               | Localized defaults        | Names of the input-mode and dial-mode toggle actions.     |
| `cancelLabel`, `confirmLabel`                            | `string`                               | Localized `Cancel` / `OK` | Action labels.                                            |

### Events

| Component                 | Event               | Payload             | Description                                      |
| ------------------------- | ------------------- | ------------------- | ------------------------------------------------ |
| `TimePicker`, `TimeInput` | `update:modelValue` | `TimeValue`         | Every value change.                              |
| `TimePicker`, `TimeInput` | `change`            | `TimeValue`         | Every value change.                              |
| `TimePickerDialog`        | `update:modelValue` | `TimeValue`         | Confirmed value, emitted once per confirmation.  |
| `TimePickerDialog`        | `change`            | `TimeValue`         | Confirmed value, emitted once per confirmation.  |
| `TimePickerDialog`        | `update:open`       | `boolean`           | Dialog or panel visibility changed.              |
| `TimePickerDialog`        | `update:mode`       | `'dial' \| 'input'` | The user switched between dial and manual entry. |

### Slots

| Component          | Slot      | Props             | Description                                                                              |
| ------------------ | --------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `TimePickerDialog` | `trigger` | `{ value, open }` | Replaces the trigger content. `value` is the formatted time and `open` opens the picker. |

`TimePicker` and `TimeInput` render no slots.

## Styling

The time picker exposes no documented custom properties. It maps Material surface, selected-state, and focus roles directly, and `variant="vibrant"` selects the project's tertiary color mapping. Dial geometry, selector sizes, and action placement follow the Material time-picker specifications.

## Material references

[Time pickers overview](https://m3.material.io/components/time-pickers/overview) · [guidelines](https://m3.material.io/components/time-pickers/guidelines) · [specs](https://m3.material.io/components/time-pickers/specs) · [accessibility](https://m3.material.io/components/time-pickers/accessibility)
