<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { DateInput } from '@registry/components/date-input'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, messages: text } = useDemoLocale({
  en: {
    appointment: 'Event date',
    dateHint: 'Choose a date; each segment accepts keyboard entry.',
    submitDate: 'Submit date',
    resetDate: 'Reset date',
    notSubmitted: 'Not submitted',
    unselected: 'No value selected',
    noEvents: 'No events',
    cancelNextInput: 'Cancel next input event',
    submittedValue: 'Submitted form value',
    currentValue: 'Current date',
    eventLog: 'Recent events',
  },
  zh: {
    appointment: '活动日期',
    dateHint: '选择日期；每个片段都支持键盘输入。',
    submitDate: '提交日期',
    resetDate: '重置日期',
    notSubmitted: '尚未提交',
    unselected: '未选择',
    noEvents: '无事件',
    cancelNextInput: '取消下一次输入事件',
    submittedValue: '提交的表单值',
    currentValue: '当前日期',
    eventLog: '最近事件',
  },
})

const date = ref<Date | null>(null)
const submitted = ref('')
const events = ref<string[]>([])
const cancelNextBeforeInput = ref(false)

function toIsoDate(value: Date | null): string {
  if (!value) return text.value.unselected
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`
}

function record(name: string, detail?: string) {
  events.value.push(detail ? `${name}:${detail}` : name)
  if (events.value.length > 12) events.value.shift()
}

function onBeforeInput(event: InputEvent) {
  record('beforeinput', String(event.cancelable))
  if (cancelNextBeforeInput.value) {
    event.preventDefault()
    cancelNextBeforeInput.value = false
  }
}

function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  submitted.value = String(new FormData(form).get('appointment') || text.value.unselected)
}
</script>

<template>
  <section
    class="date-input-basic"
    data-testid="date-input-basic"
  >
    <form
      @submit.prevent="submit"
      @reset="submitted = ''"
    >
      <DateInput
        v-model="date"
        :label="text.appointment"
        :hint="text.dateHint"
        name="appointment"
        :locale="localeTag"
        required
        @beforeinput="onBeforeInput"
        @input="record('input')"
        @change="record('change')"
        @invalid="(event) => record('invalid', event.validity)"
      />
      <div class="date-input-basic__actions">
        <Button type="submit">{{ text.submitDate }}</Button>
        <Button type="reset">{{ text.resetDate }}</Button>
        <Button
          type="button"
          @click="cancelNextBeforeInput = true"
          >{{ text.cancelNextInput }}</Button
        >
      </div>
    </form>
    <dl class="date-input-basic__outputs">
      <dt>{{ text.currentValue }}</dt>
      <dd data-testid="date-input-date-value">{{ toIsoDate(date) }}</dd>
      <dt>{{ text.submittedValue }}</dt>
      <dd data-testid="date-input-submitted">{{ submitted || text.notSubmitted }}</dd>
      <dt>{{ text.eventLog }}</dt>
      <dd data-testid="date-input-events">{{ events.join('|') || text.noEvents }}</dd>
    </dl>
  </section>
</template>

<style scoped>
.date-input-basic {
  display: grid;
  gap: 20px;
  justify-items: start;
}
.date-input-basic form {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.date-input-basic__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.date-input-basic__outputs {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 16px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.date-input-basic__outputs dt {
  font-weight: 600;
}
.date-input-basic__outputs dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
</style>
