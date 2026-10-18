<script setup lang="ts">
import { useComponentLocale } from '../localization/context'
import { nextTick, watch } from 'vue'
import { Dialog } from '@ark-ui/vue/dialog'
import Icon from '../icon/icon.vue'

const props = withDefaults(
  defineProps<{
    locale?: string
    title: string
    description?: string
    showCloseButton?: boolean
    dismissOnEscape?: boolean
    dismissOnClickOutside?: boolean
    closeLabel?: string
  }>(),
  {
    description: undefined,
    showCloseButton: false,
    dismissOnEscape: true,
    dismissOnClickOutside: true,
    closeLabel: undefined,
  },
)
const open = defineModel<boolean>('open', { default: false })
const returnValue = defineModel<string>('returnValue', { default: '' })

const emit = defineEmits<{
  opening: [event: Event]
  opened: [event: Event]
  cancel: [event: Event]
  closing: [event: Event]
  closed: [event: Event]
}>()
const { messages: actionMessages } = useComponentLocale(
  'actions',
  () => props.locale,
  () => ({ close: props.closeLabel }),
)

let expectedTransition: boolean | undefined
let escapePending = false

function dispatchLifecycle(name: 'opening' | 'closing', cancelable: boolean): Event {
  const event = new Event(name, { cancelable })
  if (name === 'opening') emit('opening', event)
  else emit('closing', event)
  return event
}

function requestOpenChange(nextOpen: boolean): boolean {
  if (nextOpen === open.value) return false

  if (!nextOpen && escapePending) {
    const cancel = new Event('cancel', { cancelable: true })
    emit('cancel', cancel)
    if (cancel.defaultPrevented) {
      escapePending = false
      return false
    }
  }
  escapePending = false

  const lifecycle = dispatchLifecycle(nextOpen ? 'opening' : 'closing', true)
  if (lifecycle.defaultPrevented) return false
  expectedTransition = nextOpen
  open.value = nextOpen
  return true
}

function onOpenChange(details: { open: boolean }): void {
  requestOpenChange(details.open)
}

function onEscapeKeydown(): void {
  escapePending = true
  queueMicrotask(() => {
    escapePending = false
  })
}

function close(): void {
  closeWithValue(returnValue.value)
}

function closeWithValue(value = returnValue.value): void {
  const previousValue = returnValue.value
  returnValue.value = value
  if (!requestOpenChange(false)) returnValue.value = previousValue
}

watch(open, (nextOpen) => {
  if (expectedTransition === nextOpen) {
    expectedTransition = undefined
  } else {
    dispatchLifecycle(nextOpen ? 'opening' : 'closing', false)
  }
  void nextTick(() => {
    if (nextOpen) emit('opened', new Event('opened'))
    else emit('closed', new Event('closed'))
  })
})

defineExpose({ close: closeWithValue, returnValue })
</script>

<template>
  <Dialog.Root
    :open="open"
    role="alertdialog"
    :lazy-mount="true"
    :unmount-on-exit="false"
    :close-on-escape="dismissOnEscape"
    :close-on-interact-outside="dismissOnClickOutside"
    :trap-focus="true"
    :prevent-scroll="true"
    :restore-focus="true"
    @open-change="onOpenChange"
    @escape-key-down="onEscapeKeydown"
  >
    <Dialog.Backdrop class="yam3x-dialog__backdrop" />
    <Dialog.Positioner class="yam3x-dialog__positioner">
      <Dialog.Content
        class="yam3x-dialog__content"
        :aria-hidden="!open"
        :inert="!open"
      >
        <header
          class="yam3x-dialog__header"
          :class="{ 'yam3x-dialog__header--with-icon': Boolean($slots.icon) }"
        >
          <div
            v-if="$slots.icon"
            class="yam3x-dialog__icon"
          >
            <slot name="icon" />
          </div>
          <Dialog.Title class="yam3x-dialog__title"
            ><slot name="title">{{ title }}</slot></Dialog.Title
          >
          <Dialog.Description
            v-if="description"
            class="yam3x-dialog__description"
          >
            {{ description }}
          </Dialog.Description>
          <button
            v-if="showCloseButton"
            class="yam3x-dialog__close"
            type="button"
            :aria-label="actionMessages.close"
            @click="close"
          >
            <slot name="close-icon">
              <Icon name="close" />
            </slot>
          </button>
        </header>
        <div
          v-if="$slots.default"
          class="yam3x-dialog__body"
        >
          <slot />
        </div>
        <div
          v-if="$slots.divider"
          class="yam3x-dialog__divider"
        >
          <slot name="divider" />
        </div>
        <footer
          v-if="$slots.actions"
          class="yam3x-dialog__actions"
        >
          <slot name="actions" />
        </footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
</template>

<style scoped>
.yam3x-dialog__backdrop,
.yam3x-dialog__positioner {
  --_yam3x-dialog-space-viewport-inset: calc(24px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-dialog-space-header-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-dialog-space-body-gap: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-dialog-space-actions-gap: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-dialog-space-actions-inset: calc(24px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-dialog-motion-fade: var(--md-sys-motion-spring-default-effects);
  --_yam3x-dialog-motion-exit-duration: var(--md-sys-motion-duration-short);
  --_yam3x-dialog-motion-exit-easing: var(--md-sys-motion-easing-emphasized-accelerate);
}
.yam3x-dialog__backdrop {
  --_yam3x-dialog-color-scrim: var(--md-sys-color-scrim);
  --_yam3x-dialog-opacity-scrim: var(--_yam3x-overlay-scrim-opacity);
  position: fixed;
  z-index: 40;
  inset: 0;
  background: color-mix(
    in srgb,
    var(--_yam3x-dialog-color-scrim) var(--_yam3x-dialog-opacity-scrim),
    transparent
  );
  opacity: 0;
  transition: opacity var(--_yam3x-dialog-motion-fade);
}
.yam3x-dialog__backdrop[data-state='open'] {
  opacity: 1;
}
.yam3x-dialog__backdrop[hidden] {
  display: block;
  pointer-events: none;
  animation: dialog-backdrop-exit var(--_yam3x-dialog-motion-exit-duration)
    var(--_yam3x-dialog-motion-exit-easing) both;
}
.yam3x-dialog__positioner {
  --_yam3x-dialog-space-close-inset: calc(-12px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-dialog-color-surface: var(--md-sys-color-surface-container-high);
  --_yam3x-dialog-color-on-surface: var(--md-sys-color-on-surface);
  --_yam3x-dialog-color-on-surface-variant: var(--md-sys-color-on-surface-variant);
  --_yam3x-dialog-color-secondary: var(--md-sys-color-secondary);
  --_yam3x-dialog-color-outline: var(--md-sys-color-outline);
  --_yam3x-dialog-shape-container: var(--md-sys-shape-corner-extra-large);
  --_yam3x-dialog-elevation-container: var(--md-sys-elevation-level3);
  --_yam3x-dialog-size-container-min-width: 280px;
  --_yam3x-dialog-size-container-max-width: 560px;
  --_yam3x-dialog-size-container-max-height: 560px;
  --_yam3x-dialog-type-headline-font-family: var(--md-sys-typescale-headline-small-font-family);
  --_yam3x-dialog-type-headline-font-size: var(--md-sys-typescale-headline-small-font-size);
  --_yam3x-dialog-type-headline-font-weight: var(--md-sys-typescale-headline-small-font-weight);
  --_yam3x-dialog-type-headline-line-height: calc(
    var(--md-sys-typescale-headline-small-line-height-small) *
      var(--md-sys-typescale-line-height-scale, 1.07)
  );
  --_yam3x-dialog-type-headline-tracking: var(--md-sys-typescale-headline-small-tracking);
  --_yam3x-dialog-type-supporting-font-family: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-dialog-type-supporting-font-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-dialog-type-supporting-font-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-dialog-type-supporting-line-height: calc(
    var(--md-sys-typescale-body-medium-line-height-small) *
      var(--md-sys-typescale-line-height-scale, 1.07)
  );
  --_yam3x-dialog-type-supporting-tracking: var(--md-sys-typescale-body-medium-tracking);
  --_yam3x-dialog-type-body-font-family: var(--md-sys-typescale-body-large-font-family);
  --_yam3x-dialog-type-body-font-size: var(--md-sys-typescale-body-large-font-size);
  --_yam3x-dialog-type-body-font-weight: var(--md-sys-typescale-body-large-font-weight);
  --_yam3x-dialog-type-body-line-height: calc(
    var(--md-sys-typescale-body-large-line-height-small) *
      var(--md-sys-typescale-line-height-scale, 1.07)
  );
  --_yam3x-dialog-type-body-tracking: var(--md-sys-typescale-body-large-tracking);
  --_yam3x-dialog-color-header: transparent;
  position: fixed;
  z-index: 41;
  inset: 0;
  display: grid;
  align-items: center;
  justify-items: center;
  padding: var(--_yam3x-dialog-space-viewport-inset);
}
.yam3x-dialog__content {
  display: flex;
  width: min(var(--_yam3x-dialog-size-container-max-width), 100%);
  min-width: min(var(--_yam3x-dialog-size-container-min-width), 100%);
  max-width: min(var(--_yam3x-dialog-size-container-max-width), 100%);
  max-height: min(
    var(--_yam3x-dialog-size-container-max-height),
    calc(
      100dvh - var(--_yam3x-dialog-space-viewport-inset) - var(--_yam3x-dialog-space-viewport-inset)
    )
  );
  flex-direction: column;
  overflow: hidden;
  padding: var(--_yam3x-dialog-space-viewport-inset);
  border-radius: var(--_yam3x-dialog-shape-container);
  color: var(--_yam3x-dialog-color-on-surface);
  background: var(--_yam3x-dialog-color-surface);
  box-shadow: var(--_yam3x-dialog-elevation-container);
  opacity: 0;
  transition: opacity var(--_yam3x-dialog-motion-fade);
}
.yam3x-dialog__content[data-state='open'] {
  opacity: 1;
}
.yam3x-dialog__content[hidden] {
  display: flex;
  pointer-events: none;
  animation: dialog-exit var(--_yam3x-dialog-motion-exit-duration)
    var(--_yam3x-dialog-motion-exit-easing) both;
}
.yam3x-dialog__header {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--_yam3x-dialog-space-header-gap);
  flex: none;
  background: var(--_yam3x-dialog-color-header);
}
.yam3x-dialog__header--with-icon {
  grid-template-columns: minmax(0, 1fr);
}
.yam3x-dialog__header--with-icon .yam3x-dialog__title,
.yam3x-dialog__header--with-icon .yam3x-dialog__description {
  grid-column: 1;
  text-align: center;
}
.yam3x-dialog__header--with-icon .yam3x-dialog__close {
  position: absolute;
  inset-block-start: var(--_yam3x-dialog-space-close-inset);
  inset-inline-end: var(--_yam3x-dialog-space-close-inset);
}
.yam3x-dialog__icon {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--_yam3x-dialog-color-secondary);
}
.yam3x-dialog__title {
  grid-column: 1;
  margin: 0;
  padding-top: 0;
  border-top: 0;
  color: var(--_yam3x-dialog-color-on-surface);
  font-family: var(--_yam3x-dialog-type-headline-font-family);
  font-size: var(--_yam3x-dialog-type-headline-font-size);
  font-weight: var(--_yam3x-dialog-type-headline-font-weight);
  line-height: var(--_yam3x-dialog-type-headline-line-height);
  letter-spacing: var(--_yam3x-dialog-type-headline-tracking);
}
.yam3x-dialog__description {
  grid-column: 1 / -1;
  color: var(--_yam3x-dialog-color-on-surface-variant);
  font-family: var(--_yam3x-dialog-type-supporting-font-family);
  font-size: var(--_yam3x-dialog-type-supporting-font-size);
  font-weight: var(--_yam3x-dialog-type-supporting-font-weight);
  line-height: var(--_yam3x-dialog-type-supporting-line-height);
  letter-spacing: var(--_yam3x-dialog-type-supporting-tracking);
}
.yam3x-dialog__close {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin: var(--_yam3x-dialog-space-close-inset) var(--_yam3x-dialog-space-close-inset) 0 0;
  border: 0;
  border-radius: 50%;
  color: var(--_yam3x-dialog-color-on-surface-variant);
  background: transparent;
  cursor: pointer;
}
.yam3x-dialog__close :deep(.yam3x-icon) {
  width: 24px;
  height: 24px;
  font-size: 24px;
}
.yam3x-dialog__close:focus-visible {
  outline: 2px solid var(--_yam3x-dialog-color-secondary);
  outline-offset: 2px;
}
.yam3x-dialog__body {
  min-height: 0;
  margin-top: var(--_yam3x-dialog-space-body-gap);
  overflow: auto;
  color: var(--_yam3x-dialog-color-on-surface-variant);
  font-family: var(--_yam3x-dialog-type-body-font-family);
  font-size: var(--_yam3x-dialog-type-body-font-size);
  font-weight: var(--_yam3x-dialog-type-body-font-weight);
  line-height: var(--_yam3x-dialog-type-body-line-height);
  letter-spacing: var(--_yam3x-dialog-type-body-tracking);
}
.yam3x-dialog__divider {
  --yam3x-divider-color: var(--_yam3x-dialog-color-outline);
  margin-top: var(--_yam3x-dialog-space-body-gap);
}
.yam3x-dialog__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--_yam3x-dialog-space-actions-gap);
  margin-top: var(--_yam3x-dialog-space-actions-inset);
}
@keyframes dialog-exit {
  to {
    opacity: 0;
  }
}
@keyframes dialog-backdrop-exit {
  to {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .yam3x-dialog__backdrop,
  .yam3x-dialog__content {
    transition: none;
    animation-duration: 1ms;
  }
}
@media (forced-colors: active) {
  .yam3x-dialog__content {
    border: 1px solid CanvasText;
  }
  .yam3x-dialog__close:focus-visible {
    outline-color: Highlight;
  }
}
</style>
