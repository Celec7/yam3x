# Dialogs: project design guide

## Scope

This guide covers the basic modal dialog for a focused prompt, decision, quick selection, or acknowledgement. Use it sparingly; a multi-step full-screen flow is outside this component's scope. See [Dialogs overview](https://m3.material.io/components/dialogs/overview).

## Design target

- Use a dialog when a person must stop and act before continuing. Use a less interruptive component for lower-priority information. See [Dialogs guidelines: usage](https://m3.material.io/components/dialogs/guidelines).
- Give the dialog one clear task and a concise, specific headline when needed. Keep the icon, divider, and supporting text optional and purposeful. Center-align the headline and supporting text when an icon is present; use start alignment without an icon. See [Dialog guidelines](https://m3.material.io/components/dialogs/guidelines) and [basic-dialog anatomy and measurements](https://m3.material.io/components/dialogs/specs).
- Use the basic-dialog measurements: 16 dp between the icon and title and between the title and supporting text, 24 dp before the actions, and 8 dp between actions. Center the icon as well as the headline and supporting text when present. See [basic-dialog anatomy and measurements](https://m3.material.io/components/dialogs/specs).
- Use text buttons for dialog actions. Provide no more than two: a single action acknowledges the message, while two actions provide confirmation and dismissal, with confirmation at the trailing edge. Keep the dialog motion to a fade transition. See [Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines).
- Use the width, padding, shape, and spacing in the basic dialog [measurement figure](https://m3.material.io/components/dialogs/specs). Use the light and dark color roles shown in the [color figures](https://m3.material.io/components/dialogs/specs).
- Map the container to Surface container high, the headline to On surface, supporting text to On surface variant, the optional icon to Secondary, the optional divider to Outline, and the scrim to Scrim. Use Headline small for the headline and Body medium for supporting text; action Buttons retain their own token mapping. See the [Basic dialog color and token figures](https://m3.material.io/components/dialogs/specs).
- Keep the dialog inside the viewport and keep its actions available when body content scrolls. Follow the responsive guidance in [Dialogs guidelines](https://m3.material.io/components/dialogs/guidelines).
- Project-defined: The optional visible close button is an extension; when enabled, keep its target at least 48 × 48 dp while retaining the 24 dp close icon.
- `dialog.a11y.focus`: Label the dialog from its title, move initial focus inside it, keep Tab and Shift+Tab within it, and return focus after dismissal. See [Dialogs accessibility](https://m3.material.io/components/dialogs/accessibility).
- Use the `alertdialog` Web role for the basic modal dialog, as specified by Material's current Web accessibility guidance. Keep focus inside the modal while it is open and return focus after dismissal.
- Allow Escape and outside-click dismissal independently; both are enabled by default. The optional visible close button is a project-defined affordance and does not control either dismissal path.
- Project sizing decision: The implementation caps the dialog at 560 px high and then at the viewport's available height. Material defines dynamic height but does not specify this desktop cap.

## Project decisions

- Project-defined: The Vue `Dialog` implements the basic variant only. A multi-step full-screen flow needs its own composition rather than adding that behavior to this component.
