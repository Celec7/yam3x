<script setup lang="ts">
import { computed } from 'vue'
import { vRipple } from '../_shared/ripple'
import type { NavigationRailItem } from './navigation-rail.types'

const props = defineProps<{
  item: NavigationRailItem
  current: boolean
  labelId?: string
  badgeId: string
  parentValue?: string
  child?: boolean
}>()

const disabled = computed(() => !!(props.item.disabled || props.item.disabledInteractive))
const badge = computed(() => {
  const value = props.item.badge
  if (value === undefined) return ''
  const text = String(value)
  if (text.length <= 4) return text
  return /^\d+$/.test(text) ? '999+' : `${text.slice(0, 3)}+`
})
</script>

<template>
  <a
    v-ripple
    class="yam3x-navigation-rail__item"
    :class="{ 'yam3x-navigation-rail__item--child': child }"
    data-yam3x-ripple
    data-yam3x-ripple-target=".yam3x-navigation-rail__indicator"
    data-yam3x-ripple-container-target=".yam3x-navigation-rail__indicator"
    :data-value="item.value"
    :data-parent-value="parentValue"
    :href="disabled ? undefined : item.href"
    :target="disabled ? undefined : item.target"
    :rel="disabled ? undefined : item.rel"
    :download="disabled ? undefined : item.download"
    :role="disabled ? 'link' : undefined"
    :aria-current="current ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :aria-label="item.ariaLabel"
    :aria-describedby="item.badgeLabel ? badgeId : undefined"
    :tabindex="item.disabledInteractive ? 0 : item.disabled ? -1 : undefined"
    @blur="delete ($event.currentTarget as HTMLElement).dataset.m3SpacePressed"
  >
    <span class="yam3x-navigation-rail__content">
      <span
        class="yam3x-navigation-rail__indicator"
        aria-hidden="true"
      />
      <span
        v-if="$slots.icon"
        class="yam3x-navigation-rail__icon"
        aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span
        :id="labelId"
        class="yam3x-navigation-rail__label"
        >{{ item.label }}</span
      >
      <span
        v-if="item.badge !== undefined || $slots.badge"
        class="yam3x-navigation-rail__badge"
        aria-hidden="true"
        ><slot
          name="badge"
          :text="badge"
          >{{ badge }}</slot
        ></span
      >
    </span>
    <span
      v-if="item.badgeLabel"
      :id="badgeId"
      class="yam3x-navigation-rail__sr-only"
      >{{ item.badgeLabel }}</span
    >
  </a>
</template>
