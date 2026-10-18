import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'
import english from './locales/en-US'
import chinese from './locales/zh-CN'
import type { LocaleMessages, LocaleOverrides } from './messages.types'

export interface LocaleContext {
  locale: string
  messages: LocaleOverrides
}
export const localeKey: InjectionKey<ComputedRef<LocaleContext>> = Symbol('yam3x-locale')

export function normalizeLocale(value?: string): string {
  try {
    return Intl.getCanonicalLocales(value || 'en-US')[0] ?? 'en-US'
  } catch {
    return 'en-US'
  }
}
export function localeLanguage(locale: string): string {
  return locale.split('-')[0]!.toLowerCase()
}
export function mergeMessages<T extends object>(base: T, override?: Partial<T>): T {
  const result = { ...base }
  if (override)
    for (const key of Object.keys(override) as Array<keyof T>)
      if (override[key] !== undefined) result[key] = override[key] as T[keyof T]
  return result
}
export function useComponentLocale<K extends keyof LocaleMessages>(
  component: K,
  explicitLocale: () => string | undefined,
  explicitMessages: () => Partial<LocaleMessages[K]> | undefined,
) {
  const inherited = inject(localeKey, undefined)
  const locale = computed(() => normalizeLocale(explicitLocale() ?? inherited?.value.locale))
  const messages = computed(() => {
    const language = localeLanguage(locale.value)
    const defaults = mergeMessages<LocaleMessages[K]>(
      english[component],
      language === 'zh' ? chinese[component] : undefined,
    )
    const shared =
      inherited && localeLanguage(inherited.value.locale) === language
        ? inherited.value.messages[component]
        : undefined
    return mergeMessages(mergeMessages(defaults, shared), explicitMessages())
  })
  return { locale, messages }
}
