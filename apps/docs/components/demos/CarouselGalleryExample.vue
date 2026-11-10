<script setup lang="ts">
import { computed } from 'vue'
import { Carousel } from '@registry/components/carousel'
import type { CarouselItem, CarouselLayout } from '@registry/components/carousel'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

type Gallery = {
  id: string
  label: string
  layout: CarouselLayout
  items: CarouselItem[]
}

const galleries = computed<Gallery[]>(() => [
  {
    id: 'gallery-multi',
    label: t('Modern architecture', '现代建筑'),
    layout: 'multi-browse',
    items: [
      { key: 'pavilion', label: t('Pavilion', '展亭') },
      { key: 'atrium', label: t('Atrium', '中庭') },
      { key: 'terrace', label: t('Terrace', '露台') },
      { key: 'tower', label: t('Tower', '塔楼') },
      { key: 'courtyard', label: t('Courtyard', '庭院') },
    ],
  },
  {
    id: 'gallery-hero',
    label: t('Coastal journeys', '海岸旅程'),
    layout: 'hero',
    items: [
      { key: 'harbor', label: t('Harbor', '港口') },
      { key: 'cliffs', label: t('Cliffs', '悬崖') },
      { key: 'lighthouse', label: t('Lighthouse', '灯塔') },
      { key: 'lagoon', label: t('Lagoon', '潟湖') },
    ],
  },
  {
    id: 'gallery-uncontained',
    label: t('Studio collections', '工作室收藏'),
    layout: 'uncontained',
    items: [
      { key: 'ceramics', label: t('Ceramics', '陶艺') },
      { key: 'textiles', label: t('Textiles', '织物') },
      { key: 'prints', label: t('Prints', '版画'), disabled: true },
      { key: 'woodwork', label: t('Woodwork', '木作') },
    ],
  },
])

function tone(index: number): string {
  return ['one', 'two', 'three', 'four', 'five'][index % 5]!
}
</script>

<template>
  <div
    class="yam3x-demo carousel-gallery"
    data-testid="carousel-gallery"
  >
    <section
      v-for="gallery in galleries"
      :key="gallery.id"
      class="carousel-gallery__section"
    >
      <h4 class="carousel-gallery__title">{{ gallery.label }}</h4>
      <Carousel
        :items="gallery.items"
        :layout="gallery.layout"
        :label="gallery.label"
        item-height="200px"
        :data-testid="`${gallery.id}-carousel`"
      >
        <template #default="{ item, index, sizeRole }">
          <div
            class="carousel-gallery__scene"
            :class="[
              `carousel-gallery__scene--${tone(index)}`,
              `carousel-gallery__scene--${sizeRole}`,
            ]"
          >
            <strong v-if="sizeRole !== 'small'">{{ item.label }}</strong>
            <span
              v-else
              aria-hidden="true"
              >{{ index + 1 }}</span
            >
          </div>
        </template>
      </Carousel>
    </section>
    <p class="carousel-gallery__note">
      {{
        t(
          'The multi-browse gallery resizes items, the hero gallery keeps a large preview pair, and the uncontained gallery keeps one item width. The disabled Print item is skipped by keyboard navigation.',
          '多项浏览画廊会调整项目尺寸，主视觉画廊保留一组大预览，无边界画廊保持单一项目宽度。禁用的“版画”项目会被键盘导航跳过。',
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.carousel-gallery {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.carousel-gallery__section {
  display: grid;
  gap: 8px;
  min-inline-size: 0;
}
.carousel-gallery__title {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-small-font);
}
.carousel-gallery__scene {
  position: relative;
  display: flex;
  box-sizing: border-box;
  align-items: end;
  min-height: inherit;
  height: 100%;
  padding: 16px;
  color: white;
}
.carousel-gallery__scene strong {
  font-size: clamp(16px, 3cqi, 24px);
}
.carousel-gallery__scene--small {
  justify-content: center;
  padding-inline: 4px;
  font-size: 14px;
}
.carousel-gallery__scene--one {
  background: linear-gradient(145deg, #375f62, #83a9a2);
}
.carousel-gallery__scene--two {
  background: linear-gradient(145deg, #224438, #6a936c);
}
.carousel-gallery__scene--three {
  background: linear-gradient(145deg, #322f51, #746489);
}
.carousel-gallery__scene--four {
  background: linear-gradient(145deg, #263f5b, #79a1ba);
}
.carousel-gallery__scene--five {
  background: linear-gradient(145deg, #774d35, #d59a5e);
}
.carousel-gallery__note {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
</style>
