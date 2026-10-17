<script setup lang="ts">
import { computed, inject, useId, useSlots } from 'vue'
import { navigationDrawerContextKey } from './navigation-drawer.context'

defineOptions({ name: 'NavigationDrawerSection' })
const props = defineProps<{ label?: string }>()
defineSlots<{ default?(): unknown; label?(): unknown }>()
const slots = useSlots()
const menu = inject(navigationDrawerContextKey)
if (!menu) throw new Error('NavigationDrawerSection must be used inside NavigationDrawer.')
const id = `yam3x-navigation-drawer-group-${useId()}`
const hasLabel = computed(() => Boolean(props.label || slots.label))
</script>

<template>
  <li
    class="yam3x-navigation-drawer__group"
    role="group"
    :aria-labelledby="hasLabel ? id : undefined"
  >
    <div
      v-if="hasLabel"
      :id="id"
      class="yam3x-navigation-drawer__group-label"
    >
      <slot name="label">{{ props.label }}</slot>
    </div>
    <ul class="yam3x-navigation-drawer__group-list">
      <slot />
    </ul>
  </li>
</template>
