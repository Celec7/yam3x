# Expressive principles

Material 3 Expressive is an expansion of Material 3. It adds components, emphasized type, a physics-based motion system, a larger shape library, and expressive color tactics. It is not a new version of the system, and it is not permission to decorate every screen.

The official rationale is emotional connection plus usability: expressive designs can feel more engaging and can make key elements easier to spot. Material's published research reports stronger preference and faster recognition of key UI in expressive screens. Use that as a reason to strengthen hierarchy, not as a reason to add novelty without purpose.

## The seven tactics

### 1. Use a variety of shapes

Shape sets the tone before content is read. Combine classic and abstract shapes, and mix round and square corners to create tension or cohesion. Use shape deliberately to draw attention or group elements.

- Do: break from the surrounding shape language to emphasize one element.
- Avoid: making essential actions look less important with a very small shape.
- Avoid: assigning a literal status meaning to a shape. Shape is versatile, not semantic.

Related: [Shape principles](https://m3.material.io/styles/shape/overview-principles), [Corner radius scale](https://m3.material.io/styles/shape/corner-radius-scale), [YAM3X Shape](https://yam3x.iscccc.cc/components/shape).

### 2. Apply rich and nuanced color

Use primary, secondary, tertiary, and surface roles to build hierarchy. Primary carries the strongest emphasis, secondary supports less urgent elements, and tertiary adds a small contrasting accent. Surface container levels create separation without raising everything.

- Do: pair each container with its corresponding `on` role and layer colors as intended.
- Avoid: mappings that lose contrast when the user changes contrast or theme.
- Avoid: treating success and warning as standard Material roles; define them explicitly in the product and pair them with text or icon cues.

Related: [Color roles](https://m3.material.io/styles/color/roles), [YAM3X Color](https://yam3x.iscccc.cc/guide/foundations/color).

### 3. Guide attention with typography

The type scale has 15 baseline and 15 emphasized styles. Emphasized styles are for selected states, actions, headlines, unread content, and editorial moments. Material components do not use emphasized styles by default.

- Do: swap the baseline token for the emphasized token of the same style when emphasis is intentional.
- Do: use brand type for display and headline moments and plain type for body and labels.
- Avoid: setting every heading or button to an emphasized style.
- Avoid: fixed component heights that cannot accommodate taller language scripts or 200% text.

Related: [Type scale](https://m3.material.io/styles/typography/type-scale-tokens), [Applying type](https://m3.material.io/styles/typography/applying-type), [YAM3X Typography](https://yam3x.iscccc.cc/guide/foundations/typography).

### 4. Contain content for emphasis

Group related content and give the most important region more space or a stronger surface. Containment can be a card, a section, a pane, or a deliberate region of negative space.

- Do: use grouping and surface contrast to make the main takeaway scannable.
- Avoid: ungrouped information that blends together.
- Avoid: wrapping every block in a card; containment should clarify hierarchy, not add chrome.

Related: [Layout overview](https://m3.material.io/foundations/layout/layout-overview/overview), [YAM3X Layout](https://yam3x.iscccc.cc/guide/foundations/layout).

### 5. Add fluid and natural motion

The physics system uses springs. Expressive is the opinionated default for most product motion; standard is quieter and better for utilitarian surfaces. Spatial springs move position, size, rotation, and shape; effects springs animate color and opacity without overshoot.

- Do: use fast, default, or slow tokens by element size and distance.
- Do: let motion explain a state change, a transition, or a gesture.
- Avoid: decorative idle motion that delays the task.
- Avoid: removing the state meaning when reduced motion is enabled.

Related: [Motion how it works](https://m3.material.io/styles/motion/overview/how-it-works), [Motion specs](https://m3.material.io/styles/motion/overview/specs), [YAM3X Gestures](https://yam3x.iscccc.cc/guide/foundations/gestures).

### 6. Leverage component flexibility

Adapt the interface to the context instead of shrinking one composition. Components can resize, reveal or hide information, change presentation, or swap for a functionally equivalent control across breakpoints.

- Do: swap a navigation bar for a rail, or a bottom sheet for a menu, when the function is preserved.
- Avoid: swapping unrelated controls, such as a button for a menu or a chip.
- Avoid: using a larger breakpoint only to make the same layout wider.

Related: [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design), [Breakpoints](https://m3.material.io/foundations/layout/breakpoints/overview), [Scaffold panes](https://m3.material.io/foundations/layout/scaffold/panes).

### 7. Create few hero moments

A hero moment combines tactics to make one interaction or piece of information feel special. It should be brief, emotionally meaningful, and tied to a key interaction.

- Do: reserve one or two hero moments for the product.
- Do: ask whether the moment is emotionally impactful and whether it supports a key interaction.
- Avoid: turning every screen into a hero moment; too many become distracting.

Related: [Start building with M3 Expressive](https://m3.material.io/blog/building-with-m3-expressive).

## Current layout and spacing context

The current Material guidance adds a layout scaffold of bars, rails, and panes; five breakpoints; and an 8dp spacing system. Use your app's documented breakpoints in code; the official guidance explains the intent.

| Breakpoint  | Width       | Typical panes                           | Navigation                        |
| ----------- | ----------- | --------------------------------------- | --------------------------------- |
| Compact     | `<600`      | 1                                       | Navigation bar                    |
| Medium      | `600–839`   | 1, optionally 2 for low-density content | Collapsed navigation rail         |
| Expanded    | `840–1199`  | 2 recommended                           | Standard or modal navigation rail |
| Large       | `1200–1599` | 2 recommended                           | Standard or modal navigation rail |
| Extra-large | `1600+`     | 2 recommended, 3 with a side sheet      | Standard or modal navigation rail |

When adapting, ask what to reveal, divide, resize, reposition, or swap. Keep pane focus order aligned with the visual order. A modal pane moves focus in when it opens and returns focus to its trigger when it closes.

## Guardrails

- Do not treat Expressive as "more animation" or "more shapes."
- Do not use emphasized type as a default.
- Do not assign semantic meaning to shape alone.
- Do not apply fixed accent colors where contrast is required.
- Do not use density to shrink type or the 48px interactive target.
- Do not mirror charts, media controls, clocks, email addresses, or other content that must remain LTR.
- Do not copy defaults from another design system; use the YAM3X component page as the current implementation reference.
- If the official guidance and the component page differ, use the component page for the current API and note the discrepancy; do not invent a component to bridge it.

## Sources

- [Get started](https://m3.material.io/get-started)
- [Start building with M3 Expressive](https://m3.material.io/blog/building-with-m3-expressive)
- [What's new at Google I/O 2026](https://m3.material.io/blog/whats-new-at-io26)
- [Color roles](https://m3.material.io/styles/color/roles)
- [Type scale](https://m3.material.io/styles/typography/type-scale-tokens)
- [Applying type](https://m3.material.io/styles/typography/applying-type)
- [Shape principles](https://m3.material.io/styles/shape/overview-principles)
- [Motion how it works](https://m3.material.io/styles/motion/overview/how-it-works)
- [Spacing overview](https://m3.material.io/styles/spacing/overview)
- [Layout scaffold](https://m3.material.io/foundations/layout/scaffold/overview)
- [Breakpoints](https://m3.material.io/foundations/layout/breakpoints/overview)
- [State layers](https://m3.material.io/foundations/interaction-states/state-layers)
- [Accessibility principles](https://m3.material.io/foundations/overview/principles)
