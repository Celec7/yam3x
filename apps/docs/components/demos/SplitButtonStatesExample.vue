<script setup lang="ts">
import { ref } from 'vue'
import { SplitButton, type MenuItem } from '@registry/components/split-button'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const formSubmitCount = ref(0)
const blockedMenuOpen = ref(true)
const items: MenuItem[] = [
  { value: 'document', label: t('Save document', '保存文档') },
  { value: 'separator', type: 'divider' },
  { value: 'copy', label: t('Save a copy', '保存副本') },
]
</script>

<template>
  <div
    class="split-states-demo"
    data-testid="split-states-example"
  >
    <div class="split-states-demo__row">
      <SplitButton
        :label="t('Primary action disabled', '主操作禁用')"
        :items="items"
        primary-disabled
      />
      <SplitButton
        :label="t('Menu disabled', '菜单禁用')"
        :items="items"
        menu-disabled
      />
      <SplitButton
        v-model:open="blockedMenuOpen"
        :label="t('All disabled', '全部禁用')"
        :items="items"
        disabled
      />
    </div>

    <form
      class="split-states-demo__row"
      @submit.prevent="formSubmitCount++"
    >
      <SplitButton
        :label="t('Submit', '提交')"
        :items="items"
        type="submit"
        name="action"
        value="primary"
      />
      <output>{{ t('Form submitted', '表单已提交') }} {{ formSubmitCount }}</output>
    </form>

    <div class="split-states-demo__row">
      <SplitButton
        :label="t('View help', '查看帮助')"
        :href="t('/components/split-button#api', '/zh/components/split-button#api')"
        :items="items"
      />
      <SplitButton
        :aria-label="t('Create blank document', '创建空白文档')"
        :items="items"
      >
        <template #icon><Icon name="add" /></template>
      </SplitButton>
    </div>
  </div>
</template>

<style scoped>
.split-states-demo {
  display: grid;
  gap: 20px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.split-states-demo__row {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  min-block-size: 72px;
}
.split-states-demo svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
.split-states-demo output {
  color: var(--md-sys-color-on-surface-variant);
}
</style>
