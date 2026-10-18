<script setup lang="ts">
import ChipActionsExample from './demos/ChipActionsExample.vue'
import ChipFiltersExample from './demos/ChipFiltersExample.vue'
import ChipInputsExample from './demos/ChipInputsExample.vue'
import ChipStaticExample from './demos/ChipStaticExample.vue'
</script>

# Chips

Choose assist chips for contextual actions, suggestion chips for proposed actions, filter chips for selection, and input chips for user-provided values. `Chip`, `ChipSet`, `FilterChipSet`, and `InputChipSet` are project helpers.

## Interactive examples

### Actions and suggestions

<div class="vp-raw yam3x-doc-demo-theme"><ChipActionsExample /></div>

::: details View demo source

<<< ./demos/ChipActionsExample.vue{vue}

:::

### Filters

<div class="vp-raw yam3x-doc-demo-theme"><ChipFiltersExample /></div>

::: details View demo source

<<< ./demos/ChipFiltersExample.vue{vue}

:::

### Input

<div class="vp-raw yam3x-doc-demo-theme"><ChipInputsExample /></div>

::: details View demo source

<<< ./demos/ChipInputsExample.vue{vue}

:::

### Display and grouping

<div class="vp-raw yam3x-doc-demo-theme"><ChipStaticExample /></div>

::: details View demo source

<<< ./demos/ChipStaticExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied components from your app:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FilterChipSet } from './components/yam3x/filter-chip-set'

const topic = ref<string | null>(null)
const topics = [
  { label: 'Design', value: 'design' },
  { label: 'Code', value: 'code' },
]
</script>

<template>
  <FilterChipSet
    v-model="topic"
    label="Topics"
    :options="topics"
  />
</template>
```

## API

`FilterChip` can inherit built-in interface text from [LocaleProvider](/components/localization)'s `actions` namespace. Optional `locale` overrides the language, defaulting to the provider then `en-US`; existing label props override the corresponding shared defaults.

### Actions and suggestions

`AssistChip` and `SuggestionChip` accept `variant` (`outlined` by default, or `elevated`), `href`, `disabled`, and native link or button props (`target`, `rel`, `download`, `type`, `name`, `value`, `form`). Both emit `click(MouseEvent)` and provide a label slot and `#icon`.

### Filters

`FilterChip` has `v-model:selected` (`false` by default), `variant`, `disabled`, `selectionIndicator`, and `trailingActionLabel`. Its default slot supplies the label; `#icon` and `#trailing-action` add optional content. The trailing action emits `action(MouseEvent)`.

`FilterChipSet` requires `options: { label, value, disabled? }[]` and `label`. Its `v-model` is `string | null` in the default single-select mode and `string[]` with `multi`. `disabled`, `vertical`, `variant`, `hideSelectionIndicator`, `name`, and `form` configure the group. It emits `change(value)` and provides `#icon({ option })`.

### Input

`InputChip` requires `label` and has `v-model:selected` (`false` by default), `value`, `variant`, `disabled`, `removable`, and `removeLabel`. The default slot can replace the visible label; `#avatar`, `#icon`, and `#remove-icon` add content. It emits `click(MouseEvent)` and `remove(value)`.

`InputChipSet` requires `label` and has a `string[]` `v-model` (default `[]`). It accepts `placeholder`, `disabled`, `maxChips`, `vertical`, `reorderable`, `name`, and `form`. `#avatar({ value })` and `#icon({ value })` customize each chip. Its `change` event reports `add`, `remove`, `edit`, or `reorder`, with indices for reordering.

### Display helpers

`Chip` is display-only; it accepts `variant` (`outlined` by default, or `elevated`) and optional `value`, with a label slot, `#icon`, and `#trailing`. `ChipSet` arranges children and accepts `vertical` and an optional accessible `label`.

## Behavior and accessibility

Give each group a visible or programmatic label. Chip icons are decorative and do not replace labels. Action chips use native button or link behavior; `Chip` has no activation behavior.

A standalone `FilterChip` uses button and `aria-pressed` semantics. `FilterChipSet` uses a labeled grid: Tab enters one option, arrow keys move focus, and Space or Enter changes selection. Single selection can be cleared to `null`; `multi` enables independent selection. When `name` is set, selected values participate in form submission.

A standalone `InputChip` toggles selection on its primary action; `@click.prevent` cancels that change. Its separate remove action is a project extension and defaults to the accessible name `Remove {label}`. `InputChipSet` maps the primary action to editing; Enter adds a value, duplicate values are ignored, and two Backspace presses remove the last chip. `maxChips` collapses overflow when focus leaves the group; `reorderable` enables drag and Alt+arrow reordering. `name` submits the current values with a form.

## Material references

[Overview](https://m3.material.io/components/chips/overview) · [Guidelines](https://m3.material.io/components/chips/guidelines) · [Specs](https://m3.material.io/components/chips/specs) · [Accessibility](https://m3.material.io/components/chips/accessibility)
