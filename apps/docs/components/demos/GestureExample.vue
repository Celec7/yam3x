<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { Button } from '@registry/components/button'
import { longPress, pan, swipe, transform, useGestures } from '@registry/foundations/gestures'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const holdTarget = ref<HTMLButtonElement>()
const panTarget = ref<HTMLButtonElement>()
const swipeTarget = ref<HTMLButtonElement>()
const transformTarget = ref<HTMLDivElement>()
function bindButton(target: Ref<HTMLButtonElement | undefined>) {
  return (component: unknown) => {
    const element =
      component instanceof HTMLButtonElement
        ? component
        : (component as { $el?: unknown } | null)?.$el
    target.value = element instanceof HTMLButtonElement ? element : undefined
  }
}
const holdTargetRef = bindButton(holdTarget)
const panTargetRef = bindButton(panTarget)
const swipeTargetRef = bindButton(swipeTarget)
const holdStatus = ref('')
const panStatus = ref('')
const swipeStatus = ref('')
const transformStatus = ref('')
const hold = longPress({ minDuration: 450 })
const drag = pan({ lockAxis: 'auto' })
const flick = swipe()
const combined = transform()
hold.addListener((detail) => {
  holdStatus.value = detail.phase
})
drag.addListener((detail) => {
  panStatus.value = `${detail.phase} · ${Math.round(detail.totalDisplacement)} px`
})
flick.addListener((detail) => {
  swipeStatus.value = `${detail.phase} · ${detail.direction}`
})
combined.addListener((detail) => {
  transformStatus.value = `${detail.phase} · ${t('scale', '缩放')} ${detail.scale.toFixed(2)} · ${t('rotation', '旋转')} ${detail.rotation.toFixed(2)} rad`
})
useGestures(holdTarget, hold)
useGestures(panTarget, drag)
useGestures(swipeTarget, flick)
useGestures(transformTarget, combined)
</script>

<template>
  <div class="yam3x-demo yam3x-demo__row">
    <Button
      :ref="holdTargetRef"
      variant="filled"
      class="gesture-demo__target"
      type="button"
      >{{ t('Press and hold for 450 ms', '按住 450 毫秒') }}</Button
    >
    <span
      data-testid="gesture-status"
      role="status"
      aria-live="polite"
      >{{ t('Long press:', '长按：') }} {{ holdStatus || t('Not triggered', '尚未触发') }}</span
    >
  </div>
  <div class="yam3x-demo yam3x-demo__row">
    <Button
      :ref="panTargetRef"
      variant="filled-tonal"
      class="gesture-demo__target"
      type="button"
      >{{ t('Drag to pan', '拖动以平移') }}</Button
    >
    <span
      data-testid="pan-status"
      role="status"
      aria-live="polite"
      >{{ t('Pan:', '平移：') }} {{ panStatus || t('Not triggered', '尚未触发') }}</span
    >
  </div>
  <div class="yam3x-demo yam3x-demo__row">
    <Button
      :ref="swipeTargetRef"
      variant="outlined"
      class="gesture-demo__target"
      type="button"
      >{{ t('Swipe quickly', '快速滑动') }}</Button
    >
    <span
      data-testid="swipe-status"
      role="status"
      aria-live="polite"
      >{{ t('Swipe:', '滑动：') }} {{ swipeStatus || t('Not triggered', '尚未触发') }}</span
    >
  </div>
  <div class="yam3x-demo">
    <div
      ref="transformTarget"
      data-testid="transform-target"
      role="group"
      :aria-label="t('Multi-touch transform demo', '多指变换演示')"
      style="
        display: grid;
        min-height: 140px;
        place-items: center;
        border: 1px solid currentColor;
        border-radius: 16px;
        touch-action: none;
      "
    >
      {{ t('Pinch, rotate, or pan with two fingers', '两指捏合、旋转或平移') }}
    </div>
    <span
      data-testid="transform-status"
      role="status"
      aria-live="polite"
      >{{ t('Transform:', '变换：') }} {{ transformStatus || t('Not triggered', '尚未触发') }}</span
    >
  </div>
</template>

<style scoped>
.gesture-demo__target {
  touch-action: none;
}
</style>
