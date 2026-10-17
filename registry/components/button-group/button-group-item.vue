<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, useAttrs } from 'vue'
import { buttonGroupKey, type ButtonGroupItemRecord } from './button-group.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    disabled?: boolean
    weight?: number
    animateWidth?: boolean
  }>(),
  {
    label: undefined,
    disabled: false,
    weight: 0,
    animateWidth: true,
  },
)
const emit = defineEmits<{ activate: [event: MouseEvent] }>()
defineSlots<{ default?(): unknown }>()

const attrs = useAttrs()
const context = inject(buttonGroupKey)
if (!context) throw new Error('ButtonGroupItem must be used inside ButtonGroup.')
const groupContext = context

const element = ref<HTMLElement | null>(null)
const record = computed<ButtonGroupItemRecord | null>(() => {
  if (!element.value) return null
  return {
    value: props.value,
    label: props.label,
    disabled: props.disabled,
    weight: Math.max(0, props.weight),
    animateWidth: props.animateWidth,
    element: element.value,
  }
})
let unregister: (() => void) | undefined

function onClick(event: MouseEvent): void {
  const current = record.value
  if (!current || current.disabled || event.defaultPrevented) return
  emit('activate', event)
  groupContext.activateItem(current, 'button', event)
}

function onClickCapture(event: MouseEvent): void {
  if (!props.disabled) return
  event.preventDefault()
  event.stopImmediatePropagation()
}

watch(record, (current) => {
  if (current && unregister) groupContext.updateItem(current)
})

onMounted(() => {
  if (record.value) unregister = groupContext.registerItem(record.value)
})

onBeforeUnmount(() => unregister?.())
</script>

<template>
  <div
    v-bind="attrs"
    ref="element"
    class="yam3x-button-group__item"
    :data-group-value="value"
    :data-disabled="disabled ? '' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :inert="disabled"
    :style="{ '--_yam3x-button-group-item-weight': Math.max(0, weight) }"
    @click.capture="onClickCapture"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<style scoped>
.yam3x-button-group__item {
  position: relative;
  display: inline-flex;
  flex: var(--_yam3x-button-group-item-weight, 0) 1 auto;
  min-width: 0;
  align-items: center;
  transition:
    width var(--_yam3x-button-group-press-duration) var(--_yam3x-button-group-press-spring),
    flex-basis var(--_yam3x-button-group-press-duration) var(--_yam3x-button-group-press-spring);
}

.yam3x-button-group__item :deep(.yam3x-button),
.yam3x-button-group__item :deep(.yam3x-icon-button) {
  width: 100%;
  min-width: 0;
}
</style>
