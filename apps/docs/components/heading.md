<script setup lang="ts">
import HeadingExample from './demos/HeadingExample.vue'
</script>

# Heading

Heading is a project mapping from semantic heading elements to Material typography roles. Set `level` when the text should participate in the document’s heading outline.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <HeadingExample />
</div>

::: details View demo source

<<< ./demos/HeadingExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import Heading from './components/yam3x/heading/heading.vue'
</script>

<template>
  <Heading
    variant="headline"
    size="medium"
    :level="2"
    >Account settings</Heading
  >
</template>
```

## API

| Prop         | Type                                    | Default   | Description                                                                          |
| ------------ | --------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `variant`    | `display \| headline \| title \| label` | `display` | Type role; invalid runtime values fall back to `display`.                            |
| `size`       | `small \| medium \| large`              | `medium`  | Type size; invalid runtime values fall back to `medium`.                             |
| `emphasized` | `boolean`                               | `false`   | Uses emphasized weight.                                                              |
| `level`      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`            | —         | Optional heading level; when unset, renders ordinary text without heading semantics. |

The default slot provides the content.

## Behavior and accessibility

Without `level`, Heading renders ordinary text without heading semantics. Choose `level` from the document hierarchy, independently of visual size.

## Styling

The selected family, size, and emphasis map to the matching System `--md-sys-typescale-*` tokens. Emphasis selects the Expressive emphasized style of the same family and size; the System theme owns the font family and metrics. The default family is Roboto.

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type)
