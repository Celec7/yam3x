<script setup>
import DateInputExample from './demos/DateInputExample.vue'
import DateInputModesExample from './demos/DateInputModesExample.vue'
import DateInputStatesExample from './demos/DateInputStatesExample.vue'
</script>

# Date input

`DateInput` is a project extension for entering a date, a time, or both in one labeled form field. It combines the Material outlined text-field presentation with separate numeric segments, validates locale-aware values, and participates in native forms.

The closest Compose Material 3 composition is the manual-entry field inside `DatePicker` and `TimePicker` (an outlined text field); a standalone segmented editor, its bounds, and its blackout behavior are project decisions. Use `DateInput` when people type a value and the surrounding form or dialog belongs to your application. Use [Date pickers](/components/date-picker) when choosing from a calendar is the primary task, and [Time pickers](/components/time-picker) when a dial or a dedicated dialog is expected.

## Examples

### Basic

The basic example is a required field inside a native form. Submitting an empty field shows the required message and links it to the segments; entering a complete date enables submission. The form value is an ISO timestamp, and the event log records `beforeinput`, `input`, `change`, and `invalid`.

<div class="vp-raw yam3x-doc-demo-theme"><DateInputExample /></div>

::: details View demo source

<<< ./demos/DateInputExample.vue{vue}

:::

### Modes and bounds

The date, time, and date-time modes share one API. `time-format` selects a 12-hour period segment or 24-hour hours, and `show-seconds` adds a seconds segment. The bounded examples reject dates outside October 10–20, 2026 and times outside 09:00–17:00, and black out the 15th and minute 45 through the blackout callbacks.

<div class="vp-raw yam3x-doc-demo-theme"><DateInputModesExample /></div>

::: details View demo source

<<< ./demos/DateInputModesExample.vue{vue}

:::

### States

Disabled, read-only, and right-to-left fields keep the same segment structure. A disabled field keeps its value visible but omits it from form submission. A read-only field keeps its value and refuses edits. The right-to-left example uses a Hebrew locale, so the segment order and direction come from the locale rather than a direction prop.

<div class="vp-raw yam3x-doc-demo-theme"><DateInputStatesExample /></div>

::: details View demo source

<<< ./demos/DateInputStatesExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from './components/yam3x/date-input'

const value = ref<Date | null>(null)
</script>

<template>
  <form>
    <DateInput
      v-model="value"
      label="Event date"
      name="event-date"
      required
    />
  </form>
</template>
```

`v-model` contains a `Date` or `null`. The value is local time for the browser; `name` submits `currentValue.toISOString()` through a hidden input. Bind `minDate`, `maxDate`, `minTime`, and `maxTime` to constrain the accepted value.

::: details Bounds, blackout dates, and custom availability

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from './components/yam3x/date-input'

const start = ref<Date | null>(null)
const minDate = new Date(2026, 9, 10)
const maxDate = new Date(2026, 9, 20)
const isDateSelectable = (date: Date) => date.getDay() !== 0
const blackoutDates = (date: Date) => date.getDate() === 15
</script>

<template>
  <DateInput
    v-model="start"
    label="Start date"
    name="start-date"
    :min-date="minDate"
    :max-date="maxDate"
    :is-date-selectable="isDateSelectable"
    :blackout-dates="blackoutDates"
  />
</template>
```

`minTime` and `maxTime` accept `'HH:mm'`, `'HH:mm:ss'`, or `{ hour, minute, second? }`. `isDateSelectable` and `isTimeSelectable` receive the candidate value and reject it when they return `false`; `blackoutDates` and `blackoutTimes` reject when they return `true`. Bounds and availability are checked as each segment completes, and the field keeps the last accepted value.

:::

::: details Segment names and messages

`labels` overrides individual segment names with `Partial<Record<DateInputSegment, string>>`. `requiredMessage` and `invalidMessage` replace the built-in required and invalid text. An empty override hides the visible text but does not make an invalid value valid; native validity keeps a fallback message.

```vue
<DateInput
  v-model="value"
  label="Start date"
  :labels="{ month: 'Month', day: 'Day', year: 'Year' }"
  required-message="Choose a start date."
  invalid-message="That date is incomplete or unavailable."
/>
```

:::

## Behavior and accessibility

### Segments and locale

- Dates use separate month, day, and year segments ordered by the locale; date-times append hour, minute, and optional second segments.
- Typing into an empty segment does not insert mask characters. A completed segment advances focus to the next segment.
- The 12-hour format shows a localized period segment; the 24-hour format accepts hours from 0 to 23. `time-format="auto"` follows the locale.
- Project decision: in automatic hour-cycle mode, an unfinished time draft keeps its original cycle across language changes until a valid commit or clearing. Labels and segment order still update while preserving the draft and the focused segment; a language change alone does not commit a value.

### Keyboard and focus

- The group has one tab stop. Left and Right move between segments, reversing in right-to-left layouts. Up and Down adjust the active segment by one; Page Up and Page Down adjust it by five.
- Home and End select the segment minimum and maximum. Backspace and Delete clear the active segment.
- `beforeinput` is cancellable. A cancelled event leaves the segment and model unchanged.
- Focus stays on the active segment while the value updates, and the group shows a 3px inset focus outline that does not change padding.

### Forms and validation

- `required` shows a visible marker and takes part in native constraint validation. An untouched required field shows its hint; typing, leaving the group, or a native invalid event reveals the error.
- Error text is associated with the affected segments, announced as an alert, and marked with an error icon. `invalid` reports the message and a `valueMissing`, `typeMismatch`, `rangeUnderflow`, `rangeOverflow`, or `customError` reason.
- Native form reset restores the initial model value and clears validation feedback. A disabled field submits no value; a read-only field keeps its value.

### Responsive and RTL

- Segments keep their 48px targets at narrow widths; the group uses logical spacing and does not hide segments.
- Direction comes from the resolved locale. Right-to-left locales reverse the segment order and the Left and Right arrow behavior.

### State ownership

`v-model` owns the accepted `Date`. Segment drafts, the active segment, and validation feedback are internal and are discarded when an external model update arrives. The component does not open a dialog or choose a calendar; compose it with your own form, validation summary, or popup.

## API

Built-in text, segment names, and date formatting can inherit [LocaleProvider](/components/localization). Explicit `locale`, `label`, `labels`, `requiredMessage`, and `invalidMessage` take precedence. Without a provider, the client retains its browser-locale default and the server falls back to `en-US`; configure the same explicit locale for SSR.

### Exports

| Export                | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `DateInput`           | The labeled segmented editor.                                               |
| `DateInputType`       | `'date' \| 'time' \| 'datetime'`.                                           |
| `DateInputTimeFormat` | `'12' \| '24' \| 'auto'`.                                                   |
| `DateInputSegment`    | `'month' \| 'day' \| 'year' \| 'hour' \| 'minute' \| 'second' \| 'period'`. |

### Props and models

| Prop                                | Type                                           | Default                   | Description                                                                                            |
| ----------------------------------- | ---------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `modelValue` / `v-model`            | `Date \| null`                                 | `null`                    | Accepted local date or time value.                                                                     |
| `type`                              | `DateInputType`                                | `'date'`                  | Edits a date, a time, or both.                                                                         |
| `showSeconds`                       | `boolean`                                      | `false`                   | Adds a seconds segment to time and date-time modes.                                                    |
| `timeFormat`                        | `DateInputTimeFormat`                          | `'auto'`                  | Hour cycle; `auto` follows the locale.                                                                 |
| `minDate`, `maxDate`                | `Date \| null`                                 | `null`                    | Inclusive date bounds.                                                                                 |
| `minTime`, `maxTime`                | `string \| { hour, minute, second? } \| null`  | `null`                    | Inclusive time bounds as `'HH:mm[:ss]'` or a time-parts object.                                        |
| `isDateSelectable`                  | `(date: Date) => boolean`                      | All allowed               | Return `false` to reject a date.                                                                       |
| `isTimeSelectable`                  | `(time: { hour, minute, second? }) => boolean` | All allowed               | Return `false` to reject a time.                                                                       |
| `blackoutDates`                     | `(date: Date) => boolean`                      | None                      | Return `true` to reject a date.                                                                        |
| `blackoutTimes`                     | `(time: { hour, minute, second? }) => boolean` | None                      | Return `true` to reject a time.                                                                        |
| `label`                             | `string`                                       | Localized by `type`       | Visible group label and accessible name.                                                               |
| `hint`                              | `string`                                       | `''`                      | Supporting text shown until validation marks the field invalid; errors replace it.                     |
| `labels`                            | `Partial<Record<DateInputSegment, string>>`    | Localized defaults        | Overrides each segment's accessible name.                                                              |
| `disabled`, `readonly`, `required`  | `boolean`                                      | `false`                   | Native disabled, read-only, and required semantics; a required field shows a visible asterisk.         |
| `requiredMessage`, `invalidMessage` | `string`                                       | Localized defaults        | Required and invalid messages; invalid text is associated with the segments and announced as an alert. |
| `name`                              | `string`                                       | `''`                      | Form field name; submits an ISO timestamp.                                                             |
| `locale`                            | `string`                                       | Provider → browser locale | Segment order, separators, hour cycle, and labels.                                                     |

### Events

| Event               | Payload                                                                                                                   | Description                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `update:modelValue` | `Date \| null`                                                                                                            | Proposed value for `v-model`.                                |
| `beforeinput`       | `InputEvent`                                                                                                              | Cancellable DOM event fired before a segment edit.           |
| `input`             | `Date \| null`                                                                                                            | Fired after the value changes while editing.                 |
| `change`            | `Date \| null`                                                                                                            | Fired after a committed change, including leaving the group. |
| `invalid`           | `{ message: string, validity: 'valueMissing' \| 'typeMismatch' \| 'rangeUnderflow' \| 'rangeOverflow' \| 'customError' }` | Validation failure with its native reason.                   |

### Methods

Access these through a template ref.

| Member            | Signature         | Description                                         |
| ----------------- | ----------------- | --------------------------------------------------- |
| `focus()`         | `() => void`      | Focus the first segment.                            |
| `blur()`          | `() => void`      | Remove focus from the active segment.               |
| `checkValidity()` | `() => boolean`   | Report whether the current value passes validation. |
| `validityMessage` | `string` (getter) | Current validation message.                         |

## Styling

The outlined field uses Label Large for its label, Body Large for segments, and Body Small for supporting text. Focus is a 3px primary inset outline that does not change padding; invalid focus uses the error role. Set these project-defined custom properties on the `DateInput` group root. Default colors map to the applicable Text field and System roles.

| Property                                     | Description                  |
| -------------------------------------------- | ---------------------------- |
| `--yam3x-date-input-color`                   | Enabled segment text color.  |
| `--yam3x-date-input-container-shape`         | Field corner shape.          |
| `--yam3x-date-input-focused-container-color` | Focused segment background.  |
| `--yam3x-date-input-focused-color`           | Focused segment text color.  |
| `--yam3x-date-input-disabled-color`          | Disabled segment text color. |
| `--yam3x-date-input-disabled-opacity`        | Disabled segment opacity.    |

## Material references

[Date pickers](https://m3.material.io/components/date-pickers/overview) · [Time pickers](https://m3.material.io/components/time-pickers/overview) · [Text fields](https://m3.material.io/components/text-fields/overview)
