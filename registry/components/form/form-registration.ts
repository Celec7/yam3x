import {
  computed,
  inject,
  onScopeDispose,
  provide,
  shallowReactive,
  toValue,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter,
  type WatchStopHandle,
} from 'vue'
import { resolveFormFields } from './form-fields'
import type { FormFieldDefinition } from './form.types'

type RegisterField = (field: MaybeRefOrGetter<FormFieldDefinition>) => () => void
const registrationKey: InjectionKey<RegisterField> = Symbol('yam3x-form-fields')
/** Registers metadata in the nearest Form; the application continues to own its control and value. */
export function useFormField(field: MaybeRefOrGetter<FormFieldDefinition>): void {
  const register = inject(registrationKey)
  if (!register) throw new Error('useFormField must be called within a Form.')
  const unregister = register(field)
  onScopeDispose(unregister)
}
export function useFormRegistry(
  declared: () => readonly FormFieldDefinition[],
  invalidate: () => void,
) {
  const dynamic = shallowReactive(new Map<symbol, MaybeRefOrGetter<FormFieldDefinition>>())
  const fields = computed(() =>
    resolveFormFields([...declared(), ...Array.from(dynamic.values(), (field) => toValue(field))]),
  )
  const stops = new Map<string, WatchStopHandle>()
  const register: RegisterField = (field) => {
    const key = Symbol()
    dynamic.set(key, field)
    invalidate()
    return () => {
      if (dynamic.delete(key)) invalidate()
    }
  }
  provide(registrationKey, register)
  watch(
    () => fields.value.map((field) => field.name),
    (names) => {
      for (const [name, stop] of stops)
        if (!names.includes(name)) {
          stop()
          stops.delete(name)
          invalidate()
        }
      for (const name of names)
        if (!stops.has(name)) {
          stops.set(
            name,
            watch(() => fields.value.find((field) => field.name === name)?.value?.(), invalidate, {
              deep: true,
              flush: 'sync',
            }),
          )
        }
    },
    { immediate: true, flush: 'sync' },
  )
  onScopeDispose(() => {
    for (const stop of stops.values()) stop()
  })
  return { fields, register }
}
