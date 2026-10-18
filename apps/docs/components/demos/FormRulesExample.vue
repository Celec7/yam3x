<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  Form,
  FormSection,
  formValidationFromIssues,
  type FormContext,
  type FormFieldDefinition,
  type FormRuleContext,
  type FormValidationAdapter,
} from '@registry/components/form'
import { FormField } from '@registry/components/form-field'
import { Checkbox } from '@registry/components/checkbox'
import { Button } from '@registry/components/button'
import RegisteredAliasField from './RegisteredAliasField.vue'
import { useDemoLocale } from './use-demo-locale'
const { locale, t } = useDemoLocale()
const api = ref<InstanceType<typeof Form>>()
const profile = reactive({ name: 'Al', alias: 'ab' })
const showAlias = ref(true)
const hold = ref(false)
const response = ref<((message: string) => void) | null>(null)
const canceled = ref(false)
const saved = ref(0)
const checked = ref('')
function checkName(_value: unknown, context: FormRuleContext): Promise<string> | void {
  if (!hold.value) return
  canceled.value = false
  return new Promise((resolve) => {
    const onAbort = () => {
      canceled.value = true
    }
    context.signal.addEventListener('abort', onAbort, { once: true })
    response.value = (message) => {
      context.signal.removeEventListener('abort', onAbort)
      resolve(message)
    }
  })
}
const fields = computed<readonly FormFieldDefinition[]>(() => [
  {
    path: ['profile', 'name'],
    name: 'display-name',
    label: t('Display name', '显示名称'),
    value: () => profile.name,
    rules: [
      { minLength: 3, message: t('Use at least three letters.', '请至少输入三个字母。') },
      { pattern: /^[a-z]+$/i, message: t('Use letters only.', '请仅使用字母。') },
      { validate: checkName },
    ],
  },
])
function schemaCheck(context: FormContext) {
  return formValidationFromIssues(
    context.data.get('profile.alias') === 'reserved'
      ? [{ path: ['profile', 'alias'], message: t('Choose another alias.', '请使用其他别名。') }]
      : [],
  )
}
const adapter: FormValidationAdapter = { validate: schemaCheck, validateFields: schemaCheck }
async function checkProfile() {
  checked.value = (await api.value!.validateFields([['profile']])).status
}
function resetProfile() {
  profile.name = 'Al'
  profile.alias = 'ab'
  checked.value = ''
}
function finish() {
  response.value?.(t('This name is unavailable.', '此名称不可用。'))
  response.value = null
}
</script>
<template>
  <section
    data-testid="form-registered"
    class="registered-form-demo"
  >
    <div class="registered-form-demo__tools">
      <Checkbox
        v-model="showAlias"
        :label="t('Register alias field', '注册别名字段')"
      />
      <Checkbox
        v-model="hold"
        :label="t('Hold name validation', '暂缓名称校验')"
      />
    </div>
    <Form
      ref="api"
      :fields="fields"
      :validate="adapter"
      :submit="
        () => {
          saved++
        }
      "
      :locale="locale === 'zh' ? 'zh-CN' : 'en-US'"
      :summary-heading-level="3"
      @reset="resetProfile"
    >
      <template #default="{ fieldErrors }">
        <FormSection :title="t('Registered profile fields', '已注册的个人资料字段')">
          <FormField
            :label="t('Display name', '显示名称')"
            :error="fieldErrors['display-name']"
            width="100%"
          >
            <input
              v-model="profile.name"
              name="display-name"
              autocomplete="name"
            />
          </FormField>
          <RegisteredAliasField
            v-if="showAlias"
            v-model="profile.alias"
            :error="fieldErrors['profile.alias']"
          />
        </FormSection>
      </template>
      <template #actions="{ pending }">
        <Button
          variant="outlined"
          :disabled="pending"
          @click="checkProfile"
          >{{ t('Check profile', '校验个人资料') }}</Button
        >
        <Button
          type="submit"
          :disabled="pending"
          >{{ t('Save profile', '保存个人资料') }}</Button
        >
        <Button
          type="reset"
          variant="text"
          >{{ t('Reset profile', '重置个人资料') }}</Button
        >
      </template>
    </Form>
    <Button
      v-if="response"
      variant="outlined"
      @click="finish"
      >{{ t('Return validation error', '返回校验错误') }}</Button
    >
    <p>
      {{ t('Check result:', '校验结果：') }}
      <span data-testid="registered-result">{{ checked || '—' }}</span> ·
      {{ t('Saved:', '保存次数：') }} <span data-testid="registered-saved">{{ saved }}</span>
    </p>
    <p data-testid="registered-alias">
      {{ t('Retained alias:', '保留的别名：') }} {{ profile.alias }}
    </p>
    <p v-if="canceled">{{ t('Previous validation canceled.', '已取消先前的校验。') }}</p>
  </section>
</template>
<style scoped>
.registered-form-demo {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.registered-form-demo__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
