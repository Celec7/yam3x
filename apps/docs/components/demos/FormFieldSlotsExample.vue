<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { FormField } from '@registry/components/form-field'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const coupon = ref('')
const applied = ref('')

function apply(form: HTMLFormElement | null): void {
  if (!form) return
  applied.value = String(new FormData(form).get('coupon') ?? '')
}
</script>

<template>
  <section
    data-testid="form-field-slots"
    class="form-field-slots-demo"
  >
    <div class="form-field-slots-demo__grid">
      <FormField
        class="form-field-demo__amount"
        :label="t('Amount', '金额')"
        :hint="t('Enter an amount in US dollars', '请输入美元金额')"
      >
        <template #prefix-text><span id="amount-prefix-description">$</span></template>
        <input
          aria-describedby="amount-prefix-description amount-suffix-description"
          inputmode="decimal"
          placeholder="0.00"
        />
        <template #suffix-text><span id="amount-suffix-description">USD</span></template>
      </FormField>
      <FormField
        class="form-field-slots-demo__search"
        :label="t('Search references', '搜索凭证')"
        :hint="t('Search by reference or supplier', '按凭证编号或供应商搜索')"
      >
        <template #prefix>
          <Icon
            name="search"
            aria-hidden="true"
          />
        </template>
        <input
          type="search"
          name="reference-search"
        />
      </FormField>
      <FormField
        id="readonly-field-id"
        class="form-field-demo__readonly"
        :label="t('Read-only field', '只读字段')"
      >
        <input
          :value="t('Copyable content', '可以复制的内容')"
          readonly
        />
        <template #hint>{{ t('This content can be copied.', '此内容可以复制。') }}</template>
      </FormField>
      <FormField
        class="form-field-demo__disabled"
        :label="t('Disabled field', '不可用字段')"
      >
        <input
          :value="t('Unavailable', '暂不可用')"
          disabled
        />
      </FormField>
      <FormField
        class="form-field-slots-demo__counter"
        :label="t('Display name', '显示名称')"
        :hint="t('Shown on shared documents', '显示在共享文档中')"
        :counter-label="t('Character count', '字符计数')"
      >
        <template #label
          ><em>{{ t('Display name', '显示名称') }}</em></template
        >
        <input
          maxlength="12"
          name="display-name"
        />
        <template #counter="{ count, max }">
          <strong>{{ count }}/{{ max }}</strong>
        </template>
      </FormField>
    </div>
    <form
      ref="couponForm"
      class="form-field-slots-demo__form"
      @submit.prevent="apply($event.currentTarget as HTMLFormElement)"
    >
      <FormField
        :label="t('Coupon code', '优惠券代码')"
        :hint="t('Format: ABC-123', '格式：ABC-123')"
      >
        <template #label>{{ t('Coupon code', '优惠券代码') }}</template>
        <input
          v-model="coupon"
          name="coupon"
          pattern="[A-Z]{3}-[0-9]{3}"
          required
          autocapitalize="characters"
        />
        <template #error>
          <span class="form-field-slots-demo__error">
            <Icon
              name="error"
              aria-hidden="true"
            />
            {{ t('Enter a code such as ABC-123.', '请输入类似 ABC-123 的代码。') }}
          </span>
        </template>
      </FormField>
      <Button type="submit">{{ t('Apply coupon', '应用优惠券') }}</Button>
      <output
        v-if="applied"
        aria-live="polite"
        >{{ t('Applied:', '已应用：') }} {{ applied }}</output
      >
    </form>
  </section>
</template>

<style scoped>
.form-field-slots-demo {
  display: grid;
  gap: 32px;
}
.form-field-slots-demo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 24px;
}
.form-field-slots-demo__form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  max-inline-size: 40rem;
}
.form-field-slots-demo__error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
