<script setup lang="ts">
import SideSheetExample from './demos/SideSheetExample.vue'
</script>

# Side sheets

Side sheets show secondary content anchored to the side of the screen. Use side sheets to provide optional content and actions without interrupting the main content.

Two variants: standard and modal. `SideSheet` addresses both through `mode`, which also accepts the project `adaptive` value and is its default.

## Examples

### Basic

The example renders the sheet inside a resizable container. Use the controls to compare `adaptive`, `modal`, and `standard` presentation, switch to RTL, change the preview width, and add a back affordance. The status line reports the `change` reason.

<div class="vp-raw yam3x-doc-demo-theme"><SideSheetExample /></div>

::: details View demo source

<<< ./demos/SideSheetExample.vue{vue}

:::

## Use in your app

Import the copied component from `./components/yam3x/side-sheet`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SideSheet } from './components/yam3x/side-sheet'

const open = ref(false)
</script>

<template>
  <SideSheet
    v-model:open="open"
    label="Settings"
    mode="adaptive"
    @change="(value, reason) => console.log(value, reason)"
  >
    <template #toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        Settings
      </button>
    </template>
    <main>Primary content</main>
    <template #headline>Settings</template>
    <template #sheet>Secondary content</template>
    <template #actions>
      <button
        type="button"
        @click="open = false"
      >
        Done
      </button>
    </template>
  </SideSheet>
</template>
```

Built-in interface text can inherit [LocaleProvider](/components/localization)'s `actions` namespace. `locale` overrides the language, defaulting to the provider then `en-US`; label props override the corresponding shared defaults.

## Behavior and accessibility

### Mode and layout

- `modal` overlays the primary content with a scrim, contains focus, and exposes `aria-modal="true"`.
- `standard` reflows the main content, keeps it interactive, and draws a divider between the two regions. It needs a container wide enough to preserve usable space for both regions.
- `adaptive` resolves per container width: below `adaptiveBreakpoint` it presents as modal, at or above it as standard. Prefer it for responsive placement; explicitly forcing standard mode below the breakpoint can leave too little room for the sheet.
- The sheet is anchored to the logical inline end, so it moves to the left in RTL.

### Focus and dismissal

- The required `label` names the side sheet dialog and supplies the headline text when `#headline` is absent.
- Both presentations expose one dialog boundary; only modal presentation sets `aria-modal="true"` and contains focus.
- Material requires that a close affordance, such as a close icon button, is always present within a side sheet. This component always renders one; `closeLabel` localizes its accessible name.
- Scrim and Escape dismissal are supplementary close paths. While closed, the panel is inert and hidden from assistive technology.
- Because the primary content behind or beside a side sheet is always visible, it's important to provide affordances for leaving a side sheet and returning to the primary content. Use `#back` for an in-sheet back affordance; no back button renders without that slot.

### Keyboard

- Tab moves through the sheet's controls in order: the back affordance when present, the close icon button, the sheet body, and the action row.
- Space or Enter activates the focused control.
- In modal presentation, Tab cycles inside the sheet, and Escape closes it and returns focus to the opening control.

### State ownership

- `v-model:open` owns visibility and can be set from outside the sheet.
- `#toggle` receives `{ expanded, controls, toggle }` for an accessible opening control in the primary content.
- `change` reports user toggles, scrim dismissal, and Escape dismissal with the new state and the reason, `toggle` or `dismiss`.
- `#actions` only renders when the slot is provided; `#sheet` scrolls vertically and independently of the primary content.

## API

### Exports

`SideSheet`, plus the `SideSheetMode` and `SideSheetToggleSlotProps` types.

### `SideSheet`

| Prop                 | Type                                  | Default               | Description                                                             |
| -------------------- | ------------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `label`              | `string`                              | Required              | Accessible name of the sheet dialog; fallback headline text.            |
| `mode`               | `'modal' \| 'standard' \| 'adaptive'` | `'adaptive'`          | Presentation, or the container-width switch between modal and standard. |
| `open`               | `v-model:open: boolean`               | `false`               | Visibility.                                                             |
| `width`              | `string`                              | `'400px'`             | Sheet width.                                                            |
| `maxWidth`           | `string`                              | `'400px'`             | Maximum sheet width.                                                    |
| `adaptiveBreakpoint` | `number`                              | `600`                 | Container width in pixels where `adaptive` switches presentations.      |
| `closeLabel`         | `string`                              | Localized default     | Accessible name of the close icon button.                               |
| `backLabel`          | `string`                              | Localized default     | Accessible name passed to the `#back` slot.                             |
| `locale`             | `string`                              | Provider then `en-US` | Language for built-in interface text.                                   |

### Events

| Event    | Payload                                          | Description                                                      |
| -------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `change` | `(open: boolean, reason: 'toggle' \| 'dismiss')` | Visibility changed through a toggle, scrim, or Escape dismissal. |

### Slots

| Slot       | Scope                            | Description                                              |
| ---------- | -------------------------------- | -------------------------------------------------------- |
| default    | —                                | Primary content, reflowed in standard presentation.      |
| `sheet`    | —                                | Sheet body; scrolls vertically on its own.               |
| `headline` | —                                | Sheet headline; `label` is the fallback.                 |
| `actions`  | —                                | Action row at the end of the sheet; omitted when unused. |
| `back`     | `{ backLabel: string }`          | Optional back affordance before the headline.            |
| `toggle`   | `{ expanded, controls, toggle }` | Opening control rendered in the primary content.         |

## Styling

The sheet uses the shared drawer container for width, maximum width, and mode transitions, so `width` and `maxWidth` are the supported size controls. Colors, typography, and spacing come from component tokens; no public style hooks are documented here.

## Material references

[Side sheets overview](https://m3.material.io/components/side-sheets/overview) · [guidelines](https://m3.material.io/components/side-sheets/guidelines) · [specs](https://m3.material.io/components/side-sheets/specs) · [accessibility](https://m3.material.io/components/side-sheets/accessibility)
