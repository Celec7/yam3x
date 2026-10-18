<script setup lang="ts">
import { useFormField } from '@registry/components/form'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'
defineProps<{ error?: string }>()
const alias = defineModel<string>({ required: true })
const { t } = useDemoLocale()
useFormField(() => ({
  path: ['profile', 'alias'],
  label: t('Alias', '别名'),
  value: () => alias.value,
  rules: [{ minLength: 4, message: t('Use at least four characters.', '请至少输入四个字符。') }],
}))
</script>
<template>
  <FormField
    :label="t('Alias', '别名')"
    :error="error"
    width="100%"
  >
    <input
      v-model="alias"
      name="profile.alias"
      autocomplete="nickname"
    />
  </FormField>
</template>
