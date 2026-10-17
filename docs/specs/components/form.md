# Form: project extension guide

## Scope

This project extension organizes related fields, submission feedback, and recovery. It coordinates native controls and project inputs without defining a schema-driven form generator or owning an application's data model. Material defines the component treatments used within a form, not this standalone Form coordinator. Apply the [shared foundations](../foundations.md).

## Design target

- Give text fields a visible label, using either the internal label or the adjacent-label treatment. For adjacent labels, use leading-edge alignment. See [Text fields guidelines: label text and adjacent labels](https://m3.material.io/components/text-fields/guidelines).
- Keep required-field meaning clear. For text fields, explain any required asterisk and replace supporting text with actionable error text when invalid. Allow long errors to wrap. See the required-indicator and error-text figures in [Text fields guidelines](https://m3.material.io/components/text-fields/guidelines).
- Preserve each input family's adopted presentation, labeling, selection, and keyboard behavior. See [Form field](form-field.md), [Checkbox](checkbox.md), [Radio button](radio-group.md), and [Select](select.md).
- Organize layout for available space and all supported input methods rather than assuming a desktop viewport. See [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design).

## Project decisions

### Hierarchy and layout

The following assignments are project-defined. Use Title Medium for section names and Body Medium for introductory instructions. Input labels, values, and field errors retain their owning component's type roles.

- Project-defined: Start with one column, 16 px between fields and 24 px between sections. Let field and error content determine height. The application may place short, related fields in columns when their labels and content fit; preserve logical reading and focus order.
- Project-defined: Keep a group's explanation before its controls and its actions after them. Use semantic field grouping where fields share a question. Do not add a second Form label or error below a field that already owns that presentation.
- Project-defined: Keep the form background inherited from its containing surface. Use space and section headings before adding nested card containers, so grouping remains clear without unnecessary visual boundaries.
- Project-defined: Wrap action groups when necessary and retain fully readable labels. Use the adopted Button hierarchy for the primary submit action and lower-emphasis alternatives.

### Validation and submission

- `form.validation.ownership` (project-defined): The application or a validation adapter owns values and validation rules; each control owns editing and parsing. Form coordinates submission and the presentation of field and form-level results. Native constraint validation and custom feedback must not produce competing error presentations.
- Project-defined: Submit validates the relevant fields. Before the first failed submission, do not present an error merely because an untouched required field is empty. After an error is exposed, allow correction to update that feedback without leaving an obsolete result visible.
- `form.validation.summary` (project-defined): Place an error summary before the fields after a failed submission, with links or focus actions for affected controls. Keep the corresponding local error at each field. For Web error association and recovery, follow [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).
- `form.submission.concurrent` (project-defined): Pending submission has visible status and prevents duplicate submission without erasing values. A failed submission preserves edits and offers recovery. Earlier asynchronous results cannot replace feedback for a newer value or submission.
- `form.reset.session` (project-defined): Reset restores the initial values for the current form session and clears its feedback. Loading a different record establishes a new session. Dynamically hidden fields retain their values unless the application removes them from that session; hidden controls cannot receive error-summary focus.
- Project-defined: Editing during pending work invalidates feedback for earlier values. Request cancellation without claiming a server rollback; keep duplicate submission blocked until the attempt settles and explain when its outcome needs checking. Clear adapter errors when their input changes, and validate again on submission rather than presenting an old result as current.
