# Design and implementation references

## Design target

The project's design target is the currently applicable **Material 3 Expressive** guidance on [m3.material.io](https://m3.material.io/). The site may expose more than one version or implementation for a component. Select the guidance explicitly marked Expressive and inspect its relevant overview, guidelines, specifications, accessibility guidance, diagrams, and images. Do not use an older or non-Expressive variant when it conflicts with the Expressive target.

Project component design guides in [`specs/`](specs/README.md) summarize the Material facts needed to guide this project and identify deliberate project decisions. Link the exact official pages that support those facts rather than copying whole sections or preserving inspection logs.

## Source boundaries

| Source                                                    | Use                                                                                                              | Authority                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Material 3 Expressive pages and their diagrams            | Define intended component design, supported variants, appearance, interaction, and accessibility where specified | Normative design target                                                       |
| yam3x project design guides                               | Distill the applicable Material target and record necessary project decisions                                    | Guidance for this project's design and implementation                         |
| Vue source in `registry/`                                 | Define the current public API and actual implemented behavior                                                    | Authoritative for current code facts; not a replacement for the design target |
| Tests and browser checks                                  | Show which implementation behavior has evidence                                                                  | Verification evidence only                                                    |
| Compose, Material Web, and other platform implementations | Cross-check implementation mechanics when useful                                                                 | Secondary; cannot add or override Expressive requirements                     |

When Material leaves a necessary detail unspecified, record the choice as a project decision. Do not present requirements inferred from comparison libraries or platform implementations as official Material requirements. Keep exact Vue API details in source and public API documentation, and keep detailed verification results with the tests or verification records.

## Implementation references

- [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) is a runtime dependency used by [`generate.ts`](../registry/foundations/theme/generate.ts) to generate light and dark 2025 tonal schemes.
- AndroidX [ExpressiveMotionTokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt) informs the spring parameters stored in [`foundation-tokens.mjs`](../registry/foundations/tokens/foundation-tokens.mjs); the M3 Web motion specification supplies the CSS duration/easing mappings. [`generate-foundation-tokens.mjs`](../scripts/generate-foundation-tokens.mjs) generates their CSS representation. These are implementation inputs, not authorities for component-specific requirements that Material defines.
- [Ark UI](https://ark-ui.com/) and Tailwind are implementation dependencies described in [Architecture and ownership](architecture.md). The source-copying workflow is similar to [shadcn-vue](https://github.com/unovue/shadcn-vue), but yam3x does not depend on it.

## Material Web

Material Web is an implementation project, not the Material 3 Expressive design target. Consult it only to understand a Web mechanic that remains applicable and agrees with the current Expressive guidance. Do not use its visuals, defaults, or motion to fill gaps in the Expressive design target; label any necessary project choice explicitly.

## m3e

[matraic/m3e](https://github.com/matraic/m3e) is an independent Material 3 Expressive Web Components library. Its source and behavior can be compared when useful, but the project does not track a fixed m3e commit or use its module inventory as a completion target. Cite a specific revision only when a project decision depends on a particular observed behavior; ordinary design guides should link to Material sources first.
