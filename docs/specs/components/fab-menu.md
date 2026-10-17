# FAB menu: project design guide

## Scope

A FAB menu expands a regular floating action button to reveal a short group of related actions. It is not a selectable list or a general-purpose dropdown. See [FAB menu overview](https://m3.material.io/components/fab-menu/overview).

## Design target

- Keep the trigger in its page position as the menu opens. Place expanded actions in the arrangement and count shown by the [FAB menu specifications](https://m3.material.io/components/fab-menu/specs).
- `fab-menu.geometry.close`: Align the close control with the trigger as shown in the [anatomy and measurement figures](https://m3.material.io/components/fab-menu/specs).
- Use the available color configurations and action treatment from [FAB menu specifications](https://m3.material.io/components/fab-menu/specs). Keep each action's label visible.
- Opening and closing use coordinated motion between the trigger and actions. Follow the behavior in [FAB menu guidelines](https://m3.material.io/components/fab-menu/guidelines) and respect the shared reduced-motion preference.
- `fab-menu.a11y.keyboard`: Give actions clear accessible names and support keyboard navigation, activation, and dismissal. On Web, use the [ARIA menu-button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) alongside [FAB menu accessibility](https://m3.material.io/components/fab-menu/accessibility).

## Project decisions

- Project-defined: The caller owns the FAB's page placement and the results of each action. Material defines 2–6 actions and primary, secondary, or tertiary color sets; the component preserves its non-trailing `alignment` values as project positioning extensions.
- Project-defined: Opening leaves focus on the transformed close trigger. Arrow Down or Arrow Up enters the enabled actions; Escape returns focus to the trigger and Tab closes the menu while continuing in page order.
- Project-defined: `presentation` offers `pill-stack` (default) and `web-menu`; both choices and the default are project API decisions. The pill stack maps the Expressive FAB menu tokens. `web-menu` follows the official Web note to use baseline Menu geometry and states. `alignment` positions the surface relative to the trigger and aligns item content within full-width rows. A `selected` item is an optional, caller-controlled visual state for `web-menu`; it does not change the action's activation or menu dismissal behavior.
- Project-defined: The pill stack opens above the trigger by default. If fewer than two actions fit above and there is space below, it opens below instead; exactly two fitting above keeps it above. It re-evaluates placement while the page scrolls and scrolls its actions within the available height without covering the trigger.
- Project-defined: `disabled` FAB menu actions remain visible, cannot activate, and are excluded from keyboard navigation. The compound and convenience APIs share the same disabled container and content treatment. Material's FAB menu API does not define disabled actions.
