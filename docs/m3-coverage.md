# Material 3 component map

This map connects entries in the [official Material 3 component catalog](https://m3.material.io/components) to project design guides and Vue components. Each guide must identify the currently applicable Expressive variant and its official source; a catalog entry alone does not establish that a design is current or recommended. This page records only project mappings, not design requirements or conformance status.

When auditing a component, use its currently applicable Expressive overview, guidelines, specifications, accessibility page, diagrams, and images. If the official catalog or project mapping changes, update only the affected rows. Do not maintain progress logs, test results, or a parallel list of installable components here.

| Official catalog entry         | Project design guide                                                 | Vue mapping                       |
| ------------------------------ | -------------------------------------------------------------------- | --------------------------------- |
| Button groups                  | [Button groups](specs/components/button-group.md)                    | `button-group`                    |
| Buttons                        | [Buttons](specs/components/button.md)                                | `button`                          |
| Extended FABs                  | [Floating action buttons and Extended FABs](specs/components/fab.md) | `fab` (`extended` variant)        |
| FAB menu                       | [FAB menu: project design guide](specs/components/fab-menu.md)       | `fab-menu`                        |
| Floating action buttons (FABs) | [Floating action buttons and Extended FABs](specs/components/fab.md) | `fab`                             |
| Icon buttons                   | [Icon buttons](specs/components/icon-button.md)                      | `icon-button`                     |
| Segmented buttons              | [Segmented buttons](specs/components/segmented-button.md)            | `segmented-button`                |
| Split buttons                  | [Split buttons](specs/components/split-button.md)                    | `split-button`                    |
| Date pickers                   | [Date pickers](specs/components/date-picker.md)                      | `date-picker`                     |
| Time pickers                   | [Time pickers](specs/components/time-picker.md)                      | `time-picker`                     |
| Loading indicator              | [Loading indicator](specs/components/loading-indicator.md)           | `loading-indicator`               |
| Progress indicators            | [Progress indicators](specs/components/progress-indicator.md)        | `progress-indicator`              |
| Navigation bar                 | [Navigation bar](specs/components/navigation-bar.md)                 | `navigation-bar`                  |
| Navigation drawer              | [legacy compatibility guide](specs/components/navigation-drawer.md)  | `navigation-drawer`               |
| Navigation rail                | [Navigation rail](specs/components/navigation-rail.md)               | `navigation-rail`                 |
| Bottom sheets                  | [Bottom sheets](specs/components/bottom-sheet.md)                    | `bottom-sheet`                    |
| Side sheets                    | [Side sheets](specs/components/side-sheet.md)                        | `side-sheet`                      |
| App bars                       | [App bars](specs/components/app-bar.md)                              | `app-bar`                         |
| Badges                         | [Badges](specs/components/badge.md)                                  | `badge`                           |
| Cards                          | [Cards](specs/components/card.md)                                    | `card`                            |
| Carousel                       | [Carousel: project design guide](specs/components/carousel.md)       | `carousel`                        |
| Checkbox                       | [Checkbox: project design guide](specs/components/checkbox.md)       | `checkbox`                        |
| Chips                          | [Chips: project design guide](specs/components/chips.md)             | `chips` family                    |
| Dialogs                        | [Dialogs](specs/components/dialog.md)                                | `dialog`                          |
| Divider                        | [Divider: project design guide](specs/components/divider.md)         | `divider`                         |
| Lists                          | [Lists](specs/components/list.md)                                    | `list`                            |
| Menus                          | [Menus](specs/components/menu.md)                                    | `menu`                            |
| Radio button                   | [Radio button](specs/components/radio-group.md)                      | `radio-group`                     |
| Search                         | [Search](specs/components/search.md)                                 | `search`                          |
| Sliders                        | [Sliders](specs/components/slider.md)                                | `slider`                          |
| Snackbar                       | [Snackbar](specs/components/snackbar.md)                             | `snackbar`                        |
| Switch                         | [Switch: project design guide](specs/components/switch.md)           | `switch`                          |
| Tabs                           | [Tabs](specs/components/tabs.md)                                     | `tabs`                            |
| Text fields                    | [Text fields](specs/components/form-field.md)                        | `FormField` around a native input |
| Toolbars                       | [Toolbars](specs/components/toolbar.md)                              | `toolbar`                         |
| Tooltips                       | [Tooltips](specs/components/tooltip.md)                              | `tooltip`                         |

Components without a direct Material 3 Expressive catalog entry are project-defined extensions. Their design guides should identify the extension and name the official guidance they build on; the full project inventory remains in [`registry/registry.json`](../registry/registry.json).
