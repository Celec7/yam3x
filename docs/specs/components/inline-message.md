# Inline message: project extension guide

## Scope

This project extension presents persistent information, caution, or errors beside the content they concern. It remains in the normal reading flow and may include a title, action, or dismiss control. It is distinct from a temporary Snackbar and from a Dialog that requires interruption. Material 3 Expressive does not define a standalone Inline message component. Apply the [shared foundations](../foundations.md).

## Design target

- Use readable title and body roles and deliberate content hierarchy. See [Applying type: roles](https://m3.material.io/styles/typography/applying-type).
- Pair container and foreground roles correctly. Material defines error roles but does not define standard success or warning color roles. See the role diagram and Error section in [Color roles](https://m3.material.io/styles/color/roles).
- Keep necessary information in the content flow rather than only in a tooltip. Use a Dialog when a person must respond before continuing; use a Snackbar for the adopted temporary-feedback purpose. See [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines), [Dialogs](dialog.md), and [Snackbar](snackbar.md).

## Project decisions

### Anatomy and layout

The following mappings are project-defined. Use Title Small for an optional title and Body Medium for the message. The message is required; an icon, actions, and dismissal are optional.

- Project-defined: Use 16 px container padding, 12 px between the leading icon and text, and 8 px between related text or actions. Use a Medium corner role for the grouping surface. Content and controls determine its height; messages can wrap to multiple lines.
- Project-defined: Place actions below the text when the inline arrangement does not fit. Keep the dismiss action independently reachable and its target distinct from other actions. The message container itself is not a whole-surface action.
- Project-defined: Use Surface Container with On Surface content for ordinary information, success, and caution; communicate their meaning through text and an optional appropriate icon. Actual errors use Error Container and On Error Container. Do not assign success or warning meaning to a dynamic accent hue. Additional semantic palettes require a separate project color decision.
- Project-defined: The message inherits its containing region's width and does not introduce page-level margins. Important instructions and actions remain available when text enlarges or the region narrows.

### Persistence and announcement

- Project-defined: Messages remain until their condition resolves or the person dismisses a dismissible message; there is no automatic timeout. A dismissal does not claim that the underlying condition was corrected.
- `inline-message.announcement.independent` (project-defined): Visual tone and announcement urgency are independent. Static information needs no live role. A newly appearing urgent error may use alert semantics; a non-urgent update may use polite status semantics. Follow the [WAI alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) for urgent announcements without moving focus.
- `inline-message.dismiss.focus` (project-defined): A dismiss action has an accessible name. If dismissal removes the focused control, move focus to a logical nearby control or content region. An unrelated message appearing elsewhere must not steal focus.
- Project-defined: Keep detailed field corrections with the affected field; an Inline message may summarize a wider failure or explain recovery without replacing those local errors. Appearance and removal may use an effects transition while preserving reading order and honoring the shared reduced-motion decision.
