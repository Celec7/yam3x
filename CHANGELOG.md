# Changelog

## Unreleased Changes

- **Select no longer puts `aria-valuetext` on its combobox trigger.** The trigger exposes the selected text as its accessible value without an attribute that `role="combobox"` does not support.
- **Theme controller keeps `meta[name="theme-color"]` in sync.** A root theme application or mode change now updates the browser chrome color from the resolved surface role.

## 0.5.0

0.4.0 was tagged but is not available on npm. 0.5.0 is the next publishable version and includes every change since 0.3.1; review the [0.4.0 section](#040) for its breaking changes before upgrading.

### Breaking changes

- **Tabs use one Tab stop.** The selected enabled tab owns `tabindex="0"`; arrow keys move focus and Space or Enter activates the focused tab. This follows the WAI-ARIA tablist focus contract while keeping Material's manual activation. Keyboard users no longer Tab through every enabled tab.
- **Toolbars rove focus across action controls.** Button-like actions share one Tab stop; editable controls and composite widgets keep their own Tab stops. A toolbar containing editable controls can therefore have additional Tab stops by design. Consumers that relied on every action being a Tab stop should update their keyboard expectations.
- **Bottom sheets expose a close control at every modal detent.** `showCloseButton` defaults to `true` for both variants, so a partial modal sheet now includes a visible Close button. Set it to `false` only when the content provides its own visible dismissal control.
- **Dialogs warn when no visible dismissal control exists.** The close icon remains optional; an action button normally supplies the visible path. Development builds warn when a dialog opens with neither. Add a dismissing action or enable `showCloseButton` to resolve the warning.

### Added

- **Carousel slide announcements.** A visually hidden polite status reports the settled item as `N of M: label`; keyboard focus does not duplicate its own announcement.

### Fixed

- **Page scroll locking compensates the scrollbar width.** Opening Search, Time picker, or another shared-lock surface no longer removes the root scrollbar without preserving layout width.

### Upgrade notes

- **Tabs and Toolbar:** no template changes are required for the new focus model. Re-test keyboard flows that depended on every tab or toolbar action being a separate Tab stop.
- **Bottom sheet:** if a modal sheet must keep its previous partial-height header without a Close button, set `showCloseButton="false"` and provide another visible dismissal control.
- **Dialog:** add an action that calls `close()` or a close button. Escape and outside-click remain available but do not satisfy the visible-control requirement.

[Compare changes from 0.3.1](https://github.com/Celec7/yam3x/compare/v0.3.1...v0.5.0).

## 0.4.0

This release aligns the component set with Material 3 Expressive, removes Tailwind and deprecated compatibility layers, and moves registry dependency management into the CLI build.

### Breaking changes

- **Tailwind is no longer required.** Copied components use standard CSS without Tailwind or its Vite plugin. The published Tailwind theme aliases (`bg-yam3x-*`, `text-yam3x-*`, `font-yam3x-*`, `rounded-yam3x-*`, `p-yam3x-*`, `gap-yam3x-*`, and other generated utilities) are removed. Replace them with application-owned CSS using the retained semantic `--md-sys-*` custom properties.
- **Button variants no longer use `tailwind-variants`.** The exported `buttonVariants` helper keeps its name and options and selects the same component classes without utility output.
- **The CLI dependency model changed.** Vue is now a peer dependency: the CLI validates its declared and installed version but does not add it to runtime dependencies. Registry metadata is generated into the published package at pack time instead of being committed as `registry/registry.json`; use `pnpm registry:check` to validate the derived model.
- **DateInput removes the controlled `value` and `update:value` aliases.** Use `v-model`, `modelValue`, and `update:modelValue` instead.
- **Heading defaults changed.** Empty state and Inline message titles render as level-3 headings by default, with `headingLevel` overrides; Cascader dialog titles use level 2.
- **FormField resolves controls through native form elements or `data-form-field-control`.** External custom-element tags are no longer special-cased.
- **FloatingActionButton APIs were narrowed.** FloatingActionButton and ExtendedFloatingActionButton remove the deprecated `disabled` and `disabledInteractive` props; omit the control when its action is unavailable. FloatingActionButton, ToggleFloatingActionButton, and FabMenu trigger sizes remove the baseline `small` size. ExtendedFloatingActionButton keeps its Expressive 56 px `small` size.
- **Elevation helper classes were removed.** Use the `--md-sys-elevation-level1` through `--md-sys-elevation-level5` tokens in application CSS instead of `yam3x-elevation-1` through `yam3x-elevation-5`.
- **NavigationRail `auto` mode follows the Expanded breakpoint.** It is hidden below 840px and expanded at 840px instead of switching at 960px. Navigation examples swap at 840px instead of rendering a bar and rail simultaneously.

### Added

- **Agent skills.** Add the installable `yam3x` Agent Skill and the repository-only `yam3x-component-alignment` skill. `pnpm docs:check` validates skill frontmatter, references, and links.
- **CLI dependency reconciliation.** `yam3x status` reports missing, unsafe, or outdated dependency declarations without writing files. `yam3x sync` updates declarations for installed components without modifying copied source. Compatibility uses range inclusion instead of intersection, and `add` preflights every requested component before writing.
- **Responsive breakpoint contract.** `pnpm breakpoints:check` enforces the shared Material breakpoints (`600`, `840`, `1200`, `1600`), their fractional lower bounds, and documented component-specific exceptions in CI.
- **Pointer capability flags.** Foundation CSS exposes read-only primary-pointer, any-pointer, hover, and any-hover flags. Components use the primary pointer for layout sizing so hybrid devices stay stable.
- **Date picker actions.** Date pickers accept `closeLabel` and `saveLabel` for full-screen modal actions, with matching `close` and `save` messages in `DatePickerMessages`.
- **InlineMessage headings.** InlineMessage accepts `headingLevel` for its optional title.

### Component alignment

- **Foundations:** typography tracking now follows the Material baseline and emphasized roles for Display Large, Title Medium, Body Medium, and their emphasized variants. The global focus fallback uses the shared 3px/2px tokens and remains visible for pointer focus. Responsive rules use the compact boundary below 600px consistently.
- **Form fields and inputs:** filled and outlined FormFields keep their label, value, icon, and focus geometry stable, including empty invalid and disabled states. Checkbox, Radio, and Switch use the Material focus rings and state layers. NumberField records its padding and 48×40 step targets. FileUpload uses one drop boundary and a resolved disabled surface. FilterChipSet exposes a labeled toolbar. Search keeps its 48px action targets, 4px inset, and contained-bar motion.
- **Date and time:** DatePicker separates docked month and year controls, aligns modal month/year selection, shares one modal range weekday row, and keeps range hover, 3px focus, 16px range padding, and localized Save actions. Calendar follows the Date picker contract for weekday labels, month/year keyboard rows, focus, outside days, range bars, motion, and RTL; same-day ranges use one endpoint. DateInput uses the shared text-field states with deferred validation. TimePicker moves the dial/input toggle into the action row, uses the shared focus indicators, keeps one-digit input editable until the second digit, and preserves an invalid draft's original hour cycle across locale changes.
- **Navigation and layout:** Compact NavigationBar items reserve 8px between icon and label, and selected labels keep Label Medium. Expanded NavigationRail keeps its 20px surface inset and aligns menu and destination icon axes. Secondary Tabs span the selected tab width. Pagination uses the shared touch-target and 8px spacing tokens. Compact docked Toolbars distribute actions evenly with 16px outer padding. Breadcrumb uses one shared state layer, distinguishes current, static, and link items, and keeps a 40px pill inside a 48px target.
- **Overlays and menus:** Dialogs, menus, option panels, autocomplete, search, date/time pickers, tooltips, FAB menus, bottom sheets, full-screen list panels, and modal navigation rails share an open-order layer stack. Dialog sizing, close-button focus, and body label insets were corrected. Menu motion scales from the trigger-facing edge. Select, Option, Autocomplete, Cascader, and TreeSelect share row geometry, focus rings, elevation, and pointer-aware insets; Select options remain interactive while a modal dialog locks the body. Modal side sheets gain the official 16px detached margin and corner radius. Snackbar actions add focus state layers. Drawer reduced motion removes the scrim transition. Split pane settles on the grid transition and uses the shared focus ring.
- **Actions and selection:** Buttons use the Material 2px focus-ring offset. Selected round icon buttons keep their square corner; selected square toggles stay fully rounded. Split button trailing segments become fully rounded when the menu opens. Connected Button Groups round only inner corners and reserve space for the focus ring. Segmented button focus surrounds the visual segment instead of the 48px target. Slider value indicators and stop geometry follow the Compose cap-center grid. Actionable cards use the official focus offset.
- **Content display:** Descriptions scope their styles and density gaps. Inline messages record their icon offset and inherited foreground. Empty state records its illustration color. Avatar and List initials share Title Medium. Icon clamps optical size and documents grade/weight fallback. Data tables derive selection geometry from shared targets and keep headings on-surface. Badges preserve official label metrics and share anchor observation. Lists use small leading-media corners, 20px icons, and selected-row icon roles. Carousels support primary-button drag with click suppression. Tree view applies container density, bounded row height, and ripple-only pressed feedback. FAB menu close icons scale to 20px, and pill-stack items use the secondary focus ring and elevation tokens. FABs draw the 3px secondary focus indicator with the official offset; lowered FABs use the token elevations.

### Performance

- Select batches slotted option registration in DOM order and reuses catalog filtering, avoiding quadratic registration for large non-virtual catalogs.
- Linear progress reuses measured geometry without allocating probes or reading layout; CSS geometry overrides and container resizing remain reactive.
- Badges share anchor observation within each document or shadow root and ignore unrelated DOM changes while retaining dynamic anchors, direction changes, and slot updates.
- Pan and Swipe retain only the samples needed for motion metrics, keeping per-update work and gesture storage bounded.
- Tree view shares incremental cascade summaries and resolves expanded visibility in one pass; virtual windows reuse key indexes for distant navigation and row offsets.
- Documentation demo themes observe DOM changes only while active and update changed demo subtrees without rescanning the page.

### Tooling and documentation

- The component guides, demos, and bilingual navigation were rewritten around the current API and Material guidance. `pnpm docs:check` validates page structure, English/Chinese heading parity, demo coverage, and skill links.
- Registry metadata is generated in memory by `scripts/generate-registry.mjs` and written to the ignored CLI package directory at pack time. Dependency declarations use one package table with `runtime`, `peer`, and `dev` kinds.
- `pnpm deps:update` refreshes compatible catalog ranges and resolved versions, then reruns the registry and CLI checks.
- Workspace dependencies were refreshed to Vue 3.5.45, Ark UI 5.40.0, Vite 8.3.7, Vitest 5.1.0, Playwright 1.65.0, and current ESLint tooling. TypeScript 7 and happy-dom 21 remain on their prior majors pending separate review.

### Updating copied source

This release changes copied internals across foundations, form fields, date/time, navigation, overlays, actions, and content. The CLI still preserves existing files; merge the affected source manually and keep application edits.

1. Update the CLI, then check and align dependency declarations:
   ```sh
   pnpm dlx @celec7/yam3x@latest status
   pnpm dlx @celec7/yam3x@latest sync
   ```
2. Merge `src/yam3x.css`, `src/styles/yam3x-*.css`, `src/lib/yam3x/`, and the affected `src/components/yam3x/` files. The [source update guide](https://yam3x.iscccc.cc/guide/maintain/updating) covers the merge workflow.
3. Run your type check and build, then verify the affected interactions in a browser.

`status` reports missing or unsafe declarations; `sync` adds missing runtime and development dependencies and narrows ranges that permit versions outside the registry requirement. It does not overwrite copied source or remove dependencies. The component and performance fixes require no prop or event migrations beyond the breaking changes above.

[Compare changes from 0.3.1](https://github.com/Celec7/yam3x/compare/v0.3.1...v0.4.0).

## 0.3.1

### Fixed

- Descriptions scopes its styles, scales the remaining item and inline gaps with density, and records the outlined border, corner, and padding.
- Inline messages record their fixed 2px leading-icon optical offset and which Button variants inherit the message foreground.
- Empty state records its On Surface Variant illustration color and exposes an illustration-color override.
- Avatar applies the complete `title-medium` font family, and List leading initials share the same typography instead of a reduced size and separate tracking.
- Icon clamps finite `opticalSize` values to the Material Symbols 20–48 range, documents explicit grade mapping, and records weight fallback behavior.
- Number field documents its Form field block padding overrides and records the 48×40 minimum step boxes, 4px action gap, and editor-only Tab stop.
- Data tables derive the selection column from the shared touch target plus both inline paddings, use spacing tokens for filterable header insets, and keep sort icon geometry explicit.
- Align idle labels in outlined multi-line FormField controls with the first text line.
- Align compact Navigation Bar indicators and ripple targets with the icon row.

### Updating copied source

Existing apps keep their installed component files. Merge the updated component files into your app to apply these fixes; see the [source update guide](https://yam3x.iscccc.cc/guide/maintain/updating).

[Compare changes from 0.3.0](https://github.com/Celec7/yam3x/compare/v0.3.0...v0.3.1).

## 0.3.0

### Added

- Distribute a scoped `AGENTS.md` in `src/components/yam3x/` when core foundations are initialized, preserving an existing target file.
- Summarize Material 3 Expressive layout, typography, and spacing guidance in the bilingual design guide, with Tailwind theme utility examples.

### Breaking changes

- Namespace YAM3X Tailwind color, typography, font, and easing utilities with `yam3x` to avoid collisions with application token names. For example, rename `bg-primary` to `bg-yam3x-primary` and `text-body-medium` to `text-yam3x-body-medium`.

### Updating copied source

When updating an existing app, merge the new `src/styles/yam3x-tokens.css` and rename earlier unprefixed utility classes. The CLI preserves files already installed in the app; follow the [source update guide](https://yam3x.iscccc.cc/guide/maintain/updating) to merge foundation changes.

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

- Descriptions scopes its styles, scales the remaining item and inline gaps with density, and records the outlined border, corner, and padding.
- Inline messages record their fixed 2px leading-icon optical offset and which Button variants inherit the message foreground.
- Empty state records its On Surface Variant illustration color and exposes an illustration-color override.
- Avatar applies the complete `title-medium` font family, and List leading initials share the same typography instead of a reduced size and separate tracking.
- Icon clamps finite `opticalSize` values to the Material Symbols 20–48 range, documents explicit grade mapping, and records weight fallback behavior.
- Number field documents its Form field block padding overrides and records the 48×40 minimum step boxes, 4px action gap, and editor-only Tab stop.
- Data tables derive the selection column from the shared touch target plus both inline paddings, use spacing tokens for filterable header insets, and keep sort icon geometry explicit.
- Floating field labels in RTL and above searchable selection chips, required-state propagation, and description-observer feedback.
- Selection and error preservation when native form reset is canceled, picker focus recovery after option changes, and obsolete Tree view loading feedback.
- Virtual viewport anchoring across catalog updates and scrolling-container padding.
- Data table sort actions, component documentation consistency, and English/Chinese API explanations.

### Performance

- Reduce Select catalog recomputation, reuse Calendar date formatters, and avoid repeated Tree view traversal for cascading checks and virtual ancestor groups.
- Replace Progress geometry polling with observation while preserving inherited geometry updates.

### Updating copied source

The CLI preserves existing destination files. Updating the CLI or rerunning `add` does not replace installed components or shared foundation files. Follow the [source update guide](https://yam3x.iscccc.cc/guide/maintain/updating) to merge changes and their dependencies into an existing app.

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
