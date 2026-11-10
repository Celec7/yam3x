<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { NumberField } from '@registry/components/number-field'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))

const amount = ref<number | null>(1234.5)
const weight = ref<number | null>(0.1)
const chineseQuantity = ref<number | null>(3)
const rating = ref<number | null>(3)
const coupon = ref<number | null>(null)
const couponError = ref('')
const couponResult = ref('')
const couponForm = ref<HTMLFormElement>()

function submitCoupon(): void {
  const value = coupon.value
  couponError.value =
    value !== null && value >= 1 && value <= 5
      ? ''
      : t('Enter a number from 1 to 5.', '请输入 1 至 5 的数字。')
  if (couponError.value) {
    couponResult.value = ''
    couponForm.value?.querySelector('input')?.focus()
    return
  }
  couponResult.value = t('Accepted value:', '接受值：') + ` ${value}`
}
</script>

<template>
  <section
    data-testid="number-field-states"
    class="number-field-states-demo"
  >
    <div class="number-field-states-demo__grid">
      <NumberField
        v-model="amount"
        :label="t('German amount', '德语金额')"
        locale="de-DE"
        :min="0"
        :controls="false"
        width="100%"
        :hint="t('A comma separates decimal places.', '使用逗号作为小数分隔符。')"
      >
        <template #prefix-text>€</template>
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
      <NumberField
        v-model="rating"
        :label="t('Filled rating', '填充评分')"
        :locale="fieldLocale"
        variant="filled"
        :min="0"
        :max="5"
        :step="0.5"
        width="100%"
        :hint="t('Filled appearance with half steps.', '填充外观，支持半步进。')"
      />
    </div>
    <form
      ref="couponForm"
      class="number-field-states-demo__form"
      @submit.prevent="submitCoupon"
    >
      <NumberField
        v-model="coupon"
        name="coupon"
        :label="t('Coupon count', '优惠券数量')"
        required
        :locale="fieldLocale"
        :min="1"
        :max="5"
        width="100%"
        :error="couponError"
        @invalid="couponError = $event.message"
        @change="couponError = ''"
      />
      <div class="number-field-states-demo__actions">
        <Button type="submit">{{ t('Validate coupon count', '校验优惠券数量') }}</Button>
      </div>
      <output
        v-if="couponResult"
        data-testid="number-field-coupon-result"
        aria-live="polite"
        >{{ couponResult }}</output
      >
    </form>
  </section>
</template>

<style scoped>
.number-field-states-demo {
  display: grid;
  gap: 24px;
}
.number-field-states-demo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 24px;
}
.number-field-states-demo__form {
  display: grid;
  gap: 12px;
  max-inline-size: 24rem;
}
.number-field-states-demo__actions {
  display: flex;
  gap: 12px;
}
</style>
