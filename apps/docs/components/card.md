<script setup lang="ts">
import CardExample from './demos/CardExample.vue'
</script>

# Cards

Cards group related content in a bounded surface. Make the whole card interactive only when it represents one clear action; place independent actions in their own controls.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <CardExample />
</div>

::: details View demo source

<<< ./demos/CardExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import Card from './components/yam3x/card/card.vue'
</script>

<template>
  <Card variant="outlined">
    <template #header>Trip summary</template>
    <template #content>Three stops saved for Saturday.</template>
  </Card>
</template>
```

## API

| Prop                  | Type                             | Default    | Description                                                                                           |
| --------------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `variant`             | `elevated \| filled \| outlined` | `filled`   | Card surface style.                                                                                   |
| `interactive`         | `boolean`                        | `false`    | Uses a native button and emits `click(MouseEvent)`; provide a clear accessible name.                  |
| `href`                | `string`                         | —          | Uses a native link card for navigation; takes precedence over `interactive`.                          |
| `type`                | `button \| submit \| reset`      | `button`   | Native form-button behavior.                                                                          |
| `name`                | `string`                         | —          | Form field name for a native submit button.                                                           |
| `value`               | `string`                         | —          | Form field value for a native submit button.                                                          |
| `orientation`         | `vertical \| horizontal`         | `vertical` | Project extension: controls the orientation of structured card content.                               |
| `inline`              | `boolean`                        | `false`    | Project extension: places the card inline with surrounding content.                                   |
| `disabled`            | `boolean`                        | `false`    | Disables an interactive card. A disabled link loses its `href` and leaves the Tab order.              |
| `disabledInteractive` | `boolean`                        | `false`    | Project extension: sets `aria-disabled`, retains focus, and suppresses activation and state feedback. |

Cards provide a default slot and optional `header`, `content`, `actions`, and `footer` slots. These slots and layout controls are Vue project extensions.

## Behavior and accessibility

Passive cards render as neutral `div` elements and do not emit a root `click`; interactive cards render as `button`, and cards with `href` render as `a`. `href` takes precedence when both `href` and `interactive` are set. Passive cards may contain independently focusable controls. Do not place separate buttons or links inside a whole-card button or link; use a passive card for independent controls. Wrap a passive card in `<article>` when the surrounding content needs article semantics.

## Styling

The default slot has 16px padding, except when its direct content is an `img` or `video`; named slots receive 16px spacing based on direction and position.

| Custom property        | Default              | Description                                              |
| ---------------------- | -------------------- | -------------------------------------------------------- |
| `--yam3x-card-shape`   | System medium corner | Overrides the card container corner radius.              |
| `--yam3x-card-padding` | 16px × density scale | Overrides spacing around default and named slot content. |

Other card styling values are component-owned and follow the active theme and card variant.

## Material references

[Cards overview](https://m3.material.io/components/cards/overview) · [guidelines](https://m3.material.io/components/cards/guidelines) · [specs](https://m3.material.io/components/cards/specs) · [accessibility](https://m3.material.io/components/cards/accessibility)
