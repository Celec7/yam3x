# Split buttons: project design guide

## Scope

A split button pairs one primary action with a separate control that opens related choices. Material treats this as a distinct component, not a button group. See [Split button overview](https://m3.material.io/components/split-button/overview).

## Design target

- Use the split pattern when one action is primary and a small set of related alternatives belongs in a menu. See [Split button guidelines](https://m3.material.io/components/split-button/guidelines).
- Keep the leading action and trailing menu control distinct. Use the icon and inner-corner geometry shown in the [anatomy and state figures](https://m3.material.io/components/split-button/specs).
- `split-button.a11y.target`: Give each segment its own accessible name and at least a 48 × 48 dp target, including when the visible size is smaller. See [Split button accessibility](https://m3.material.io/components/split-button/accessibility).
- `split-button.a11y.keyboard`: Keep each segment independently keyboard-operable. The trailing name communicates that related options are available and exposes its expanded state. See [Split button accessibility](https://m3.material.io/components/split-button/accessibility).
- `split-button.menu.placement`: Align the menu to the trailing control when possible and reposition it to fit the viewport. Mirror the visual arrangement in RTL. See [Split button guidelines](https://m3.material.io/components/split-button/guidelines).
- `split-button.color.roles`: Use the supported button styles and their paired Material color roles shown in [Split button specifications](https://m3.material.io/components/split-button/specs).
- Use standard motion for the expand control's state change; use the shared short duration and standard easing tokens.

## Project decisions

- Project-defined: The Vue component composes the project's Menu for its standard popup and permits custom popup content. The custom popup slot is rendered in a positioning context matching the trailing control; its content owns final placement and interactions and follows the accessibility guidance for its semantics. Prefer the built-in `items` path for menus; custom menu content must implement the menu keyboard and focus pattern.
- Project-defined: Square outer corners are an additional shape option; the official configuration lists sizes and color styles, not shape variants.
