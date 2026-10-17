<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue'
import ListItemLayout from './list-item-layout.vue'
import Icon from '../icon/icon.vue'
import { listVariantKey, selectionListKey, type ListVariant } from './list.types'
import { vRipple } from '../_shared/ripple'
import './list.css'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    value: string
    disabled?: boolean
    dragged?: boolean
    leadingType?: 'custom' | 'icon' | 'avatar' | 'image' | 'video' | 'control'
    lines?: 'auto' | 'one' | 'two' | 'three'
  }>(),
  { disabled: false, dragged: false, leadingType: 'custom', lines: 'auto' },
)
const attrs = useAttrs()
const context = inject(selectionListKey)!
if (!context) throw new Error('ListOption must be used inside SelectionList.')
const slots = useSlots()
const variantContext = inject(listVariantKey, { variant: computed((): ListVariant => 'standard') })
const element = ref<HTMLLIElement | null>(null)
const id = useId()
const selected = computed(() => context.isSelected(props.value))
const disabled = computed(() => context.disabled.value || props.disabled)
const tabIndex = computed(() =>
  !disabled.value && context.activeValue.value === props.value ? 0 : -1,
)
const unregister = ref<(() => void) | null>(null)
const lines = computed(() =>
  props.lines === 'auto'
    ? slots.overline && (slots.supporting || slots['supporting-text'])
      ? 'three'
      : slots.overline || slots.supporting || slots['supporting-text']
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

function syncRecord(): void {
  unregister.value?.()
  if (!element.value) return
  unregister.value = context.registerOption({
    value: props.value,
    disabled: disabled.value,
    element: element.value,
  })
}
function onClick(): void {
  if (disabled.value) return
  context.selectOption(props.value)
  context.focusOption(props.value)
}
function onFocus(): void {
  context.focusOption(props.value)
}

watch([() => props.value, disabled], syncRecord)
onMounted(syncRecord)
onBeforeUnmount(() => unregister.value?.())
</script>

<template>
  <li
    v-bind="attrs"
    :id="attrs.id == null ? `yam3x-list-option-${id}` : String(attrs.id)"
    ref="element"
    v-ripple
    class="yam3x-list-item yam3x-list-option yam3x-list-item__surface yam3x-state-layer"
    :class="[
      `yam3x-list--${variantContext.variant.value}`,
      { 'yam3x-list-item--disabled': disabled },
    ]"
    :data-variant="variantContext.variant.value"
    :data-yam3x-list-option="''"
    :data-yam3x-dragged="dragged || undefined"
    :data-list-value="value"
    :data-lines="renderedLines"
    :data-yam3x-ripple="''"
    :data-yam3x-ripple-role="context.mode.value === 'multiple' ? 'checkbox' : 'radio'"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="tabIndex"
    role="option"
    @click="onClick"
    @focus="onFocus"
  >
    <ListItemLayout
      :leading-type="leadingType"
      :lines="props.lines"
      :selected="selected"
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
    <span
      class="yam3x-list-option__indicator"
      aria-hidden="true"
    >
      <slot name="indicator">
        <Icon
          :name="
            context.mode.value === 'multiple'
              ? selected
                ? 'check_box'
                : 'check_box_outline_blank'
              : selected
                ? 'radio_button_checked'
                : 'radio_button_unchecked'
          "
        />
      </slot>
    </span>
    <input
      v-if="context.name.value"
      type="hidden"
      :name="context.name.value"
      :form="context.form.value"
      :value="value"
      :disabled="!selected || disabled"
      aria-hidden="true"
      tabindex="-1"
    />
  </li>
</template>
