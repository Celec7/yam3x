<script setup>
import DatePickerExample from './demos/DatePickerExample.vue'
</script>

# Date pickers

Date pickers help people choose a date or date range. Use `DatePicker` for one date and `DateRangePicker` for a range. Both combine calendar selection with typed input and support modal or docked presentation.

Modal range selection presents a vertically scrollable sequence of months. Single-date and docked calendars keep one-month navigation.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><DatePickerExample /></div>

::: details View demo source

<<< ./demos/DatePickerExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, DateRangePicker, type DateRangeValue } from './components/yam3x/date-picker'

const date = ref<string | null>(null)
const dateRange = ref<DateRangeValue>({ start: null, end: null })
</script>

<template>
  <DatePicker
    v-model="date"
    label="Event date"
  />
  <DateRangePicker
    v-model="dateRange"
    label="Booking dates"
  />
</template>
```

## API

Both entry points can inherit [LocaleProvider](/components/localization) language and `datePicker` messages. Explicit `locale` and existing individual label props take precedence. Without a provider, the client retains its browser-locale default and the server uses `en-US`; configure the same explicit locale for SSR.

Both components accept these props:

| Prop                                                                                                                                       | Type                            | Default                   | Description                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `mode`                                                                                                                                     | `'auto' \| 'docked' \| 'modal'` | `'auto'`                  | Adapts to Material window breakpoints or explicitly sets the presentation. |
| `open`                                                                                                                                     | `boolean`                       | Uncontrolled              | Controls the modal state; supports `v-model:open`.                         |
| `initialDate`                                                                                                                              | `string`                        | Today                     | Initial date to display.                                                   |
| `minDate`, `maxDate`                                                                                                                       | `string`                        | None                      | Selectable date bounds.                                                    |
| `yearRange`                                                                                                                                | `[number, number]`              | `[1900, 2100]`            | Year-menu range.                                                           |
| `isDateSelectable`                                                                                                                         | `(isoDate: string) => boolean`  | All allowed               | Custom disabled dates.                                                     |
| `locale`                                                                                                                                   | `string`                        | Provider → browser locale | Date format, calendar headings, and spoken date locale.                    |
| `label`                                                                                                                                    | `string`                        | Localized defaults        | Field and dialog name.                                                     |
| `startDateLabel`, `endDateLabel`                                                                                                           | `string`                        | Localized defaults        | Visible labels and accessible names for the range endpoints.               |
| `supportingText`                                                                                                                           | `string`                        | None                      | Date-format guidance or usage hint.                                        |
| `placeholder`                                                                                                                              | `string`                        | Localized date format     | Placeholder for an empty field.                                            |
| `clearable`                                                                                                                                | `boolean`                       | `false`                   | Shows a clear action.                                                      |
| `calendarLabel`, `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `confirmLabel`, `cancelLabel`, `clearLabel` | `string`                        | Localized defaults        | Accessible names and action labels for the calendar and dialog.            |

`DatePicker` uses `modelValue: string | null`. `DateRangePicker` uses `modelValue: DateRangeValue`, shaped as `{ start: string | null, end: string | null }`. Both values use ISO dates.

## Behavior and accessibility

Project decision: changing language preserves the current view, calendar focus, and provisional selection without publishing a new value. Typed dates keep their editing language for parsing, separately for each range endpoint; untouched dates reformat in the new language. A fresh edit after clearing uses the current language. Validation state is independent of its text, so empty message overrides cannot confirm an invalid range.

Both components emit `update:modelValue`, `change`, `update:open`, and `invalid`. In modal mode, selections are made in a draft: OK commits, while Cancel, Escape, or clicking the scrim discards it and restores focus to the trigger. Docked text can be edited directly; calendar selections are confirmed with the bottom action. The `auto` mode is a project convenience that selects modal or docked presentation at the Material window breakpoint.

## Styling

Set `--yam3x-date-picker-container-elevation` on the component to customize the docked or modal surface elevation.

## Material references

[Date pickers overview](https://m3.material.io/components/date-pickers/overview) · [guidelines](https://m3.material.io/components/date-pickers/guidelines) · [specs](https://m3.material.io/components/date-pickers/specs) · [accessibility](https://m3.material.io/components/date-pickers/accessibility)
