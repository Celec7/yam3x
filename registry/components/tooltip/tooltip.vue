<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useTooltipController } from './tooltip-controller'
import type { TooltipPosition, TooltipTouchGestures } from './tooltip.types'

const props = withDefaults(
  defineProps<{
    for: string
    id?: string
    position?: TooltipPosition
    showDelay?: number
    hideDelay?: number
    offset?: number
    disabled?: boolean
    touchGestures?: TooltipTouchGestures
  }>(),
  {
    id: undefined,
    position: undefined,
    showDelay: 0,
    hideDelay: 1500,
    offset: undefined,
    disabled: false,
    touchGestures: 'auto',
  },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  beforetoggle: [event: Event]
  toggle: [event: Event]
}>()
const generatedId = useId()
const tooltipId = computed(() => props.id || `yam3x-tooltip-${generatedId}`)
const surface = ref<HTMLElement | null>(null)
const position = computed(() =>
  (['above', 'below', 'before', 'after'] as const).includes(props.position as TooltipPosition)
    ? props.position
    : undefined,
)
const distance = computed(() => (props.offset === undefined ? -1 : Math.max(0, props.offset)))
const controller = useTooltipController({
  id: tooltipId,
  forId: computed(() => props.for),
  surface,
  open,
  disabled: computed(() => props.disabled),
  position,
  distance,
  showDelay: computed(() => props.showDelay),
  hideDelay: computed(() => props.hideDelay),
  touchGestures: computed(() => props.touchGestures),
  interactive: computed(() => false),
  persistent: computed(() => false),
  kind: 'plain',
  emitBeforeToggle: (event) => emit('beforetoggle', event),
  emitToggle: (event) => emit('toggle', event),
})
let resizeObserver: ResizeObserver | undefined
const multiline = ref(false)

function updateLineLayout(): void {
  const element = surface.value
  multiline.value = !!element && element.scrollHeight > 24
}

onMounted(() => {
  if (surface.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateLineLayout)
    resizeObserver.observe(surface.value)
  }
})
onBeforeUnmount(() => resizeObserver?.disconnect())

defineExpose({ show: controller.show, hide: controller.hide })
</script>

<template>
  <div
    :id="tooltipId"
    ref="surface"
    class="yam3x-tooltip__surface"
    :class="{ 'yam3x-tooltip__surface--multiline': multiline }"
    popover="manual"
    role="tooltip"
    @pointerenter="controller.onSurfacePointerEnter"
    @pointerleave="controller.onSurfacePointerLeave"
  >
    <slot />
  </div>
</template>

<style scoped>
.yam3x-tooltip__surface {
  --_yam3x-tooltip-min-width: 40px;
  --_yam3x-tooltip-max-width: var(--yam3x-tooltip-max-width, 200px);
  --_yam3x-tooltip-min-height: 24px;
  --_yam3x-tooltip-max-height: calc(100dvh - 16px);
  --_yam3x-tooltip-padding-block: calc(4px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-tooltip-padding-inline: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-tooltip-shape: var(--yam3x-tooltip-shape, var(--md-sys-shape-corner-extra-small, 4px));
  --_yam3x-tooltip-container-color: var(
    --yam3x-tooltip-container-color,
    var(--md-sys-color-inverse-surface)
  );
  --_yam3x-tooltip-supporting-text-color: var(
    --yam3x-tooltip-supporting-text-color,
    var(--md-sys-color-inverse-on-surface)
  );
  --_yam3x-tooltip-supporting-text-font-family: var(--md-sys-typescale-body-small-font-family);
  --_yam3x-tooltip-supporting-text-font-size: var(--md-sys-typescale-body-small-font-size);
  --_yam3x-tooltip-supporting-text-font-weight: var(--md-sys-typescale-body-small-font-weight);
  --_yam3x-tooltip-supporting-text-line-height: var(
    --md-sys-typescale-body-small-line-height-small
  );
  --_yam3x-tooltip-supporting-text-tracking: var(--md-sys-typescale-body-small-tracking);
  --_yam3x-tooltip-motion: var(--md-sys-motion-spring-fast-effects);
  box-sizing: border-box;
  position: fixed;
  inset: auto;
  margin: 0;
  z-index: 1400;
  display: none;
  min-width: var(--_yam3x-tooltip-min-width);
  max-width: min(var(--_yam3x-tooltip-max-width), calc(100vw - 16px));
  min-height: var(--_yam3x-tooltip-min-height);
  max-height: var(--_yam3x-tooltip-max-height);
  overflow: auto;
  padding: var(--_yam3x-tooltip-padding-block) var(--_yam3x-tooltip-padding-inline);
  border: 0;
  border-radius: var(--_yam3x-tooltip-shape);
  background: var(--_yam3x-tooltip-container-color);
  color: var(--_yam3x-tooltip-supporting-text-color);
  font-family: var(--_yam3x-tooltip-supporting-text-font-family);
  font-size: var(--_yam3x-tooltip-supporting-text-font-size);
  font-weight: var(--_yam3x-tooltip-supporting-text-font-weight);
  line-height: var(--_yam3x-tooltip-supporting-text-line-height);
  letter-spacing: var(--_yam3x-tooltip-supporting-text-tracking);
  text-align: center;
  overflow-wrap: break-word;
  word-break: normal;
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity var(--_yam3x-tooltip-motion),
    transform var(--_yam3x-tooltip-motion);
}
.yam3x-tooltip__surface:popover-open,
.yam3x-tooltip__surface[data-open='true'] {
  display: block;
  opacity: 1;
  transform: scale(1);
}
.yam3x-tooltip__surface--multiline {
  text-align: start;
}
@starting-style {
  .yam3x-tooltip__surface:popover-open {
    opacity: 0;
    transform: scale(0.8);
  }
}
@supports (transition-behavior: allow-discrete) and (overlay: auto) {
  .yam3x-tooltip__surface {
    transition:
      opacity var(--_yam3x-tooltip-motion),
      transform var(--_yam3x-tooltip-motion),
      overlay var(--_yam3x-tooltip-motion) allow-discrete,
      display var(--_yam3x-tooltip-motion) allow-discrete;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-tooltip__surface {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-tooltip__surface {
    forced-color-adjust: none;
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
  }
}
</style>
