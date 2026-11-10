# Snackbar: project design guide

## Scope

A snackbar briefly communicates a low-priority update without interrupting the current task. It is not a substitute for a dialog when a decision or acknowledgement is required. See [Snackbar overview](https://m3.material.io/components/snackbar/overview).

## Design target

- Use a snackbar for a brief update about work the app has done or will do. A snackbar should not require a response. Use a dialog when the message is critical. See [Snackbar guidelines](https://m3.material.io/components/snackbar/guidelines).
- Show one snackbar at a time. It may have one concise text action; that action must not be the only way to reach a core use case. See [Snackbar guidelines](https://m3.material.io/components/snackbar/guidelines).
- `snackbar.geometry.responsive`: Use the container, action, close affordance, and geometry in the [Snackbar specifications](https://m3.material.io/components/snackbar/specs). Place it around navigation, FABs, and focused controls according to the [responsive placement guidance](https://m3.material.io/components/snackbar/guidelines). The specs selector gives 48 dp for one line and 68 dp for two lines; the compact-layout guideline describes growth from 48 dp to 64 dp.
- Keep the supporting message concise. Compact layouts support up to two lines. Preserve the full message and let it wrap instead of clipping content.
- Use the inverse color roles shown in [Snackbar specifications](https://m3.material.io/components/snackbar/specs). Keep the message and action visually distinct. Use the 8% hover and 10% focus/pressed state layers from the token selector for both the action and close affordance.
- `snackbar.a11y.live`: Announce a new message once through a polite live region. Do not move focus or trap it when the snackbar appears. See [Snackbar accessibility](https://m3.material.io/components/snackbar/accessibility).
- Material gives 4 to 10 seconds as a common auto-dismiss range, depending on platform. Provide another way to discover timed Web updates or keep the snackbar actionable. See [Snackbar accessibility](https://m3.material.io/components/snackbar/accessibility).

## Project decisions

The following are project decisions.

- An un-actionable Web snackbar remains available until dismissed unless equivalent inline feedback is provided. Distinct messages appear sequentially; a new message that updates the same information replaces the stale one.
- The host can sit above a page anchor with a 16 px margin. It tracks anchor movement and falls back to the viewport bottom when the anchor is unavailable; an additional bottom offset remains additive.
- Use 64 dp at compact viewport widths up to 599 px and 68 dp at wider widths, resolving the official 68 dp two-line spec value and 64 dp compact guideline value. The official sources define neither this breakpoint nor that width assignment.
- When the action, close target, and a 120 px minimum message width cannot fit in one row, place the action on its own row below the message. Material's configurations show a longer action may use a third line but do not define a Web wrapping threshold.
- Use a short opacity transition for enter and exit. Material does not prescribe snackbar motion; opacity keeps the text baseline stable during appearance.
