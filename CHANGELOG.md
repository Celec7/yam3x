# Changelog

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
