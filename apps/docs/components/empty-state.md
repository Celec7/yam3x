<script setup lang="ts">
import EmptyStateExample from './demos/EmptyStateExample.vue'
import EmptyStateIllustrationExample from './demos/EmptyStateIllustrationExample.vue'
</script>

# Empty state

`EmptyState` explains why a collection or result region has no content and offers a useful next step. Use it for a new collection or for no matching results; loading, request failure, and completed work need their own feedback.

EmptyState is a project extension. Compose has no EmptyState primitive; the closest composition is a `Column` with an optional Icon or Image, Text, and Buttons. The type roles, spacing, and surface treatment are project decisions built from shared Material foundations.

## Examples

### Creation, no matches, and page context

<div class="vp-raw yam3x-doc-demo-theme"><EmptyStateExample /></div>

::: details View demo source

<<< ./demos/EmptyStateExample.vue{vue}

:::

The demo keeps the surrounding section and search control available. Creating a document replaces the embedded state with a result message, clearing the search removes the no-match state, and the page-level form uses the larger Headline Small and Body Large roles. Icon illustrations stay decorative.

### Illustration and action hierarchy

<div class="vp-raw yam3x-doc-demo-theme"><EmptyStateIllustrationExample /></div>

::: details View demo source

<<< ./demos/EmptyStateIllustrationExample.vue{vue}

:::

The custom illustration is hidden from assistive technology because it repeats the message. A filled action names the primary next step, a text action offers the secondary path, and the compact form keeps only a title and description. Buttons wrap when the region narrows.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { EmptyState } from './components/yam3x/empty-state'
import { Button } from './components/yam3x/button'
</script>

<template>
  <EmptyState
    title="No matching documents"
    align="start"
    :heading-level="2"
  >
    Try another term, or clear the search to see all documents.
    <template #actions><Button variant="outlined">Clear search</Button></template>
  </EmptyState>
</template>
```

`title` is required. Use `description` or the default slot for the supporting explanation; the slot replaces `description`. Set `headingLevel` to match the surrounding outline, and keep section titles, filters, and navigation outside the empty region.

::: details Custom illustrations and informative images

```vue
<template>
  <EmptyState
    title="No archived projects"
    description="Archived projects stay available for thirty days."
  >
    <template #illustration>
      <img
        src="/illustrations/archive.svg"
        alt="An empty archive box"
      />
    </template>
  </EmptyState>
</template>
```

The `#illustration` slot replaces the icon area. Hide decorative artwork with `alt=""` or `aria-hidden="true"`; give informative artwork a meaningful alternative. The color hook applies to current-color artwork only.

:::

## Behavior and accessibility

### Content hierarchy

- The title is a heading at `headingLevel`, level 3 by default. `context="page"` uses Headline Small and Body Large; `embedded` uses Title Medium and Body Medium.
- The description uses On Surface Variant, and the text block stays near 40 characters wide where space allows.
- `align="start"` follows the writing direction. Center alignment is the default for a short standalone message.
- The component does not add a card background, fetch records, or create content. It occupies the affected region without taking over unrelated content.

### Actions and focus

- `#actions` holds the next steps. Use one filled action for the most important path and a text or outlined action for the alternative.
- Actions wrap and keep their full labels. Appearance and removal do not move focus automatically.
- The application owns what happens after an action and where focus goes when the empty state is replaced.

### Illustration semantics

- The built-in `icon` is decorative and hidden from assistive technology. It has no meaning beyond the text.
- The `#illustration` slot accepts any content. Mark decorative artwork as decorative and provide a text alternative for informative images.
- Illustration color defaults to On Surface Variant; override the provided hook when the artwork needs a different role.

### Empty versus no matches

- State clearly whether the collection has no items yet or the current query has no matches.
- Offer creation for a new collection and a query or filter change for no matches.
- A request error must keep its error and recovery action instead of claiming the collection is empty.
- A containing result region may announce a user-initiated result once through its own status area; the empty state is not a live region.

### Narrow and enlarged text

- The region grows with its content; actions wrap and text wraps without horizontal overflow.
- A table can keep its headers while its empty message spans the columns.
- Start alignment and action order follow the writing direction in RTL.

## API

### Exports

| Export       | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `EmptyState` | Explanation and optional action for an empty content region. |

### Props and models

| Prop           | Default    | Use                                                                                  |
| -------------- | ---------- | ------------------------------------------------------------------------------------ |
| `title`        | Required   | Short explanation of the empty region.                                               |
| `description`  | Empty      | Supporting explanation, replaced by the default slot when supplied.                  |
| `context`      | `embedded` | `embedded` uses Title Medium / Body Medium; `page` uses Headline Small / Body Large. |
| `align`        | `center`   | `center` or direction-aware `start`.                                                 |
| `icon`         | None       | Optional decorative Material Symbol, displayed at 48 px.                             |
| `headingLevel` | `3`        | Semantic heading level, 1–6. Override it to match the surrounding outline.           |

Native attributes, including `class`, `style`, `id`, and `hidden`, apply to the root.

### Events

EmptyState emits no events. Handle actions through the controls in `#actions`.

### Slots

| Slot           | Use                                                           |
| -------------- | ------------------------------------------------------------- |
| `default`      | Supporting content; replaces `description` when present.      |
| `illustration` | Replaces the icon area with an image, SVG, or custom artwork. |
| `actions`      | Primary and secondary next steps, placed below the text.      |

### Methods

EmptyState exposes no instance methods.

## Styling

EmptyState exposes one project-defined custom property. Typography, spacing, and foregrounds otherwise use shared Material roles: 24 px region padding, 16 px between main parts, and 8 px between title and description.

| Property                                 | Default                     | Use                                                |
| ---------------------------------------- | --------------------------- | -------------------------------------------------- |
| `--yam3x-empty-state-illustration-color` | System `on-surface-variant` | Foreground for current-color illustration artwork. |

Apply `class` or `style` to size the containing region; allow its height to follow the content. The built-in icon uses 48 px by default.

## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Shape principles](https://m3.material.io/styles/shape/overview-principles) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
