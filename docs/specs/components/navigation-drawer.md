# Navigation drawer: legacy compatibility guide

## Scope

Material 3 Expressive no longer recommends navigation drawers for updated designs. The expanded [Navigation rail](navigation-rail.md) is the current replacement. Keep this guide for maintaining existing drawer-based screens only. See [Navigation drawer overview](https://m3.material.io/components/navigation-drawer/overview).

## Design target

- For an existing drawer, use the [guidelines](https://m3.material.io/components/navigation-drawer/guidelines), [specifications](https://m3.material.io/components/navigation-drawer/specs), and [accessibility guidance](https://m3.material.io/components/navigation-drawer/accessibility) as a legacy reference.
- Preserve the distinction between standard drawers, which sit beside screen content, and modal drawers, which overlay it with a scrim. See the [standard and modal comparison](https://m3.material.io/components/navigation-drawer/guidelines).
- Use the official legacy anatomy, state, color, and measurement figures for maintenance work. Do not use the drawer as the design target for new navigation.

## Legacy component token mapping

The official selector exposes only `Navigation drawers (baseline)`; it does not define an Expressive token set. The values below are maintenance references for existing drawer layouts, not current Expressive requirements.

| Official baseline token or measurement                                                                                                                    | Project mapping                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `md.comp.navigation-drawer.standard.container.color` → `surface`; `md.comp.navigation-drawer.modal.container.color` → `surface-container-low`             | `NavigationDrawer` selects the matching System color by resolved mode and passes it to the generic `DrawerContainer`.                                                                                                                              |
| `md.comp.navigation-drawer.container.width` → 360dp                                                                                                       | `width` and `maxWidth` default to 360px; callers can change either prop.                                                                                                                                                                           |
| Standard container has 0,16,16,0dp corners; modal container rounds its exposed end corners. Active indicator is 336×56dp with 28dp corners; icon is 24dp. | The standard start panel maps its exposed logical end corners to System `shape-corner-large`; modal shape is supplied by `DrawerContainer`. The item indicator is capped at 336px, has a 56px minimum height and 28px radius; icon slots use 24px. |
| Item label and icon roles: `on-surface-variant`; selected roles: `on-secondary-container` on `secondary-container`                                        | Private Component aliases map to the corresponding System colors. State opacity comes from System state tokens.                                                                                                                                    |
| Scrim role: `scrim`                                                                                                                                       | `DrawerContainer` maps the shared scrim System role and project scrim opacity.                                                                                                                                                                     |

Navigation Drawer styles consume private `--_yam3x-navigation-drawer-*` Component aliases. The alias block lives on the component root so mode-dependent container color and descendant styles resolve the same System inputs. No Navigation Drawer CSS custom-property overrides are public. The selected open-branch surface treatment is a project extension; the official legacy selector does not define that hierarchy state.

## Project decisions

- Project-defined: Expose the legacy pattern through `NavigationDrawer`, with destinations composed as child components. Keep `DrawerContainer` as a separate generic layout primitive; do not expose a separate navigation menu component.
- Project-defined: The `auto` mode uses container width and switches from modal to standard at 840px by default. This maps the compact/medium versus expanded guidance to an embeddable component; applications may set the breakpoint explicitly.
- Project-defined: Modal drawers close after a destination is selected. Standard drawers remain in the standard layout and can be opened or closed by the application.
- Project-defined: Use native links for leaf destinations. A destination with child destinations is a disclosure control; static section labels remain separate from disclosure branches.
- Project-defined: Modal content includes a consumer-supplied visible close control. The component owns the dialog boundary and focus containment; the application owns route changes and focus after destination content updates.
