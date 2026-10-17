# Tabs: project design guide

## Scope

Tabs organize related content at the same hierarchy level and select a destination within the current page. This guide adopts primary and secondary tabs. See [Tabs overview](https://m3.material.io/components/tabs/overview).

## Design target

- Use tabs for related content that can be viewed in any order, not sequential material that should be read in a fixed order. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines).
- Use primary tabs for main content destinations beneath an app bar. Use secondary tabs within a content area for a second level of related content. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines).
- `tabs.geometry.primary`: Keep Primary tabs 48dp high with labels and 64dp with icons and labels. Use 24dp icons, a 1dp divider, and a 3dp active indicator with a 24dp minimum length and 2dp side insets. Secondary tabs are 48dp high with a 2dp active indicator. See [Tabs specifications](https://m3.material.io/components/tabs/specs).
- `tabs.states.colors`: Map selected Primary labels and icons to `primary`; selected Secondary labels to `on-surface`; inactive labels and icons to `on-surface-variant`. Use the state colors and 8% hover and 10% focus and pressed state-layer opacities shown in the Primary and Secondary token selectors. See [Tabs specifications](https://m3.material.io/components/tabs/specs).
- Keep labels short and clear; use icons only when they add meaning. Badges may contain up to four characters. In scrollable tabs, keep the first tab 52dp from the leading edge and let labels expand without truncation where possible. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines).
- Use fixed tabs for destinations that fit the row; use scrollable tabs when more room is needed. Fixed tabs can change destinations with a horizontal swipe over content. In scrollable tabs, horizontal gestures scroll the tab row instead. Avoid applying density by default so tab targets retain at least 48 by 48 CSS pixels. See [Tabs guidelines](https://m3.material.io/components/tabs/guidelines) and [Tabs accessibility](https://m3.material.io/components/tabs/accessibility).
- `tabs.a11y.keyboard`: Support keyboard movement and selection, and keep selected state synchronized with the associated content panel. See [Tabs accessibility](https://m3.material.io/components/tabs/accessibility).
- Preserve visible focus, hover, and pressed states. Use arrow keys to move through tabs and Space or Enter to activate the focused tab. See [Tabs accessibility](https://m3.material.io/components/tabs/accessibility) and [Tabs specifications](https://m3.material.io/components/tabs/specs).

## Project decisions

- Project-defined extension: `headerPosition="after"` places the tab bar after its panel content. Material's standard Tabs arrangement places the bar before the content.

- Project-defined: Tabs select related page content rather than acting as general navigation links. The consuming page owns the content and any state that should survive tab changes.
- Project-defined (`tabs.motion.selection`): Selection uses directional indicator motion and honors reduced motion. Material's tab figures inform the transition; this web motion behavior is project-defined.
- Project-defined: The 16px corner radius on tab state feedback and focus outlines is a web styling choice; the token selector defines the container shape and focus indicator color, thickness, and offset, but no focus radius.
