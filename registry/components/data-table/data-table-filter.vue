<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Menu from '../menu/menu.vue'
import IconButton from '../icon-button/icon-button.vue'
import type { MenuItem } from '../menu/menu.types'
import type { DataTableFilterOption, DataTableKey, DataTableMessages } from './data-table.types'

const props = defineProps<{
  label: string
  options: readonly DataTableFilterOption[]
  value: readonly DataTableKey[]
  disabled: boolean
  pending: boolean
  locale: string
  messages: DataTableMessages
}>()
const emit = defineEmits<{ apply: [value: DataTableKey[]] }>()
const menu = ref<InstanceType<typeof Menu>>()
const trigger = ref<InstanceType<typeof IconButton>>()
let restoreFocus = false
const open = ref(false)
const draft = ref<DataTableKey[]>([])
const triggerLabel = computed(() =>
  props.value.length
    ? props.messages.filterActive(props.label, props.value.length)
    : props.messages.filterColumn(props.label),
)
const checked = computed({
  get: () =>
    props.options.flatMap((option, index) =>
      draft.value.some((value) => Object.is(value, option.value)) ? [`option-${index}`] : [],
    ),
  set: (values: string[]) => {
    // Keep accepted values whose options are temporarily absent.
    draft.value = [
      ...draft.value.filter(
        (value) => !props.options.some((option) => Object.is(option.value, value)),
      ),
      ...props.options
        .filter((_, index) => values.includes(`option-${index}`))
        .map((option) => option.value),
    ]
  },
})
const items = computed<MenuItem[]>(() => [
  ...props.options.map((option, index): MenuItem => ({
    value: `option-${index}`,
    label: option.label,
    type: 'checkbox',
    disabled: option.disabled || props.disabled || props.pending,
  })),
  { value: 'divider', type: 'divider' },
  { value: 'apply', label: props.messages.applyFilter, disabled: props.disabled || props.pending },
  { value: 'clear', label: props.messages.clearFilter, disabled: props.disabled || props.pending },
])
watch(
  open,
  (value) => {
    if (value) draft.value = [...props.value]
  },
  { flush: 'sync' },
)
watch(
  () => [props.disabled, props.pending],
  () => {
    if (props.disabled || props.pending) {
      const root = menu.value?.root
      menu.value?.hide(Boolean(root?.contains(root.ownerDocument.activeElement)))
    }
  },
)
function select(item: MenuItem) {
  if (props.disabled || props.pending) return
  if (item.value !== 'apply' && item.value !== 'clear') return
  restoreFocus = true
  emit('apply', item.value === 'clear' ? [] : [...draft.value])
}
function onToggle(event: CustomEvent<{ open: boolean }>) {
  if (event.detail.open || !restoreFocus) return
  restoreFocus = false
  const button = trigger.value?.$el as HTMLButtonElement | undefined
  if (button?.isConnected) button.focus()
}
</script>

<template>
  <Menu
    ref="menu"
    v-model:open="open"
    v-model:checked="checked"
    :items="items"
    :locale="locale"
    :label="messages.filterColumn(label)"
    :trigger-label="triggerLabel"
    @beforetoggle="$event.detail.open && (disabled || pending) && $event.preventDefault()"
    @select="select"
    @toggle="onToggle"
  >
    <template #trigger="{ triggerProps }">
      <IconButton
        ref="trigger"
        v-bind="triggerProps"
        variant="standard"
        :disabled="disabled"
        :disabled-interactive="pending && !disabled"
        :data-filter-active="value.length ? 'true' : undefined"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 5h16l-6 7v6l-4 2v-8z"
            :fill="value.length ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </IconButton>
    </template>
  </Menu>
</template>
