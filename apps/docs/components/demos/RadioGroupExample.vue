<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { RadioGroup, RadioButton } from '@registry/components/radio-group'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const ringtone = ref('callisto')
const delivery = ref<string | null>('home')
const notifications = ref<string | null>(null)
const payment = ref('card')
const externalValue = ref('compact')
const unavailable = ref('first')
const anonymousValue = ref('first')
const submitted = ref('')
const observedRingtone = ref('')
const form = ref<HTMLFormElement>()

function submitDelivery(): void {
  if (!form.value) return
  submitted.value = String(new FormData(form.value).get('delivery') ?? t('None selected', '未选择'))
}
</script>

<template>
  <div class="grid gap-8">
    <RadioGroup
      v-model="ringtone"
      :label="t('Ringtone', '铃声')"
      name="ringtone"
      :description="t('Choose a ringtone', '选择一个来电铃声')"
      @input="observedRingtone = ringtone"
    >
      <RadioButton value="none">{{ t('None', '无') }}</RadioButton>
      <RadioButton
        value="callisto"
        :description="t('Default ringtone', '默认铃声')"
        >Callisto</RadioButton
      >
      <RadioButton value="ganymede">Ganymede</RadioButton>
      <RadioButton value="luna">Luna</RadioButton>
      <RadioButton
        value="pickup"
        disabled
        >{{ t('Pickup (unavailable)', '到店自取（不可用）') }}</RadioButton
      >
    </RadioGroup>
    <output
      data-testid="radio-value-observed-on-input"
      aria-live="polite"
      >{{ t('Ringtone value read by input event:', '输入事件读到的铃声值：') }}
      {{ observedRingtone }}</output
    >

    <RadioGroup
      v-model="notifications"
      :label="t('Browser notifications', '浏览器通知')"
      name="notifications"
      :description="
        t('Start empty when no suitable default is available', '没有合适默认值时从空值开始')
      "
      required
    >
      <RadioButton value="enabled">{{ t('On', '开启') }}</RadioButton>
      <RadioButton value="disabled">{{ t('Off', '关闭') }}</RadioButton>
    </RadioGroup>

    <RadioGroup
      v-model="payment"
      :label="t('Payment method (validation error example)', '付款方式（校验错误示例）')"
      name="payment"
      :description="
        t('Keep the selected value and show the error state', '保留已选值并显示错误状态')
      "
      invalid
    >
      <RadioButton value="card">{{ t('Bank card', '银行卡') }}</RadioButton>
      <RadioButton value="wallet">{{ t('Digital wallet', '电子钱包') }}</RadioButton>
    </RadioGroup>

    <form
      id="radio-group-example-form"
      ref="form"
      class="grid justify-items-start gap-4"
      @submit.prevent="submitDelivery"
    >
      <RadioGroup
        v-model="delivery"
        :label="t('Delivery address', '配送地址')"
        name="delivery"
        required
      >
        <RadioButton value="home">{{ t('Home address', '家庭地址') }}</RadioButton>
        <RadioButton value="office">{{ t('Office address', '办公地址') }}</RadioButton>
      </RadioGroup>
      <div class="flex gap-3">
        <Button
          variant="outlined"
          type="submit"
          >{{ t('Submit', '提交') }}</Button
        >
        <Button
          variant="text"
          type="reset"
          @click="submitted = ''"
          >{{ t('Reset', '重置') }}</Button
        >
      </div>
      <output aria-live="polite">{{ t('Submitted:', '已提交：') }} {{ submitted }}</output>
    </form>

    <form id="radio-group-disabled-form">
      <RadioGroup
        v-model="unavailable"
        :label="t('Unavailable options', '不可用的选项')"
        name="unavailable"
        disabled
      >
        <RadioButton value="first">{{ t('Option one', '选项一') }}</RadioButton>
        <RadioButton value="second">{{ t('Option two', '选项二') }}</RadioButton>
      </RadioGroup>
    </form>

    <form id="radio-group-external-form" />
    <RadioGroup
      v-model="externalValue"
      :label="t('External form field', '外部表单字段')"
      name="layout"
      form="radio-group-external-form"
    >
      <RadioButton value="compact">{{ t('Compact', '紧凑') }}</RadioButton>
      <RadioButton value="comfortable">{{ t('Comfortable', '舒适') }}</RadioButton>
    </RadioGroup>

    <form id="radio-group-unnamed-form">
      <RadioGroup
        v-model="anonymousValue"
        :label="t('Radio group without submitted value', '不提交值的单选组')"
      >
        <RadioButton value="first">{{ t('Option one', '选项一') }}</RadioButton>
        <RadioButton value="second">{{ t('Option two', '选项二') }}</RadioButton>
      </RadioGroup>
    </form>
  </div>
</template>
