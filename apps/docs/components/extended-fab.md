<script setup lang="ts">
import ExtendedFabExample from './demos/ExtendedFabExample.vue'
</script>

# Extended FABs

An Extended FAB pairs the screen's primary action with a short visible label. `ExtendedFloatingActionButton` is the Material 3 Expressive Extended FAB. Use it when the label makes the action clearer than an icon alone; use the icon-only [FAB](/components/fab) when the icon is unambiguous, and a [FAB menu](/components/fab-menu) when one control must reveal several actions.

Material defines the small, medium, and large Expressive sizes and six color styles. This project defaults to medium, keeps small as the 56 px Expressive form, and treats the visual collapse of an icon-bearing FAB as a project presentation of the same control.

## Examples

### Sizes and expansion

The demo compares the small, medium, and large sizes, a text-only Extended FAB, and the expanded state. `expanded` only collapses an FAB that has an icon; the label stays in the accessible name. The second control switches the project-only `lowered` elevation.

<div class="vp-raw yam3x-doc-demo-theme"><ExtendedFabExample /></div>

::: details View demo source

<<< ./demos/ExtendedFabExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { ExtendedFloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <ExtendedFloatingActionButton>
    <template #icon>
      <Icon
        name="add"
        filled
      />
    </template>
    Create project
  </ExtendedFloatingActionButton>
</template>
```

::: details Collapsed, lowered, and linked forms

```vue
<script setup lang="ts">
import { ExtendedFloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <ExtendedFloatingActionButton
    :expanded="false"
    size="small"
    variant="secondary-container"
  >
    <template #icon>
      <Icon
        name="edit"
        filled
      />
    </template>
    Edit page
  </ExtendedFloatingActionButton>

  <ExtendedFloatingActionButton
    lowered
    href="/guide/start/installation"
  >
    <template #icon>
      <Icon
        name="arrow_forward"
        filled
      />
    </template>
    Open guide
  </ExtendedFloatingActionButton>
</template>
```

:::

The consuming layout owns placement. Keep one FAB-family control per screen and omit it when the action is unavailable.

## Behavior and accessibility

### Size and typography

- `small` uses a 56 px container and title-medium type, `medium` uses 80 px and title-large, and `large` uses 96 px and headline-small. `medium` is the default.
- The expressive small size uses a 56 px container; the older baseline Extended FAB and the surface style are no longer recommended.
- The icon is optional. An icon without a visible label is a FAB, not an Extended FAB, so always keep the label.

### Label and naming

- Keep the label to one or two words and let it stay on one line without wrapping or truncation.
- The label and optional icon share one focusable control. A visible label does not need a tooltip.
- If you set an explicit accessible name, begin it with the same first word as the visible label.

### Expanded and lowered states

- `expanded` defaults to `true`. Setting it to `false` visually collapses the label of an icon-bearing FAB into the icon-only form; the accessible name still includes the label. A text-only Extended FAB ignores the collapse and stays expanded.
- The component renders one button or link; expanding and collapsing do not create a second control or change the accessible name.
- `lowered` is a project extension that uses level 1 elevation at rest, focus, and pressed, and level 2 on hover.
- Omit the control while its action is unavailable. Material does not define a disabled Extended FAB.

### Links and forms

- `href` renders a native anchor.
- `type`, `id`, `name`, `value`, and `form` apply only in button mode.
- Focus uses the shared 3 px `secondary` indicator with a 2 px offset and the size's container shape.

## API

### Exports

| Export                                                                | Description                                 |
| --------------------------------------------------------------------- | ------------------------------------------- |
| `ExtendedFloatingActionButton`                                        | Extended FAB with an optional icon.         |
| `FloatingActionButton`                                                | Icon-only FAB; see [FABs](/components/fab). |
| `ToggleFloatingActionButton`                                          | Toggle trigger for a FAB menu.              |
| `ToggleFloatingActionButtonSize`, `ToggleFloatingActionButtonVariant` | Types for the toggle FAB.                   |

### `ExtendedFloatingActionButton` props and models

| Prop / model | Type                                                                                                             | Default               | Description                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------- |
| `size`       | `'small' \| 'medium' \| 'large'`                                                                                 | `'medium'`            | Container height, icon size, typography, and corner shape.    |
| `expanded`   | `boolean`                                                                                                        | `true`                | Collapses the label visually when an icon is present.         |
| `variant`    | `'primary-container' \| 'secondary-container' \| 'tertiary-container' \| 'primary' \| 'secondary' \| 'tertiary'` | `'primary-container'` | One of the six expressive color styles.                       |
| `lowered`    | `boolean`                                                                                                        | `false`               | Project extension that selects the lower elevation treatment. |
| `href`       | `string`                                                                                                         | Undefined             | Renders a native link when defined.                           |

::: details Native button attributes

| Prop    | Type                              | Description                               |
| ------- | --------------------------------- | ----------------------------------------- |
| `type`  | `'button' \| 'submit' \| 'reset'` | Native button type; defaults to `button`. |
| `id`    | `string`                          | Passed to the root element.               |
| `name`  | `string`                          | Form field name; ignored in link mode.    |
| `value` | `string`                          | Form value; ignored in link mode.         |
| `form`  | `string`                          | Associated form ID; ignored in link mode. |

:::

### `ExtendedFloatingActionButton` events

| Event   | Payload      | Description                                                               |
| ------- | ------------ | ------------------------------------------------------------------------- |
| `click` | `MouseEvent` | Fired for activation. Prevent it to cancel navigation or form submission. |

### `ExtendedFloatingActionButton` slots

| Slot      | Description                                        |
| --------- | -------------------------------------------------- |
| `default` | Short visible label; required for an Extended FAB. |
| `icon`    | Optional decorative leading icon.                  |

### Methods

`ExtendedFloatingActionButton` exposes no public instance methods.

## Styling

Color follows the theme roles, while geometry and typography come from the size mapping. Shared overrides use `--yam3x-extended-fab-<property>`; a single size uses `--yam3x-extended-fab-<size>-<property>`. Set them on the component or an ancestor. Shape defaults map to the Material system corner tokens.

::: details CSS overrides

| Property                                         | Default             | Description                           |
| ------------------------------------------------ | ------------------- | ------------------------------------- |
| `--yam3x-extended-fab-container-height`          | Size-dependent      | Container height.                     |
| `--yam3x-extended-fab-shape`                     | System corner token | Corner radius.                        |
| `--yam3x-extended-fab-leading-space`             | Size-dependent      | Inline padding before the icon.       |
| `--yam3x-extended-fab-trailing-space`            | Size-dependent      | Inline padding after the label.       |
| `--yam3x-extended-fab-icon-label-space`          | Size-dependent      | Gap between the icon and the label.   |
| `--yam3x-extended-fab-icon-size`                 | Size-dependent      | Icon box size.                        |
| `--yam3x-extended-fab-<size>-shape`              | System corner token | Corner radius for one size.           |
| `--yam3x-extended-fab-<size>-leading-space`      | Size-dependent      | Inline padding for one size.          |
| `--yam3x-extended-fab-<size>-trailing-space`     | Size-dependent      | Inline trailing padding for one size. |
| `--yam3x-<variant>-extended-fab-container-color` | Color role          | Container color for one color style.  |

Replace `<size>` with `small`, `medium`, or `large`, and `<variant>` with one of the six style names.

:::

## Material references

[Extended FAB overview](https://m3.material.io/components/extended-fab/overview) · [Guidelines](https://m3.material.io/components/extended-fab/guidelines) · [Specs](https://m3.material.io/components/extended-fab/specs) · [Accessibility](https://m3.material.io/components/extended-fab/accessibility)
