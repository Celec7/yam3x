# Project component design guides

Each guide states the design yam3x intends to implement. Material requirements come from the applicable Material 3 Expressive pages and diagrams; project choices are labeled separately. Vue source owns current code facts, `apps/docs/` owns public API documentation, and tests own verification evidence.

Use the [component guide template](TEMPLATE.md) for a new guide, the [project glossary](../glossary.md) for classes and terms, and [design and implementation references](../design/references.md) for source precedence. Follow the [component implementation workflow](../contributing/component-implementation.md) when creating or revising a guide. The official catalog mapping and Vue component mapping live in the [Material 3 component map](../design/m3-coverage.md), not in this index.

## Material component guides

| Component                                 | Guide                                                   |
| ----------------------------------------- | ------------------------------------------------------- |
| Badges                                    | [Badges](components/badge.md)                           |
| Bottom sheets                             | [Bottom sheets](components/bottom-sheet.md)             |
| Buttons                                   | [Buttons](components/button.md)                         |
| Split buttons                             | [Split buttons](components/split-button.md)             |
| Icon buttons                              | [Icon buttons](components/icon-button.md)               |
| Floating action buttons and Extended FABs | [FABs and Extended FABs](components/fab.md)             |
| FAB menu                                  | [FAB menu](components/fab-menu.md)                      |
| Cards                                     | [Cards](components/card.md)                             |
| Carousel                                  | [Carousel](components/carousel.md)                      |
| Divider                                   | [Divider](components/divider.md)                        |
| Chips family                              | [Chips](components/chips.md)                            |
| Filter chips                              | [Filter chips](components/filter-chip.md)               |
| Switch                                    | [Switch](components/switch.md)                          |
| Checkbox                                  | [Checkbox](components/checkbox.md)                      |
| Radio button                              | [Radio button](components/radio-group.md)               |
| Button groups                             | [Button groups](components/button-group.md)             |
| Segmented buttons                         | [Segmented buttons](components/segmented-button.md)     |
| Dialogs                                   | [Dialogs](components/dialog.md)                         |
| Side sheets                               | [Side sheets](components/side-sheet.md)                 |
| Navigation drawer (legacy)                | [Navigation drawer](components/navigation-drawer.md)    |
| Date pickers                              | [Date pickers](components/date-picker.md)               |
| Time pickers                              | [Time pickers](components/time-picker.md)               |
| Lists                                     | [Lists](components/list.md)                             |
| Progress indicators                       | [Progress indicators](components/progress-indicator.md) |
| Loading indicator                         | [Loading indicator](components/loading-indicator.md)    |
| Toolbars                                  | [Toolbars](components/toolbar.md)                       |
| App bars                                  | [App bars](components/app-bar.md)                       |
| Search                                    | [Search](components/search.md)                          |
| Snackbar                                  | [Snackbar](components/snackbar.md)                      |
| Sliders                                   | [Sliders](components/slider.md)                         |
| Tabs                                      | [Tabs](components/tabs.md)                              |
| Tooltips                                  | [Tooltips](components/tooltip.md)                       |
| Navigation bar                            | [Navigation bar](components/navigation-bar.md)          |
| Navigation rail                           | [Navigation rail](components/navigation-rail.md)        |
| Menus                                     | [Menus](components/menu.md)                             |
| Text fields                               | [Text fields](components/form-field.md)                 |

## Chip variants and set helpers

The [Chips family guide](components/chips.md) defines shared requirements. These pages cover the individual variants and project helpers.

| Guide                | Page                                              |
| -------------------- | ------------------------------------------------- |
| Assist chips         | [Assist chips](components/assist-chip.md)         |
| Filter chips         | [Filter chips](components/filter-chip.md)         |
| Filter chip set      | [Filter chip set](components/filter-chip-set.md)  |
| Input chips          | [Input chips](components/input-chip.md)           |
| Input chip set       | [Input chip set](components/input-chip-set.md)    |
| Suggestion chips     | [Suggestion chips](components/suggestion-chip.md) |
| Passive chip         | [Chip](components/chip.md)                        |
| Layout-only chip set | [Chip set](components/chip-set.md)                |

## Project extensions

These guides define project-owned compositions and behavior derived from Material guidance. They do not add official catalog entries or installable registry modules.

| Component         | Guide                                                    |
| ----------------- | -------------------------------------------------------- |
| Avatars           | [Avatars](components/avatar.md)                          |
| Autocomplete      | [Autocomplete](components/autocomplete.md)               |
| Breadcrumbs       | [Breadcrumbs](components/breadcrumb.md)                  |
| Calendar          | [Calendar](components/calendar.md)                       |
| Cascader          | [Cascader](components/cascader.md)                       |
| Data table        | [Data table](components/data-table.md)                   |
| Date time input   | [Date and time input](components/date-input.md)          |
| Descriptions      | [Descriptions](components/descriptions.md)               |
| Drawer container  | [Drawer container](components/drawer-container.md)       |
| Empty state       | [Empty state](components/empty-state.md)                 |
| File upload       | [File upload](components/file-upload.md)                 |
| Form              | [Form](components/form.md)                               |
| Headings          | [Headings](components/heading.md)                        |
| Icons             | [Icons](components/icon.md)                              |
| Inline message    | [Inline message](components/inline-message.md)           |
| Number field      | [Number field](components/number-field.md)               |
| Options           | [Options](components/option.md)                          |
| Pagination        | [Pagination](components/pagination.md)                   |
| Select            | [Select](components/select.md)                           |
| Shape library     | [Shape library](components/shape.md)                     |
| Supporting panes  | [Supporting panes](components/split-pane.md)             |
| Textarea autosize | [Auto-sizing text area](components/textarea-autosize.md) |
| TreeSelect        | [TreeSelect](components/tree-select.md)                  |
| Tree view         | [Tree view](components/tree-view.md)                     |

## Shared foundations

Read [shared design foundations](foundations.md), including [shared component contracts](foundations.md#shared-component-contracts), [theme and color](foundations/theme.md), and [project-defined virtual windows](virtual-windows.md).

The installable inventory remains the component entrypoints under [`registry/components/`](../../registry/components/). This index is navigation, not a second component registry.
