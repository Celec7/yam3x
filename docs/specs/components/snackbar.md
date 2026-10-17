# Snackbar: project design guide

## Scope

A snackbar briefly communicates a low-priority update without interrupting the current task. It is not a substitute for a dialog when a decision or acknowledgement is required. See [Snackbar overview](https://m3.material.io/components/snackbar/overview).

## Design target

- Use a snackbar for a brief update about work the app has done or will do. A snackbar should not require a response. Use a dialog when the message is critical. See [Snackbar guidelines](https://m3.material.io/components/snackbar/guidelines).
- Show one snackbar at a time. It may have one concise text action; that action must not be the only way to reach a core use case. See [Snackbar guidelines](https://m3.material.io/components/snackbar/guidelines).
- `snackbar.geometry.responsive`: Use the container, action, close affordance, and geometry in the [Snackbar specifications](https://m3.material.io/components/snackbar/specs). Place it around navigation, FABs, and focused controls according to the [responsive placement guidance](https://m3.material.io/components/snackbar/guidelines). The specs selector gives 48dp for one line and 68dp for two lines; the compact-layout guideline describes growth from 48dp to 64dp.
- Keep the supporting message concise. Compact layouts support up to two lines. Preserve the full message and let it wrap instead of clipping content.
- Use the inverse color roles shown in [Snackbar specifications](https://m3.material.io/components/snackbar/specs). Keep the message and action visually distinct.
- `snackbar.a11y.live`: Announce a new message once through a polite live region. Do not move focus or trap it when the snackbar appears. See [Snackbar accessibility](https://m3.material.io/components/snackbar/accessibility).
- Material gives 4 to 10 seconds as a common auto-dismiss range, depending on platform. Provide another way to discover timed Web updates or keep the snackbar actionable. See [Snackbar accessibility](https://m3.material.io/components/snackbar/accessibility).

## Project decisions

- Project-defined: An un-actionable Web snackbar remains available until dismissed unless equivalent inline feedback is provided. Distinct messages appear sequentially; a new message that updates the same information replaces the stale one.
- Project-defined: `SnackbarProvider` may receive one `HTMLElement` anchor and place the host above it with the existing 16px margin. It tracks anchor movement and falls back to the viewport bottom when the anchor is unavailable; `bottomOffset` remains an additive adjustment.
- Project-defined: Resolve the official 68dp two-line spec value and 64dp compact guideline value by using 64dp at compact viewport widths (up to 599px) and 68dp at wider widths. The official sources do not define this breakpoint or explicitly assign the two values to those width classes.
- Project-defined: When the action, close target, and a 120px minimum message width cannot fit in one row, place the action on its own row below the message. Material's configurations show a longer action may use a third line but do not define a Web wrapping threshold.
- Project-defined: Use a short opacity transition for enter and exit. Material does not prescribe Snackbar motion; opacity keeps the text baseline stable during appearance.
- Project-defined: Provider setup, shortcut key, timing controls, and event behavior belong to the implementation and public component page.
