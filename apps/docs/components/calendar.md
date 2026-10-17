<script setup>
import CalendarExample from './demos/CalendarExample.vue'
</script>

# Calendar

Calendar is an embedded date-selection extension for a form, popup, or page region. It supports date and range selection without providing its own dialog or text field.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><CalendarExample /></div>

::: details View demo source

<<< ./demos/CalendarExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from './components/yam3x/calendar'

const selected = ref<string | null>(null)
</script>

<template>
  <Calendar v-model="selected" />
</template>
```

## API

| Prop                                                                                                                         | Type                                | Default                | Description                                                            |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `modelValue`                                                                                                                 | `string \| null`                    | `null`                 | Single ISO date (`YYYY-MM-DD`)                                         |
| `selection`                                                                                                                  | `'single' \| 'range'`               | `'single'`             | Single date or range selection                                         |
| `rangeStart`, `rangeEnd`                                                                                                     | `string \| null`                    | `null`                 | Range endpoints used with `selection="range"`                          |
| `startAt`                                                                                                                    | `string \| null`                    | Selected date or today | Initial month to display; does not select a date                       |
| `startView`                                                                                                                  | `'month' \| 'year' \| 'multi-year'` | `'month'`              | Initial date view                                                      |
| `minDate`, `maxDate`                                                                                                         | `string \| null`                    | None                   | Inclusive range of selectable dates                                    |
| `isDateSelectable`                                                                                                           | `(date: string) => boolean`         | All allowed            | Returning `false` disables the date                                    |
| `isSpecialDate`                                                                                                              | `(date: string) => boolean`         | None                   | Styles the date as special without changing whether it can be selected |
| `locale`                                                                                                                     | `string`                            | Browser locale         | Date format, weekday names, and first day of week                      |
| `label`                                                                                                                      | `string`                            | `'Calendar'`           | Accessible name of the calendar region                                 |
| `specialDateLabel`, `rangeStartLabel`, `rangeEndLabel`, `inRangeLabel`                                                       | `string`                            | Localized by locale    | Screen-reader descriptions for special dates and range states          |
| `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `previousMultiYearLabel`, `nextMultiYearLabel` | `string`                            | English defaults       | Accessible names for period navigation buttons.                        |

## Behavior and accessibility

Events are `update:modelValue`, `update:rangeStart`, `update:rangeEnd`, and `change`. After a range is completed, the next selection starts a new range. If the second endpoint is earlier than the start, the range restarts from that date.

The named `header` slot can replace the month/year heading and previous/next navigation. Its slot props are `view`, `periodLabel`, `canPrevious`, `canNext`, `previous`, `next`, and `toggle`. The component instance exposes the same period-navigation and toggle methods, as well as `resetActiveView()`, `updateTodayDate()`, and `focusActiveCell()` for use by composite controls.

Keyboard: arrow keys move between dates; Home/End move to the first/last day of the month; Page Up/Down change the month; Shift+Page Up/Down and Alt+Page Up/Down change the year; Shift+M opens month selection and Shift+Y opens year selection; Enter/Space select a date. The year view lets users select a year and continue to the month view; the 18-year view can be paged.

## Styling

Set these project-defined custom properties on the Calendar root. Defaults use the Date picker color roles and shared typography and motion System tokens.

| Area                                | Supported properties                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container                           | `--yam3x-calendar-container-color`, `--yam3x-calendar-container-shape`, `--yam3x-calendar-padding`                                                                                                                                                                                                                                                                                               |
| Period and weekday labels           | `--yam3x-calendar-period-button-text-color`, `--yam3x-calendar-weekday-color`, `--yam3x-calendar-weekday-font-size`, `--yam3x-calendar-weekday-font-weight`, `--yam3x-calendar-weekday-line-height`, `--yam3x-calendar-weekday-tracking`                                                                                                                                                         |
| Date labels                         | `--yam3x-calendar-date-font-size`, `--yam3x-calendar-date-font-weight`, `--yam3x-calendar-date-line-height`, `--yam3x-calendar-date-tracking`, `--yam3x-calendar-item-color`, `--yam3x-calendar-item-font-size`, `--yam3x-calendar-item-font-weight`, `--yam3x-calendar-item-line-height`, `--yam3x-calendar-item-tracking`                                                                      |
| Selected and today states           | `--yam3x-calendar-item-selected-color`, `--yam3x-calendar-item-selected-container-color`, `--yam3x-calendar-item-selected-ripple-color`, `--yam3x-calendar-item-selected-hover-color`, `--yam3x-calendar-item-selected-focus-color`, `--yam3x-calendar-item-current-outline-color`, `--yam3x-calendar-item-current-outline-thickness`, `--yam3x-calendar-date-current-outline-thickness`         |
| Special, range, and disabled states | `--yam3x-calendar-item-special-color`, `--yam3x-calendar-item-special-container-color`, `--yam3x-calendar-item-special-ripple-color`, `--yam3x-calendar-item-special-hover-color`, `--yam3x-calendar-item-special-focus-color`, `--yam3x-calendar-range-color`, `--yam3x-calendar-range-container-color`, `--yam3x-calendar-item-disabled-color`, `--yam3x-calendar-item-disabled-color-opacity` |
| Motion                              | `--yam3x-calendar-slide-animation-duration`                                                                                                                                                                                                                                                                                                                                                      |

## Material references

[Date pickers overview](https://m3.material.io/components/date-pickers/overview) · [guidelines](https://m3.material.io/components/date-pickers/guidelines)
