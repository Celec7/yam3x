import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface VirtualListOptions {
  /** Estimated row height before measurement, in CSS pixels. */
  estimateSize?: number
  /** Extra rows rendered on each side of the viewport. */
  overscan?: number
}
type Key = string | number

/** A measured window over application-owned records; callers own row semantics and rendering. */
export function useVirtualList<K extends Key>(config: {
  keys: () => readonly K[]
  scroller: () => HTMLElement | null | undefined
  enabled: () => boolean
  options: () => VirtualListOptions | undefined
  keepMounted?: () => K | null | undefined
}) {
  const revision = ref(0)
  const top = ref(0)
  const viewport = ref(280)
  const paddingStart = ref(0)
  const paddingEnd = ref(0)
  const heights = new Map<K, number>()
  const elements = new Map<K, HTMLElement>()
  const elementKeys = new WeakMap<HTMLElement, K>()
  let observer: ResizeObserver | undefined
  let scrollElement: HTMLElement | null = null
  let previousAnchor = ''
  let mounted = false
  let pendingTarget: K | null = null
  const keys = computed(config.keys)
  const estimate = computed(() => {
    const value = config.options()?.estimateSize ?? 48
    return Number.isFinite(value) && value > 0 ? value : 48
  })
  const overscan = computed(() => {
    const value = config.options()?.overscan ?? 4
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 4
  })
  const offsets = computed(() => {
    void revision.value
    const result = [0]
    for (const key of keys.value)
      result.push(result[result.length - 1]! + (heights.get(key) ?? estimate.value))
    return result
  })
  const totalSize = computed(() => offsets.value.at(-1) ?? 0)
  function indexAt(offset: number) {
    let low = 0
    let high = keys.value.length
    while (low < high) {
      const middle = Math.floor((low + high) / 2)
      if (offsets.value[middle + 1]! <= offset) low = middle + 1
      else high = middle
    }
    return Math.min(low, Math.max(0, keys.value.length - 1))
  }
  const items = computed(() => {
    if (!config.enabled()) return []
    const start = Math.max(0, indexAt(top.value - paddingStart.value) - overscan.value)
    const end = Math.min(
      keys.value.length,
      indexAt(top.value - paddingStart.value + viewport.value) + overscan.value + 1,
    )
    const indices = new Set(
      Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index),
    )
    const pinned = config.keepMounted?.()
    if (pinned != null) {
      const index = keys.value.indexOf(pinned)
      if (index >= 0) indices.add(index)
    }
    return [...indices]
      .sort((a, b) => a - b)
      .map((index) => ({
        key: keys.value[index]!,
        index,
        offset: offsets.value[index]!,
      }))
  })
  function measureViewport() {
    if (!scrollElement?.clientHeight) return
    const style = getComputedStyle(scrollElement)
    viewport.value = scrollElement.clientHeight
    paddingStart.value = parseFloat(style.paddingTop) || 0
    paddingEnd.value = parseFloat(style.paddingBottom) || 0
  }
  function readViewport() {
    if (!scrollElement) return
    top.value = scrollElement.scrollTop
    measureViewport()
  }
  function writeTop(value: number) {
    top.value = Math.max(
      0,
      Math.min(
        value,
        Math.max(0, totalSize.value + paddingStart.value + paddingEnd.value - viewport.value),
      ),
    )
    if (scrollElement) scrollElement.scrollTop = top.value
    void nextTick(() => {
      if (scrollElement) scrollElement.scrollTop = top.value
    })
  }
  function scrollToKey(key: K) {
    measureViewport()
    const element = elements.get(key)
    pendingTarget =
      !element || !heights.has(key) || element.getBoundingClientRect().height <= 0 ? key : null
    const index = keys.value.indexOf(key)
    if (index < 0) {
      pendingTarget = null
      return
    }
    const start = paddingStart.value + offsets.value[index]!
    const end = paddingStart.value + offsets.value[index + 1]!
    if (start < top.value) writeTop(start)
    else if (end > top.value + viewport.value) writeTop(end - viewport.value)
  }
  function measure(key: K, element: HTMLElement | null) {
    const previous = elements.get(key)
    if (previous === element) return
    if (previous) observer?.unobserve(previous)
    if (!element) {
      elements.delete(key)
      return
    }
    elements.set(key, element)
    elementKeys.set(element, key)
    observer?.observe(element, { box: 'border-box' })
  }
  function disconnect() {
    observer?.disconnect()
    observer = undefined
    scrollElement?.removeEventListener('scroll', readViewport)
    if (scrollElement) scrollElement.style.overflowAnchor = previousAnchor
    scrollElement = null
  }
  function connect() {
    disconnect()
    if (!mounted || !config.enabled()) return
    scrollElement = config.scroller() ?? null
    if (!scrollElement) return
    previousAnchor = scrollElement.style.overflowAnchor
    scrollElement.style.overflowAnchor = 'none'
    scrollElement.addEventListener('scroll', readViewport, { passive: true })
    readViewport()
    observer = new ResizeObserver((entries) => {
      const anchorIndex = indexAt(top.value - paddingStart.value)
      const anchorKey = keys.value[anchorIndex]
      const withinRow = top.value - paddingStart.value - offsets.value[anchorIndex]!
      const pinned = config.keepMounted?.()
      const pinnedIndex = pinned == null ? -1 : keys.value.indexOf(pinned)
      const pinnedVisible =
        pinnedIndex >= 0 &&
        paddingStart.value + offsets.value[pinnedIndex]! >= top.value &&
        paddingStart.value + offsets.value[pinnedIndex + 1]! <= top.value + viewport.value
      let changed = false
      let targetMeasured = false
      let viewportMeasured = false
      for (const entry of entries) {
        if (entry.target === scrollElement) {
          readViewport()
          viewportMeasured = true
          continue
        }
        const element = entry.target as HTMLElement
        const key = elementKeys.get(element)
        if (key === undefined || elements.get(key) !== element) continue
        const height = entry.borderBoxSize?.[0]?.blockSize ?? element.getBoundingClientRect().height
        if (height > 0) {
          if (Math.abs(height - (heights.get(key) ?? estimate.value)) > 0.01) changed = true
          heights.set(key, height)
          if (key === pendingTarget) targetMeasured = true
        }
      }
      if (changed) {
        revision.value++
        const index = anchorKey === undefined ? -1 : keys.value.indexOf(anchorKey)
        if (index >= 0) writeTop(paddingStart.value + offsets.value[index]! + withinRow)
      }
      if (pendingTarget !== null && (targetMeasured || viewportMeasured)) scrollToKey(pendingTarget)
      else if (pinnedVisible && pinned != null) scrollToKey(pinned)
    })
    observer.observe(scrollElement)
    for (const element of elements.values()) observer.observe(element, { box: 'border-box' })
  }
  watch(() => [config.enabled(), config.scroller()], connect, { flush: 'post' })
  watch(keys, (current) => {
    const retained = new Set(current)
    if (pendingTarget !== null && !retained.has(pendingTarget)) pendingTarget = null
    for (const key of heights.keys()) if (!retained.has(key)) heights.delete(key)
    for (const [key] of elements) if (!retained.has(key)) measure(key, null)
    void nextTick(() => writeTop(top.value))
  })
  onMounted(() => {
    mounted = true
    connect()
  })
  onBeforeUnmount(() => {
    disconnect()
    elements.clear()
    heights.clear()
  })
  function offsetFor(key: K) {
    const index = keys.value.indexOf(key)
    return index < 0 ? 0 : offsets.value[index]!
  }
  return { items, totalSize, measure, scrollToKey, offsetFor }
}
