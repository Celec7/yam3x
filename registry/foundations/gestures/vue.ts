import { onScopeDispose, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { GestureBinding } from './binding'
import type { GestureRecognizer } from './types'

/** Binds recognizers to a ref/getter target and destroys the binding on target replacement or scope disposal. */
export function useGestures(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  ...recognizers: GestureRecognizer[]
): ShallowRef<GestureBinding | undefined> {
  const binding = shallowRef<GestureBinding>()
  const stop = watch(
    () => toValue(target),
    (element) => {
      binding.value?.destroy()
      binding.value = element ? new GestureBinding(element, ...recognizers) : undefined
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(() => {
    stop()
    binding.value?.destroy()
    binding.value = undefined
  })
  return binding
}
