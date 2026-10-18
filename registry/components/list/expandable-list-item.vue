<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
} from 'vue'
import ListItemLayout from './list-item-layout.vue'
import Icon from '../icon/icon.vue'
import { actionListKey, listVariantKey, type ListVariant } from './list.types'
import { vRipple } from '../_shared/ripple'
import './list.css'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    locale?: string
    disabled?: boolean
    dragged?: boolean
    current?: boolean
    leadingType?: 'custom' | 'icon' | 'avatar' | 'image' | 'video' | 'control'
    lines?: 'auto' | 'one' | 'two' | 'three'
    presentation?: 'inline' | 'fullScreen'
    closeLabel?: string
    fullScreenTitle?: string
  }>(),
  {
    disabled: false,
    dragged: false,
    current: false,
    leadingType: 'custom',
    lines: 'auto',
    presentation: 'inline',
    closeLabel: undefined,
    fullScreenTitle: '',
  },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  beforetoggle: [event: Event]
  opening: [event: Event]
  opened: [event: Event]
  closing: [event: Event]
  closed: [event: Event]
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ back: props.closeLabel }),
)

const attrs = useAttrs()
const id = useId()
const generatedContentId = `yam3x-expandable-list-${id}`
const headerId = `yam3x-expandable-list-header-${id}`
const contentId = computed(() => `${attrs.id ? String(attrs.id) : generatedContentId}-content`)
const header = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const root = ref<HTMLLIElement | null>(null)
const actionContext = inject(actionListKey, null)
const variantContext = inject(listVariantKey, { variant: computed((): ListVariant => 'standard') })
const slots = useSlots()
const transitioning = ref(false)
let transitionTimer: ReturnType<typeof setTimeout> | undefined
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

function dispatch(type: 'opening' | 'opened' | 'closing' | 'closed'): void {
  const event = new Event(type, { bubbles: true })
  root.value?.dispatchEvent(event)
  if (type === 'opening') emit('opening', event)
  else if (type === 'opened') emit('opened', event)
  else if (type === 'closing') emit('closing', event)
  else emit('closed', event)
}
function setOpen(next: boolean): void {
  if (props.disabled || next === open.value) return
  const before = new Event('beforetoggle', { bubbles: true, cancelable: true })
  root.value?.dispatchEvent(before)
  emit('beforetoggle', before)
  if (before.defaultPrevented) return
  open.value = next
}
function onKeydown(event: KeyboardEvent): void {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
    header.value?.focus({ preventScroll: true })
    return
  }
  if (event.key !== 'Tab' || props.presentation !== 'fullScreen' || !panel.value) return
  const focusable = [
    ...panel.value.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length > 0)
  const first = focusable[0]
  const last = focusable.at(-1)
  if (!first || !last) {
    event.preventDefault()
    panel.value.focus()
    return
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
watch(
  open,
  async (next, previous) => {
    if (previous === next) return
    clearTimeout(transitionTimer)
    transitioning.value = true
    dispatch(next ? 'opening' : 'closing')
    if (!next && root.value?.querySelector('.yam3x-expandable-list-item__panel :focus'))
      header.value?.focus({ preventScroll: true })
    await nextTick()
    if (next && props.presentation === 'fullScreen') {
      panel.value
        ?.querySelector<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
        )
        ?.focus({ preventScroll: true })
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const motionDuration = reduceMotion
      ? 0
      : Number.parseFloat(
          getComputedStyle(root.value ?? document.documentElement).getPropertyValue(
            '--_yam3x-list-expandable-item-expand-duration',
          ),
        )
    transitionTimer = setTimeout(
      () => {
        dispatch(next ? 'opened' : 'closed')
        transitioning.value = false
      },
      Number.isFinite(motionDuration) ? motionDuration : 300,
    )
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  clearTimeout(transitionTimer)
})
</script>

<template>
  <li
    ref="root"
    v-bind="attrs"
    class="yam3x-list-item yam3x-expandable-list-item"
    :class="[
      `yam3x-list--${variantContext.variant.value}`,
      { 'yam3x-list-item--disabled': disabled },
    ]"
    :data-variant="variantContext.variant.value"
    :data-open="String(open)"
    :data-lines="renderedLines"
    :data-transitioning="String(transitioning)"
    :data-yam3x-dragged="dragged || undefined"
    @keydown="onKeydown"
  >
    <button
      :id="headerId"
      ref="header"
      v-ripple
      type="button"
      class="yam3x-list-item__surface yam3x-state-layer yam3x-expandable-list-item__header"
      :class="[
        `yam3x-list--${variantContext.variant.value}`,
        { 'yam3x-list-item--disabled': disabled },
      ]"
      :data-yam3x-expand-toggle="''"
      :data-yam3x-ripple="''"
      :data-variant="variantContext.variant.value"
      :data-lines="renderedLines"
      :disabled="disabled"
      :tabindex="tabIndex"
      :aria-expanded="open"
      :aria-controls="contentId"
      :aria-current="current ? 'page' : undefined"
      @click="setOpen(!open)"
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
        <template #trailing>
          <span
            class="yam3x-expandable-list-item__toggle"
            aria-hidden="true"
          >
            <slot name="toggle-icon">
              <Icon name="expand_more" />
            </slot>
          </span>
        </template>
      </ListItemLayout>
    </button>
    <div
      :id="contentId"
      ref="panel"
      class="yam3x-expandable-list-item__panel"
      :data-open="String(open)"
      :data-variant="variantContext.variant.value"
      :role="presentation === 'fullScreen' ? 'dialog' : 'list'"
      :aria-modal="presentation === 'fullScreen' && open ? 'true' : undefined"
      :aria-labelledby="presentation === 'fullScreen' ? `${headerId}-dialog-title` : headerId"
      :aria-hidden="!open"
      :inert="!open"
      :tabindex="presentation === 'fullScreen' ? -1 : undefined"
    >
      <div
        v-if="presentation === 'fullScreen'"
        class="yam3x-expandable-list-item__full-screen-header"
      >
        <button
          type="button"
          class="yam3x-expandable-list-item__back"
          :aria-label="actionMessages.back"
          @click="setOpen(false)"
        >
          <Icon name="arrow_back" /><span>{{ actionMessages.back }}</span>
        </button>
        <span
          :id="`${headerId}-dialog-title`"
          class="yam3x-expandable-list-item__full-screen-title"
          ><slot name="full-screen-title">{{
            fullScreenTitle || String(attrs['aria-label'] || '')
          }}</slot></span
        >
      </div>
      <div
        class="yam3x-expandable-list-item__clip"
        :data-variant="variantContext.variant.value"
      >
        <div role="list"><slot name="items" /></div>
      </div>
    </div>
  </li>
</template>
