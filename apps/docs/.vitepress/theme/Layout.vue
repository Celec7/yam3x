<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, watchEffect } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { applyTheme } from '@registry/foundations/theme/apply'
import { generateTheme } from '@registry/foundations/theme/generate'
import { createThemeController, type ThemeController } from '@registry/foundations/theme/controller'
import { docsDemoTheme } from './demo-theme'
import RegistrySlug from '../../components/RegistrySlug.vue'

const { isDark } = useData()
const docsTheme = generateTheme('#6750a4')
const demoThemeControllers = new Map<HTMLElement, ThemeController>()
let demoThemeObserver: MutationObserver | undefined
const demoThemeSelector = '.yam3x-doc-demo-theme, .yam3x-fab-menu__panel, .yam3x-snackbar-host'

watchEffect(() => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolvedMode = isDark.value ? 'dark' : 'light'
  applyTheme(docsTheme, root, resolvedMode)
})

function syncDemoThemeTarget(target: HTMLElement) {
  const theme = docsDemoTheme.value
  if (!theme || !target.isConnected) return
  const controller = demoThemeControllers.get(target)
  if (controller) controller.update(theme)
  else demoThemeControllers.set(target, createThemeController(target, theme))
}

function visitDemoThemeTargets(node: Node, visit: (target: HTMLElement) => void) {
  if (!(node instanceof Element)) return
  if (node instanceof HTMLElement && node.matches(demoThemeSelector)) visit(node)
  node.querySelectorAll<HTMLElement>(demoThemeSelector).forEach(visit)
}

function onDemoThemeMutations(records: MutationRecord[]) {
  for (const record of records) {
    for (const node of record.removedNodes) {
      visitDemoThemeTargets(node, (target) => {
        if (target.isConnected) return
        demoThemeControllers.get(target)?.dispose()
        demoThemeControllers.delete(target)
      })
    }
    for (const node of record.addedNodes) {
      if (node.isConnected) visitDemoThemeTargets(node, syncDemoThemeTarget)
    }
  }
}

function syncDemoThemeTargets() {
  if (typeof document === 'undefined') return
  demoThemeObserver?.disconnect()
  for (const [target, controller] of demoThemeControllers) {
    if (!docsDemoTheme.value || !target.isConnected || !target.matches(demoThemeSelector)) {
      controller.dispose()
      demoThemeControllers.delete(target)
    }
  }
  if (!docsDemoTheme.value) return
  document.querySelectorAll<HTMLElement>(demoThemeSelector).forEach(syncDemoThemeTarget)
  demoThemeObserver?.observe(document.body, { childList: true, subtree: true })
}

watch(docsDemoTheme, syncDemoThemeTargets, { flush: 'post' })

onMounted(() => {
  demoThemeObserver = new MutationObserver(onDemoThemeMutations)
  syncDemoThemeTargets()
})

onBeforeUnmount(() => {
  demoThemeObserver?.disconnect()
  for (const controller of demoThemeControllers.values()) controller.dispose()
  demoThemeControllers.clear()
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <RegistrySlug />
    </template>
  </DefaultTheme.Layout>
</template>
