# Cascader: project extension guide

## Scope

Cascader selects a path through a hierarchy, exposing one immediate child collection at each step. It is a project extension, not an official Material component or a nested command Menu. Use TreeSelect when the whole expanded hierarchy is the primary navigation model.

## Design target

- Retain a labelled selection field and readable accepted content, following [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines).
- Distinguish primary labels, supporting context, and the affordance to reveal more choices. Use the alignment and hierarchy guidance in [Lists guidelines](https://m3.material.io/components/lists/guidelines).
- Keep option state layers, shapes, and popup colors consistent with the adopted [Menus](menu.md) design. The path selection behavior and popup semantics are project-defined, rather than Material menu commands.

## Project decisions

- Project-defined (`cascader.path.commit`): Accept an ordered path of stable values. Exploring a branch changes the draft path without committing a terminal value. Accept leaves by default; allow explicit intermediate-node acceptance when requested. Replacing an ancestor discards the obsolete draft suffix, without changing the accepted path until acceptance.
- Project-defined (`cascader.dialog.focus`): Open a labelled selection dialog. Give each visible level a named single-selection list, retain keyboard navigation within levels, and provide explicit next/back navigation. Escape dismisses the draft and restores the accepted display. Outside dismissal preserves destination focus. Follow [dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) keyboard guidance where applicable; do not imply modality unless background content is actually inert.
- Project-defined (`cascader.layout.adaptive`): Use adjacent level panels when space permits. On compact containers, show one level with a visible ancestor path and back action. Preserve full labels and direction-aware navigation in both layouts.
- Project-defined (`cascader.search.paths`): Optional search matches complete paths and accepts a matching path explicitly. Disabled ancestors make descendant acceptance unavailable. Native forms and reset reflect accepted paths, with an unambiguous serialized path value. Built-in navigation and status text uses shared localization, separately from application labels.

- Project-defined (`cascader.form.native`): Submit the accepted path as a JSON array string in a native select proxy, retaining unknown application-owned paths. Reset restores the initial accepted path. Disabling the field or its fieldset closes the popup and prevents changes.
