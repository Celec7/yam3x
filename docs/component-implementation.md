# Component design and implementation

This page owns the component delivery pipeline. It explains how design sources, project guides, Vue API decisions, implementation, public documentation, and evidence fit together. See [Design and implementation references](references.md) for source authority, [Project glossary](glossary.md) for shared terms, and [Project component design guides](specs/README.md) for the guide index.

## Component classes

Classify a component before changing it. The class comes from the applicable design source, not from the current implementation inventory.

| Class                 | Design source                                               | API and implementation reference                                                                    |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Expressive**        | Official M3 Expressive page, figures, and motion recordings | Compose Expressive first; Android Views Expressive second; Material Web only for Web mechanics      |
| **M3 baseline**       | Official M3 baseline page                                   | Material Web may lead the Web implementation and API reference; Compose and Views confirm semantics |
| **Project extension** | Related Material guidance plus project decisions            | Nearest Material semantics, shaped by Vue and Web conventions                                       |

Record reference availability separately: Compose, Android Views, and Material Web may each be present or absent. A Compose-only Expressive component does not wait for a Web implementation, and a Material Web implementation does not turn a baseline component into an Expressive one.

## Pipeline

### 1. Classify and gather sources

Identify the official component or foundation page, its Expressive or baseline status, and the available platform implementations. For a project extension, identify the related Material guidance and state that the component is an extension.

Output: component class, exact official source links, and reference availability.

Gate: no design work starts from a platform implementation alone.

### 2. Write the project design guide

Use the [spec template](specs/TEMPLATE.md). State each adopted design item in project-authored language, link the official page or figure beside it, and label every project decision. Preserve whether Material requires, recommends, or permits a behavior. Add a `<component>.<area>.<criterion>` ID only when an automated test verifies that item; reference the same ID in the test title or a nearby comment.

Output: the canonical design guide under `docs/specs/components/`.

Gate: every source-backed requirement has a source link; figures and motion recordings are reviewed, not inferred from prose.

### 3. Design the Vue API

Build a capability matrix before choosing props, events, slots, or models:

- What does the design require?
- What does Compose Expressive expose?
- What does Android Views Expressive add or clarify?
- What Web mechanics does Material Web or the browser require?
- Which parts are platform-specific and should not become Vue API?

Then design a Vue-native surface. Do not copy composable functions, Android attributes, custom-element APIs, or platform state objects. Keep defaults, controlled and uncontrolled behavior, SSR behavior, and native DOM semantics explicit.

Output: an API decision table linking each public capability to a design item, an implementation reference, or a project decision.

Gate: no public API exists only because a platform library has it; no design requirement is dropped because Material Web lacks it.

### 4. Implement

Implement in `registry/` with the component's local tokens, styles, and dependencies. Keep `registry/registry.json` generated. Expressive components must not copy Material Web's visual defaults, states, or motion. Baseline components may use Material Web as their primary Web implementation reference while holding to the official baseline design. Project extensions must label their decisions.

Output: source, tokens, styles, and registry metadata.

Gate: implementation behavior maps to a design item or an explicit project decision.

### 5. Document and distribute

Update `apps/docs/` when the public API or usage changes. Keep the English page as the source and update the Chinese page to the same structure and meaning. Document supported overrides and migration steps for breaking changes. Regenerate the registry after changing component imports.

Output: public API docs, examples, changelog, and registry entries.

Gate: copied source builds in an isolated consumer through the CLI checks.

### 6. Verify

Use focused unit and browser checks for the changed behavior, visual inspection for appearance and motion, and `test:cli` for copied-source independence. Record detailed results with the test or verification owner, not in the design guide.

Output: implementation evidence linked to design criterion IDs where applicable.

Gate: the changed path is exercised, not only type-checked; visual or motion claims are observed.

### 7. Audit separately

An alignment audit compares design items, current implementation, and evidence. It is separate from feature work and does not rewrite the design guide to match a defect.

Use this matrix per component:

| Design item | Source | Reference availability | Expected behavior | Implementation | Evidence | Verdict |
| ----------- | ------ | ---------------------- | ----------------- | -------------- | -------- | ------- |

Verdicts are `aligned`, `implementation gap`, `evidence gap`, or `project decision`. Audit findings remain work records until a durable decision belongs in an ADR or a gap is fixed in code and tests.

## Keeping guidance stable

A design guide describes the intended project design even when current code differs. When they disagree, retain the guide as the target and track the implementation gap with its code or verification work. Change the guide only when the applicable Material 3 Expressive source changes or the project deliberately changes its own design decision.

Link canonical sources instead of recording inspection dates, comparison-library commits, detailed histories, or volatile implementation status. Cite a specific external revision only when a project decision depends on that exact observation.
