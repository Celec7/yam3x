# Badges: project design guide

## Scope

Badges show a notification, count, or short status associated with an icon or navigation destination; they are secondary indicators, not independent controls. See [Badges overview](https://m3.material.io/components/badges/overview).

## Design target

### Use and content

- `badge.content.forms`: Use a small dot for a new or unread notification, and a large badge for a count or short status. Keep large-badge content to four characters, including `+` when abbreviating a larger count. See [Badges guidelines: content](https://m3.material.io/components/badges/guidelines).
- Anchor a badge inside the icon bounds at its upper trailing edge without covering meaningful icon content. Use a small badge when space is tight; use a large badge when its content remains legible beside labels and screen edges. Mirror the placement in RTL. See [Badges guidelines: placement](https://m3.material.io/components/badges/guidelines) and [Badges specs: placement figures](https://m3.material.io/components/badges/specs).
- `badge.behavior.hide-read`: On navigation destinations, hide an unread badge after that destination is selected. See [Badges guidelines: navigation](https://m3.material.io/components/badges/guidelines).

### Appearance and accessibility

- `badge.color.contrast`: Use the `error` container and `on-error` label roles; maintain at least 3:1 contrast. Avoid other roles unless they meet the same contrast requirement. See [Badges specs: color roles](https://m3.material.io/components/badges/specs) and [Badges accessibility: color contrast](https://m3.material.io/components/badges/accessibility).
- `badge.a11y.passive`: Badges do not receive focus or activation. See [Badges accessibility: interaction](https://m3.material.io/components/badges/accessibility).
- Assistive technology announces a numeric badge after its destination and a non-counting badge as a new notification. Keep that meaning aligned with the item it describes. See [Badges accessibility: announcements](https://m3.material.io/components/badges/accessibility).

## Project decisions

- Project-defined: The Vue component supports additional logical placements for non-navigation layouts; a Material-mapped navigation or icon badge still uses the official upper-trailing placement.
- Project-defined API behavior: the Vue component derives the official small-dot or large-text variant from whether the default slot renders content. This follows Compose's content-shaped API while adapting it to Vue slots.
