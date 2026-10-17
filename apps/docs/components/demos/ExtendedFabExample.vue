<script setup lang="ts">
import { ref } from 'vue'
import ExtendedFloatingActionButton from '@registry/components/fab/extended-fab.vue'
import { Checkbox } from '@registry/components/checkbox'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const expanded = ref(true)
</script>

<template>
  <div class="yam3x-demo">
    <div class="yam3x-demo__row">
      <ExtendedFloatingActionButton
        id="extended-fab-example-small"
        size="small"
        variant="secondary-container"
        :expanded="expanded"
      >
        <template #icon><Icon name="add" /></template>
        {{ t('Create', '新建') }}
      </ExtendedFloatingActionButton>
      <ExtendedFloatingActionButton
        id="extended-fab-example-medium"
        variant="secondary-container"
      >
        <template #icon><Icon name="add" /></template>
        {{ t('Create plan', '新建计划') }}
      </ExtendedFloatingActionButton>
      <ExtendedFloatingActionButton
        id="extended-fab-example-large"
        size="large"
        variant="tertiary-container"
      >
        <template #icon><Icon name="add" /></template>
        {{ t('Create content', '创建内容') }}
      </ExtendedFloatingActionButton>
    </div>
    <div class="yam3x-demo__row extended-fab-example__text-only">
      <ExtendedFloatingActionButton
        id="extended-fab-example-no-icon"
        size="small"
        variant="primary-container"
        :expanded="expanded"
      >
        {{ t('Save draft', '保存草稿') }}
      </ExtendedFloatingActionButton>
    </div>
    <Checkbox
      v-model="expanded"
      :label="t('Expanded', '展开')"
    />
  </div>
</template>

<style scoped>
.extended-fab-example__text-only {
  margin-block-start: 16px;
}
</style>
