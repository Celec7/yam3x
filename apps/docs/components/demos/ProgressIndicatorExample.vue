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
  <div class="yam3x-demo yam3x-demo__stack progress-demo">
    <label class="progress-demo__control"
      >{{ t('Progress', '进度') }} {{ value }}%
      <Slider
        v-model="value"
        :min="0"
        :max="100"
        :aria-label="t('Set progress', '设置进度')"
      />
    </label>
    <label class="progress-demo__control"
      >{{ t('Linear mode', '线性模式') }}
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
    <label class="progress-demo__control"
      >{{ t('Stop indicator size', '终点指示器尺寸') }} {{ stopSize }}px
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
    <div class="progress-demo__circular">
      <CircularProgressIndicator
        data-testid="circular-progress"
        :aria-label="t('Completed tasks', '已完成任务')"
        :value="value"
        :variant="wavy ? 'wavy' : 'flat'"
      />
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
  </div>
</template>

<style scoped>
.progress-demo__control {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
}
.progress-demo__control input[type='range'] {
  grid-column: 1 / -1;
}
.progress-demo__circular {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 24px;
}
</style>
