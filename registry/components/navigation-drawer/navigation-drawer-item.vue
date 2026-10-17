<script setup lang="ts">
import {
  Comment,
  Fragment,
  computed,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  useId,
  useSlots,
  watch,
} from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import {
  navigationDrawerContextKey,
  navigationDrawerParentControlKey,
} from './navigation-drawer.context'
import './navigation-drawer.css'

defineOptions({ name: 'NavigationDrawerItem' })
const props = withDefaults(
  defineProps<{
    value: string
    label: string
    href?: string
    disabled?: boolean
    target?: string
    rel?: string
    download?: boolean | string
  }>(),
  { disabled: false },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  toggle: [open: boolean, value: string]
  opening: [value: string]
  opened: [value: string]
  closing: [value: string]
  closed: [value: string]
}>()
defineSlots<{
  default?(): unknown
  label?(): unknown
  icon?(): unknown
  'selected-icon'?(): unknown
  'toggle-icon'?(props: { open: boolean }): unknown
  badge?(): unknown
}>()
const slots = useSlots()
const injectedMenu = inject(navigationDrawerContextKey)
if (!injectedMenu) throw new Error('NavigationDrawerItem must be used inside NavigationDrawer.')
const menu = injectedMenu
const parentControl = inject(
  navigationDrawerParentControlKey,
  computed(() => null),
)
const ownControl = ref<HTMLButtonElement | null>(null)
const id = `yam3x-navigation-drawer-item-${useId()}`
function containsItem(nodes: ReturnType<NonNullable<typeof slots.default>>): boolean {
  return nodes.some((node) => {
    if (node.type === Comment) return false
    if (node.type === Fragment && Array.isArray(node.children))
      return containsItem(node.children as typeof nodes)
    if (typeof node.children === 'string' && !node.children.trim()) return false
    return true
  })
}
const hasChildren = computed(() => containsItem(slots.default?.() ?? []))
if (hasChildren.value && props.href !== undefined)
  throw new Error('NavigationDrawerItem branches cannot have an href.')
if (!hasChildren.value && props.href === undefined)
  throw new Error('NavigationDrawerItem destinations require an href.')
const expanded = computed(() => hasChildren.value && open.value)
const selected = computed(() => !hasChildren.value && menu.current.value === props.value)
const selectedBranch = computed(() => hasChildren.value && expanded.value)
const isDisabled = computed(() => menu.parentDisabled.value || props.disabled)
const ancestors = computed(() => [...menu.ancestors.value, props.value])
const nestedContext = { ...menu, parentDisabled: isDisabled, ancestors }
const controlId = `${id}-control`
const childrenId = `${id}-children`
const childrenMotion = ref<HTMLElement | null>(null)
let settleTimer = 0

provide(
  navigationDrawerParentControlKey,
  computed(() => ownControl.value),
)
provide(navigationDrawerContextKey, nestedContext)
watch(
  [hasChildren, () => props.value],
  ([children, value], [oldChildren, oldValue]) => {
    if (oldChildren && oldValue) menu.registerDisclosure(oldValue, null)
    if (children)
      menu.registerDisclosure(value, (next) => {
        open.value = next
      })
  },
  { immediate: true },
)
watch(open, (value, previous) => {
  if (!hasChildren.value || value === previous) return
  window.clearTimeout(settleTimer)
  if (value) emit('opening', props.value)
  else emit('closing', props.value)
  requestAnimationFrame(() => {
    const durations = childrenMotion.value
      ? getComputedStyle(childrenMotion.value)
          .transitionDuration.split(',')
          .map((duration) => {
            const amount = Number.parseFloat(duration)
            return duration.trim().endsWith('ms') ? amount : amount * 1000
          })
      : [0]
    const duration = Math.max(0, ...durations)
    if (!duration) emitSettled(value)
    else settleTimer = window.setTimeout(() => emitSettled(value), duration + 50)
  })
})
function emitSettled(value: boolean) {
  if (value) emit('opened', props.value)
  else emit('closed', props.value)
}
function onTransitionEnd(event: TransitionEvent) {
  if (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows') return
  window.clearTimeout(settleTimer)
  emitSettled(expanded.value)
}
function onItemClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }
  if (hasChildren.value) {
    event.preventDefault()
    open.value = !open.value
    emit('toggle', open.value, props.value)
    return
  }
  menu.select(props.value, props.href, event)
}
function onItemKeydown(event: KeyboardEvent) {
  if (isDisabled.value) return
  const rtl = getComputedStyle(event.currentTarget as HTMLElement).direction === 'rtl'
  const openKey = rtl ? 'ArrowLeft' : 'ArrowRight'
  const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft'
  if (event.key === openKey && hasChildren.value && !expanded.value) {
    event.preventDefault()
    event.stopPropagation()
    open.value = true
    emit('toggle', true, props.value)
  } else if (event.key === closeKey) {
    if (hasChildren.value && expanded.value) {
      event.preventDefault()
      event.stopPropagation()
      open.value = false
      emit('toggle', false, props.value)
    } else if (parentControl.value) {
      event.preventDefault()
      event.stopPropagation()
      parentControl.value.focus()
    }
  }
}
onBeforeUnmount(() => {
  window.clearTimeout(settleTimer)
  menu.registerDisclosure(props.value, null)
})
</script>

<template>
  <li
    class="yam3x-navigation-drawer__item"
    :class="{
      'yam3x-navigation-drawer__item--selected': selected,
      'yam3x-navigation-drawer__item--branch': selectedBranch,
      'yam3x-navigation-drawer__item--expanded': expanded,
      'yam3x-navigation-drawer__item--disabled': isDisabled,
    }"
  >
    <a
      v-if="!hasChildren"
      :id="controlId"
      v-ripple
      class="yam3x-navigation-drawer__control"
      data-yam3x-navigation-drawer-control
      data-yam3x-ripple
      data-yam3x-ripple-target=".yam3x-navigation-drawer__indicator"
      data-yam3x-ripple-container-target=".yam3x-navigation-drawer__indicator"
      :data-label="props.label"
      :href="props.href"
      :target="props.target"
      :rel="props.rel"
      :download="props.download === false ? undefined : props.download"
      :aria-disabled="isDisabled || undefined"
      :aria-current="selected ? 'page' : undefined"
      :tabindex="isDisabled ? -1 : undefined"
      @click="onItemClick"
      @keydown="onItemKeydown"
    >
      <span
        class="yam3x-navigation-drawer__indicator"
        aria-hidden="true"
      />
      <span
        v-if="slots['selected-icon'] || slots.icon"
        class="yam3x-navigation-drawer__icon"
        aria-hidden="true"
        ><slot
          v-if="selected && slots['selected-icon']"
          name="selected-icon" /><slot
          v-else
          name="icon"
      /></span>
      <span class="yam3x-navigation-drawer__label"
        ><slot name="label">{{ props.label }}</slot></span
      >
      <span
        v-if="slots.badge"
        class="yam3x-navigation-drawer__badge"
        ><slot name="badge"
      /></span>
    </a>
    <button
      v-else
      :id="controlId"
      ref="ownControl"
      v-ripple
      class="yam3x-navigation-drawer__control"
      data-yam3x-navigation-drawer-control
      data-yam3x-ripple
      data-yam3x-ripple-target=".yam3x-navigation-drawer__indicator"
      data-yam3x-ripple-container-target=".yam3x-navigation-drawer__indicator"
      :data-label="props.label"
      type="button"
      :disabled="isDisabled"
      :aria-expanded="hasChildren ? expanded : undefined"
      :aria-controls="hasChildren ? childrenId : undefined"
      @click="onItemClick"
      @keydown="onItemKeydown"
    >
      <span
        class="yam3x-navigation-drawer__indicator"
        aria-hidden="true"
      />
      <span
        v-if="slots['selected-icon'] || slots.icon"
        class="yam3x-navigation-drawer__icon"
        aria-hidden="true"
        ><slot
          v-if="selected && slots['selected-icon']"
          name="selected-icon" /><slot
          v-else
          name="icon"
      /></span>
      <span class="yam3x-navigation-drawer__label"
        ><slot name="label">{{ props.label }}</slot></span
      >
      <span
        v-if="slots.badge"
        class="yam3x-navigation-drawer__badge"
        ><slot name="badge"
      /></span>
      <span
        v-if="hasChildren"
        class="yam3x-navigation-drawer__toggle-icon"
        aria-hidden="true"
        ><slot
          name="toggle-icon"
          :open="expanded"
          ><Icon name="expand_more" /></slot
      ></span>
    </button>
    <div
      v-if="hasChildren"
      ref="childrenMotion"
      class="yam3x-navigation-drawer__children-motion"
      :class="{ 'yam3x-navigation-drawer__children-motion--open': expanded }"
      @transitionend="onTransitionEnd"
    >
      <ul
        :id="childrenId"
        class="yam3x-navigation-drawer__children"
        role="group"
        :aria-hidden="!expanded || undefined"
        :inert="!expanded"
        :aria-labelledby="controlId"
      >
        <slot />
      </ul>
    </div>
  </li>
</template>
