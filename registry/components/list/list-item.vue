<script setup lang="ts">
import { computed, inject, ref, useAttrs, useSlots, watch } from 'vue'
import ListItemLayout from './list-item-layout.vue'
import { listVariantKey, type ListVariant } from './list.types'
import './list.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    dragged?: boolean
    leadingType?: 'custom' | 'icon' | 'avatar' | 'image' | 'video' | 'control'
    lines?: 'auto' | 'one' | 'two' | 'three'
  }>(),
  { disabled: false, dragged: false, leadingType: 'custom', lines: 'auto' },
)
const attrs = useAttrs()
const variantContext = inject(listVariantKey, { variant: computed((): ListVariant => 'standard') })
const slotPresence = useSlots()
const hasSupporting = computed(() => slotPresence.supporting || slotPresence['supporting-text'])
const lines = computed(() =>
  props.lines === 'auto'
    ? slotPresence.overline && hasSupporting.value
      ? 'three'
      : slotPresence.overline || hasSupporting.value
        ? 'two'
        : 'one'
    : props.lines,
)
const renderedLines = ref(lines.value)
watch(lines, (value) => {
  renderedLines.value = value
})
function updateRenderedLines(value: 'one' | 'two' | 'three'): void {
  if (props.lines === 'auto') renderedLines.value = value
}
</script>

<template>
  <li
    v-bind="attrs"
    class="yam3x-list-item"
    :class="[
      'yam3x-list--' + variantContext.variant.value,
      { 'yam3x-list-item--disabled': disabled },
    ]"
    :data-variant="variantContext.variant.value"
    :data-lines="renderedLines"
    :data-yam3x-dragged="dragged || undefined"
  >
    <div class="yam3x-list-item__surface">
      <ListItemLayout
        :leading-type="leadingType"
        :lines="props.lines"
        :disabled="disabled"
        @linecountchange="updateRenderedLines"
      >
        <template
          v-if="$slots.leading"
          #leading
          ><slot name="leading"
        /></template>
        <template
          v-if="$slots.overline"
          #overline
          ><slot name="overline"
        /></template>
        <slot />
        <template
          v-if="$slots.supporting || $slots['supporting-text']"
          #supporting
        >
          <slot name="supporting-text"><slot name="supporting" /></slot>
        </template>
        <template
          v-if="$slots['trailing-text']"
          #trailing-text
          ><slot name="trailing-text"
        /></template>
        <template
          v-if="$slots.trailing"
          #trailing
          ><slot name="trailing"
        /></template>
      </ListItemLayout>
    </div>
  </li>
</template>
