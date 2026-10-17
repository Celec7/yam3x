<script setup lang="ts">
import FabExample from './demos/FabExample.vue'
</script>

# Floating action buttons (FABs)

A floating action button highlights a page’s primary action. Use a FAB for one prominent, icon-only constructive action.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <FabExample />
</div>

The example compares the default, medium, and large FAB sizes. Its unavailable FAB is a compatibility example.

::: details View demo source

<<< ./demos/FabExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import FloatingActionButton from './components/yam3x/fab/floating-action-button.vue'
import Icon from './components/yam3x/icon/icon.vue'
</script>

<template>
  <FloatingActionButton aria-label="Create project">
    <Icon
      name="add"
      filled
    />
  </FloatingActionButton>
</template>
```

## API

| Prop                                  | Type                                                                                                 | Default             | Description                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| `size`                                | `small \| default \| medium \| large`                                                                | `default`           | Uses the named FAB size. `default` is the 56px baseline FAB; `small` is available but not recommended. |
| `variant`                             | `primary-container \| secondary-container \| tertiary-container \| primary \| secondary \| tertiary` | `primary-container` | Selects one of the six expressive color styles.                                                        |
| `lowered`                             | `boolean`                                                                                            | `false`             | Project extension that provides a lower surface elevation.                                             |
| `href`                                | `string`                                                                                             | —                   | Uses native link navigation.                                                                           |
| `disabled`                            | `boolean`                                                                                            | `false`             | Compatibility option that prevents activation.                                                         |
| `disabledInteractive`                 | `boolean`                                                                                            | `false`             | Keeps an unavailable FAB focusable and exposes `aria-disabled`.                                        |
| `type`, `id`, `name`, `value`, `form` | Native form attributes                                                                               | `type="button"`     | Only button mode participates in form actions.                                                         |

The default slot contains the icon. The component emits `click(MouseEvent)`.

## Behavior and accessibility

Use a filled icon and provide an action-describing name with `aria-label` or `aria-labelledby`. On Web, compose a [Tooltip](/components/tooltip) for the icon-only action. Use one FAB per screen and omit it when the action is unavailable. A [FAB menu](/components/fab-menu) manages its own trigger and close icon.

## Styling

Set custom properties beginning with `--yam3x-floating-action-button-` to adjust size and appearance. Color-specific properties place the color role before the component name, such as `--yam3x-primary-container-floating-action-button-container-color`. The six color styles follow the Expressive palette; `lowered` is a project extension.

## Material references

[Floating action buttons overview](https://m3.material.io/components/floating-action-button/overview) · [guidelines](https://m3.material.io/components/floating-action-button/guidelines) · [specs](https://m3.material.io/components/floating-action-button/specs) · [accessibility](https://m3.material.io/components/floating-action-button/accessibility)
