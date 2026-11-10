<script setup lang="ts">
import FabExample from './demos/FabExample.vue'
import FabStatesExample from './demos/FabStatesExample.vue'
</script>

# Floating action buttons (FABs)

A floating action button (FAB) emphasizes the single most important constructive action on a screen. `FloatingActionButton` is the Material 3 Expressive icon-only FAB. Use an [Extended FAB](/components/extended-fab) when a short visible label makes the action clearer, and a [FAB menu](/components/fab-menu) when one control must reveal several related actions.

Material defines the FAB sizes, six expressive color styles, and elevation. The baseline 56 px size remains this project's default, with medium and large exposed as distinct sizes. `lowered` is a project extension that selects a lower elevation.

## Examples

### Sizes and colors

The demo compares the default, medium, and large icon-only FAB sizes and then the six expressive color styles. Small remains available but is no longer recommended.

<div class="vp-raw yam3x-doc-demo-theme"><FabExample /></div>

::: details View demo source

<<< ./demos/FabExample.vue{vue}

:::

### States, links, and availability

The lowered style uses the project's lower elevation. `href` renders a native link, and the compatibility example keeps an unavailable FAB focusable while cancelling activation.

<div class="vp-raw yam3x-doc-demo-theme"><FabStatesExample /></div>

::: details View demo source

<<< ./demos/FabStatesExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { FloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
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

::: details Color, lowered elevation, and links

```vue
<script setup lang="ts">
import { FloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <FloatingActionButton
    variant="tertiary-container"
    size="large"
    aria-label="Create project"
  >
    <Icon
      name="add"
      filled
    />
  </FloatingActionButton>

  <FloatingActionButton
    lowered
    aria-label="Create draft"
  >
    <Icon
      name="edit"
      filled
    />
  </FloatingActionButton>

  <FloatingActionButton
    href="/guide/start/installation"
    variant="secondary-container"
    aria-label="Open installation"
  >
    <Icon
      name="arrow_forward"
      filled
    />
  </FloatingActionButton>
</template>
```

:::

The consuming layout owns placement and decides where the FAB sits relative to other content. The component does not position itself or choose between the standard and extended forms.

## Behavior and accessibility

### Size and color

- `default` is the 56 px baseline FAB. `medium` uses 80 px and `large` uses 96 px, each with its own icon size and typography. `small` is available for compatibility but is no longer recommended.
- The six color styles select `primary`, `secondary`, or `tertiary`, either as the container role pair or as the direct color role. The legacy surface style is not exposed.
- Elevation follows the color style: level 3 at rest, hover raises it to level 4, and focus and pressed return to the resting level.

### Naming and icon

- A FAB has no visible label, so provide `aria-label` or `aria-labelledby` that describes the action. The icon slot is decorative and hidden from assistive technology.
- Use a filled icon. On Web, compose a [Tooltip](/components/tooltip) for hover and focus instead of making the tooltip the only accessible name.
- Keep one FAB-family control per screen and reserve it for a constructive primary action.

### Availability and elevation

- Omit the FAB while its action is unavailable. `disabled` and `disabledInteractive` remain for compatibility with existing flows; they are deprecated because Material recommends omission instead of a disabled FAB.
- `disabledInteractive` keeps the control in the tab order, exposes `aria-disabled="true"`, and cancels activation without emitting `click`.
- `lowered` is a project extension. It uses level 1 elevation at rest, on focus, and when pressed, and level 2 on hover.

### Links and forms

- `href` renders a native anchor with link semantics. A disabled link keeps `role="link"`, exposes `aria-disabled`, removes `href`, and leaves the tab order; a `disabledInteractive` link stays focusable and still suppresses navigation.
- `type`, `id`, `name`, `value`, and `form` apply only in button mode, where the FAB participates in native form submission.
- Focus uses the shared 3 px `secondary` indicator with a 2 px offset and the size's container shape.

## API

### Exports

| Export                                                                | Description                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `FloatingActionButton`                                                | Icon-only FAB.                                                           |
| `ExtendedFloatingActionButton`                                        | Extended FAB; see [Extended FABs](/components/extended-fab).             |
| `ToggleFloatingActionButton`                                          | Toggle trigger for a [FAB menu](/components/fab-menu); documented there. |
| `ToggleFloatingActionButtonSize`, `ToggleFloatingActionButtonVariant` | Types for the toggle FAB.                                                |

### `FloatingActionButton` props and models

| Prop / model          | Type                                                                                                             | Default               | Description                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------- |
| `size`                | `'small' \| 'default' \| 'medium' \| 'large'`                                                                    | `'default'`           | Container height, icon size, typography, and corner shape.    |
| `variant`             | `'primary-container' \| 'secondary-container' \| 'tertiary-container' \| 'primary' \| 'secondary' \| 'tertiary'` | `'primary-container'` | One of the six expressive color styles.                       |
| `lowered`             | `boolean`                                                                                                        | `false`               | Project extension that selects the lower elevation treatment. |
| `href`                | `string`                                                                                                         | Undefined             | Renders a native link when defined.                           |
| `disabled`            | `boolean`                                                                                                        | `false`               | Deprecated compatibility state that prevents activation.      |
| `disabledInteractive` | `boolean`                                                                                                        | `false`               | Deprecated; keeps an unavailable FAB focusable.               |

::: details Native button attributes

| Prop    | Type                              | Description                               |
| ------- | --------------------------------- | ----------------------------------------- |
| `type`  | `'button' \| 'submit' \| 'reset'` | Native button type; defaults to `button`. |
| `id`    | `string`                          | Passed to the root element.               |
| `name`  | `string`                          | Form field name; ignored in link mode.    |
| `value` | `string`                          | Form value; ignored in link mode.         |
| `form`  | `string`                          | Associated form ID; ignored in link mode. |

:::

### `FloatingActionButton` events

| Event   | Payload      | Description                                                               |
| ------- | ------------ | ------------------------------------------------------------------------- |
| `click` | `MouseEvent` | Fired for activation. Prevent it to cancel navigation or form submission. |

### `FloatingActionButton` slots

| Slot      | Description                                                     |
| --------- | --------------------------------------------------------------- |
| `default` | Decorative icon content; provide an accessible name on the FAB. |

### Methods

`FloatingActionButton` exposes no public instance methods.

## Styling

Color follows the theme roles, while geometry and typography come from the size mapping. Public custom properties use `--yam3x-floating-action-button-<property>` for shared values, and `--yam3x-<variant>-floating-action-button-<property>` for a single color style; set them on the FAB or an ancestor. These property names and override behavior are project API.

::: details CSS overrides

| Property                                                             | Default             | Description                            |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- |
| `--yam3x-floating-action-button-container-height`                    | Size-dependent      | Container height.                      |
| `--yam3x-floating-action-button-shape`                               | Size-dependent      | Corner radius.                         |
| `--yam3x-floating-action-button-icon-size`                           | Size-dependent      | Icon box size.                         |
| `--yam3x-floating-action-button-leading-space`                       | Size-dependent      | Inline padding before the icon.        |
| `--yam3x-floating-action-button-trailing-space`                      | Size-dependent      | Inline padding after the icon.         |
| `--yam3x-<variant>-floating-action-button-container-color`           | Color role          | Container color for one color style.   |
| `--yam3x-<variant>-floating-action-button-container-elevation`       | Level 3             | Resting elevation for one color style. |
| `--yam3x-<variant>-floating-action-button-hover-container-elevation` | Level 4             | Hover elevation for one color style.   |
| `--yam3x-<variant>-floating-action-button-hover-state-layer-opacity` | Hover state opacity | Hover state layer for one color style. |

Replace `<variant>` with one of the six style names. Focus-ring thickness and offset come from the shared focus tokens.

:::

## Material references

[Floating action buttons overview](https://m3.material.io/components/floating-action-button/overview) · [Guidelines](https://m3.material.io/components/floating-action-button/guidelines) · [Specs](https://m3.material.io/components/floating-action-button/specs) · [Accessibility](https://m3.material.io/components/floating-action-button/accessibility)
