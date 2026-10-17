<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, watchEffect } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { applyTheme } from '@registry/foundations/theme/apply'
import { generateTheme } from '@registry/foundations/theme/generate'
import { createThemeController, type ThemeController } from '@registry/foundations/theme/controller'
import { docsDemoTheme } from './demo-theme'

const { isDark } = useData()
const docsTheme = generateTheme('#6750a4')
const demoThemeControllers = new Map<HTMLElement, ThemeController>()
let demoThemeObserver: MutationObserver | undefined

watchEffect(() => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolvedMode = isDark.value ? 'dark' : 'light'
  applyTheme(docsTheme, root, resolvedMode)
})

function syncDemoThemeTargets() {
  if (typeof document === 'undefined') return

  const theme = docsDemoTheme.value
  const targets = new Set(
    document.querySelectorAll<HTMLElement>(
      '.yam3x-doc-demo-theme, .yam3x-fab-menu__panel, .yam3x-snackbar-host',
    ),
  )

  for (const [target, controller] of demoThemeControllers) {
    if (!theme || !target.isConnected || !targets.has(target)) {
      controller.dispose()
      demoThemeControllers.delete(target)
    }
  }

  if (!theme) return

  for (const target of targets) {
    const controller = demoThemeControllers.get(target)
    if (controller) controller.update(theme)
    else demoThemeControllers.set(target, createThemeController(target, theme))
  }
}

watch(docsDemoTheme, syncDemoThemeTargets, { flush: 'post' })

onMounted(() => {
  syncDemoThemeTargets()
  demoThemeObserver = new MutationObserver(syncDemoThemeTargets)
  demoThemeObserver.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  demoThemeObserver?.disconnect()
  for (const controller of demoThemeControllers.values()) controller.dispose()
  demoThemeControllers.clear()
})
</script>

<template>
  <DefaultTheme.Layout />
</template>
