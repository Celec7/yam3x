<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { vRipple } from '../_shared/ripple'
import Icon from '../icon/icon.vue'

const props = withDefaults(
  defineProps<{
    locale?: string
    label: string
    value?: string
    variant?: 'outlined' | 'elevated'
    disabled?: boolean
    removable?: boolean
    removeLabel?: string
  }>(),
  {
    value: undefined,
    variant: 'outlined',
    disabled: false,
    removable: true,
    removeLabel: undefined,
  },
)

const selected = defineModel<boolean>('selected', { default: false })
const emit = defineEmits<{ click: [event: MouseEvent]; remove: [value: string] }>()
defineSlots<{
  default?(): unknown
  avatar?(): unknown
  icon?(): unknown
  'remove-icon'?(): unknown
}>()

const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => undefined,
)

function onMainClick(event: MouseEvent): void {
  emit('click', event)
  if (!props.disabled && !event.defaultPrevented) selected.value = !selected.value
}

function remove(): void {
  if (!props.disabled && props.removable) emit('remove', props.value ?? props.label)
}
function onKeydown(event: KeyboardEvent): void {
  if ((event.key === 'Backspace' || event.key === 'Delete') && props.removable) {
    event.preventDefault()
    remove()
  }
}
</script>

<template>
  <span
    class="yam3x-chip yam3x-input-chip"
    :class="[
      `yam3x-chip--${variant}`,
      {
        'yam3x-input-chip--disabled': disabled,
        'yam3x-input-chip--selected': selected,
        'yam3x-input-chip--has-avatar': Boolean($slots.avatar),
        'yam3x-input-chip--has-icon': Boolean($slots.icon),
      },
    ]"
    :data-value="value ?? label"
    @keydown="onKeydown"
  >
    <button
      v-ripple
      type="button"
      class="yam3x-input-chip__main yam3x-state-layer"
      :disabled="disabled"
      :aria-label="label"
      :aria-pressed="selected ? 'true' : 'false'"
      @click="onMainClick"
    >
      <span
        v-if="$slots.avatar"
        class="yam3x-input-chip__avatar"
        aria-hidden="true"
        ><slot name="avatar"
      /></span>
      <span
        v-else-if="$slots.icon"
        class="yam3x-chip__icon"
        aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span class="yam3x-chip__label"
        ><slot>{{ label }}</slot></span
      >
    </button>
    <button
      v-if="removable"
      v-ripple
      type="button"
      class="yam3x-input-chip__remove yam3x-state-layer"
      :disabled="disabled"
      :aria-label="removeLabel ?? actionMessages.removeItem(label)"
      @click="remove"
    >
      <slot name="remove-icon">
        <Icon name="close" />
      </slot>
    </button>
  </span>
</template>

<style src="./chip.styles.css"></style>
<style scoped>
.yam3x-input-chip {
  --_yam3x-input-chip-outline-color: var(--md-sys-color-outline);
  --_yam3x-input-chip-label-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-input-chip-selected-container-color: var(--md-sys-color-secondary-container);
  --_yam3x-input-chip-selected-label-color: var(--md-sys-color-on-secondary-container);
  --_yam3x-input-chip-state-layer-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-input-chip-inline-padding: var(
    --md-sys-spacing-8,
    calc(8px * var(--md-sys-density-spacing-scale, 1))
  );
  --_yam3x-input-chip-action-size: 48px;
  --_yam3x-input-chip-avatar-size: 24px;
  --_yam3x-input-chip-avatar-shape: 12px;
  --_yam3x-input-chip-icon-size: 18px;
  min-width: 96px;
  padding: 0;
  gap: 0;
  border-color: var(--_yam3x-input-chip-outline-color);
  color: var(--_yam3x-input-chip-label-color);
}
.yam3x-input-chip.yam3x-chip--elevated {
  border-color: transparent;
}
.yam3x-input-chip--disabled:not(.yam3x-chip--elevated) {
  border-color: var(--_yam3x-chip-disabled-container);
}
.yam3x-input-chip--disabled.yam3x-chip--elevated {
  background: var(--_yam3x-chip-disabled-container);
  box-shadow: none;
}
.yam3x-input-chip--selected {
  --_yam3x-chip-icon-color: var(--_yam3x-input-chip-selected-label-color);
  border-color: transparent;
  background: var(--_yam3x-input-chip-selected-container-color);
  color: var(--_yam3x-input-chip-selected-label-color);
}
.yam3x-input-chip__main,
.yam3x-input-chip__remove {
  --yam3x-state-layer-color: var(--_yam3x-input-chip-state-layer-color);
  position: relative;
  display: inline-flex;
  height: var(--_yam3x-chip-container-height);
  min-width: var(--_yam3x-input-chip-action-size);
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}
.yam3x-input-chip .yam3x-input-chip__main:focus-visible,
.yam3x-input-chip .yam3x-input-chip__remove:focus-visible {
  outline: 3px solid var(--_yam3x-chip-focus-indicator);
  outline-offset: 2px;
}
.yam3x-input-chip__main {
  flex: 1 1 auto;
  gap: var(--_yam3x-chip-gap);
  padding-inline: var(--_yam3x-input-chip-inline-padding);
  border-start-start-radius: var(--_yam3x-chip-shape);
  border-end-start-radius: var(--_yam3x-chip-shape);
}
.yam3x-input-chip__remove {
  width: var(--_yam3x-input-chip-action-size);
  flex: none;
  border-start-end-radius: var(--_yam3x-chip-shape);
  border-end-end-radius: var(--_yam3x-chip-shape);
}
.yam3x-input-chip__main::before,
.yam3x-input-chip__remove::before {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 0;
  width: 100%;
  height: var(--_yam3x-input-chip-action-size);
  transform: translateY(-50%);
  content: '';
}
.yam3x-input-chip__main:disabled,
.yam3x-input-chip__remove:disabled {
  cursor: not-allowed;
  color: var(--_yam3x-chip-disabled-content);
}
.yam3x-input-chip__avatar {
  display: inline-flex;
  width: var(--_yam3x-input-chip-avatar-size);
  height: var(--_yam3x-input-chip-avatar-size);
  flex: none;
  overflow: hidden;
  border-radius: var(--_yam3x-input-chip-avatar-shape);
}
.yam3x-input-chip__avatar :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.yam3x-input-chip__main .yam3x-chip__label {
  max-width: 20ch;
}
.yam3x-input-chip__remove :deep(svg) {
  width: var(--_yam3x-input-chip-icon-size);
  height: var(--_yam3x-input-chip-icon-size);
}
@media (forced-colors: active) {
  .yam3x-input-chip--selected {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .yam3x-input-chip__main:disabled,
  .yam3x-input-chip__remove:disabled {
    color: GrayText;
  }
  .yam3x-input-chip .yam3x-input-chip__main:focus-visible,
  .yam3x-input-chip .yam3x-input-chip__remove:focus-visible {
    outline-color: Highlight;
  }
}
</style>
