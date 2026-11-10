<script setup lang="ts">
import { computed, ref } from 'vue'
import { DateInput } from '@registry/components/date-input'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, messages: text } = useDemoLocale({
  en: {
    time: '12-hour time',
    startTime: 'Start time',
    startTimeHint: 'Hour, minute, and AM/PM segments follow the locale.',
    dateTime: 'Date and time',
    reminderTime: 'Reminder time',
    reminderHint: 'A 24-hour value with optional seconds.',
    limitedDate: 'Date with limits',
    limitedDateHint: 'Only October 10–20, 2026 is available; the 15th is blacked out.',
    limitedTime: 'Time with limits',
    limitedTimeHint: 'Only 09:00–17:00 is available; minute 45 is blacked out.',
    currentValue: 'Current value',
    unselected: 'No value selected',
    selectedDate: 'Selected date',
    selectedTime: 'Selected time',
    selectedDateTime: 'Selected date and time',
  },
  zh: {
    time: '12 小时时间',
    startTime: '开始时间',
    startTimeHint: '小时、分钟和上午/下午片段跟随语言区域。',
    dateTime: '日期与时间',
    reminderTime: '提醒时间',
    reminderHint: '使用 24 小时值，并显示可选的秒。',
    limitedDate: '受限日期',
    limitedDateHint: '仅可选择 2026 年 10 月 10–20 日；15 日被排除。',
    limitedTime: '受限时间',
    limitedTimeHint: '仅可选择 09:00–17:00；第 45 分钟被排除。',
    currentValue: '当前值',
    unselected: '未选择',
    selectedDate: '已选日期',
    selectedTime: '已选时间',
    selectedDateTime: '已选日期与时间',
  },
})

const time = ref<Date | null>(new Date(2026, 9, 5, 11, 15))
const dateTime = ref<Date | null>(new Date(2026, 9, 5, 13, 45, 30))
const limitedDate = ref<Date | null>(null)
const limitedTime = ref<Date | null>(new Date(2026, 9, 5, 9, 30))

const minDate = new Date(2026, 9, 10)
const maxDate = new Date(2026, 9, 20)
const blackoutDates = (date: Date) => date.getDate() === 15
const blackoutTimes = (value: { hour: number; minute: number }) => value.minute === 45

const dateFormat = computed(
  () =>
    new Intl.DateTimeFormat(localeTag.value, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }),
)
const timeFormat = computed(
  () =>
    new Intl.DateTimeFormat(localeTag.value, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }),
)
const dateTimeFormat = computed(
  () =>
    new Intl.DateTimeFormat(localeTag.value, {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }),
)

function asUtcDate(value: Date | null): Date | null {
  if (!value) return null
  return new Date(
    Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      value.getHours(),
      value.getMinutes(),
      value.getSeconds(),
    ),
  )
}

const timeText = computed(() =>
  time.value ? timeFormat.value.format(asUtcDate(time.value)!) : text.value.unselected,
)
const dateTimeText = computed(() =>
  dateTime.value ? dateTimeFormat.value.format(asUtcDate(dateTime.value)!) : text.value.unselected,
)
const limitedDateText = computed(() =>
  limitedDate.value
    ? dateFormat.value.format(asUtcDate(limitedDate.value)!)
    : text.value.unselected,
)
const limitedTimeText = computed(() =>
  limitedTime.value
    ? timeFormat.value.format(asUtcDate(limitedTime.value)!)
    : text.value.unselected,
)
</script>

<template>
  <div
    class="date-input-modes"
    data-testid="date-input-modes"
  >
    <section class="date-input-modes__item">
      <h4>{{ text.time }}</h4>
      <DateInput
        v-model="time"
        type="time"
        time-format="12"
        :label="text.startTime"
        :hint="text.startTimeHint"
        :locale="localeTag"
      />
      <output data-testid="date-input-time-value">{{
        time ? `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}` : text.unselected
      }}</output>
      <p class="date-input-modes__formatted">{{ timeText }}</p>
    </section>

    <section class="date-input-modes__item">
      <h4>{{ text.dateTime }}</h4>
      <DateInput
        v-model="dateTime"
        type="datetime"
        :show-seconds="true"
        time-format="24"
        :label="text.reminderTime"
        :hint="text.reminderHint"
        :locale="localeTag"
      />
      <output data-testid="date-input-datetime-value">{{
        dateTime?.toISOString() || text.unselected
      }}</output>
      <p class="date-input-modes__formatted">{{ dateTimeText }}</p>
    </section>

    <section class="date-input-modes__item">
      <h4>{{ text.limitedDate }}</h4>
      <DateInput
        v-model="limitedDate"
        :label="text.limitedDate"
        :hint="text.limitedDateHint"
        :locale="localeTag"
        :min-date="minDate"
        :max-date="maxDate"
        :blackout-dates="blackoutDates"
      />
      <output data-testid="date-input-limited-value">{{
        limitedDate?.toISOString() || text.unselected
      }}</output>
      <p class="date-input-modes__formatted">{{ limitedDateText }}</p>
    </section>

    <section class="date-input-modes__item">
      <h4>{{ text.limitedTime }}</h4>
      <DateInput
        v-model="limitedTime"
        type="time"
        time-format="24"
        :label="text.limitedTime"
        :hint="text.limitedTimeHint"
        :locale="localeTag"
        min-time="09:00"
        max-time="17:00"
        :blackout-times="blackoutTimes"
      />
      <output data-testid="date-input-limited-time-value">{{
        limitedTime
          ? `${String(limitedTime.getHours()).padStart(2, '0')}:${String(
              limitedTime.getMinutes(),
            ).padStart(2, '0')}`
          : text.unselected
      }}</output>
      <p class="date-input-modes__formatted">{{ limitedTimeText }}</p>
    </section>
  </div>
</template>

<style scoped>
.date-input-modes {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: start;
}
.date-input-modes__item {
  display: grid;
  justify-items: start;
  gap: 10px;
}
.date-input-modes__item h4 {
  margin: 0;
  font-size: 15px;
}
.date-input-modes__item output {
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.date-input-modes__formatted {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
