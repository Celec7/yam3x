# File upload: project extension guide

## Scope

This project extension lets people choose files, review a queue, and follow or recover individual transfers. It combines a file-selection action, an optional drop area, and a file list. Material 3 Expressive does not define a standalone File upload component. Apply the [shared foundations](../foundations.md).

## Design target

- Use a clearly prioritized [Button](button.md) for file selection. Keep instructions and constraints visible in the content flow rather than only in a tooltip. See [Buttons guidelines](https://m3.material.io/components/buttons/guidelines) and [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines).
- Use consistent leading media, primary text, supporting text, and trailing actions to make the file collection scannable. See the alignment and primary/secondary-action figures in [Lists guidelines](https://m3.material.io/components/lists/guidelines).
- Use determinate progress only for a measured amount; use indeterminate progress when the amount is unknown. Represent a related group with one indicator unless items are independently active. See [Progress indicators guidelines: values and placement](https://m3.material.io/components/progress-indicators/guidelines).

## Project decisions

### Anatomy and layout

The following assignments are project-defined. Use Title Medium for an optional group title, Body Large for a file name, and Body Small for size, constraints, and status. Comparable byte counts and percentages use tabular figures.

- Project-defined: Use 24 px drop-area padding, 16 px between selection and queue regions, and 8 px between related instructions. A file row has a 56 px minimum height and grows with its text. Actual List and Button instances retain their own geometry.
- Project-defined: Use Surface Container Low with On Surface content for the drop area and Outline Variant for its boundary. Use a Medium corner role for this single grouping surface; file rows do not each need a raised card. Drag-over adds a Primary boundary and visible instruction without relying on color alone.
- Project-defined: Keep the file name and available action discoverable when width is limited. Wrap status and actions onto another line before compressing text or interactive targets. Essential constraints remain visible on touch devices, where dropping may be unavailable.

### Transfer and feedback

- `file-upload.selection.constraints` (project-defined): File selection remains available through a native file input and a named keyboard-operable trigger. Dropping is an additional input path. Apply the same stated type, size, and count constraints to both paths, with readable rejection reasons. The drop surface is not a whole-area button containing nested action buttons.
- `file-upload.transfer.lifecycle` (project-defined): Separate queued, transferring, server-processing, completed, failed, and canceled work where those stages exist. A completed byte transfer does not claim that server processing has succeeded. Individual progress is appropriate only when files represent independently active tasks.
- Project-defined: Show rejection or failure beside the affected file, with a reason and a suitable recovery action. Retain successful files when another fails. Aggregate feedback summarizes the queue rather than announcing every progress tick.
- `file-upload.transfer.cancellation` (project-defined): The transfer adapter owns network execution and reports progress and outcomes; the upload controller owns the visible queue. Removing an active queue item requests cancellation. Retain its concurrency slot until the adapter settles, and show cancellation in progress when the row remains. Canceling a transfer does not mean deleting a previously stored attachment. A replacement attempt supersedes earlier feedback for that item.
- Project-defined: Preview media supports identification rather than replacing file names. Label remove, cancel, and retry actions for their file; return focus to a remaining queue item or the selection trigger when an item disappears.
- Project-defined: Each selection adds entries rather than silently replacing an existing queue. Rejected entries retain their reason without consuming accepted-file capacity; completed and canceled entries retain their place until removed. Selecting the same file again creates an independent entry. This keeps review and replacement explicit.
- Project-defined: The picker acquires files, while the queue owns their lifetime. Applications choose whether to transfer entries independently or include selected files in a larger form submission; the picker must not misrepresent the current queue as its last native selection.
