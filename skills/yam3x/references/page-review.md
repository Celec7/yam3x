# Page review

Review the rendered page, not only the source. Record the breakpoint, theme, text scale, direction, and motion setting used for each check.

## Structure and adaptation

- Choose a structure from the content: feed for peer content, list-detail for collection-to-detail, supporting pane when secondary content only makes sense beside the primary area.
- At compact, medium, and expanded widths, ask what to reveal, divide, resize, reposition, or swap.
- Keep page gutters, pane gaps, and shell layout in application containers. Do not move them into component internals.
- Keep pane focus order aligned with the visual order. A modal pane moves focus in and restores it to the trigger on close.
- Do not hide the primary component at common desktop widths. Provide a responsive alternative instead.
- Preserve reading and focus order when the layout reflows or mirrors.

## Type

- Use display, headline, title, body, and label for purpose, not as a size ladder.
- Keep heading level independent from visual role. A visual-only heading is an intentional exception.
- Baseline styles are the default; emphasized styles are for selection, actions, headlines, and editorial moments.
- Use brand type for display and headline moments and plain type for body and labels.
- Let line height and padding define the box; do not reproduce native platform baseline offsets with fixed Web heights.
- At 200% text, content reflows and labels remain readable. Do not clip, overlap, or remove labels.
- Preserve language height support for Arabic, Chinese, Japanese, Korean, Hindi, Thai, and other taller scripts. Do not use fixed component heights that cannot grow.
- Use tabular figures for tables and changing numbers.
- Check contrast: large text at least 3:1, small text at least 4.5:1.
- Underline links that appear in body text.

## Color

- Use semantic role pairs and layers. Do not combine arbitrary container and foreground roles.
- Primary carries the strongest emphasis, secondary is quieter, tertiary is a small accent, and error is the standard error role.
- YAM3X does not provide standard success or warning color roles. Define them explicitly in the product and pair them with text or icon cues.
- Use surface container levels to create hierarchy without raising every region.
- Use `outline` for meaningful boundaries and `outline-variant` for decorative dividers. Do not use `outline-variant` as a target boundary.
- Fixed accent colors may not adapt between light and dark themes; do not use them where contrast is required.
- Check light and dark themes and all supported contrast levels.

## Shape

- Use the 10-step corner scale: none, extra small, small, medium, large, large increased, extra large, extra large increased, extra extra large, full.
- Inner corners of grouped items may be asymmetric.
- For nested rounded objects, use optical roundness: outer radius minus padding equals inner radius.
- Shape is expressive, not semantic. Do not use a shape alone to convey status.
- Use abstract shapes sparingly; do not compromise clarity.
- Avoid large or full corners on information-dense components.
- Shape morph should communicate interaction, progress, or a state change. It should not run as idle decoration.

## Motion

- Use the expressive or standard scheme consistently; expressive is the YAM3X default and standard is the quieter option.
- Use spatial springs for position, size, rotation, and shape; effects springs for color and opacity.
- Use fast tokens for small elements, default for partial-screen changes, and slow for full-screen changes.
- Do not invent durations or easing curves. Use the documented motion tokens or the Web curve mappings.
- Reduced motion preserves the state change and task information without the movement.
- Check that motion does not delay the task or obscure focus.

## Spacing and density

- Use the 8dp scale. `space100` is 8dp; nested values such as 4, 12, and 20dp are available.
- Prefer padding and gaps over child margins.
- Keep component internal spacing separate from page margins and pane gaps.
- At 200% text, preserve spacing relationships and let containers grow.
- Density is opt-in and must not reduce type or the 48px interactive target.
- Do not increase density in focused tasks, menus, dialogs, or snackbars.

## Interaction and state

- Use the shared state layer and focus ring. State layers are 40dp inside a 48px target.
- Hover, focus, pressed, and dragged state layers use 8%, 10%, 10%, and 16% opacity.
- Show hover-only treatment only with `@media (hover: hover) and (pointer: fine)`.
- Keep one hover, focus, and pressed state at a time in a layout.
- Disabled controls are not focusable, draggable, or pressable, and do not need contrast compliance.
- Keep a keyboard and click path for every gesture. Suppress the click after a drag when direct manipulation is used.
- Do not use pointer capability to enable a core interaction that should work with touch.

## Accessibility

- Honor individual preferences and changing needs; accessibility requirements are a starting point, not a ceiling.
- Keep a visible focus indicator; never remove it without an equivalent.
- Give every interactive control an accessible name. Icon-only controls need a name independent of a tooltip.
- Keep native semantics: links navigate, buttons act, form fields participate in forms.
- Keep 48px targets even when the visual control is smaller.
- Keep status cues available without color alone.
- Preserve focus order across panes; return focus after modal dismissal.
- Check forced-colors mode for focus, selection, and boundaries.
- Check RTL: mirror layout, navigation, icons, and gestures. Do not mirror charts, media controls, clocks, email addresses, or directional content that should stay LTR.

## Content states

- Distinguish initial loading, empty collection, no matches, error, and disabled states.
- Keep existing context during refresh; do not replace a usable table or list with a spinner.
- Use an empty state for actual absence, not for a failed request.
- Keep labels and messages concise; avoid placeholder-only labels.
- Use application language for application labels and built-in localization for component-generated text.

## Visual evidence

- Open the official Material page and inspect the figure or recording for the relevant component or foundation.
- Compare at the depicted size, theme, and state. Do not infer geometry or motion from prose.
- Capture screenshots at compact, medium, and expanded widths.
- Capture light and dark themes, LTR and RTL, and reduced motion where relevant.
- If a figure or recording is unavailable, state the limitation; do not claim visual correctness from source inspection alone.
