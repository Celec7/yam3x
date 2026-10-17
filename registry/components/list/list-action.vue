<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue'
import ListItemLayout from './list-item-layout.vue'
import { actionListKey, listVariantKey, type ListVariant } from './list.types'
import { vRipple } from '../_shared/ripple'
import './list.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    dragged?: boolean
    href?: string
    target?: string
    rel?: string
    download?: string | boolean
    type?: 'button' | 'submit' | 'reset'
    leadingType?: 'custom' | 'icon' | 'avatar' | 'image' | 'video' | 'control'
    lines?: 'auto' | 'one' | 'two' | 'three'
  }>(),
  {
    disabled: false,
    dragged: false,
    href: undefined,
    target: undefined,
    rel: undefined,
    download: undefined,
    type: 'button',
    leadingType: 'custom',
    lines: 'auto',
  },
)
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()
const slots = useSlots()
const variantContext = inject(listVariantKey, { variant: computed((): ListVariant => 'standard') })
const actionContext = inject(actionListKey, null)
const actionRegion = ref<HTMLElement | null>(null)
const controls = ref<HTMLElement[]>([])
let actionObserver: MutationObserver | null = null
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
const tabIndex = computed(() => (actionContext || props.disabled ? -1 : 0))
const tag = computed(() => (props.href ? 'a' : 'button'))

function onClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
function syncControls(): void {
  const nextControls = [
    ...(actionRegion.value?.querySelectorAll<HTMLElement>(
      'button, a[href], input:not([type="hidden"]), [role="button"], [tabindex]',
    ) ?? []),
  ]
  const unchanged =
    nextControls.length === controls.value.length &&
    nextControls.every((control, index) => control === controls.value[index])
  if (!unchanged) controls.value = nextControls
  controls.value.forEach((control) => {
    if (actionContext) {
      control.dataset.yam3xActionControl = ''
      control.tabIndex = -1
    } else {
      delete control.dataset.yam3xActionControl
    }
  })
}

onMounted(() => {
  syncControls()
  if (actionRegion.value && typeof MutationObserver !== 'undefined') {
    actionObserver = new MutationObserver(syncControls)
    actionObserver.observe(actionRegion.value, { subtree: true, childList: true })
  }
})
onUpdated(syncControls)
onBeforeUnmount(() => actionObserver?.disconnect())
</script>

<template>
  <li
    class="yam3x-list-item yam3x-list-action"
    :data-lines="renderedLines"
    :data-yam3x-dragged="dragged || undefined"
  >
    <component
      :is="tag"
      v-bind="attrs"
      v-ripple
      class="yam3x-list-item__surface yam3x-list-action__primary yam3x-state-layer"
      :class="[
        `yam3x-list--${variantContext.variant.value}`,
        { 'yam3x-list-item--disabled': disabled },
      ]"
      :data-yam3x-list-action="''"
      :data-yam3x-ripple="''"
      :data-variant="variantContext.variant.value"
      :data-lines="renderedLines"
      :href="href"
      :target="target"
      :rel="rel"
      :download="download === true ? '' : download"
      :type="tag === 'button' ? type : undefined"
      :disabled="tag === 'button' ? disabled : undefined"
      :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
      :tabindex="tabIndex"
      @click="onClick"
    >
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
    </component>
    <div
      v-if="$slots.actions"
      ref="actionRegion"
      class="yam3x-list-action__actions"
    >
      <slot name="actions" />
    </div>
  </li>
</template>
