<script setup lang="ts">
import { ref } from 'vue'
import {
  SplitButtonLayout,
  SplitButtonLeadingButton,
  SplitButtonTrailingButton,
  type MenuItem,
} from '@registry/components/split-button'
import Menu from '@registry/components/menu/menu.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const open = ref(false)
const actionCount = ref(0)
const items: MenuItem[] = [
  { value: 'copy', label: t('Save a copy', '保存副本') },
  { value: 'template', label: t('Save as template', '另存为模板') },
]
</script>

<template>
  <section class="split-composition-demo">
    <SplitButtonLayout
      :aria-label="t('Save actions', '保存操作')"
      spacing="4px"
    >
      <template #leading>
        <SplitButtonLeadingButton
          :aria-label="t('Save', '保存')"
          @click="actionCount++"
        >
          <template #icon><Icon name="save" /></template>
          {{ t('Save', '保存') }}
        </SplitButtonLeadingButton>
      </template>
      <template #trailing>
        <Menu
          v-model:open="open"
          :items="items"
          :label="t('Save options', '保存选项')"
          :trigger-label="t('More save options', '更多保存选项')"
        >
          <template #trigger="{ triggerProps }">
            <SplitButtonTrailingButton
              v-bind="triggerProps"
              v-model:checked="open"
              :aria-label="t('More save options', '更多保存选项')"
            />
          </template>
        </Menu>
      </template>
    </SplitButtonLayout>
    <output aria-live="polite"
      >{{ t('Primary action count:', '主操作次数：') }} {{ actionCount }}</output
    >
  </section>
</template>

<style scoped>
.split-composition-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  min-block-size: 120px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.split-composition-demo svg {
  inline-size: 1em;
  block-size: 1em;
  fill: currentColor;
}
</style>
