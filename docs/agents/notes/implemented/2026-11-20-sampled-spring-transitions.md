<!--
Lifecycle: implemented. The code, documentation, and verification landed together. Record follow-up defects as new records rather than reopening this one.
-->

# Sample springs into `linear()` for CSS transitions

**Status:** implemented
**Date:** 2026-11-20
**Owner:** [CSS tokens and motion](../../../design/css-and-tokens.md)

## Problem

Material specifies shape and selection motion as springs, but a CSS transition takes a timing function and duration. The foundation already exposed duration and cubic-bezier pairs for spatial and effects motion, yet neither can overshoot and neither reproduces a spring's response. The button and button-group shape morphs used a hand-tuned `178ms` plus a hand-written `linear()` curve; the components documented a spring, the code carried no derivation, and the curve was separate from the spring parameters in `foundation-tokens.mjs`.

The scroll field needs the same spring for its selection and snapping motion. Copying another hand-written curve would add a second unexplained approximation.

## Decision

`scripts/spring-motion.mjs` samples the analytic underdamped spring response. `scripts/generate-foundation-tokens.mjs` writes the sampled curve as a generated token block in `tokens.css`:

- `--md-sys-motion-spring-shape-morph` — duration and `linear()` curve for morphing properties.
- `--md-sys-motion-duration-shape-morph` and `--md-sys-motion-easing-shape-morph` — the parts for components and tests that need them.

The source spring is `foundationTokens.motion.standard['fast-spatial']` (damping 0.9, stiffness 1400), the parameters the Material token table specifies for button press shape morphs. The duration ends when the spring stays within 0.2% of the target; the curve uses 49 samples and lands exactly on 1. The generated comment records the source parameters, settle tolerance, sample count, and measured maximum interpolation error. `pnpm motion:generate` (or `pnpm tokens:generate`) rewrites the block; it is never hand-edited.

Components consume the composite token: button and button-group for shape and width morphs, and the scroll field for selection scaling and spring-driven snapping. Runtime scroll animation evaluates the same spring analytically because scroll offsets cannot be animated by a CSS timing function.

## Alternatives considered

- Keep the hand-tuned `178ms` curve: the current curve was already a sample of the same spring, but its derivation, duration rule, and error were unrecorded, so it could not be reviewed or regenerated.
- Reuse the existing `--md-sys-motion-spring-fast-spatial` pair: that block is generated from the expressive scheme (damping 0.6, stiffness 800) and maps the spring to a 350ms cubic bezier. It describes a different spring and cannot express the shape morph's overshoot.
- Use the browser's smooth scroll for scrolling and snapping: it uses a fixed easing and duration unrelated to Material's spring, and it produced a visible mismatch with the selection morph.

## Consequences

- The generated motion block grows `tokens.css` by one long `linear()` value twice plus its duration. Prettier ignores those three declarations so regeneration stays formatting-stable.
- Changing the spring parameters requires regeneration; hand edits to the block are overwritten.
- The shape morph shortens from 178ms to 155ms and follows the measured spring response. The recorded maximum interpolation error is about 0.2%.
- The scroll field's runtime spring duplicates the analytic formula in `scroll-field.utils.ts`; it must stay in step with the generated parameters.

## Verification

- `apps/docs/e2e/button.spec.ts` and `expressive.spec.ts` assert the computed shape transitions use the generated duration and a `linear()` curve, including reduced motion.
- `apps/docs/e2e/scroll-field.spec.ts` covers selection, looping, text input, mouse dragging, and reduced motion.
- `pnpm tokens:generate` reproduces the block; `pnpm format:check` accepts the generated file.
- The generated comment records the current maximum error; the generator reports it when regenerated.

## Conditions to reconsider

- Material changes the press or selection spring parameters, or publishes a Web-native spring transition mechanism.
- The saved `linear()` payload becomes a measurable download or parse cost.
- A browser supports spring easing natively, removing the need for sampled curves.
