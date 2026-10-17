<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { DateInput } from '@registry/components/date-input'
import { useDemoLocale } from './use-demo-locale'

const { locale, messages: text } = useDemoLocale({
  en: {
    date: 'Date',
    appointment: 'Event date',
    submitDate: 'Submit date',
    resetDate: 'Reset date',
    notSubmitted: 'Not submitted',
    unselected: 'No value selected',
    noEvents: 'No events',
    cancelNextInput: 'Cancel next input event',
    twelveHourTime: '12-hour time',
    startTime: 'Start time',
    dateTime: 'Date and time',
    reminderTime: 'Reminder time',
    disabled: 'Disabled state',
    disabledInput: 'Disabled input',
    limitedDate: 'Date with limits',
    limitedTime: 'Time with limits',
    rtlDate: 'Right-to-left date',
    readOnly: 'Read-only state',
    readOnlyInput: 'Read-only input',
    emptyValue: 'Empty value',
  },
  zh: {
    date: '日期',
    appointment: '活动日期',
    submitDate: '提交日期',
    resetDate: '重置日期',
    notSubmitted: '尚未提交',
    unselected: '未选择',
    noEvents: '无事件',
    cancelNextInput: '取消下一次输入事件',
    twelveHourTime: '12 小时时间',
    startTime: '开始时间',
    dateTime: '日期与时间',
    reminderTime: '提醒时间',
    disabled: '禁用状态',
    disabledInput: '禁用输入',
    limitedDate: '受限日期',
    limitedTime: '受限时间',
    rtlDate: '从右向左的日期',
    readOnly: '只读状态',
    readOnlyInput: '只读输入',
    emptyValue: '空值',
  },
})

const date = ref<Date | null>(null)
const time = ref<Date | null>(new Date(2026, 9, 5, 11, 15))
const dateTime = ref<Date | null>(new Date(2026, 9, 5, 13, 45, 30))
const submitted = ref('')
const limitedDate = ref<Date | null>(null)
const limitedTime = ref<Date | null>(new Date(2026, 9, 5, 9, 30))
const dateInputEvents = ref<string[]>([])
const cancelNextBeforeInput = ref(false)
const selectableDate = (date: Date) => date.getDate() !== 15
const selectableTime = (time: { hour: number; minute: number; second?: number }) =>
  time.minute !== 45

function recordDateInputEvent(name: string, detail?: string) {
  dateInputEvents.value.push(detail ? `${name}:${detail}` : name)
  if (dateInputEvents.value.length > 12) dateInputEvents.value.shift()
}

function onDateBeforeInput(event: InputEvent) {
  recordDateInputEvent('beforeinput', String(event.cancelable))
  if (cancelNextBeforeInput.value) {
    event.preventDefault()
    cancelNextBeforeInput.value = false
  }
}

function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  submitted.value = String(new FormData(form).get('appointment') || text.value.emptyValue)
}
</script>

<template>
  <div class="date-input-demo">
    <section class="date-input-demo__section">
      <h3>{{ text.date }}</h3>
      <form
        @submit.prevent="submit"
        @reset="submitted = ''"
      >
        <DateInput
          v-model="date"
          :label="text.appointment"
          name="appointment"
          :locale="locale"
          required
          @beforeinput="onDateBeforeInput"
          @input="recordDateInputEvent('input')"
          @change="recordDateInputEvent('change')"
          @invalid="(event) => recordDateInputEvent('invalid', event.validity)"
        />
        <Button type="submit">{{ text.submitDate }}</Button>
        <Button type="reset">{{ text.resetDate }}</Button>
      </form>
      <output data-testid="date-input-submitted">{{ submitted || text.notSubmitted }}</output>
      <output data-testid="date-input-date-value">{{
        date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          : text.unselected
      }}</output>
      <output data-testid="date-input-events">{{
        dateInputEvents.join('|') || text.noEvents
      }}</output>
      <Button
        type="button"
        @click="cancelNextBeforeInput = true"
        >{{ text.cancelNextInput }}</Button
      >
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.twelveHourTime }}</h3>
      <DateInput
        v-model="time"
        type="time"
        time-format="12"
        :label="text.startTime"
        locale="en-US"
      />
      <output data-testid="date-input-time-value">{{
        time ? `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}` : text.unselected
      }}</output>
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.dateTime }}</h3>
      <DateInput
        v-model="dateTime"
        type="datetime"
        :show-seconds="true"
        time-format="24"
        :label="text.reminderTime"
        locale="en-GB"
      />
      <output data-testid="date-input-datetime-value">{{
        dateTime?.toISOString() || text.unselected
      }}</output>
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.disabled }}</h3>
      <DateInput
        :value="time"
        :label="text.disabledInput"
        disabled
        :locale="locale"
      />
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.limitedDate }}</h3>
      <DateInput
        v-model="limitedDate"
        :label="text.limitedDate"
        :locale="locale"
        :min-date="new Date(2026, 9, 10)"
        :max-date="new Date(2026, 9, 20)"
        :is-date-selectable="selectableDate"
      />
      <output data-testid="date-input-limited-value">{{
        limitedDate?.toISOString() || text.unselected
      }}</output>
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.limitedTime }}</h3>
      <DateInput
        v-model="limitedTime"
        type="time"
        time-format="24"
        :label="text.limitedTime"
        locale="en-GB"
        min-time="09:00"
        max-time="17:00"
        :is-time-selectable="selectableTime"
      />
      <output data-testid="date-input-limited-time-value">{{
        limitedTime
          ? `${String(limitedTime.getHours()).padStart(2, '0')}:${String(limitedTime.getMinutes()).padStart(2, '0')}`
          : text.unselected
      }}</output>
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.rtlDate }}</h3>
      <DateInput
        :value="new Date(2026, 9, 5)"
        :label="text.rtlDate"
        locale="he-IL"
      />
    </section>
    <section class="date-input-demo__section">
      <h3>{{ text.readOnly }}</h3>
      <DateInput
        :value="dateTime"
        :label="text.readOnlyInput"
        readonly
        :locale="locale"
      />
    </section>
  </div>
</template>

<style scoped>
.date-input-demo {
  display: grid;
  gap: 24px;
}
.date-input-demo__section {
  display: grid;
  justify-items: start;
  gap: 12px;
}
.date-input-demo__section h3 {
  margin: 0;
  font-size: 16px;
}
.date-input-demo__section form {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 12px;
}
.date-input-demo__section output {
  font-size: 14px;
  color: var(--vp-c-text-2);
}
</style>
