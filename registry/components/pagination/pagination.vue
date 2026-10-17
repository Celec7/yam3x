<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import Button from '../button/button.vue'
import IconButton from '../icon-button/icon-button.vue'
import Icon from '../icon/icon.vue'
import Tooltip from '../tooltip/tooltip.vue'
import FormField from '../form-field/form-field.vue'
import Select from '../select/select.vue'
import Option from '../option/option.vue'
import { paginationItems } from './pagination.utils'
import type { PaginationChange, PaginationMessages } from './pagination.types'

const props = withDefaults(
  defineProps<{
    total: number
    page?: number
    pageSize?: number
    pageSizes?: readonly number[]
    locale?: string
    pending?: boolean
    disabled?: boolean
    href?: (page: number, pageSize: number) => string
    messages?: Partial<PaginationMessages>
  }>(),
  {
    page: 1,
    pageSize: 10,
    pageSizes: () => [],
    locale: 'en-US',
    pending: false,
    disabled: false,
    href: undefined,
    messages: undefined,
  },
)
const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  change: [detail: PaginationChange, event?: MouseEvent]
}>()
defineSlots<{ summary?(scope: { start: number; end: number; total: number }): unknown }>()
const uid = useId().replace(/:/g, '')
const previousId = `yam3x-pagination-previous-${uid}`
const nextId = `yam3x-pagination-next-${uid}`
const root = ref<HTMLElement>()
const numbers = ref<HTMLElement>()
const previous = ref<HTMLElement>()
const next = ref<HTMLElement>()
const navigation = ref<HTMLElement>()
const currentSummary = ref<HTMLElement>()
const compact = ref(true)
let observer: ResizeObserver | undefined
const format = computed(() => new Intl.NumberFormat(props.locale))
const messages = computed<PaginationMessages>(() => {
  const zh = /^zh/i.test(props.locale)
  return {
    label: zh ? '分页' : 'Pagination',
    previous: zh ? '上一页' : 'Previous page',
    next: zh ? '下一页' : 'Next page',
    pageSize: zh ? '每页条数' : 'Results per page',
    pending: zh ? '正在加载页面…' : 'Loading page…',
    page: (page) => (zh ? `第 ${page} 页` : `Page ${page}`),
    current: (page, count) => (zh ? `第 ${page} 页，共 ${count} 页` : `Page ${page} of ${count}`),
    range: (start, end, total) =>
      zh ? `第 ${start}–${end} 条，共 ${total} 条` : `${start}–${end} of ${total} results`,
    ...props.messages,
  }
})
const validSize = computed(() => Number.isSafeInteger(props.pageSize) && props.pageSize > 0)
const pageCount = computed(() =>
  validSize.value && Number.isSafeInteger(props.total) && props.total > 0
    ? Math.ceil(props.total / props.pageSize)
    : 0,
)
const validPage = computed(
  () =>
    Number.isSafeInteger(props.page) &&
    props.page >= 1 &&
    props.page <= Math.max(1, pageCount.value),
)
const unavailable = computed(
  () => props.disabled || props.pending || !validSize.value || !validPage.value,
)
const items = computed(() => paginationItems(props.page, pageCount.value))
const start = computed(() =>
  validPage.value && pageCount.value ? (props.page - 1) * props.pageSize + 1 : 0,
)
const end = computed(() => (start.value ? Math.min(props.page * props.pageSize, props.total) : 0))
const sizes = computed(() =>
  [...new Set([props.pageSize, ...props.pageSizes])]
    .filter((size) => Number.isSafeInteger(size) && size > 0)
    .sort((a, b) => a - b),
)
const sizeValue = computed(() => String(props.pageSize))
const currentText = computed(() =>
  messages.value.current(format.value.format(props.page), format.value.format(pageCount.value)),
)

function request(page: number, pageSize = props.pageSize, event?: MouseEvent) {
  if (unavailable.value || page < 1 || page > Math.max(1, Math.ceil(props.total / pageSize))) return
  if (page === props.page && pageSize === props.pageSize) return
  if (
    event &&
    (event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey)
  )
    return
  if (pageSize !== props.pageSize) emit('update:pageSize', pageSize)
  if (page !== props.page) emit('update:page', page)
  emit('change', { page, pageSize }, event)
}
function onSizeChange(value: string | string[] | null) {
  const size = Number(value)
  if (!sizes.value.includes(size)) return
  const page = Math.floor(((props.page - 1) * props.pageSize) / size) + 1
  request(Math.min(page, Math.max(1, Math.ceil(props.total / size))), size)
}
function focusCurrent() {
  const target = compact.value
    ? currentSummary.value
    : navigation.value?.querySelector<HTMLElement>(
        '[aria-current="page"]:not(:disabled, [aria-disabled="true"])',
      )
  ;(target ?? navigation.value)?.focus({ preventScroll: true })
}
function restoreCurrent(previousActive: Element | null) {
  const active = root.value?.ownerDocument.activeElement
  if (active && active !== previousActive && active !== root.value?.ownerDocument.body) return
  focusCurrent()
}
function measure() {
  if (!root.value || !numbers.value) return
  const gap = parseFloat(getComputedStyle(navigation.value!).columnGap) || 0
  const required =
    numbers.value.getBoundingClientRect().width +
    (previous.value?.getBoundingClientRect().width ?? 0) +
    (next.value?.getBoundingClientRect().width ?? 0) +
    gap * 2
  const value = required > root.value.clientWidth
  if (value === compact.value) return
  const active = root.value.ownerDocument.activeElement
  const needsFocus = Boolean(
    active && (numbers.value.contains(active) || active === currentSummary.value),
  )
  compact.value = value
  if (needsFocus) void nextTick(() => restoreCurrent(active))
}
watch([() => props.page, pageCount, () => props.pending, () => props.disabled], async () => {
  const active = root.value?.ownerDocument.activeElement as HTMLElement | null
  const ownedFocus = Boolean(active && navigation.value?.contains(active))
  await nextTick()
  measure()
  if (
    ownedFocus &&
    active &&
    (!active.isConnected || active.matches(':disabled, [aria-disabled="true"]'))
  )
    restoreCurrent(active)
})
onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    if (root.value) observer.observe(root.value)
    if (numbers.value) observer.observe(numbers.value)
  }
  measure()
})
watch(
  numbers,
  (value, previousValue) => {
    if (previousValue) observer?.unobserve(previousValue)
    if (value) observer?.observe(value)
    measure()
  },
  { flush: 'post' },
)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="yam3x-pagination"
    :class="{ 'yam3x-pagination--compact': compact }"
  >
    <nav
      v-if="pageCount > 1"
      ref="navigation"
      class="yam3x-pagination__navigation"
      :aria-label="messages.label"
      :aria-busy="pending || undefined"
      tabindex="-1"
    >
      <span
        ref="previous"
        class="yam3x-pagination__target"
      >
        <IconButton
          :id="previousId"
          variant="standard"
          :href="page > 1 ? href?.(page - 1, pageSize) : undefined"
          :disabled="unavailable || page <= 1"
          :aria-label="messages.previous"
          @click="request(page - 1, pageSize, $event)"
          ><Icon
            name="chevron_left"
            filled
            class="yam3x-pagination__direction"
        /></IconButton>
        <Tooltip :for="previousId">{{ messages.previous }}</Tooltip>
      </span>
      <span
        class="yam3x-pagination__pages-clip"
        :aria-hidden="compact || undefined"
        :inert="compact || undefined"
      >
        <span
          ref="numbers"
          class="yam3x-pagination__pages"
        >
          <span
            v-for="item in items"
            :key="item"
            class="yam3x-pagination__target"
          >
            <Button
              v-if="typeof item === 'number'"
              :variant="item === page ? 'filled-tonal' : 'text'"
              :href="href?.(item, pageSize)"
              :disabled="unavailable"
              :aria-label="messages.page(format.format(item))"
              :aria-current="item === page ? 'page' : undefined"
              @click="request(item, pageSize, $event)"
              >{{ format.format(item) }}</Button
            >
            <span
              v-else
              class="yam3x-pagination__ellipsis"
              aria-hidden="true"
              >…</span
            >
          </span>
        </span>
      </span>
      <span
        v-if="compact"
        ref="currentSummary"
        class="yam3x-pagination__current"
        dir="auto"
        :aria-current="validPage ? 'page' : undefined"
        tabindex="-1"
        >{{ currentText }}</span
      >
      <span
        ref="next"
        class="yam3x-pagination__target"
      >
        <IconButton
          :id="nextId"
          variant="standard"
          :href="page < pageCount ? href?.(page + 1, pageSize) : undefined"
          :disabled="unavailable || page >= pageCount"
          :aria-label="messages.next"
          @click="request(page + 1, pageSize, $event)"
          ><Icon
            name="chevron_right"
            filled
            class="yam3x-pagination__direction"
        /></IconButton>
        <Tooltip :for="nextId">{{ messages.next }}</Tooltip>
      </span>
    </nav>
    <div class="yam3x-pagination__secondary">
      <span
        class="yam3x-pagination__range"
        dir="auto"
        ><slot
          name="summary"
          :start="start"
          :end="end"
          :total="total"
          >{{
            messages.range(format.format(start), format.format(end), format.format(total))
          }}</slot
        ></span
      >
      <FormField
        v-if="pageSizes.length"
        :label="messages.pageSize"
        width="20em"
        class="yam3x-pagination__size"
      >
        <Select
          :model-value="sizeValue"
          :disabled="unavailable"
          @update:model-value="onSizeChange"
        >
          <Option
            v-for="size in sizes"
            :key="size"
            :value="String(size)"
            :label="format.format(size)"
          />
        </Select>
      </FormField>
    </div>
    <span
      v-if="pending"
      role="status"
      class="yam3x-pagination__range"
      >{{ messages.pending }}</span
    >
  </div>
</template>

<style scoped>
.yam3x-pagination {
  --_yam3x-pagination-gap: calc(8px * var(--md-sys-density-spacing-scale, 1));
  --_yam3x-pagination-color: var(--md-sys-color-on-surface);
  --_yam3x-pagination-supporting-color: var(--md-sys-color-on-surface-variant);
  --_yam3x-pagination-label-font: var(--md-sys-typescale-label-large-font-family);
  --_yam3x-pagination-label-size: var(--md-sys-typescale-label-large-font-size);
  --_yam3x-pagination-label-height: var(--md-sys-typescale-label-large-line-height);
  --_yam3x-pagination-label-weight: var(--md-sys-typescale-label-large-font-weight);
  --_yam3x-pagination-label-tracking: var(--md-sys-typescale-label-large-tracking);
  --_yam3x-pagination-body-font: var(--md-sys-typescale-body-small-font-family);
  --_yam3x-pagination-body-size: var(--md-sys-typescale-body-small-font-size);
  --_yam3x-pagination-body-height: var(--md-sys-typescale-body-small-line-height);
  --_yam3x-pagination-body-weight: var(--md-sys-typescale-body-small-font-weight);
  --_yam3x-pagination-body-tracking: var(--md-sys-typescale-body-small-tracking);
  display: grid;
  gap: var(--_yam3x-pagination-gap);
  min-inline-size: 0;
  color: var(--_yam3x-pagination-color);
  font-variant-numeric: tabular-nums;
}
.yam3x-pagination__navigation {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--_yam3x-pagination-gap);
  min-inline-size: 0;
}
.yam3x-pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--_yam3x-pagination-gap);
  inline-size: max-content;
}
.yam3x-pagination__target {
  display: grid;
  place-items: center;
  flex: none;
  min-inline-size: 48px;
  min-block-size: 48px;
}
.yam3x-pagination--compact .yam3x-pagination__pages-clip {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
  block-size: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}
.yam3x-pagination__current,
.yam3x-pagination__ellipsis {
  font-family: var(--_yam3x-pagination-label-font);
  font-size: var(--_yam3x-pagination-label-size);
  font-weight: var(--_yam3x-pagination-label-weight);
  line-height: var(--_yam3x-pagination-label-height);
  letter-spacing: var(--_yam3x-pagination-label-tracking);
}
.yam3x-pagination__current {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.yam3x-pagination__secondary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--_yam3x-pagination-gap) * 2);
}
.yam3x-pagination__range {
  color: var(--_yam3x-pagination-supporting-color);
  font-family: var(--_yam3x-pagination-body-font);
  font-size: var(--_yam3x-pagination-body-size);
  font-weight: var(--_yam3x-pagination-body-weight);
  line-height: var(--_yam3x-pagination-body-height);
  letter-spacing: var(--_yam3x-pagination-body-tracking);
}
.yam3x-pagination__size {
  max-inline-size: 100%;
}
.yam3x-pagination:dir(rtl) .yam3x-pagination__direction {
  transform: scaleX(-1);
}
.yam3x-pagination[hidden] {
  display: none;
}
</style>
