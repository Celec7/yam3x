# Scroll fields: project design guide

## Scope

Scroll fields select numeric values and measurements from a vertically scrolling list. This guide adopts the Material 3 Expressive scroll field with three width classes, finite or looping lists, and scroll and text-input modes. It is an **Expressive** component. The closest Compose analog is `ScrollField`, which implements an infinite wheel and leaves text input, labels, errors, and form behavior to the caller. See [Scroll fields overview](https://m3.material.io/components/scroll-fields/overview).

## Design target

### Use and content

- Use scroll fields for numbers and units that benefit from a physical, adjustable selection. Use a time picker for time, a text field for precise or long-form entry, and another control when the value is not numeric. See [Scroll fields guidelines](https://m3.material.io/components/scroll-fields/guidelines).
- Keep lists short. Material recommends avoiding values with five or more digits; when a long range is unavoidable, use meaningful intervals instead of every unit. See [Sizing](https://m3.material.io/components/scroll-fields/guidelines).
- Place fields inline when possible. A modal dialog is a rare fallback when inline placement does not fit. See [Placement](https://m3.material.io/components/scroll-fields/guidelines).
- Put multiple fields side by side and label each one when they track different values. See [Scroll fields guidelines](https://m3.material.io/components/scroll-fields/guidelines).

### Geometry and appearance

- `scroll-field.geometry.sizes`: Use the small, medium, and large width classes for one to two, three, and four digits. Minimum widths are 100, 120, and 186 dp; the container has a 120 dp minimum height, a 200 dp default height, and a 16 dp corner. See [Scroll field measurements](https://m3.material.io/components/scroll-fields/specs).
- Keep 16 dp between values and 16 dp inline padding for small and medium fields, 24 dp for large fields. The selected value uses emphasized Display Large; unselected values use Display Medium. See [Scroll fields specifications](https://m3.material.io/components/scroll-fields/specs).
- Map the container to `surface-container-lowest`, unselected values to `outline`, the centered value to `on-surface`, and the text-input active state to `primary` for the outline, value, and caret. See [Scroll field color roles](https://m3.material.io/components/scroll-fields/specs).
- Use 8% hover and 10% focus and pressed state layers from `on-surface`. Keep the disabled container and content at 38% opacity. See [Scroll fields specifications](https://m3.material.io/components/scroll-fields/specs).
- Show the selected value centered and progressively larger than its neighbors; selection animates with the fast spatial spring from the specifications. See [Motion](https://m3.material.io/components/scroll-fields/guidelines) and [Scroll field tokens](https://m3.material.io/components/scroll-fields/specs).

### Interaction and accessibility

- `scroll-field.selection.keyboard`: The field exposes one adjustable control. Up and Down select the value above or below, Page Up and Page Down move five values, and Home and End jump to the first or last value. Tapping a visible value selects it. See [Scroll fields accessibility](https://m3.material.io/components/scroll-fields/accessibility).
- `scroll-field.a11y.spinbutton`: Expose the field as a `spinbutton` with its label, value, range, and formatted value text so assistive technology can report the current selection. See [Scroll fields accessibility](https://m3.material.io/components/scroll-fields/accessibility).
- Every scroll field must also allow text entry with a keyboard. Pair the field with a labeled mode toggle; the input uses the numeric keyboard and the active outline, value, and caret treatment. See [Support keyboard input](https://m3.material.io/components/scroll-fields/guidelines).
- `scroll-field.state.disabled`: Keep targets usable: each value row keeps at least a 48 dp target even when it extends beyond the container. Disabled fields keep the 38% content opacity and do not respond to pointer or keyboard input. See [Scroll fields accessibility](https://m3.material.io/components/scroll-fields/accessibility).
- `scroll-field.input.validation`: Errors appear below the fields and identify the incorrect value. Enter or leaving the input commits a valid value; invalid input keeps the draft and marks the field invalid. See [Input behavior](https://m3.material.io/components/scroll-fields/guidelines).
- Keep the selection and state-layer transitions, but remove them under reduced motion without changing the committed value. Preserve a visible boundary and the selected value in forced-colors mode.

## Project decisions

- The Web value model is a number constrained by `min`, `max`, and `step`; callers format units outside the field. Material describes measurements and numeric values but does not define a value API.
- Looping is opt-in. Material permits finite or infinitely looping lists; the Web component defaults to a finite list so a range always has visible ends.
- The 120 dp medium minimum width follows the measurement diagram and token table. The guidelines prose states 144 dp for a medium field; the token table and diagram are the design source for geometry and win that conflict.
- A 64 px value row with a 16 px gap keeps the emphasized Display Large line uncut. Material's Compose implementation uses a 52 dp pager page; the official token table still specifies a 200 dp container height and 16 dp gaps, and it does not publish a Web row height.
- The wheel uses native wheel and touch scrolling, pointer dragging for mouse and pen, and a fast-spatial spring for snapping and selection movement. The selected row interpolates its size and color continuously with its distance from the center. Material specifies snapping but not fling or drag thresholds.
- The field is one focus stop. Individual rows are pointer targets, not focusable controls, so the value stays a single `spinbutton` for assistive technology.
- Text input commits on Enter or blur and keeps the input mode until the caller switches back. Material requires a mode switch but does not define whether leaving the input ends the mode.
- The input error message is caller-provided through `error`; the component reports validity through `aria-invalid`, the `invalid` event, and a `valid` event after a successful draft commit instead of inventing localized error copy.
- The numeric wheel is not forced left-to-right. Values follow the locale's digits and separators; Material defines no RTL treatment for this component.
