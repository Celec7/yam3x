# Component name: project design guide

Use this page as the canonical statement of the design this project intends to implement. Derive its design target from applicable Material 3 Expressive guidance and diagrams. Keep it concise and useful to designers and implementers; it is not an API reference, exhaustive state matrix, test plan, or progress report.

## Scope

In a few sentences, explain the component's design purpose and the scope adopted by this project. For a Material component, use its official Expressive name and identify the adopted variant or family members. For a project-defined extension, label it as an extension.

## Design target

Describe the adopted design in direct, actionable language, grouped under only the applicable topics, such as usage and selection, appearance and states, or interaction and accessibility. Paraphrase the official guidance rather than copying passages. Preserve whether Material requires, recommends, or permits a behavior. Place the exact official page link beside each source-backed requirement, and identify a figure or section when it communicates important geometry or behavior.

Prefix a criterion with a stable ID only when an automated test verifies it. Use the lowercase format `<component>.<area>.<criterion>`, such as `button.a11y.target` or `switch.geometry.track`. Keep the ID semantic rather than encoding a value or status. Reference the same ID in the owning test's title or a nearby comment. An ID identifies a design criterion; it does not report whether its test passes.

## Project decisions

Include this section only when the official Expressive guidance leaves a consequential detail open or the project deliberately extends the design. Label each choice as project-defined and briefly give its reason. Secondary libraries may inform investigation, but they are not the source of an official Material requirement.

## Content boundaries

- Maintain repository design guides in English. Public English/Chinese page pairs belong in `apps/docs/`.
- Keep current props, slots, events, defaults, and examples in the Vue source and the public component page in `apps/docs/`.
- Keep test cases, assertions, pass/fail results, implementation gaps, and coverage status with their verification owner. Do not add a test list or verification section to this guide.
- Avoid copied inventories, commit pins, inspection dates, work logs, and details likely to drift. Link to canonical sources and owners instead.
- Remove any optional section that has no useful content. Do not preserve template headings just to make pages look uniform.
