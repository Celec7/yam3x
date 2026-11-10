# Navigation drawer: legacy compatibility guide

## Scope

Material 3 Expressive no longer recommends navigation drawers for updated designs. The expanded [Navigation rail](navigation-rail.md) is the current replacement. Keep this guide for maintaining existing drawer-based screens only. See [Navigation drawer overview](https://m3.material.io/components/navigation-drawer/overview).

## Design target

- For an existing drawer, use the [guidelines](https://m3.material.io/components/navigation-drawer/guidelines), [specifications](https://m3.material.io/components/navigation-drawer/specs), and [accessibility guidance](https://m3.material.io/components/navigation-drawer/accessibility) as a legacy reference.
- Preserve the distinction between standard drawers, which sit beside screen content, and modal drawers, which overlay it with a scrim. See the [standard and modal comparison](https://m3.material.io/components/navigation-drawer/guidelines).
- Use the official legacy anatomy, state, color, and measurement figures for maintenance work. Do not use the drawer as the design target for new navigation.
- Official baseline measurements: the container is 360dp wide; the standard container has 0, 16, 16, 0dp corners, and the modal container rounds its exposed end corners. The active indicator is 336 × 56dp with 28dp corners, and the icon is 24dp.
- Item labels and icons use `on-surface-variant`; selected items use `on-secondary-container` on `secondary-container`. The standard container uses `surface`, the modal container uses `surface-container-low`, and the scrim uses the `scrim` role. The official selector exposes only `Navigation drawers (baseline)` and defines no Expressive token set.
- The selected open-branch surface treatment is a project extension; the official legacy selector does not define that hierarchy state.

## Project decisions

The choices below are project-defined.

- Expose the legacy pattern as a container with destinations composed as child components; do not expose a separate navigation menu component.
- Automatic mode uses container width and switches from modal to standard at 840px by default. This maps the compact and medium versus expanded guidance to an embeddable component; applications may set the breakpoint explicitly.
- Modal drawers close after a destination is selected. Standard drawers remain in the standard layout and can be opened or closed by the application.
- Use native links for leaf destinations. A destination with child destinations is a disclosure control; static section labels remain separate from disclosure branches.
- Modal content includes a consumer-supplied visible close control. The component owns the dialog boundary and focus containment; the application owns route changes and focus after destination content updates.
