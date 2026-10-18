import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { DataTableColumn } from './data-table.types'

export function useDataTableSticky<T>(
  header: Ref<HTMLTableRowElement | undefined>,
  scroll: Ref<HTMLElement | undefined>,
  columns: () => ReadonlyArray<DataTableColumn<T>>,
  selectable: () => boolean,
  stickyHeader: () => boolean,
) {
  const widths = ref<number[]>([])
  const available = ref(0)
  const headerHeight = ref(0)
  const sides = computed(() => [
    ...(selectable()
      ? [columns().some((column) => column.fixed === 'start') ? 'start' : undefined]
      : []),
    ...columns().map((column) => column.fixed),
  ])
  const enabled = computed(() => stickyHeader() || sides.value.some(Boolean))
  const layout = computed(() => {
    let start = 0
    let end = 0
    const offsets: number[] = []
    sides.value.forEach((side, index) => {
      if (side === 'start') {
        offsets[index] = start
        start += widths.value[index] ?? 0
      }
    })
    for (let index = sides.value.length - 1; index >= 0; index--) {
      if (sides.value[index] === 'end') {
        offsets[index] = end
        end += widths.value[index] ?? 0
      }
    }
    return {
      offsets,
      start,
      end,
      fits: widths.value.length === sides.value.length && start + end < available.value,
    }
  })
  function side(index: number) {
    return layout.value.fits ? sides.value[index] : undefined
  }
  function cellStyle(index: number) {
    const pinned = side(index)
    return pinned
      ? { [`--_yam3x-data-table-fixed-${pinned}`]: `${layout.value.offsets[index]}px` }
      : undefined
  }
  const scrollStyle = computed(() => ({
    '--_yam3x-data-table-scroll-start': `${layout.value.fits ? layout.value.start : 0}px`,
    '--_yam3x-data-table-scroll-end': `${layout.value.fits ? layout.value.end : 0}px`,
    '--_yam3x-data-table-scroll-top': `${stickyHeader() ? headerHeight.value : 0}px`,
  }))
  let observer: ResizeObserver | undefined
  function measure() {
    const next = Array.from(header.value?.cells ?? [], (cell) => cell.getBoundingClientRect().width)
    if (
      next.length !== widths.value.length ||
      next.some((value, index) => value !== widths.value[index])
    )
      widths.value = next
    available.value = scroll.value?.clientWidth ?? 0
    headerHeight.value = header.value?.getBoundingClientRect().height ?? 0
  }
  function observe() {
    observer?.disconnect()
    if (!enabled.value || !header.value || !scroll.value) return
    measure()
    observer ??= new ResizeObserver(measure)
    observer.observe(scroll.value)
    for (const cell of header.value.cells) observer.observe(cell, { box: 'border-box' })
  }
  onMounted(observe)
  watch([() => columns().map((column) => column.id), selectable, enabled], observe, {
    flush: 'post',
  })
  onBeforeUnmount(() => observer?.disconnect())
  return { side, cellStyle, scrollStyle }
}
