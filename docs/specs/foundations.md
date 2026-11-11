# Shared design foundations: project design guide

## Scope

This guide collects Material 3 principles that apply across component families. Use the applicable component guide for exact variants, color roles, geometry, interaction, and accessibility; shared principles do not override component-specific M3 guidance.

## Material 3 Expressive basis

- [Color](https://m3.material.io/styles/color/overview) and the [color system](https://m3.material.io/styles/color/the-color-system) define semantic roles and their relationships.
- [Typography](https://m3.material.io/styles/typography/overview), the [type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens), and [applying type](https://m3.material.io/styles/typography/applying-type) define roles for readable content hierarchy. The current Expressive scale has 15 baseline and 15 emphasized roles. [Roboto](https://m3.material.io/styles/typography/fonts) is the default typeface for Material 3 components.
- [Shape principles](https://m3.material.io/styles/shape/overview-principles) describes shape as part of a coherent visual system; the [corner radius scale](https://m3.material.io/styles/shape/corner-radius-scale) defines ten levels from none through full. [Motion](https://m3.material.io/styles/motion/overview/how-it-works) describes Expressive physics-based springs and the standard and expressive schemes.
- [Spacing](https://m3.material.io/styles/spacing/overview) and [spacing tokens](https://m3.material.io/styles/spacing/tokens) define an 8 dp base unit with recommended multiples and nested units. [Applying spacing](https://m3.material.io/styles/spacing/applying-spacing) explains component mappings, text scaling, and density.
- [Layout overview](https://m3.material.io/foundations/layout/layout-overview/overview), [adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design), and [canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview) describe hierarchy, panes, and adaptation to available space, preferences, and input methods.
- Component accessibility pages and specifications define each control's target sizes, contrast, focus, and input behavior. Use their diagrams and figures where they clarify a requirement.

## Project design guidance

### Typography and reading order

- Match type roles to purpose: Display for short important content, Headline for short high-emphasis content, Title for medium-emphasis section or secondary-region headings, Body for longer reading, and Label for concise utilitarian text. Each role has large, medium, and small sizes; component-specific typography takes precedence. See [Applying type: roles](https://m3.material.io/styles/typography/applying-type).
- Use baseline type roles by default. Material's 15 baseline and 15 emphasized styles are a toolkit; a product does not need every style. Use the emphasized counterpart of the same role and size for selection, actions, headlines, or editorial emphasis. Material components do not use emphasized roles by default. See [Type scale and tokens: emphasized styles](https://m3.material.io/styles/typography/type-scale-tokens).
- For Web typesetting, line-height defines the text bounding box and font metrics place the glyphs inside it. Use container padding and let content determine height instead of reproducing Android baseline offsets with fixed Web heights. When defining custom line heights, Material recommends about 1.2 times the type size for Display, Headline, and Title, and around 1.5 times for Body and Label. See the bounding-box, padding, and readability guidance in [Applying type](https://m3.material.io/styles/typography/applying-type).
- Adapt line height to the language script height category: small, medium, large, or extra-large. Material recommends medium by default and warns that fixed-height components may not accommodate taller scripts. Preserve room for the resulting text and padding. See [Type scale and tokens: language height support](https://m3.material.io/styles/typography/type-scale-tokens).
- Use tabular figures for tables and frequently changing numbers so comparable values remain aligned. Do not substitute a decorative face for readable body text. See [Applying type: ensuring readability](https://m3.material.io/styles/typography/applying-type).

### Layout and spacing

- Within a component, use padding and gaps to organize children; Material recommends these before child margins. See the component diagrams in [Spacing overview](https://m3.material.io/styles/spacing/overview).
- Treat spacing values as reusable measures, not a universal gap for every layout. Map a custom component's anatomy to the recommended scale where suitable; keep its internal spacing distinct from application page gutters and pane gaps. `space100` represents 8 dp, with nested values such as 4, 12, and 20 dp also available. Apply density and adaptation to the component mapping rather than changing the meaning of a shared spacing unit. See [Spacing tokens](https://m3.material.io/styles/spacing/tokens) and [Applying spacing](https://m3.material.io/styles/spacing/applying-spacing).
- Preserve the default padding and gaps when text scales to 200%; allow containers to grow or content to reflow. Increasing text size does not require multiplying every gap. See the scaled-button figure in [Applying spacing: text scaling](https://m3.material.io/styles/spacing/applying-spacing).
- Adapt structure and components to content, available space, user preferences, changing windows, and input methods. Use Feed for peer content, List-detail for parent-child content, and Supporting pane when secondary content only makes sense with the primary area. Material's Supporting pane example moves secondary content below the primary area at compact and medium sizes and beside it at expanded size. Consider resizing, selectively revealing information, reflowing, or changing presentation rather than only shrinking one composition. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design) and the [canonical layout examples](https://m3.material.io/foundations/layout/canonical-examples/overview).
- Use leading and trailing relationships that follow writing direction. Preserve a meaningful reading and focus order when the visual arrangement changes. See [Layout overview](https://m3.material.io/foundations/layout/layout-overview/overview) and [Bidirectionality and RTL](https://m3.material.io/foundations/layout/bidirectionality-rtl).

### Responsive breakpoints

Material defines five window breakpoints. Web maps dp to CSS pixels at default scale; that mapping is a project decision.

| Breakpoint  | Window width |
| ----------- | ------------ |
| Compact     | `<600`       |
| Medium      | `600–839`    |
| Expanded    | `840–1199`   |
| Large       | `1200–1599`  |
| Extra-large | `1600+`      |

- Use `min-width` for a breakpoint's lower edge and `max-width: 599.98px` for the compact upper edge. Do not use `599px` or other near-miss values; fractional viewport widths must not fall between categories.
- Component-specific responsive guidance takes precedence over these window breakpoints. Record the component source when it differs, such as the bottom sheet's 640px width rule or the FAB menu's 1200px margin rule.
- Container queries are content-driven component behavior, not window breakpoint aliases. Keep their thresholds local to the component and document them when they are project decisions.
- The same numeric values apply to CSS media queries and `matchMedia` in component source. Demos must not teach preview widths as window breakpoints.

### Input and gestures

- Treat pointer capability as a CSS concern and the current input modality as a behavioral concern. Do not use JavaScript to drive layout on every pointer event.
- Use the primary pointer for sizing decisions so a hybrid device does not resize its UI when a second pointer type is present. Use `any-pointer` only when a feature should be available whenever a precise pointer exists, such as a hint that a pointer can interact.
- Gate hover-only appearance with `(hover: hover) and (pointer: fine)`. Do not apply hover treatments on devices that cannot hover.
- The copied foundation stylesheet exposes read-only `--yam3x-pointer-*`, `--yam3x-any-pointer-*`, `--yam3x-hover`, and `--yam3x-any-hover` flags set to `0` or `1`. Prefer a direct media query for a simple rule; use the flags when composing a spacing calculation.
- Keep visual size and interaction target separate. A precise pointer may use tighter spacing without shrinking the minimum target.
- Treat pointer gestures as an enhancement, never the only way to complete an action. Every drag, swipe, or gesture-driven change keeps a keyboard or ordinary click/tap path. Follow the component guide for the exact alternatives.
- On Web, preserve native touch and trackpad scrolling. Add primary-button mouse dragging only where direct manipulation is meaningful, such as the horizontal carousel; suppress the trailing click after a drag and keep click activation for movement below the drag threshold.
- Pointer handling must not require touch: interactive controls accept primary mouse input, and focus, hover, and keyboard states remain available. Do not assume a coarse pointer to enable a core interaction.
- Android predictive-back and edge-swipe behaviors are platform gestures. A Web implementation provides close buttons, scrim dismissal, Escape, and focus restoration instead of emulating the Android system gesture unless the product explicitly owns that gesture.

### Appearance and interaction

- Use semantic theme roles for color, typography, shape, and motion. Follow each component's M3 source for which roles and configurations apply; do not impose one shape, size, or color mapping on every component.
- Keep hierarchy clear and consistent. Typography, color, and shape should help people understand content and interaction, not replace labels or semantics.
- Pair foreground and container color roles according to [theme and color](foundations/theme.md). The [Material color-role diagram](https://m3.material.io/styles/color/roles) defines error roles but no standard success or warning roles; a project's semantic-color extension needs its own explicit mapping.
- Use abstract shapes selectively and preserve clarity. A shape does not have an inherent status meaning. See [Shape principles: shape is versatile, not semantic](https://m3.material.io/styles/shape/overview-principles).
- Use motion to explain an interaction or transition. Follow the component's guidance and the shared motion system; avoid decorative movement that obscures or delays the task. Transitions use fast, default, and slow springs for spatial changes and visual effects.
- Treat accessibility requirements as component-specific where Material specifies them. Use the relevant M3 accessibility guidance rather than copying one target size, keyboard pattern, or contrast rule across unrelated controls.

### Shared component contracts

These cross-component defaults apply when a new composition has no more specific requirement. Component guides own exact values, variants, and exceptions.

- **Field composition.** Build editable inputs on the shared Form field anatomy rather than a private surface. Use a 3 px inset primary focus indicator without shifting content, keep the label and supporting text on their adopted roles, and replace supporting text with an error message plus visual error cue. Disabled content and boundaries use the shared on-surface opacity roles. See [Text fields](components/form-field.md), [Date input](components/date-input.md), and [Autocomplete](components/autocomplete.md).
- **Menus and option rows.** Use one menu/option geometry for dropdowns and suggestions: a 44 px visual row inside a 48 px target, a 3 px inset secondary focus ring, label-large typography, level-2 elevation, and pointer-capability-aware insets. Do not invent a lighter row treatment for one consumer. See [Options](components/option.md), [Menus](components/menu.md), and [Select](components/select.md).
- **Focus.** The shared default is a 3 px secondary ring outside the control. Use an inset indicator when an outer ring would be clipped, and permit the documented 2 px on-surface ring where a control draws its own smaller inset indicator. Never change layout or content geometry to show focus, and preserve a visible forced-colors treatment. See [Calendar](components/calendar.md) for the documented indicator exception.
- **Density and targets.** Container density may reduce a control's rendered height; spacing density may reduce component padding and gaps. Do not reduce typography, the 48 px interactive target, or a component's stated minimum target. Keep explicit spacing floors where a component requires them, and keep optical corrections fixed rather than scaling them with density.
- **Headings.** Keep visual type roles independent from document level. Built-in page-level summaries and modal titles use level 2 by default; embedded empty states, inline messages, and description-list titles use level 3. Callers override the level for their surrounding outline. A Heading without a level is the intentional visual-only mode.
- **Style boundaries.** Scope component-owned styles to the component. Do not target host list, form, or layout elements from a component stylesheet, and reset component-owned margins rather than relying on host resets. Derive a fixed component dimension from its shared target and padding tokens when it encodes that composition. Record observable 1–2 px optical adjustments, and keep undocumented implementation properties private.

## Project decisions

- Shared theme tokens let installed components use a common Material role system. The theme implementation and its current configuration API belong to source and public documentation; this guide sets the design intent only.
- Components honor the project-wide reduced-motion preference while preserving the state and task information conveyed by their motion.
- The project uses Roboto for both brand and plain type roles. CSS `lang` annotations select script-height categories for common language tags, defaulting to medium; the supported language-tag map is a project decision. `data-md-language-height` overrides the category for its subtree when automatic mapping is unsuitable.
- The theme API defaults to the Expressive motion scheme and retains Standard as an explicit option.
- Density is a project setting: compact density scales spacing and container dimensions, while type size and the 48px interactive target remain unchanged.
- Controls using the shared touch-target utility expand the invisible hit area from their rendered bounds to at least 48px and inherit the control's corner shape. Component-specific guidance still determines which controls use this utility and how their targets are spaced.
- Project-defined extensions inherit these foundations. Their guides own the chosen type roles, spacing, color mappings, and adaptation rules; resemblance to a Material component does not make those choices official component requirements.
- Project-defined Web geometry expresses adopted dp measurements in CSS pixels at default scale, while type follows the shared relative-size and language-height tokens. A stated minimum height is not a fixed content height. Interactive target areas must remain distinct rather than overlap adjacent actions.
