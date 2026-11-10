<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Slider } from '@registry/components/slider'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from '@registry/components/progress-indicator'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const value = ref(42)
const stopSize = ref(4)
const mode = ref<'determinate' | 'indeterminate' | 'buffer' | 'query'>('determinate')
const wavy = ref(false)
const circularIndeterminate = ref(false)
</script>

<template>
  <div class="yam3x-demo progress-demo">
    <section class="progress-demo__controls">
      <label class="progress-demo__control">
        <span>{{ t('Progress', '进度') }}: {{ value }}%</span>
        <Slider
          v-model="value"
          :min="0"
          :max="100"
          :aria-label="t('Set progress', '设置进度')"
        />
      </label>
      <label class="progress-demo__control">
        <span>{{ t('Linear mode', '线性模式') }}</span>
        <Select
          v-model="mode"
          :aria-label="t('Linear mode', '线性模式')"
        >
          <Option
            value="determinate"
            :label="t('Determinate', '确定进度')"
          />
          <Option
            value="indeterminate"
            :label="t('Indeterminate', '不确定进度')"
          />
          <Option
            value="buffer"
            :label="t('Buffer', '缓冲进度')"
          />
          <Option
            value="query"
            :label="t('Query', '查询')"
          />
        </Select>
      </label>
      <label class="progress-demo__control">
        <span>{{ t('Stop indicator size', '终点指示器尺寸') }}: {{ stopSize }}px</span>
        <Slider
          v-model="stopSize"
          :min="0"
          :max="8"
          :step="1"
          :aria-label="t('Set stop indicator size', '设置终点指示器尺寸')"
        />
      </label>
      <Checkbox
        v-model="wavy"
        :label="t('Wavy style', '波浪样式')"
      />
    </section>

    <section class="progress-demo__linear">
      <h4>{{ t('Linear indicator', '线性指示器') }}</h4>
      <LinearProgressIndicator
        data-testid="linear-progress"
        :aria-label="t('File upload', '文件上传')"
        :value="value"
        :buffer-value="76"
        :mode="mode"
        :variant="wavy ? 'wavy' : 'flat'"
        :stop-size="stopSize"
        :style="
          stopSize === 0
            ? { '--yam3x-progress-indicator-track-color': 'var(--md-sys-color-on-surface)' }
            : undefined
        "
      />
      <p class="progress-demo__note">
        {{
          t(
            'The value, mode, buffer, and stop size are all reflected in the bar and its progressbar attributes.',
            '数值、模式、缓冲和终点尺寸都会反映在进度条及其 progressbar 属性中。',
          )
        }}
      </p>
    </section>

    <section class="progress-demo__circular">
      <div class="progress-demo__circular-row">
        <CircularProgressIndicator
          data-testid="circular-progress"
          :aria-label="t('Completed tasks', '已完成任务')"
          :value="value"
          :variant="wavy ? 'wavy' : 'flat'"
        />
        <span>{{ t('Determinate · follows the slider', '确定进度 · 跟随滑块') }}</span>
      </div>
      <div class="progress-demo__circular-row">
        <CircularProgressIndicator
          :aria-label="t('Refresh', '刷新')"
          :indeterminate="circularIndeterminate"
          :variant="wavy ? 'wavy' : 'flat'"
        />
        <Checkbox
          v-model="circularIndeterminate"
          :label="t('Circular indeterminate progress', '圆形不确定进度')"
        />
      </div>
      <p class="progress-demo__note">
        {{
          t(
            'Reduced motion keeps both shapes visible but stops their continuous animation.',
            '启用减少动态效果时，两种形状仍然可见，但会停止连续动画。',
          )
        }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.progress-demo {
  display: grid;
  gap: 28px;
}
.progress-demo__controls {
  display: grid;
  gap: 16px;
  max-inline-size: 32rem;
}
.progress-demo__control {
  display: grid;
  gap: 8px;
}
.progress-demo__linear h4,
.progress-demo__circular h4 {
  margin: 0;
}
.progress-demo__linear {
  display: grid;
  gap: 12px;
}
.progress-demo__circular {
  display: grid;
  gap: 16px;
}
.progress-demo__circular-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.progress-demo__note {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
