<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import { segmentedButtonGroupKey, type SegmentedButtonItemRecord } from './segmented-button.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{ value: string; disabled?: boolean }>(), {
  disabled: false,
})
defineSlots<{
  default?(): unknown
  icon?(props: { selected: boolean }): unknown
}>()

const attrs = useAttrs()
const context = inject(segmentedButtonGroupKey)
if (!context) throw new Error('SegmentedButton must be used inside a segmented button row.')
const button = ref<HTMLButtonElement | null>(null)
const registered = ref(false)
let unregister: (() => void) | undefined
const selected = computed(() => context.isSelected(props.value))
const disabled = computed(() => props.disabled || context.disabled.value)
const record = computed<SegmentedButtonItemRecord | null>(() =>
  button.value ? { value: props.value, element: button.value, disabled: props.disabled } : null,
)

watch(record, (item) => {
  if (registered.value && item) context.updateItem(item)
})

onMounted(() => {
  if (record.value) {
    unregister = context.registerItem(record.value)
    registered.value = true
  }
})

onBeforeUnmount(() => unregister?.())
</script>

<template>
  <button
    v-bind="attrs"
    ref="button"
    v-ripple
    class="yam3x-segmented-button__segment yam3x-state-layer"
    :class="{
      'yam3x-segmented-button__segment--selected': selected,
      'yam3x-segmented-button__segment--disabled': disabled,
      'yam3x-segmented-button__segment--with-icon': Boolean($slots.icon) || selected,
    }"
    type="button"
    :data-segmented-button="value"
    :data-yam3x-ripple="''"
    data-yam3x-ripple-target=".yam3x-segmented-button__surface"
    data-yam3x-ripple-container-target=".yam3x-segmented-button__surface"
    :disabled="disabled"
    :role="context.mode === 'multiple' ? 'checkbox' : 'radio'"
    :aria-checked="selected"
    :tabindex="context.tabIndex(value)"
    @click="context.select(value)"
  >
    <span
      class="yam3x-segmented-button__surface"
      aria-hidden="true"
    />
    <span class="yam3x-segmented-button__content">
      <span
        v-if="$slots.icon"
        class="yam3x-segmented-button__icon"
        aria-hidden="true"
      >
        <slot
          name="icon"
          :selected="selected"
        />
      </span>
      <span
        v-else-if="selected"
        class="yam3x-segmented-button__icon yam3x-segmented-button__check"
        aria-hidden="true"
      >
        <Icon name="check" />
      </span>
      <span class="yam3x-segmented-button__label"><slot /></span>
    </span>
  </button>
</template>
