import type { ObjectDirective } from 'vue'

export interface TextareaAutosizeOptions {
  minRows?: number
  maxRows?: number
  enabled?: boolean
}

interface SavedStyle {
  height: string
  heightPriority: string
  overflowY: string
  overflowYPriority: string
}

interface State {
  options: TextareaAutosizeOptions
  savedStyle: SavedStyle
  measuredValue: string
  measuredStyle: string | null
  frame: number | undefined
  resizeObserver: ResizeObserver | undefined
  mutationObserver: MutationObserver | undefined
  form: HTMLFormElement | null
  measure: () => void
  schedule: () => void
  restore: () => void
  cleanup: () => void
}

const states = new WeakMap<HTMLTextAreaElement, State>()

function saveStyle(element: HTMLTextAreaElement): SavedStyle {
  return {
    height: element.style.getPropertyValue('height'),
    heightPriority: element.style.getPropertyPriority('height'),
    overflowY: element.style.getPropertyValue('overflow-y'),
    overflowYPriority: element.style.getPropertyPriority('overflow-y'),
  }
}

function restoreProperty(
  element: HTMLTextAreaElement,
  name: string,
  value: string,
  priority: string,
) {
  if (
    element.style.getPropertyValue(name) === value &&
    element.style.getPropertyPriority(name) === priority
  )
    return
  if (value) element.style.setProperty(name, value, priority)
  else element.style.removeProperty(name)
}

function normalizedOptions(
  options: TextareaAutosizeOptions | undefined,
  element: HTMLTextAreaElement,
) {
  const minRows = options?.minRows ?? element.rows
  const maxRows = options?.maxRows ?? 0
  if (!Number.isInteger(minRows) || minRows < 1)
    throw new RangeError('textarea autosize minRows must be a positive integer')
  if (!Number.isInteger(maxRows) || maxRows < 0)
    throw new RangeError('textarea autosize maxRows must be a non-negative integer')
  if (maxRows > 0 && maxRows < minRows)
    throw new RangeError('textarea autosize maxRows must be greater than or equal to minRows')
  return { ...options, minRows, maxRows, enabled: options?.enabled ?? true }
}

function measure(element: HTMLTextAreaElement, state: State) {
  if (!state.options.enabled) {
    state.restore()
    return
  }

  const style = getComputedStyle(element)
  const lineHeight =
    style.lineHeight === 'normal'
      ? Number.parseFloat(style.fontSize) * 1.2
      : Number.parseFloat(style.lineHeight)
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return

  const minRows = state.options.minRows!
  const maxRows = state.options.maxRows!
  const verticalPadding =
    Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
  const verticalBorder =
    Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
  element.style.height = 'auto'
  const scrollHeight = element.scrollHeight
  const measuredContentHeight = Math.max(0, scrollHeight - verticalPadding)
  const minimumContentHeight = minRows * lineHeight
  const maximumContentHeight = maxRows > 0 ? maxRows * lineHeight : Number.POSITIVE_INFINITY
  const desiredContentHeight = Math.max(
    minimumContentHeight,
    Math.min(measuredContentHeight, maximumContentHeight),
  )
  const cssHeight =
    desiredContentHeight + (style.boxSizing === 'border-box' ? verticalPadding + verticalBorder : 0)
  const nextHeight = `${cssHeight}px`
  if (element.style.height !== nextHeight) element.style.height = nextHeight

  const isCapped = maxRows > 0 && measuredContentHeight > maximumContentHeight
  if (isCapped) element.style.setProperty('overflow-y', 'auto')
  else
    restoreProperty(
      element,
      'overflow-y',
      state.savedStyle.overflowY,
      state.savedStyle.overflowYPriority,
    )
}

function createState(
  element: HTMLTextAreaElement,
  options: TextareaAutosizeOptions | undefined,
): State {
  const state: State = {
    options: normalizedOptions(options, element),
    savedStyle: saveStyle(element),
    measuredValue: element.value,
    measuredStyle: element.getAttribute('style'),
    frame: undefined,
    resizeObserver: undefined,
    mutationObserver: undefined,
    form: element.form,
    measure: () => {},
    schedule: () => {},
    restore: () => {},
    cleanup: () => {},
  }

  state.restore = () => {
    restoreProperty(element, 'height', state.savedStyle.height, state.savedStyle.heightPriority)
    restoreProperty(
      element,
      'overflow-y',
      state.savedStyle.overflowY,
      state.savedStyle.overflowYPriority,
    )
  }
  state.measure = () => {
    measure(element, state)
    state.measuredValue = element.value
    state.measuredStyle = element.getAttribute('style')
  }
  state.schedule = () => {
    if (state.frame !== undefined) cancelAnimationFrame(state.frame)
    state.frame = requestAnimationFrame(() => {
      state.frame = undefined
      state.measure()
    })
  }

  return state
}

function mount(element: HTMLTextAreaElement, options: TextareaAutosizeOptions | undefined) {
  const state = createState(element, options)
  states.set(element, state)
  const onInput = () => state.schedule()
  const onReset = () => state.schedule()
  const onViewportResize = () => state.schedule()
  const onFontLoad = () => state.schedule()
  element.addEventListener('input', onInput)
  state.form?.addEventListener('reset', onReset)

  if (typeof ResizeObserver !== 'undefined') {
    state.resizeObserver = new ResizeObserver(() => state.schedule())
    state.resizeObserver.observe(element)
  } else {
    window.addEventListener('resize', onViewportResize)
  }
  if (typeof MutationObserver !== 'undefined') {
    state.mutationObserver = new MutationObserver(() => state.schedule())
    state.mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'placeholder', 'rows'],
    })
  }
  document.fonts?.addEventListener('loadingdone', onFontLoad)
  state.measure()

  state.cleanup = () => {
    if (state.frame !== undefined) cancelAnimationFrame(state.frame)
    state.resizeObserver?.disconnect()
    state.mutationObserver?.disconnect()
    element.removeEventListener('input', onInput)
    state.form?.removeEventListener('reset', onReset)
    window.removeEventListener('resize', onViewportResize)
    document.fonts?.removeEventListener('loadingdone', onFontLoad)
    state.restore()
    states.delete(element)
  }
  return state.cleanup
}

export const vTextareaAutosize: ObjectDirective<HTMLTextAreaElement, TextareaAutosizeOptions> = {
  mounted(element, binding) {
    mount(element, binding.value)
  },
  updated(element, binding) {
    const state = states.get(element)
    if (!state) return
    const options = normalizedOptions(binding.value, element)
    if (
      options.minRows === state.options.minRows &&
      options.maxRows === state.options.maxRows &&
      options.enabled === state.options.enabled &&
      element.value === state.measuredValue &&
      element.getAttribute('style') === state.measuredStyle
    )
      return
    state.options = options
    state.measure()
  },
  beforeUnmount(element) {
    const state = states.get(element)
    state?.cleanup()
  },
}
