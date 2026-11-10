<script setup lang="ts">
import HeadingExample from './demos/HeadingExample.vue'
</script>

# Heading

Heading maps a semantic heading element to a Material type scale. Use it when text must join the document outline and use a display, headline, title, or label treatment at the same time.

Heading is a project extension, not a Compose Material 3 component. In Compose, the same result is composed from `Text` with a `MaterialTheme.typography` style and heading semantics; this project instead provides one component with `level`, `variant`, `size`, and `emphasized` props. The level and scale are deliberately independent, so a visual title can still be an `h2` for assistive technology.

## Examples

### Semantic levels and type scales

<div class="vp-raw yam3x-doc-demo-theme"><HeadingExample /></div>

The gallery renders every family and size in standard and emphasized form. Below it, `level="1"` and `level="2"` produce native headings while the third example remains a plain `span`. Compare `variant` for the role, `size` for the step within that role, and `emphasized` for the Expressive weight.

::: details View demo source

<<< ./demos/HeadingExample.vue{vue}

:::

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Heading } from './components/yam3x/heading'
</script>

<template>
  <article>
    <Heading
      variant="headline"
      size="medium"
      :level="2"
      >Account settings</Heading
    >
    <Heading
      variant="label"
      size="large"
      :level="3"
      >Profile visibility</Heading
    >
  </article>
</template>
```

Choose `level` from the surrounding document hierarchy, not from the visual size. Use a visual role such as `display large` for a page title and `title small` for a card heading only after the heading order is settled.

::: details Visual-only text and responsive scales

```vue
<template>
  <Heading
    variant="title"
    size="small"
  >
    Plain text without heading semantics
  </Heading>
  <Heading
    variant="display"
    size="small"
    class="responsive-title"
    :level="1"
  >
    A long page title that wraps onto more lines
  </Heading>
</template>

<style scoped>
.responsive-title {
  max-inline-size: 24ch;
  text-wrap: balance;
}
</style>
```

Without `level`, Heading renders a `span`. The component does not scale with the viewport; select a smaller `size` or apply a consumer media query when the page needs a responsive type step.

:::

## Behavior and accessibility

### Heading outline

- `level` renders `h1` through `h6`. Leaving it unset renders a `span` with no heading role and no `aria-level`.
- Invalid runtime `level` values are ignored, so the component falls back to the plain `span` form.
- `variant` and `size` are visual only. Moving from `display large` to `title small` does not change the heading level.
- Built-in compositions choose their own levels: Descriptions, Empty state, and Inline message expose `headingLevel` with a default of 3; Form exposes `summaryHeadingLevel` with a default of 2; Cascading select renders its title at level 2.

### Type scales and wrapping

- `variant` accepts `display`, `headline`, `title`, or `label`; invalid values fall back to `display`.
- `size` accepts `small`, `medium`, or `large`; invalid values fall back to `medium`.
- `emphasized` selects the Expressive emphasized token family of the same variant and size.
- Heading is a block with zero margins. It inherits color and font family from its parent and wraps by default.
- There is no built-in truncation. Use `text-wrap`, `overflow-wrap`, or a consumer `line-clamp` when a design requires a fixed number of lines; never hide text that carries the only copy of a heading.

## API

### Exports

| Export    | Kind      | Use                                         |
| --------- | --------- | ------------------------------------------- |
| `Heading` | Component | Semantic heading or visual type-scale text. |

### Props

| Prop         | Type                                    | Default   | Use                                                                           |
| ------------ | --------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| `variant`    | `display \| headline \| title \| label` | `display` | Type role. Invalid runtime values fall back to `display`.                     |
| `size`       | `small \| medium \| large`              | `medium`  | Step within the type role. Invalid runtime values fall back to `medium`.      |
| `emphasized` | `boolean`                               | `false`   | Uses the Expressive emphasized weight of the selected family and size.        |
| `level`      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`            | —         | Native heading level; when unset, renders a `span` without heading semantics. |

### Events

Heading emits no events.

### Slots

| Slot    | Scope | Use              |
| ------- | ----- | ---------------- |
| default | —     | Heading content. |

### Methods

Heading exposes no instance methods.

## Styling

The component maps the selected family, size, and emphasis to the matching System `--md-sys-typescale-*` tokens, which remain the public styling interface. It sets no direct `font-size` or `font-weight`, so theme token overrides and inherited font family continue to work. It exposes no project-specific custom properties.

| Interface                                         | Use                                                   |
| ------------------------------------------------- | ----------------------------------------------------- |
| `--md-sys-typescale-<family>-<size>-*`            | Font family, size, weight, line height, and tracking. |
| `--md-sys-typescale-emphasized-<family>-<size>-*` | The matching Expressive emphasized scale.             |
| Inherited `color`                                 | Heading uses the surrounding text color.              |

The System theme owns the font family and metrics. The default family is Roboto.

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Type scale](https://m3.material.io/styles/typography/type-scale-tokens) · [Accessibility: headings](https://m3.material.io/foundations/accessible-design/accessibility-basics)
