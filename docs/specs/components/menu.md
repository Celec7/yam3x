# Menus: project design guide

## Scope

Menus show a temporary list of choices or actions. This project adopts the current Expressive vertical menu for new design work. See [Menus overview](https://m3.material.io/components/menus/overview).

## Design target

- Use a menu for a temporary set of actions or choices opened from a control, selected text, or context action. Keep persistent actions in a toolbar. See [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- `menu.color.contrast`: Use the standard or vibrant color treatment and selected-item state shown in the [color and state figures](https://m3.material.io/components/menus/specs). Keep selected and unselected items distinguishable with at least 3:1 contrast.
- `menu.color.divider`: Map decorative menu dividers to System `outline-variant`, the Material color role for dividers. The menu color figures define item roles; this divider mapping follows the shared color guidance. See [Color roles](https://m3.material.io/styles/color/the-color-system).
- `menu.geometry.items`: Use the vertical-menu anatomy, item height, spacing, grouping, and measurement figures in [Menus specifications](https://m3.material.io/components/menus/specs). A menu item may include a label and supporting or leading/trailing content; it represents one action or choice.
- Material recommends dividers for Web menus and says scrollable menus must not use gaps. Dividers are also recommended for text-field dropdown menus when grouping is unnecessary. See [Menus guidelines](https://m3.material.io/components/menus/guidelines).
- Place the menu relative to its trigger and reposition it when needed to remain in the viewport. Follow the [adaptive placement guidance](https://m3.material.io/components/menus/guidelines).
- Expand from the trigger-facing edge after adaptive placement flips the menu. Material shows menus expanding down from the top and up from the bottom.
- `menu.a11y.keyboard`: Support keyboard access, focus movement, activation, and dismissal. Expose menu-item, selected, disabled, and submenu states as applicable. See [Menus accessibility](https://m3.material.io/components/menus/accessibility); apply Web semantics as described by the [WAI-ARIA menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/).

## Project decisions

The following are project decisions.

- New designs use the current Expressive vertical menu. Baseline compatibility behavior is not a design target for new work.
- The menu container defaults to a 112 px minimum and 280 px maximum width. Material's Expressive selector does not define these values, so they remain project defaults.
- The container shadow maps to System elevation level 2; Material's Expressive selector does not expose a readable menu elevation value.
- Web menus support a gap grouping treatment. The official `Menu gap` and `Menu group padding` tokens map to the space between and within group surfaces. When a menu is scrollable, gaps render as dividers. Dividers remain the recommended Web default. Material recommends one or two gaps per menu; this is not enforced at runtime.
