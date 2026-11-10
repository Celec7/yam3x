# Documentation map

This directory contains maintained contributor guidance and project component design guides. The public docs site for application developers lives in [`apps/docs/`](../apps/docs/); its English and Chinese pages are paired, with English as the source page.

## Start here

| Task                                               | Page                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| Understand source ownership and change propagation | [Architecture and ownership](architecture.md)                |
| Use the project's shared terms                     | [Project glossary](glossary.md)                              |
| Choose and cite design or implementation sources   | [Design and implementation references](design/references.md) |
| Find workspace commands                            | [Contributing](../CONTRIBUTING.md)                           |

## Component work

| Task                                             | Page                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Follow the component delivery pipeline           | [Component design and implementation](contributing/component-implementation.md) |
| Read the intended project design for a component | [Project component design guides](specs/README.md)                              |
| Start a new component guide                      | [Spec template](specs/TEMPLATE.md)                                              |
| Review project mappings to official components   | [Material 3 component map](design/m3-coverage.md)                               |
| Read shared design guidance and contracts        | [Shared design foundations](specs/foundations.md)                               |
| Define or change CSS and theme-token ownership   | [CSS and token conventions](design/css-and-tokens.md)                           |

## Delivery, verification, and releases

| Task                                                | Page                                                    |
| --------------------------------------------------- | ------------------------------------------------------- |
| Run the checks for a component or foundation change | [Contributing](../CONTRIBUTING.md)                      |
| Write or update public docs pages                   | [Public docs authoring](contributing/site-authoring.md) |
| Prepare and publish a CLI release                   | [CLI release procedure](contributing/releasing.md)      |
| Look up CLI commands and options                    | [CLI reference](../packages/cli/README.md)              |

## Architecture decisions

Shared architecture decision records live under [`decisions/`](decisions/), grouped by lifecycle status. `proposed` includes accepted directions awaiting implementation; move a record to `implemented` with its code and verification evidence, repairing inbound links.

- [Remove Tailwind from development and distribution](decisions/implemented/2026-11-08-remove-tailwind.md)
- [Order floating overlays by open sequence](decisions/implemented/2026-11-08-overlay-layer-stack.md)

## Fact ownership

Installable components are discovered from the entrypoints under [`registry/components/`](../registry/components/). Foundation source mappings live in [`registry/foundations/registry.json`](../registry/foundations/registry.json), and dependency versions live in the pnpm workspace catalog. The CLI consumes the generated [`registry/registry.json`](../registry/registry.json); regenerate it with `pnpm registry:generate` instead of editing it directly. Current public props and slots live in component source; public usage belongs in `apps/docs/`.

Use one owner per fact:

- Design intent and project decisions: `docs/specs/`.
- Current API and behavior: `registry/`.
- Public usage: `apps/docs/`.
- Verification evidence: tests, browser checks, and CLI checks.
- Architecture rationale: ADRs under `docs/decisions/`.
