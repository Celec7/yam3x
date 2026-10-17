export type CheckboxState = 'unchecked' | 'checked' | 'indeterminate'

export type CheckboxProps = {
  label: string
  description?: string
  id?: string
  name?: string
  value?: string
  form?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
}
