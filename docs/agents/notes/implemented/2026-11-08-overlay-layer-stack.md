<!--
Lifecycle: implemented. The code, documentation, and verification landed together. Record follow-up defects as new records rather than reopening this one.
-->

# Order floating overlays by open sequence

**Status:** implemented
**Date:** 2026-11-08
**Owner:** [Architecture and ownership](../../../architecture.md)

## Problem

Floating surfaces used fixed z-index values chosen per component: Dialog backdrop 40, Dialog positioner 41, Option panel 42, Menu 1200, Search 1000–1002, FAB menu 1000–1001, and navigation rail 1000. The values do not describe open order, so they cannot answer which surface a later action put on top.

The failure is concrete: a Select panel opened inside a Dialog sits at 42 while every dialog positioner is 41. A second Dialog opened while the Select panel is open therefore lands below the first dialog's panel. A Menu at 1200 can float above every dialog regardless of which surface opened last. The values also drift as new components choose their own number.

## Decision

A shared module, [`overlay-layer.ts`](../../../../registry/components/_shared/overlay-layer.ts), assigns floating stacking order in open sequence.

### Contract

- Every integrated overlay acquires a layer when it opens and releases it when its surface is removed. The module returns a z-index and an idempotent release function; entries never reuse a lower value while another surface remains open.
- A dialog acquisition first closes open popups through their registered close callbacks. A dialog therefore always takes a layer above the popups of lower surfaces. Popups opened after the dialog take a higher layer than that dialog.
- Dialog backdrop and positioner consume `--_yam3x-dialog-layer-z` set on the Dialog wrapper. The positioner is one step above its backdrop.
- Option panels consume the allocated z-index as an inline style. Menus consume `--_yam3x-menu-layer-z` and retain their layer through the exit animation, releasing it when the panel is removed.
- A popup's close callback preserves its component's normal dismissal path so `beforetoggle` cancellation and focus restoration still apply. A canceled close leaves the popup below any newer dialog.
- New floating surfaces use the module instead of adding another fixed z-index. Remaining fixed values are tracked follow-ups.

### Current integration

- [Dialog](../../../../registry/components/dialog/dialog.vue)
- [Option panel](../../../../registry/components/option/option-panel.vue)
- [Menu](../../../../registry/components/menu/menu.vue)
- [Bottom sheet](../../../../registry/components/bottom-sheet/bottom-sheet.vue): modal variant as a dialog, standard variant as a popup
- [FAB menu](../../../../registry/components/fab-menu/fab-menu.vue)
- [Floating action button menu](../../../../registry/components/fab-menu/floating-action-button-menu.vue)
- [Autocomplete](../../../../registry/components/autocomplete/autocomplete.vue)
- [Search](../../../../registry/components/search/search.vue): open search takes a popup layer, so a newer dialog dismisses it, and its z-index fallbacks derive from that layer
- [Time picker](../../../../registry/components/time-picker/time-picker-dialog.vue): modal presentation as a dialog, docked presentation as a popup
- [Tooltip](../../../../registry/components/tooltip/tooltip.vue) and [Rich tooltip](../../../../registry/components/tooltip/rich-tooltip.vue)
- [Date picker](../../../../registry/components/date-picker/date-picker-core.vue): modal presentation as a dialog, docked presentation as a popup
- [Expandable list item](../../../../registry/components/list/expandable-list-item.vue): full-screen presentation as a dialog
- [Navigation rail](../../../../registry/components/navigation-rail/navigation-rail.vue): modal presentation as a dialog

Snackbar remains a notice host outside modal ordering: opening a dialog must not dismiss a queued notice, so it keeps its host z-index. App bar and navigation rail z-index values position layout surfaces, not floating overlays.

## Alternatives considered

- **Add larger constants per combination.** A Select panel could use 42, a menu inside it 43, a dialog inside that 44. The next nesting depth or a new component repeats the problem, and no rule identifies which surface should win.
- **Native top layer.** Rendering dialogs as `<dialog>` and popups as `popover` would order them by open sequence without z-index. The project's Dialog is Ark UI based and not a native dialog; mixing top-layer and ordinary fixed surfaces changes positioning, dismissal, and styling contracts across every consumer.
- **Close popups when a modal opens without a shared layer.** This removes the cross-dialog failure but leaves the relative order of a dialog, its popups, and nested popups undefined.

## Consequences

- Layer allocation depends on runtime open order, so server-side rendering cannot precompute z-index values. The fallback constants keep closed and non-integrated surfaces usable before a layer exists.
- A dialog closes lower popups on open. Applications that intentionally keep a popup open beneath a new modal now receive the popup's normal close event.
- Overlays remain inside their existing DOM stacking contexts. A consumer that creates a stacking context around a dialog can still place the teleported option panel in a different context; a shared portal root is a separate architectural change.
- The module owns only stacking order. It does not provide focus trapping, scrim dismissal, or modality; those remain with Ark UI and each component.
- Fixed z-index values in components outside the current integration remain working but do not participate in the sequence. Migrating them is a follow-up, not a compatibility layer.

## Verification

- `apps/docs/src/overlay-layer.test.ts` verifies that a popup receives a higher layer than its dialog, a newer dialog closes the open popup, and the newer dialog and its own popup order correctly.
- The dialog browser test asserts that the opened Select panel's computed z-index is greater than the dialog positioner's, then selects an option with a real pointer click.
- Dialog, FormField, Select, Option, Menu, select-field, bottom-sheet, fab-menu, autocomplete, search, date-picker, time-picker, tooltip, list, and navigation-rail browser suites pass. The full workspace checks (`format:check`, `lint`, `typecheck`, `test`, `registry:check`, `build`) pass.

## Conditions to reconsider

Revisit this decision if native top-layer ordering becomes compatible with the project's Ark UI positioning and dismissal model, or if consumers need a shared portal root across stacking contexts.
