<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox, TriStateCheckbox } from '@registry/components/checkbox'
import type { CheckboxState } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const topics = computed(() => [
  { value: 'design', label: t('Design', '设计') },
  { value: 'research', label: t('Research', '研究') },
  { value: 'analytics', label: t('Analytics', '分析') },
  { value: 'billing', label: t('Billing', '账单') },
])

const initial = ['design', 'research']
const selectable = computed(() => topics.value.filter((topic) => topic.value !== 'billing'))
const selected = ref<string[]>([...initial])
const submitted = ref<string[]>([])

const allState = computed<CheckboxState>({
  get: () => {
    const count = selectable.value.filter((topic) => selected.value.includes(topic.value)).length
    return count === 0
      ? 'unchecked'
      : count === selectable.value.length
        ? 'checked'
        : 'indeterminate'
  },
  set: (state) => {
    selected.value = state === 'checked' ? selectable.value.map((topic) => topic.value) : []
  },
})

function isDisabled(value: string): boolean {
  return value === 'billing'
}

function onChange(value: string, checked: boolean): void {
  selected.value = checked
    ? [...new Set([...selected.value, value])]
    : selected.value.filter((item) => item !== value)
}

function submit(form: HTMLFormElement | null): void {
  submitted.value = form ? [...new FormData(form).getAll('topics')].map(String) : []
}

function resetSelection(): void {
  selected.value = [...initial]
  submitted.value = []
}
</script>

<template>
  <section
    data-testid="checkbox-group"
    class="yam3x-demo yam3x-demo__stack checkbox-group-demo"
  >
    <form
      id="checkbox-group-form"
      class="checkbox-group-demo__form"
      @submit.prevent="submit($event.currentTarget as HTMLFormElement)"
      @reset.prevent="resetSelection"
    >
      <TriStateCheckbox
        v-model="allState"
        :label="t('Select all topics', '选择所有主题')"
        :description="
          t(
            'The parent reports a partial selection until every available topic is checked',
            '在勾选所有可用主题前，父级处于部分选中状态',
          )
        "
      />
      <fieldset class="checkbox-group-demo__options">
        <legend>{{ t('Topics', '主题') }}</legend>
        <Checkbox
          v-for="topic in topics"
          :key="topic.value"
          :model-value="selected.includes(topic.value)"
          :label="topic.label"
          :value="topic.value"
          :name="isDisabled(topic.value) ? undefined : 'topics'"
          :disabled="isDisabled(topic.value)"
          :description="
            isDisabled(topic.value) ? t('Unavailable for this account', '此账户不可用') : undefined
          "
          @update:model-value="onChange(topic.value, $event)"
        />
      </fieldset>
      <div class="checkbox-group-demo__actions">
        <Button type="submit">{{ t('Submit selection', '提交选择') }}</Button>
        <Button
          type="reset"
          variant="text"
          >{{ t('Reset selection', '重置选择') }}</Button
        >
      </div>
      <output
        data-testid="checkbox-group-summary"
        aria-live="polite"
        >{{ t('Selected:', '已选择：') }}
        {{ selected.length ? selected.join(', ') : t('None', '无') }}</output
      >
      <output
        v-if="submitted.length"
        data-testid="checkbox-group-submitted"
        aria-live="polite"
        >{{ t('Submitted:', '已提交：') }} {{ submitted.join(', ') }}</output
      >
    </form>
  </section>
</template>

<style scoped>
.checkbox-group-demo__form {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.checkbox-group-demo__options {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}
.checkbox-group-demo__options legend {
  margin-block-end: 8px;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
}
.checkbox-group-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.checkbox-group-demo output {
  font: var(--md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
