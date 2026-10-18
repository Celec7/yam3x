<script setup lang="ts">
import { ref } from 'vue'
import { useDemoLocale } from './use-demo-locale'
import { LocaleProvider } from '@registry/components/localization'
import { Autocomplete } from '@registry/components/autocomplete'
import { Select } from '@registry/components/select'
import { DatePicker, DateRangePicker, type DateRangeValue } from '@registry/components/date-picker'
import { TimePickerDialog, type TimeValue } from '@registry/components/time-picker'
import { DateInput } from '@registry/components/date-input'
import { Calendar } from '@registry/components/calendar'
import { NumberField } from '@registry/components/number-field'
import { Pagination } from '@registry/components/pagination'
import { TreeView } from '@registry/components/tree-view'
import { FileUpload } from '@registry/components/file-upload'
import { DataTable } from '@registry/components/data-table'
import { Form } from '@registry/components/form'
import { FormField } from '@registry/components/form-field'
import { Button } from '@registry/components/button'
const { locale: demoLocale } = useDemoLocale()
const locale = ref(demoLocale.value === 'zh' ? 'zh-CN' : 'en-US')
const page = ref(2)
const date = ref<string | null>('2026-10-05')
const fruitQuery = ref('Ap')
const fruit = ref<string | null>(null)
const pickerDate = ref<string | null>('2026-10-04')
const pickerRange = ref<DateRangeValue>({ start: null, end: null })
const pickerTime = ref<TimeValue>({ hour: 13, minute: 7 })
const inputDate = ref<Date | null>(null)
const quantity = ref<number | null>(2.5)
</script>

<template>
  <div class="localization-demo">
    <div class="localization-demo__actions">
      <Button @click="locale = 'en-US'">English</Button>
      <Button @click="locale = 'zh-CN'">简体中文</Button>
    </div>
    <LocaleProvider :locale="locale">
      <section data-testid="locale-inherited">
        <Pagination
          v-model:page="page"
          :total="200"
        />
        <NumberField
          v-model="quantity"
          label="Quantity / 数量"
          :min="0"
          :max="10"
          :step="0.1"
          data-testid="locale-number"
        />
        <Autocomplete
          v-model="fruitQuery"
          v-model:selected="fruit"
          label="Fruit / 水果"
          :options="[
            { value: 'apple', label: 'Apple' },
            { value: 'apricot', label: 'Apricot' },
          ]"
          data-testid="locale-autocomplete"
        />
        <output data-testid="locale-fruit-value">{{ fruit }}</output>
        <div data-testid="locale-empty-select">
          <Select aria-label="Empty choice / 空选项" />
        </div>
        <DatePicker
          v-model="pickerDate"
          mode="modal"
          data-testid="locale-date-picker"
        />
        <output data-testid="locale-picker-date-value">{{ pickerDate }}</output>
        <DateRangePicker
          v-model="pickerRange"
          mode="modal"
          data-testid="locale-range-picker"
        />
        <output data-testid="locale-picker-range-value"
          >{{ pickerRange.start }} / {{ pickerRange.end }}</output
        >
        <TimePickerDialog
          v-model="pickerTime"
          mode="input"
          data-testid="locale-time-picker"
        />
        <output data-testid="locale-time-value"
          >{{ pickerTime.hour }}:{{ pickerTime.minute }}</output
        >
        <DateInput
          v-model="inputDate"
          data-testid="locale-date-input"
        />
        <Calendar
          v-model="date"
          data-testid="locale-calendar"
        />
        <TreeView
          label="Records / 记录"
          :nodes="[]"
        />
        <FileUpload label="Attachments / 附件" />
        <DataTable
          caption="Projects / 项目"
          :rows="[]"
          :columns="[]"
          :row-key="() => 0"
        />
        <Form
          v-slot="{ fieldErrors }"
          :submit="() => undefined"
        >
          <FormField
            label="Title / 标题"
            :error="fieldErrors.title"
            width="100%"
          >
            <input
              name="title"
              required
            />
          </FormField>
          <Button type="submit">Submit / 提交</Button>
        </Form>
      </section>
      <LocaleProvider
        locale="en-US"
        :messages="{ pagination: { next: 'Continue' } }"
      >
        <section data-testid="locale-nested">
          <Pagination :total="100" />
        </section>
      </LocaleProvider>
    </LocaleProvider>
    <output data-testid="locale-page">{{ page }}</output>
  </div>
</template>

<style scoped>
.localization-demo,
.localization-demo section {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.localization-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
