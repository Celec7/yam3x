# Tabs: project design guide

## Scope

Tabs organize related content at the same hierarchy level and select a destination within the current page. This guide adopts primary and secondary tabs. See [Tabs overview](https://m3.material.io/components/tabs/overview).

## Design target

- Use tabs for related content that can be viewed in any order, not sequential material that should be read in a fixed order. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines).
- Use primary tabs for main content destinations beneath an app bar. Use secondary tabs within a content area for a second level of related content. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines).
- `tabs.geometry.primary`: Keep primary tabs 48 dp high with labels and 64 dp with icons and labels. Use 24 dp icons, a 1 dp divider, and a 3 dp active indicator with a 24 dp minimum length and 2 dp side insets. Secondary tabs are 48 dp high with a 2 dp active indicator that spans the full selected tab width. See [Tabs specifications](https://m3.material.io/components/tabs/specs).
- `tabs.states.colors`: Map selected primary labels and icons to `primary`; selected secondary labels to `on-surface`; inactive labels and icons to `on-surface-variant`. Use the state colors and 8% hover and 10% focus and pressed state-layer opacities shown in the primary and secondary token selectors. See [Tabs specifications](https://m3.material.io/components/tabs/specs).
- Keep labels short and clear; use icons only when they add meaning. Badges may contain up to four characters. In scrollable tabs, keep the first tab 52 dp from the leading edge and let labels expand without truncation where possible. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines).
- Use fixed tabs for destinations that fit the row; use scrollable tabs when more room is needed. Fixed tabs can change destinations with a horizontal swipe over content. In scrollable tabs, horizontal gestures scroll the tab row instead. Avoid applying density by default so tab targets retain at least 48 by 48 CSS pixels. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines) and [Tabs accessibility](https://m3.material.io/components/tabs/accessibility).
- `tabs.a11y.keyboard`: Support keyboard movement and selection, and keep selected state synchronized with the associated content panel. See [Tabs accessibility](https://m3.material.io/components/tabs/accessibility).
- Preserve visible focus, hover, and pressed states. Use arrow keys to move through tabs and Space or Enter to activate the focused tab. See [Tabs accessibility](https://m3.material.io/components/tabs/accessibility) and [Tabs specifications](https://m3.material.io/components/tabs/specs).

## Project decisions

The following are project decisions.

- The tab bar may be placed after its panel content. Material's standard arrangement places the bar before the content.
- Tabs select related page content rather than acting as general navigation links. The consuming page owns the content and any state that should survive tab changes.
- `tabs.motion.selection`: Selection uses directional indicator motion and honors reduced motion. Material's tab figures inform the transition; this Web motion behavior is project-defined.
- The 16 px corner radius on tab state feedback and focus outlines is a Web styling choice; the token selector defines the container shape and focus indicator color, thickness, and offset, but no focus radius.
- `tabs.a11y.roving`: The tablist has one Tab stop. The selected enabled tab owns `tabindex="0"` and every other tab uses `tabindex="-1"`; arrow keys move focus without changing selection, and Space or Enter activates the focused tab. This follows the WAI-ARIA tablist focus contract while preserving Material's manual activation model. See [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
