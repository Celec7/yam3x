<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  useId,
  useSlots,
} from 'vue'
import { useTooltipController } from './tooltip-controller'
import {
  richTooltipContextKey,
  type RichTooltipPosition,
  type TooltipTouchGestures,
} from './tooltip.types'

const props = withDefaults(
  defineProps<{
    for: string
    id?: string
    position?: RichTooltipPosition
    showDelay?: number
    hideDelay?: number
    offset?: number
    disabled?: boolean
    persistent?: boolean
    ariaLabel?: string
    touchGestures?: TooltipTouchGestures
  }>(),
  {
    id: undefined,
    showDelay: 0,
    hideDelay: 1500,
    offset: 8,
    disabled: false,
    persistent: false,
    touchGestures: 'auto',
    ariaLabel: undefined,
  },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  beforetoggle: [event: Event]
  toggle: [event: Event]
}>()
const slots = useSlots()
const generatedId = useId()
const tooltipId = computed(() => props.id || `yam3x-rich-tooltip-${generatedId}`)
const subheadId = computed(() => `${tooltipId.value}-subhead`)
const contentId = computed(() => `${tooltipId.value}-content`)
const surface = ref<HTMLElement | null>(null)
const interactive = ref(false)
const desktopPointerQuery =
  typeof window === 'undefined'
    ? undefined
    : window.matchMedia('(hover: hover) and (pointer: fine)')
const hasDesktopPointer = ref(desktopPointerQuery?.matches ?? false)
const position = computed<RichTooltipPosition>(() => {
  const requested = props.position ?? (hasDesktopPointer.value ? 'below' : 'below-after')
  return (
    [
      'above',
      'below',
      'before',
      'after',
      'above-before',
      'above-after',
      'below-before',
      'below-after',
    ] as const
  ).includes(requested)
    ? requested
    : 'below-after'
})
function onDesktopPointerChange(event: MediaQueryListEvent): void {
  hasDesktopPointer.value = event.matches
}
const controller = useTooltipController({
  id: tooltipId,
  forId: computed(() => props.for),
  surface,
  open,
  disabled: computed(() => props.disabled),
  position,
  distance: computed(() => Math.max(0, props.offset)),
  showDelay: computed(() => props.showDelay),
  hideDelay: computed(() => props.hideDelay),
  touchGestures: computed(() => props.touchGestures),
  interactive: computed(() => interactive.value),
  persistent: computed(() => props.persistent),
  kind: 'rich',
  emitBeforeToggle: (event) => emit('beforetoggle', event),
  emitToggle: (event) => emit('toggle', event),
})
const hasSubhead = computed(() => !!slots.subhead)
const hasActions = computed(() => !!slots.actions)

function updateInteractive(): void {
  const root = surface.value
  if (!root) return
  interactive.value = !!root.querySelector(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )
  controller.syncInteractiveSemantics()
}

onMounted(() => {
  desktopPointerQuery?.addEventListener('change', onDesktopPointerChange)
  updateInteractive()
})
onBeforeUnmount(() => desktopPointerQuery?.removeEventListener('change', onDesktopPointerChange))
onUpdated(() => {
  void nextTick(updateInteractive)
})

provide(richTooltipContextKey, { hide: controller.hide })
defineExpose({ show: controller.show, hide: controller.hide })
</script>

<template>
  <div
    :id="tooltipId"
    ref="surface"
    class="yam3x-rich-tooltip__surface"
    :class="{
      'yam3x-rich-tooltip__surface--interactive': interactive,
      'yam3x-rich-tooltip__surface--has-actions': hasActions,
    }"
    popover="manual"
    :role="interactive ? 'dialog' : 'tooltip'"
    :aria-labelledby="interactive && hasSubhead ? subheadId : undefined"
    :aria-label="interactive && !hasSubhead ? ariaLabel : undefined"
    :aria-describedby="interactive && hasSubhead ? contentId : undefined"
    @pointerenter="controller.onSurfacePointerEnter"
    @pointerleave="controller.onSurfacePointerLeave"
  >
    <div
      v-if="hasSubhead"
      :id="subheadId"
      class="yam3x-rich-tooltip__subhead"
    >
      <slot name="subhead" />
    </div>
    <div
      :id="contentId"
      class="yam3x-rich-tooltip__content"
    >
      <slot />
    </div>
    <div
      v-if="hasActions"
      class="yam3x-rich-tooltip__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.yam3x-rich-tooltip__surface {
  --_yam3x-rich-tooltip-max-width: var(--yam3x-rich-tooltip-max-width, 320px);
  --_yam3x-rich-tooltip-max-height: calc(100dvh - 16px);
  --_yam3x-rich-tooltip-padding-top: calc(12px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-padding-bottom: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-padding-inline: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-actions-padding-inline: calc(4px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-actions-top-space: calc(12px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-actions-bottom-space: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-actions-gap: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-subhead-bottom-space: calc(4px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-rich-tooltip-shape: var(
    --yam3x-rich-tooltip-shape,
    var(--md-sys-shape-corner-medium, 12px)
  );
  --_yam3x-rich-tooltip-container-color: var(
    --yam3x-rich-tooltip-container-color,
    var(--md-sys-color-surface-container)
  );
  --_yam3x-rich-tooltip-supporting-text-color: var(
    --yam3x-rich-tooltip-supporting-text-color,
    var(--md-sys-color-on-surface-variant)
  );
  --_yam3x-rich-tooltip-subhead-color: var(
    --yam3x-rich-tooltip-subhead-color,
    var(--md-sys-color-on-surface-variant)
  );
  --_yam3x-rich-tooltip-elevation: var(
    --yam3x-rich-tooltip-elevation,
    var(
      --md-sys-elevation-level3,
      0 4px 8px 3px rgb(29 27 32 / 0.08),
      0 1px 3px rgb(29 27 32 / 0.16)
    )
  );
  --_yam3x-rich-tooltip-subhead-font-family: var(--md-sys-typescale-label-large-font-family);
  --_yam3x-rich-tooltip-subhead-font-size: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-rich-tooltip-subhead-font-weight: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-rich-tooltip-subhead-line-height: calc(
    var(--md-sys-typescale-label-large-line-height-small) *
      var(--md-sys-typescale-line-height-scale, 1.07)
  );
  --_yam3x-rich-tooltip-subhead-tracking: var(--md-sys-typescale-label-large-tracking);
  --_yam3x-rich-tooltip-supporting-text-font-family: var(
    --md-sys-typescale-body-medium-font-family
  );
  --_yam3x-rich-tooltip-supporting-text-font-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-rich-tooltip-supporting-text-font-weight: var(
    --md-sys-typescale-body-medium-font-weight
  );
  --_yam3x-rich-tooltip-supporting-text-line-height: calc(
    var(--md-sys-typescale-body-medium-line-height-small) *
      var(--md-sys-typescale-line-height-scale, 1.07)
  );
  --_yam3x-rich-tooltip-supporting-text-tracking: var(--md-sys-typescale-body-medium-tracking);
  --_yam3x-rich-tooltip-motion: var(--md-sys-motion-spring-fast-effects);
  box-sizing: border-box;
  position: fixed;
  inset: auto;
  margin: 0;
  z-index: 1400;
  display: none;
  flex-direction: column;
  width: max-content;
  max-width: min(var(--_yam3x-rich-tooltip-max-width), calc(100vw - 16px));
  max-height: var(--_yam3x-rich-tooltip-max-height);
  overflow: auto;
  padding-block-start: var(--_yam3x-rich-tooltip-padding-top);
  padding-inline: var(--_yam3x-rich-tooltip-padding-inline);
  padding-block-end: var(--_yam3x-rich-tooltip-padding-bottom);
  border: 0;
  border-radius: var(--_yam3x-rich-tooltip-shape);
  background: var(--_yam3x-rich-tooltip-container-color);
  color: var(--_yam3x-rich-tooltip-supporting-text-color);
  box-shadow: var(--_yam3x-rich-tooltip-elevation);
  font-family: var(--_yam3x-rich-tooltip-supporting-text-font-family);
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity var(--_yam3x-rich-tooltip-motion),
    transform var(--_yam3x-rich-tooltip-motion);
}
.yam3x-rich-tooltip__surface:popover-open,
.yam3x-rich-tooltip__surface[data-open='true'] {
  display: flex;
  opacity: 1;
  transform: scale(1);
}
.yam3x-rich-tooltip__surface--has-actions:popover-open,
.yam3x-rich-tooltip__surface--has-actions[data-open='true'] {
  padding-block-end: 0;
}
.yam3x-rich-tooltip__subhead {
  padding-block-end: var(--_yam3x-rich-tooltip-subhead-bottom-space);
  color: var(--_yam3x-rich-tooltip-subhead-color);
  font-family: var(--_yam3x-rich-tooltip-subhead-font-family);
  font-size: var(--_yam3x-rich-tooltip-subhead-font-size);
  font-weight: var(--_yam3x-rich-tooltip-subhead-font-weight);
  line-height: var(--_yam3x-rich-tooltip-subhead-line-height);
  letter-spacing: var(--_yam3x-rich-tooltip-subhead-tracking);
}
.yam3x-rich-tooltip__content {
  color: var(--_yam3x-rich-tooltip-supporting-text-color);
  font-size: var(--_yam3x-rich-tooltip-supporting-text-font-size);
  font-weight: var(--_yam3x-rich-tooltip-supporting-text-font-weight);
  line-height: var(--_yam3x-rich-tooltip-supporting-text-line-height);
  letter-spacing: var(--_yam3x-rich-tooltip-supporting-text-tracking);
}
.yam3x-rich-tooltip__actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--_yam3x-rich-tooltip-actions-gap);
  min-height: 24px;
  margin-inline: calc(
    0px -
      (
        var(--_yam3x-rich-tooltip-padding-inline) -
          var(--_yam3x-rich-tooltip-actions-padding-inline)
      )
  );
  padding-block-start: var(--_yam3x-rich-tooltip-actions-top-space);
  padding-block-end: var(--_yam3x-rich-tooltip-actions-bottom-space);
}
.yam3x-rich-tooltip__actions :deep(a),
.yam3x-rich-tooltip__actions :deep(button) {
  flex: 0 1 auto;
}
.yam3x-rich-tooltip__actions :deep(.yam3x-touch-target) {
  margin-block: 0;
}
@starting-style {
  .yam3x-rich-tooltip__surface:popover-open {
    opacity: 0;
    transform: scale(0.8);
  }
}
@supports (transition-behavior: allow-discrete) and (overlay: auto) {
  .yam3x-rich-tooltip__surface {
    transition:
      opacity var(--_yam3x-rich-tooltip-motion),
      transform var(--_yam3x-rich-tooltip-motion),
      overlay var(--_yam3x-rich-tooltip-motion) allow-discrete,
      display var(--_yam3x-rich-tooltip-motion) allow-discrete;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-rich-tooltip__surface {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-rich-tooltip__surface {
    forced-color-adjust: none;
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
    box-shadow: none;
  }
  .yam3x-rich-tooltip__subhead,
  .yam3x-rich-tooltip__content {
    color: CanvasText;
  }
  .yam3x-rich-tooltip__actions :deep(a),
  .yam3x-rich-tooltip__actions :deep(button) {
    color: LinkText;
  }
}
</style>
