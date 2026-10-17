<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import Heading from '../heading/heading.vue'
import Icon from '../icon/icon.vue'
import IconButton from '../icon-button/icon-button.vue'
import Tooltip from '../tooltip/tooltip.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    tone?: 'info' | 'success' | 'warning' | 'error'
    announcement?: 'off' | 'polite' | 'assertive'
    icon?: string | false
    dismissible?: boolean
    dismissLabel?: string
    dismissFocus?: () => HTMLElement | null
  }>(),
  {
    title: '',
    tone: 'info',
    announcement: 'off',
    icon: undefined,
    dismissible: false,
    dismissLabel: 'Dismiss message',
    dismissFocus: undefined,
  },
)
const open = defineModel<boolean>('open', { default: true })
const emit = defineEmits<{ dismiss: [] }>()
defineSlots<{ default(): unknown; icon?(): unknown; actions?(): unknown }>()
const dismissId = `yam3x-inline-message-dismiss-${useId().replace(/:/g, '')}`
const root = ref<HTMLElement>()
const resolvedIcon = computed(
  () =>
    props.icon ??
    { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' }[props.tone],
)
const liveRole = computed(() =>
  props.announcement === 'assertive'
    ? 'alert'
    : props.announcement === 'polite'
      ? 'status'
      : undefined,
)

watch(
  open,
  (value) => {
    const element = root.value
    if (value || !element?.contains(element.ownerDocument.activeElement)) return
    const parent = element.parentElement
    void nextTick(() => {
      if (open.value) return
      const active = element.ownerDocument.activeElement
      if (active && active !== element.ownerDocument.body && !element.contains(active)) return
      const target = props.dismissFocus?.() ?? parent
      if (!target?.isConnected || target.closest('[hidden], [inert]')) return
      const temporaryTabindex = !target.hasAttribute('tabindex') && target.tabIndex < 0
      if (temporaryTabindex) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      if (temporaryTabindex) target.removeAttribute('tabindex')
    })
  },
  { flush: 'sync' },
)

function onDismiss() {
  open.value = false
  emit('dismiss')
}
</script>

<template>
  <div
    v-if="open"
    ref="root"
    class="yam3x-inline-message"
    :class="`yam3x-inline-message--${tone}`"
    :role="liveRole"
    :aria-atomic="liveRole ? 'true' : undefined"
  >
    <div
      v-if="$slots.icon || resolvedIcon"
      class="yam3x-inline-message__icon"
      aria-hidden="true"
    >
      <slot name="icon"><Icon :name="resolvedIcon || undefined" /></slot>
    </div>
    <div class="yam3x-inline-message__content">
      <Heading
        v-if="title"
        variant="title"
        size="small"
        class="yam3x-inline-message__title"
        >{{ title }}</Heading
      >
      <div class="yam3x-inline-message__body"><slot /></div>
      <div
        v-if="$slots.actions"
        class="yam3x-inline-message__actions"
      >
        <slot name="actions" />
      </div>
    </div>
    <div
      v-if="dismissible"
      class="yam3x-inline-message__dismiss-target"
    >
      <IconButton
        :id="dismissId"
        variant="standard"
        class="yam3x-inline-message__dismiss"
        :aria-label="dismissLabel"
        @click="onDismiss"
        ><Icon name="close"
      /></IconButton>
      <Tooltip :for="dismissId">{{ dismissLabel }}</Tooltip>
    </div>
  </div>
</template>

<style scoped>
.yam3x-inline-message {
  --_yam3x-inline-message-container: var(
    --yam3x-inline-message-container-color,
    var(--md-sys-color-surface-container)
  );
  --_yam3x-inline-message-content: var(
    --yam3x-inline-message-content-color,
    var(--md-sys-color-on-surface)
  );
  --_yam3x-inline-message-shape: var(
    --yam3x-inline-message-shape,
    var(--md-sys-shape-corner-medium)
  );
  --_yam3x-inline-message-padding: calc(16px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-inline-message-gap: calc(12px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-inline-message-content-gap: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-inline-message-body-font: var(--md-sys-typescale-body-medium-font-family);
  --_yam3x-inline-message-body-size: var(--md-sys-typescale-body-medium-font-size);
  --_yam3x-inline-message-body-weight: var(--md-sys-typescale-body-medium-font-weight);
  --_yam3x-inline-message-body-height: var(--md-sys-typescale-body-medium-line-height);
  --_yam3x-inline-message-body-tracking: var(--md-sys-typescale-body-medium-tracking);
  display: flex;
  align-items: flex-start;
  gap: var(--_yam3x-inline-message-gap);
  min-inline-size: 0;
  padding: var(--_yam3x-inline-message-padding);
  border-radius: var(--_yam3x-inline-message-shape);
  background: var(--_yam3x-inline-message-container);
  color: var(--_yam3x-inline-message-content);
  overflow-wrap: anywhere;
}
.yam3x-inline-message--error {
  --_yam3x-inline-message-container: var(
    --yam3x-inline-message-container-color,
    var(--md-sys-color-error-container)
  );
  --_yam3x-inline-message-content: var(
    --yam3x-inline-message-content-color,
    var(--md-sys-color-on-error-container)
  );
}
.yam3x-inline-message__icon {
  display: flex;
  flex: none;
  padding-block: 2px;
}
.yam3x-inline-message__content {
  flex: 1;
  min-inline-size: 0;
  display: grid;
  gap: var(--_yam3x-inline-message-content-gap);
}
.yam3x-inline-message__body {
  font-family: var(--_yam3x-inline-message-body-font);
  font-size: var(--_yam3x-inline-message-body-size);
  font-weight: var(--_yam3x-inline-message-body-weight);
  line-height: var(--_yam3x-inline-message-body-height);
  letter-spacing: var(--_yam3x-inline-message-body-tracking);
}
.yam3x-inline-message__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--_yam3x-inline-message-content-gap);
  min-inline-size: 0;
}
.yam3x-inline-message__dismiss-target {
  flex: none;
  display: grid;
  place-items: center;
  min-inline-size: 48px;
  min-block-size: 48px;
}
.yam3x-inline-message__dismiss-target :deep(.yam3x-icon-button),
.yam3x-inline-message__actions :deep(.yam3x-button--text:not(:disabled, [aria-disabled='true'])) {
  color: inherit;
}
.yam3x-inline-message[hidden] {
  display: none;
}
@media (forced-colors: active) {
  .yam3x-inline-message {
    border: 1px solid CanvasText;
  }
}
</style>
