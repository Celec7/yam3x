# Project glossary

These terms are canonical for component design, implementation, and audits. Use them consistently in guides, code comments, test titles, reviews, and decision records.

| Term                                      | Meaning                                                                                                                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Material 3 Expressive (M3 Expressive)** | The current official Material design guidance marked Expressive on [m3.material.io](https://m3.material.io/). It is the project's design target.                                        |
| **M3 baseline**                           | Material 3 guidance without an Expressive variant. Baseline components are supported, but are not presented as Expressive.                                                              |
| **Expressive component**                  | A component with an applicable Expressive design source. API semantics and behavior reference Compose Expressive first and Android Views Expressive second.                             |
| **Baseline component**                    | A component whose applicable official design source is M3 baseline. Material Web may be its primary Web implementation and API reference.                                               |
| **Project extension**                     | A component or composition without a standalone official Material component. It builds on related guidance and records its own decisions.                                               |
| **Reference availability**                | Whether an official Compose, Android Views, or Material Web implementation exists for a component. It is recorded separately from the component class.                                  |
| **Design item**                           | One actionable requirement from an official page, including an anatomy, measurement, color, state, shape, motion, or accessibility fact shown in prose, a figure, or a recording.       |
| **Design criterion**                      | A design item with a stable `<component>.<area>.<criterion>` ID. Add an ID only when an automated test verifies the item, and reference it from the owning test.                        |
| **Project decision**                      | A choice the official guidance leaves open or a deliberate project extension. Label it as project-defined and state why it matters.                                                     |
| **Implementation reference**              | An official platform implementation used to resolve semantics, capability, or API questions. It is not a design authority.                                                              |
| **Web mechanics reference**               | Guidance for focus, hover, pointer input, scrolling, form participation, overlays, and ARIA. Material Web and measured browser behavior fill this role.                                 |
| **Vue-native API**                        | The public Vue surface determined by Vue and Web conventions: props, events, slots, `v-model`, attrs forwarding, native elements, and SSR behavior. It is not a copy of a platform API. |
| **Implementation gap**                    | A design item that current implementation does not satisfy.                                                                                                                             |
| **Evidence gap**                          | Implemented behavior without a unit, browser, visual, or consumer-build check that demonstrates it.                                                                                     |
| **Alignment audit**                       | A comparison of design items, implementation, and evidence. It reports findings; it does not create a permanent conformance status.                                                     |

## Usage rules

- Classify the component before changing its design or API. A class is not a quality status.
- Cite the official page beside each source-backed requirement. Cite a figure or recording when it establishes geometry, state, shape, or motion.
- Keep design guides, current implementation facts, public API documentation, and verification evidence with their separate owners.
- Do not label an implementation-dependent choice as an official Material requirement.
