<script setup lang="ts">
import FabMenuExample from './demos/FabMenuExample.vue'
import FabMenuCompositionExample from './demos/FabMenuCompositionExample.vue'
</script>

# FAB menu

A FAB menu expands a floating action button into a small group of related actions. Keep those actions connected to the same task and give the trigger and each item a clear name.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme"><FabMenuExample /></div>

::: details View demo source

<<< ./demos/FabMenuExample.vue{vue}

:::

## Use in your app

```vue
<script setup lang="ts">
import { FabMenu, type FabMenuItem } from './components/yam3x/fab-menu'

const actions: FabMenuItem[] = [
  { value: 'camera', label: 'Take photo' },
  { value: 'upload', label: 'Upload file' },
]
</script>

<template>
  <FabMenu
    :items="actions"
    label="Create actions"
    trigger-label="Create"
  />
</template>
```

## Compose the menu

Use the compound API when the trigger or action content needs direct control. `FloatingActionButtonMenu` owns expanded state, popup placement, focus, and keyboard navigation. Provide a trigger through `#trigger`, bind its `triggerProps`, and put `FloatingActionButtonMenuItem` children in the default slot. Pair it with `ToggleFloatingActionButton` to get the standard plus-to-close behavior; for another trigger, call the slot's `toggle` method when it is activated.

<div class="vp-raw yam3x-doc-demo-theme"><FabMenuCompositionExample /></div>

::: details View composition demo source

<<< ./demos/FabMenuCompositionExample.vue{vue}

:::

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ToggleFloatingActionButton } from './components/yam3x/fab'
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from './components/yam3x/fab-menu'

const expanded = ref(false)
</script>

<template>
  <FloatingActionButtonMenu
    v-model:expanded="expanded"
    label="Create actions"
  >
    <template #trigger="{ triggerProps }">
      <ToggleFloatingActionButton
        v-bind="triggerProps"
        v-model:checked="expanded"
        aria-label="Create"
      />
    </template>
    <FloatingActionButtonMenuItem
      value="camera"
      label="Take photo"
    />
    <FloatingActionButtonMenuItem
      value="upload"
      label="Upload file"
    />
  </FloatingActionButtonMenu>
</template>
```

## API

Use `v-model:expanded` to control the expanded state. `FloatingActionButtonMenu` accepts `label`, `variant` (`primary`, `secondary`, `tertiary`), `presentation` (`pill-stack`, `web-menu`), `horizontal-alignment` (`start`, `center`, `end`), and `disabled`. Its `#trigger` slot receives `expanded`, `toggle`, `setExpanded`, and `triggerProps`; bind `triggerProps` to the trigger for menu semantics and keyboard handling. `triggerProps` does not add a click handler: `ToggleFloatingActionButton` can share the model through `v-model:checked`, while another trigger must call `toggle` on activation. The caller should match the trigger's color variant to the menu's `variant`. `FloatingActionButtonMenuItem` accepts `value`, `label`, `disabled`, `selected`, and native link attributes, plus default and `#icon` slots. The project-defined `selected` extension is caller-controlled and displays the baseline Menu selected appearance only in `web-menu`; it does not alter activation or dismissal. The item emits `click`; the menu emits `select` and closes after an enabled item is activated. `disabled` FAB menu actions are a project extension: they remain visible, cannot activate, are skipped by keyboard navigation, and use the same muted container and content treatment in both APIs. Material's FAB menu API does not define disabled actions. In the pill stack, it opens above by default; it opens below only when fewer than two actions fit above and there is space below. Exactly two fitting actions keep it above. Placement recalculates as the page scrolls.

`ToggleFloatingActionButton` accepts `v-model:checked`, `size` (`small`, `default`, `medium`, `large`), `variant` (`primary`, `secondary`, `tertiary`), and `disabled`. The default size is 56px; medium and large are 80px and 96px. Small remains available but is not recommended by Material 3 Expressive. Its `#icon` slot receives `checked` and animation `progress`.

`FabMenu` remains a data-driven convenience wrapper for `items`. It accepts `variant`, `trigger-size`, `horizontal-alignment`, and `presentation`. `presentation` (`pill-stack` or `web-menu`) and the default pill stack are project decisions; the layout does not switch automatically by viewport size. The project-defined `selected` property on a `FabMenuItem` shows the baseline Menu selected appearance in `web-menu`; this does not change activation or dismissal. The action list scrolls within the available space without covering the trigger. `beforeselect` is a cancelable project event. Material specifies 2–6 actions and primary, secondary, or tertiary color sets. Extended FAB sizes are not available for the menu.

## Behavior and accessibility

Opening leaves focus on the trigger; Arrow Down/Up enters and moves through actions, Home/End moves to the first/last enabled action, Escape closes and restores focus, and Tab closes while continuing in page order.

`horizontal-alignment="start"` and `"center"` are project positioning options; the default `end` follows the trailing edge. The popup is teleported to `body`. While open, it receives System tokens from the nearest `[data-theme]` ancestor and follows that theme target's updates. Set public FAB menu CSS custom properties on the menu root to customize the popup and items.

## Material references

[FAB menu overview](https://m3.material.io/components/fab-menu/overview) · [guidelines](https://m3.material.io/components/fab-menu/guidelines) · [specs](https://m3.material.io/components/fab-menu/specs) · [accessibility](https://m3.material.io/components/fab-menu/accessibility)
