<script setup lang="ts">
import AvatarExample from './demos/AvatarExample.vue'
</script>

# Avatar

`Avatar` identifies a person, team, or object with a single image, icon, or initials. Use it where a compact visual marker helps readers recognize the entity, such as a list row, a comment, or a profile summary.

Avatar is a project extension. Material 3 does not define a standalone Avatar component or an avatar-specific visual contract. The closest Compose Material 3 composition is a `Box` with `CircleShape` and a Text, Icon, or Image child; size, shape, clip behavior, and content fallback are project decisions.

## Examples

### Basic

<div class="vp-raw yam3x-doc-demo-theme"><AvatarExample /></div>

::: details View demo source

<<< ./demos/AvatarExample.vue{vue}

:::

The row shows the default 40 px round avatar, a 48 px icon-only avatar, a 40 px photo, and a 56 px rounded-square avatar with a separate presence dot. Initials stay text, the icon and photo carry their own accessible names, and the component only clips its slot content.

## Use in your app

After [installation](/guide/start/installation), import the copied component from your app. Use consumer paths such as `./components/yam3x/`; `@registry` paths in demo source are site-specific.

```vue
<script setup lang="ts">
import { Avatar } from './components/yam3x/avatar'
</script>

<template>
  <Avatar
    role="img"
    aria-label="Alex Morgan"
    >AM</Avatar
  >
</template>
```

Avatar renders its default slot and nothing else. Supply an image, icon, or initials and choose the accessible treatment for that content. Native attributes such as `id`, `class`, `hidden`, `role`, and `aria-label` apply to the root element.

::: details Image fallback and presence

Avatar does not load images, retry failures, or choose a fallback. Switch the slot content when your image request fails, and keep the fallback name stable.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Avatar } from './components/yam3x/avatar'

const failed = ref(false)
</script>

<template>
  <Avatar
    role="img"
    aria-label="Alex Morgan"
  >
    <img
      v-if="!failed"
      src="/people/alex.jpg"
      alt=""
      @error="failed = true"
    />
    <template v-else>AM</template>
  </Avatar>
</template>
```

For a status dot or count, keep the avatar passive and attach the project's `Badge` to the same positioned wrapper. Avatar has no built-in presence, badge, or interaction API.

:::

## Behavior and accessibility

### Names and alternatives

- An icon-only avatar needs `role="img"` and a concise `aria-label`; the icon itself stays decorative.
- An informative photo needs concise `alt` text. Use `alt=""` when a nearby name already identifies the person or when the image is decorative.
- Initials remain text. When the same name appears beside the avatar, hide the avatar or give it an empty alternative so assistive technology does not announce the identity twice.
- `role="img"` treats its descendants as a single image. Keep the name on the avatar, not on a nested icon.

### Content and clipping

- The component centers one slot and clips its content. Images fill the box with `object-fit: cover`; content that does not fit is not reflowed.
- Avatar does not size text to the avatar, abbreviate names, or generate initials. Provide content that fits the chosen size.
- The native `hidden` attribute removes the avatar from layout and the accessibility tree. Visibility is otherwise owned by the application.

### Sizing, shape, and contrast

- Size, shape, foreground, and background are set through the documented custom properties. The default is a 40 px round surface using Primary Container and On Primary Container.
- In forced-colors mode the component draws a one-pixel CanvasText boundary so the avatar edge stays visible when the background is suppressed.
- Avatar has no directional layout of its own. The slot content follows the surrounding writing direction.

## API

### Exports

| Export   | Description                                             |
| -------- | ------------------------------------------------------- |
| `Avatar` | Shaped single-slot surface for an image, icon, or text. |

### Props and models

Avatar defines no props and no models. Pass native HTML attributes and ARIA attributes to the root; `hidden` hides the avatar.

### Events

Avatar emits no events. For an actionable avatar, wrap it in a Button or link and keep the avatar itself passive.

### Slots

| Slot      | Scope | Use                                                    |
| --------- | ----- | ------------------------------------------------------ |
| `default` | —     | One image, icon, or short text value such as initials. |

### Methods

Avatar exposes no instance methods.

## Styling

Avatar exposes project-defined custom properties on the root. Color defaults map to the paired Material Primary Container and On Primary Container roles; size, shape, and typography defaults are project choices that reference shared System tokens.

::: details Custom properties

| Property                     | Default                              | Description                   |
| ---------------------------- | ------------------------------------ | ----------------------------- |
| `--yam3x-avatar-size`        | `40px`                               | Square avatar size.           |
| `--yam3x-avatar-shape`       | System `corner-full`                 | Shape of the clipped content. |
| `--yam3x-avatar-color`       | System `primary-container`           | Initials and icon background. |
| `--yam3x-avatar-label-color` | System `on-primary-container`        | Initials and icon foreground. |
| `--yam3x-avatar-font-family` | System `title-medium` font family    | Initials font family.         |
| `--yam3x-avatar-font-size`   | System `title-medium` font size      | Initials font size.           |
| `--yam3x-avatar-font-weight` | System `title-medium` font weight    | Initials font weight.         |
| `--yam3x-avatar-line-height` | System `title-medium` line height    | Initials line height.         |
| `--yam3x-avatar-tracking`    | System `title-medium` letter spacing | Initials letter spacing.      |

:::

## Material references

[Color roles](https://m3.material.io/styles/color/roles) · [Shape and corner radius](https://m3.material.io/styles/shape/corner-radius-scale) · [Applying type](https://m3.material.io/styles/typography/applying-type)
