<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useSlots } from 'vue'
import './list.css'

const props = withDefaults(
  defineProps<{
    leadingType?: 'custom' | 'icon' | 'avatar' | 'image' | 'video' | 'control'
    lines?: 'auto' | 'one' | 'two' | 'three'
    selected?: boolean
    disabled?: boolean
  }>(),
  { leadingType: 'custom', lines: 'auto', selected: false, disabled: false },
)
const emit = defineEmits<{ linecountchange: [lines: 'one' | 'two' | 'three'] }>()
const slots = useSlots()
const fallbackLineCount = computed(() => {
  if (props.lines !== 'auto') return props.lines
  const hasSupporting = slots.supporting || slots['supporting-text']
  if (slots.overline && hasSupporting) return 'three'
  return slots.overline || hasSupporting ? 'two' : 'one'
})
const layout = ref<HTMLElement | null>(null)
const measuredLineCount = ref<'one' | 'two' | 'three' | null>(null)
const lineCount = computed(() =>
  props.lines === 'auto' ? (measuredLineCount.value ?? fallbackLineCount.value) : props.lines,
)
let resizeObserver: ResizeObserver | undefined
let resizeFrame = 0

function measureLineCount(): void {
  const element = layout.value
  if (!element || props.lines !== 'auto') return

  const contentBlocks = element.querySelectorAll<HTMLElement>(
    '.yam3x-list-item__overline, .yam3x-list-item__headline, .yam3x-list-item__supporting',
  )
  let lines = 0
  for (const block of contentBlocks) {
    const height = block.getBoundingClientRect().height
    const lineHeight = Number.parseFloat(getComputedStyle(block).lineHeight)
    if (height <= 0) continue
    lines +=
      Number.isFinite(lineHeight) && lineHeight > 0
        ? Math.max(1, Math.round(height / lineHeight))
        : 1
  }

  const next = lines > 2 ? 'three' : lines === 2 ? 'two' : 'one'
  if (measuredLineCount.value !== next) measuredLineCount.value = next
  emit('linecountchange', next)
}

function scheduleMeasurement(): void {
  if (resizeFrame) return
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0
    measureLineCount()
  })
}

async function observeContent(): Promise<void> {
  await nextTick()
  const element = layout.value
  if (!element) return
  if (typeof ResizeObserver === 'undefined') {
    window.addEventListener('resize', scheduleMeasurement)
  } else {
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(scheduleMeasurement)
    resizeObserver.observe(element)
    element
      .querySelectorAll<HTMLElement>(
        '.yam3x-list-item__overline, .yam3x-list-item__headline, .yam3x-list-item__supporting',
      )
      .forEach((block) => resizeObserver?.observe(block))
  }
  measureLineCount()
}

onMounted(() => {
  void observeContent()
})
onUpdated(() => {
  void observeContent()
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleMeasurement)
  if (resizeFrame) cancelAnimationFrame(resizeFrame)
})
</script>

<template>
  <div
    ref="layout"
    class="yam3x-list-item__layout"
    :data-lines="lineCount"
    :data-selected="selected || undefined"
    :data-disabled="disabled || undefined"
  >
    <div
      v-if="$slots.leading"
      class="yam3x-list-item__leading"
      :data-leading-type="leadingType"
    >
      <slot name="leading" />
    </div>
    <div class="yam3x-list-item__content">
      <div
        v-if="$slots.overline"
        class="yam3x-list-item__overline"
      >
        <slot name="overline" />
      </div>
      <div class="yam3x-list-item__headline"><slot /></div>
      <div
        v-if="$slots.supporting || $slots['supporting-text']"
        class="yam3x-list-item__supporting"
      >
        <slot name="supporting-text"><slot name="supporting" /></slot>
      </div>
    </div>
    <div
      v-if="$slots['trailing-text']"
      class="yam3x-list-item__trailing-text"
    >
      <slot name="trailing-text" />
    </div>
    <div
      v-if="$slots.trailing"
      class="yam3x-list-item__trailing"
    >
      <slot name="trailing" />
    </div>
  </div>
</template>
