<!--
Agent lifecycle guidance:
- Status: proposed.
- On implementation: move this file to docs/agents/notes/implemented/, change Status to implemented, rewrite ## Decision into present-tense ## Decision, replace acceptance criteria and risks with ## Consequences and ## Verification, and commit in the same change as the code.
- If rejected: move this file to docs/agents/notes/rejected/ with a one-line rejection reason on the Status line.
-->

# Require a visible dismissal path in modal surfaces

**Status:** implemented
**Date:** 2026-11-13
**Owner:** [Dialog design guide](../../../specs/components/dialog.md), [Bottom sheet design guide](../../../specs/components/bottom-sheet.md), [`dialog.vue`](../../../../registry/components/dialog/dialog.vue), [`bottom-sheet.vue`](../../../../registry/components/bottom-sheet/bottom-sheet.vue)

## Problem

Modal surfaces can be dismissed with Escape, a scrim click, or a drag, but those paths are not visible controls. Voice control and switch users cannot discover them, and a modal without a visible action has no named dismissal target.

- Dialog renders its close button only when `showCloseButton` is explicitly enabled. The `actions` slot is optional.
- The modal Bottom sheet renders a Close button only at the expanded detent. At a partial detent it has no visible close control unless the consumer adds one.
- Material's basic Dialog uses action buttons as the primary dismissal path. A close icon is an optional project extension, not a Material requirement.
- Material requires a clear dismissal path for a modal Bottom sheet.

## Decision

Every modal surface requires a visible, named dismissal control. Each component chooses the visual form that matches its Material anatomy.

### Dialog

- The close icon remains optional and `showCloseButton` defaults to `false`.
- The visible dismissal path is normally the `actions` slot. Consumers provide at least one action that dismisses the dialog.
- A dialog that opens with no close button and no actionable controls emits a development-only warning naming the missing visible dismissal path.
- Escape and scrim dismissal remain independent and cannot substitute for the visible control.

### Bottom sheet

- `showCloseButton` defaults to `true`.
- A modal sheet renders the close button at every detent, not only when it reaches full height.
- A standard sheet keeps its explicit close button.
- Consumers set `showCloseButton=false` only when they provide their own visible dismissal control; the guide states this requirement.
- The existing collapse action remains separate from Close.

### Other modal surfaces

Side sheet, Navigation drawer, Search, and Drawer container already expose a visible close control. The policy applies to new modal surfaces; it does not require changing their visuals.

## Alternatives considered

- **Default the Dialog close icon to `true`.** Makes every dialog carry an extra icon that Material does not require and changes existing visuals.
- **Add a close icon to every Bottom sheet only when a header slot exists.** Leaves modal sheets without headers or headers without a close control.
- **Rely on Escape, scrim click, and drag.** These are not discoverable by voice control or switch access and do not provide a named control.
- **Require consumers to opt in to a close control.** Repeats the current defect and makes the safe behavior the non-default.

## Consequences

- Partial modal Bottom sheets now include a visible Close button, changing their header composition. The button uses the existing 48 px target, localized `close` label, and close token mapping.
- A standard Bottom sheet keeps its existing visible Close button.
- Dialog keeps its Material action-button dismissal model. The close icon remains an optional project extension, and the component warns instead of adding an icon that Material does not require.
- The warning runs only in development, after the rendered surface has had two ticks to mount. It checks the rendered actions container for a focusable control rather than only the slots object, so conditionally rendered actions do not trigger a false warning.
- A close icon does not replace the primary confirmation action. Actions remain authoritative in a decision dialog.
- The policy applies to new modal surfaces; Side sheet, Navigation drawer, Search, and Drawer container already expose visible close controls.

## Verification

- `apps/docs/src/components/dialog.test.ts` verifies the warning fires without a visible control and stays silent when an action is present.
- `apps/docs/e2e/bottom-sheet.spec.ts` verifies the modal Close button is visible at the partial detent and remains available after expansion.
- `pnpm typecheck`, `pnpm test`, `pnpm docs:check`, `pnpm registry:check`, and the targeted Playwright suites passed.
