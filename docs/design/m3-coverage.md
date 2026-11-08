# Material 3 component map

This map connects entries in the [official Material 3 component catalog](https://m3.material.io/components) to their project design class, design guide, and Vue component. Classes follow the [project glossary](../glossary.md); they describe the applicable design source, not conformance or implementation status. A catalog entry alone does not establish that a design is current or recommended.

When auditing a component, use its applicable Expressive or baseline overview, guidelines, specifications, accessibility page, diagrams, and images. If the official catalog or project mapping changes, update only the affected rows. Do not maintain progress logs, test results, or a parallel list of installable components here.

| Official catalog entry         | Class      | Project design guide                                                    | Vue mapping                       |
| ------------------------------ | ---------- | ----------------------------------------------------------------------- | --------------------------------- |
| Button groups                  | Expressive | [Button groups](../specs/components/button-group.md)                    | `button-group`                    |
| Buttons                        | Expressive | [Buttons](../specs/components/button.md)                                | `button`                          |
| Extended FABs                  | Expressive | [Floating action buttons and Extended FABs](../specs/components/fab.md) | `fab` (`extended` variant)        |
| FAB menu                       | Expressive | [FAB menu: project design guide](../specs/components/fab-menu.md)       | `fab-menu`                        |
| Floating action buttons (FABs) | Expressive | [Floating action buttons and Extended FABs](../specs/components/fab.md) | `fab`                             |
| Icon buttons                   | Expressive | [Icon buttons](../specs/components/icon-button.md)                      | `icon-button`                     |
| Segmented buttons              | Baseline   | [Segmented buttons](../specs/components/segmented-button.md)            | `segmented-button`                |
| Split buttons                  | Expressive | [Split buttons](../specs/components/split-button.md)                    | `split-button`                    |
| Date pickers                   | Baseline   | [Date pickers](../specs/components/date-picker.md)                      | `date-picker`                     |
| Time pickers                   | Baseline   | [Time pickers](../specs/components/time-picker.md)                      | `time-picker`                     |
| Loading indicator              | Expressive | [Loading indicator](../specs/components/loading-indicator.md)           | `loading-indicator`               |
| Progress indicators            | Expressive | [Progress indicators](../specs/components/progress-indicator.md)        | `progress-indicator`              |
| Navigation bar                 | Expressive | [Navigation bar](../specs/components/navigation-bar.md)                 | `navigation-bar`                  |
| Navigation drawer              | Baseline   | [legacy compatibility guide](../specs/components/navigation-drawer.md)  | `navigation-drawer`               |
| Navigation rail                | Expressive | [Navigation rail](../specs/components/navigation-rail.md)               | `navigation-rail`                 |
| Bottom sheets                  | Baseline   | [Bottom sheets](../specs/components/bottom-sheet.md)                    | `bottom-sheet`                    |
| Side sheets                    | Baseline   | [Side sheets](../specs/components/side-sheet.md)                        | `side-sheet`                      |
| App bars                       | Expressive | [App bars](../specs/components/app-bar.md)                              | `app-bar`                         |
| Badges                         | Baseline   | [Badges](../specs/components/badge.md)                                  | `badge`                           |
| Cards                          | Baseline   | [Cards](../specs/components/card.md)                                    | `card`                            |
| Carousel                       | Baseline   | [Carousel: project design guide](../specs/components/carousel.md)       | `carousel`                        |
| Checkbox                       | Baseline   | [Checkbox: project design guide](../specs/components/checkbox.md)       | `checkbox`                        |
| Chips                          | Baseline   | [Chips: project design guide](../specs/components/chips.md)             | `chips` family                    |
| Dialogs                        | Baseline   | [Dialogs](../specs/components/dialog.md)                                | `dialog`                          |
| Divider                        | Baseline   | [Divider: project design guide](../specs/components/divider.md)         | `divider`                         |
| Lists                          | Expressive | [Lists](../specs/components/list.md)                                    | `list`                            |
| Menus                          | Expressive | [Menus](../specs/components/menu.md)                                    | `menu`                            |
| Radio button                   | Baseline   | [Radio button](../specs/components/radio-group.md)                      | `radio-group`                     |
| Search                         | Expressive | [Search](../specs/components/search.md)                                 | `search`                          |
| Sliders                        | Expressive | [Sliders](../specs/components/slider.md)                                | `slider`                          |
| Snackbar                       | Baseline   | [Snackbar](../specs/components/snackbar.md)                             | `snackbar`                        |
| Switch                         | Baseline   | [Switch: project design guide](../specs/components/switch.md)           | `switch`                          |
| Tabs                           | Baseline   | [Tabs](../specs/components/tabs.md)                                     | `tabs`                            |
| Text fields                    | Baseline   | [Text fields](../specs/components/form-field.md)                        | `FormField` around a native input |
| Toolbars                       | Expressive | [Toolbars](../specs/components/toolbar.md)                              | `toolbar`                         |
| Tooltips                       | Baseline   | [Tooltips](../specs/components/tooltip.md)                              | `tooltip`                         |

`Expressive` means the official guidance provides an Expressive variant or current Expressive treatment. `Baseline` means the official source remains M3 baseline; Material Web may lead its Web implementation and API reference. Segmented buttons and Navigation drawer are baseline components that the current guidance no longer recommends for new designs; their guides record the replacement.

Reference availability for Compose, Android Views, and Material Web is recorded during API review, not inferred from this class. Components without a direct catalog entry are project extensions; their guides identify the extension and the official guidance they build on. The full project inventory remains in [`registry/registry.json`](../../registry/registry.json).
