import { getFormFocusProxy } from '../_shared/form-control'
import { getTabbableElements } from '../_shared/focus-trap'
import type { FormIssue } from './form.types'
export type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
export interface InternalFormIssue extends FormIssue {
  key: string
  source: 'native' | 'adapter'
  control?: NativeControl
}
export function formControls(form: HTMLFormElement): NativeControl[] {
  return Array.from(form.elements).filter(
    (element): element is NativeControl =>
      ['input', 'textarea', 'select'].includes(element.localName) &&
      !(
        element.localName === 'input' &&
        ['button', 'submit', 'reset', 'image'].includes((element as HTMLInputElement).type)
      ),
  )
}

export function controlLabel(control: NativeControl | undefined, fallback: string): string {
  if (!control) return fallback
  const target = getFormFocusProxy(control)
  const ids = target.getAttribute('aria-labelledby')?.split(/\s+/) ?? []
  const labelled = ids
    .map((id) => target.ownerDocument.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(' ')
  return (
    target.getAttribute('aria-label') ||
    labelled ||
    Array.from(control.labels ?? [])
      .map((label) => label.textContent?.trim())
      .filter(Boolean)
      .join(' ') ||
    control.name ||
    fallback
  )
}
export function nativeIssues(form: HTMLFormElement, fallback: string): InternalFormIssue[] {
  const issues: InternalFormIssue[] = []
  const seen = new Set<string>()
  formControls(form).forEach((control, index) => {
    if (!control.willValidate || control.validity.valid) return
    const key = control.name ? `name:${control.name}` : `native:${index}`
    if (seen.has(key)) return
    seen.add(key)
    issues.push({
      key,
      name: control.name,
      label: controlLabel(control, fallback),
      message: control.validationMessage,
      source: 'native',
      control,
    })
  })
  return issues
}
export function adapterIssues(
  form: HTMLFormElement,
  errors: Record<string, string> | undefined,
  fallback: string,
): InternalFormIssue[] {
  const controls = formControls(form)
  return Object.entries(errors ?? {})
    .filter(([, message]) => Boolean(message))
    .map(([name, message]) => {
      const control = controls.find((element) => element.name === name)
      return {
        key: name,
        name,
        label: controlLabel(control, name || fallback),
        message,
        source: 'adapter',
        control,
      }
    })
}
export function focusTarget(
  form: HTMLFormElement,
  control: NativeControl | undefined,
): HTMLElement | undefined {
  if (!control) return undefined
  const tabbable = new Set(getTabbableElements(form.ownerDocument.body))
  const target = getFormFocusProxy(control)
  if (tabbable.has(target)) return target
  if (tabbable.has(control)) return control
  return control.name
    ? formControls(form).find((element) => element.name === control.name && tabbable.has(element))
    : undefined
}
/** Includes editing controls, while ignoring pending-state disabling and submit-button labels. */
export function formSignature(form: HTMLFormElement): string {
  return JSON.stringify(
    formControls(form).map((control) => {
      if (control instanceof HTMLInputElement && control.type === 'file') {
        return [
          control.name,
          control.type,
          Array.from(control.files ?? []).map((file) => [
            file.name,
            file.size,
            file.type,
            file.lastModified,
          ]),
        ]
      }
      if (control instanceof HTMLSelectElement)
        return [control.name, Array.from(control.selectedOptions).map((option) => option.value)]
      return [
        control.name,
        control.value,
        control instanceof HTMLInputElement ? control.checked : undefined,
      ]
    }),
  )
}
export function isFormEdit(form: HTMLFormElement, target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (form.contains(target) || (target as HTMLInputElement).form === form) return true
  if (target.matches('[data-form-field-control]')) {
    return formControls(form).some((control) => getFormFocusProxy(control) === target)
  }
  return false
}
