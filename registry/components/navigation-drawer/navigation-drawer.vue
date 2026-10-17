<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, provide, ref, useId, useSlots } from 'vue'
import DrawerContainer from '../drawer-container/drawer-container.vue'
import { navigationDrawerContextKey } from './navigation-drawer.context'
import type {
  NavigationDrawerChangeReason,
  NavigationDrawerCloseSlotProps,
  NavigationDrawerMode,
  NavigationDrawerToggleSlotProps,
} from './navigation-drawer.types'
import './navigation-drawer.css'

const props = withDefaults(
  defineProps<{
    mode?: NavigationDrawerMode
    standardBreakpoint?: number
    label: string
    navigationLabel?: string
    closeLabel?: string
    width?: string
    maxWidth?: string
  }>(),
  {
    mode: 'auto',
    standardBreakpoint: 840,
    closeLabel: 'Close navigation',
    width: '360px',
    maxWidth: '360px',
  },
)
const openModel = defineModel<boolean | undefined>('open', { default: undefined })
const selected = defineModel<string>('selected', { required: true })
const emit = defineEmits<{
  select: [value: string, href: string | undefined, event: MouseEvent]
  change: [open: boolean, reason: NavigationDrawerChangeReason]
}>()
defineSlots<{
  default?(): unknown
  content?(): unknown
  header?(): unknown
  close?(props: NavigationDrawerCloseSlotProps): unknown
  toggle?(props: NavigationDrawerToggleSlotProps): unknown
}>()

const slots = useSlots()
const root = ref<HTMLElement | null>(null)
const navRoot = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const id = `yam3x-navigation-drawer-${useId()}`
const disabled = computed(() => false)
const ancestors = computed<readonly string[]>(() => [])
const disclosures = new Map<string, (open: boolean) => void>()
let observer: ResizeObserver | undefined
let typeahead = ''
let typeaheadTimer = 0

const resolvedMode = computed(() => {
  if (props.mode !== 'auto') return props.mode
  return containerWidth.value > 0 && containerWidth.value < props.standardBreakpoint
    ? 'modal'
    : containerWidth.value > 0
      ? 'standard'
      : 'modal'
})
const drawerMode = computed(() => (resolvedMode.value === 'modal' ? 'overlay' : 'push'))
const resolvedOpen = computed(() => openModel.value ?? resolvedMode.value === 'standard')
const style = computed(() => ({
  '--yam3x-drawer-width': props.width,
  '--yam3x-drawer-max-width': props.maxWidth,
  '--yam3x-drawer-container-color': 'var(--_yam3x-navigation-drawer-color-surface)',
  '--yam3x-modal-drawer-container-color':
    'var(--_yam3x-navigation-drawer-color-surface-container-low)',
}))

function registerDisclosure(value: string, setOpen: ((open: boolean) => void) | null): void {
  if (setOpen) disclosures.set(value, setOpen)
  else disclosures.delete(value)
}
function select(value: string, href: string | undefined, event: MouseEvent): void {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return
  if (href !== undefined) selected.value = value
  emit('select', value, href, event)
  if (resolvedMode.value === 'modal') updateOpen(false, 'select')
}
function visibleControls(): HTMLElement[] {
  return [
    ...(navRoot.value?.querySelectorAll<HTMLElement>('[data-yam3x-navigation-drawer-control]') ??
      []),
  ].filter(
    (element) =>
      !element.matches(':disabled,[aria-disabled="true"]') &&
      !element.closest('[aria-hidden="true"],[inert]'),
  )
}
function onKeydown(event: KeyboardEvent): void {
  const target =
    event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>('[data-yam3x-navigation-drawer-control]')
      : null
  if (!target || !navRoot.value?.contains(target)) return
  const controls = visibleControls()
  const index = controls.indexOf(target)
  if (index < 0 || !controls.length) return
  let next: HTMLElement | undefined
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    next =
      controls[(index + (event.key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length]
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    next = event.key === 'Home' ? controls[0] : controls.at(-1)
  } else if (
    event.key === ' ' &&
    target instanceof HTMLAnchorElement &&
    target.hasAttribute('href')
  ) {
    event.preventDefault()
    target.click()
    return
  } else if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    event.key !== ' '
  ) {
    typeahead += event.key.toLocaleLowerCase()
    window.clearTimeout(typeaheadTimer)
    typeaheadTimer = window.setTimeout(() => {
      typeahead = ''
    }, 700)
    const ordered = [...controls.slice(index + 1), ...controls.slice(0, index + 1)]
    next = ordered.find((element) =>
      (element.dataset.label || element.textContent || '')
        .trim()
        .toLocaleLowerCase()
        .startsWith(typeahead),
    )
    if (next) event.preventDefault()
  }
  next?.focus({ preventScroll: true })
  next?.scrollIntoView({ block: 'nearest' })
}
function setAllOpen(open: boolean): void {
  disclosures.forEach((setOpen) => setOpen(open))
}
function expand(): void {
  setAllOpen(true)
}
function collapse(): void {
  setAllOpen(false)
}
function updateOpen(value: boolean, reason: NavigationDrawerChangeReason): void {
  if (resolvedOpen.value === value) return
  openModel.value = value
  emit('change', value, reason)
}
function close(): void {
  updateOpen(false, 'dismiss')
}
function onOpenUpdate(value: boolean): void {
  openModel.value = value
}
function onContainerChange(
  _edge: 'start' | 'end',
  value: boolean,
  reason: 'toggle' | 'dismiss',
): void {
  emit('change', value, reason)
}
function measure(): void {
  containerWidth.value = root.value?.getBoundingClientRect().width ?? 0
}
function markInitialFocusTarget(): void {
  navRoot.value
    ?.querySelectorAll('[data-yam3x-drawer-initial-focus]')
    .forEach((element) => element.removeAttribute('data-yam3x-drawer-initial-focus'))
  visibleControls()[0]?.setAttribute('data-yam3x-drawer-initial-focus', '')
}

provide(navigationDrawerContextKey, {
  current: selected,
  parentDisabled: disabled,
  ancestors,
  select,
  registerDisclosure,
})
onMounted(() => {
  if (props.mode === 'auto' && root.value) {
    measure()
    observer = new ResizeObserver(measure)
    observer.observe(root.value)
  }
  markInitialFocusTarget()
})
onUpdated(markInitialFocusTarget)
onBeforeUnmount(() => {
  observer?.disconnect()
  window.clearTimeout(typeaheadTimer)
})

defineExpose({ expand, collapse, id })
</script>

<template>
  <div
    ref="root"
    class="yam3x-navigation-drawer-root"
    :style="style"
  >
    <DrawerContainer
      :start-mode="drawerMode"
      :open="resolvedOpen"
      :width="props.width"
      :max-width="props.maxWidth"
      :start-label="props.label"
      :close-label="props.closeLabel"
      @update:open="onOpenUpdate"
      @change="onContainerChange"
    >
      <template #start>
        <header
          v-if="slots.header || (slots.close && resolvedMode === 'modal')"
          class="yam3x-navigation-drawer__header"
        >
          <slot name="header" />
          <slot
            v-if="resolvedMode === 'modal'"
            name="close"
            :close="close"
            :close-label="props.closeLabel"
          />
        </header>
        <nav
          :id="id"
          ref="navRoot"
          class="yam3x-navigation-drawer"
          :aria-label="props.navigationLabel ?? props.label"
          @keydown="onKeydown"
        >
          <ul class="yam3x-navigation-drawer__list">
            <slot />
          </ul>
        </nav>
      </template>
      <template #start-toggle="toggleProps">
        <slot
          name="toggle"
          v-bind="toggleProps"
        />
      </template>
      <slot name="content" />
    </DrawerContainer>
  </div>
</template>
