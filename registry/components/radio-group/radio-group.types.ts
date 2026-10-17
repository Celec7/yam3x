import type { ComputedRef, InjectionKey, Ref } from 'vue'

export interface RadioGroupContext {
  modelValue: Ref<string | null>
  name: ComputedRef<string | undefined>
  form: ComputedRef<string | undefined>
  required: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  requestSelect: (value: string) => void
}

export const radioGroupContextKey: InjectionKey<RadioGroupContext> = Symbol('yam3x-radio-group')
