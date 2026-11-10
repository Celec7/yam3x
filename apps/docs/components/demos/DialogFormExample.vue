<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import Dialog from '@registry/components/dialog/dialog.vue'
import FormField from '@registry/components/form-field/form-field.vue'
import Select from '@registry/components/select/select.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const formOpen = ref(false)
const source = ref('index')
const sourceOptions = computed(() => [
  { value: 'index', label: t('Package index', '包索引') },
  { value: 'github', label: 'GitHub' },
])
</script>

<template>
  <div
    class="yam3x-demo"
    data-testid="dialog-form"
  >
    <Button
      variant="outlined"
      @click="formOpen = true"
      >{{ t('Open dialog with form controls', '打开带表单控件的对话框') }}</Button
    >
    <Dialog
      v-model:open="formOpen"
      :title="t('Install extension', '安装扩展')"
      :description="t('Choose an install source.', '选择安装来源。')"
      :close-label="t('Close install dialog', '关闭安装对话框')"
    >
      <FormField
        :label="t('Install source', '安装来源')"
        float-label="always"
        width="100%"
      >
        <Select
          v-model="source"
          :options="sourceOptions"
        />
      </FormField>
      <template #actions>
        <Button
          variant="text"
          @click="formOpen = false"
          >{{ t('Close', '关闭') }}</Button
        >
      </template>
    </Dialog>
  </div>
</template>
