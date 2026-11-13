<!--
Lifecycle: implemented. The code, documentation, and verification landed together. Record follow-up defects as new records rather than reopening this one.
-->

# Use one tab stop for composite action controls

**Status:** implemented
**Date:** 2026-11-13
**Owner:** [Tabs design guide](../../../specs/components/tabs.md), [Toolbar design guide](../../../specs/components/toolbar.md), [`tabs.vue`](../../../../registry/components/tabs/tabs.vue), [`toolbar.vue`](../../../../registry/components/toolbar/toolbar.vue)

## Problem

Tabs and Toolbar expose composite semantics but do not follow the keyboard contract implied by those roles.

- Every enabled tab is a Tab stop. Arrow keys move focus, and Space or Enter activates the focused tab.
- Every toolbar action is a Tab stop, while the toolbar also handles arrow keys and `Home`/`End`.
- The toolbar guide cites the WAI-ARIA Toolbar Pattern, which requires one item in the Tab order, but the public guide states the opposite.

The Material design sources specify arrow-key movement and activation but do not require every item to be a separate Tab stop. The current behavior adds Tab stops without adding capability and makes the role of both containers ambiguous.

## Decision

The project uses one Tab stop for each composite action container.

### Tabs

- The selected enabled tab is the only tab with `tabindex="0"`; all other tabs use `tabindex="-1"`.
- Arrow keys move focus among enabled tabs without changing selection.
- Space or Enter activates the focused tab. Selection changes also move the Tab stop to the selected tab.
- `Home` and `End` move focus to the first and last enabled tab.
- `Shift+Tab` leaves the tablist. Re-entering the tablist lands on the selected tab.

This keeps Material's manual activation model and adopts the APG tablist focus contract at the same time.

### Toolbar

- The toolbar keeps `role="toolbar"` and `aria-orientation`.
- Button-like actions, links, and other single-action controls use one roving Tab stop. Arrow keys, `Home`, and `End` move focus across all action controls.
- Editable controls (`input`, `textarea`, `select`, editable regions) keep their native Tab stop and arrow-key editing behavior.
- Composite widgets such as tablists, listboxes, menus, trees, grids, and comboboxes keep their own tab stop. The toolbar does not move focus inside them.
- Focusin moves the roving Tab stop to the focused action, so pointer and programmatic focus stay consistent.
- Dynamic insertion, removal, disabling, or hiding of slotted controls resynchronizes the roving stop.

### Implementation

Roving focus is implemented directly. `focusgroup` remains a possible progressive enhancement when available, but it is not a dependency and does not replace the fallback.

## Alternatives considered

- **Keep every item as a Tab stop.** Avoids changing keyboard behavior and tests, but contradicts the APG contracts for both roles and adds navigation stops without user benefit.
- **Use `focusgroup` only.** The feature is not available in Firefox or Safari. Shipping it without a fallback would make the composite unusable for those users.
- **Remove `role="toolbar"` and treat the toolbar as a plain group.** Resolves the toolbar contract by giving up Material's required toolbar semantics. Rejected.
- **Move focus with arrow keys inside editable controls.** Conflicts with native text editing and is not a toolbar interaction.

## Consequences

- Tabs and Toolbar now follow the APG focus contract while preserving Material's activation and orientation semantics.
- Every enabled tab except the selected one has `tabindex="-1"`, so Tab enters and leaves the tablist once.
- Toolbar action controls share a roving Tab stop. The focused action owns `tabindex="0"`; pointer and programmatic focus move it.
- Slotted toolbar controls are mutated at runtime. Original `tabindex` values are restored on unmount, and a `MutationObserver` resynchronizes the roving stop when controls are added, removed, disabled, or hidden.
- Editable controls keep their native Tab stop and arrow-key editing behavior. A toolbar containing editable controls can therefore have more than one Tab stop; this is intentional and documented.
- `focusgroup` is not required, so Firefox and Safari retain the full composite behavior.
- Consumers that relied on every tab being a Tab stop observe a keyboard contract change. It is documented in the Tabs and Toolbar guides and belongs in the changelog as a behavior change.

## Verification

- `pnpm typecheck` passed.
- `pnpm test`: 58 files and 482 tests passed.
- Targeted Playwright: `tabs.spec.ts`, `toolbar.spec.ts`, `bottom-sheet.spec.ts`, and `carousel.spec.ts` passed, 36 tests total.
- `pnpm docs:check` passed with 62 component page pairs, 15 guide pages, 148 demos, and 2 skills.
- `pnpm registry:check` passed with 62 components, 5 packages, and 0 issues.
