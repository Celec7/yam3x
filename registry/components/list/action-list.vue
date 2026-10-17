<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, provide, ref, useAttrs } from 'vue'
import { actionListKey, listVariantKey, type ListVariant } from './list.types'
import './list.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ variant?: ListVariant }>(), { variant: 'standard' })
const attrs = useAttrs()
const variant = computed<ListVariant>(() =>
  props.variant === 'segmented' ? 'segmented' : 'standard',
)
const root = ref<HTMLUListElement | null>(null)
const activeElement = ref<HTMLElement | null>(null)
const selector = '[data-yam3x-list-action], [data-yam3x-expand-toggle], [data-yam3x-action-control]'
let observer: MutationObserver | null = null

function allActions(): HTMLElement[] {
  return [...(root.value?.querySelectorAll<HTMLElement>(selector) ?? [])]
}
function availableActions(): HTMLElement[] {
  return allActions().filter(isAvailable)
}

function isAvailable(element: HTMLElement): boolean {
  return (
    !element.matches(':disabled, [aria-disabled="true"]') &&
    !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
    !element.closest('.yam3x-expandable-list-item__panel[data-open="false"]')
  )
}

function syncActions(): void {
  const available = availableActions()
  if (!activeElement.value || !available.includes(activeElement.value)) {
    activeElement.value =
      available.find((element) => element === document.activeElement) ?? available[0] ?? null
  }
  allActions().forEach((element) => {
    element.tabIndex = isAvailable(element) && element === activeElement.value ? 0 : -1
  })
}

function onFocusIn(event: FocusEvent): void {
  if (!(event.target instanceof Element)) return
  const action = event.target.closest<HTMLElement>(selector)
  if (action && root.value?.contains(action) && isAvailable(action)) {
    activeElement.value = action
    syncActions()
  }
}

function onKeydown(event: KeyboardEvent): void {
  const candidates = availableActions()
  if (!candidates.length) return
  const source =
    event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null
  if (!source || !candidates.includes(source)) return
  let index = candidates.indexOf(source)
  if (event.key === 'Home') index = 0
  else if (event.key === 'End') index = candidates.length - 1
  else if (event.key === 'ArrowDown') index = (index + 1) % candidates.length
  else if (event.key === 'ArrowUp') index = (index - 1 + candidates.length) % candidates.length
  else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const rtl = root.value && getComputedStyle(root.value).direction === 'rtl'
    const forward = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')
    index = (index + (forward ? 1 : -1) + candidates.length) % candidates.length
  } else return
  event.preventDefault()
  event.stopPropagation()
  activeElement.value = candidates[index]
  syncActions()
  candidates[index].focus({ preventScroll: true })
}

provide(actionListKey, true)
provide(listVariantKey, { variant })
onMounted(() => {
  syncActions()
  if (root.value && typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(syncActions)
    observer.observe(root.value, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        'aria-disabled',
        'aria-hidden',
        'data-open',
        'data-yam3x-action-control',
        'disabled',
        'inert',
      ],
    })
  }
})
onUpdated(syncActions)
onBeforeUnmount(() => {
  observer?.disconnect()
  activeElement.value = null
})
</script>

<template>
  <ul
    v-bind="attrs"
    ref="root"
    class="yam3x-list yam3x-action-list"
    :class="`yam3x-list--${variant}`"
    :data-variant="variant"
    role="list"
    @focusin="onFocusIn"
    @keydown="onKeydown"
  >
    <slot />
  </ul>
</template>
