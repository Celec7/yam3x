# Component design and implementation

This page owns the component delivery pipeline: design sources, project guides, Vue API decisions, implementation, public documentation, and evidence. Classify components using [design and implementation references](../design/references.md) and the [project glossary](../glossary.md). The guide index is [project component design guides](../specs/README.md).

Agent-assisted work in this repository routes through the `yam3x-component-alignment` skill under `.agents/skills/`; this page remains the canonical source of the pipeline steps.

## Pipeline

### 1. Classify and gather sources

Identify the official component or foundation page, its Expressive or M3 baseline status, and available platform implementations. For a project extension, identify related Material guidance, then search Compose Material 3 for the closest primitive or composition. Record the analog or its absence.

Output: component class, official source links, reference availability, and the Compose analog for an extension.

Gate: no design work starts from a platform implementation alone.

### 2. Write the project design guide

Use the [spec template](../specs/TEMPLATE.md). State each adopted design item in project language, link the official page or figure, and label project decisions. Preserve whether Material requires, recommends, or permits a behavior. Add a `<component>.<area>.<criterion>` ID only when an automated test verifies it, and reference the same ID in the test.

Output: the canonical design guide under `docs/specs/components/`.

Gate: every source-backed requirement has a source link; figures and recordings are reviewed, not inferred from prose.

### 3. Design the Vue API

Build a capability matrix before choosing props, events, slots, or models:

- What does the design require?
- What does Compose Expressive expose?
- What does Android Views Expressive add or clarify?
- Which Compose primitive or composition is the closest analog, and which visual and state decisions does it own?
- Which Web mechanics does Material Web or the browser require?
- Which parts are platform-specific and should not become Vue API?

Then design a Vue-native surface. Do not copy composable functions, Android attributes, custom-element APIs, or platform state objects. Keep defaults, controlled and uncontrolled behavior, SSR behavior, and native DOM semantics explicit.

Output: an API decision table linking each public capability to a design item, an implementation reference, or a project decision.

Gate: no public API exists only because a platform library has it; no design requirement is dropped because Material Web lacks it.

### 4. Implement

Implement in `registry/` with the component's local tokens, styles, and dependencies. Keep `registry/registry.json` generated. Expressive components must not copy Material Web's visual defaults, states, or motion. Baseline components may use Material Web as the primary Web implementation reference while holding to the baseline design. Project extensions label their decisions.

Output: source, tokens, styles, and registry metadata.

Gate: implementation behavior maps to a design item or an explicit project decision.

### 5. Document and distribute

Update `apps/docs/` when the public API or usage changes. Keep English as the source page and update Chinese to the same structure and meaning. Document supported overrides and migration steps for breaking changes. Regenerate the registry after changing component imports.

Output: public API docs, examples, changelog, and registry entries.

Gate: copied source builds in an isolated consumer when imports, dependencies, or distribution change.

### 6. Verify

Use focused unit and browser checks for changed behavior, visual inspection for appearance and motion, and `test:cli` when copied-source imports, dependencies, or distribution change. Record detailed results with the test or verification owner, not in the design guide.

Run targeted checks by default. Run a full browser suite only for cross-cutting changes, shared foundations, or a risk that targeted checks cannot exercise.

Output: evidence linked to design criterion IDs where applicable.

Gate: the changed path is exercised, not only type-checked; visual or motion claims are observed.

### 7. Audit separately

An alignment audit compares design items, current implementation, and evidence. It does not rewrite the design guide to match a defect.

1. Read the applicable overview, specifications, guidelines, accessibility page, figures, and motion recordings at the depicted size, theme, and state.
2. Record Compose and Android Views availability from the Resources panel. Material Web may have a baseline implementation. No component has an official Web Expressive implementation.
3. Resolve token values from the official token table, including shape, color, size, and state aliases. Token labels alone are not values. The official token and design page decide a conflict with Compose or Views.
4. Map each design item to its criterion, implementation, and evidence. Confirm an implementation gap with the token value, code, and a runtime measurement where geometry is involved.
5. Classify the result, fix confirmed gaps at their owner, and add or update the owning test. Record a criterion in the design guide only when a test verifies it.

| Design item | Source | Reference availability | Expected behavior | Implementation | Evidence | Verdict |
| ----------- | ------ | ---------------------- | ----------------- | -------------- | -------- | ------- |

Verdicts are `aligned`, `implementation gap`, `evidence gap`, or `project decision`. Audit findings remain work records until a durable decision belongs in an ADR or a gap is fixed in code and tests.

## Keeping guidance stable

A design guide describes the intended design even when current code differs. When they disagree, retain the guide as the target and track the implementation gap with its code or verification work. Change the guide only when the applicable Material 3 Expressive source changes or the project deliberately changes its own design decision.

Link canonical sources instead of recording inspection dates, comparison-library commits, detailed histories, or volatile implementation status. Cite an external revision only when a project decision depends on that exact observation.
