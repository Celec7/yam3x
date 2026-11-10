<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from '@registry/components/form-field'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const email = ref('')
</script>

<template>
  <section
    data-testid="form-field-basic"
    class="yam3x-demo"
  >
    <FormField
      :label="t('Work email', '工作邮箱')"
      :hint="t('Used for account notices', '用于账户通知')"
    >
      <input
        v-model="email"
        type="email"
        name="work-email"
        autocomplete="email"
        required
      />
    </FormField>
  </section>
</template>
