/** Resolves the stable proxy key independently of consumer-supplied DOM IDs. */
export function getFormFocusProxy(control: HTMLElement): HTMLElement {
  const key = control.getAttribute('data-form-field-focus')
  if (!key) return control
  return (
    Array.from(
      control.parentElement?.querySelectorAll<HTMLElement>('[data-form-field-control]') ?? [],
    ).find((candidate) => candidate.getAttribute('data-form-field-control') === key) ??
    control.ownerDocument.getElementById(key) ??
    control
  )
}

/** Reads native constraint state behind a composite field control. */
export function getFormValidationControl(control: HTMLElement): HTMLElement {
  const key =
    control.getAttribute('data-form-field-control') ||
    (control.matches('input, select, textarea') ? '' : control.id)
  if (!key) return control
  return (
    Array.from(
      control.parentElement?.querySelectorAll<HTMLElement>('[data-form-field-focus]') ?? [],
    ).find(
      (candidate) =>
        candidate.getAttribute('data-form-field-focus') === key &&
        candidate.matches('input, select, textarea'),
    ) ?? control
  )
}
