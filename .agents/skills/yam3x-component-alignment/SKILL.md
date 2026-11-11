---
name: yam3x-component-alignment
description: Use only in the YAM3X source repository when adding, changing, or auditing a registry component against Material 3 Expressive.
---

# YAM3X component alignment

This skill is for the YAM3X source repository. It covers component design guides, Vue API decisions, registry implementation, public documentation, and alignment audits.

## Guard

If `registry/`, `docs/specs/`, or `docs/contributing/component-implementation.md` is absent, stop. This is the wrong workspace; use the `yam3x` skill for application work.

## When not to use

- Building an application page or composing existing components: use `yam3x`.
- Writing maintained documentation without changing component design: use `canonical-docs` and the repository's site-authoring guide.
- Recording a lasting architecture choice: use `adr`.

## Source order

1. Official Material 3 Expressive page, figures, motion recordings, and token table for the component.
2. The project design guide under `docs/specs/components/`.
3. Jetpack Compose Expressive, then Android Views Expressive, for unresolved semantics, tokens, and behavior.
4. Material Web only for Web focus, hover, pointer, scrolling, form, overlay, and ARIA mechanics. It never defines Expressive appearance or motion.
5. Registry source for current API and behavior.
6. Tests and browser checks for evidence.

Material has no official Web Expressive implementation. A component with an Expressive design source remains Expressive even when no Compose implementation exists.

## Gates

### 1. Classify and gather

- Classify as Expressive, M3 baseline, or project extension.
- Record reference availability separately: Compose, Android Views, Material Web baseline.
- For an extension, identify the closest Compose primitive or composition, or record that none exists.
- Read the official overview, guidelines, specifications, accessibility page, figures, and motion recordings at the depicted size, theme, and state.
- Do not start from a platform implementation alone.

### 2. Write or revise the design guide

- Use `docs/specs/TEMPLATE.md`.
- State each adopted design item in project language.
- Link the exact official page beside each source-backed requirement.
- Cite the figure or recording that establishes geometry, state, shape, or motion.
- Preserve whether Material requires, recommends, or permits a behavior.
- Label project decisions and explain why they matter.
- Add a `<component>.<area>.<criterion>` ID only when a test verifies it; reference the same ID from the owning test.

### 3. Design the Vue API

Build a capability matrix before choosing props, events, slots, or models:

- What does the design require?
- What does Compose Expressive expose?
- What does Android Views add or clarify?
- Which Compose primitive is the closest analog?
- Which Web mechanics are required?
- Which platform-specific parts should not become Vue API?

Design a Vue-native surface. Do not copy composable functions, Android attributes, custom-element APIs, or platform state objects. Keep defaults, controlled and uncontrolled behavior, SSR behavior, and native DOM semantics explicit.

No public API exists only because a platform library has it. No design requirement is dropped because Material Web lacks it.

### 4. Implement

- Keep component tokens, styles, and helpers local to the component.
- Keep `registry/registry.json` generated; run `pnpm registry:generate` after import or foundation mapping changes.
- Expressive components must not copy Material Web visual defaults, states, or motion.
- Baseline components may use Material Web as the primary Web implementation reference while holding the baseline design.
- Project extensions label their decisions and do not add official catalog entries.
- Keep component selectors scoped; do not style host ancestors or list items.
- Use `--md-sys-*` for semantic system roles and `--_yam3x-*` for private aliases. Expose `--yam3x-*` only when documented and stable.

### 5. Document and distribute

- Update `apps/docs/` when the public API or usage changes.
- Keep English as the source page and update the Chinese page to the same structure and meaning.
- Follow `docs/contributing/site-authoring.md`.
- Document supported overrides and migration steps for breaking changes.
- Regenerate the registry after changing component imports.

### 6. Verify

- Run the narrowest test that exercises the change; add a regression test only when the path is not already covered.
- Use browser checks for appearance, motion, keyboard, focus, RTL, text scaling, and forced colors.
- Run `pnpm test:cli` when imports, dependencies, or distribution change.
- Run `pnpm docs:check` for public page structure or demo changes.
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before integration. Targeted checks are the default; run the full browser suite only for cross-cutting changes.

## Audit

An alignment audit compares design items, implementation, and evidence. It does not rewrite the design guide to match a defect.

1. Read the official overview, specifications, guidelines, accessibility page, figures, and motion recordings.
2. Record Compose and Android Views availability; Material Web may have a baseline implementation.
3. Resolve token values from the official token table. Token labels are not values.
4. Map each design item to its criterion, implementation, and evidence. For geometry, confirm with a runtime measurement.
5. Classify the result as `aligned`, `implementation gap`, `evidence gap`, or `project decision`.
6. Fix confirmed gaps at their owner and add or update the owning test. Do not add a criterion unless a test verifies it.

Audit findings remain work records until a durable decision belongs in an ADR or a gap is fixed in code and tests.

## Output

Report:

- The component class and reference availability.
- The design guide and API decisions changed.
- The implementation and documentation changed.
- The evidence run and any evidence limit.
- Any project decision or unresolved gap.

Do not claim visual or motion alignment from source inspection alone. If a figure or recording was unavailable, state that limitation.
