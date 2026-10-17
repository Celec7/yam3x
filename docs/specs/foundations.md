# Shared design foundations: project design guide

## Scope

This guide collects Material 3 principles that apply across component families. Use the applicable component guide for exact variants, color roles, geometry, interaction, and accessibility; shared principles do not override component-specific M3 guidance.

## Material 3 Expressive basis

- [Color](https://m3.material.io/styles/color/overview) and the [color system](https://m3.material.io/styles/color/the-color-system) define semantic roles and their relationships.
- [Typography](https://m3.material.io/styles/typography/overview), the [type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens), and [applying type](https://m3.material.io/styles/typography/applying-type) define roles for readable content hierarchy. The current Expressive scale has 15 baseline and 15 emphasized roles. [Roboto](https://m3.material.io/styles/typography/fonts) is the default typeface for Material 3 components.
- [Shape principles](https://m3.material.io/styles/shape/overview-principles) describes shape as part of a coherent visual system; the [corner radius scale](https://m3.material.io/styles/shape/corner-radius-scale) defines ten levels from none through full. [Motion](https://m3.material.io/styles/motion/overview/how-it-works) describes Expressive physics-based springs and the standard and expressive schemes.
- [Spacing](https://m3.material.io/styles/spacing/overview) provides a consistent spacing scale that adapts to component context.
- Component accessibility pages and specifications define each control's target sizes, contrast, focus, and input behavior. Use their diagrams and figures where they clarify a requirement.

## Project design guidance

- Use semantic theme roles for color, typography, shape, and motion. Follow each component's M3 source for which roles and configurations apply; do not impose one shape, size, or color mapping on every component.
- Keep hierarchy clear and consistent. Typography, color, and shape should help people understand content and interaction, not replace labels or semantics.
- Use baseline type roles by default. Apply emphasized roles selectively to show hierarchy or state, such as selected items or primary actions. Keep type size independent of density.
- Adapt line height to the language script height category: small, medium, large, or extra-large. Material recommends medium by default and vertical padding that can grow with taller scripts. The project maps common `lang` tags to those categories and supports a local subtree override with `data-md-language-height`.
- Use the spacing scale consistently while letting component-specific guidance define the actual gaps and container dimensions.
- Use motion to explain an interaction or transition. Follow the component's guidance and the shared motion system; avoid decorative movement that obscures or delays the task. Transitions use fast, default, and slow springs for spatial changes and visual effects.
- Treat accessibility requirements as component-specific where Material specifies them. Use the relevant M3 accessibility guidance rather than copying one target size, keyboard pattern, or contrast rule across unrelated controls.

## Project decisions

- Shared theme tokens let installed components use a common Material role system. The theme implementation and its current configuration API belong to source and public documentation; this guide sets the design intent only.
- Components honor the project-wide reduced-motion preference while preserving the state and task information conveyed by their motion.
- The project uses Roboto for both brand and plain type roles. CSS `lang` annotations select script-height categories for common language tags, defaulting to medium; the supported language-tag map is a project decision. `data-md-language-height` overrides the category for its subtree when automatic mapping is unsuitable.
- The theme API defaults to the Expressive motion scheme and retains Standard as an explicit option.
- Density is a project setting: compact density scales spacing and container dimensions, while type size and the 48px interactive target remain unchanged.
- Controls using the shared touch-target utility expand the invisible hit area from their rendered bounds to at least 48px and inherit the control's corner shape. Component-specific guidance still determines which controls use this utility and how their targets are spaced.
