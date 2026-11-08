# Changelog

## Unreleased

### Breaking changes

- DateInput removes the controlled `value` and `update:value` compatibility aliases. Use `v-model`, `modelValue`, and `update:modelValue` instead.
- FormField resolves form controls through native form elements or `data-form-field-control`; external custom-element tags are no longer special-cased.
- Remove the mandatory Tailwind CSS dependency. Copied components now use standard CSS without Tailwind or its Vite plugin, and the published Tailwind theme aliases (`bg-yam3x-*`, `text-yam3x-*`, `font-yam3x-*`, `rounded-yam3x-*`, `p-yam3x-*`, `gap-yam3x-*`, and other generated utilities) are no longer provided. Replace them with application-owned CSS using the retained semantic `--md-sys-*` custom properties.
- Button variants no longer use `tailwind-variants`. The exported `buttonVariants` helper keeps its name and options and selects the same component classes without utility output.

### Added

- Date pickers accept `closeLabel` for the full-screen modal close action. `DatePickerMessages` gains a matching `close` message.

### Fixed

- Date pickers separate docked month and year controls into their own dropdown-and-arrow groups. Docked month and year menus are vertical 48px listboxes with a selected-row check; the selected row scrolls into view when opened.
- Modal date pickers combine month and year into one dropdown with adjacent month arrows, keep the headline to one short line, and use the full localized date as its accessible name.
- Modal range calendars share one visible weekday row above the continuous month sequence, omit month paging controls, and keep hidden weekday headers for each month grid.
- Date picker weekday headers use narrow one-character labels, while today uses a `primary` label and 1dp outline. Modal year options use the unselected `on-surface-variant` label role.
- Hovering a selected date range endpoint keeps its primary fill and layers the state tint above it, instead of replacing the selected surface with a translucent hover circle.
- Docked date fields draw a notched 3px focus outline without shifting layout or drawing a second ring inside the input.
- Full-screen date picker modals expose a localized close button in the header.
- Expressive Lists use the small 8px corner shape for leading images and videos, and render leading and trailing icons at 20px. Selected rows switch their leading and trailing icons to `on-surface` on hover, focus, and press while the label keeps the selected role.
- Menu enter and exit motion now scales from the trigger-facing edge instead of clipping the surface, so the elevation shadow stays attached to the container and follows its rounded corners. The container shadow uses the shared elevation level 2.
- Dialog bodies reserve top inset for floating field labels, so the first label is no longer clipped by the scrollport's top edge.
- Select option panels keep receiving pointer input when a modal dialog locks the body, so options work with pointer and keyboard input.
- Outlined FormField labels sit in a transparent gap in the outline and keep their position on focus. The focused 3px stroke is drawn without changing layout, and Select defers the focus indicator to a wrapping FormField.
- Dialogs, menus, option panels, autocomplete, search, date pickers, time pickers, tooltips, FAB menus, bottom sheets, full-screen list panels, and modal navigation rails share an open-order layer stack. A new dialog closes popups from lower surfaces and takes a higher layer; popups opened inside it render above it.

### Updating copied source

Merge the new `src/yam3x.css`, `src/styles/yam3x-tokens.css`, `src/styles/yam3x-base.css`, and affected component files, including `src/components/yam3x/form-field/`, `src/components/yam3x/select/`, `src/components/yam3x/dialog/`, `src/components/yam3x/menu/`, `src/components/yam3x/bottom-sheet/`, `src/components/yam3x/fab-menu/`, `src/components/yam3x/autocomplete/`, `src/components/yam3x/search/`, `src/components/yam3x/time-picker/`, `src/components/yam3x/date-picker/`, `src/components/yam3x/date-input/`, `src/components/yam3x/list/`, `src/components/yam3x/navigation-rail/`, `src/components/yam3x/tooltip/`, `src/components/yam3x/option/`, and `src/components/yam3x/_shared/overlay-layer.ts` for the current interaction fixes. Remove `@tailwindcss/vite` from the app's Vite plugins and the Tailwind packages if nothing else uses them. Rewrite application styles that used YAM3X utility aliases with your own CSS; no compatibility aliases are provided. See the [source update guide](https://yam3x.iscccc.cc/guide/updating).

## 0.3.1

### Fixed

- Align idle labels in outlined multi-line FormField controls with the first text line.
- Align compact Navigation Bar indicators and ripple targets with the icon row.

### Updating copied source

Existing apps keep their installed component files. Merge the updated component files into your app to apply these fixes; see the [source update guide](https://yam3x.iscccc.cc/guide/updating).

[Compare changes from 0.3.0](https://github.com/Celec7/yam3x/compare/v0.3.0...v0.3.1).

## 0.3.0

### Added

- Distribute a scoped `AGENTS.md` in `src/components/yam3x/` when core foundations are initialized, preserving an existing target file.
- Summarize Material 3 Expressive layout, typography, and spacing guidance in the bilingual design guide, with Tailwind theme utility examples.

### Breaking changes

- Namespace YAM3X Tailwind color, typography, font, and easing utilities with `yam3x` to avoid collisions with application token names. For example, rename `bg-primary` to `bg-yam3x-primary` and `text-body-medium` to `text-yam3x-body-medium`.

### Updating copied source

When updating an existing app, merge the new `src/styles/yam3x-tokens.css` and rename earlier unprefixed utility classes. The CLI preserves files already installed in the app; follow the [source update guide](https://yam3x.iscccc.cc/guide/updating) to merge foundation changes.

[Compare changes from 0.2.0](https://github.com/Celec7/yam3x/compare/v0.2.0...v0.3.0).

## 0.2.0

### Added

- Project extensions for numeric editing (`number-field`), persistent feedback (`inline-message`), empty collections (`empty-state`), and controlled pagination (`pagination`).
- Form validation, nested field scopes, submission recovery, and recoverable file-upload queues through `form` and `file-upload`.
- `data-table` with sorting, row selection, column filters, fixed headers and logical fixed columns, and application-owned query recovery.
- Accessible `tree-view`, searchable `tree-select`, adaptive `cascader`, and responsive record details through `descriptions`.
- Shared `localization` configuration with scoped locale providers and message catalogs for selection, suggestions, dates, numbers, and interface actions.
- Changelog validation in CI and automatic GitHub Releases with matching notes and the verified package archive after npm publication.
- Data-driven Select options, removable selection chips, searchable single and multiple selection, and opt-in measured virtualization for Select, Autocomplete, and Tree view.

### Fixed

- Floating field labels in RTL and above searchable selection chips, required-state propagation, and description-observer feedback.
- Selection and error preservation when native form reset is canceled, picker focus recovery after option changes, and obsolete Tree view loading feedback.
- Virtual viewport anchoring across catalog updates and scrolling-container padding.
- Data table sort actions, component documentation consistency, and English/Chinese API explanations.

### Performance

- Reduce Select catalog recomputation, reuse Calendar date formatters, and avoid repeated Tree view traversal for cascading checks and virtual ancestor groups.
- Replace Progress geometry polling with observation while preserving inherited geometry updates.

### Updating copied source

The CLI preserves existing destination files. Updating the CLI or rerunning `add` does not replace installed components or shared foundation files. Follow the [source update guide](https://yam3x.iscccc.cc/guide/updating) to merge changes and their dependencies into an existing app.

## 0.1.1

### Added

- `yam3x --version` and `yam3x -v` print the CLI package version without requiring a consumer project.

[Compare changes from 0.1.0](https://github.com/Celec7/yam3x/compare/v0.1.0...v0.1.1).

## 0.1.0

### Added

- Initial public release of `@celec7/yam3x`, providing editable Vue component source based on Material 3 Expressive.
- `yam3x init`, `yam3x add`, and `yam3x list` for installing shared foundations, copying selected components, and discovering registry names. Installation preserves existing destination files and supports `--cwd` and `--no-install`.
- Component families for actions, selection, navigation, text and date input, feedback, layout, and content display, with theme tokens, dynamic color, and gesture utilities.
- English and Chinese component documentation, application installation and source-update guides, and registry names on component pages.
- CLI packaging and consumer-app verification, with tag-triggered npm publication through GitHub Actions.
