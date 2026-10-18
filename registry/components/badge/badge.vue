<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { autoUpdate, computePosition, platform, type Placement } from '@floating-ui/dom'
import { offsetParent } from 'composed-offset-position'
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'

type BadgePosition =
  | 'above-after'
  | 'above-before'
  | 'below-before'
  | 'below-after'
  | 'before'
  | 'after'
  | 'above'
  | 'below'
type Direction = 'ltr' | 'rtl'

const props = withDefaults(
  defineProps<{
    locale?: string
    position?: BadgePosition
    for?: string
    dir?: Direction
    ariaLabel?: string
    hidden?: boolean
  }>(),
  {
    position: 'above-after',
    for: undefined,
    dir: undefined,
    ariaLabel: undefined,
    hidden: false,
  },
)

const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)

const validPositions: BadgePosition[] = [
  'above-after',
  'above-before',
  'below-before',
  'below-after',
  'before',
  'after',
  'above',
  'below',
]
const position = computed<BadgePosition>(() =>
  validPositions.includes(props.position) ? props.position : 'above-after',
)
const badgeSize = ref<'small' | 'large'>('small')
const accessibleName = computed(
  () =>
    props.ariaLabel ||
    (badgeSize.value === 'small' ? actionMessages.value.newNotification : undefined),
)
const badgeElement = ref<HTMLSpanElement>()
const longLabel = ref(false)
const positioned = ref(false)

let rootObserver: MutationObserver | undefined
let contentObserver: MutationObserver | undefined
let stopAutoUpdate: (() => void) | undefined
let currentAnchor: HTMLElement | null = null
let generation = 0

const floatingPlatform = {
  ...platform,
  getOffsetParent: (element: Element) => platform.getOffsetParent(element, offsetParent),
}

function findAnchor(id: string): HTMLElement | null {
  const root = badgeElement.value?.getRootNode() as Document | ShadowRoot | undefined
  const element = root?.getElementById(id)
  return element instanceof HTMLElement ? element : null
}

function measureLabel() {
  const content = badgeElement.value?.querySelector('.yam3x-badge__content')
  const hasContent = Array.from(content?.childNodes ?? []).some((node) => {
    if (node instanceof Element) return true
    return node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())
  })
  badgeSize.value = hasContent ? 'large' : 'small'
  const text = content?.textContent?.replace(/\s/g, '') ?? ''
  longLabel.value = text.length > 2
}

function placementFor(value: BadgePosition, rtl: boolean) {
  switch (value) {
    case 'above':
      return 'top'
    case 'above-before':
      return 'top-start'
    case 'after':
      return rtl ? 'left' : 'right'
    case 'before':
      return rtl ? 'right' : 'left'
    case 'below':
      return 'bottom'
    case 'below-after':
      return 'bottom-end'
    case 'below-before':
      return 'bottom-start'
    default:
      return 'top-end'
  }
}

function getOffset(element: HTMLElement): { x: number; y: number } {
  const custom = getComputedStyle(element).getPropertyValue('--_yam3x-badge-small-offset').trim()
  if (custom) {
    const value = Number.parseFloat(custom) || 0
    return { x: value, y: value }
  }
  return badgeSize.value === 'small' ? { x: 6, y: 6 } : { x: 14, y: 12 }
}

async function updatePosition(anchor: HTMLElement, token: number) {
  const element = badgeElement.value
  if (!element || token !== generation || !element.isConnected) return
  const rtl = props.dir ? props.dir === 'rtl' : getComputedStyle(anchor).direction === 'rtl'
  const result = await computePosition(anchor, element, {
    placement: placementFor(position.value, rtl) as Placement,
    platform: floatingPlatform,
  })
  if (token !== generation || currentAnchor !== anchor || !element.isConnected) return

  let { x, y } = result
  const badgeWidth = element.offsetWidth
  const gap = getOffset(element)
  if (position.value.includes('before') && position.value !== 'before')
    x += rtl ? badgeWidth : -badgeWidth
  if (position.value.includes('after') && position.value !== 'after')
    x += rtl ? -badgeWidth : badgeWidth

  if (position.value === 'above' || position.value === 'below') {
    y += position.value === 'above' ? gap.y : -gap.y
  } else if (position.value === 'before') {
    x += gap.x
  } else if (position.value === 'after') {
    x -= gap.x
  } else {
    y += position.value.startsWith('above') ? gap.y : -gap.y
    if (position.value.endsWith('after')) x += rtl ? gap.x : -gap.x
    if (position.value.endsWith('before')) x += rtl ? -gap.x : gap.x
  }

  element.style.left = `${x}px`
  element.style.top = `${y}px`
  positioned.value = true
}

function detachAnchor() {
  generation += 1
  stopAutoUpdate?.()
  stopAutoUpdate = undefined
  currentAnchor = null
  positioned.value = false
}

function syncAnchor() {
  measureLabel()
  const element = badgeElement.value
  if (!element || !props.for) {
    detachAnchor()
    if (element) {
      element.style.removeProperty('left')
      element.style.removeProperty('top')
    }
    return
  }

  const anchor = findAnchor(props.for)
  if (anchor !== currentAnchor) {
    detachAnchor()
    if (!anchor) return
    currentAnchor = anchor
    const token = generation
    stopAutoUpdate = autoUpdate(anchor, element, () => {
      void updatePosition(anchor, token)
    })
    return
  }
  if (anchor) void updatePosition(anchor, generation)
}

function onRootMutations() {
  void nextTick(syncAnchor)
}

watch(
  () => [props.for, props.position, badgeSize.value, props.dir],
  () => {
    void nextTick(syncAnchor)
  },
)

onMounted(() => {
  const element = badgeElement.value
  if (!element) return
  const root = element.getRootNode()
  if (root instanceof Document || root instanceof ShadowRoot) {
    rootObserver = new MutationObserver(onRootMutations)
    rootObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'dir'],
    })
  }
  const content = element.querySelector('.yam3x-badge__content')
  if (content) {
    contentObserver = new MutationObserver(measureLabel)
    contentObserver.observe(content, { childList: true, subtree: true, characterData: true })
  }
  syncAnchor()
})

onUpdated(() => {
  void nextTick(syncAnchor)
})

onBeforeUnmount(() => {
  detachAnchor()
  rootObserver?.disconnect()
  contentObserver?.disconnect()
})
</script>

<template>
  <span
    ref="badgeElement"
    class="yam3x-badge"
    :class="`yam3x-badge--${badgeSize}`"
    :dir="dir"
    :for="props.for"
    :data-attached="props.for ? '' : undefined"
    :data-positioned="positioned ? '' : undefined"
    :data-position="position"
    :data-long-label="longLabel ? '' : undefined"
    :aria-label="accessibleName"
    role="img"
    :hidden="hidden"
    ><span
      class="yam3x-badge__content"
      :aria-hidden="badgeSize === 'small' ? 'true' : undefined"
      ><slot /></span
  ></span>
</template>

<style scoped>
.yam3x-badge {
  --_yam3x-badge-system-color-error: var(--md-sys-color-error);
  --_yam3x-badge-system-color-on-error: var(--md-sys-color-on-error);
  --_yam3x-badge-system-shape-corner-full: var(--md-sys-shape-corner-full);
  --_yam3x-badge-system-typescale-label-small-font-size: var(
    --md-sys-typescale-label-small-font-size,
    11px
  );
  --_yam3x-badge-system-typescale-label-small-font-weight: var(
    --md-sys-typescale-label-small-font-weight,
    500
  );
  --_yam3x-badge-system-typescale-label-small-line-height: var(
    --md-sys-typescale-label-small-line-height,
    1rem
  );
  --_yam3x-badge-system-typescale-label-small-tracking: var(
    --md-sys-typescale-label-small-tracking,
    0.03125rem
  );
  --_yam3x-badge-system-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-badge-container-color: var(
    --yam3x-badge-container-color,
    var(--_yam3x-badge-system-color-error)
  );
  --_yam3x-badge-color: var(--yam3x-badge-color, var(--_yam3x-badge-system-color-on-error));
  --_yam3x-badge-shape: var(--_yam3x-badge-system-shape-corner-full);
  --_yam3x-badge-small-offset: var(--yam3x-badge-small-offset);
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  vertical-align: baseline;
  padding: 0;
  border-radius: var(--_yam3x-badge-shape);
  background: var(--_yam3x-badge-container-color);
  color: var(--_yam3x-badge-color);
  font: inherit;
  line-height: normal;
  text-align: center;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
}
.yam3x-badge[hidden] {
  display: none;
}
.yam3x-badge[data-attached] {
  position: absolute;
  z-index: 1;
  contain: layout style paint;
}
.yam3x-badge[data-attached]:not([data-positioned]) {
  visibility: hidden;
}
.yam3x-badge--small {
  --_yam3x-badge-size: 6px;
  width: var(--_yam3x-badge-size);
  min-width: var(--_yam3x-badge-size);
  height: var(--_yam3x-badge-size);
  max-height: var(--_yam3x-badge-size);
  overflow: hidden;
  font-size: 0;
}
.yam3x-badge--large {
  --_yam3x-badge-size: var(--yam3x-badge-large-size, 16px);
  --_yam3x-badge-label-font-size: var(
    --yam3x-badge-large-font-size,
    var(--_yam3x-badge-system-typescale-label-small-font-size)
  );
  --_yam3x-badge-label-font-weight: var(
    --yam3x-badge-large-font-weight,
    var(--_yam3x-badge-system-typescale-label-small-font-weight)
  );
  --_yam3x-badge-label-line-height: var(
    --yam3x-badge-large-line-height,
    var(--_yam3x-badge-system-typescale-label-small-line-height)
  );
  --_yam3x-badge-label-tracking: var(
    --yam3x-badge-large-tracking,
    var(--_yam3x-badge-system-typescale-label-small-tracking)
  );
  height: var(--_yam3x-badge-size);
  min-width: var(--_yam3x-badge-size);
  font-size: var(--_yam3x-badge-label-font-size);
  font-weight: var(--_yam3x-badge-label-font-weight);
  line-height: var(--_yam3x-badge-label-line-height);
  letter-spacing: var(--_yam3x-badge-label-tracking);
}
.yam3x-badge--large[data-long-label] {
  --_yam3x-badge-long-label-font-size: var(--yam3x-badge-long-label-font-size, 10px);
  --_yam3x-badge-long-label-tracking: var(--yam3x-badge-long-label-tracking, 0.1px);
  padding-inline: calc(4px * var(--_yam3x-badge-system-density-spacing-scale));
  font-size: var(--_yam3x-badge-long-label-font-size);
  letter-spacing: var(--_yam3x-badge-long-label-tracking);
}
@media (forced-colors: active) {
  .yam3x-badge {
    forced-color-adjust: none;
    outline: 1px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
}
</style>
