# Repository guidance

## Documentation sources and ownership

- Treat the currently applicable **Material 3 Expressive** guidance on [m3.material.io](https://m3.material.io/) as the design target. When the site offers multiple versions or implementations, use the one explicitly marked Expressive. Review rendered diagrams, figures, and motion recordings; visual details are normative, not decorative.
- `docs/specs/` is the canonical statement of the design this project intends to implement. Its core requirements must come from applicable Material 3 Expressive sources; label any necessary project decisions separately. It guides design and implementation; it is not an API reference, exhaustive test matrix, implementation-status report, or copy of the upstream specification.
- Vue source under `registry/` defines the current public API and implemented behavior. `apps/docs/` explains current usage and API; keep its established English/Chinese page pairs aligned when a change requires public documentation.
- Tests and browser checks provide implementation evidence. Keep detailed results with their verification owner, not in design guides.
- Label details not defined by Material as project decisions. Keep them brief and explain the reason when they affect component design or behavior.

## Reference order and component classes

- Classify each component before changing it: **Expressive**, **M3 baseline**, or **project extension**. Class comes from whether an applicable Expressive design source exists, not from what Material Web or Compose currently implements.
- Use Jetpack Compose Expressive first for API semantics and behavior, Android Views Expressive second, and Material Web for Web mechanics. Vue and Web conventions determine the actual public API shape.
- For a project extension, first identify the closest Compose Material 3 primitive or composition; use its anatomy, tokens, state, and behavior as the primary implementation reference. If none exists, record that and fall back to the nearest official Material guidance plus explicit project decisions.
- Material Web implements M3 baseline, not Expressive. Use it as a primary Web implementation reference for baseline components and only for Web mechanics in Expressive components; never let its defaults define Expressive appearance, motion, or variants.
- Follow [Design and implementation references](docs/design/references.md) for source boundaries, [project terminology](docs/glossary.md) for shared terms, and [component design and implementation](docs/contributing/component-implementation.md) for the delivery pipeline.

## Canonical documentation

- Keep each fact with its canonical owner, link to existing source material instead of duplicating inventories or API details, and avoid temporary status or history in evergreen guidance.
- Durable architecture decisions live in `docs/agents/notes/{proposed,implemented,rejected,archived}/` and follow the `adr` skill. Create a lifecycle directory only when its first record exists.
- Local temporary work records live in `docs/agents/local/work/` and are git-ignored. Inspect them explicitly when resuming local work; do not link them from maintained documentation.
- For documentation work, follow the `canonical-docs` skill when available; these repository rules identify the local owners and source boundaries.
- Keep maintained repository documentation in English. The public docs site remains bilingual; English is the source page and Chinese pages should match its structure and meaning.
- Use official Material 3 Expressive names for mapped components. Clearly and consistently identify project-defined extensions without presenting them as official Material components.
- Read the relevant local guide before changing its area. Keep this file as a short routing layer; detailed policy belongs in the linked project documents.
