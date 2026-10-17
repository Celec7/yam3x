# Button groups: project design guide

## Scope

Material 3 Expressive defines Standard Button Groups for related actions and Connected Button Groups for related selectable choices. See [Button groups overview](https://m3.material.io/components/button-groups/overview).

## Design target

### Use and selection

- Use Standard groups to organize related actions while keeping buttons visually separate. Use Connected groups for related selectable choices presented as one connected control. See [Button groups guidelines: variants](https://m3.material.io/components/button-groups/guidelines).
- Keep a Connected group consistent in color style and selection mode. Its outer edges remain continuous, while its internal shape changes with the selected configuration. See [Button groups specs: Connected variants](https://m3.material.io/components/button-groups/specs).
- Connected groups use a shared filled, tonal, outlined, or elevated style. Do not use Text buttons or Standard IconButtons in a Connected group because they lack the filled container treatment. See [Button groups specs: color](https://m3.material.io/components/button-groups/specs).
- The Expressive update directs new compact-choice designs from Segmented buttons to Connected Button Groups. See the [Button groups overview](https://m3.material.io/components/button-groups/overview) and the [legacy Segmented buttons guide](segmented-button.md).

### Appearance and layout

- Standard-group buttons respond to interaction with coordinated shape and size changes. Keep their resting size, shape, and style consistent. See [Button groups specs: Standard variants](https://m3.material.io/components/button-groups/specs).
- Standard-group press expansion uses the specified spring motion so the pressed item's growth and adjacent items' shrinkage remain coordinated. See [Button groups specs: Standard variants](https://m3.material.io/components/button-groups/specs).
- Standard between-button spacing is 18, 12, 8, 8, and 8 dp for XS through XL. Connected spacing is 2 dp at every size. Connected inner corners vary by size and state; selected inner corners become fully rounded. See the [Button groups token selector and measurement figures](https://m3.material.io/components/button-groups/specs).
- Connected round groups keep fully rounded outer corners; square groups use the size-specific outer corners shown in the [measurement figures](https://m3.material.io/components/button-groups/specs). Pressing a Connected button changes only that button's shape, without resizing its neighbors.
- Keep group members on one row. Standard groups generally fit their contents; Connected groups may use available parent width with a sensible maximum. At constrained widths, adapt size or spacing or move trailing choices to overflow rather than wrapping the group. See [Button groups guidelines: responsive behavior](https://m3.material.io/components/button-groups/guidelines) and its responsive and overflow figures.
- The group container has no visual surface or color role; each child remains an individual button. See [Button groups specs: anatomy](https://m3.material.io/components/button-groups/specs).

### Interaction and accessibility

- Each child button has its own accessible label and 48 × 48 dp target. The group container does not need to receive focus. See [Button groups accessibility: target size and labeling](https://m3.material.io/components/button-groups/accessibility).
- `button-group.a11y.keyboard`: Arrow keys move focus within the group; Space or Enter activates the focused button. See [Button groups accessibility: keyboard navigation](https://m3.material.io/components/button-groups/accessibility).
- Tab reaches the group controls; the container itself does not need to receive focus. See [Button groups accessibility: keyboard navigation](https://m3.material.io/components/button-groups/accessibility).

## Project decisions

- The group remains on one row and can scroll horizontally. With `overflow="menu"` and `#overflow-indicator`, trailing items are measured and supplied to a caller-rendered menu. Connected groups default to a configurable 720 px maximum inline size.
- The group receives the size and shape of its child buttons for component-token mapping. Manually composed groups should keep those values aligned; an explicit `gap` overrides the size-based spacing.
- The XS unselected Connected inner corner follows the token selector's 8 dp value. The measurement figure's caption instead says 4 dp; 4 dp is the selector's XS pressed inner-corner value.
- On Web, the Standard pressed-width spring uses a CSS timing-curve approximation. The 15% width multiplier comes from the Button groups token selector.
