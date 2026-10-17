<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useId, watch } from 'vue'
import Menu from '../menu/menu.vue'
import type { MenuItem, MenuPositionX, MenuPositionY } from '../menu/menu.types'
import type { ButtonShape, ButtonSize } from '../button/button.variants'
import SplitButtonLayout from './split-button-layout.vue'
import SplitButtonLeadingButton from './split-button-leading-button.vue'
import SplitButtonTrailingButton from './split-button-trailing-button.vue'
import type { SplitButtonVariant } from './split-button.types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: SplitButtonVariant
    size?: ButtonSize
    shape?: ButtonShape
    items?: MenuItem[]
    menuLabel?: string
    menuButtonLabel?: string
    groupLabel?: string
    positionX?: MenuPositionX
    positionY?: MenuPositionY
    disabled?: boolean
    primaryDisabled?: boolean
    menuDisabled?: boolean
    popupId?: string
    popupRole?: PopupRole
  }>(),
  {
    variant: 'filled',
    size: 'small',
    shape: 'round',
    items: undefined,
    menuLabel: undefined,
    menuButtonLabel: undefined,
    groupLabel: undefined,
    positionX: 'after',
    positionY: 'below',
    disabled: false,
    primaryDisabled: false,
    menuDisabled: false,
    popupId: undefined,
    popupRole: 'true',
  },
)
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  click: [event: MouseEvent]
  beforetoggle: [event: CustomEvent<{ open: boolean }>]
  toggle: [event: CustomEvent<{ open: boolean }>]
  beforeselect: [item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>]
  select: [item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>]
}>()
const slots = defineSlots<{
  default?(): unknown
  icon?(): unknown
  'menu-icon'?(props: { item: MenuItem }): unknown
  popup?(props: {
    anchor: HTMLElement | null
    open: boolean
    close: () => void
    popupId: string
  }): unknown
}>()
type PopupRole = 'menu' | 'dialog' | 'listbox' | 'tree' | 'grid' | 'true'

const menuOpen = ref(false)
const attrs = useAttrs()
const root = ref<{ root: HTMLElement | null } | null>(null)
const menuApi = ref<{
  show(anchor?: HTMLElement): void
  hide(restoreFocus?: boolean): void
  toggle(target?: HTMLElement | MouseEvent): void
} | null>(null)
const id = useId()
const customPopupId = computed(() => props.popupId || `${id}-popup`)
const hasMenu = computed(() => Boolean(props.items?.length))
const canOpenPopup = computed(() => hasMenu.value || Boolean(slots.popup))
const isPrimaryDisabled = computed(() => props.disabled || props.primaryDisabled)
const isMenuDisabled = computed(() => props.disabled || props.menuDisabled || !canOpenPopup.value)
const resolvedMenuLabel = computed(() => props.menuLabel || `${props.label || 'Related'} options`)
const trailingLabel = computed(
  () =>
    props.menuButtonLabel ||
    `More ${props.label || String(attrs['aria-label'] || 'action')} options`,
)
const forwardedPrimaryAttrs = computed(() => {
  const result = { ...attrs }
  delete result.class
  delete result.style
  delete result.role
  return result
})

function getTrailingButton(): HTMLElement | null {
  return root.value?.root?.querySelector<HTMLElement>('.yam3x-split-button__menu') ?? null
}

function show(anchor = getTrailingButton()): void {
  if (isMenuDisabled.value || !anchor) return
  if (hasMenu.value) {
    menuApi.value?.show(anchor)
  } else {
    open.value = true
  }
}

function hide(restoreFocus = false): void {
  if (hasMenu.value) {
    menuApi.value?.hide(restoreFocus)
  } else {
    open.value = false
    if (restoreFocus) getTrailingButton()?.focus()
  }
}

function toggle(target?: HTMLElement | MouseEvent): void {
  if (isMenuDisabled.value) return
  if (hasMenu.value) {
    const anchor =
      target instanceof MouseEvent
        ? target.currentTarget instanceof HTMLElement
          ? target.currentTarget
          : getTrailingButton()
        : (target ?? getTrailingButton())
    if (anchor) menuApi.value?.toggle(anchor)
  } else if (open.value) {
    hide()
  } else {
    show()
  }
}

function closePopup(): void {
  hide(true)
}

function onPrimaryClick(event: MouseEvent): void {
  emit('click', event)
}

function forwardBeforeToggle(event: CustomEvent<{ open: boolean }>): void {
  emit('beforetoggle', event)
}

function forwardToggle(event: CustomEvent<{ open: boolean }>): void {
  emit('toggle', event)
}

function forwardBeforeSelect(
  item: MenuItem,
  event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>,
): void {
  emit('beforeselect', item, event)
}

function forwardSelect(
  item: MenuItem,
  event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>,
): void {
  emit('select', item, event)
}

watch(isMenuDisabled, (disabled) => {
  if (disabled && open.value) hide()
})
watch(menuOpen, (value) => {
  if (open.value !== value) open.value = value
})
watch(
  open,
  (value) => {
    if (!hasMenu.value) return
    if (value && !menuOpen.value) {
      if (isMenuDisabled.value) {
        open.value = false
        return
      }
      const anchor = getTrailingButton()
      if (anchor) {
        menuApi.value?.show(anchor)
        if (!menuOpen.value) open.value = false
      }
    } else if (!value && menuOpen.value) {
      menuApi.value?.hide()
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  if (hasMenu.value && open.value && !menuOpen.value) {
    if (isMenuDisabled.value) {
      open.value = false
      return
    }
    const anchor = getTrailingButton()
    if (anchor) {
      menuApi.value?.show(anchor)
      if (!menuOpen.value) open.value = false
    }
  }
})

defineExpose({
  show,
  hide,
  toggle,
  root: computed(() => root.value?.root ?? null),
})
</script>

<template>
  <SplitButtonLayout
    ref="root"
    :class="$attrs.class"
    :style="$attrs.style"
    :variant="variant"
    :size="size"
    :shape="shape"
    :aria-label="groupLabel"
    spacing="2px"
  >
    <template #leading>
      <SplitButtonLeadingButton
        v-bind="forwardedPrimaryAttrs"
        :variant="variant"
        :size="size"
        :shape="shape"
        :disabled="isPrimaryDisabled"
        @click="onPrimaryClick"
      >
        <template
          v-if="$slots.icon"
          #icon
          ><slot name="icon"
        /></template>
        <template #default
          ><slot>{{ label }}</slot></template
        >
      </SplitButtonLeadingButton>
    </template>
    <template #trailing>
      <Menu
        v-if="hasMenu"
        ref="menuApi"
        v-model:open="menuOpen"
        :items="items!"
        :label="resolvedMenuLabel"
        :trigger-label="trailingLabel"
        :position-x="positionX"
        :position-y="positionY"
        @beforetoggle="forwardBeforeToggle"
        @toggle="forwardToggle"
        @beforeselect="forwardBeforeSelect"
        @select="forwardSelect"
      >
        <template #trigger="{ triggerProps }">
          <SplitButtonTrailingButton
            v-bind="triggerProps"
            v-model:checked="menuOpen"
            :size="size"
            :shape="shape"
            :variant="variant"
            :disabled="isMenuDisabled"
            :aria-label="trailingLabel"
          />
        </template>
        <template
          v-if="$slots['menu-icon']"
          #icon="scope"
        >
          <slot
            name="menu-icon"
            v-bind="scope"
          />
        </template>
      </Menu>
      <div
        v-else
        class="yam3x-split-button__menu-anchor"
      >
        <SplitButtonTrailingButton
          v-model:checked="open"
          :size="size"
          :shape="shape"
          :variant="variant"
          :disabled="isMenuDisabled"
          :aria-label="trailingLabel"
          :aria-haspopup="slots.popup ? popupRole : undefined"
          :aria-controls="slots.popup ? customPopupId : undefined"
          @click="toggle"
        />
        <slot
          v-if="open && slots.popup"
          name="popup"
          :anchor="getTrailingButton()"
          :open="open"
          :close="closePopup"
          :popup-id="customPopupId"
        />
      </div>
    </template>
  </SplitButtonLayout>
</template>

<style scoped>
.yam3x-split-button__menu-anchor {
  position: relative;
  display: inline-flex;
  flex: none;
}
.yam3x-split-button__menu-anchor :deep(.yam3x-split-button__menu) {
  margin-block: 0;
}
</style>
