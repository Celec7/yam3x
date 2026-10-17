<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    layout?: 'floating' | 'docked'
    variant?: 'standard' | 'vibrant'
    shape?: 'rounded' | 'square'
    vertical?: boolean
    elevated?: boolean
  }>(),
  {
    layout: 'floating',
    variant: 'standard',
    shape: undefined,
    vertical: false,
    elevated: undefined,
  },
)

const attrs = useAttrs()
const host = ref<HTMLElement | null>(null)
const layout = computed(() => (props.layout === 'docked' ? 'docked' : 'floating'))
const variant = computed(() => (props.variant === 'vibrant' ? 'vibrant' : 'standard'))
const shape = computed(() =>
  props.shape === 'rounded' || props.shape === 'square'
    ? props.shape
    : layout.value === 'floating'
      ? 'rounded'
      : 'square',
)
const vertical = computed(() => layout.value === 'floating' && props.vertical)
const elevated = computed(() => props.elevated ?? layout.value === 'floating')

const selector = 'button, a[href], input, select, textarea, [tabindex]'
const composite =
  '[role="tablist"], [role="listbox"], [role="radiogroup"], [role="tree"], [role="grid"], [role="menu"], [role="menubar"], [role="slider"], [role="spinbutton"], [role="combobox"]'

function focusableItems(): HTMLElement[] {
  if (!host.value) return []
  const toolbar = host.value
  return [...toolbar.querySelectorAll<HTMLElement>(selector)].filter((item) => {
    if (item.closest('[role="toolbar"]') !== toolbar) return false
    if (item.closest(composite) && !item.matches(composite)) return false
    if (item.matches(':disabled, [disabled], [hidden], [inert]')) return false
    if (item.closest('[hidden], [inert]')) return false
    if (item.tabIndex < 0 || item.getClientRects().length === 0) return false
    return true
  })
}

function onKeydown(event: KeyboardEvent) {
  const toolbar = host.value
  if (!toolbar || !(event.target instanceof HTMLElement)) return
  if (event.target.closest('[role="toolbar"]') !== toolbar) return
  if (event.altKey || event.ctrlKey || event.metaKey) return
  if (event.target.closest(composite)) return
  if (
    event.target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
    )
  )
    return

  const right = !vertical.value && event.key === 'ArrowRight'
  const left = !vertical.value && event.key === 'ArrowLeft'
  const down = vertical.value && event.key === 'ArrowDown'
  const up = vertical.value && event.key === 'ArrowUp'
  if (!right && !left && !down && !up && event.key !== 'Home' && event.key !== 'End') return

  const items = focusableItems()
  if (!items.length) return
  const current = items.findIndex((item) => item === document.activeElement)
  let next: number
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = items.length - 1
  else {
    const rtl = getComputedStyle(toolbar).direction === 'rtl'
    const forward = down || (right && !rtl) || (left && rtl)
    next = (current + (forward ? 1 : -1) + items.length) % items.length
  }
  event.preventDefault()
  items[next]?.focus()
}
</script>

<template>
  <div
    ref="host"
    v-bind="attrs"
    class="yam3x-toolbar"
    :class="[
      `yam3x-toolbar--${layout}`,
      `yam3x-toolbar--${variant}`,
      `yam3x-toolbar--${shape}`,
      { 'yam3x-toolbar--vertical': vertical, 'yam3x-toolbar--elevated': elevated },
    ]"
    role="toolbar"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>

<style scoped>
.yam3x-toolbar {
  --_yam3x-toolbar-size: var(--yam3x-toolbar-size, var(--md-sys-spacing-64, 64px));
  --_yam3x-toolbar-spacing: var(
    --yam3x-toolbar-spacing,
    var(--md-sys-spacing-4, calc(4px * var(--md-sys-density-spacing-scale, 1)))
  );
  --_yam3x-toolbar-standard-container-color: var(
    --yam3x-toolbar-standard-container-color,
    var(--md-sys-color-surface-container)
  );
  --_yam3x-toolbar-standard-color: var(
    --yam3x-toolbar-standard-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-toolbar-vibrant-container-color: var(
    --yam3x-toolbar-vibrant-container-color,
    var(--md-sys-color-primary-container)
  );
  --_yam3x-toolbar-vibrant-color: var(
    --yam3x-toolbar-vibrant-color,
    var(--md-sys-color-on-primary-container)
  );
  --_yam3x-toolbar-rounded-shape: var(
    --yam3x-toolbar-rounded-shape,
    var(--md-sys-shape-corner-full, 9999px)
  );
  --_yam3x-toolbar-docked-rounded-shape: var(
    --yam3x-toolbar-docked-rounded-shape,
    var(--md-sys-shape-corner-large, 16px)
  );
  --_yam3x-toolbar-square-shape: var(--md-sys-shape-corner-none, 0);
  --_yam3x-toolbar-elevation: var(
    --md-sys-elevation-level3,
    0 4px 8px 3px rgb(29 27 32 / 0.08),
    0 1px 3px rgb(29 27 32 / 0.16)
  );
  --_yam3x-toolbar-padding-block: var(
    --yam3x-toolbar-padding-block,
    var(--md-sys-spacing-8, calc(8px * var(--md-sys-density-spacing-scale, 1)))
  );
  --_yam3x-toolbar-padding-inline: var(
    --yam3x-toolbar-padding-inline,
    var(--md-sys-spacing-8, calc(8px * var(--md-sys-density-spacing-scale, 1)))
  );

  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--_yam3x-toolbar-spacing);
  min-height: var(--_yam3x-toolbar-size);
  width: fit-content;
  max-width: 100%;
  padding-block: var(--_yam3x-toolbar-padding-block);
  padding-inline: var(--_yam3x-toolbar-padding-inline);
  background: var(--_yam3x-toolbar-standard-container-color);
  color: var(--_yam3x-toolbar-standard-color);
}
.yam3x-toolbar[hidden] {
  display: none;
}
.yam3x-toolbar--vibrant {
  background: var(--_yam3x-toolbar-vibrant-container-color);
  color: var(--_yam3x-toolbar-vibrant-color);
}
.yam3x-toolbar--floating.yam3x-toolbar--rounded {
  border-radius: var(--_yam3x-toolbar-rounded-shape);
}
.yam3x-toolbar--elevated {
  box-shadow: var(--_yam3x-toolbar-elevation);
}
.yam3x-toolbar--floating.yam3x-toolbar--square {
  --_yam3x-toolbar-padding-inline: var(
    --yam3x-toolbar-padding-inline,
    var(--md-sys-spacing-16, calc(16px * var(--md-sys-density-spacing-scale, 1)))
  );
}
.yam3x-toolbar--vertical.yam3x-toolbar--square {
  --_yam3x-toolbar-padding-block: var(
    --yam3x-toolbar-padding-block,
    var(--md-sys-spacing-16, calc(16px * var(--md-sys-density-spacing-scale, 1)))
  );
  --_yam3x-toolbar-padding-inline: var(
    --yam3x-toolbar-padding-inline,
    var(--md-sys-spacing-8, calc(8px * var(--md-sys-density-spacing-scale, 1)))
  );
}
.yam3x-toolbar--docked {
  --_yam3x-toolbar-padding-inline: max(
    var(--md-sys-spacing-16, calc(16px * var(--md-sys-density-spacing-scale, 1))),
    var(
      --yam3x-toolbar-padding-inline,
      var(--md-sys-spacing-16, calc(16px * var(--md-sys-density-spacing-scale, 1)))
    )
  );

  display: flex;
  width: 100%;
  max-width: none;
  justify-content: space-evenly;
  border-radius: var(--_yam3x-toolbar-square-shape);
}
.yam3x-toolbar--vertical {
  flex-direction: column;
  justify-content: center;
  min-width: var(--_yam3x-toolbar-size);
  min-height: 0;
}
@media (min-width: 600px) {
  .yam3x-toolbar--docked {
    justify-content: center;
    --_yam3x-toolbar-spacing: var(
      --yam3x-toolbar-spacing,
      var(--md-sys-spacing-32, calc(32px * var(--md-sys-density-spacing-scale, 1)))
    );
  }
}
@media (min-width: 840px) {
  .yam3x-toolbar--docked.yam3x-toolbar--rounded {
    border-radius: var(--_yam3x-toolbar-docked-rounded-shape);
  }
}
@media (forced-colors: active) {
  .yam3x-toolbar {
    background: Canvas;
    color: CanvasText;
    outline: 1px solid CanvasText;
  }
}
</style>
