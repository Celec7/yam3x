<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Slider } from '@registry/components/slider'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { SplitPane, type SplitPaneOrientation } from '@registry/components/split-pane'
import { useDemoDirection } from './use-demo-direction'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const { dir, direction, toggle: toggleDirection } = useDemoDirection()

const value = ref(66)
const min = ref(20)
const max = ref(80)
const orientation = ref<SplitPaneOrientation>('auto')
const compactPane = ref<'primary' | 'supporting'>('primary')
const disabled = ref(false)
const showMain = ref(true)
const showSupporting = ref(true)
const changes = ref(0)
const splitPane = ref<InstanceType<typeof SplitPane> | null>(null)
const valueLabel = computed(() => `${Math.round(value.value)}% / ${100 - Math.round(value.value)}%`)
const valueText = computed(() =>
  t(
    `Main content ${Math.round(value.value)} percent, supporting content ${100 - Math.round(value.value)} percent`,
    `主要内容占 ${Math.round(value.value)}%，辅助内容占 ${100 - Math.round(value.value)}%`,
  ),
)
const rightToLeft = computed({
  get: () => direction.value === 'rtl',
  set: (checked: boolean) => {
    if (checked !== (direction.value === 'rtl')) toggleDirection()
  },
})
</script>

<template>
  <div
    class="yam3x-demo split-pane-demo"
    :dir="dir"
  >
    <div class="split-pane-demo__controls">
      <label>
        {{ t('Orientation', '方向') }}
        <Select
          v-model="orientation"
          :aria-label="t('Split pane orientation', '分栏方向')"
        >
          <Option
            value="auto"
            :label="t('Auto', '自动')"
          />
          <Option
            value="horizontal"
            :label="t('Side by side', '左右')"
          />
          <Option
            value="vertical"
            :label="t('Stacked', '上下')"
          />
        </Select>
      </label>
      <label class="split-pane-demo__slider">
        <span
          >{{ t('Start pane', '起始窗格') }}: <output>{{ valueLabel }}</output></span
        >
        <Slider
          v-model="value"
          :min="0"
          :max="100"
          :aria-label="t('Start pane ratio', '起始窗格比例')"
        />
      </label>
      <Checkbox
        v-model="rightToLeft"
        :label="t('RTL', '从右到左 (RTL)')"
      />
      <Checkbox
        v-model="disabled"
        :label="t('Disable dragging', '禁用拖动')"
      />
      <Checkbox
        v-model="showMain"
        :label="t('Show main pane', '显示主窗格')"
      />
      <Checkbox
        v-model="showSupporting"
        :label="t('Show supporting pane', '显示辅助窗格')"
      />
      <Button
        type="button"
        @click="compactPane = 'primary'"
        >{{ t('Show primary (compact)', '紧凑时显示主要内容') }}</Button
      >
      <Button
        type="button"
        @click="compactPane = 'supporting'"
        >{{ t('Show supporting (compact)', '紧凑时显示辅助内容') }}</Button
      >
      <Button
        type="button"
        @click="splitPane?.collapse()"
        >{{ t('Collapse main pane', '收起主窗格') }}</Button
      >
      <Button
        type="button"
        @click="splitPane?.expand()"
        >{{ t('Expand main pane', '展开主窗格') }}</Button
      >
    </div>

    <div class="split-pane-demo__surface">
      <SplitPane
        ref="splitPane"
        v-model="value"
        v-model:compact-pane="compactPane"
        :min="min"
        :max="max"
        :step="1"
        :detents="[25, 50, 66, 75]"
        :orientation="orientation"
        :label="t('Main content', '主要内容')"
        :value-text="valueText"
        :disabled="disabled"
        @change="changes++"
      >
        <template
          v-if="showMain"
          #start
        >
          <article class="split-pane-demo__pane split-pane-demo__pane--main">
            <h3>{{ t('Main content', '主要内容') }}</h3>
            <p>
              {{
                t(
                  'The main region handles the page’s primary task. Drag the divider, or focus it and use the arrow keys.',
                  '主区域承载页面的主要任务。拖动分隔器，或将焦点移到分隔器后使用方向键。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'Below 600px, auto mode shows one pane at a time; use the compact buttons to switch. From 600px to 839px both panes stack, and at 840px or wider they sit side by side.',
                  '小于 600px 时，auto 模式一次显示一个窗格；可用紧凑按钮切换。600px 到 839px 时两个窗格上下排列，840px 及以上并排显示。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'Each pane scrolls independently, so the supporting region keeps its own position.',
                  '每个窗格独立滚动，辅助区域会保留自己的滚动位置。',
                )
              }}
            </p>
          </article>
        </template>
        <template
          v-if="showSupporting"
          #end
        >
          <aside class="split-pane-demo__pane split-pane-demo__pane--supporting">
            <h3>{{ t('Supporting content', '辅助内容') }}</h3>
            <p>
              {{
                t(
                  'Keep courses, comments, properties, or tools related to the current main content here.',
                  '这里放置与当前主内容相关的课程、评论、属性或工具。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'Material recommends a supporting pane as a secondary region, with the main content taking about two-thirds of the space.',
                  'Material 建议将辅助窗格作为次要区域，主内容通常占约三分之二。',
                )
              }}
            </p>
          </aside>
        </template>
      </SplitPane>
    </div>
    <output
      data-testid="split-pane-result"
      class="split-pane-demo__result"
      >{{ t('Current ratio:', '当前比例：') }} {{ valueLabel
      }}{{ t(' · changes: ', ' · 变更次数：') }}{{ changes }}</output
    >
  </div>
</template>

<style scoped>
.split-pane-demo {
  display: grid;
  gap: 16px;
}
.split-pane-demo__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.split-pane-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.split-pane-demo__slider {
  flex-wrap: wrap;
}
.split-pane-demo__slider :deep(.yam3x-slider) {
  inline-size: 140px;
}
.split-pane-demo__surface {
  inline-size: 100%;
  block-size: 480px;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  background: var(--md-sys-color-surface);
}
.split-pane-demo__pane {
  min-block-size: 100%;
  box-sizing: border-box;
  padding: 24px;
}
.split-pane-demo__pane--main {
  background: var(--md-sys-color-surface-container-low);
}
.split-pane-demo__pane--supporting {
  background: var(--md-sys-color-surface-container);
}
.split-pane-demo__pane h3 {
  margin-block: 0 12px;
}
.split-pane-demo__pane p {
  max-inline-size: 60ch;
}
.split-pane-demo__result {
  color: var(--md-sys-color-on-surface-variant);
}
</style>
