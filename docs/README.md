# Documentation map

`docs/` contains maintained contributor guidance and project design guides. Public application documentation lives in [`apps/docs/`](../apps/docs/); English is the source page and Chinese mirrors it.

## Start here

| Task                                               | Page                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Understand source ownership and change propagation | [Architecture and ownership](architecture.md)                |
| Use the project's shared terms                     | [Project glossary](glossary.md)                              |
| Choose and cite design or implementation sources   | [Design and implementation references](design/references.md) |
| Find workspace commands                            | [Contributing](../CONTRIBUTING.md)                           |

## Design and implementation

| Task                                             | Page                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Follow the component delivery pipeline           | [Component design and implementation](contributing/component-implementation.md) |
| Read the intended project design for a component | [Project component design guides](specs/README.md)                              |
| Start a new component guide                      | [Spec template](specs/TEMPLATE.md)                                              |
| Review project mappings to official components   | [Material 3 component map](design/m3-coverage.md)                               |
| Read shared design guidance and contracts        | [Shared design foundations](specs/foundations.md)                               |
| Define or change CSS and theme-token ownership   | [CSS and token conventions](design/css-and-tokens.md)                           |

## Delivery and releases

| Task                                                | Page                                                    |
| --------------------------------------------------- | ------------------------------------------------------- |
| Run the checks for a component or foundation change | [Contributing](../CONTRIBUTING.md)                      |
| Write or update public docs pages                   | [Public docs authoring](contributing/site-authoring.md) |
| Prepare and publish a CLI release                   | [CLI release procedure](contributing/releasing.md)      |
| Look up CLI commands and options                    | [CLI reference](../packages/cli/README.md)              |

## Architecture decisions

Records live under [`agents/notes/`](agents/notes/), grouped by lifecycle status. Proposed records retain open questions, risks, and acceptance criteria. On implementation, move the record to `implemented`, rewrite the proposal as a present-tense decision, and add consequences and verification. Rejected records keep the problem and alternatives with a reason. Archived records are frozen history.

- [Remove Tailwind from development and distribution](agents/notes/implemented/2026-11-08-remove-tailwind.md)
- [Order floating overlays by open sequence](agents/notes/implemented/2026-11-08-overlay-layer-stack.md)

## Fact ownership

Installable components come from entrypoints under [`registry/components/`](../registry/components/). Foundation source mappings live in [`registry/foundations/registry.json`](../registry/foundations/registry.json), and dependency versions live in the pnpm workspace catalog. The CLI consumes the generated [`registry/registry.json`](../registry/registry.json); regenerate it with `pnpm registry:generate` instead of editing it directly. Current props and slots live in component source; public usage belongs in `apps/docs/`.

- Design intent and project decisions: `docs/specs/`.
- Current API and behavior: `registry/`.
- Public usage: `apps/docs/`.
- Verification evidence: tests, browser checks, and CLI checks.
- Architecture rationale: ADRs under `docs/agents/notes/`.
- Local temporary work: `docs/agents/local/work/` (git-ignored).
