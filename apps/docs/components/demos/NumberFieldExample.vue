<script setup lang="ts">
import { computed, ref } from 'vue'
import { NumberField } from '@registry/components/number-field'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const quantity = ref<number | null>(2)
const amount = ref<number | null>(1234.5)
const weight = ref<number | null>(0.1)
const chineseQuantity = ref<number | null>(3)
const filled = ref(false)
const controls = ref(true)
const submitted = ref('')
function submit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement)
  submitted.value = String(data.get('quantity') ?? '')
}
</script>

<template>
  <div class="number-field-demo">
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
        {{ t('Selected:', '已选择：') }}
        <output data-testid="number-quantity">{{ quantity ?? '—' }}</output>
      </p>
      <p
        v-if="submitted"
        class="number-field-demo__result"
      >
        {{ t('Submitted:', '已提交：') }}
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
    <div class="number-field-demo__grid">
      <NumberField
        v-model="amount"
        :label="t('German amount', '德语金额')"
        locale="de-DE"
        :min="0"
        :controls="false"
        width="100%"
        :hint="t('A comma separates decimal places.', '使用逗号作为小数分隔符。')"
      >
        <template #suffix-text>EUR</template>
      </NumberField>
      <NumberField
        v-model="weight"
        :label="t('Weight', '重量')"
        :locale="fieldLocale"
        :step="0.1"
        :min="0"
        :max="10"
        width="100%"
      >
        <template #suffix-text>kg</template>
      </NumberField>
      <NumberField
        v-model="chineseQuantity"
        label="中文数量"
        locale="zh-CN"
        :min="1"
        :max="5"
        width="100%"
        hint="请输入 1 至 5 之间的数字。"
      />
      <NumberField
        :model-value="8"
        :label="t('Read-only quantity', '只读数量')"
        :locale="fieldLocale"
        readonly
        width="100%"
      />
      <NumberField
        :model-value="4"
        :label="t('Disabled quantity', '禁用数量')"
        :locale="fieldLocale"
        disabled
        width="100%"
      />
    </div>
  </div>
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
.number-field-demo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 24px;
}
</style>
