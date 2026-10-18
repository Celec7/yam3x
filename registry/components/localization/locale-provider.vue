<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { localeKey, localeLanguage, mergeMessages, normalizeLocale } from './context'
import type { LocaleMessages, LocaleOverrides } from './messages.types'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ locale?: string; messages?: LocaleOverrides }>()
defineSlots<{ default?(): unknown }>()
const parent = inject(localeKey, undefined)
const context = computed(() => {
  const locale = normalizeLocale(props.locale ?? parent?.value.locale)
  const inherited =
    parent && localeLanguage(parent.value.locale) === localeLanguage(locale)
      ? parent.value.messages
      : {}
  const messages: LocaleOverrides = { ...inherited }
  function merge<K extends keyof LocaleMessages>(key: K) {
    messages[key] = mergeMessages<Partial<LocaleMessages[K]>>(
      inherited[key] ?? {},
      props.messages?.[key],
    )
  }
  for (const key of Object.keys(props.messages ?? {}) as Array<keyof LocaleMessages>) merge(key)
  return { locale, messages }
})
provide(localeKey, context)
</script>

<template>
  <slot />
</template>
