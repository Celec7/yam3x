import { computed, type ComputedRef } from 'vue'
import { useData } from 'vitepress'

export type DemoLocale = 'en' | 'zh'
type DemoLocaleApi = {
  locale: ComputedRef<DemoLocale>
  t: (english: string, chinese: string) => string
}

/** Select demo copy from the locale of the current VitePress page. */
export function useDemoLocale(): DemoLocaleApi
export function useDemoLocale<T>(
  messages: Record<DemoLocale, T>,
): DemoLocaleApi & { messages: ComputedRef<T> }
export function useDemoLocale<T>(messages?: Record<DemoLocale, T>) {
  const { lang } = useData()
  const locale = computed<DemoLocale>(() =>
    lang.value.toLowerCase().startsWith('zh') ? 'zh' : 'en',
  )

  const t = (english: string, chinese: string) => (locale.value === 'en' ? english : chinese)

  if (!messages) return { locale, t }

  return { locale, messages: computed(() => messages[locale.value]), t }
}
