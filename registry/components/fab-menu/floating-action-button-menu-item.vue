<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, toRef } from 'vue'
import { vRipple } from '../_shared/ripple'
import { floatingActionButtonMenuKey } from './floating-action-button-menu.context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    value: string
    label: string
    disabled?: boolean
    selected?: boolean
    href?: string
    target?: string
    rel?: string
    download?: boolean | string
  }>(),
  { disabled: false, selected: false },
)
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ default?(): unknown; icon?(): unknown }>()

const injectedContext = inject(floatingActionButtonMenuKey)
if (!injectedContext)
  throw new Error('FloatingActionButtonMenuItem must be used inside FloatingActionButtonMenu.')
const context = injectedContext
const element = ref<HTMLElement | null>(null)
const item = {
  element,
  disabled: toRef(props, 'disabled'),
  value: toRef(props, 'value'),
  label: toRef(props, 'label'),
}
let unregister: (() => void) | undefined
onMounted(() => {
  unregister = context.register(item)
})
onBeforeUnmount(() => unregister?.())

const isLink = computed(() => props.href !== undefined && !props.disabled)
const index = computed(() => context.items.value.indexOf(item))
const itemStyle = computed(() => ({
  '--item-index': index.value,
  '--item-count': context.items.value.length,
  transitionDelay: context.expanded.value
    ? context.openingSide.value === 'down'
      ? `${index.value * 35}ms`
      : `${(context.items.value.length - index.value - 1) * 35}ms`
    : context.openingSide.value === 'down'
      ? `${(context.items.value.length - index.value - 1) * 25}ms`
      : `${index.value * 25}ms`,
}))
function onClick(event: MouseEvent) {
  emit('click', event)
  context.select(item, event)
}
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    ref="element"
    v-ripple
    v-bind="$attrs"
    class="yam3x-floating-action-button-menu-item yam3x-state-layer"
    :class="{
      'yam3x-floating-action-button-menu-item--selected':
        selected && context.presentation.value === 'web-menu',
    }"
    role="menuitem"
    :data-fab-menu-value="value"
    :data-fab-menu-index="index"
    :tabindex="index === context.activeIndex.value && !disabled ? 0 : -1"
    :style="itemStyle"
    :href="isLink ? href : undefined"
    :target="isLink ? target : undefined"
    :rel="isLink ? rel : undefined"
    :download="isLink ? download : undefined"
    :type="isLink ? undefined : 'button'"
    :disabled="(!isLink && disabled) || undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    @click="onClick"
  >
    <slot name="icon" />
    <slot>{{ label }}</slot>
  </component>
</template>

<style>
.yam3x-floating-action-button-menu-item {
  position: relative;
  isolation: isolate;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-start;
  gap: var(--_yam3x-fab-menu-item-spacing);
  box-sizing: border-box;
  min-width: 56px;
  min-height: var(--_yam3x-fab-menu-item-height);
  max-width: 100%;
  padding-block: var(--_yam3x-fab-menu-item-top-space) var(--_yam3x-fab-menu-item-bottom-space);
  padding-inline: var(--_yam3x-fab-menu-item-leading-space)
    var(--_yam3x-fab-menu-item-trailing-space);
  overflow: hidden;
  border: 0;
  border-radius: var(--_yam3x-fab-menu-item-shape);
  background: var(--_yam3x-fab-menu-item-container);
  color: var(--_yam3x-fab-menu-item-color);
  font-family: var(--_yam3x-fab-menu-item-font-family);
  font-size: var(--_yam3x-fab-menu-item-font-size);
  font-weight: var(--_yam3x-fab-menu-item-font-weight);
  line-height: var(--_yam3x-fab-menu-item-line-height);
  letter-spacing: var(--_yam3x-fab-menu-item-tracking);
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-state-color);
  --yam3x-ripple-color: var(--_yam3x-fab-menu-item-ripple-color);
  opacity: 0;
  transform: scaleX(0);
  transform-origin: right center;
  transition:
    opacity var(--_yam3x-fab-menu-motion-effects),
    transform var(--_yam3x-fab-menu-motion-spatial);
}
.yam3x-floating-action-button-menu__panel--open .yam3x-floating-action-button-menu-item {
  opacity: 1;
  transform: scaleX(1);
}
.yam3x-floating-action-button-menu__panel--start .yam3x-floating-action-button-menu-item {
  transform-origin: left center;
}
.yam3x-floating-action-button-menu__panel--center .yam3x-floating-action-button-menu-item {
  transform-origin: center center;
}
.yam3x-floating-action-button-menu__panel--web-menu .yam3x-floating-action-button-menu-item {
  inline-size: 100%;
  min-height: var(--_yam3x-fab-menu-item-height);
  padding-block: var(--_yam3x-fab-menu-item-top-space) var(--_yam3x-fab-menu-item-bottom-space);
  padding-inline: var(--_yam3x-fab-menu-item-leading-space)
    var(--_yam3x-fab-menu-item-trailing-space);
  border-radius: var(--_yam3x-fab-menu-item-shape);
  background: transparent;
  color: var(--_yam3x-fab-menu-item-color);
  font-family: var(--_yam3x-fab-menu-item-font-family);
  font-size: var(--_yam3x-fab-menu-item-font-size);
  font-weight: var(--_yam3x-fab-menu-item-font-weight);
  line-height: var(--_yam3x-fab-menu-item-line-height);
  letter-spacing: var(--_yam3x-fab-menu-item-tracking);
  transform-origin: center;
}
.yam3x-floating-action-button-menu__panel--web-menu
  .yam3x-floating-action-button-menu-item--selected {
  background: var(--_yam3x-fab-menu-item-selected-container);
}
.yam3x-floating-action-button-menu-item:hover:not(:disabled):not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-hover);
}
.yam3x-floating-action-button-menu-item:focus-visible:not(:disabled):not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-focus);
}
.yam3x-floating-action-button-menu-item:active:not(:disabled):not([aria-disabled='true']) {
  --yam3x-state-layer-color: var(--_yam3x-fab-menu-item-state-color);
}
.yam3x-floating-action-button-menu-item:focus-visible {
  outline: 3px solid var(--_yam3x-fab-menu-focus-ring);
  outline-offset: 2px;
}
.yam3x-floating-action-button-menu-item:disabled,
.yam3x-floating-action-button-menu-item[aria-disabled='true'] {
  background: color-mix(
    in srgb,
    var(--_yam3x-fab-menu-item-disabled-container)
      var(--_yam3x-fab-menu-item-disabled-container-opacity),
    transparent
  );
  color: color-mix(
    in srgb,
    var(--_yam3x-fab-menu-item-disabled-color) var(--_yam3x-fab-menu-item-disabled-opacity),
    transparent
  );
  cursor: default;
}
.yam3x-floating-action-button-menu-item > .yam3x-icon,
.yam3x-floating-action-button-menu-item > svg,
.yam3x-floating-action-button-menu-item > :first-child:not(.yam3x-fab-menu__item-label) {
  flex: none;
  width: var(--_yam3x-fab-menu-item-icon-size);
  height: var(--_yam3x-fab-menu-item-icon-size);
  font-size: var(--_yam3x-fab-menu-item-icon-size);
}
.yam3x-floating-action-button-menu__panel--web-menu
  .yam3x-floating-action-button-menu-item
  > .yam3x-icon,
.yam3x-floating-action-button-menu__panel--web-menu .yam3x-floating-action-button-menu-item > svg,
.yam3x-floating-action-button-menu__panel--web-menu
  .yam3x-floating-action-button-menu-item
  > :first-child:not(.yam3x-fab-menu__item-label) {
  color: var(--_yam3x-fab-menu-item-icon-color);
}
</style>
