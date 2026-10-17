<script setup lang="ts">
import { Switch } from '@ark-ui/vue/switch'
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import Icon from '../icon/icon.vue'

type SwitchIcons = 'none' | 'selected' | 'both'
type Direction = 'ltr' | 'rtl'

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    disabled?: boolean
    dir?: Direction
    icons?: SwitchIcons
    id?: string
    name?: string
    value?: string
    form?: string
    required?: boolean
  }>(),
  {
    description: undefined,
    disabled: false,
    dir: undefined,
    icons: 'none',
    id: undefined,
    name: undefined,
    value: 'on',
    form: undefined,
    required: false,
  },
)
const checked = defineModel<boolean>({ default: false })
const slots = defineSlots<{
  'thumb-content'?(props: { checked: boolean }): unknown
}>()
const descriptionId = `${useId()}-description`

const iconMode = computed<SwitchIcons>(() =>
  props.icons === 'selected' || props.icons === 'both' ? props.icons : 'none',
)

const rootElement = ref<unknown>(null)
const formDisabled = ref(false)
const touchActive = ref(false)
let fieldsetObserver: MutationObserver | undefined
let enterKeyPressed = false

function onEnterKeyDown(event: KeyboardEvent) {
  if (props.disabled || event.target !== event.currentTarget) return
  event.preventDefault()
  enterKeyPressed = true
}

function onEnterKeyUp(event: KeyboardEvent) {
  if (!enterKeyPressed || event.target !== event.currentTarget) return
  event.preventDefault()
  enterKeyPressed = false
  if (!props.disabled) (event.currentTarget as HTMLInputElement).click()
}

function onInputBlur() {
  enterKeyPressed = false
}

function onPointerDown(event: PointerEvent) {
  if (!props.disabled && event.pointerType === 'touch') touchActive.value = true
}

function onTouchEnd() {
  touchActive.value = false
}

function getRootElement() {
  const root = rootElement.value as unknown
  if (typeof HTMLElement !== 'undefined' && root instanceof HTMLElement) return root
  const element = (root as { $el?: unknown } | null)?.$el
  return typeof HTMLElement !== 'undefined' && element instanceof HTMLElement ? element : null
}

function updateFormDisabled() {
  if (props.disabled) {
    formDisabled.value = false
    return
  }
  const input = getRootElement()?.querySelector<HTMLInputElement>('.yam3x-switch__input')
  formDisabled.value = Boolean(input?.matches(':disabled') && input.closest('fieldset:disabled'))
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) touchActive.value = false
    updateFormDisabled()
  },
)

onMounted(() => {
  updateFormDisabled()
  document.addEventListener('touchend', onTouchEnd, true)
  document.addEventListener('touchcancel', onTouchEnd, true)
  let ancestor = getRootElement()?.parentElement
  if (!ancestor || typeof MutationObserver === 'undefined') return

  fieldsetObserver = new MutationObserver(updateFormDisabled)
  while (ancestor) {
    fieldsetObserver.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] })
    ancestor = ancestor.parentElement
  }
})

onBeforeUnmount(() => {
  fieldsetObserver?.disconnect()
  if (typeof document !== 'undefined') {
    document.removeEventListener('touchend', onTouchEnd, true)
    document.removeEventListener('touchcancel', onTouchEnd, true)
  }
})
</script>

<template>
  <Switch.Root
    ref="rootElement"
    v-model:checked="checked"
    :disabled="disabled || formDisabled"
    :dir="dir"
    :style="{ direction: dir ?? 'inherit' }"
    :name="name"
    :value="value"
    :form="form"
    :ids="id ? { hiddenInput: id } : undefined"
    :required="required"
    :data-icons="iconMode"
    :data-touch-active="touchActive ? '' : undefined"
    class="yam3x-switch"
    @pointerdown.capture="onPointerDown"
  >
    <Switch.Control class="yam3x-switch__track">
      <Switch.Thumb class="yam3x-switch__thumb">
        <span
          v-if="slots['thumb-content']"
          class="yam3x-switch__custom-thumb-content"
          aria-hidden="true"
        >
          <slot
            name="thumb-content"
            :checked="checked"
          />
        </span>
        <template v-else>
          <Icon
            v-if="checked && iconMode !== 'none'"
            class="yam3x-switch__icon"
            aria-hidden="true"
            name="check"
          />
          <Icon
            v-else-if="!checked && iconMode === 'both'"
            class="yam3x-switch__icon"
            aria-hidden="true"
            name="close"
          />
        </template>
      </Switch.Thumb>
    </Switch.Control>
    <span class="yam3x-switch__label-content">
      <Switch.Label class="yam3x-switch__label">{{ label }}</Switch.Label>
      <span
        v-if="description"
        :id="descriptionId"
        class="yam3x-switch__description"
        >{{ description }}</span
      >
    </span>
    <Switch.HiddenInput
      role="switch"
      :aria-checked="checked"
      :aria-describedby="description ? descriptionId : undefined"
      class="yam3x-switch__input"
      @keydown.enter="onEnterKeyDown"
      @keyup.enter="onEnterKeyUp"
      @blur="onInputBlur"
    />
  </Switch.Root>
</template>

<style scoped>
.yam3x-switch {
  --_yam3x-switch-color-track-selected: var(--md-sys-color-primary);
  --_yam3x-switch-color-track-unselected: var(--md-sys-color-surface-container-highest);
  --_yam3x-switch-color-track-outline: var(--md-sys-color-outline);
  --_yam3x-switch-color-handle-selected: var(--md-sys-color-on-primary);
  --_yam3x-switch-color-handle-unselected: var(--md-sys-color-outline);
  --_yam3x-switch-color-handle-hover-unselected: var(--md-sys-color-on-surface-variant);
  --_yam3x-switch-color-handle-hover-selected: var(--md-sys-color-primary-container);
  --_yam3x-switch-color-icon-selected: var(--md-sys-color-primary);
  --_yam3x-switch-color-icon-unselected: var(--md-sys-color-surface-container-highest);
  --_yam3x-switch-color-state-layer-selected: var(--md-sys-color-primary);
  --_yam3x-switch-color-state-layer-unselected: var(--md-sys-color-on-surface);
  --_yam3x-switch-color-disabled-track-selected: var(--md-sys-color-on-surface);
  --_yam3x-switch-color-disabled-track-unselected: var(--md-sys-color-surface-container-highest);
  --_yam3x-switch-color-disabled-handle-selected: var(--md-sys-color-surface);
  --_yam3x-switch-color-disabled-handle-unselected: var(--md-sys-color-on-surface);
  --_yam3x-switch-color-disabled-icon-selected: var(--md-sys-color-on-surface);
  --_yam3x-switch-color-disabled-icon-unselected: var(--md-sys-color-surface-container-highest);
  --_yam3x-switch-color-focus-indicator: var(--md-sys-color-secondary);
  --_yam3x-switch-color-disabled-outline: var(--md-sys-color-on-surface);
  --_yam3x-switch-color-label: var(--md-sys-color-on-surface);
  --_yam3x-switch-color-description: var(--md-sys-color-on-surface-variant);
  --_yam3x-switch-shape-track: var(--md-sys-shape-corner-full);
  --_yam3x-switch-shape-handle: var(--md-sys-shape-corner-full);
  --_yam3x-switch-shape-state-layer: var(--md-sys-shape-corner-full);
  --_yam3x-switch-motion-spatial: var(--md-sys-motion-spring-fast-spatial);
  --_yam3x-switch-motion-effects: var(--md-sys-motion-spring-fast-effects);
  --_yam3x-switch-motion-focus: var(--md-sys-motion-spring-default-effects);
  --_yam3x-switch-type-label-family: var(--md-sys-typescale-label-large-font-family);
  --_yam3x-switch-type-label-size: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-switch-type-label-weight: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-switch-type-label-line-height: var(--md-sys-typescale-label-large-line-height);
  --_yam3x-switch-type-label-tracking: var(--md-sys-typescale-label-large-tracking);
  --_yam3x-switch-type-description-family: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-switch-type-description-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-switch-type-description-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-switch-type-description-line-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-switch-type-description-tracking: var(--md-sys-typescale-body-medium-tracking);
  --_yam3x-switch-track-width: 52px;
  --_yam3x-switch-track-height: 32px;
  --_yam3x-switch-track-outline-width: 2px;
  --_yam3x-switch-handle-size-unselected: 16px;
  --_yam3x-switch-handle-size-selected: 24px;
  --_yam3x-switch-handle-size-with-icon: 24px;
  --_yam3x-switch-handle-size-pressed: 28px;
  --_yam3x-switch-icon-size: 16px;
  --_yam3x-switch-state-layer-size: 40px;
  --_yam3x-switch-target-size: 48px;
  --_yam3x-switch-label-gap: 12px;
  --_yam3x-switch-description-gap: 2px;
  --_yam3x-switch-opacity-hover: 8%;
  --_yam3x-switch-opacity-focus: 10%;
  --_yam3x-switch-opacity-pressed: 10%;
  --_yam3x-switch-opacity-disabled-track: 12%;
  --_yam3x-switch-opacity-disabled-content: 38%;
  display: inline-flex;
  min-height: var(--_yam3x-switch-target-size);
  align-items: center;
  gap: var(--_yam3x-switch-label-gap);
  color: var(--_yam3x-switch-color-label);
  cursor: pointer;
}
.yam3x-switch__track {
  position: relative;
  display: grid;
  flex-shrink: 0;
  place-items: center;
  direction: inherit;
  overflow: visible;
  width: var(--_yam3x-switch-track-width);
  height: var(--_yam3x-switch-track-height);
  border: var(--_yam3x-switch-track-outline-width) solid var(--_yam3x-switch-color-track-outline);
  border-radius: var(--_yam3x-switch-shape-track);
  background: var(--_yam3x-switch-color-track-unselected);
  transition: background-color var(--_yam3x-switch-motion-effects);
}
.yam3x-switch__thumb {
  position: absolute;
  top: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  isolation: isolate;
  direction: inherit;
  inset-inline-start: 0;
  width: var(--_yam3x-switch-handle-size-unselected);
  height: var(--_yam3x-switch-handle-size-unselected);
  border-radius: var(--_yam3x-switch-shape-handle);
  background: var(--_yam3x-switch-color-handle-unselected);
  color: var(--_yam3x-switch-color-icon-unselected);
  --_yam3x-switch-thumb-offset: var(--_yam3x-switch-track-outline-width);
  transition:
    background-color var(--_yam3x-switch-motion-effects),
    transform var(--_yam3x-switch-motion-spatial),
    width var(--_yam3x-switch-motion-effects),
    height var(--_yam3x-switch-motion-effects);
  transform: translate(var(--_yam3x-switch-thumb-offset), -50%);
}
.yam3x-switch__thumb::before {
  position: absolute;
  z-index: 0;
  top: 50%;
  left: 50%;
  width: var(--_yam3x-switch-state-layer-size);
  height: var(--_yam3x-switch-state-layer-size);
  border-radius: var(--_yam3x-switch-shape-state-layer);
  background-color: transparent;
  content: '';
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: background-color var(--_yam3x-switch-motion-focus);
}
.yam3x-switch__icon,
.yam3x-switch__custom-thumb-content {
  position: relative;
  z-index: 1;
  width: var(--_yam3x-switch-icon-size);
  height: var(--_yam3x-switch-icon-size);
  font-size: var(--_yam3x-switch-icon-size);
}
.yam3x-switch__custom-thumb-content {
  display: grid;
  place-items: center;
  --yam3x-icon-size: var(--_yam3x-switch-icon-size);
}
.yam3x-switch__label-content {
  display: grid;
  gap: var(--_yam3x-switch-description-gap);
  text-align: left;
}
.yam3x-switch__label {
  color: var(--_yam3x-switch-color-label);
  font-family: var(--_yam3x-switch-type-label-family);
  font-size: var(--_yam3x-switch-type-label-size);
  font-weight: var(--_yam3x-switch-type-label-weight);
  line-height: var(--_yam3x-switch-type-label-line-height);
  letter-spacing: var(--_yam3x-switch-type-label-tracking);
}
.yam3x-switch__description {
  color: var(--_yam3x-switch-color-description);
  font-family: var(--_yam3x-switch-type-description-family);
  font-size: var(--_yam3x-switch-type-description-size);
  font-weight: var(--_yam3x-switch-type-description-weight);
  line-height: var(--_yam3x-switch-type-description-line-height);
  letter-spacing: var(--_yam3x-switch-type-description-tracking);
}
.yam3x-switch[data-state='checked'] .yam3x-switch__track {
  border-width: 0;
  background: var(--_yam3x-switch-color-track-selected);
}
.yam3x-switch[data-state='checked'] .yam3x-switch__thumb {
  --_yam3x-switch-thumb-offset: calc(
    var(--_yam3x-switch-track-width) - var(--_yam3x-switch-handle-size-selected) - 2 *
      var(--_yam3x-switch-track-outline-width)
  );
  width: var(--_yam3x-switch-handle-size-selected);
  height: var(--_yam3x-switch-handle-size-selected);
  background: var(--_yam3x-switch-color-handle-selected);
  color: var(--_yam3x-switch-color-icon-selected);
}
.yam3x-switch[data-state='unchecked'][data-icons='both']:not([data-disabled]):not(
    [data-active]
  ):not([data-touch-active])
  .yam3x-switch__thumb {
  width: var(--_yam3x-switch-handle-size-with-icon);
  height: var(--_yam3x-switch-handle-size-with-icon);
}
.yam3x-switch[data-state='unchecked'][data-hover]:not([data-disabled])
  .yam3x-switch__thumb::before {
  background-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-state-layer-unselected) var(--_yam3x-switch-opacity-hover),
    transparent
  );
}
.yam3x-switch[data-state='checked'][data-hover]:not([data-disabled]) .yam3x-switch__thumb::before {
  background-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-state-layer-selected) var(--_yam3x-switch-opacity-hover),
    transparent
  );
}
.yam3x-switch[data-hover]:not([data-disabled]) .yam3x-switch__thumb {
  background: var(--_yam3x-switch-color-handle-hover-unselected);
}
.yam3x-switch[data-state='checked'][data-hover]:not([data-disabled]) .yam3x-switch__thumb {
  background: var(--_yam3x-switch-color-handle-hover-selected);
}
.yam3x-switch[data-hover]:not([data-disabled]) .yam3x-switch__track {
  border-color: var(--_yam3x-switch-color-track-outline);
}
.yam3x-switch[data-hover]:not([data-disabled]) .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-icon-unselected);
}
.yam3x-switch[data-state='checked'][data-hover]:not([data-disabled]) .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-icon-selected);
}
.yam3x-switch[data-state='unchecked'][data-focus-visible]:not([data-disabled])
  .yam3x-switch__thumb::before {
  background-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-state-layer-unselected) var(--_yam3x-switch-opacity-focus),
    transparent
  );
}
.yam3x-switch[data-state='checked'][data-focus-visible]:not([data-disabled])
  .yam3x-switch__thumb::before {
  background-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-state-layer-selected) var(--_yam3x-switch-opacity-focus),
    transparent
  );
}
.yam3x-switch[data-focus-visible]:not([data-disabled]) .yam3x-switch__track {
  border-color: var(--_yam3x-switch-color-track-outline);
}
.yam3x-switch[data-focus-visible]:not([data-disabled]) .yam3x-switch__thumb {
  background: var(--_yam3x-switch-color-handle-hover-unselected);
}
.yam3x-switch[data-state='checked'][data-focus-visible]:not([data-disabled]) .yam3x-switch__thumb {
  background: var(--_yam3x-switch-color-handle-hover-selected);
}
.yam3x-switch[data-focus-visible]:not([data-disabled]) .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-icon-unselected);
}
.yam3x-switch[data-state='checked'][data-focus-visible]:not([data-disabled]) .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-icon-selected);
}
.yam3x-switch[data-focus-visible]:not([data-disabled]) .yam3x-switch__thumb::before {
  outline: 3px solid var(--_yam3x-switch-color-focus-indicator);
  outline-offset: 2px;
  animation: yam3x-switch-focus-ring 500ms;
}
.yam3x-switch:is([data-active], [data-touch-active]):not([data-disabled]) .yam3x-switch__thumb {
  --_yam3x-switch-thumb-offset: 0px;
  width: var(--_yam3x-switch-handle-size-pressed);
  height: var(--_yam3x-switch-handle-size-pressed);
}
.yam3x-switch:is([data-active], [data-touch-active]):not([data-disabled])
  .yam3x-switch__thumb::before {
  background-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-state-layer-unselected) var(--_yam3x-switch-opacity-pressed),
    transparent
  );
}
.yam3x-switch[data-state='checked']:is([data-active], [data-touch-active]):not([data-disabled])
  .yam3x-switch__thumb {
  --_yam3x-switch-thumb-offset: calc(
    var(--_yam3x-switch-track-width) - var(--_yam3x-switch-handle-size-pressed) -
      var(--_yam3x-switch-track-outline-width)
  );
  background: var(--_yam3x-switch-color-handle-hover-selected);
}
.yam3x-switch[data-state='checked']:is([data-active], [data-touch-active]):not([data-disabled])
  .yam3x-switch__thumb::before {
  background-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-state-layer-selected) var(--_yam3x-switch-opacity-pressed),
    transparent
  );
}
.yam3x-switch:is([data-active], [data-touch-active]):not([data-disabled]) .yam3x-switch__track {
  background: var(--_yam3x-switch-color-track-unselected);
}
.yam3x-switch[data-state='checked']:is([data-active], [data-touch-active]):not([data-disabled])
  .yam3x-switch__track {
  background: var(--_yam3x-switch-color-track-selected);
}
.yam3x-switch:is([data-active], [data-touch-active]):not([data-disabled]) .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-icon-unselected);
}
.yam3x-switch[data-state='checked']:is([data-active], [data-touch-active]):not([data-disabled])
  .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-icon-selected);
}
.yam3x-switch:dir(rtl) .yam3x-switch__thumb {
  transform: translate(calc(-1 * var(--_yam3x-switch-thumb-offset)), -50%);
}
.yam3x-switch[data-disabled] {
  cursor: not-allowed;
}
.yam3x-switch[data-disabled] .yam3x-switch__track {
  border-color: color-mix(
    in srgb,
    var(--_yam3x-switch-color-disabled-outline) var(--_yam3x-switch-opacity-disabled-track),
    transparent
  );
}
.yam3x-switch[data-disabled][data-state='unchecked'] .yam3x-switch__track {
  background: color-mix(
    in srgb,
    var(--_yam3x-switch-color-disabled-track-unselected) var(--_yam3x-switch-opacity-disabled-track),
    transparent
  );
}
.yam3x-switch[data-disabled][data-state='checked'] .yam3x-switch__track {
  background: color-mix(
    in srgb,
    var(--_yam3x-switch-color-disabled-track-selected) var(--_yam3x-switch-opacity-disabled-track),
    transparent
  );
}
.yam3x-switch[data-disabled][data-state='unchecked'] .yam3x-switch__thumb {
  background: color-mix(
    in srgb,
    var(--_yam3x-switch-color-disabled-handle-unselected)
      var(--_yam3x-switch-opacity-disabled-content),
    transparent
  );
}
.yam3x-switch[data-disabled][data-state='checked'] .yam3x-switch__thumb {
  background: var(--_yam3x-switch-color-disabled-handle-selected);
  color: var(--_yam3x-switch-color-disabled-icon-selected);
}
.yam3x-switch[data-disabled][data-state='checked'] .yam3x-switch__icon {
  opacity: var(--_yam3x-switch-opacity-disabled-content);
}
.yam3x-switch[data-disabled][data-state='unchecked'] .yam3x-switch__thumb {
  --_yam3x-switch-thumb-offset: calc(
    var(--_yam3x-switch-track-outline-width) + var(--_yam3x-switch-handle-size-pressed) -
      var(--_yam3x-switch-handle-size-with-icon)
  );
  width: var(--_yam3x-switch-handle-size-unselected);
  height: var(--_yam3x-switch-handle-size-unselected);
}
.yam3x-switch[data-disabled][data-state='unchecked'] .yam3x-switch__icon {
  color: var(--_yam3x-switch-color-disabled-icon-unselected);
  opacity: var(--_yam3x-switch-opacity-disabled-content);
}
.yam3x-switch[data-disabled] .yam3x-switch__thumb::before {
  background-color: transparent;
}
@keyframes yam3x-switch-focus-ring {
  0%,
  100% {
    outline-width: 3px;
  }
  50% {
    outline-width: 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-switch__track,
  .yam3x-switch__thumb,
  .yam3x-switch__thumb::before {
    transition: none;
    animation: none;
  }
}
@media (forced-colors: active) {
  .yam3x-switch__track,
  .yam3x-switch__thumb {
    forced-color-adjust: none;
  }
  .yam3x-switch[data-state='unchecked'] .yam3x-switch__track {
    border-color: ButtonText;
    background: Canvas;
  }
  .yam3x-switch[data-state='checked'] .yam3x-switch__track {
    border-width: 0;
    border-color: ButtonText;
    background: ButtonText;
  }
  .yam3x-switch[data-state='unchecked'] .yam3x-switch__thumb {
    background: ButtonText;
  }
  .yam3x-switch[data-state='checked'] .yam3x-switch__thumb {
    background: Canvas;
    color: CanvasText;
  }
  .yam3x-switch[data-disabled][data-state='unchecked'] .yam3x-switch__track {
    border-color: GrayText;
    background: Canvas;
  }
  .yam3x-switch[data-disabled][data-state='checked'] .yam3x-switch__track {
    border-color: GrayText;
    background: GrayText;
  }
  .yam3x-switch[data-disabled][data-state='unchecked'] .yam3x-switch__thumb {
    background: GrayText;
  }
  .yam3x-switch[data-disabled][data-state='checked'] .yam3x-switch__thumb {
    background: Canvas;
    color: GrayText;
  }
  .yam3x-switch[data-focus-visible] .yam3x-switch__thumb {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
  .yam3x-switch__thumb::before {
    display: none;
  }
  .yam3x-switch[data-state='unchecked'] .yam3x-switch__icon {
    color: Canvas;
  }
  .yam3x-switch[data-state='checked'] .yam3x-switch__icon {
    color: CanvasText;
  }
  .yam3x-switch__thumb {
    transition:
      transform var(--_yam3x-switch-motion-spatial),
      width var(--_yam3x-switch-motion-effects),
      height var(--_yam3x-switch-motion-effects);
  }
  .yam3x-switch[data-disabled][data-state='checked'] .yam3x-switch__icon {
    color: GrayText;
  }
  .yam3x-switch__track {
    transition: none;
  }
}
</style>
