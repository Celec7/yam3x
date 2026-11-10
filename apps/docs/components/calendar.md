<script setup>
import CalendarExample from './demos/CalendarExample.vue'
import CalendarRangeExample from './demos/CalendarRangeExample.vue'
import CalendarRestrictedExample from './demos/CalendarRestrictedExample.vue'
import CalendarRtlExample from './demos/CalendarRtlExample.vue'
</script>

# Calendar

`Calendar` is a project extension that exposes a date-picker calendar as an embedded control. It supports single-date and range selection without providing its own dialog, trigger, or text field.

The closest Compose Material 3 composition is the calendar surface of `DatePicker`; presenting that surface directly in a page region or popup is a project decision. Use `Calendar` when the surrounding layout owns presentation. Use [Date pickers](/components/date-picker) when a field, modal dialog, or manual entry is part of the task.

## Examples

### Basic

The basic calendar selects one date and marks dates ending in `15` as special without disabling them. The period control opens the 18-year view, and selecting a year continues to month selection. The value line reports the selected ISO date.

<div class="vp-raw yam3x-doc-demo-theme"><CalendarExample /></div>

::: details View demo source

<<< ./demos/CalendarExample.vue{vue}

:::

### Range

Range selection stores a start and end date independently. The first activation starts a range, the second completes it, and a later activation starts a new range. A second date earlier than the start restarts the range from that date.

<div class="vp-raw yam3x-doc-demo-theme"><CalendarRangeExample /></div>

::: details View demo source

<<< ./demos/CalendarRangeExample.vue{vue}

:::

### Restricted dates

`min-date` and `max-date` bound the visible selection, and `is-date-selectable` disables individual dates. The example also marks the 15th as special, which changes its styling but not its availability. Out-of-range navigation is disabled.

<div class="vp-raw yam3x-doc-demo-theme"><CalendarRestrictedExample /></div>

::: details View demo source

<<< ./demos/CalendarRestrictedExample.vue{vue}

:::

### Right-to-left

The direction toggle mirrors the calendar with a `dir` attribute. Date values and keyboard progression stay chronological while horizontal arrow behavior reverses.

<div class="vp-raw yam3x-doc-demo-theme"><CalendarRtlExample /></div>

::: details View demo source

<<< ./demos/CalendarRtlExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from './components/yam3x/calendar'

const selected = ref<string | null>(null)
</script>

<template>
  <Calendar
    v-model="selected"
    label="Release date"
  />
</template>
```

Values are ISO dates (`YYYY-MM-DD`) or `null`. For range selection, bind `v-model:range-start` and `v-model:range-end` with `selection="range"`.

::: details Range, start view, and availability

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from './components/yam3x/calendar'

const start = ref<string | null>(null)
const end = ref<string | null>(null)
</script>

<template>
  <Calendar
    v-model:range-start="start"
    v-model:range-end="end"
    selection="range"
    label="Booking dates"
    start-at="2026-10-01"
    start-view="month"
    min-date="2026-10-01"
    max-date="2026-12-31"
    :is-date-selectable="(date) => date !== '2026-10-15'"
    :is-special-date="(date) => date.endsWith('-01')"
  />
</template>
```

`start-at` only chooses the visible month; it does not select a date. `start-view` opens the month, year, or 18-year view.

:::

::: details Custom header

```vue
<Calendar v-model="selected">
  <template #header="{ periodLabel, canPrevious, canNext, previous, next, toggle }">
    <div class="calendar-header">
      <button
        type="button"
        @click="toggle"
      >
        {{ periodLabel }}
      </button>
      <button
        type="button"
        :disabled="!canPrevious"
        @click="previous"
      >
        Previous
      </button>
      <button
        type="button"
        :disabled="!canNext"
        @click="next"
      >
        Next
      </button>
    </div>
  </template>
</Calendar>
```

The header slot replaces the period heading and navigation. `view`, `periodLabel`, `canPrevious`, `canNext`, `previous`, `next`, and `toggle` describe the active period.

:::

## Behavior and accessibility

### Periods and views

- The month view shows one 7-column grid with narrow weekday labels and full localized weekday names. Dates outside the visible month stay at full opacity.
- The period heading opens the 18-year view from the month view and returns to the month view otherwise. Month options and the 18-year list use three columns; the 18-year view can be paged by 18 years.
- Selecting a year continues to month selection. `start-view` chooses the initial view without changing the selected value.

### Selection and ranges

- Single selection exposes `aria-selected` on the selected grid cell. Today uses `aria-current="date"`.
- Range selection marks the start, end, and interior dates. A completed range restarts on the next activation; a second endpoint earlier than the start restarts from that date.
- A same-day range renders one endpoint indicator with no trailing range bar.

### Availability and special dates

- `minDate`, `maxDate`, and `isDateSelectable` disable unavailable dates and block navigation into months or years with no selectable date.
- `isSpecialDate` changes only the visual treatment and adds the special-date description; it does not disable the date.
- `specialDateLabel`, `rangeStartLabel`, `rangeEndLabel`, and `inRangeLabel` supply the spoken descriptions for those states.

### Keyboard and focus

- Arrow keys move between dates and follow the rendered grid rows. Home and End move to the first or last day of the month.
- Page Up and Page Down change the month; Shift+Page Up and Shift+Page Down, or Alt+Page Up and Alt+Page Down, change the year.
- Shift+M opens month selection and Shift+Y opens year selection. Enter or Space selects the focused date.
- One date is in the tab order at a time. The date indicator uses a 2px on-surface focus ring.

### Responsive and RTL

- The standalone surface keeps a 360px width, a 28px shape, and 48px date targets. Below the available width it scrolls horizontally instead of shrinking the targets.
- Direction comes from the surrounding `dir`. In right-to-left layouts the grid and navigation mirror while date values stay chronological.
- Reduced-motion preferences remove the view transition; forced-colors mode keeps the focus ring and selection visible.

### State ownership

`v-model`, `v-model:range-start`, and `v-model:range-end` own the accepted selection. The visible month, active view, and focused date are internal. `startAt` and `startView` are initial hints; a later model update repositions the visible month. Language changes preserve the focused date and visible period.

## API

Built-in text and date formatting can inherit [LocaleProvider](/components/localization); explicit `locale` and individual label props take precedence. Without a provider, the client retains its browser-locale default and the server uses `en-US`. Supply the same explicit locale when using SSR.

### Exports

| Export     | Description                             |
| ---------- | --------------------------------------- |
| `Calendar` | The embedded single-date or range grid. |

### Props and models

| Prop                                                                                                                         | Type                                | Default                   | Description                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `modelValue` / `v-model`                                                                                                     | `string \| null`                    | `null`                    | Selected ISO date in single mode.                                                                 |
| `selection`                                                                                                                  | `'single' \| 'range'`               | `'single'`                | Single-date or range selection.                                                                   |
| `rangeStart`, `rangeEnd`                                                                                                     | `string \| null`                    | `null`                    | Range endpoints for `selection="range"`; bind with `v-model:range-start` and `v-model:range-end`. |
| `startAt`                                                                                                                    | `string \| null`                    | Selected date or today    | Initial visible month; does not select a date.                                                    |
| `startView`                                                                                                                  | `'month' \| 'year' \| 'multi-year'` | `'month'`                 | Initial period view.                                                                              |
| `minDate`, `maxDate`                                                                                                         | `string \| null`                    | `null`                    | Inclusive range of selectable dates.                                                              |
| `isDateSelectable`                                                                                                           | `(date: string) => boolean`         | All allowed               | Return `false` to disable a date.                                                                 |
| `isSpecialDate`                                                                                                              | `(date: string) => boolean`         | None                      | Styles a date as special without changing availability.                                           |
| `locale`                                                                                                                     | `string`                            | Provider → browser locale | Date format, weekday names, first day of week, and spoken dates.                                  |
| `label`                                                                                                                      | `string`                            | Localized `Calendar`      | Accessible name of the calendar region.                                                           |
| `specialDateLabel`                                                                                                           | `string`                            | Localized `Special date`  | Spoken description for special dates.                                                             |
| `rangeStartLabel`, `rangeEndLabel`, `inRangeLabel`                                                                           | `string`                            | Localized defaults        | Spoken descriptions for range states.                                                             |
| `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `previousMultiYearLabel`, `nextMultiYearLabel` | `string`                            | Localized defaults        | Accessible names for period navigation buttons.                                                   |

### Events

| Event               | Payload                                                                          | Description                            |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------- |
| `update:modelValue` | `string \| null`                                                                 | Proposed single-date value.            |
| `update:rangeStart` | `string \| null`                                                                 | Proposed range start.                  |
| `update:rangeEnd`   | `string \| null`                                                                 | Proposed range end.                    |
| `change`            | `{ date: string \| null, rangeStart: string \| null, rangeEnd: string \| null }` | Current selection after an activation. |

### Slots

| Slot     | Props                                                                 | Description                                 |
| -------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `header` | `{ view, periodLabel, canPrevious, canNext, previous, next, toggle }` | Replaces the period heading and navigation. |

### Methods

Access these through a template ref.

| Member                  | Signature          | Description                                                                    |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------ |
| `periodLabel`           | `string` (getter)  | Current period heading.                                                        |
| `canMovePreviousPeriod` | `boolean` (getter) | Whether previous navigation is available.                                      |
| `canMoveNextPeriod`     | `boolean` (getter) | Whether next navigation is available.                                          |
| `movePreviousPeriod()`  | `() => void`       | Move to the previous month, year, or 18-year page.                             |
| `moveNextPeriod()`      | `() => void`       | Move to the next month, year, or 18-year page.                                 |
| `togglePeriod()`        | `() => void`       | Open the 18-year view from the month view; otherwise return to the month view. |
| `resetActiveView()`     | `() => void`       | Return to the initial `startView`.                                             |
| `updateTodayDate()`     | `() => void`       | Refresh the internal today value.                                              |
| `focusActiveCell()`     | `() => void`       | Focus the active date cell.                                                    |

## Styling

The calendar exposes project-defined custom properties for its container, labels, states, and motion. Defaults use the Date picker color roles and shared typography and motion System tokens. Weekday labels use the narrow Date picker format; date focus is a 2px on-surface ring on the inset date indicator.

::: details CSS overrides

| Area                                | Supported properties                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container                           | `--yam3x-calendar-container-color`, `--yam3x-calendar-container-shape`, `--yam3x-calendar-padding`                                                                                                                                                                                                                          |
| Period and weekday labels           | `--yam3x-calendar-period-button-text-color`, `--yam3x-calendar-weekday-color`, `--yam3x-calendar-weekday-font-size`, `--yam3x-calendar-weekday-font-weight`, `--yam3x-calendar-weekday-line-height`, `--yam3x-calendar-weekday-tracking`                                                                                    |
| Date labels                         | `--yam3x-calendar-date-font-size`, `--yam3x-calendar-date-font-weight`, `--yam3x-calendar-date-line-height`, `--yam3x-calendar-date-tracking`, `--yam3x-calendar-item-color`, `--yam3x-calendar-item-font-size`, `--yam3x-calendar-item-font-weight`, `--yam3x-calendar-item-line-height`, `--yam3x-calendar-item-tracking` |
| Selected and today states           | `--yam3x-calendar-item-selected-color`, `--yam3x-calendar-item-selected-container-color`, `--yam3x-calendar-item-selected-hover-color`, `--yam3x-calendar-item-current-outline-color`, `--yam3x-calendar-item-current-outline-thickness`, `--yam3x-calendar-date-current-outline-thickness`                                 |
| Special, range, and disabled states | `--yam3x-calendar-item-special-color`, `--yam3x-calendar-item-special-container-color`, `--yam3x-calendar-item-special-hover-color`, `--yam3x-calendar-range-color`, `--yam3x-calendar-range-container-color`, `--yam3x-calendar-item-disabled-color`, `--yam3x-calendar-item-disabled-color-opacity`                       |
| Motion                              | `--yam3x-calendar-slide-animation-duration`                                                                                                                                                                                                                                                                                 |

:::

## Material references

[Date pickers overview](https://m3.material.io/components/date-pickers/overview) · [guidelines](https://m3.material.io/components/date-pickers/guidelines) · [specs](https://m3.material.io/components/date-pickers/specs) · [accessibility](https://m3.material.io/components/date-pickers/accessibility)
