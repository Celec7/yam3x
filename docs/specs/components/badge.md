# Badges: project design guide

## Scope

Badges show a notification, count, or short status associated with an icon or navigation destination. They are secondary indicators, not independent controls. See [Badges overview](https://m3.material.io/components/badges/overview).

## Design target

### Use and content

- `badge.content.forms`: Use a small dot for a new or unread notification and a large badge for a count or short status. Keep large-badge content to four characters, including `+` when abbreviating a larger count. See [Badges guidelines: content](https://m3.material.io/components/badges/guidelines).
- Anchor a badge inside the icon bounds at its upper trailing edge without covering meaningful icon content. Use a small badge when space is tight and a large badge when its content remains legible beside labels and screen edges. Mirror the placement in RTL. See [Badges guidelines: placement](https://m3.material.io/components/badges/guidelines) and [Badges specs: placement figures](https://m3.material.io/components/badges/specs).
- `badge.behavior.hide-read`: On navigation destinations, hide an unread badge after that destination is selected. See [Badges guidelines: navigation](https://m3.material.io/components/badges/guidelines).

### Appearance and accessibility

- `badge.color.contrast`: Use the `error` container and `on-error` label roles and maintain at least 3:1 contrast. Use other roles only when they meet the same contrast requirement. See [Badges specs: color roles](https://m3.material.io/components/badges/specs) and [Badges accessibility: color contrast](https://m3.material.io/components/badges/accessibility).
- `badge.a11y.passive`: Badges do not receive focus or activation. See [Badges accessibility: interaction](https://m3.material.io/components/badges/accessibility).
- Assistive technology announces a numeric badge after its destination and a non-counting badge as a new notification. Keep that meaning aligned with the item it describes. See [Badges accessibility: announcements](https://m3.material.io/components/badges/accessibility).

## Project decisions

The following are project decisions.

- The component supports additional logical placements for non-navigation layouts; a Material-mapped navigation or icon badge keeps the official upper-trailing placement.
- One- to three-character labels use the official 11/16/500/0.5 label metrics. Four-character labels use 10/16/500/0.1 so the container stays within the official 16 × 34 dp maximum with the 4 dp inline padding; Web font metrics otherwise exceed the maximum width.
