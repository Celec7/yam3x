<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Carousel } from '@registry/components/carousel'
import type { CarouselItem, CarouselLayout } from '@registry/components/carousel'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const layouts = computed<Array<{ value: CarouselLayout; label: string }>>(() => [
  { value: 'multi-browse', label: t('Multi-browse', '多项浏览') },
  { value: 'uncontained', label: t('Uncontained', '无边界') },
  {
    value: 'uncontained-multi-aspect-ratio',
    label: t('Uncontained multi-aspect ratio', '无边界多纵横比'),
  },
  { value: 'hero', label: t('Hero', '主视觉') },
  { value: 'center-aligned-hero', label: t('Center-aligned hero', '居中主视觉') },
  { value: 'full-screen', label: t('Full-screen', '全屏') },
])
const items = computed<CarouselItem[]>(() => [
  { key: 'coast', label: t('Coastline', '海岸线'), aspectRatio: '16:9' },
  { key: 'garden', label: t('Garden', '花园'), aspectRatio: '3:4' },
  { key: 'city', label: t('City at dusk', '暮色城市'), aspectRatio: '1:1', actionable: true },
  { key: 'mountain', label: t('Mountain lake', '高山湖泊'), aspectRatio: '16:9' },
  { key: 'desert', label: t('Desert', '沙漠'), aspectRatio: '9:16' },
])
const layout = ref<CarouselLayout>('multi-browse')
const activeIndex = ref(0)
const lastActivated = ref('')
const showAll = ref(false)
const fullScreenAllowed = ref(false)
const activeItem = computed(() => items.value[activeIndex.value])
const compactLabels = computed(() => [
  t('Coast', '海岸'),
  t('Garden', '花园'),
  t('City', '城市'),
  t('Lake', '湖泊'),
  t('Dune', '沙丘'),
])

function updateFullScreenAvailability(): void {
  fullScreenAllowed.value = window.matchMedia(
    '(orientation: portrait) and (max-width: 839px)',
  ).matches
  if (!fullScreenAllowed.value && layout.value === 'full-screen') layout.value = 'hero'
}

onMounted(() => {
  updateFullScreenAvailability()
  window.addEventListener('resize', updateFullScreenAvailability)
  window.addEventListener('orientationchange', updateFullScreenAvailability)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateFullScreenAvailability)
  window.removeEventListener('orientationchange', updateFullScreenAvailability)
})
</script>

<template>
  <div class="carousel-demo">
    <label class="carousel-demo__layout">
      <span>{{ t('Carousel layout', '轮播布局') }}</span>
      <Select v-model="layout">
        <Option
          v-for="option in layouts"
          :key="option.value"
          :value="option.value"
          :disabled="option.value === 'full-screen' && !fullScreenAllowed"
          :label="option.label"
        />
      </Select>
    </label>
    <p
      v-if="!fullScreenAllowed"
      class="carousel-demo__guidance"
    >
      {{
        t(
          'Full-screen is available only on portrait screens at compact or medium widths.',
          '全屏布局仅适用于紧凑或中等宽度的竖屏。',
        )
      }}
    </p>
    <Carousel
      v-model:active-index="activeIndex"
      :items="items"
      :layout="layout"
      :label="t('Featured places', '精选地点')"
      :snap="!['uncontained', 'uncontained-multi-aspect-ratio'].includes(layout)"
      @activate="(item) => (lastActivated = item.label)"
    >
      <template #default="{ item, index, sizeRole }">
        <div
          class="carousel-demo__scene"
          :class="[`carousel-demo__scene--${index % 5}`, `carousel-demo__scene--${sizeRole}`]"
        >
          <div
            class="carousel-demo__art"
            data-yam3x-carousel-parallax
            aria-hidden="true"
          />
          <span
            v-if="sizeRole === 'large'"
            class="carousel-demo__eyebrow"
            >{{ t('Featured place', '精选地点') }} {{ index + 1 }}</span
          >
          <strong v-if="sizeRole !== 'small'">{{
            sizeRole === 'medium' ? compactLabels[index] : item.label
          }}</strong>
          <span
            v-else
            class="carousel-demo__number"
            aria-hidden="true"
            >{{ index + 1 }}</span
          >
        </div>
      </template>
    </Carousel>
    <div class="carousel-demo__footer">
      <span aria-live="polite"
        >{{ t('Current:', '当前：') }} {{ activeItem?.label ?? t('None', '无') }} ({{
          activeIndex + 1
        }}/{{ items.length }})</span
      >
      <Button
        variant="filled-tonal"
        type="button"
        aria-controls="carousel-featured-all"
        :aria-expanded="showAll"
        @click="showAll = !showAll"
        >{{ showAll ? t('Show less', '收起全部') : t('Browse all', '浏览全部') }}</Button
      >
    </div>
    <p
      v-if="lastActivated"
      class="carousel-demo__activation"
      aria-live="polite"
    >
      {{ t('Activated:', '已触发：') }} {{ lastActivated }}
    </p>
    <section
      v-show="showAll"
      id="carousel-featured-all"
      class="carousel-demo__all"
      :aria-label="t('All places', '全部地点')"
    >
      <article
        v-for="(item, index) in items"
        :key="item.key"
        class="carousel-demo__scene"
        :class="`carousel-demo__scene--${index % 5}`"
      >
        <div
          class="carousel-demo__art"
          aria-hidden="true"
        />
        <span class="carousel-demo__eyebrow">{{ t('Place', '地点') }} {{ index + 1 }}</span>
        <strong>{{ item.label }}</strong>
      </article>
    </section>
  </div>
</template>

<style scoped>
.carousel-demo {
  display: grid;
  gap: 16px;
}
.carousel-demo__guidance {
  margin: -8px 0 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
.carousel-demo__activation {
  margin: -8px 0 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
.carousel-demo__layout,
.carousel-demo__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.carousel-demo__scene {
  position: relative;
  isolation: isolate;
  display: flex;
  box-sizing: border-box;
  min-height: inherit;
  height: 100%;
  flex-direction: column;
  justify-content: end;
  gap: 8px;
  padding: 20px;
  color: white;
}
.carousel-demo__art {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
}
.carousel-demo__scene > :not(.carousel-demo__art) {
  position: relative;
  z-index: 1;
}
.carousel-demo__scene strong {
  font-size: clamp(20px, 3cqi, 30px);
}
.carousel-demo__scene--medium {
  padding-inline: 12px;
}
.carousel-demo__scene--medium strong {
  font-size: clamp(14px, 2.5cqi, 20px);
  white-space: nowrap;
}
.carousel-demo__scene--small {
  align-items: center;
  padding-inline: 4px;
}
.carousel-demo__scene--small .carousel-demo__number {
  font-size: 14px;
}
.carousel-demo__eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.carousel-demo__scene--0 .carousel-demo__art {
  background: linear-gradient(145deg, #375f62, #83a9a2 55%, #e4c6a5);
}
.carousel-demo__scene--1 .carousel-demo__art {
  background: linear-gradient(145deg, #224438, #6a936c 55%, #d1bc82);
}
.carousel-demo__scene--2 .carousel-demo__art {
  background: linear-gradient(145deg, #322f51, #746489 55%, #e7a47c);
}
.carousel-demo__scene--3 .carousel-demo__art {
  background: linear-gradient(145deg, #263f5b, #79a1ba 55%, #e5d9b4);
}
.carousel-demo__scene--4 .carousel-demo__art {
  background: linear-gradient(145deg, #774d35, #d59a5e 55%, #f1d297);
}
.carousel-demo__all {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 12px;
}
.carousel-demo__all .carousel-demo__scene {
  height: 180px;
  min-height: 180px;
  border-radius: 20px;
}
</style>
