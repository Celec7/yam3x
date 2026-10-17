<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Slider } from '@registry/components/slider'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { AppBar } from '@registry/components/app-bar'
import type { AppBarScrollBehavior } from '@registry/components/app-bar'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const variant = ref<'search' | 'small' | 'medium-flexible' | 'large-flexible'>('search')
const alignment = ref<'leading' | 'centered'>('leading')
const scrollBehavior = ref<'auto' | AppBarScrollBehavior>('auto')
const width = ref(960)
const rtl = ref(false)
const showSubtitle = ref(true)
const lastAction = ref('')
const stageStyle = computed(() => ({ width: `${width.value}px` }))
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack app-bar-demo">
    <div class="app-bar-demo__controls">
      <label
        >{{ t('Type', '类型') }}
        <Select
          v-model="variant"
          :aria-label="t('App bar type', '应用栏类型')"
        >
          <Option
            value="search"
            :label="t('Search', '搜索')"
          />
          <Option
            value="small"
            :label="t('Small', '小型')"
          />
          <Option
            value="medium-flexible"
            :label="t('Medium flexible', '中等灵活')"
          />
          <Option
            value="large-flexible"
            :label="t('Large flexible', '大型灵活')"
          />
        </Select>
      </label>
      <label
        >{{ t('Title alignment', '标题对齐') }}
        <Select
          v-model="alignment"
          :aria-label="t('Title alignment', '标题对齐')"
        >
          <Option
            value="leading"
            :label="t('Start', '起始边')"
          />
          <Option
            value="centered"
            :label="t('Centered', '居中')"
          />
        </Select>
      </label>
      <label
        >{{ t('Scroll behavior', '滚动行为') }}
        <Select
          v-model="scrollBehavior"
          :aria-label="t('Scroll behavior', '滚动行为')"
        >
          <Option
            value="auto"
            :label="t('Variant default', '按变体默认')"
          />
          <Option
            value="pinned"
            :label="t('Pinned', '固定显示')"
          />
          <Option
            value="enter-always"
            :label="t('Enter always', '滚动时隐藏并显现')"
          />
          <Option
            value="exit-until-collapsed"
            :label="t('Exit until collapsed', '收起后保持小型')"
          />
        </Select>
      </label>
      <label class="app-bar-demo__width"
        >{{ t('Available width', '可用宽度') }} {{ width }}px
        <Slider
          v-model="width"
          :aria-label="t('Available app bar width', '应用栏可用宽度')"
          :min="320"
          :max="1400"
          :step="10"
        />
      </label>
      <Checkbox
        v-model="showSubtitle"
        :label="t('Show subtitle', '显示副标题')"
      />
      <Checkbox
        v-model="rtl"
        :label="t('Right-to-left (RTL)', '从右到左 (RTL)')"
      />
    </div>

    <div
      class="app-bar-demo__viewport"
      role="region"
      :aria-label="t('App bar width preview', '应用栏宽度预览')"
      tabindex="0"
    >
      <div
        class="app-bar-demo__frame"
        :style="stageStyle"
        :dir="rtl ? 'rtl' : 'ltr'"
      >
        <div
          id="app-bar-demo-scroll"
          class="app-bar-demo__scroll"
          data-testid="app-bar-scroll"
        >
          <AppBar
            :variant="variant"
            :alignment="alignment"
            :scroll-behavior="scrollBehavior === 'auto' ? undefined : scrollBehavior"
            :search-label="t('Search inbox', '搜索收件箱')"
            scroll-target="#app-bar-demo-scroll"
            data-testid="app-bar"
            @search="lastAction = t('Search view opened', '搜索视图已请求打开')"
          >
            <template #leading>
              <IconButton
                variant="standard"
                :aria-label="t('Open navigation', '打开导航')"
                ><Icon name="menu"
              /></IconButton>
            </template>
            <template #title>{{ t('Inbox', '收件箱') }}</template>
            <template
              v-if="showSubtitle"
              #subtitle
              >{{ t('Recently updated', '最近更新') }}</template
            >
            <template #logo
              ><span
                class="app-bar-demo__logo"
                aria-label="YAM3X"
                >YAM3X</span
              ></template
            >
            <template #search-trailing>
              <IconButton
                variant="standard"
                :aria-label="t('Voice search', '语音搜索')"
                >♩</IconButton
              >
            </template>
            <template #trailing>
              <IconButton
                variant="standard"
                :aria-label="t('Help', '帮助')"
                @click="lastAction = t('Help', '帮助')"
                >?</IconButton
              >
              <IconButton
                variant="standard"
                :aria-label="t('Account', '账户')"
                @click="lastAction = t('Account', '账户')"
                >●</IconButton
              >
            </template>
          </AppBar>
          <div class="app-bar-demo__content">
            <p>
              {{
                t(
                  'The current page content scrolls here. Try pinned, enter-always, and exit-until-collapsed behavior.',
                  '当前页面内容在此滚动。可以切换固定显示、滚动时隐藏并显现，以及收起后保持小型。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'Set the width slider above to a desktop-sized window to see how the search field responds to the space between leading and trailing actions.',
                  '将上方宽度滑块调到桌面窗口大小，观察搜索框如何根据前置和后置操作之间的可用空间调整。',
                )
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <output aria-live="polite">{{
      lastAction ||
      t(
        'Select Search or an action button. Scroll the content to see the flexible states.',
        '点按“搜索”或操作按钮；滚动内容可查看灵活形态。',
      )
    }}</output>
  </div>
</template>

<style scoped>
.app-bar-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.app-bar-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.app-bar-demo__width :deep(.yam3x-slider) {
  width: 160px;
}
.app-bar-demo__viewport {
  width: 100%;
  overflow: auto;
  border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
}
.app-bar-demo__frame {
  box-sizing: border-box;
  overflow: hidden;
}
.app-bar-demo__scroll {
  height: 360px;
  overflow: auto;
  background: var(--md-sys-color-surface, #fef7ff);
}
.app-bar-demo__scroll > header {
  position: sticky;
  z-index: 1;
  inset-block-start: 0;
}
.app-bar-demo__logo {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 10px;
  background: var(--md-sys-color-primary-container, #eaddff);
  color: var(--md-sys-color-on-primary-container, #21005d);
  font-size: 12px;
  font-weight: 700;
}
.app-bar-demo__content {
  display: grid;
  min-height: 620px;
  align-content: start;
  gap: 16px;
  padding: 24px;
  color: var(--md-sys-color-on-surface, #1d1b20);
}
</style>
