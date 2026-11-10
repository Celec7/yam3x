# Component name: project design guide

This page states the design the project intends to implement. It is not an API reference, exhaustive state matrix, test plan, or progress report.

## Scope

Explain the component's purpose and the adopted scope in a few sentences. For a Material component, use its official Expressive name and identify the adopted variant or family members. For a project-defined extension, label it as an extension.

State the design lineage: **Expressive**, **M3 baseline**, or **project extension**. Lineage comes from the applicable official design source, not the implementation. API and implementation references belong to the delivery record.

For a project extension, name the closest official Material primitive or composition, including its Compose Material 3 analog or an explicit statement that none exists. The analog establishes reference lineage; it is not an official component.

## Design target

Describe the adopted design in direct, actionable language. Group only applicable topics, such as usage and selection, appearance and states, or interaction and accessibility. Paraphrase the official guidance and preserve whether Material requires, recommends, or permits a behavior. Link the exact official page beside each source-backed requirement. Cite the figure or recording that establishes geometry, state, shape, or motion.

Prefix a criterion with a stable ID only when an automated test verifies it. Use the lowercase `<component>.<area>.<criterion>` format, such as `button.a11y.target` or `switch.geometry.track`. Keep the ID semantic and reference it from the owning test. The ID identifies a criterion; it does not report test status.

## Project decisions

Include this section only when the official guidance leaves a consequential detail open or the project deliberately extends the design. State each choice and its reason. Record consequential divergences from the closest official primitive. Do not repeat current props, slots, events, defaults, or private CSS aliases; those belong to source and public API documentation.

## Content boundaries

- Maintain repository guides in English. Public English and Chinese page pairs belong in `apps/docs/`.
- Keep current props, slots, events, defaults, and examples in Vue source and the public component page.
- Keep test cases, assertions, pass or fail results, implementation gaps, and coverage status with their verification owner.
- Avoid copied inventories, commit pins, inspection dates, work logs, and volatile status. Link to canonical sources instead.
- Remove an optional section that has no useful content. Do not preserve headings only for uniformity.
