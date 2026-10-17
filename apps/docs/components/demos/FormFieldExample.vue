<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { IconButton } from '@registry/components/icon-button'
import { Icon } from '@registry/components/icon'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const email = ref('')
const emailInput = ref<HTMLInputElement | null>(null)
const variant = ref<'outlined' | 'filled'>('outlined')
const hideSubscript = ref<'always' | 'auto' | 'never'>('never')
const floatLabel = ref<'auto' | 'always'>('auto')
const submitted = ref(false)
const emailInvalid = ref(false)
function submit() {
  submitted.value = true
  emailInvalid.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
}
function resetForm() {
  submitted.value = false
  emailInvalid.value = false
  email.value = ''
}
async function clearEmail() {
  email.value = ''
  await nextTick()
  emailInput.value?.focus()
}
</script>

<template>
  <section class="form-field-demo">
    <div class="form-field-demo__controls">
      <label for="form-field-variant">{{ t('Appearance', '外观') }}</label>
      <Select
        id="form-field-variant"
        v-model="variant"
      >
        <Option
          value="outlined"
          :label="t('Outlined', '描边')"
        />
        <Option
          value="filled"
          :label="t('Filled', '填充')"
        />
      </Select>
      <label for="form-field-subscripts">{{ t('Supporting text', '辅助文字') }}</label>
      <Select
        id="form-field-subscripts"
        v-model="hideSubscript"
      >
        <Option
          value="never"
          :label="t('Always show', '始终显示')"
        />
        <Option
          value="auto"
          :label="t('Show when focused', '聚焦时显示')"
        />
        <Option
          value="always"
          :label="t('Hide', '隐藏')"
        />
      </Select>
      <label for="form-field-label-mode">{{ t('Label', '标签') }}</label>
      <Select
        id="form-field-label-mode"
        v-model="floatLabel"
      >
        <Option
          value="auto"
          :label="t('Float automatically', '自动浮起')"
        />
        <Option
          value="always"
          :label="t('Always float', '始终浮起')"
        />
      </Select>
      <Button
        type="button"
        @click="submit"
        >{{ t('Validate input', '验证输入') }}</Button
      >
    </div>
    <form
      class="form-field-demo__form"
      @submit.prevent="submit"
      @reset="resetForm"
    >
      <p class="form-field-demo__required-note">
        {{ t('Fields marked with * are required.', '带 * 的字段为必填项。') }}
      </p>
      <FormField
        class="form-field-demo__main-field"
        :variant="variant"
        :hide-subscript="hideSubscript"
        :float-label="floatLabel"
        :counter-label="t('Character count', '字符计数')"
        :label="t('Email', '电子邮件')"
        :hint="t('Used to receive account notifications', '用于接收账户通知')"
        :error="submitted && emailInvalid"
      >
        <template #prefix><span aria-hidden="true">@</span></template>
        <input
          ref="emailInput"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          maxlength="64"
          required
          placeholder="name@example.com"
        />
        <template
          v-if="email"
          #suffix
          ><IconButton
            class="form-field-demo__clear"
            variant="standard"
            size="small"
            :aria-label="t('Clear email', '清空电子邮件')"
            @click.stop="clearEmail"
            ><Icon name="close" /></IconButton
        ></template>
        <template #error>
          <span class="form-field-demo__error-content">
            <Icon
              class="form-field-demo__error-icon"
              name="error"
              aria-hidden="true"
            />
            {{ t('Enter a valid email address', '请输入有效的电子邮件地址') }}
          </span>
        </template>
      </FormField>
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
        id="readonly-field-id"
        class="form-field-demo__readonly"
        :label="t('Read-only field', '只读字段')"
        ><input
          :value="t('Copyable content', '可以复制的内容')"
          readonly
        /><template #hint>{{
          t('This content can be copied.', '此内容可以复制。')
        }}</template></FormField
      >
      <FormField
        class="form-field-demo__disabled"
        :label="t('Disabled field', '不可用字段')"
        ><input
          :value="t('Unavailable', '暂不可用')"
          disabled
      /></FormField>
      <Button type="submit">{{ t('Submit', '提交') }}</Button>
      <Button type="reset">{{ t('Reset', '重置') }}</Button>
      <output aria-live="polite"
        >{{ t('Input:', '输入：') }} {{ email || t('Empty', '空') }}</output
      >
    </form>
  </section>
</template>

<style scoped>
.form-field-demo {
  display: grid;
  gap: 24px;
}
.form-field-demo__controls,
.form-field-demo__form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.form-field-demo__form {
  max-width: 720px;
}
.form-field-demo__required-note {
  flex-basis: 100%;
  margin: 0;
}
.form-field-demo__error-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.form-field-demo__error-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
}
.form-field-demo output {
  flex-basis: 100%;
}
</style>
