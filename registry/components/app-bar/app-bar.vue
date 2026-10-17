<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import type {
  AppBarAlignment,
  AppBarScrollBehavior,
  AppBarScrollTarget,
  AppBarVariant,
} from './app-bar.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: AppBarVariant
    alignment?: AppBarAlignment
    scrollBehavior?: AppBarScrollBehavior
    scrollTarget?: AppBarScrollTarget
    searchLabel?: string
  }>(),
  {
    variant: 'small',
    alignment: 'leading',
    scrollTarget: null,
    searchLabel: 'Search',
  },
)

const emit = defineEmits<{ search: [] }>()
const attrs = useAttrs()
const slots = useSlots()
const scrolled = ref(false)
const hidden = ref(false)
const subtitleElement = ref<HTMLElement | null>(null)
const hasSubtitle = ref(false)
let scrollTargetElement: EventTarget | null = null
let previousScrollPosition = 0

const validVariants: AppBarVariant[] = ['search', 'small', 'medium-flexible', 'large-flexible']
const variant = computed<AppBarVariant>(() =>
  validVariants.includes(props.variant) ? props.variant : 'small',
)
const alignment = computed<AppBarAlignment>(() =>
  props.alignment === 'centered' ? 'centered' : 'leading',
)
const flexible = computed(
  () => variant.value === 'medium-flexible' || variant.value === 'large-flexible',
)
const validScrollBehaviors: AppBarScrollBehavior[] = [
  'pinned',
  'enter-always',
  'exit-until-collapsed',
]
const scrollBehavior = computed<AppBarScrollBehavior>(() => {
  if (props.scrollBehavior && validScrollBehaviors.includes(props.scrollBehavior)) {
    return props.scrollBehavior
  }
  return flexible.value ? 'exit-until-collapsed' : 'pinned'
})
const compact = computed(
  () => flexible.value && scrollBehavior.value === 'exit-until-collapsed' && scrolled.value,
)

function syncSubtitlePresence(): void {
  const element = subtitleElement.value
  hasSubtitle.value = Boolean(
    element &&
    Array.from(element.childNodes).some(
      (node) => node.nodeType === 1 || (node.nodeType === 3 && Boolean(node.textContent?.trim())),
    ),
  )
}

function resolveScrollTarget(): EventTarget | null {
  if (typeof window === 'undefined') return null
  if (!props.scrollTarget) return window
  if (typeof props.scrollTarget === 'string') {
    const id = props.scrollTarget.startsWith('#') ? props.scrollTarget.slice(1) : props.scrollTarget
    return document.getElementById(id)
  }
  return props.scrollTarget
}

function getScrollPosition(): number {
  if (typeof window === 'undefined') return 0
  if (scrollTargetElement === window) {
    return window.scrollY || document.documentElement.scrollTop
  }
  if (scrollTargetElement === document) {
    return document.scrollingElement?.scrollTop ?? document.documentElement.scrollTop
  }
  if (scrollTargetElement instanceof HTMLElement) return scrollTargetElement.scrollTop
  return 0
}

function readScrollState(): void {
  const position = getScrollPosition()
  scrolled.value = position > 0
  if (position <= 0) {
    hidden.value = false
  } else if (scrollBehavior.value === 'enter-always') {
    if (position > previousScrollPosition) hidden.value = true
    else if (position < previousScrollPosition) hidden.value = false
  } else {
    hidden.value = false
  }
  previousScrollPosition = position
}

function bindScrollTarget(): void {
  if (scrollTargetElement) scrollTargetElement.removeEventListener('scroll', readScrollState)
  scrollTargetElement = resolveScrollTarget()
  previousScrollPosition = getScrollPosition()
  scrollTargetElement?.addEventListener('scroll', readScrollState, { passive: true })
  readScrollState()
}

watch([() => props.scrollTarget, scrollBehavior], bindScrollTarget, { flush: 'post' })
onMounted(bindScrollTarget)
onMounted(syncSubtitlePresence)
onUpdated(syncSubtitlePresence)
onBeforeUnmount(() => scrollTargetElement?.removeEventListener('scroll', readScrollState))

defineExpose({
  get scrolled() {
    return scrolled.value
  },
  get collapsed() {
    return compact.value
  },
})
</script>

<template>
  <header
    v-bind="attrs"
    class="yam3x-app-bar"
    :class="[
      `yam3x-app-bar--${variant}`,
      `yam3x-app-bar--${alignment}`,
      `yam3x-app-bar--scroll-${scrollBehavior}`,
      {
        'yam3x-app-bar--scrolled': scrolled,
        'yam3x-app-bar--collapsed': compact,
        'yam3x-app-bar--hidden': hidden,
        'yam3x-app-bar--has-subtitle': hasSubtitle,
      },
    ]"
    role="banner"
    :data-variant="variant"
    :data-scroll-behavior="scrollBehavior"
    :data-scrolled="scrolled ? 'true' : undefined"
    :data-collapsed="compact ? 'true' : undefined"
    :data-hidden="hidden ? 'true' : undefined"
  >
    <div
      v-if="variant === 'search'"
      class="yam3x-app-bar__search-row"
    >
      <div class="yam3x-app-bar__leading"><slot name="leading" /></div>
      <div class="yam3x-app-bar__search-space">
        <div class="yam3x-app-bar__search-container">
          <button
            v-ripple
            type="button"
            class="yam3x-app-bar__search-trigger yam3x-state-layer"
            :aria-label="searchLabel"
            aria-haspopup="dialog"
            @click="emit('search')"
          >
            <slot name="search-leading">
              <Icon
                class="yam3x-app-bar__search-glyph"
                name="search"
              />
            </slot>
            <span class="yam3x-app-bar__search-label">{{ searchLabel }}</span>
          </button>
          <div class="yam3x-app-bar__search-trailing"><slot name="search-trailing" /></div>
        </div>
      </div>
      <div class="yam3x-app-bar__trailing"><slot name="trailing" /></div>
    </div>

    <div
      v-else-if="variant === 'small'"
      class="yam3x-app-bar__small-row"
    >
      <div class="yam3x-app-bar__leading"><slot name="leading" /></div>
      <div class="yam3x-app-bar__label">
        <h1
          v-if="slots.logo"
          class="yam3x-app-bar__title"
        >
          <slot name="logo" />
        </h1>
        <template v-else>
          <h1 class="yam3x-app-bar__title"><slot name="title" /></h1>
          <slot name="logo" />
        </template>
        <div
          ref="subtitleElement"
          class="yam3x-app-bar__subtitle"
        >
          <slot name="subtitle" />
        </div>
      </div>
      <div class="yam3x-app-bar__trailing"><slot name="trailing" /></div>
    </div>

    <div
      v-else
      class="yam3x-app-bar__flexible"
      :class="{
        'yam3x-app-bar__flexible--medium': variant === 'medium-flexible',
        'yam3x-app-bar__flexible--large': variant === 'large-flexible',
      }"
    >
      <div class="yam3x-app-bar__top-row">
        <div class="yam3x-app-bar__leading"><slot name="leading" /></div>
        <div class="yam3x-app-bar__spacer" />
        <div class="yam3x-app-bar__trailing"><slot name="trailing" /></div>
      </div>
      <div class="yam3x-app-bar__label">
        <div
          v-if="slots.logo"
          class="yam3x-app-bar__flexible-logo"
        >
          <slot name="logo" />
        </div>
        <h1 class="yam3x-app-bar__title"><slot name="title" /></h1>
        <div
          ref="subtitleElement"
          class="yam3x-app-bar__subtitle"
        >
          <slot name="subtitle" />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.yam3x-app-bar {
  --_yam3x-app-bar-color-on-surface: var(
    --yam3x-app-bar-title-text-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-app-bar-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-app-bar-color-surface: var(--md-sys-color-surface);
  --_yam3x-app-bar-color-surface-container: var(--md-sys-color-surface-container);
  --_yam3x-app-bar-color-surface-container-highest: var(--md-sys-color-surface-container-highest);
  --_yam3x-app-bar-density-spacing-scale: var(--md-sys-density-spacing-scale, 1);
  --_yam3x-app-bar-line-height-scale: var(--md-sys-typescale-line-height-scale, 1.07);
  --_yam3x-app-bar-motion-default-effects: var(--md-sys-motion-spring-default-effects);
  --_yam3x-app-bar-motion-default-spatial: var(--md-sys-motion-spring-default-spatial);
  --_yam3x-app-bar-shape-search-container: var(--md-sys-shape-corner-full);
  --_yam3x-app-bar-container-color: var(--_yam3x-app-bar-color-surface);
  --_yam3x-app-bar-container-color-on-scroll: var(--_yam3x-app-bar-color-surface-container);
  --_yam3x-app-bar-container-elevation: none;
  --_yam3x-app-bar-container-elevation-on-scroll: none;
  --_yam3x-app-bar-inline-start: 4px;
  --_yam3x-app-bar-inline-end: 4px;
  --_yam3x-app-bar-z-index: 10;
  --_yam3x-app-bar-icon-button-space: 0px;
  --_yam3x-app-bar-small-container-height: var(--yam3x-app-bar-small-container-height, 64px);
  --_yam3x-app-bar-small-heading-padding-left: var(
    --yam3x-app-bar-small-heading-padding-left,
    calc(4px * var(--_yam3x-app-bar-density-spacing-scale))
  );
  --_yam3x-app-bar-small-heading-padding-right: calc(
    4px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-small-title-text-font-size: var(
    --yam3x-app-bar-small-title-text-font-size,
    22px
  );
  --_yam3x-app-bar-small-title-text-font-weight: 400;
  --_yam3x-app-bar-small-title-text-line-height: 28px;
  --_yam3x-app-bar-small-subtitle-text-font-size: 12px;
  --_yam3x-app-bar-small-subtitle-text-font-weight: 500;
  --_yam3x-app-bar-small-subtitle-text-line-height: 16px;
  --_yam3x-app-bar-small-subtitle-text-tracking: var(
    --yam3x-app-bar-small-subtitle-text-tracking,
    0.5px
  );
  --_yam3x-app-bar-medium-container-height: 112px;
  --_yam3x-app-bar-medium-container-height-with-subtitle: 136px;
  --_yam3x-app-bar-medium-heading-padding-left: calc(
    16px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-medium-heading-padding-right: calc(
    4px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-medium-padding-top: calc(4px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-medium-padding-bottom: calc(12px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-medium-title-text-font-size: 28px;
  --_yam3x-app-bar-medium-title-text-font-weight: 400;
  --_yam3x-app-bar-medium-title-text-line-height: 36px;
  --_yam3x-app-bar-medium-subtitle-text-font-size: 14px;
  --_yam3x-app-bar-medium-subtitle-text-font-weight: 500;
  --_yam3x-app-bar-medium-subtitle-text-line-height: 20px;
  --_yam3x-app-bar-medium-subtitle-text-tracking: 0.1px;
  --_yam3x-app-bar-large-container-height: 152px;
  --_yam3x-app-bar-large-container-height-with-subtitle: 176px;
  --_yam3x-app-bar-large-heading-padding-left: calc(
    16px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-large-heading-padding-right: calc(
    4px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-large-padding-top: calc(4px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-large-padding-bottom: calc(12px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-large-title-text-font-size: 36px;
  --_yam3x-app-bar-large-title-text-font-weight: 400;
  --_yam3x-app-bar-large-title-text-line-height: 44px;
  --_yam3x-app-bar-large-subtitle-text-font-size: 16px;
  --_yam3x-app-bar-large-subtitle-text-font-weight: 500;
  --_yam3x-app-bar-large-subtitle-text-line-height: 24px;
  --_yam3x-app-bar-search-container-color: var(--_yam3x-app-bar-color-surface-container);
  --_yam3x-app-bar-search-container-color-on-scroll: var(
    --_yam3x-app-bar-color-surface-container-highest
  );
  --_yam3x-app-bar-search-label-color: var(--_yam3x-app-bar-color-on-surface-variant);
  --_yam3x-app-bar-search-container-height: 56px;
  --_yam3x-app-bar-search-row-height: 64px;
  --_yam3x-app-bar-search-control-height: 56px;
  --_yam3x-app-bar-search-label-font-size: 16px;
  --_yam3x-app-bar-search-label-line-height: 24px;
  --_yam3x-app-bar-search-icon-size: 24px;
  --_yam3x-app-bar-search-icon-label-space: calc(8px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-search-action-space: calc(8px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-search-trigger-padding-start: calc(
    16px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-search-trigger-padding-end: calc(
    8px * var(--_yam3x-app-bar-density-spacing-scale)
  );
  --_yam3x-app-bar-search-min-width: 312px;
  --_yam3x-app-bar-search-max-width: 50%;
  --_yam3x-app-bar-control-height: 48px;
  --_yam3x-app-bar-flexible-subtitle-space: calc(4px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-collapsed-label-padding: calc(4px * var(--_yam3x-app-bar-density-spacing-scale));
  --_yam3x-app-bar-collapsed-column-space: calc(4px * var(--_yam3x-app-bar-density-spacing-scale));
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  position: sticky;
  inset-block-start: 0;
  z-index: var(--_yam3x-app-bar-z-index);
  color: var(--_yam3x-app-bar-color-on-surface);
  background-color: var(--_yam3x-app-bar-container-color);
  border-radius: 0;
  box-shadow: var(--_yam3x-app-bar-container-elevation);
  transition:
    background-color var(--_yam3x-app-bar-motion-default-effects),
    box-shadow var(--_yam3x-app-bar-motion-default-effects),
    transform var(--_yam3x-app-bar-motion-default-spatial);
}
.yam3x-app-bar--hidden {
  transform: translateY(-100%);
}
.yam3x-app-bar--hidden:focus-within {
  transform: translateY(0);
}
.yam3x-app-bar[hidden] {
  display: none;
}
.yam3x-app-bar--scrolled {
  background-color: var(--_yam3x-app-bar-container-color-on-scroll);
  box-shadow: var(--_yam3x-app-bar-container-elevation-on-scroll);
}
.yam3x-app-bar__leading,
.yam3x-app-bar__trailing,
.yam3x-app-bar__search-trailing {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--_yam3x-app-bar-icon-button-space);
  min-width: 0;
}
.yam3x-app-bar__small-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0;
  min-height: var(--_yam3x-app-bar-small-container-height);
  padding-inline-start: var(--_yam3x-app-bar-inline-start);
  padding-inline-end: var(--_yam3x-app-bar-inline-end);
}
.yam3x-app-bar__small-row > .yam3x-app-bar__label {
  flex: 1 1 auto;
  min-width: 0;
  padding-inline-start: var(--_yam3x-app-bar-small-heading-padding-left);
  padding-inline-end: var(--_yam3x-app-bar-small-heading-padding-right);
}
.yam3x-app-bar--centered .yam3x-app-bar__small-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  column-gap: 0;
}
.yam3x-app-bar--centered .yam3x-app-bar__small-row > .yam3x-app-bar__leading {
  grid-column: 1;
  justify-self: start;
}
.yam3x-app-bar--centered .yam3x-app-bar__small-row > .yam3x-app-bar__label {
  grid-column: 2;
  justify-self: center;
  text-align: center;
}
.yam3x-app-bar--centered .yam3x-app-bar__small-row > .yam3x-app-bar__trailing {
  grid-column: 3;
  justify-self: end;
}
.yam3x-app-bar__label {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.yam3x-app-bar__flexible-logo {
  display: flex;
  flex: none;
}
.yam3x-app-bar__title,
.yam3x-app-bar__subtitle {
  margin: 0;
  transition:
    color var(--_yam3x-app-bar-motion-default-effects),
    font-size var(--_yam3x-app-bar-motion-default-spatial),
    font-weight var(--_yam3x-app-bar-motion-default-spatial),
    line-height var(--_yam3x-app-bar-motion-default-spatial),
    letter-spacing var(--_yam3x-app-bar-motion-default-spatial);
}
.yam3x-app-bar__title {
  color: var(--_yam3x-app-bar-color-on-surface);
  font-size: var(--_yam3x-app-bar-small-title-text-font-size);
  font-weight: var(--_yam3x-app-bar-small-title-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-small-title-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: 0;
  white-space: nowrap;
}
.yam3x-app-bar__subtitle {
  color: var(--_yam3x-app-bar-color-on-surface-variant);
  font-size: var(--_yam3x-app-bar-small-subtitle-text-font-size);
  font-weight: var(--_yam3x-app-bar-small-subtitle-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-small-subtitle-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: var(--_yam3x-app-bar-small-subtitle-text-tracking);
}
.yam3x-app-bar__top-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--_yam3x-app-bar-search-action-space);
  min-height: var(--_yam3x-app-bar-control-height);
  padding-inline: var(--_yam3x-app-bar-inline-start) var(--_yam3x-app-bar-inline-end);
}
.yam3x-app-bar__spacer {
  flex: 1 1 auto;
  min-width: 0;
}
.yam3x-app-bar__flexible {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: var(--_yam3x-app-bar-medium-container-height);
  padding-block-start: var(--_yam3x-app-bar-medium-padding-top);
  padding-block-end: var(--_yam3x-app-bar-medium-padding-bottom);
  transition:
    min-height var(--_yam3x-app-bar-motion-default-spatial),
    padding var(--_yam3x-app-bar-motion-default-spatial);
}
.yam3x-app-bar__flexible--medium .yam3x-app-bar__label {
  margin-block-start: auto;
  padding-inline-start: var(--_yam3x-app-bar-medium-heading-padding-left);
  padding-inline-end: var(--_yam3x-app-bar-medium-heading-padding-right);
}
.yam3x-app-bar__flexible--medium .yam3x-app-bar__title {
  font-size: var(--_yam3x-app-bar-medium-title-text-font-size);
  font-weight: var(--_yam3x-app-bar-medium-title-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-medium-title-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: 0;
}
.yam3x-app-bar__flexible .yam3x-app-bar__title {
  display: -webkit-box;
  overflow: hidden;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.yam3x-app-bar__flexible .yam3x-app-bar__subtitle {
  display: -webkit-box;
  overflow: hidden;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}
.yam3x-app-bar__flexible--medium .yam3x-app-bar__subtitle {
  font-size: var(--_yam3x-app-bar-medium-subtitle-text-font-size);
  font-weight: var(--_yam3x-app-bar-medium-subtitle-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-medium-subtitle-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: var(--_yam3x-app-bar-medium-subtitle-text-tracking);
}
.yam3x-app-bar__flexible--large {
  min-height: var(--_yam3x-app-bar-large-container-height);
  padding-block-start: var(--_yam3x-app-bar-large-padding-top);
  padding-block-end: var(--_yam3x-app-bar-large-padding-bottom);
}
.yam3x-app-bar--medium-flexible.yam3x-app-bar--has-subtitle .yam3x-app-bar__flexible {
  min-height: var(--_yam3x-app-bar-medium-container-height-with-subtitle);
}
.yam3x-app-bar--large-flexible.yam3x-app-bar--has-subtitle .yam3x-app-bar__flexible {
  min-height: var(--_yam3x-app-bar-large-container-height-with-subtitle);
}
.yam3x-app-bar__flexible--large .yam3x-app-bar__label {
  margin-block-start: auto;
  padding-inline-start: var(--_yam3x-app-bar-large-heading-padding-left);
  padding-inline-end: var(--_yam3x-app-bar-large-heading-padding-right);
}
.yam3x-app-bar__flexible--large .yam3x-app-bar__title {
  font-size: var(--_yam3x-app-bar-large-title-text-font-size);
  font-weight: var(--_yam3x-app-bar-large-title-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-large-title-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: 0;
}
.yam3x-app-bar__flexible--large .yam3x-app-bar__subtitle {
  font-size: var(--_yam3x-app-bar-large-subtitle-text-font-size);
  font-weight: var(--_yam3x-app-bar-large-subtitle-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-large-subtitle-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: 0;
}
.yam3x-app-bar__flexible .yam3x-app-bar__subtitle {
  margin-block-start: var(--_yam3x-app-bar-flexible-subtitle-space);
}
.yam3x-app-bar--centered .yam3x-app-bar__flexible .yam3x-app-bar__label {
  align-items: center;
  text-align: center;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__flexible {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--_yam3x-app-bar-collapsed-column-space);
  min-height: var(--_yam3x-app-bar-small-container-height);
  padding-block: 0;
}
.yam3x-app-bar--collapsed.yam3x-app-bar--has-subtitle .yam3x-app-bar__flexible {
  min-height: var(--_yam3x-app-bar-small-container-height);
}
.yam3x-app-bar--collapsed .yam3x-app-bar__flexible-logo {
  display: none;
}
.yam3x-app-bar--centered.yam3x-app-bar--collapsed .yam3x-app-bar__flexible {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}
.yam3x-app-bar--collapsed .yam3x-app-bar__top-row {
  display: contents;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__spacer {
  display: none;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__leading {
  grid-column: 1;
  grid-row: 1;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__trailing {
  grid-column: 3;
  grid-row: 1;
}
.yam3x-app-bar--centered.yam3x-app-bar--collapsed .yam3x-app-bar__trailing {
  grid-column: 3;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__label {
  grid-column: 2;
  grid-row: 1;
  margin: 0;
  padding-inline: var(--_yam3x-app-bar-collapsed-label-padding);
}
.yam3x-app-bar--centered.yam3x-app-bar--collapsed .yam3x-app-bar__label {
  text-align: center;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__title {
  display: block;
  overflow: visible;
  font-size: var(--_yam3x-app-bar-small-title-text-font-size);
  font-weight: var(--_yam3x-app-bar-small-title-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-small-title-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  white-space: nowrap;
}
.yam3x-app-bar--collapsed .yam3x-app-bar__subtitle {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: var(--_yam3x-app-bar-small-subtitle-text-font-size);
  font-weight: var(--_yam3x-app-bar-small-subtitle-text-font-weight);
  line-height: calc(
    var(--_yam3x-app-bar-small-subtitle-text-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  letter-spacing: var(--_yam3x-app-bar-small-subtitle-text-tracking);
}
.yam3x-app-bar__search-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--_yam3x-app-bar-search-action-space);
  min-height: var(--_yam3x-app-bar-search-row-height);
  padding-inline-start: var(--_yam3x-app-bar-inline-start);
  padding-inline-end: var(--_yam3x-app-bar-inline-end);
}
.yam3x-app-bar__search-space {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  justify-content: center;
}
.yam3x-app-bar__search-container {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: min(
    100%,
    max(var(--_yam3x-app-bar-search-min-width), var(--_yam3x-app-bar-search-max-width))
  );
  min-width: 0;
  min-height: var(--_yam3x-app-bar-search-container-height);
  overflow: hidden;
  border-radius: var(--_yam3x-app-bar-shape-search-container);
  background: var(--_yam3x-app-bar-search-container-color);
  color: var(--_yam3x-app-bar-search-label-color);
  transition: background-color var(--_yam3x-app-bar-motion-default-effects);
}
.yam3x-app-bar--scrolled .yam3x-app-bar__search-container {
  background: var(--_yam3x-app-bar-search-container-color-on-scroll);
}
.yam3x-app-bar__search-trigger {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--_yam3x-app-bar-search-icon-label-space);
  min-width: 0;
  min-height: var(--_yam3x-app-bar-search-control-height);
  padding-inline: var(--_yam3x-app-bar-search-trigger-padding-start)
    var(--_yam3x-app-bar-search-trigger-padding-end);
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--_yam3x-app-bar-search-label-font-size);
  line-height: calc(
    var(--_yam3x-app-bar-search-label-line-height) * var(--_yam3x-app-bar-line-height-scale)
  );
  text-align: start;
  cursor: pointer;
  --yam3x-state-layer-color: currentColor;
}
.yam3x-app-bar__search-glyph {
  display: grid;
  flex: none;
  width: var(--_yam3x-app-bar-search-icon-size);
  height: var(--_yam3x-app-bar-search-icon-size);
  place-items: center;
  font-size: var(--_yam3x-app-bar-search-icon-size);
}
.yam3x-app-bar__search-trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
.yam3x-app-bar__search-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.yam3x-app-bar__search-trailing {
  padding-inline-end: var(--_yam3x-app-bar-search-action-space);
}
.yam3x-app-bar--centered .yam3x-app-bar__flexible .yam3x-app-bar__top-row {
  justify-content: space-between;
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-app-bar,
  .yam3x-app-bar__flexible,
  .yam3x-app-bar__title,
  .yam3x-app-bar__subtitle,
  .yam3x-app-bar__search-container {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-app-bar,
  .yam3x-app-bar--scrolled {
    background: Canvas;
    color: CanvasText;
    box-shadow: none;
    outline: 1px solid CanvasText;
  }
  .yam3x-app-bar__title {
    color: CanvasText;
  }
  .yam3x-app-bar__subtitle {
    color: FieldText;
  }
  .yam3x-app-bar__search-container {
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
  }
  .yam3x-app-bar__search-trigger:focus-visible {
    outline-color: Highlight;
  }
}
</style>
