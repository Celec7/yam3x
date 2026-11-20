# Material 3 component map

This map connects the [official Material 3 component catalog](https://m3.material.io/components) to each project design class, guide, and Vue mapping. Classes follow the [project glossary](../glossary.md) and describe the applicable design source, not conformance or implementation status.

For an audit, use the component's Expressive or baseline overview, guidelines, specifications, accessibility page, diagrams, and images. If the official catalog or project mapping changes, update only the affected rows. Do not add progress logs, verification records, or a second installable inventory.

| Official catalog entry         | Class       | Project design guide                                                    | Vue mapping                       |
| ------------------------------ | ----------- | ----------------------------------------------------------------------- | --------------------------------- |
| Button groups                  | Expressive  | [Button groups](../specs/components/button-group.md)                    | `button-group`                    |
| Buttons                        | Expressive  | [Buttons](../specs/components/button.md)                                | `button`                          |
| Extended FABs                  | Expressive  | [Floating action buttons and Extended FABs](../specs/components/fab.md) | `fab` (`extended` variant)        |
| FAB menu                       | Expressive  | [FAB menu](../specs/components/fab-menu.md)                             | `fab-menu`                        |
| Floating action buttons (FABs) | Expressive  | [Floating action buttons and Extended FABs](../specs/components/fab.md) | `fab`                             |
| Icon buttons                   | Expressive  | [Icon buttons](../specs/components/icon-button.md)                      | `icon-button`                     |
| Segmented buttons              | M3 baseline | [Segmented buttons](../specs/components/segmented-button.md)            | `segmented-button`                |
| Split buttons                  | Expressive  | [Split buttons](../specs/components/split-button.md)                    | `split-button`                    |
| Date pickers                   | M3 baseline | [Date pickers](../specs/components/date-picker.md)                      | `date-picker`                     |
| Time pickers                   | Expressive  | [Time pickers](../specs/components/time-picker.md)                      | `time-picker`                     |
| Loading indicator              | Expressive  | [Loading indicator](../specs/components/loading-indicator.md)           | `loading-indicator`               |
| Progress indicators            | Expressive  | [Progress indicators](../specs/components/progress-indicator.md)        | `progress-indicator`              |
| Navigation bar                 | Expressive  | [Navigation bar](../specs/components/navigation-bar.md)                 | `navigation-bar`                  |
| Navigation drawer              | M3 baseline | [legacy compatibility guide](../specs/components/navigation-drawer.md)  | `navigation-drawer`               |
| Navigation rail                | Expressive  | [Navigation rail](../specs/components/navigation-rail.md)               | `navigation-rail`                 |
| Bottom sheets                  | M3 baseline | [Bottom sheets](../specs/components/bottom-sheet.md)                    | `bottom-sheet`                    |
| Side sheets                    | M3 baseline | [Side sheets](../specs/components/side-sheet.md)                        | `side-sheet`                      |
| App bars                       | Expressive  | [App bars](../specs/components/app-bar.md)                              | `app-bar`                         |
| Badges                         | M3 baseline | [Badges](../specs/components/badge.md)                                  | `badge`                           |
| Cards                          | M3 baseline | [Cards](../specs/components/card.md)                                    | `card`                            |
| Carousel                       | M3 baseline | [Carousel](../specs/components/carousel.md)                             | `carousel`                        |
| Checkbox                       | M3 baseline | [Checkbox](../specs/components/checkbox.md)                             | `checkbox`                        |
| Chips                          | M3 baseline | [Chips](../specs/components/chips.md)                                   | `chips` family                    |
| Dialogs                        | M3 baseline | [Dialogs](../specs/components/dialog.md)                                | `dialog`                          |
| Divider                        | M3 baseline | [Divider](../specs/components/divider.md)                               | `divider`                         |
| Lists                          | Expressive  | [Lists](../specs/components/list.md)                                    | `list`                            |
| Menus                          | Expressive  | [Menus](../specs/components/menu.md)                                    | `menu`                            |
| Radio button                   | M3 baseline | [Radio button](../specs/components/radio-group.md)                      | `radio-group`                     |
| Search                         | Expressive  | [Search](../specs/components/search.md)                                 | `search`                          |
| Sliders                        | Expressive  | [Sliders](../specs/components/slider.md)                                | `slider`                          |
| Snackbar                       | M3 baseline | [Snackbar](../specs/components/snackbar.md)                             | `snackbar`                        |
| Switch                         | M3 baseline | [Switch](../specs/components/switch.md)                                 | `switch`                          |
| Tabs                           | M3 baseline | [Tabs](../specs/components/tabs.md)                                     | `tabs`                            |
| Text fields                    | M3 baseline | [Text fields](../specs/components/form-field.md)                        | `FormField` around a native input |
| Toolbars                       | Expressive  | [Toolbars](../specs/components/toolbar.md)                              | `toolbar`                         |
| Tooltips                       | M3 baseline | [Tooltips](../specs/components/tooltip.md)                              | `tooltip`                         |
| Scroll fields                  | Expressive  | [Scroll fields](../specs/components/scroll-field.md)                    | `scroll-field`                    |

`Expressive` means the official guidance provides an Expressive variant or treatment. `M3 baseline` means the official source remains M3 baseline; Material Web may lead its Web implementation and API reference. Segmented buttons and Navigation drawer are baseline components that the current guidance no longer recommends for new designs; their guides record the replacement.

Record Compose and Android Views availability during API review, not from this table. Material Web provides no official Expressive implementation; baseline Web availability does not create an Expressive reference or change the class. Components without a direct catalog entry are project extensions; their guides identify the extension and its official basis. The installable inventory remains the component entrypoints under [`registry/components/`](../../registry/components/); the CLI derives its metadata at pack time.
