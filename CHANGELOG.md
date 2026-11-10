# Changelog

## Unreleased

### Breaking changes

- DateInput removes the controlled `value` and `update:value` compatibility aliases. Use `v-model`, `modelValue`, and `update:modelValue` instead.
- FormField resolves form controls through native form elements or `data-form-field-control`; external custom-element tags are no longer special-cased.
- Remove the mandatory Tailwind CSS dependency. Copied components now use standard CSS without Tailwind or its Vite plugin, and the published Tailwind theme aliases (`bg-yam3x-*`, `text-yam3x-*`, `font-yam3x-*`, `rounded-yam3x-*`, `p-yam3x-*`, `gap-yam3x-*`, and other generated utilities) are no longer provided. Replace them with application-owned CSS using the retained semantic `--md-sys-*` custom properties.
- Button variants no longer use `tailwind-variants`. The exported `buttonVariants` helper keeps its name and options and selects the same component classes without utility output.

### Added

- Foundation CSS exposes read-only pointer capability flags for primary pointer, any-pointer, hover, and any-hover. Components use the primary pointer for layout sizing so hybrid devices stay stable.
- Date pickers accept `closeLabel` and `saveLabel` for the full-screen modal actions. `DatePickerMessages` gains matching `close` and `save` messages.

### Fixed

- Date pickers separate docked month and year controls into their own dropdown-and-arrow groups. Docked month and year menus are vertical 48px listboxes with a selected-row check; the selected row scrolls into view when opened.
- Modal date pickers combine month and year into one dropdown with adjacent month arrows, keep the headline to one short line, and use the full localized date as its accessible name.
- Modal range calendars share one visible weekday row above the continuous month sequence, omit month paging controls, and keep hidden weekday headers for each month grid.
- Date picker weekday headers use narrow one-character labels, while today uses a `primary` label and 1dp outline. Modal year options use the unselected `on-surface-variant` label role.
- Hovering a selected date range endpoint keeps its primary fill and layers the state tint above it, instead of replacing the selected surface with a translucent hover circle.
- Docked date fields draw a notched 3px focus outline without shifting layout or drawing a second ring inside the input.
- Full-screen date picker modals expose localized close and Save actions in the header.
- Docked range values use symmetric 16px block padding and center vertically in the 56px field.
- Data tables apply On Surface to static column headings explicitly, so ambient table styles cannot replace the project heading role.
- Compact Navigation Bar items reserve 8px between the icon row and label, keeping 4px clearance below the 32px active indicator.
- Filled FormFields center empty labels and icons in the 56px field and place the value row below the floating label with the official 8px bottom padding. Icon slots no longer raise the container height; leading and trailing icons use 12px edge padding and 16px text spacing.
- Empty invalid FormFields keep the label centered until focus or content floats it. Filled disabled active indicators use the 38% on-surface role instead of the outlined 12% stroke.
- Focusing a filled FormField no longer shifts its label or content horizontally.
- Floating FormField labels use the populated 16px line box and center on the outlined border at the scaled 12px type size.
- Checkbox keyboard focus uses the Material Web focus-ring treatment: a 44px circular `secondary` ring with a 3px stroke instead of an outline around the 18px box.
- Radio buttons use the same 44px circular focus ring and keep the 40px state layer for hover and pressed feedback.
- Switch focus now surrounds the 52px track with the 3px `secondary` indicator, unselected handles center at 16px from the track edge, icon handles stay 24px when disabled, and the pressed handle size grows over a 100ms linear transition.
- Time pickers place the dial/input toggle in the bottom action row with the keyboard icon, use the 3px `secondary` focus indicator on selectors and period options, and focus input fields with a 2px `primary` outline and `primary-container` fill. One-digit input stays editable until the second digit is typed and is padded on blur.
- Basic dialogs size to their content between 280px and 560px instead of always filling the maximum width. The project close button uses a 40px state layer and an inset 3px `secondary` focus ring so the indicator stays visible inside the container.
- Secondary tabs span the full selected tab width with their 2px active indicator; the 2px side insets remain specific to Primary tabs.
- Snackbar action and close controls add the official 10% focus state layer alongside the 3px focus ring; hover remains 8%.
- Actionable cards use the official 3px `secondary` focus indicator with a 2px offset instead of the shared 3px offset.
- Badges keep the official 11px label metrics for one- to three-character counts; only four-character labels use the compact 10px metrics required to stay within the 16×34px maximum container.
- Modal side sheets are now detached from the window by the official 16px margin on the top, trailing, and bottom edges and use a 16px corner radius; standard sheets stay attached.
- Segmented button focus now surrounds the 40px visual segment with the official 3px `secondary` ring and 2px gap, instead of the larger 48px touch target.
- Buttons use the Material 2px focus-ring offset instead of the shared 3px offset.
- Selected round icon buttons use their size's square corner instead of an oversized radius; selected square toggles still become fully rounded.
- Opening the trailing menu makes the Split button segment fully rounded, including square-styled Split buttons, while the leading segment keeps its shape.
- Connected Button Groups round only their inner corners on hover, focus, and selection; square outer corners stay square. The scrollport reserves space for the full focus ring so first and last controls no longer clip it.
- Selected Navigation Bar labels keep the Label Medium weight from the official token set instead of switching to bold.
- Expanded Navigation Rails keep the 20px surface inset before destination rows, placing the active indicator 36px from the rail edge and aligning menu and destination icon axes.
- Compact docked Toolbars distribute equal space between actions while keeping the 16px minimum outer padding, instead of adding extra edge spacing.
- Slider value indicators use the official 14px/20px label metrics with 400 weight and 0.5px tracking.
- Foundation typography tracking now matches the Material baseline and emphasized roles for Display Large, Title Medium, Body Medium, and their emphasized variants. The global focus fallback uses the shared 3px/2px focus-indicator tokens, and strong focus now keeps the ring visible for pointer focus.
- Horizontal carousels now support primary-button mouse dragging with click suppression after a drag; touch and trackpad scrolling remain native.
- FAB menu close buttons now scale their icon from the closed FAB size to the official 20px close icon. Pill-stack items use the `secondary` focus ring and their elevation tokens: level 0 at rest, level 4 on hover, and level 3 on focus and press.
- FABs now draw the 3px `secondary` focus indicator with the official outer offset, including Extended FAB and toggle FABs. Lowered FABs use the token-defined level 1 elevation at rest, focus, and press, and level 2 on hover.
- Search bar action targets keep the official 48px size, 4px container inset, and zero gap between adjacent trailing actions instead of inheriting action margins. The focused back target and input text now align to the same 4px/48px measurements as the unfocused bar, and contained bar width and margin changes use the fast spatial spring.
- Slider stops now use the Compose cap-center span, with interior thumbs aligned to the same grid and endpoint thumbs kept at the physical track ends. Standard sliders keep the first tick and replace the last tick with an inactive-end stop; centered and range sliders use an end stop at each visible inactive end. The active handle value omits its tick, disabled active stops use `inverse-on-surface`, and active track segments use the official 2px inner corners.
- Expressive Lists use the small 8px corner shape for leading images and videos, and render leading and trailing icons at 20px. Selected rows switch their leading and trailing icons to `on-surface` on hover, focus, and press while the label keeps the selected role.
- Menu enter and exit motion now scales from the trigger-facing edge instead of clipping the surface, so the elevation shadow stays attached to the container and follows its rounded corners. The container shadow uses the shared elevation level 2.
- Dialog bodies reserve top inset for floating field labels, so the first label is no longer clipped by the scrollport's top edge.
- Select option panels keep receiving pointer input when a modal dialog locks the body, so options work with pointer and keyboard input.
- Outlined FormField labels sit in a transparent gap in the outline and keep their position on focus. The focused 3px stroke is drawn without changing layout, and Select defers the focus indicator to a wrapping FormField.
- Option rows use a 44px visual surface inside the 48px interaction target, a 3px `secondary` focus ring that preserves the row radius, level 2 panel elevation, label-large text, and 32px group labels. A fine primary pointer uses 16px start / 10px end and a 12px icon gap; a coarse pointer uses 12px / 12px and 8px.
- Select keeps the accepted value on-surface while its menu is open and applies primary only to the trailing arrow. Multiple-selection chips use an 8px row gap without extra per-chip margins and reserve 4px above the first row for floating-label clearance, and the standalone focus fallback uses the 3px field outline.
- Autocomplete keeps an outlined field with a 3px primary focus outline, exposes hint and error supporting text, and aligns suggestions to the shared menu language: 44px visual rows inside 48px targets, a 3px secondary focus ring, label-large text, pointer-aware insets, and level 2 popup elevation.
- Cascader resets the inherited OptionPanel menu padding so its own density-scaled 12px dialog padding is the single content inset; option surfaces now align with the title, search field, and footer while retaining the shared 44px visual rows inside 48px targets.
- Dialogs, menus, option panels, autocomplete, search, date pickers, time pickers, tooltips, FAB menus, bottom sheets, full-screen list panels, and modal navigation rails share an open-order layer stack. A new dialog closes popups from lower surfaces and takes a higher layer; popups opened inside it render above it.

### Updating copied source

Merge the new `src/yam3x.css`, `src/styles/yam3x-tokens.css`, `src/styles/yam3x-pointer.css`, `src/styles/yam3x-base.css`, and affected component files, including `src/components/yam3x/form-field/`, `src/components/yam3x/select/`, `src/components/yam3x/dialog/`, `src/components/yam3x/menu/`, `src/components/yam3x/bottom-sheet/`, `src/components/yam3x/fab-menu/`, `src/components/yam3x/autocomplete/`, `src/components/yam3x/search/`, `src/components/yam3x/time-picker/`, `src/components/yam3x/date-picker/`, `src/components/yam3x/date-input/`, `src/components/yam3x/list/`, `src/components/yam3x/navigation-rail/`, `src/components/yam3x/tooltip/`, `src/components/yam3x/option/`, and `src/components/yam3x/_shared/overlay-layer.ts` for the current interaction fixes. Remove `@tailwindcss/vite` from the app's Vite plugins and the Tailwind packages if nothing else uses them. Rewrite application styles that used YAM3X utility aliases with your own CSS; no compatibility aliases are provided. See the [source update guide](https://yam3x.iscccc.cc/guide/updating).

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
