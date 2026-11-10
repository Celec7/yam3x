# Design and implementation references

## Design target

The project targets the currently applicable **Material 3 Expressive** guidance on [m3.material.io](https://m3.material.io/). For each component, use the guidance explicitly marked Expressive. Inspect its overview, guidelines, specifications, accessibility page, diagrams, and motion recordings at the depicted size, theme, and state. Geometry, state, shape, and motion come from rendered figures and recordings, not from surrounding prose alone.

Project guides under [`specs/`](../specs/README.md) distill the applicable Material guidance and label project decisions. Link the exact official pages that support a requirement instead of copying whole pages or recording inspection logs.

## Component classes

Classify a component before changing it. The class comes from the applicable design source, not from the current implementation.

| Class                 | Design source                                                       | API and behavior reference                                                                                  | Web mechanics                                                                        |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Expressive**        | Official Material 3 Expressive page, figures, and motion recordings | Jetpack Compose Expressive first; Android Views Expressive when Compose is missing or unclear               | Material Web only for Web interaction and accessibility mechanics                    |
| **M3 baseline**       | Official Material 3 baseline page                                   | Material Web may lead the Web implementation and API reference; Compose and Android Views confirm semantics | Material Web is authoritative for current Web mechanics, not for design requirements |
| **Project extension** | Related official Material guidance plus explicit project decisions  | The closest Compose Material 3 primitive or composition first; translated through Vue and Web conventions   | Material Web only for Web interaction and accessibility mechanics                    |

Record **reference availability** separately: whether official Compose and Android Views implementations exist, and whether Material Web provides a baseline implementation. A component with an Expressive design source but no Compose implementation remains Expressive. A component with only a Compose Expressive implementation does not require a Material Web counterpart.

For a project extension, identify the closest Compose Material 3 primitive or composition, even when its name differs. Use its anatomy, geometry, state, token roles, and behavior as the primary implementation reference. If no analog exists, record that absence explicitly and fall back to the nearest official Material guidance plus project decisions. Official Material pages and token tables remain normative; Compose does not override them, and its API shape does not determine the Vue surface.

Material provides **no official Web Expressive implementation for any component**. The Resources panel's `Web: Expressive` entry is unavailable for every component. Material Web implements M3 baseline; its defaults cannot define Expressive appearance, motion, or variants. Every Expressive Web component is a project-owned implementation built from Compose or Views semantics and Web mechanics.

## Source boundaries

| Source                                         | Use                                                                                                                                                   | Authority                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Material 3 Expressive pages and their diagrams | Define intended component design, supported variants, appearance, interaction, and accessibility where specified                                      | Normative design target for Expressive components                                                      |
| Material 3 baseline pages and their diagrams   | Define the design of components without an Expressive version                                                                                         | Normative design target for baseline components                                                        |
| Project design guides                          | Distill the applicable Material target and record necessary project decisions                                                                         | Guidance for this project's design and implementation                                                  |
| Vue source in `registry/`                      | Define the current public API and actual implemented behavior                                                                                         | Authoritative for current code facts; not a replacement for the design target                          |
| Tests and browser checks                       | Show which implementation behavior has evidence                                                                                                       | Verification evidence only                                                                             |
| Jetpack Compose Expressive                     | Resolve variants, state models, interaction semantics, tokens, and motion parameters                                                                  | Primary implementation reference                                                                       |
| Android Views Expressive / MDC-Android         | Resolve geometry, token mappings, and behavior that Compose leaves unclear                                                                            | Secondary implementation reference                                                                     |
| Material Web                                   | Resolve Web focus, hover, pointer, scrolling, form, overlay, and ARIA mechanics; provide a primary baseline implementation reference where applicable | Web mechanics and baseline implementation reference; it cannot add or override Expressive requirements |

When Material leaves a necessary detail unspecified, record the choice as a project decision. Do not present a platform implementation's choice as an official Material requirement. Keep exact Vue API details in source and public API documentation, and detailed verification results with the tests or verification records.

## Platform reference order

1. **Jetpack Compose Material 3** is the primary reference for variants, state models, interaction semantics, tokens, and motion parameters. Use Compose Expressive APIs for Expressive components and baseline APIs for baseline components. Vue props, slots, and events follow Vue and Web conventions.
2. **Android Views Expressive / MDC-Android** is the secondary reference for geometry, token mappings, and behavior that Compose leaves unclear. The Material page and its token tables decide a conflict.
3. **Material Web** is the reference for Web mechanics. It implements M3 baseline, so use it more heavily for baseline components and only for mechanics in Expressive components. Its visuals, defaults, and motion do not define Expressive appearance.
4. **Vue and Web conventions** determine the public API shape: props, events, slots, `v-model`, attrs forwarding, native elements, SSR behavior, and the DOM accessibility contract.

Keyboard, focus, and ARIA behavior follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) and measured browser behavior. Compose semantics describe Android accessibility, not the Web DOM contract.

An implementation-dependent decision records its exact library version in the decision record that owns it. Component design guides cite the Material page.

## Implementation inputs

- [Material Color Utilities](https://github.com/material-foundation/material-color-utilities) generates light and dark 2025 tonal schemes for [`generate.ts`](../../registry/foundations/theme/generate.ts).
- AndroidX [ExpressiveMotionTokens](https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt) informs the spring parameters in [`foundation-tokens.mjs`](../../registry/foundations/tokens/foundation-tokens.mjs); the M3 Web motion specification supplies the CSS duration and easing mappings. [`generate-foundation-tokens.mjs`](../../scripts/generate-foundation-tokens.mjs) generates their CSS representation.
- [Ark UI](https://ark-ui.com/) provides Switch and Dialog behavior. [Architecture and ownership](../architecture.md) describes the dependency boundary.
- The source-copying workflow resembles [shadcn-vue](https://github.com/unovue/shadcn-vue), but yam3x does not depend on it.
