<script setup lang="ts">
import { useTimePickerLocale } from './time-picker.locale'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
import { trapTabKey } from '../_shared/focus-trap'
import { acquirePageScrollLock } from '../_shared/page-scroll-lock'
import Icon from '../icon/icon.vue'
import TimePickerControl from './time-picker-control.vue'
import { formatTimeValue, resolveTimePickerFormat } from './time-picker.utils'
import type { TimePickerDialogProps, TimeValue } from './time-picker.types'

const props = withDefaults(defineProps<TimePickerDialogProps>(), {
  modelValue: undefined,
  open: undefined,
  presentation: 'modal',
  mode: 'dial',
  orientation: 'auto',
  variant: 'standard',
  format: 'auto',
  showSeconds: false,
  label: undefined,
  hourLabel: undefined,
  minuteLabel: undefined,
  secondLabel: undefined,
  modeToggleLabel: undefined,
  useDialLabel: undefined,
  dialLabel: undefined,
  inputLabel: undefined,
  hideModeToggle: false,
  cancelLabel: undefined,
  confirmLabel: undefined,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: TimeValue]
  'update:open': [value: boolean]
  change: [value: TimeValue]
  'update:mode': [value: 'dial' | 'input']
}>()

const MIN_VERTICAL_DIAL_HEIGHT = 596
const MIN_HORIZONTAL_DIAL_WIDTH = 684
const MIN_HORIZONTAL_DIAL_HEIGHT = 480
const { locale, messages } = useTimePickerLocale(props)
const format = computed(() => resolveTimePickerFormat(props.format, locale.value))
const value = computed(() => props.modelValue ?? null)
const displayedValue = computed(() =>
  formatTimeValue(value.value, locale.value, format.value, props.showSeconds),
)
const root = ref<HTMLElement>()
const surface = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const opened = ref(false)
const currentMode = ref<'dial' | 'input'>(props.mode)
const controlVersion = ref(0)
const draft = ref<TimeValue>({ hour: new Date().getHours(), minute: 0 })
const box = ref({ width: 640, height: 620 })
const dockedAvailableHeight = ref(0)
const dockedDialRequiredHeight = ref(0)
const floatingStyle = ref<Record<string, string>>({})
const dragging = ref(false)
const dialogId = `yam3x-time-picker-${useId()}`
const resolvedOrientation = computed(() =>
  props.orientation === 'auto'
    ? box.value.width >= MIN_HORIZONTAL_DIAL_WIDTH && box.value.height < MIN_VERTICAL_DIAL_HEIGHT
      ? 'horizontal'
      : 'vertical'
    : props.orientation,
)
const useInputOnly = computed(() => {
  const dialFits =
    resolvedOrientation.value === 'horizontal'
      ? box.value.width >= MIN_HORIZONTAL_DIAL_WIDTH &&
        box.value.height >= MIN_HORIZONTAL_DIAL_HEIGHT
      : box.value.height >= MIN_VERTICAL_DIAL_HEIGHT
  const dockedDialDoesNotFit =
    props.presentation === 'docked' &&
    currentMode.value === 'dial' &&
    dockedDialRequiredHeight.value > 0 &&
    dockedAvailableHeight.value < dockedDialRequiredHeight.value
  return box.value.width < 356 || !dialFits || dockedDialDoesNotFit
})
let stopPositionUpdate: (() => void) | undefined
let surfaceObserver: ResizeObserver | undefined
let releasePageScrollLock: (() => void) | undefined

function setOpen(next: boolean): void {
  if (props.open === undefined) opened.value = next
  emit('update:open', next)
}

async function openPicker(): Promise<void> {
  if (props.disabled) return
  const now = new Date()
  draft.value = value.value
    ? { ...value.value }
    : { hour: now.getHours(), minute: now.getMinutes() }
  currentMode.value = props.mode
  controlVersion.value += 1
  dockedAvailableHeight.value = 0
  dockedDialRequiredHeight.value = 0
  setOpen(true)
  await nextTick()
  if (props.presentation === 'docked') void updateDockedPosition()
  const initialFocus =
    currentMode.value === 'input' || useInputOnly.value
      ? surface.value?.querySelector<HTMLElement>('.yam3x-time-picker__input-slot input')
      : surface.value?.querySelector<HTMLElement>(
          '.yam3x-time-picker__selector[aria-pressed="true"]',
        )
  if (initialFocus) initialFocus.focus()
  else
    surface.value
      ?.querySelector<HTMLElement>('.yam3x-time-picker__dial-item:not(:disabled)')
      ?.focus()
}

function closePicker(): void {
  setOpen(false)
  void nextTick(() => trigger.value?.focus())
}

function cancel(): void {
  closePicker()
}

function confirm(committed: TimeValue): void {
  emit('update:modelValue', committed)
  emit('change', committed)
  closePicker()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
    return
  }
  if (event.key !== 'Tab' || props.presentation !== 'modal') return
  if (surface.value) trapTabKey(event, surface.value)
}

function pointerOutside(event: PointerEvent): void {
  if (event.target === event.currentTarget) cancel()
}

function observeSurface(): void {
  if (!surface.value) return
  surfaceObserver?.disconnect()
  const available =
    props.presentation === 'modal'
      ? (surface.value.parentElement ?? surface.value)
      : document.documentElement
  box.value = {
    width: available.clientWidth || innerWidth,
    height: available.clientHeight || innerHeight,
  }
  if (typeof ResizeObserver === 'undefined') {
    if (props.presentation === 'modal') window.addEventListener('resize', updateModalViewport)
    return
  }
  const observer = new ResizeObserver(() => {
    box.value = {
      width: available.clientWidth || innerWidth,
      height: available.clientHeight || innerHeight,
    }
  })
  observer.observe(available)
  surfaceObserver = observer
  if (props.presentation === 'docked' && trigger.value && surface.value) {
    stopPositionUpdate?.()
    stopPositionUpdate = autoUpdate(trigger.value, surface.value, () => {
      void updateDockedPosition()
    })
  }
}

async function updateDockedPosition(): Promise<void> {
  if (!trigger.value || !surface.value || props.presentation !== 'docked') return
  if (currentMode.value === 'dial' && !useInputOnly.value)
    dockedDialRequiredHeight.value = surface.value.scrollHeight
  const result = await computePosition(trigger.value, surface.value, {
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, elements }) {
          dockedAvailableHeight.value = availableHeight
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
            maxWidth: `${availableWidth}px`,
          })
        },
      }),
    ],
  })
  floatingStyle.value = { position: result.strategy, left: `${result.x}px`, top: `${result.y}px` }
}

function updateModalViewport(): void {
  if (!opened.value || props.presentation !== 'modal' || !surface.value) return
  const available = surface.value.parentElement ?? surface.value
  box.value = {
    width: available.clientWidth || innerWidth,
    height: available.clientHeight || innerHeight,
  }
}

function updateDockedViewport(): void {
  if (!opened.value || props.presentation !== 'docked') return
  box.value = {
    width: document.documentElement.clientWidth || innerWidth,
    height: document.documentElement.clientHeight || innerHeight,
  }
  void updateDockedPosition()
}

function dismissDockedOutside(event: PointerEvent): void {
  if (!opened.value || props.presentation !== 'docked') return
  if (!root.value?.contains(event.target as Node)) cancel()
}

function dismissDockedEscape(event: KeyboardEvent): void {
  if (opened.value && props.presentation === 'docked' && event.key === 'Escape') cancel()
}

watch(
  () => props.open,
  (next) => {
    if (next !== undefined) opened.value = next
  },
  { immediate: true },
)
watch(
  () => props.mode,
  (next) => {
    currentMode.value = next
  },
)
watch([useInputOnly, resolvedOrientation], ([inputOnly], [wasInputOnly]) => {
  if (!opened.value) return
  void nextTick(() => {
    observeSurface()
    const focusTarget =
      inputOnly !== wasInputOnly
        ? inputOnly
          ? '.yam3x-time-picker__input-slot input'
          : currentMode.value === 'dial'
            ? '.yam3x-time-picker__selector[aria-pressed="true"]'
            : undefined
        : undefined
    if (focusTarget) surface.value?.querySelector<HTMLElement>(focusTarget)?.focus()
  })
})
watch(currentMode, () => {
  if (opened.value && props.presentation === 'docked') void nextTick(updateDockedPosition)
})
onMounted(() => {
  if (props.open) opened.value = true
})
onBeforeUnmount(() => {
  surfaceObserver?.disconnect()
  stopPositionUpdate?.()
  window.removeEventListener('resize', updateDockedViewport)
  window.removeEventListener('resize', updateModalViewport)
  releasePageScrollLock?.()
  releasePageScrollLock = undefined
  document.removeEventListener('pointerdown', dismissDockedOutside, true)
  document.removeEventListener('keydown', dismissDockedEscape)
})
watch([opened, () => props.presentation], ([isOpen, presentation]) => {
  const shouldLockScroll = Boolean(isOpen && presentation === 'modal')
  if (shouldLockScroll) {
    releasePageScrollLock ??= acquirePageScrollLock('yam3x-time-picker-scroll-lock')
  } else {
    releasePageScrollLock?.()
    releasePageScrollLock = undefined
  }
  surfaceObserver?.disconnect()
  stopPositionUpdate?.()
  document.removeEventListener('pointerdown', dismissDockedOutside, true)
  document.removeEventListener('keydown', dismissDockedEscape)
  window.removeEventListener('resize', updateDockedViewport)
  window.removeEventListener('resize', updateModalViewport)
  if (isOpen && presentation === 'docked') {
    document.addEventListener('pointerdown', dismissDockedOutside, true)
    document.addEventListener('keydown', dismissDockedEscape)
    window.addEventListener('resize', updateDockedViewport)
  } else if (isOpen && presentation === 'modal' && typeof ResizeObserver === 'undefined') {
    window.addEventListener('resize', updateModalViewport)
  }
  if (isOpen) void nextTick(observeSurface)
})
</script>

<template>
  <div
    ref="root"
    class="yam3x-time-picker"
    :dir="
      locale.startsWith('ar') || locale.startsWith('he') || locale.startsWith('fa')
        ? 'rtl'
        : undefined
    "
  >
    <button
      ref="trigger"
      class="yam3x-time-picker__trigger"
      type="button"
      :disabled="disabled"
      aria-haspopup="dialog"
      :aria-expanded="opened"
      :aria-controls="opened ? dialogId : undefined"
      :aria-label="`${triggerLabel ?? messages.label}${displayedValue ? `, ${displayedValue}` : ''}`"
      @click="opened ? cancel() : openPicker()"
    >
      <slot
        name="trigger"
        :value="displayedValue"
        :open="openPicker"
        ><span>{{ displayedValue || messages.label }}</span
        ><Icon
          class="yam3x-time-picker__trigger-icon"
          name="schedule"
      /></slot>
    </button>

    <Transition name="yam3x-time-picker-modal">
      <div
        v-if="opened && presentation === 'modal'"
        class="yam3x-time-picker__scrim"
        @pointerdown="pointerOutside"
      >
        <section
          :id="dialogId"
          ref="surface"
          class="yam3x-time-picker__surface yam3x-time-picker__surface--modal"
          :class="{
            'is-vibrant': props.variant === 'vibrant',
            'is-horizontal': resolvedOrientation === 'horizontal',
            'is-input-only': useInputOnly,
            'is-input-mode': currentMode === 'input' || useInputOnly,
            'is-24-hour': format === '24',
            'is-dragging': dragging,
          }"
          role="dialog"
          aria-modal="true"
          :aria-label="messages.label"
          @keydown="onKeydown"
        >
          <TimePickerControl
            :key="controlVersion"
            v-model="draft"
            v-model:mode="currentMode"
            :layout-type="resolvedOrientation"
            :input-only="useInputOnly"
            :show-mode-toggle="!props.hideModeToggle"
            show-actions
            show-headline
            :format="props.format"
            :show-seconds="props.showSeconds"
            :min-time="props.minTime"
            :max-time="props.maxTime"
            :is-time-selectable="props.isTimeSelectable"
            :locale="props.locale"
            :hour-label="props.hourLabel"
            :minute-label="props.minuteLabel"
            :second-label="props.secondLabel"
            :period-label="props.periodLabel"
            :mode-toggle-label="props.modeToggleLabel"
            :use-dial-label="props.useDialLabel"
            :dial-value-label="props.dialValueLabel"
            :dial-label="props.dialLabel"
            :input-label="props.inputLabel"
            :cancel-label="props.cancelLabel"
            :confirm-label="props.confirmLabel"
            @update:dragging="dragging = $event"
            @update:mode="emit('update:mode', $event)"
            @confirm="confirm"
            @cancel="cancel"
          />
        </section>
      </div>
    </Transition>
    <div
      v-if="opened && presentation === 'docked'"
      :id="dialogId"
      ref="surface"
      class="yam3x-time-picker__surface yam3x-time-picker__surface--docked"
      :class="{
        'is-vibrant': props.variant === 'vibrant',
        'is-horizontal': resolvedOrientation === 'horizontal',
        'is-input-only': useInputOnly,
        'is-input-mode': currentMode === 'input' || useInputOnly,
        'is-24-hour': format === '24',
        'is-dragging': dragging,
      }"
      :style="floatingStyle"
      role="dialog"
      :aria-label="messages.label"
      @keydown="onKeydown"
    >
      <TimePickerControl
        :key="controlVersion"
        v-model="draft"
        v-model:mode="currentMode"
        :layout-type="resolvedOrientation"
        :input-only="useInputOnly"
        :show-mode-toggle="!props.hideModeToggle"
        show-actions
        show-headline
        :format="props.format"
        :show-seconds="props.showSeconds"
        :min-time="props.minTime"
        :max-time="props.maxTime"
        :is-time-selectable="props.isTimeSelectable"
        :locale="props.locale"
        :hour-label="props.hourLabel"
        :minute-label="props.minuteLabel"
        :second-label="props.secondLabel"
        :period-label="props.periodLabel"
        :mode-toggle-label="props.modeToggleLabel"
        :use-dial-label="props.useDialLabel"
        :dial-value-label="props.dialValueLabel"
        :dial-label="props.dialLabel"
        :input-label="props.inputLabel"
        :cancel-label="props.cancelLabel"
        :confirm-label="props.confirmLabel"
        @update:dragging="dragging = $event"
        @update:mode="emit('update:mode', $event)"
        @confirm="confirm"
        @cancel="cancel"
      />
    </div>
  </div>
</template>
