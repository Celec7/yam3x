---
name: yam3x
description: Use when building, reviewing, or customizing a Vue interface with YAM3X components, or when applying Material 3 Expressive layout, typography, color, spacing, shape, motion, accessibility, and adaptive behavior to a YAM3X app.
---

# YAM3X

YAM3X is copied Vue source implementing Material 3 Expressive. Treat it as a design system, not a component skin. The application owns page structure, content, responsive behavior, and product styling; components own their internal anatomy, states, tokens, and interaction.

Material 3 Expressive is an expansion of Material 3, not a separate version or a license to decorate everything. Use its tactics to strengthen hierarchy, emotion, and usability, then verify the result in a browser.

## When not to use

- Generic visual direction for a product that does not use YAM3X: use `frontend-design`.
- General Web accessibility or interface review: use `web-design-guidelines`; keep M3-specific decisions here.

## Resolve the workspace

| Workspace    | Component source        | Usage docs                              | Verification          |
| ------------ | ----------------------- | --------------------------------------- | --------------------- |
| Consumer app | `src/components/yam3x/` | [Public docs](https://yam3x.iscccc.cc/) | App build and browser |

- Read the nearest `AGENTS.md`. CLI initialization copies a design route to `src/components/yam3x/AGENTS.md` when that file is absent.
- The installed component source is authoritative for current props, models, events, slots, and behavior. Public docs explain intended usage.
- Use the official Material 3 Expressive pages for design intent and the YAM3X component page for the current API.
- Consumer imports use `./components/yam3x/<slug>`. The `@registry` imports in site demos are site-only and must not be copied into an application.
- If `src/components/yam3x/` is absent, do not assume YAM3X is installed. Check the setup before writing imports.

## Non-negotiables

1. Design with the documented YAM3X components and the Material 3 Expressive guidance they implement. Do not copy another design system's defaults.
2. Start from the documented component and variant. If the product needs a local variant, make it a deliberate extension and keep its states, semantics, and accessibility intact.
3. Prefer public props, models, events, slots, and documented CSS hooks. Editing copied source is allowed; keep the change scoped and tracked.
4. Use semantic tokens for color, type, shape, spacing, and motion. Do not hard-code palette, type, or spring values.
5. The application owns page gutters, pane structure, and layout. Components own their internal padding and states.
6. Visual and motion claims require observation. Inspect the official figure or recording and verify the rendered result.
7. Document local extensions and divergences so a future update can preserve them.
8. Preserve accessibility and adaptation: 48px targets, visible focus, non-color status cues, keyboard paths, text scaling, RTL, forced colors, and reduced motion.

## Design philosophy

M3 Expressive uses seven tactics. They are choices, not a checklist to apply everywhere. See [Expressive principles](references/expressive-principles.md) for the full decision guide.

1. **Vary shape.** Mix classic and abstract shapes to create hierarchy or tension; keep shape away from literal status meaning.
2. **Use rich, nuanced color.** Build hierarchy with primary, secondary, tertiary, and surface roles; keep role pairings accessible.
3. **Guide attention with type.** Use emphasized styles for selected, editorial, or high-emphasis moments, not for all text.
4. **Contain content for emphasis.** Group related content and give the most important region space and surface emphasis.
5. **Add fluid, natural motion.** Use the motion tokens to explain interaction and transition, not to decorate idle screens.
6. **Leverage component flexibility.** Adapt components and layouts across breakpoints instead of shrinking one composition.
7. **Create few hero moments.** Reserve one or two emotionally important interactions per product; too many become noise.

Expressive design should improve clarity and usability. Do not trade hierarchy, readability, or accessibility for visual novelty.

## Workflow

1. **Frame the surface.** Is this application layout, component configuration, a local adaptation, or a missing composition?
2. **Choose structure.** Select the pane relationship and navigation pattern before choosing components.
3. **Choose components.** Start from the user's intent, then check documented variants and composition rules.
4. **Build with the public surface.** Use props, slots, models, and documented tokens. Do not reach into private aliases.
5. **Apply foundations.** Check type, color, spacing, shape, motion, interaction, and accessibility together.
6. **Verify.** Build the app and exercise the changed surface in a browser at the relevant breakpoints and states.

## Choose structure

Official Material breakpoints are compact (`<600`), medium (`600–839`), expanded (`840–1199`), large (`1200–1599`), and extra-large (`1600+`). Use your app's documented breakpoints in code; the official guidance explains the intent.

- Compact: one pane; navigation bar; bottom sheet for supplemental actions; simple or full-screen dialog.
- Medium: one pane, optionally two for low-density content; collapsed navigation rail; menu for supplemental actions; basic dialog.
- Expanded and large: two panes recommended; standard or modal navigation rail; menu; basic dialog.
- Extra-large: two panes recommended, three when a side sheet is a useful third pane.
- Use a feed for peer content, list-detail for collection-to-detail, and a supporting pane when secondary content only makes sense beside the primary area.
- When the window changes, ask what to reveal, divide, resize, reposition, or swap. Do not only scale the same composition.
- Panes can be co-planar, floating, or docked. Keep focus order aligned with the visual order; a modal pane moves focus in and restores it on close.
- Mirror layout, navigation, icons, and gestures in RTL. Do not mirror charts, media controls, clocks, email addresses, or directional content that should stay LTR.

## Choose components

Start from intent, not from a component name. The full discriminator table is in [Component selection](references/component-selection.md).

- One primary constructive action per screen. A FAB is for that action, not for every action.
- Use a button for an action, a link for navigation, and a chip for a contextual choice or filter.
- Use a navigation bar for compact peer destinations, a rail for wider layouts, and tabs for related views within one destination.
- Use a menu for temporary actions or choices, a select for a labeled form choice, and an autocomplete when filtered suggestions help.
- Use one of radio group, select, or a connected button group for a small visible choice; use checkbox for multi-select and switch for an immediate independent setting.
- Use a dialog only when a person must stop and respond. Prefer snackbar or inline message for non-blocking feedback.
- Use a progress indicator when progress is measurable and a loading indicator when it is not.
- Do not use a legacy segmented button or navigation drawer as the default for a new design. Prefer connected button groups and a navigation bar or rail.

## Apply foundations

- **Type.** Use the five roles for purpose, not as a size ladder. Keep heading level independent from visual style. Baseline styles are the default; emphasized styles are for selection, actions, headlines, and editorial moments. Let text reflow at 200%, preserve language height, and use tabular figures for changing numbers. Links are underlined.
- **Color.** Use Material role pairs and layers. Primary carries the strongest emphasis, secondary is quieter, tertiary is a small accent, and error is the standard error role. YAM3X does not provide standard success or warning roles; define them explicitly in the product and pair them with text or icon cues. Do not use `outline` for dividers or `outline-variant` as a target boundary.
- **Shape.** Use the 10-step corner scale. Inner corners of grouped items may be asymmetric. For nested rounded objects, use optical roundness: outer radius minus padding equals inner radius. Shape is expressive, not semantic; use abstract shapes sparingly and avoid large or full corners on dense content.
- **Motion.** Use the expressive or standard scheme consistently, with spatial springs for movement and effects springs for color and opacity. Use fast, default, or slow by element size and distance. Do not invent durations. Preserve state meaning with reduced motion.
- **Spacing.** Use the 8dp scale with tokens. Prefer padding and gaps over child margins. Keep component spacing separate from page gutters. Density is opt-in and must not reduce type or the 48px target.
- **Interaction.** Use the shared state layers and focus treatment. State layers are 40dp inside a 48px target, with hover, focus, pressed, and dragged at 8%, 10%, 10%, and 16%. Do not show hover-only affordances on devices that cannot hover.
- **Accessibility.** Keep a visible focus indicator, a keyboard path, accessible names, native semantics, and non-color cues. Preserve focus order across panes and return focus after dismissal. Keep 48px targets even when the visual control is smaller.

## Customize

Use this order:

1. Public props, models, events, and slots.
2. Documented `--yam3x-{component}-*` CSS hooks.
3. Application-level `--md-sys-*` semantic tokens.
4. Private `--_yam3x-*` aliases: do not depend on them.

Choose the smallest change that meets the need. Public props, slots, and documented hooks are usually enough, but copied source is yours to adapt when the product needs a deliberate extension.

If the copied source must change, treat it as a local extension: keep the change scoped, preserve the component's states and accessibility, document why it differs, and re-check it when merging upstream changes. Follow [Update copied source](https://yam3x.iscccc.cc/guide/maintain/updating) when adopting a newer version.

## Verify

- Build or type-check the application.
- Exercise compact, medium, and expanded layouts; include the app's navigation breakpoint where relevant.
- Test keyboard order, activation, dismissal, and focus return.
- Test 200% text, RTL, dark mode, reduced motion, and forced colors.
- Check for horizontal overflow, clipped labels, sub-48px targets, and insufficient contrast.
- For appearance or motion claims, compare screenshots or recordings with the official figure at the depicted size, theme, and state.

## Common mistakes

| Mistake                                                     | Correct                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| Copying another design system's defaults                    | Use the YAM3X component page and the official figure    |
| Using a clickable `div` as a button                         | Use `Button`, a native link, or the appropriate control |
| Hard-coding colors, type sizes, durations, or corner values | Use the documented semantic tokens                      |
| Putting page gutters inside a component                     | Keep page layout in application containers              |
| Giving an icon button no accessible name                    | Provide a visible or accessible label                   |
| Putting critical information only in a tooltip              | Keep it in the primary content flow                     |
| Using a dialog for non-blocking information                 | Use a snackbar or inline message                        |
| Using a switch for mutually exclusive choices               | Use a radio group or select                             |
| Using a legacy segmented button or drawer for new design    | Use a connected button group or navigation bar/rail     |
| Hiding labels at narrow widths                              | Reflow, change presentation, or use a wider layout      |
| Removing the focus outline                                  | Keep the shared focus ring                              |
| Importing `@registry` in application code                   | Import from `./components/yam3x/`                       |
| Editing copied source without tracking the divergence       | Treat it as a local extension and re-check on update    |
| Adding motion and shapes to every screen                    | Reserve one or two hero moments and keep flows quiet    |

## References

- [Expressive principles](references/expressive-principles.md)
- [Component selection](references/component-selection.md)
- [Page review](references/page-review.md)
- [Customization](references/customization.md)
- [App setup](references/app-setup.md)
- [Reference links](references/links.md)
