<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Tabs, type TabItem, type TabsLayout, type TabsVariant } from '@registry/components/tabs'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const variant = ref<TabsVariant>('primary')
const layout = ref<TabsLayout>('fixed')
const headerPosition = ref<'before' | 'after'>('before')
const count = ref(3)
const disablePagination = ref(false)
const disableSwipe = ref(false)
const selected = ref('videos')
const labels = [
  t('Videos', '视频'),
  t('Photos', '照片'),
  t('Audio', '音频'),
  t('Documents', '文档'),
  t('Favorites', '收藏夹'),
  t('Downloads', '下载'),
  t('History', '历史记录'),
]
const values = ['videos', 'photos', 'audio', 'documents', 'favorites', 'downloads', 'history']
const iconNames: Record<string, string> = {
  videos: 'video_library',
  photos: 'photo_library',
  audio: 'music_note',
  documents: 'description',
  favorites: 'star',
  downloads: 'download',
  history: 'history',
}
const items = computed(() =>
  values.slice(0, count.value).map((value, index) => ({
    value,
    label: labels[index],
    disabled: value === 'audio',
    badge: value === 'photos' ? '3' : undefined,
  })),
)
const events = ref<string[]>([])
function log(type: string) {
  events.value.push(type)
  events.value = events.value.slice(-6)
}
function onSelect(item: TabItem) {
  log(`select:${item.value}`)
}
function onModelUpdate(value: string | undefined) {
  log(`model:${value ?? ''}`)
}
function setCount(value: string | string[] | null) {
  if (value === '3' || value === '4' || value === '7') count.value = Number(value)
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack tabs-demo">
    <div class="tabs-demo__controls">
      <label
        >{{ t('Type', '类型') }}
        <Select
          v-model="variant"
          :aria-label="t('Tab type', '标签类型')"
          ><Option
            value="primary"
            :label="t('Primary', '主标签')" /><Option
            value="secondary"
            :label="t('Secondary', '次标签')" /></Select
      ></label>
      <label
        >{{ t('Layout', '布局') }}
        <Select
          v-model="layout"
          :aria-label="t('Tab layout', '标签布局')"
          ><Option
            value="fixed"
            :label="t('Fixed', '固定')" /><Option
            value="scrollable"
            :label="t('Scrollable', '滚动')" /><Option
            value="auto"
            :label="t('Auto', '自动')" /></Select
      ></label>
      <label
        >{{ t('Position', '位置') }}
        <Select
          v-model="headerPosition"
          :aria-label="t('Tab bar position', '标签栏位置')"
          ><Option
            value="before"
            :label="t('Above content', '内容上方')" /><Option
            value="after"
            :label="t('Below content', '内容下方')" /></Select
      ></label>
      <label
        >{{ t('Count', '数量') }}
        <Select
          :model-value="String(count)"
          :aria-label="t('Tab count', '标签数量')"
          @update:model-value="setCount"
          ><Option
            value="3"
            label="3" /><Option
            value="4"
            label="4" /><Option
            value="7"
            label="7" /></Select
      ></label>
      <Checkbox
        v-model="disablePagination"
        :label="t('Hide pagination buttons', '隐藏分页按钮')"
      />
      <Checkbox
        v-model="disableSwipe"
        :label="t('Disable content swiping', '禁用内容滑动')"
      />
    </div>
    <Tabs
      v-model="selected"
      data-testid="tabs"
      :label="t('Media categories', '媒体分类')"
      :items="items"
      :variant="variant"
      :layout="layout"
      :header-position="headerPosition"
      :disable-pagination="disablePagination"
      :disable-swipe="disableSwipe"
      @update:model-value="onModelUpdate"
      @select="onSelect"
    >
      <template #tab-content="{ item, selected: isSelected }">
        <span
          class="tabs-demo__tab-content"
          :class="{ 'tabs-demo__tab-content--primary': variant === 'primary' }"
          :data-selected="isSelected"
        >
          <span
            v-if="variant === 'primary'"
            class="tabs-demo__tab-icon"
            aria-hidden="true"
            ><Icon :name="iconNames[item.value]"
          /></span>
          <span class="yam3x-tabs__label">{{ item.label }}</span>
          <span
            v-if="item.badge !== undefined"
            class="yam3x-tabs__badge"
            aria-hidden="true"
            >{{ item.badge }}</span
          >
        </span>
      </template>
      <template #panel="{ item }">
        <div class="tabs-demo__panel">
          {{ item.label }}{{ t(' content', '内容') }}
          <Button type="button">{{ item.label }}{{ t(' actions', '操作') }}</Button>
        </div>
      </template>
    </Tabs>
    <output
      data-testid="tabs-selection"
      aria-live="polite"
      >{{ t('Current:', '当前：') }}
      {{ items.find((item) => item.value === selected)?.label }}</output
    >
    <small data-testid="tabs-events">{{ events.join(' → ') }}</small>
  </div>
</template>

<style scoped>
.tabs-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.tabs-demo__controls label {
  display: flex;
  align-items: center;
  gap: 5px;
}
.tabs-demo__panel {
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
}
.tabs-demo__tab-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.tabs-demo__tab-content--primary {
  flex-direction: column;
  gap: 4px;
}
.tabs-demo__tab-icon {
  display: grid;
  place-items: center;
  inline-size: 24px;
  block-size: 24px;
  font-size: 24px;
}
</style>
