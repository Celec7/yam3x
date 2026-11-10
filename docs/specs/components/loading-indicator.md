# Loading indicator: project design guide

## Scope

A loading indicator communicates an active process whose progress cannot be measured. Use a progress indicator when progress is measurable. See [Loading indicator overview](https://m3.material.io/components/loading-indicator/overview) and the [Progress indicators guide](progress-indicator.md).

## Design target

- Use the default configuration directly on a surface. Use the contained configuration when the indicator needs its own background to stay distinct. See [Loading indicator guidelines](https://m3.material.io/components/loading-indicator/guidelines).
- `loading-indicator.geometry.size`: Use the 48 dp overall footprint and 38 dp active shape in the [measurement figures](https://m3.material.io/components/loading-indicator/specs).
- When adapting to placement, keep the overall size between 24 and 240 dp and preserve the 38/48 container-to-shape ratio. Reserve very large indicators for large or extra-large windows. See [Loading indicator guidelines](https://m3.material.io/components/loading-indicator/guidelines).
- `loading-indicator.color.contrast`: Apply the configuration's color roles and preserve at least 3:1 contrast between the active shape and its immediate background. See [Loading indicator specifications](https://m3.material.io/components/loading-indicator/specs) and [accessibility](https://m3.material.io/components/loading-indicator/accessibility).
- Use a circular container. The uncontained active shape uses `primary`; the contained configuration uses `primary-container` and `on-primary-container`.
- The active shape loops through seven morphing shapes and rotates continuously. See [Loading indicator guidelines](https://m3.material.io/components/loading-indicator/guidelines).
- `loading-indicator.a11y.unknown-value`: Give the indicator an accessible name describing its process. Do not expose an unknown amount as a numeric value. See [Loading indicator accessibility](https://m3.material.io/components/loading-indicator/accessibility).

## Project decisions

- The consumer owns responsive scaling within Material's 24 to 240 dp guidance. The active shape stays at the 38/48 ratio unless an explicit active-size override replaces it.
- The seven shape paths, their polygon coordinates, and the 4666 ms cycle are project implementation choices; the official guidance defines the sequence.
- `loading-indicator.motion.reduced`: Honor reduced motion by freezing the active shape while keeping the indicator visible.

Current API details belong to the component source and the public [Loading indicator page](../../../apps/docs/components/loading-indicator.md).
