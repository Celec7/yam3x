<script setup lang="ts">
import SplitButtonExample from './demos/SplitButtonExample.vue'
import SplitButtonCompositionExample from './demos/SplitButtonCompositionExample.vue'
import SplitButtonPopupExample from './demos/SplitButtonPopupExample.vue'
</script>

# Split buttons

Split buttons pair a primary action with a separate menu for related choices. Make the direct action and the menu trigger independently understandable and operable.

## Interactive examples

### Split button

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonExample /></div>

::: details View demo source

<<< ./demos/SplitButtonExample.vue{vue}

:::

### SplitButtonLayout composition

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonCompositionExample /></div>

::: details View demo source

<<< ./demos/SplitButtonCompositionExample.vue{vue}

:::

### Custom popup

Use the `#popup` slot when the expand button should open content other than a menu.

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonPopupExample /></div>

::: details View demo source

<<< ./demos/SplitButtonPopupExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { SplitButton, type MenuItem } from './components/yam3x/split-button'

const items: MenuItem[] = [
  { value: 'save', label: 'Save' },
  { value: 'copy', label: 'Save a copy' },
]

function save(): void {
  console.log('Saved')
}
</script>

<template>
  <SplitButton
    label="Save"
    :items="items"
    @click="save"
    menu-label="Save options"
  />
</template>
```

## Compose the two segments

Use the composition API when the caller needs direct control of the two buttons or popup. `SplitButtonLayout` provides the shared variant, size, shape, and spacing; its `#leading` and `#trailing` slots hold independently implemented controls. Spacing defaults to the 2px Material value and can be overridden with the `spacing` prop. `SplitButtonTrailingButton` exposes its expanded state through `v-model:checked`. The layout does not own menu state or content.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from './components/yam3x/menu'
import {
  SplitButtonLayout,
  SplitButtonLeadingButton,
  SplitButtonTrailingButton,
} from './components/yam3x/split-button'

const open = ref(false)
const items: MenuItem[] = [{ value: 'copy', label: 'Save a copy' }]
function save(): void {
  console.log('Saved')
}
</script>

<template>
  <SplitButtonLayout
    aria-label="Save actions"
    spacing="4px"
  >
    <template #leading>
      <SplitButtonLeadingButton @click="save">Save</SplitButtonLeadingButton>
    </template>
    <template #trailing>
      <Menu
        v-model:open="open"
        :items="items"
        label="Save options"
      >
        <template #trigger="{ triggerProps }">
          <SplitButtonTrailingButton
            v-bind="triggerProps"
            v-model:checked="open"
            aria-label="More save options"
          />
        </template>
      </Menu>
    </template>
  </SplitButtonLayout>
</template>
```

## API

Generated menu names can inherit [LocaleProvider](/components/localization)'s `actions` messages. Optional `locale` overrides the language, defaulting to the provider then `en-US`. Existing label overrides take precedence.

Provide concise primary-action text with `label` or the default slot, and use `#icon` for an icon. The primary action forwards native button attributes, form attributes, or `href`. `@click` responds only to the primary action. If the default slot contains text and you want a related name for the expand button, also set `menu-button-label`. Give an icon-only primary button an `aria-label`.

Pass `items` to use the existing Menu keyboard, focus, positioning, and dismissal behavior. Control its state with `v-model:open`; `@beforetoggle`, `@toggle`, `@beforeselect`, and `@select` forward Menu events. `menu-label` names the menu, while `menu-button-label` overrides the expand button’s accessible name. Use `#menu-icon` to customize leading icons. Where the viewport allows, the menu aligns with the expand button’s inline-start edge and maintains a 4px gap.

Use `#popup` when the button should open other content such as a card. It receives `{ anchor, open, close, popupId }`. The slot renders in a positioning context matching the expand button, so an absolutely positioned popup can open below it with `inset-block-start: calc(100% + 4px); inset-inline-start: 0`. Slotted content controls its final placement, semantics, and interactions. Use `popupId` to connect `aria-controls`, and `popupRole` to identify the popup type. For menus, prefer the built-in `items` path; a custom popup declaring `role="menu"` must implement menu focus, keyboard navigation, and dismissal. The Square split-button shape is a project extension, not an official configuration. Disable the primary and expand buttons separately with `primary-disabled` and `menu-disabled`; `disabled` disables both.

## Behavior and accessibility

Choose `size` based on the app’s breakpoint or emphasis hierarchy: use a larger size in wide windows and a smaller one where space is limited. A Split button can stand alone or appear in an action area with regular Buttons and IconButtons. The layout mirrors in RTL, while Tab order remains primary action followed by the expand button.

## Material references

[Split buttons overview](https://m3.material.io/components/split-button/overview) · [guidelines](https://m3.material.io/components/split-button/guidelines) · [specs](https://m3.material.io/components/split-button/specs) · [accessibility](https://m3.material.io/components/split-button/accessibility)
