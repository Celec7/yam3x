<script setup lang="ts">
import CardExample from './demos/CardExample.vue'
import CardInteractionExample from './demos/CardInteractionExample.vue'
</script>

# Cards

A card groups related content and actions about one subject. Use it for scannable information that belongs together, and make the whole card actionable only when it represents one clear action.

Card is a Material 3 baseline component. Elevated, Filled, and Outlined are the Material variants; the horizontal and inline layouts, named content slots, and `disabledInteractive` behavior are project extensions.

## Examples

### Variants and composition

<div class="vp-raw yam3x-doc-demo-theme"><CardExample /></div>

::: details View demo source

<<< ./demos/CardExample.vue{vue}

:::

The gallery shows the three variants, a default text card with the standard 16 px inset, an inline horizontal card with header, content, actions, and footer, and a card whose media fills the header edge. Cards size to their content and do not establish a fixed height.

### Interaction and disabled states

<div class="vp-raw yam3x-doc-demo-theme"><CardInteractionExample /></div>

::: details View demo source

<<< ./demos/CardInteractionExample.vue{vue}

:::

The interaction demo separates a passive card, an actionable button card, a disabled-but-focusable card, a disabled link, and cards that submit or reset a native form. Counters report accepted activations, and the passive card ignores pointer clicks.

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Card } from './components/yam3x/card'
</script>

<template>
  <Card variant="outlined">
    <template #header>Trip summary</template>
    <template #content>Three stops saved for Saturday.</template>
  </Card>
</template>
```

A card with no `interactive` or `href` renders a neutral `div`; the default slot and `#content` share the same content area. Use the named slots for a header, actions, and footer when the card needs a structured hierarchy.

::: details Actionable cards and links

```vue
<script setup lang="ts">
import { Card } from './components/yam3x/card'

function openPlan() {
  // Navigate or open the selected plan.
}
</script>

<template>
  <Card
    interactive
    aria-label="Open reading plan"
    @click="openPlan"
  >
    Reading plan
  </Card>
  <Card
    href="/plans/current"
    aria-label="Open the current plan"
  >
    Current plan
  </Card>
</template>
```

`interactive` renders a native button and emits `click`. Supplying `href` renders a native link and takes precedence over `interactive`. Do not put buttons or links inside either form; use a passive card for independent controls.

:::

## Behavior and accessibility

### Semantics

- A passive card is a `div`. It carries no article, button, or link role. Wrap it in `<article>` when the surrounding page needs article semantics.
- An `interactive` card is a native button. A card with `href` is a native link, and `href` wins when both are set.
- The card does not supply an accessible name. Add `aria-label` or `aria-labelledby` when the visible content is not a sufficient single action name.
- Decorative media should be hidden or given an empty alternative; informative media needs a text alternative.

### Interaction and focus

- Only actionable cards receive pointer and keyboard activation and a focus stop. A passive card emits no `click` event and shows no activation feedback.
- Actionable cards use one shared state layer at the System hover, focus, and pressed opacities. Focus is a 3 px Secondary ring with a 2 px offset.
- Card does not intercept Enter or Space; native button activation applies. A link card keeps native link behavior, including modifier-key opening.

### Disabled states

- `disabled` on a button card uses the native disabled state and removes it from the Tab order.
- `disabledInteractive` sets `aria-disabled`, keeps the card focusable, and suppresses activation and state feedback. Use it only when discovering the unavailable action helps.
- A disabled link card loses its `href`, keeps `role="link"`, and leaves the Tab order unless `disabledInteractive` is also set. Activation is prevented.
- Disabled cards do not activate. Do not rely on opacity alone to explain why an action is unavailable.

### Media and layout

- `orientation` switches between a vertical and horizontal arrangement. `inline` keeps the card at its content width in the surrounding line.
- A direct `img` or `video` in the default content area or `#header` fills the edge without the normal inset. Other content uses the card padding.
- Named slot margins follow the layout direction, so horizontal cards keep the same spacing in RTL.

### Forms

- A button card supports native `type`, `name`, and `value`. `type="submit"` participates in the surrounding form, and `type="reset"` restores native field values.
- A link card ignores `type`, `name`, and `value`.

## API

### Exports

| Export | Description                                      |
| ------ | ------------------------------------------------ |
| `Card` | Bounded surface for one subject and its actions. |

### Props and models

| Prop                  | Default    | Use                                                                                           |
| --------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `variant`             | `filled`   | `elevated`, `filled`, or `outlined` surface style.                                            |
| `interactive`         | `false`    | Renders a native button and emits `click`.                                                    |
| `href`                | Undefined  | Renders a native link; takes precedence over `interactive`.                                   |
| `type`                | `button`   | Native button type: `button`, `submit`, or `reset`. Applied only to button cards.             |
| `name`                | Undefined  | Native form field name for a submit button.                                                   |
| `value`               | Undefined  | Native form field value for a submit button.                                                  |
| `disabled`            | `false`    | Disables a button card; a link card loses `href` and leaves the Tab order.                    |
| `disabledInteractive` | `false`    | Project extension: sets `aria-disabled`, keeps focus, and suppresses activation and feedback. |
| `orientation`         | `vertical` | Project extension: `vertical` or `horizontal` arrangement of structured content.              |
| `inline`              | `false`    | Project extension: keeps the card at content width in the surrounding line.                   |

### Events

| Event   | Payload      | Use                                                                                |
| ------- | ------------ | ---------------------------------------------------------------------------------- |
| `click` | `MouseEvent` | Emitted when an enabled actionable card is activated. Passive cards never emit it. |

### Slots

| Slot      | Use                                                                     |
| --------- | ----------------------------------------------------------------------- |
| `default` | Content. Shares the content area when `#content` is absent.             |
| `header`  | Leading header area, such as a title or flush media.                    |
| `content` | Main content area, taking precedence over the default slot.             |
| `actions` | Trailing action area; place independent controls here in passive cards. |
| `footer`  | Supporting metadata after the content and actions.                      |

### Methods

Card exposes no instance methods.

## Styling

Card exposes two project-defined custom properties. Variant colors, elevation, outline, state layer, and focus ring use shared Material roles and remain component-owned.

| Property               | Default              | Use                                            |
| ---------------------- | -------------------- | ---------------------------------------------- |
| `--yam3x-card-shape`   | System medium corner | Card corner radius.                            |
| `--yam3x-card-padding` | `16px` × density     | Spacing around default and named slot content. |

## Material references

[Cards overview](https://m3.material.io/components/cards/overview) · [guidelines](https://m3.material.io/components/cards/guidelines) · [specs](https://m3.material.io/components/cards/specs) · [accessibility](https://m3.material.io/components/cards/accessibility)
