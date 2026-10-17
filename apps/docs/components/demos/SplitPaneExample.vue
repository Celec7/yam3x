<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Slider } from '@registry/components/slider'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { SplitPane, type SplitPaneOrientation } from '@registry/components/split-pane'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const value = ref(66)
const min = ref(20)
const max = ref(80)
const orientation = ref<SplitPaneOrientation>('auto')
const compactPane = ref<'primary' | 'supporting'>('primary')
const disabled = ref(false)
const rtl = ref(false)
const showMain = ref(true)
const showSupporting = ref(true)
const changes = ref(0)
const splitPane = ref<InstanceType<typeof SplitPane> | null>(null)
const valueLabel = computed(() => `${Math.round(value.value)}% / ${100 - Math.round(value.value)}%`)
</script>

<template>
  <div
    class="yam3x-demo split-pane-demo"
    :dir="rtl ? 'rtl' : 'ltr'"
  >
    <div class="split-pane-demo__controls">
      <label
        >{{ t('Orientation', '方向') }}
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
      <label
        >{{ t('Start pane', '起始窗格') }} <output>{{ valueLabel }}</output>
        <Slider
          v-model="value"
          :min="0"
          :max="100"
          :aria-label="t('Start pane ratio', '起始窗格比例')"
        />
      </label>
      <Checkbox
        v-model="rtl"
        :label="t('Right-to-left (RTL)', '从右到左 (RTL)')"
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
        :detents="[25, 50, 66, 75]"
        :orientation="orientation"
        :label="t('Main content', '主要内容')"
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
                  'The main region of a supporting pane handles the page’s primary task. Drag the divider to adjust space; when it has keyboard focus, use the arrow keys.',
                  '辅助窗格的主区域承载页面的主要任务。拖动中间分隔器可调整两侧空间；键盘焦点位于分隔器时，也能用方向键调整。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'At compact widths, auto mode presents one pane at a time. Use the controls to switch between primary and supporting content; wider windows show both side by side.',
                  '紧凑宽度下，auto 模式一次呈现一个窗格。可使用控件切换主要内容与辅助内容；较宽窗口会并排显示两者。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'The main content scrolls independently while the supporting region keeps its own scroll position.',
                  '主内容可以独立滚动，辅助区域保持自己的滚动位置。',
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
                  'Provide courses, comments, properties, or tools related to the current main content.',
                  '提供与当前主内容相关的课程、评论、属性或工具。',
                )
              }}
            </p>
            <p>
              {{
                t(
                  'Material recommends using a supporting pane as a secondary region, with the main content taking about two-thirds of the space.',
                  'Material 建议将辅助窗格作为次要区域，主内容通常占约三分之二。',
                )
              }}
            </p>
          </aside>
        </template>
      </SplitPane>
    </div>
    <output data-testid="split-pane-result"
      >{{ t('Current ratio:', '当前比例：') }} {{ valueLabel }}；{{ t('changes:', '变更次数：') }}
      {{ changes }}</output
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
.split-pane-demo__controls :deep(.yam3x-slider) {
  width: 140px;
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
.split-pane-demo output {
  color: var(--md-sys-color-on-surface-variant);
}
</style>
