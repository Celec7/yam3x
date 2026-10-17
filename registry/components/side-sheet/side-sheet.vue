<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import DrawerContainer from '../drawer-container/drawer-container.vue'
import IconButton from '../icon-button/icon-button.vue'
import Icon from '../icon/icon.vue'
import type { SideSheetMode, SideSheetToggleSlotProps } from './side-sheet.types'
import './side-sheet.css'

const props = withDefaults(
  defineProps<{
    mode?: SideSheetMode
    label: string
    closeLabel?: string
    backLabel?: string
    width?: string
    maxWidth?: string
    adaptiveBreakpoint?: number
  }>(),
  {
    mode: 'adaptive',
    closeLabel: 'Close',
    backLabel: 'Back',
    width: '400px',
    maxWidth: '400px',
    adaptiveBreakpoint: 600,
  },
)

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  change: [open: boolean, reason: 'toggle' | 'dismiss']
}>()
defineSlots<{
  default?: () => unknown
  sheet?: () => unknown
  headline?: () => unknown
  actions?: () => unknown
  back?: () => unknown
  toggle?: (props: SideSheetToggleSlotProps) => unknown
}>()

const id = `yam3x-side-sheet-${useId()}`
const root = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
let observer: ResizeObserver | undefined

const drawerMode = computed(() => {
  if (props.mode === 'modal') return 'overlay'
  if (props.mode === 'standard') return 'push'
  return containerWidth.value > 0 && containerWidth.value < props.adaptiveBreakpoint
    ? 'overlay'
    : 'push'
})

function dismiss(): void {
  if (!open.value) return
  open.value = false
  emit('change', false, 'dismiss')
}
function onDrawerChange(edge: 'start' | 'end', value: boolean, reason: 'toggle' | 'dismiss'): void {
  if (edge === 'end') emit('change', value, reason)
}

onMounted(() => {
  if (!root.value) return
  const frame = root.value.closest<HTMLElement>('.yam3x-drawer')
  if (!frame) return
  const measure = () => {
    containerWidth.value = frame.getBoundingClientRect().width
  }
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(frame)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <DrawerContainer
    v-model:end-open="open"
    class="yam3x-side-sheet-layout"
    :end-mode="drawerMode"
    :width="width"
    :max-width="maxWidth"
    :end-label="label"
    end-role="dialog"
    :end-divider="drawerMode === 'push'"
    @change="onDrawerChange"
  >
    <template
      v-if="$slots.toggle"
      #end-toggle="toggleSlot"
    >
      <slot
        name="toggle"
        v-bind="toggleSlot"
      />
    </template>
    <template #end>
      <section
        :id="id"
        ref="root"
        class="yam3x-side-sheet"
        :class="[
          `yam3x-side-sheet--${drawerMode}`,
          { 'yam3x-side-sheet--with-back': Boolean($slots.back) },
        ]"
        :aria-hidden="!open || undefined"
        :inert="!open"
      >
        <header class="yam3x-side-sheet__header">
          <slot
            v-if="$slots.back"
            name="back"
            :back-label="backLabel"
          >
            <IconButton
              class="yam3x-side-sheet__back"
              variant="standard"
              size="small"
              :aria-label="backLabel"
              @click="dismiss"
            >
              <Icon name="arrow_back" />
            </IconButton>
          </slot>
          <h2
            :id="`${id}-headline`"
            class="yam3x-side-sheet__headline"
          >
            <slot name="headline">{{ label }}</slot>
          </h2>
          <IconButton
            class="yam3x-side-sheet__close"
            variant="standard"
            size="small"
            :aria-label="closeLabel"
            @click="dismiss"
          >
            <Icon name="close" />
          </IconButton>
        </header>
        <div class="yam3x-side-sheet__body"><slot name="sheet" /></div>
        <footer
          v-if="$slots.actions"
          class="yam3x-side-sheet__actions"
        >
          <slot name="actions" />
        </footer>
      </section>
    </template>
    <slot />
  </DrawerContainer>
</template>
