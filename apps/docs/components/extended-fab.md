<script setup lang="ts">
import ExtendedFabExample from './demos/ExtendedFabExample.vue'
</script>

# Extended FABs

An Extended FAB pairs a primary action with a short visible label. Use one when the text makes the action clearer than an icon alone.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <ExtendedFabExample />
</div>

The example compares small, medium, and large Extended FABs and a text-only option. Use the checkbox to collapse the icon-bearing small FAB. A text-only Extended FAB keeps its label visible.

::: details View demo source

<<< ./demos/ExtendedFabExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import ExtendedFloatingActionButton from './components/yam3x/fab/extended-fab.vue'
import Icon from './components/yam3x/icon/icon.vue'
</script>

<template>
  <ExtendedFloatingActionButton>
    <template #icon
      ><Icon
        name="add"
        filled
    /></template>
    Create project
  </ExtendedFloatingActionButton>
</template>
```

## API

| Prop                                  | Type                                                                                                 | Default             | Description                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                                | `small \| medium \| large`                                                                           | `medium`            | Uses the expressive Extended FAB size: 56px, 80px, or 96px.                                                                                                       |
| `expanded`                            | `boolean`                                                                                            | `true`              | Visually collapses the label when an icon is present, while keeping the action name available to assistive technology. A text-only Extended FAB remains expanded. |
| `variant`                             | `primary-container \| secondary-container \| tertiary-container \| primary \| secondary \| tertiary` | `primary-container` | Selects one of the six expressive color styles.                                                                                                                   |
| `lowered`                             | `boolean`                                                                                            | `false`             | Project extension that provides a lower surface elevation.                                                                                                        |
| `href`                                | `string`                                                                                             | —                   | Uses native link navigation.                                                                                                                                      |
| `disabled`                            | `boolean`                                                                                            | `false`             | Compatibility option that prevents activation.                                                                                                                    |
| `disabledInteractive`                 | `boolean`                                                                                            | `false`             | Keeps an unavailable Extended FAB focusable and exposes `aria-disabled`.                                                                                          |
| `type`, `id`, `name`, `value`, `form` | Native form attributes                                                                               | `type="button"`     | Only button mode participates in form actions.                                                                                                                    |

The default slot contains the short visible label; `#icon` contains the optional icon. The component emits `click(MouseEvent)`.

## Behavior and accessibility

Keep the label to one or two words without wrapping or truncation. If you set an explicit accessible name, start it with the label's first word. The label and optional icon share one focusable control. A visible label does not need a tooltip. Use one FAB-family control per screen and omit it when the action is unavailable.

## Styling

Set custom properties beginning with `--yam3x-extended-fab-` to adjust size and appearance. Color-specific properties place the color role before the component name, such as `--yam3x-secondary-container-extended-fab-container-color`. Expressive small, medium, and large sizes use 56px, 80px, and 96px containers; the small size uses title-medium typography. The baseline and surface styles are no longer recommended; `lowered` is a project extension.

## Material references

[Extended FAB overview](https://m3.material.io/components/extended-fab/overview) · [guidelines](https://m3.material.io/components/extended-fab/guidelines) · [specs](https://m3.material.io/components/extended-fab/specs) · [accessibility](https://m3.material.io/components/extended-fab/accessibility)
