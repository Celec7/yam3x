<script setup>
import DateInputExample from './demos/DateInputExample.vue'
</script>

# Date input

DateInput is a project extension for editing localized date and time segments with the keyboard. It supports bounds and validation; the consuming app provides any surrounding form or dialog.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><DateInputExample /></div>

::: details View demo source

<<< ./demos/DateInputExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from './components/yam3x/date-input'

const value = ref<Date | null>(null)
</script>

<template>
  <DateInput
    v-model="value"
    label="Event date"
    required
    name="event-date"
  />
</template>
```

## API

Built-in text, segment names, and date formatting can inherit [LocaleProvider](/components/localization). Explicit `locale`, `label`, `labels`, `requiredMessage`, and `invalidMessage` take precedence. Without a provider, the client retains its browser-locale default and the server falls back to `en-US`; configure the same explicit locale for SSR.

| Prop                                   | Type                                        | Default                   | Description                                                                                              |
| -------------------------------------- | ------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `modelValue` / `value`                 | `Date \| null`                              | `null`                    | Localized date or time value for `v-model`; `value` is a compatibility alias.                            |
| `type`                                 | `'date' \| 'time' \| 'datetime'`            | `'date'`                  | Edits a date, time, or both.                                                                             |
| `showSeconds`                          | `boolean`                                   | `false`                   | Whether time includes seconds.                                                                           |
| `timeFormat`                           | `'12' \| '24' \| 'auto'`                    | `'auto'`                  | Hour format; `auto` follows the locale.                                                                  |
| `minDate`, `maxDate`                   | `Date \| null`                              | None                      | Date bounds                                                                                              |
| `minTime`, `maxTime`                   | `'HH:mm[:ss]' \| TimeParts \| null`         | None                      | Time bounds                                                                                              |
| `isDateSelectable`, `isTimeSelectable` | Function                                    | All allowed               | Custom date/time availability.                                                                           |
| `blackoutDates`, `blackoutTimes`       | Function                                    | None                      | Exclude dates or times from selection.                                                                   |
| `locale`                               | `string`                                    | Provider → browser locale | Segment order, separators, hour cycle, and labels.                                                       |
| `labels`                               | `Partial<Record<DateInputSegment, string>>` | Localized defaults        | Overrides each segment’s accessible name.                                                                |
| `disabled`, `readonly`, `required`     | `boolean`                                   | `false`                   | Native disabled, readonly, and required semantics; a required field shows a visible asterisk.            |
| `requiredMessage`, `invalidMessage`    | `string`                                    | Localized defaults        | Required and invalid messages; invalid text is associated with the segments and announced as an alert.   |
| `name`                                 | `string`                                    | None                      | Form field name; submits an ISO timestamp.                                                               |
| `label`                                | `string`                                    | Localized by `type`       | Visible group label and accessible name; defaults to date, time, or date and time for the selected mode. |

## Behavior and accessibility

Project decision: in automatic hour-cycle mode, an unfinished time draft retains its original cycle across language changes until a valid commit or clearing. This prevents a 12-hour edit from becoming a different 24-hour value. Labels and segment order still update while preserving drafts and the focused segment; a language change alone does not commit a value.

Events are `update:modelValue`, `update:value`, `beforeinput`, `input`, `change`, and `invalid`. Dates and date-times use separate numeric segments ordered by locale; typing into an empty segment does not insert mask characters. The 12-hour format displays localized AM/PM segments, while the 24-hour format uses hours from 0 to 23. Required state has a visible marker; error text is linked to the affected field segments and announced through an alert, with an error icon.

An empty validation-message override hides the visible text but does not make an invalid value valid; native validity retains a fallback message.

This module is an independent input control. DatePicker continues to manage transaction commits and dialog switching for its manual input mode; the two components do not share a commit lifecycle.

## Styling

Set these project-defined custom properties on the DateInput group root. Default colors map to the applicable Text field and System roles.

| Property                                     | Description                  |
| -------------------------------------------- | ---------------------------- |
| `--yam3x-date-input-color`                   | Enabled segment text color.  |
| `--yam3x-date-input-focused-container-color` | Focused segment background.  |
| `--yam3x-date-input-focused-color`           | Focused segment text color.  |
| `--yam3x-date-input-disabled-color`          | Disabled segment text color. |
| `--yam3x-date-input-disabled-opacity`        | Disabled segment opacity.    |

## Material references

[Date pickers](https://m3.material.io/components/date-pickers/overview) · [Time pickers](https://m3.material.io/components/time-pickers/) · [Text fields](https://m3.material.io/components/text-fields/overview)
