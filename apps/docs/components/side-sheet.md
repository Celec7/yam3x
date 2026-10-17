<script setup lang="ts">
import SideSheetExample from './demos/SideSheetExample.vue'
</script>

# Side sheets

Side sheets present supporting content beside the main content. A standard sheet keeps the main area available; a modal sheet covers it and manages interaction until dismissed.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><SideSheetExample /></div>

::: details View demo source

<<< ./demos/SideSheetExample.vue{vue}

:::

## Use in your app

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
    <template #actions
      ><button
        type="button"
        @click="open = false"
      >
        Done
      </button></template
    >
  </SideSheet>
</template>
```

## API

`mode` accepts `modal`, `standard`, or `adaptive`. Modal mode overlays the primary content with a scrim, contains focus, and exposes `aria-modal="true"`. Standard mode reflows the main content while leaving it interactive, and is intended for a container wide enough to preserve usable space for both regions. Adaptive mode switches between those presentations at `adaptiveBreakpoint` (600px by default), measured against the component container. Use adaptive mode for responsive placement; explicitly forcing standard mode below the breakpoint can leave too little room for the sheet. The sheet is anchored to the logical inline end, so it moves to the left in RTL.

## Behavior and accessibility

The required `label` names the side sheet dialog and supplies the headline text when `#headline` is absent. Both presentations expose one dialog boundary; only modal mode sets `aria-modal="true"` and contains focus. A visible close icon button is always present inside the sheet; `closeLabel` localizes its accessible name. Scrim and Escape dismissal are supplementary close paths. Optional `#back` and `#actions` slots customize the back affordance and action row. `#sheet` is independently vertically scrollable. The default slot holds primary content. An optional `#toggle` slot receives `{ expanded, controls, toggle }` for an accessible opening control. The `change` event reports user toggles, scrim dismissal, and Escape dismissal with the new state and reason.

The default and maximum width are 400px. Set `width` and `maxWidth` to override them. `adaptiveBreakpoint` chooses the modal/standard presentation threshold.

## Material references

[Side sheets overview](https://m3.material.io/components/side-sheets/overview) · [guidelines](https://m3.material.io/components/side-sheets/guidelines) · [specs](https://m3.material.io/components/side-sheets/specs) · [accessibility](https://m3.material.io/components/side-sheets/accessibility)
