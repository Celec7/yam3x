<script setup>
import DatePickerExample from './demos/DatePickerExample.vue'
</script>

# Date pickers

Date pickers let people select a date, or a range of dates.

`DatePicker` and `DateRangePicker` are Material 3 date pickers. `DatePicker` selects one date and `DateRangePicker` selects a start and end date. Both combine a calendar with manual entry and support docked or modal presentation. The `auto` mode and the compact full-screen treatment are project decisions; the continuous modal range calendar follows Material range guidance.

Use a picker when choosing from a calendar is the primary task. Use [Date input](/components/date-input) when the surrounding form should own a segmented text field, and [Calendar](/components/calendar) when the calendar belongs directly in a page region or popup.

## Examples

### Modes, selection, and commits

The demo switches between adaptive, docked, and modal presentation and between one date and a range. The single picker accepts typed dates and bounds them to today through the next two years. In range mode, the docked fields edit each endpoint directly, while the modal range calendar scrolls through months continuously. The value line reports only committed values; invalid manual entry is reported separately.

<div class="vp-raw yam3x-doc-demo-theme"><DatePickerExample /></div>

::: details View demo source

<<< ./demos/DatePickerExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, DateRangePicker, type DateRangeValue } from './components/yam3x/date-picker'

const date = ref<string | null>(null)
const range = ref<DateRangeValue>({ start: null, end: null })
</script>

<template>
  <DatePicker
    v-model="date"
    label="Event date"
    min-date="2026-10-01"
  />
  <DateRangePicker
    v-model="range"
    label="Booking dates"
    start-date-label="Arrival"
    end-date-label="Departure"
  />
</template>
```

Both models use ISO dates (`YYYY-MM-DD`) or `null`. The range model is `{ start: string | null, end: string | null }`. Pass `mode="docked"` or `mode="modal"` to fix the presentation; leave it at `auto` to follow the Material window breakpoint.

::: details Controlled visibility and validation

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from './components/yam3x/date-picker'

const date = ref<string | null>(null)
const open = ref(false)
const message = ref('')

function onInvalid(raw: string) {
  message.value = `“${raw}” is not an available date.`
}
</script>

<template>
  <DatePicker
    v-model="date"
    v-model:open="open"
    label="Event date"
    :min-date="'2026-10-01'"
    :max-date="'2026-12-31'"
    :is-date-selectable="(value) => value !== '2026-10-15'"
    @invalid="onInvalid"
  />
  <p v-if="message">{{ message }}</p>
</template>
```

:::

::: details Label overrides

`calendarLabel` names the docked calendar trigger. `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, and `nextYearLabel` name period navigation. `confirmLabel`, `saveLabel`, `cancelLabel`, `closeLabel`, and `clearLabel` replace the dialog and field actions.

| Prop                                   | Default                   | Description                                     |
| -------------------------------------- | ------------------------- | ----------------------------------------------- |
| `calendarLabel`                        | Localized `Open calendar` | Accessible name of the docked calendar trigger. |
| `previousMonthLabel`, `nextMonthLabel` | Localized defaults        | Previous and next month navigation.             |
| `previousYearLabel`, `nextYearLabel`   | Localized defaults        | Previous and next year navigation.              |
| `confirmLabel`                         | Localized `OK`            | Confirms a docked or modal selection.           |
| `saveLabel`                            | Localized `Save`          | Confirms from the compact modal header.         |
| `cancelLabel`                          | Localized `Cancel`        | Discards a docked or modal selection.           |
| `closeLabel`                           | Localized `Close`         | Closes the compact modal.                       |
| `clearLabel`                           | Localized `Clear`         | Clears the accepted value.                      |

Each prop overrides the corresponding built-in locale message.

:::

## Behavior and accessibility

### Presentation and commit

- Docked pickers show the field and an anchored calendar. Calendar selections are confirmed with the bottom action, and typed dates commit on Enter or blur.
- Modal pickers keep calendar and manual-entry edits in a draft. OK commits, while Cancel, Escape, or clicking the scrim discards the draft and restores focus to the trigger. Full-screen modals also expose header close and Save actions.
- `auto` selects modal presentation at the compact breakpoint and docked presentation above it. The docked calendar flips above the field when there is not enough space below.
- In range mode, the modal calendar presents a continuous scrollable sequence of months with one weekday header and month subheads. Single-date and docked calendars page one month at a time.

### Manual entry

- Typed dates accept ISO `YYYY-MM-DD`, the locale's numeric order with `/`, `.`, `-`, or space separators, and an eight-digit compact form. No input mask is forced.
- Invalid or unavailable text is reported through `invalid` with the raw text, associated error text, and `aria-invalid`; the committed value does not change.
- In range mode, an end date earlier than the start date is rejected with the range message and is not committed.

### Calendar navigation and keyboard

- Arrow keys move between dates, Home and End move to the first or last day of the month, and Page Up and Page Down change months.
- Shift+M opens month selection and Shift+Y opens year selection. Option lists support roving focus and activation with Enter or Space.
- Docked calendars keep separate month and year controls, each with its own dropdown and range arrows. Modal calendars combine month and year into one dropdown with adjacent month arrows.
- Weekday headers use one-character labels backed by full accessible names. Dates expose complete localized names and selection state.

### Validation

- `minDate`, `maxDate`, and `isDateSelectable` define availability for both calendar and typed entry. Unavailable dates are disabled and out-of-range text is rejected.
- Validation state is independent of its text. Empty message overrides cannot confirm an invalid range.
- Project decision: changing language preserves the current view, calendar focus, and provisional selection without publishing a new value. Typed dates keep their editing language for parsing, separately for each range endpoint; untouched dates reformat in the new language.

### Responsive and RTL

- At compact widths, a bounded dialog that cannot fit becomes a full-screen modal. Docked pickers anchor to the field and stay inside the viewport.
- Layout uses logical properties: navigation icons, range bands, and field labels mirror in right-to-left layouts while chronological values stay unchanged.

### State ownership

`v-model` owns committed values and `v-model:open` owns visibility. Modal drafts, typed text, the visible month, and the active view are internal. The application owns persistence, server validation, and any business rules beyond the supplied availability callbacks. `initialDate` only chooses the initially visible month; it does not select a value.

## API

Both entry points can inherit [LocaleProvider](/components/localization) language and `datePicker` messages. Explicit `locale` and individual label props take precedence. Without a provider, the client retains its browser-locale default and the server uses `en-US`; configure the same explicit locale for SSR.

### Exports

| Export                  | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `DatePicker`            | Single-date field, calendar, and manual-entry view. |
| `DateRangePicker`       | Range field, calendar, and manual-entry view.       |
| `DateRangeValue`        | `{ start: string \| null, end: string \| null }`.   |
| `DatePickerMode`        | `'auto' \| 'docked' \| 'modal'`.                    |
| `DatePickerProps`       | Props of `DatePicker`.                              |
| `DateRangePickerProps`  | Props of `DateRangePicker`.                         |
| `DatePickerCommonProps` | Props shared by both entry points.                  |

### `DatePicker` props and models

| Prop                     | Type                           | Default                   | Description                                                                     |
| ------------------------ | ------------------------------ | ------------------------- | ------------------------------------------------------------------------------- |
| `modelValue` / `v-model` | `string \| null`               | `null`                    | Committed ISO date.                                                             |
| `mode`                   | `DatePickerMode`               | `'auto'`                  | Presentation; `auto` follows the Material window breakpoint.                    |
| `open` / `v-model:open`  | `boolean`                      | Uncontrolled              | Controls the modal or docked calendar state.                                    |
| `initialDate`            | `string`                       | Current month             | Date whose month is shown first; does not select a value.                       |
| `minDate`, `maxDate`     | `string`                       | None                      | Inclusive selectable date bounds.                                               |
| `yearRange`              | `[number, number]`             | `[1900, 2100]`            | Year-menu range.                                                                |
| `isDateSelectable`       | `(isoDate: string) => boolean` | All allowed               | Return `false` to disable a date.                                               |
| `locale`                 | `string`                       | Provider → browser locale | Date order, headings, typed parsing, and spoken date language.                  |
| `label`                  | `string`                       | Localized `Select date`   | Field and dialog name.                                                          |
| `supportingText`         | `string`                       | None                      | Format guidance or usage hint, associated with the field.                       |
| `placeholder`            | `string`                       | Localized sample date     | Placeholder for an empty field.                                                 |
| `clearable`              | `boolean`                      | `false`                   | Shows a clear action in the calendar and lets an emptied field clear the value. |

`calendarLabel`, `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `confirmLabel`, `saveLabel`, `cancelLabel`, `closeLabel`, and `clearLabel` override accessible names and actions; see the label overrides in [Use in your app](#use-in-your-app).

### `DateRangePicker` props and models

| Prop                             | Type                           | Default                             | Description                                                                     |
| -------------------------------- | ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------- |
| `modelValue` / `v-model`         | `DateRangeValue`               | `{ start: null, end: null }`        | Committed ISO range.                                                            |
| `mode`                           | `DatePickerMode`               | `'auto'`                            | Presentation; `auto` follows the Material window breakpoint.                    |
| `open` / `v-model:open`          | `boolean`                      | Uncontrolled                        | Controls the modal or docked calendar state.                                    |
| `initialDate`                    | `string`                       | Current month                       | Date whose month is shown first; does not select a range.                       |
| `minDate`, `maxDate`             | `string`                       | None                                | Inclusive selectable date bounds.                                               |
| `yearRange`                      | `[number, number]`             | `[1900, 2100]`                      | Year-menu range.                                                                |
| `isDateSelectable`               | `(isoDate: string) => boolean` | All allowed                         | Return `false` to disable a date.                                               |
| `locale`                         | `string`                       | Provider → browser locale           | Date order, headings, typed parsing, and spoken date language.                  |
| `label`                          | `string`                       | Localized `Select date`             | Field and dialog name.                                                          |
| `startDateLabel`, `endDateLabel` | `string`                       | Localized `Start date` / `End date` | Visible endpoint labels and accessible names.                                   |
| `supportingText`                 | `string`                       | None                                | Format guidance or usage hint, associated with both endpoints.                  |
| `placeholder`                    | `string`                       | Localized sample date               | Placeholder for empty endpoint fields.                                          |
| `clearable`                      | `boolean`                      | `false`                             | Shows a clear action in the calendar and lets an emptied field clear the value. |

### Events

| Event               | `DatePicker` payload | `DateRangePicker` payload | Description                                  |
| ------------------- | -------------------- | ------------------------- | -------------------------------------------- |
| `update:modelValue` | `string \| null`     | `DateRangeValue`          | Proposed committed value for `v-model`.      |
| `update:open`       | `boolean`            | `boolean`                 | Calendar visibility changed.                 |
| `change`            | `string \| null`     | `DateRangeValue`          | Committed value changed.                     |
| `invalid`           | `string`             | `string`                  | Rejected typed text, before it is committed. |

### Methods

Access these through a template ref on either component.

| Member    | Signature    | Description                                       |
| --------- | ------------ | ------------------------------------------------- |
| `open()`  | `() => void` | Open the calendar through the normal toggle path. |
| `close()` | `() => void` | Close and discard a modal draft.                  |
| `focus()` | `() => void` | Focus the calendar trigger.                       |

## Styling

The picker has no public slot API. Material defines the calendar, field, and dialog geometry; the project exposes one surface elevation hook. Set it on the component root to customize the docked or modal surface.

| Property                                  | Description                               |
| ----------------------------------------- | ----------------------------------------- |
| `--yam3x-date-picker-container-elevation` | Elevation of the docked or modal surface. |

## Material references

[Date pickers overview](https://m3.material.io/components/date-pickers/overview) · [guidelines](https://m3.material.io/components/date-pickers/guidelines) · [specs](https://m3.material.io/components/date-pickers/specs) · [accessibility](https://m3.material.io/components/date-pickers/accessibility)
