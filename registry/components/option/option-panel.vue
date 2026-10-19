<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import type { OptionToggleDetail } from './option.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    role?: 'listbox' | 'dialog'
    locale?: string
    id?: string
    anchor?: HTMLElement | null
    label?: string
    labelledby?: string
    multiple?: boolean
    fitAnchorWidth?: boolean
    anchorOffset?: number
    scrollStrategy?: 'reposition' | 'hide'
    loading?: boolean
    empty?: boolean
    teleport?: boolean
    loadingText?: string
    noDataText?: string
    panelClass?: string
  }>(),
  {
    role: 'listbox',
    id: '',
    anchor: null,
    label: '',
    labelledby: '',
    multiple: false,
    fitAnchorWidth: true,
    anchorOffset: 4,
    scrollStrategy: 'reposition',
    loading: false,
    empty: false,
    teleport: false,
    loadingText: undefined,
    noDataText: undefined,
    panelClass: '',
  },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  beforetoggle: [event: CustomEvent<OptionToggleDetail>]
  toggle: [detail: OptionToggleDetail]
  open: []
  close: []
}>()
defineSlots<{
  default?(): unknown
  loading?(): unknown
  'no-data'?(): unknown
}>()
const { messages } = useComponentLocale(
  'optionPanel',
  () => props.locale,
  () => ({ loading: props.loadingText, noData: props.noDataText }),
)
const panel = ref<HTMLElement | null>(null)
const positioned = ref(false)
const generatedId = useId()
const panelId = computed(() => props.id || `yam3x-option-panel-${generatedId}`)
const floatingStyle = ref<Record<string, string>>({ visibility: 'hidden' })
let stopPositioning: (() => void) | undefined
let positionRevision = 0
let inheritedTokensAnchor: HTMLElement | null = null

function requestOpen(value: boolean, source: OptionToggleDetail['source'] = 'programmatic') {
  if (open.value === value) return
  const event = new CustomEvent<OptionToggleDetail>('beforetoggle', {
    bubbles: true,
    cancelable: true,
    detail: { open: value, source },
  })
  emit('beforetoggle', event)
  panel.value?.dispatchEvent(event)
  if (event.defaultPrevented) return
  open.value = value
  const detail = { open: value, source }
  emit('toggle', detail)
  if (value) emit('open')
  else emit('close')
}

async function updatePosition() {
  const anchor = props.anchor
  if (!anchor || !panel.value || !open.value) return
  const revision = ++positionRevision
  if (props.teleport && inheritedTokensAnchor !== anchor) {
    const inheritedStyle = getComputedStyle(anchor)
    const inheritedTokens: Record<string, string> = { direction: inheritedStyle.direction }
    for (let index = 0; index < inheritedStyle.length; index += 1) {
      const property = inheritedStyle.item(index)
      if (!property.startsWith('--')) continue
      const value = inheritedStyle.getPropertyValue(property).trim()
      if (value) inheritedTokens[property] = value
    }
    floatingStyle.value = { ...floatingStyle.value, ...inheritedTokens }
    inheritedTokensAnchor = anchor
    await nextTick()
  }
  if (!open.value || !panel.value) return
  const { x, y } = await computePosition(anchor, panel.value, {
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(props.anchorOffset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, rects, elements }) {
          const measure = (
            property: 'inlineSize' | 'blockSize',
            value: string,
            fallback: number,
          ) => {
            const probe = document.createElement('span')
            probe.style.cssText =
              'position:fixed;visibility:hidden;box-sizing:border-box;padding:0;border:0;'
            probe.style[property] = value || `${fallback}px`
            elements.floating.append(probe)
            const result =
              property === 'inlineSize'
                ? probe.getBoundingClientRect().width
                : probe.getBoundingClientRect().height
            probe.remove()
            return result > 0 ? result : fallback
          }
          const style = getComputedStyle(elements.floating)
          const maxWidth = Math.min(
            measure(
              'inlineSize',
              style.getPropertyValue('--_yam3x-option-panel-container-max-width'),
              280,
            ),
            availableWidth,
          )
          const minWidth = Math.min(
            measure(
              'inlineSize',
              style.getPropertyValue('--_yam3x-option-panel-container-min-width'),
              112,
            ),
            maxWidth,
          )
          const maxHeight = Math.min(
            measure(
              'blockSize',
              style.getPropertyValue('--_yam3x-option-panel-container-max-height'),
              280,
            ),
            availableHeight,
          )
          const desiredWidth = props.fitAnchorWidth
            ? rects.reference.width
            : Math.max(minWidth, elements.floating.scrollWidth)
          elements.floating.style.width = `${Math.min(maxWidth, Math.max(minWidth, desiredWidth))}px`
          elements.floating.style.minInlineSize = `${minWidth}px`
          elements.floating.style.maxInlineSize = `${maxWidth}px`
          elements.floating.style.maxHeight = `${Math.max(0, maxHeight)}px`
        },
      }),
    ],
  })
  if (!open.value || revision !== positionRevision) return
  positioned.value = true
  floatingStyle.value = {
    ...floatingStyle.value,
    left: `${x}px`,
    top: `${y}px`,
    visibility: 'visible',
  }
}

function onOutsidePointer(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Node)) return
  if (panel.value?.contains(target) || props.anchor?.contains(target)) return
  requestOpen(false, 'outside')
}
function onAnchorScroll() {
  if (props.scrollStrategy === 'hide') requestOpen(false, 'anchor-scroll')
}
function toggle() {
  requestOpen(!open.value)
}

watch(open, async (value) => {
  await nextTick()
  if (value && props.anchor && panel.value) {
    document.addEventListener('pointerdown', onOutsidePointer, true)
    if (props.scrollStrategy === 'hide') window.addEventListener('scroll', onAnchorScroll, true)
    stopPositioning = autoUpdate(props.anchor, panel.value, () => {
      void updatePosition()
    })
    void updatePosition()
  } else {
    positionRevision += 1
    inheritedTokensAnchor = null
    document.removeEventListener('pointerdown', onOutsidePointer, true)
    window.removeEventListener('scroll', onAnchorScroll, true)
    stopPositioning?.()
    stopPositioning = undefined
    positioned.value = false
    floatingStyle.value = { visibility: 'hidden' }
  }
})
watch(
  () => [props.anchor, props.fitAnchorWidth, props.anchorOffset, props.scrollStrategy],
  async () => {
    await nextTick()
    if (open.value) {
      stopPositioning?.()
      if (props.anchor && panel.value)
        stopPositioning = autoUpdate(props.anchor, panel.value, () => {
          void updatePosition()
        })
      void updatePosition()
    }
  },
)
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutsidePointer, true)
  window.removeEventListener('scroll', onAnchorScroll, true)
  stopPositioning?.()
})

defineExpose({
  open,
  close: () => requestOpen(false),
  hide: () => requestOpen(false),
  show: () => requestOpen(true),
  toggle,
  panel,
  positioned,
})
</script>

<template>
  <Teleport
    to="body"
    :disabled="!teleport"
  >
    <div
      v-bind="$attrs"
      :id="panelId"
      ref="panel"
      class="yam3x-option-panel"
      :class="panelClass"
      :style="floatingStyle"
      :role="role"
      tabindex="-1"
      :aria-label="label || undefined"
      :aria-labelledby="labelledby || undefined"
      :aria-multiselectable="role === 'listbox' && multiple ? 'true' : undefined"
      :aria-busy="loading ? 'true' : undefined"
      :hidden="!open"
    >
      <div
        v-if="loading"
        class="yam3x-option-panel__status"
        role="status"
      >
        <slot name="loading">{{ messages.loading }}</slot>
      </div>
      <div
        v-else-if="empty"
        class="yam3x-option-panel__status"
        role="status"
      >
        <slot name="no-data">{{ messages.noData }}</slot>
      </div>
      <slot v-else />
    </div>
  </Teleport>
</template>

<style>
.yam3x-option-panel {
  --_yam3x-option-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-option-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-option-panel-container-min-width: var(--yam3x-option-panel-container-min-width, 112px);
  --_yam3x-option-panel-container-max-width: var(--yam3x-option-panel-container-max-width, 280px);
  --_yam3x-option-panel-container-max-height: var(--yam3x-option-panel-container-max-height, 280px);
  --_yam3x-option-panel-container-padding-block: var(
    --yam3x-option-panel-container-padding-block,
    calc(4px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-panel-container-padding-inline: var(
    --yam3x-option-panel-container-padding-inline,
    calc(4px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-panel-container-shape: var(
    --yam3x-option-panel-container-shape,
    var(--md-sys-shape-corner-large, 16px)
  );
  --_yam3x-option-panel-container-color: var(
    --yam3x-option-panel-container-color,
    var(--md-sys-color-surface-container-low)
  );
  --_yam3x-option-panel-container-text-color: var(--md-sys-color-on-surface);
  --_yam3x-option-panel-container-elevation: var(
    --yam3x-option-panel-container-elevation,
    0 4px 8px 3px rgb(0 0 0 / 15%),
    0 1px 3px rgb(0 0 0 / 30%)
  );
  --_yam3x-option-panel-divider-spacing: var(
    --yam3x-option-panel-divider-spacing,
    calc(8px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-panel-no-data-container-height: var(
    --yam3x-option-panel-no-data-container-height,
    44px
  );
  --_yam3x-option-panel-no-data-container-padding: var(
    --yam3x-option-panel-no-data-container-padding,
    calc(12px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-panel-no-data-color: var(
    --yam3x-option-panel-no-data-color,
    var(--md-sys-color-on-surface-variant)
  );
  --_yam3x-option-panel-no-data-font-size: var(--yam3x-option-panel-no-data-font-size, 14px);
  --_yam3x-option-panel-no-data-font-weight: var(--yam3x-option-panel-no-data-font-weight, 500);
  --_yam3x-option-panel-no-data-line-height: var(--yam3x-option-panel-no-data-line-height, 20px);
  --_yam3x-option-panel-no-data-tracking: var(--yam3x-option-panel-no-data-tracking, 0.1px);
  --_yam3x-option-panel-loading-container-height: var(
    --yam3x-option-panel-loading-container-height,
    44px
  );
  --_yam3x-option-panel-loading-container-padding: var(
    --yam3x-option-panel-loading-container-padding,
    calc(12px * var(--_yam3x-option-spacing-scale))
  );
  --_yam3x-option-panel-loading-color: var(
    --yam3x-option-panel-loading-color,
    var(--md-sys-color-on-surface-variant)
  );
  --_yam3x-option-panel-loading-font-size: var(--yam3x-option-panel-loading-font-size, 14px);
  --_yam3x-option-panel-loading-font-weight: var(--yam3x-option-panel-loading-font-weight, 500);
  --_yam3x-option-panel-loading-line-height: var(--yam3x-option-panel-loading-line-height, 20px);
  --_yam3x-option-panel-loading-tracking: var(--yam3x-option-panel-loading-tracking, 0.1px);
  position: fixed;
  z-index: 42;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: auto;
  overscroll-behavior: contain;
  min-inline-size: var(--_yam3x-option-panel-container-min-width);
  max-inline-size: var(--_yam3x-option-panel-container-max-width);
  max-block-size: var(--_yam3x-option-panel-container-max-height);
  padding: var(--_yam3x-option-panel-container-padding-block)
    var(--_yam3x-option-panel-container-padding-inline);
  border: 0;
  border-radius: var(--_yam3x-option-panel-container-shape);
  background: var(--_yam3x-option-panel-container-color);
  color: var(--_yam3x-option-panel-container-text-color);
  box-shadow: var(--_yam3x-option-panel-container-elevation);
}
.yam3x-option-panel[hidden] {
  display: none;
}
.yam3x-option-panel > .yam3x-divider {
  margin-block: var(--_yam3x-option-panel-divider-spacing);
}
.yam3x-option-panel__status {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-block-size: var(--_yam3x-option-panel-no-data-container-height);
  padding: var(--_yam3x-option-panel-no-data-container-padding);
  color: var(--_yam3x-option-panel-no-data-color);
  font-size: var(--_yam3x-option-panel-no-data-font-size);
  font-weight: var(--_yam3x-option-panel-no-data-font-weight);
  line-height: calc(
    var(--_yam3x-option-panel-no-data-line-height) * var(--_yam3x-option-line-height-scale)
  );
  letter-spacing: var(--_yam3x-option-panel-no-data-tracking);
}
.yam3x-option-panel[aria-busy='true'] .yam3x-option-panel__status {
  min-block-size: var(--_yam3x-option-panel-loading-container-height);
  padding: var(--_yam3x-option-panel-loading-container-padding);
  color: var(--_yam3x-option-panel-loading-color);
  font-size: var(--_yam3x-option-panel-loading-font-size);
  font-weight: var(--_yam3x-option-panel-loading-font-weight);
  line-height: calc(
    var(--_yam3x-option-panel-loading-line-height) * var(--_yam3x-option-line-height-scale)
  );
  letter-spacing: var(--_yam3x-option-panel-loading-tracking);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-option-panel {
    scroll-behavior: auto;
  }
}
@media (forced-colors: active) {
  .yam3x-option-panel {
    border: 1px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
}
</style>
