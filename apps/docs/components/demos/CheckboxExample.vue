<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox, TriStateCheckbox } from '@registry/components/checkbox'
import type { CheckboxState } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const accepted = ref(false)
const updates = ref(true)
const selectionState = ref<CheckboxState>('indeterminate')
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <form
      id="checkbox-example-form"
      class="yam3x-demo__stack"
      @submit.prevent
    >
      <Checkbox
        id="checkbox-terms"
        v-model="accepted"
        :label="t('Accept the terms of use', '接受使用条款')"
        name="terms"
        value="accepted"
        required
      />
      <Button type="reset">{{ t('Reset form', '重置表单') }}</Button>
    </form>
    <Checkbox
      v-model="updates"
      :label="t('Receive product updates', '接收产品更新')"
      :description="t('You can change this choice at any time', '可以随时更改此选择')"
    />
    <TriStateCheckbox
      v-model="selectionState"
      :label="t('Indeterminate state example', '混合状态示例')"
    />
    <Checkbox
      :label="t('Disabled and invalid', '禁用且错误')"
      :description="t('The error message remains visible', '仍保留错误提示')"
      disabled
      invalid
    />
    <p class="yam3x-demo__status">
      {{ t('Terms:', '条款：') }}
      {{ accepted ? t('Accepted', '已接受') : t('Not accepted', '未接受') }};
      {{ t('Updates:', '更新：') }} {{ updates ? t('On', '开启') : t('Off', '关闭') }}
    </p>
  </div>
</template>
