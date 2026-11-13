# Dialogs: project design guide

## Scope

This guide covers the basic modal dialog for a focused prompt, decision, quick selection, or acknowledgement. Use it sparingly; a multi-step full-screen flow is outside its scope. See [Dialogs overview](https://m3.material.io/components/dialogs/overview).

## Design target

- Use a dialog only when a person must stop and act before continuing. Prefer a less interruptive component for lower-priority information. See [Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines).
- Give the dialog one clear task and a concise, specific headline. Keep the icon, divider, and supporting text optional and purposeful. Center the icon, headline, and supporting text when an icon is present; use start alignment without an icon. See [Dialog guidelines](https://m3.material.io/components/dialogs/guidelines) and [basic-dialog anatomy and measurements](https://m3.material.io/components/dialogs/specs).
- Use the basic-dialog measurements: 16 dp between the icon and title and between the title and supporting text, 24 dp before the actions, and 8 dp between actions. See [basic-dialog anatomy and measurements](https://m3.material.io/components/dialogs/specs).
- Use text buttons for actions, no more than two: a single action acknowledges, while two provide confirmation and dismissal with confirmation at the trailing edge. Keep the motion to a fade. See [Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines).
- Size the container to its content between the 280 dp minimum and 560 dp maximum rather than always filling the maximum. Use the basic dialog width, padding, shape, and spacing figures and the light and dark color roles. See the [measurement figure](https://m3.material.io/components/dialogs/specs).
- Map the container to Surface container high, the headline to On surface, supporting text to On surface variant, the optional icon to Secondary, the optional divider to Outline, and the scrim to Scrim. Use Headline small for the headline and Body medium for supporting text; action buttons keep their own token mapping. See the [Basic dialog color and token figures](https://m3.material.io/components/dialogs/specs).
- Keep the dialog inside the viewport and keep its actions available while body content scrolls. See [Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines).
- `dialog.a11y.focus`: Label the dialog from its title, move initial focus inside it, keep Tab and Shift+Tab within it, and return focus after dismissal. See [Dialogs accessibility](https://m3.material.io/components/dialogs/accessibility).
- Use the `alertdialog` Web role for the basic modal dialog, as specified by Material's Web accessibility guidance. Keep focus inside the modal while it is open and return focus after dismissal.
- Allow Escape and outside-click dismissal independently; both are enabled by default.

## Project decisions

The following are project decisions.

- Only the basic variant is implemented. A multi-step full-screen flow needs its own composition rather than added behavior in this component.
- The optional visible close button is an extension. Keep its target at least 48 × 48 dp while retaining the 24 dp close icon. Its 40 dp state layer and inset 3 dp `secondary` focus ring follow the icon-button treatment.
- The close button is an independent dismissal path; it does not control Escape or outside-click dismissal.
- Every basic dialog has a visible, named dismissal control. Normally this is an action button. The close icon and Escape and outside-click dismissal do not replace the action; when a dialog opens with no close icon and no actions, development builds warn and the public guide requires the consumer to add a visible action.
- The dialog is capped at 560 px high and then at the viewport's available height. Material defines dynamic height but not this desktop cap.
