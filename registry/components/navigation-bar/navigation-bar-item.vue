<script setup lang="ts">
import { computed, inject } from 'vue'
import type { NavigationBarDestination } from './navigation-bar.types'
import { navigationBarContextKey } from './navigation-bar.types'
import { vRipple } from '../_shared/ripple'

const props = withDefaults(defineProps<NavigationBarDestination>(), {
  disabled: false,
  disabledInteractive: false,
})

defineSlots<{
  icon?(props: { selected: boolean }): unknown
  'selected-icon'?(): unknown
  badge?(props: { selected: boolean }): unknown
}>()

const context = inject(navigationBarContextKey)

if (!context) {
  throw new Error('NavigationBarItem must be used inside NavigationBar.')
}

const selected = computed(() => context.modelValue.value === props.value)
const isDisabled = computed(() => props.disabled || props.disabledInteractive)

function onKeydown(event: KeyboardEvent) {
  if (event.key !== ' ' || event.repeat) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).dataset.m3SpacePressed = 'true'
}

function onKeyup(event: KeyboardEvent) {
  if (event.key !== ' ') return
  const target = event.currentTarget as HTMLElement
  const wasPressed = target.dataset.m3SpacePressed === 'true'
  delete target.dataset.m3SpacePressed
  event.preventDefault()
  if (!wasPressed || isDisabled.value) return
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
}

function clearSpacePress(event: FocusEvent) {
  delete (event.currentTarget as HTMLElement).dataset.m3SpacePressed
}

function activate(event: MouseEvent) {
  context!.activate(
    {
      value: props.value,
      label: props.label,
      href: props.href,
      ariaLabel: props.ariaLabel,
      disabled: props.disabled,
      disabledInteractive: props.disabledInteractive,
      target: props.target,
      rel: props.rel,
      download: props.download,
    },
    event,
  )
}
</script>

<template>
  <a
    v-ripple
    class="yam3x-navigation-bar__item yam3x-state-layer"
    data-yam3x-ripple-target=".yam3x-ripple-container"
    :href="isDisabled ? undefined : href"
    :target="isDisabled ? undefined : target"
    :rel="isDisabled ? undefined : rel"
    :download="isDisabled ? undefined : download"
    :role="isDisabled ? 'link' : undefined"
    :aria-current="selected ? 'page' : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-label="ariaLabel"
    :tabindex="disabledInteractive ? 0 : disabled ? -1 : undefined"
    :style="{
      '--yam3x-state-layer-color': selected
        ? 'var(--_yam3x-navigation-bar-active-state-layer-color)'
        : 'var(--_yam3x-navigation-bar-inactive-state-layer-color)',
    }"
    @click="activate"
    @keydown="onKeydown"
    @keyup="onKeyup"
    @blur="clearSpacePress"
  >
    <span
      class="yam3x-navigation-bar__indicator"
      aria-hidden="true"
    />
    <span class="yam3x-navigation-bar__graphic">
      <span
        class="yam3x-navigation-bar__icon"
        aria-hidden="true"
      >
        <slot
          v-if="selected && $slots['selected-icon']"
          name="selected-icon"
        />
        <slot
          v-else
          name="icon"
          :selected="selected"
        />
      </span>
      <span
        v-if="$slots.badge"
        class="yam3x-navigation-bar__badge"
      >
        <slot
          name="badge"
          :selected="selected"
        />
      </span>
    </span>
    <span class="yam3x-navigation-bar__label">{{ label }}</span>
  </a>
</template>
