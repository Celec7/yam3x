<script setup lang="ts">
import AvatarExample from './demos/AvatarExample.vue'
</script>

# Avatar

Avatar identifies a person or entity with an image, icon, or initials. It is a visual marker; it does not load images or act as a control.

Avatar is a project extension. It uses shared Material color, shape, and typography tokens rather than Avatar-specific tokens.

## Interactive example

<div class="vp-raw yam3x-doc-demo-theme">
  <AvatarExample />
</div>

::: details View demo source

<<< ./demos/AvatarExample.vue{vue}

:::

## Use in your app

After [installation](/guide/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import Avatar from './components/yam3x/avatar/avatar.vue'
</script>

<template>
  <Avatar
    role="img"
    aria-label="Alex Morgan"
    >AM</Avatar
  >
</template>
```

## API

| Prop                        | Type                | Default | Description                                                                                        |
| --------------------------- | ------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| Default slot                | `VNode`             | Empty   | Can contain an image, text initials, or an icon; the component does not add content automatically. |
| `hidden`                    | Native boolean prop | `false` | Hides the avatar.                                                                                  |
| Other native and ARIA props | HTML attributes     | —       | Forwarded to the root wrapper, such as `aria-label`, `aria-hidden`, `role`, `id`, and `class`.     |

## Behavior and accessibility

Icon-only avatars need `role="img"` and a concise `aria-label`. Provide concise `alt` text for informative photos. Use `alt=""` when a nearby name already conveys the same information or the avatar is decorative. Keep initials as text, and avoid duplicate announcements when a name is shown beside them.

## Styling

These project extension overrides are available on the Avatar root. Color defaults use the paired System `primary-container` and `on-primary-container` roles. The size, shape, and typography defaults are project choices; shape and typography reference shared System tokens.

| Property                     | Default                              | Description                   |
| ---------------------------- | ------------------------------------ | ----------------------------- |
| `--yam3x-avatar-size`        | `40px`                               | Square avatar size.           |
| `--yam3x-avatar-shape`       | System `corner-full`                 | Shape of the clipped content. |
| `--yam3x-avatar-color`       | System `primary-container`           | Initials and icon background. |
| `--yam3x-avatar-label-color` | System `on-primary-container`        | Initials and icon foreground. |
| `--yam3x-avatar-font-size`   | System `title-medium` font size      | Initials font size.           |
| `--yam3x-avatar-font-weight` | System `title-medium` font weight    | Initials font weight.         |
| `--yam3x-avatar-line-height` | System `title-medium` line height    | Initials line height.         |
| `--yam3x-avatar-tracking`    | System `title-medium` letter spacing | Initials letter spacing.      |
