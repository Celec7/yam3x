# Documentation map

This directory contains maintained contributor guidance and project component design guides. The public docs site for application developers lives in [`apps/docs/`](../apps/docs/); its English and Chinese pages are paired, with English as the source page.

## Contributor guidance

| Task                                                | Page                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| Understand source ownership and change propagation  | [Architecture and ownership](architecture.md)                       |
| Define or change CSS and theme-token ownership      | [CSS and token conventions](css-and-tokens.md)                      |
| Choose and cite design or implementation sources    | [Design and implementation references](references.md)               |
| Read shared Material design guidance                | [Shared design foundations](specs/foundations.md)                   |
| Write or update public docs pages                   | [Public docs authoring](site-authoring.md)                          |
| Design, implement, document, and verify a component | [Component design and implementation](component-implementation.md)  |
| Read the intended project design for a component    | [Project component design guides](specs/README.md)                  |
| Review project mappings to official components      | [Material 3 component map](m3-coverage.md)                          |
| Find workspace contribution commands                | [Contributing](../CONTRIBUTING.md)                                  |
| Update workspace dependencies                       | [Dependency maintenance](../CONTRIBUTING.md#dependency-maintenance) |
| Look up CLI commands and options                    | [CLI reference](../packages/cli/README.md)                          |
| Prepare and publish a CLI release                   | [CLI release procedure](releasing.md)                               |

Installable components are discovered from the entrypoints under [`registry/components/`](../registry/components/). Foundation source mappings live in [`registry/foundations/registry.json`](../registry/foundations/registry.json), and dependency versions live in the pnpm workspace catalog. The CLI consumes the generated [`registry/registry.json`](../registry/registry.json); regenerate it with `pnpm registry:generate` instead of editing it directly. Current public props and slots live in component source; public usage belongs in `apps/docs/`.
