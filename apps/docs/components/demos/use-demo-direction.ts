import { computed, ref } from 'vue'

export type DemoDirection = 'ltr' | 'rtl'

export function useDemoDirection(initial: DemoDirection = 'ltr') {
  const direction = ref<DemoDirection>(initial)
  const dir = computed(() => direction.value)
  const toggle = () => {
    direction.value = direction.value === 'ltr' ? 'rtl' : 'ltr'
  }
  return { direction, dir, toggle }
}
