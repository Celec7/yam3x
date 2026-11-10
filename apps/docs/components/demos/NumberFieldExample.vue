<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { NumberField } from '@registry/components/number-field'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

const quantity = ref<number | null>(2)
const filled = ref(false)
const controls = ref(true)
const submitted = ref('')

function submit(event: Event): void {
  const data = new FormData(event.currentTarget as HTMLFormElement)
  submitted.value = String(data.get('quantity') ?? '')
}
</script>

<template>
  <section
    data-testid="number-field-form"
    class="number-field-demo"
  >
    <form
      class="number-field-demo__form"
      @submit.prevent="submit"
    >
      <NumberField
        v-model="quantity"
        name="quantity"
        :label="t('Quantity', '数量')"
        :locale="fieldLocale"
        :min="0"
        :max="10"
        :step="0.5"
        required
        width="100%"
        :hint="
          t('Required. Between 0 and 10; steps of 0.5.', '必填。范围为 0 至 10，每次调整 0.5。')
        "
        :variant="filled ? 'filled' : 'outlined'"
        :controls="controls"
      />
      <div class="number-field-demo__actions">
        <Button type="submit">{{ t('Submit quantity', '提交数量') }}</Button>
        <Button
          type="reset"
          variant="text"
          >{{ t('Reset quantity', '重置数量') }}</Button
        >
      </div>
      <p class="number-field-demo__result">
        {{ t('Committed value:', '已提交到模型的值：') }}
        <output data-testid="number-quantity">{{ quantity ?? '—' }}</output>
      </p>
      <p
        v-if="submitted"
        class="number-field-demo__result"
      >
        {{ t('Form data:', '表单数据：') }}
        <output data-testid="number-submitted">{{ submitted }}</output>
      </p>
      <div class="number-field-demo__settings">
        <Checkbox
          v-model="filled"
          :label="t('Filled appearance', '填充外观')"
        />
        <Checkbox
          v-model="controls"
          :label="t('Show step controls', '显示步进操作')"
        />
      </div>
    </form>
  </section>
</template>

<style scoped>
.number-field-demo {
  display: grid;
  gap: 24px;
}
.number-field-demo__form {
  display: grid;
  gap: 16px;
  max-inline-size: 420px;
}
.number-field-demo__actions,
.number-field-demo__settings {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.number-field-demo__result {
  margin: 0;
  font: var(--md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
