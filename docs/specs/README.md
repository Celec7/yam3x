# Project component design guides

Each page is the canonical statement of the design yam3x intends to implement. For Material components, its core requirements come from the applicable Material 3 Expressive pages and diagrams; project choices are labeled separately. The guide directs design and implementation, while Vue source owns current code facts, `apps/docs/` owns public API documentation, and tests own verification evidence.

When Material does not define a standalone component, its guide is labeled as a project extension and links the related official guidance. Project decisions remain explicit and separate from Material requirements.

The [component guide template](TEMPLATE.md) defines the intended scope and content. Use the [implementation workflow](../component-implementation.md) when creating or revising a guide. The installable inventory remains [`registry/registry.json`](../../registry/registry.json); this index is navigation, not a second component registry.

| Component                                 | Project design guide                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Badges                                    | [Badges: project design guide](components/badge.md)                                  |
| Breadcrumbs                               | [Breadcrumbs: project extension guide](components/breadcrumb.md)                     |
| Bottom sheets                             | [Bottom sheets: project design guide](components/bottom-sheet.md)                    |
| Buttons                                   | [Buttons: project design guide](components/button.md)                                |
| Split buttons                             | [Split buttons: project design guide](components/split-button.md)                    |
| Supporting panes                          | [Supporting panes: project extension guide](components/split-pane.md)                |
| Icon buttons                              | [Icon buttons: project design guide](components/icon-button.md)                      |
| Floating action buttons and Extended FABs | [Floating action buttons and Extended FABs: project design guide](components/fab.md) |
| FAB menu                                  | [FAB menu: project design guide](components/fab-menu.md)                             |
| Cards                                     | [Cards: project design guide](components/card.md)                                    |
| Avatars                                   | [Avatars: project extension guide](components/avatar.md)                             |
| Autocomplete                              | [Autocomplete: project extension guide](components/autocomplete.md)                  |
| Carousel                                  | [Carousel: project design guide](components/carousel.md)                             |
| Divider                                   | [Divider: project design guide](components/divider.md)                               |
| Filter chips                              | [Filter chips: project design guide](components/filter-chip.md)                      |
| Filter chip set                           | [Filter chip set: project extension guide](components/filter-chip-set.md)            |
| Chips family                              | [Chips: project design guide](components/chips.md)                                   |
| Switch                                    | [Switch: project design guide](components/switch.md)                                 |
| Checkbox                                  | [Checkbox: project design guide](components/checkbox.md)                             |
| Radio button                              | [Radio button: project design guide](components/radio-group.md)                      |
| Button groups                             | [Button groups: project design guide](components/button-group.md)                    |
| Segmented buttons                         | [Segmented buttons: project design guide](components/segmented-button.md)            |
| Calendar                                  | [Calendar: project extension guide](components/calendar.md)                          |
| Dialogs                                   | [Dialogs: project design guide](components/dialog.md)                                |
| Drawer container extension                | [Drawer container: project extension guide](components/drawer-container.md)          |
| Side sheets                               | [Side sheets: project design guide](components/side-sheet.md)                        |
| Navigation drawer (legacy)                | [Navigation drawer: legacy compatibility guide](components/navigation-drawer.md)     |
| Date pickers                              | [Date pickers: project design guide](components/date-picker.md)                      |
| Date and time input extension             | [Date and time input: project extension guide](components/date-input.md)             |
| Time pickers                              | [Time pickers: project design guide](components/time-picker.md)                      |
| Textarea autosize                         | [Auto-sizing text area: project extension guide](components/textarea-autosize.md)    |
| Headings                                  | [Headings: project extension guide](components/heading.md)                           |
| Icons                                     | [Icons: project extension guide](components/icon.md)                                 |
| Lists                                     | [Lists: project design guide](components/list.md)                                    |
| Progress indicators                       | [Progress indicators: project design guide](components/progress-indicator.md)        |
| Loading indicator                         | [Loading indicator: project design guide](components/loading-indicator.md)           |
| Toolbars                                  | [Toolbars: project design guide](components/toolbar.md)                              |
| App bars                                  | [App bars: project design guide](components/app-bar.md)                              |
| Search                                    | [Search: project design guide](components/search.md)                                 |
| Snackbar                                  | [Snackbar: project design guide](components/snackbar.md)                             |
| Sliders                                   | [Sliders: project design guide](components/slider.md)                                |
| Tabs                                      | [Tabs: project design guide](components/tabs.md)                                     |
| Tooltips                                  | [Tooltips: project design guide](components/tooltip.md)                              |
| Shape library                             | [Shape library: project extension guide](components/shape.md)                        |
| Navigation bar                            | [Navigation bar: project design guide](components/navigation-bar.md)                 |
| Navigation rail                           | [Navigation rail: project design guide](components/navigation-rail.md)               |
| Menus                                     | [Menus: project design guide](components/menu.md)                                    |
| Option family                             | [Options: project extension guide](components/option.md)                             |
| Select                                    | [Select menus: project extension guide](components/select.md)                        |
| Text fields                               | [Text fields: project design guide](components/form-field.md)                        |

## Application extensions

These guides define project-owned compositions and behavior derived from the shared Material foundations. They do not add entries to the official Material component catalog or declare installable registry modules.

| Extension      | Project design guide                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Data table     | [Data table: project extension guide](components/data-table.md)         |
| File upload    | [File upload: project extension guide](components/file-upload.md)       |
| Form           | [Form: project extension guide](components/form.md)                     |
| Tree view      | [Tree view: project extension guide](components/tree-view.md)           |
| Pagination     | [Pagination: project extension guide](components/pagination.md)         |
| Empty state    | [Empty state: project extension guide](components/empty-state.md)       |
| Inline message | [Inline message: project extension guide](components/inline-message.md) |

Use [TEMPLATE.md](TEMPLATE.md) for a new guide and [foundations.md](foundations.md) for shared design guidance.

Shared foundation pages: [cross-component design guidance](foundations.md) and [theme and color](foundations/theme.md).

The Chips family guide links guides for Material's assist, filter, input, and suggestion variants, and identifies the passive Chip and set helpers as project extensions.
