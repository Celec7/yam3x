<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import {
  TimeInput,
  TimePicker,
  TimePickerDialog,
  type TimeValue,
} from '@registry/components/time-picker'
import { useDemoLocale } from './use-demo-locale'

const { locale, messages: text } = useDemoLocale({
  en: {
    notSubmitted: 'Not submitted',
    unselected: 'No time selected',
    format: 'Time format',
    followLocale: 'Follow locale',
    twelveHour: '12-hour',
    twentyFourHour: '24-hour',
    presentation: 'Presentation',
    modal: 'Modal dialog',
    docked: 'Docked panel',
    variant: 'Dialog style',
    standard: 'Standard',
    vibrant: 'Vibrant',
    showSeconds: 'Show seconds',
    label: 'Reminder time',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    enterInput: 'Enter time manually',
    useDial: 'Use clock dial',
    dial: 'Select time',
    input: 'Edit time',
    cancel: 'Cancel',
    confirm: 'OK',
    current: 'Current value:',
    lastSubmitted: 'Last submitted:',
    hint: 'Drag the clock hands to adjust the time, or switch to keyboard input. Narrow screens use input mode automatically.',
    composed: 'Composable controls',
    composedHint: 'The dial and text input below share the same v-model value.',
  },
  zh: {
    notSubmitted: '尚未提交',
    unselected: '未选择',
    format: '时制',
    followLocale: '跟随语言',
    twelveHour: '12 小时',
    twentyFourHour: '24 小时',
    presentation: '呈现',
    modal: '模态对话框',
    docked: '停靠面板',
    variant: '对话框样式',
    standard: '标准',
    vibrant: 'Vibrant',
    showSeconds: '显示秒',
    label: '提醒时间',
    hour: '小时',
    minute: '分钟',
    second: '秒',
    enterInput: '手动输入时间',
    useDial: '使用时钟表盘',
    dial: '选择时间',
    input: '编辑时间',
    cancel: '取消',
    confirm: '确定',
    current: '当前值：',
    lastSubmitted: '最近提交：',
    hint: '拖动表盘指针调整时间，也可切换键盘输入。窄屏会自动使用输入模式。',
    composed: '可组合控件',
    composedHint: '下方表盘与文本输入共享同一个 v-model 值。',
  },
})

const value = ref<TimeValue>({ hour: 18, minute: 0 })
const composedValue = ref<TimeValue>({ hour: 8, minute: 30 })
const format = ref<'12' | '24' | 'auto'>('auto')
const presentation = ref<'modal' | 'docked'>('modal')
const variant = ref<'standard' | 'vibrant'>('standard')
const showSeconds = ref(false)
const output = ref('')
const minTime = { hour: 8, minute: 0 }
const maxTime = { hour: 20, minute: 0 }
function formatTime(value: TimeValue, includeSeconds = showSeconds.value): string {
  const date = new Date(2026, 0, 1, value.hour, value.minute, value.second ?? 0)
  return date.toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
  })
}
function record(value: TimeValue | null): void {
  output.value = value ? formatTime(value) : text.value.unselected
}
function formatDialValue({
  value,
  unit,
  max,
}: {
  value: number
  unit: 'hour' | 'minute' | 'second'
  max: number
}): string {
  const formattedValue =
    value === 0 || unit !== 'hour' ? String(value).padStart(2, '0') : String(value)
  if (locale.value === 'zh') {
    const unitLabel =
      unit === 'hour' ? text.value.hour : unit === 'minute' ? text.value.minute : text.value.second
    return `${formattedValue} ${unitLabel}，共 ${max} ${unitLabel}`
  }
  const unitLabel = unit === 'hour' ? 'hour' : unit === 'minute' ? 'minute' : 'second'
  return `${formattedValue} ${unitLabel}${value === 1 ? '' : 's'} of ${max}`
}
</script>

<template>
  <section class="time-picker-example">
    <div class="time-picker-example__controls">
      <label
        >{{ text.format }}
        <Select v-model="format"
          ><Option
            value="auto"
            :label="text.followLocale" /><Option
            value="12"
            :label="text.twelveHour" /><Option
            value="24"
            :label="text.twentyFourHour" /></Select
      ></label>
      <label
        >{{ text.presentation }}
        <Select v-model="presentation"
          ><Option
            value="modal"
            :label="text.modal" /><Option
            value="docked"
            :label="text.docked" /></Select
      ></label>
      <label
        >{{ text.variant }}
        <Select v-model="variant"
          ><Option
            value="standard"
            :label="text.standard" /><Option
            value="vibrant"
            :label="text.vibrant" /></Select
      ></label>
      <Checkbox
        v-model="showSeconds"
        :label="text.showSeconds"
      />
    </div>
    <TimePickerDialog
      v-model="value"
      :format="format"
      :presentation="presentation"
      :variant="variant"
      :show-seconds="showSeconds"
      :locale="locale"
      :label="text.label"
      :hour-label="text.hour"
      :minute-label="text.minute"
      :second-label="text.second"
      :mode-toggle-label="text.enterInput"
      :use-dial-label="text.useDial"
      :dial-value-label="formatDialValue"
      :dial-label="text.dial"
      :input-label="text.input"
      :cancel-label="text.cancel"
      :confirm-label="text.confirm"
      :min-time="minTime"
      :max-time="maxTime"
      @change="record"
    />
    <p aria-live="polite">
      {{ text.current }}
      {{ value ? formatTime(value) : text.unselected }}
      · {{ text.lastSubmitted }} {{ output || text.notSubmitted }}
    </p>
    <p class="time-picker-example__hint">{{ text.hint }}</p>
    <details class="time-picker-example__composition">
      <summary>{{ text.composed }}</summary>
      <p>{{ text.composedHint }}</p>
      <div class="time-picker-example__controls-row">
        <TimePicker
          v-model="composedValue"
          :format="format"
          :locale="locale"
          :hour-label="text.hour"
          :minute-label="text.minute"
          :dial-value-label="formatDialValue"
          :min-time="minTime"
          :max-time="maxTime"
        />
        <TimeInput
          v-model="composedValue"
          :format="format"
          :locale="locale"
          :hour-label="text.hour"
          :minute-label="text.minute"
          :min-time="minTime"
          :max-time="maxTime"
        />
      </div>
      <p>{{ text.current }} {{ formatTime(composedValue) }}</p>
    </details>
  </section>
</template>

<style scoped>
.time-picker-example {
  display: grid;
  justify-items: start;
  gap: 20px;
  min-height: 500px;
  padding: 20px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  background: var(--md-sys-color-surface);
}
.time-picker-example__controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.time-picker-example__controls label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.time-picker-example p {
  margin: 0;
  color: var(--vp-c-text-2);
}
.time-picker-example__composition {
  display: grid;
  gap: 12px;
  width: 100%;
  padding-block-start: 20px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}
.time-picker-example__composition summary {
  cursor: pointer;
  font-weight: 600;
}
.time-picker-example__controls-row {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.time-picker-example__hint {
  max-width: 64ch;
  font-size: 14px;
}
</style>
