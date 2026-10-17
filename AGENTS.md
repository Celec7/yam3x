# Repository guidance

## Documentation sources and ownership

- Treat the currently applicable **Material 3 Expressive** guidance on [m3.material.io](https://m3.material.io/) as the design target. When the site offers multiple versions or implementations, use the one explicitly marked Expressive. Review relevant diagrams and images as well as text.
- `docs/specs/` is the canonical statement of the design this project intends to implement. Its core requirements must come from applicable Material 3 Expressive sources; label any necessary project decisions separately. It guides design and implementation; it is not an API reference, exhaustive test matrix, implementation-status report, or copy of the upstream specification.
- Vue source under `registry/` defines the current public API and implemented behavior. `apps/docs/` explains current usage and API; keep its established English/Chinese page pairs aligned when a change requires public documentation.
- Tests and browser checks provide implementation evidence. Keep detailed results with their verification owner, not in design guides.
- Label details not defined by Material as project decisions. Keep them brief and explain the reason when they affect component design or behavior.

## Reference libraries

- Use [m3e](https://github.com/matraic/m3e) as an unpinned comparison library when it helps explore a Web implementation. It does not define the Material target, project API, component scope, or a coverage denominator. Do not require a local checkout to match a fixed commit.
- Compose, Material Web, and other platform libraries are secondary implementation references. They may help investigate a Web or platform mechanic, but cannot add or override design requirements from Material 3 Expressive.
- Follow [Design and implementation references](docs/references.md) for detailed source boundaries.

## Canonical documentation

- Keep each fact with its canonical owner, link to existing source material instead of duplicating inventories or API details, and avoid temporary status or history in evergreen guidance.
- For documentation work, follow the `canonical-docs` skill when available; these repository rules identify the local owners and source boundaries.
- Keep maintained repository documentation in English. The public docs site remains bilingual; English is the source page and Chinese pages should match its structure and meaning.
- Use official Material 3 Expressive names for mapped components. Clearly and consistently identify project-defined extensions without presenting them as official Material components.
- Read the relevant local guide before changing its area. Keep this file as a short routing layer; detailed policy belongs in the linked project documents.
