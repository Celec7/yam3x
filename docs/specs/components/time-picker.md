# Time pickers: project design guide

## Scope

Time pickers help people select a specific time. This guide adopts Material's dial and text-input controls and their modal flow. See [Time picker overview](https://m3.material.io/components/time-pickers/overview).

## Design target

- Provide the dial and manual input modes described in [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines). Use separate hour and minute fields; include period selection for 12-hour time where applicable.
- Use the dial dimensions, target areas, selected states, and colors shown in [Time picker specifications](https://m3.material.io/components/time-pickers/specs). Adapt orientation or use input mode when the dial does not fit; avoid scrolling the picker.
- Use `on-surface` for the enlarged time values and `on-surface-variant` for the Hour/Minute supporting labels, as shown by the Input token selector.
- Place Hour/Minute labels below the enlarged input fields, as shown in [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines).
- `time-picker.color.roles`: Use the surface and selected-state color roles shown in [Time picker specifications](https://m3.material.io/components/time-pickers/specs).
- Follow the 12-hour and 24-hour dial arrangements in [Time picker guidelines](https://m3.material.io/components/time-pickers/guidelines). Let locale or time-format settings determine which presentation is used.
- Use the enter/exit transition for the modal picker and the transition between dial and input modes. Honor reduced-motion preferences. See [Time picker guidelines: behavior](https://m3.material.io/components/time-pickers/guidelines).
- Confirm commits the selected time; Cancel or dismissal closes without confirmation. Keep the mode-switch control and actions clearly labeled. See [Time picker accessibility](https://m3.material.io/components/time-pickers/accessibility).
- `time-picker.a11y.keyboard`: Give input fields and dial targets accessible names and keyboard access. Follow the labeling, target, and keyboard guidance in [Time picker accessibility](https://m3.material.io/components/time-pickers/accessibility).
- Localize generated dial-value names and both directions of the mode-toggle name. The caller-provided dial-value formatter receives the selected value, unit, and range maximum; provide translated labels when using a non-English locale.

## Official token mapping

Map the official `md.comp.time-picker.*` and `md.comp.time-input.*` tokens through this component's private Component aliases. The CSS consumes those aliases; theme colors and shared scales enter through System tokens.

| Official requirement  | System or Component mapping                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Picker container      | `surface-container-high`; dial face and unselected time field use `surface-container-highest`                |
| Selected time         | `primary-container` with `on-primary-container`                                                              |
| Selected period       | `tertiary-container` with `on-tertiary-container`; unselected period uses `on-surface-variant` and `outline` |
| Enlarged input labels | `on-surface`; supporting text and headline use `on-surface-variant`                                          |
| Dial                  | 256dp face, 48dp target, 48dp handle, 8dp center, 2dp track                                                  |
| Time selector         | 96×80dp; first selector is 114dp wide in the 24-hour vertical layout                                         |
| Period selector       | 52×80dp vertical dial, 216×38dp horizontal dial, and 52×72dp input                                           |
| Input field           | 96×72dp                                                                                                      |
| Picker padding        | 24dp on each side                                                                                            |

The official Input token selector names its component tokens under `md.comp.time-input.*`. It specifies a 96×72dp input field, a 52×72dp period selector, a 12/16/500/0.5pt headline, a 12/16/400/0.4pt supporting label, a 45/52/400/0pt enlarged time label, and a 57/64/400/−0.25pt separator. The selected period label is 16/24/500/0.15pt. In the Dial selector, dial numerals use 16/24/400/0.5pt. Map these values to the Component layer; do not replace the official roles with hard-coded theme colors.

## Project decisions

- Project-defined API: Expose dial and text input as separate composable Vue controls (`TimePicker` and `TimeInput`) and provide `TimePickerDialog` as a convenience composition. Standalone controls update immediately; the dialog keeps a draft until confirmation. This follows the controls' separate roles while using Vue's `v-model` composition.
- Project-defined: Keep the selected time provisional until confirmation. Support seconds only when the consuming feature needs them; Material primarily depicts hour and minute selection.
- Project-defined: Represent time as `{ hour, minute, second? }` in 24-hour values independent of calendar dates. Optional seconds are a project extension.
- Project-defined: Support a docked dialog presentation and automatic compact layout for constrained viewports; Material's documented modal flow remains the design target.
- Project-defined: For the 24-hour dial, follow the guideline's explicit even-hours-inner and odd-hours-outer rule; its example image appears to show 0–11 on the outer ring and 12–23 on the inner ring instead.
- Project-defined: Automatic layout uses a 684px minimum width and 480px minimum height for the horizontal dial, and a 596px minimum height for the vertical dial. These cutoffs keep the 256px dial, surrounding content, and 24px container padding visible without scrolling.
- Project-defined: Use a fade-and-scale transition between hour, minute, and second dial faces; Material does not specify this transition.
- Project-defined: Keep CSS implementation aliases private. The Vue props and slots are the supported customization surface; incidental CSS properties are not consumer overrides.
