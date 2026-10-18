<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { computed } from 'vue'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'
import type { BreadcrumbItemData } from './breadcrumb.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    locale?: string
    items?: BreadcrumbItemData[]
    currentIndex?: number
    ariaLabel?: string
    ariaLabelledby?: string
    wrap?: boolean
  }>(),
  {
    items: () => [],
    currentIndex: undefined,
    ariaLabel: undefined,
    ariaLabelledby: undefined,
    wrap: false,
  },
)

const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)

const resolvedCurrentIndex = computed(() => {
  const index = props.currentIndex ?? props.items.length - 1
  return Number.isInteger(index) && index >= 0 && index < props.items.length ? index : -1
})
const navigationLabel = computed(() =>
  props.ariaLabelledby ? undefined : props.ariaLabel || actionMessages.value.breadcrumb,
)
</script>

<template>
  <nav
    v-bind="$attrs"
    class="yam3x-breadcrumb"
    :aria-label="navigationLabel"
    :aria-labelledby="ariaLabelledby || undefined"
    :data-wrap="wrap || undefined"
  >
    <ol class="yam3x-breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="`${index}:${item.href ?? ''}:${item.label}`"
        class="yam3x-breadcrumb__entry"
      >
        <a
          v-if="item.href && !item.disabled"
          v-ripple
          class="yam3x-breadcrumb__item yam3x-breadcrumb__item--link yam3x-state-layer"
          data-yam3x-ripple
          :class="{
            'yam3x-breadcrumb__item--current': index === resolvedCurrentIndex,
            'yam3x-breadcrumb__item--icon-only': item.iconOnly,
          }"
          :aria-label="item.iconOnly ? item.label : undefined"
          :href="item.href"
          :target="item.target || undefined"
          :rel="item.rel || undefined"
          :download="item.download || undefined"
          :aria-current="index === resolvedCurrentIndex ? 'page' : undefined"
        >
          <span
            v-if="$slots.icon"
            class="yam3x-breadcrumb__icon"
            aria-hidden="true"
            ><slot
              name="icon"
              :item="item"
              :index="index"
              :current="index === resolvedCurrentIndex"
          /></span>
          <span
            class="yam3x-breadcrumb__label"
            :aria-hidden="item.iconOnly ? 'true' : undefined"
            ><slot
              name="item"
              :item="item"
              :index="index"
              :current="index === resolvedCurrentIndex"
              >{{ item.label }}</slot
            ></span
          >
        </a>
        <span
          v-else
          class="yam3x-breadcrumb__item"
          :class="{
            'yam3x-breadcrumb__item--current': index === resolvedCurrentIndex,
            'yam3x-breadcrumb__item--disabled': item.disabled,
            'yam3x-breadcrumb__item--icon-only': item.iconOnly,
          }"
          :aria-label="item.iconOnly ? item.label : undefined"
          :aria-current="index === resolvedCurrentIndex ? 'page' : undefined"
          :aria-disabled="item.disabled ? 'true' : undefined"
        >
          <span
            v-if="$slots.icon"
            class="yam3x-breadcrumb__icon"
            aria-hidden="true"
            ><slot
              name="icon"
              :item="item"
              :index="index"
              :current="index === resolvedCurrentIndex"
          /></span>
          <span class="yam3x-breadcrumb__label"
            ><slot
              name="item"
              :item="item"
              :index="index"
              :current="index === resolvedCurrentIndex"
              >{{ item.label }}</slot
            ></span
          >
        </span>
        <span
          v-if="index < items.length - 1"
          class="yam3x-breadcrumb__separator"
          aria-hidden="true"
        >
          <slot
            name="separator"
            :index="index"
          >
            <Icon
              class="yam3x-breadcrumb__separator-icon"
              name="chevron_right"
            />
          </slot>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.yam3x-breadcrumb {
  --_yam3x-breadcrumb-system-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-breadcrumb-system-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-breadcrumb-system-color-primary: var(--md-sys-color-primary);
  --_yam3x-breadcrumb-system-density-spacing-scale: var(--md-sys-density-spacing-scale);
  --_yam3x-breadcrumb-system-motion-spring-fast-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-breadcrumb-system-state-focus-opacity: var(--md-sys-state-focus-opacity);
  --_yam3x-breadcrumb-system-state-hover-opacity: var(--md-sys-state-hover-opacity);
  --_yam3x-breadcrumb-system-state-pressed-opacity: var(--md-sys-state-pressed-opacity);
  --_yam3x-breadcrumb-system-typescale-label-large-size: var(--md-sys-typescale-label-large-size);
  --_yam3x-breadcrumb-system-typescale-label-large-weight: var(
    --md-sys-typescale-label-large-weight
  );
  --_yam3x-breadcrumb-system-typescale-label-large-line-height: var(
    --md-sys-typescale-label-large-line-height
  );
  --_yam3x-breadcrumb-system-typescale-label-large-tracking: var(
    --md-sys-typescale-label-large-tracking
  );
  display: block;
  min-inline-size: 0;
  max-inline-size: 100%;
  color: var(--_yam3x-breadcrumb-system-color-on-surface);
}
.yam3x-breadcrumb__list {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  inline-size: max-content;
  min-inline-size: 100%;
  max-inline-size: 100%;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
  overscroll-behavior-inline: contain;
}
.yam3x-breadcrumb[data-wrap] .yam3x-breadcrumb__list {
  inline-size: 100%;
  flex-wrap: wrap;
  overflow: visible;
}
.yam3x-breadcrumb__entry {
  box-sizing: border-box;
  display: flex;
  flex: none;
  align-items: center;
  min-inline-size: 0;
  min-block-size: 48px;
}
.yam3x-breadcrumb[data-wrap] .yam3x-breadcrumb__entry {
  max-inline-size: 100%;
}
.yam3x-breadcrumb__item {
  box-sizing: border-box;
  isolation: isolate;
  position: relative;
  display: inline-flex;
  flex: 0 1 auto;
  align-items: center;
  justify-content: center;
  column-gap: var(
    --yam3x-breadcrumb-item-icon-label-space,
    calc(8px * var(--_yam3x-breadcrumb-system-density-spacing-scale, 1))
  );
  min-inline-size: 0;
  block-size: var(--yam3x-breadcrumb-item-container-height, 40px);
  max-inline-size: 100%;
  padding-inline: var(
    --yam3x-breadcrumb-item-label-padding-inline,
    calc(12px * var(--_yam3x-breadcrumb-system-density-spacing-scale, 1))
  );
  overflow: hidden;
  border: 0;
  border-radius: var(--yam3x-breadcrumb-item-shape, 9999px);
  background: transparent;
  color: var(--yam3x-breadcrumb-item-label-color, var(--_yam3x-breadcrumb-system-color-primary));
  font: inherit;
  font-size: var(
    --yam3x-breadcrumb-item-label-font-size,
    var(--_yam3x-breadcrumb-system-typescale-label-large-size, 14px)
  );
  font-weight: var(
    --yam3x-breadcrumb-item-label-font-weight,
    var(--_yam3x-breadcrumb-system-typescale-label-large-weight, 500)
  );
  line-height: var(
    --yam3x-breadcrumb-item-label-line-height,
    var(--_yam3x-breadcrumb-system-typescale-label-large-line-height, 20px)
  );
  letter-spacing: var(
    --yam3x-breadcrumb-item-label-tracking,
    var(--_yam3x-breadcrumb-system-typescale-label-large-tracking, 0.1px)
  );
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.yam3x-breadcrumb__item::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  background: var(--_yam3x-breadcrumb-state-color, var(--_yam3x-breadcrumb-system-color-primary));
  content: '';
  opacity: 0;
  transition: opacity var(--_yam3x-breadcrumb-system-motion-spring-fast-effects);
}
.yam3x-breadcrumb__item--link {
  --_yam3x-breadcrumb-state-color: var(
    --yam3x-breadcrumb-item-label-hover-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-primary)
  );
  --yam3x-ripple-color: var(
    --yam3x-breadcrumb-item-label-pressed-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-primary)
  );
}
.yam3x-breadcrumb__item--link:hover::before {
  opacity: var(--_yam3x-breadcrumb-system-state-hover-opacity, 0.08);
}
.yam3x-breadcrumb__item--link:focus-visible {
  outline: 2px solid var(--_yam3x-breadcrumb-system-color-primary);
  outline-offset: 2px;
}
.yam3x-breadcrumb__item--link:focus-visible::before {
  background: var(
    --yam3x-breadcrumb-item-label-focus-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-primary)
  );
  opacity: var(--_yam3x-breadcrumb-system-state-focus-opacity, 0.1);
}
.yam3x-breadcrumb__item--link:active::before,
.yam3x-breadcrumb__item--link[data-yam3x-pressed]::before {
  background: var(
    --yam3x-breadcrumb-item-label-pressed-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-primary)
  );
  opacity: var(--_yam3x-breadcrumb-system-state-pressed-opacity, 0.1);
}
.yam3x-breadcrumb__item--current {
  color: var(--yam3x-breadcrumb-item-last-color, var(--_yam3x-breadcrumb-system-color-on-surface));
  cursor: default;
}
.yam3x-breadcrumb__item--link.yam3x-breadcrumb__item--current {
  color: var(--yam3x-breadcrumb-item-label-color, var(--_yam3x-breadcrumb-system-color-primary));
  cursor: pointer;
}
.yam3x-breadcrumb__item--disabled {
  color: color-mix(
    in srgb,
    var(--yam3x-breadcrumb-item-disabled-color, var(--_yam3x-breadcrumb-system-color-on-surface))
      var(--yam3x-breadcrumb-item-disabled-opacity, 38%),
    transparent
  );
  cursor: default;
}
.yam3x-breadcrumb__item--disabled::before,
.yam3x-breadcrumb__item--current:not(.yam3x-breadcrumb__item--link)::before {
  display: none;
}
.yam3x-breadcrumb__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(
    --yam3x-breadcrumb-item-icon-color,
    var(--_yam3x-breadcrumb-system-color-on-surface-variant)
  );
  font-size: var(--yam3x-breadcrumb-item-icon-size, 20px);
}
.yam3x-breadcrumb__icon:empty {
  display: none;
}
.yam3x-breadcrumb__icon :deep(svg) {
  inline-size: 1em;
  block-size: 1em;
}
.yam3x-breadcrumb__item--icon-only {
  inline-size: calc(var(--yam3x-breadcrumb-item-container-height, 40px) - 3px);
  padding-inline: var(
    --yam3x-breadcrumb-item-icon-padding-inline,
    calc(0px * var(--_yam3x-breadcrumb-system-density-spacing-scale, 1))
  );
  --_yam3x-breadcrumb-state-color: var(
    --yam3x-breadcrumb-item-icon-hover-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-on-surface)
  );
  --yam3x-ripple-color: var(
    --yam3x-breadcrumb-item-icon-pressed-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-on-surface)
  );
}
.yam3x-breadcrumb__item--icon-only .yam3x-breadcrumb__icon {
  color: var(
    --yam3x-breadcrumb-item-icon-color,
    var(--_yam3x-breadcrumb-system-color-on-surface-variant)
  );
}
.yam3x-breadcrumb__item--icon-only:focus-visible::before {
  background: var(
    --yam3x-breadcrumb-item-icon-focus-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-on-surface)
  );
  opacity: var(--_yam3x-breadcrumb-system-state-focus-opacity, 0.1);
}
.yam3x-breadcrumb__item--icon-only:active::before,
.yam3x-breadcrumb__item--icon-only[data-yam3x-pressed]::before {
  background: var(
    --yam3x-breadcrumb-item-icon-pressed-state-layer-color,
    var(--_yam3x-breadcrumb-system-color-on-surface)
  );
}
.yam3x-breadcrumb__item--icon-only .yam3x-breadcrumb__label {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.yam3x-breadcrumb__label {
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.yam3x-breadcrumb__separator {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-inline-size: 8px;
  padding-inline: calc(4px * var(--_yam3x-breadcrumb-system-density-spacing-scale, 1));
  color: var(--_yam3x-breadcrumb-system-color-on-surface-variant);
}
.yam3x-breadcrumb__separator-icon {
  inline-size: var(--yam3x-breadcrumb-separator-icon-size, 20px);
  block-size: var(--yam3x-breadcrumb-separator-icon-size, 20px);
}
:dir(rtl) .yam3x-breadcrumb__separator-icon {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-breadcrumb__item::before {
    transition: none;
  }
}
@media (forced-colors: active) {
  .yam3x-breadcrumb__item--link {
    color: LinkText;
  }
  .yam3x-breadcrumb__item:focus-visible {
    outline-color: Highlight;
  }
  .yam3x-breadcrumb__item--disabled {
    color: GrayText;
  }
}
</style>
