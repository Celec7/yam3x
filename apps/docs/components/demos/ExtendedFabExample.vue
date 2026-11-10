<script setup lang="ts">
import { ref } from 'vue'
import { ExtendedFloatingActionButton } from '@registry/components/fab'
import { Checkbox } from '@registry/components/checkbox'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const expanded = ref(true)
const lowered = ref(false)
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="extended-fab-gallery"
  >
    <div class="yam3x-demo__row extended-fab-example__row">
      <ExtendedFloatingActionButton
        id="extended-fab-example-small"
        size="small"
        variant="secondary-container"
        :expanded="expanded"
        :lowered="lowered"
      >
        <template #icon
          ><Icon
            name="add"
            filled
        /></template>
        {{ t('Create', '新建') }}
      </ExtendedFloatingActionButton>
      <ExtendedFloatingActionButton
        id="extended-fab-example-medium"
        variant="secondary-container"
        :lowered="lowered"
      >
        <template #icon
          ><Icon
            name="add"
            filled
        /></template>
        {{ t('Create plan', '新建计划') }}
      </ExtendedFloatingActionButton>
      <ExtendedFloatingActionButton
        id="extended-fab-example-large"
        size="large"
        variant="tertiary-container"
        :lowered="lowered"
      >
        <template #icon
          ><Icon
            name="add"
            filled
        /></template>
        {{ t('Create content', '创建内容') }}
      </ExtendedFloatingActionButton>
    </div>

    <div class="yam3x-demo__row">
      <ExtendedFloatingActionButton
        id="extended-fab-example-no-icon"
        size="small"
        variant="primary-container"
        :expanded="expanded"
        :lowered="lowered"
      >
        {{ t('Save draft', '保存草稿') }}
      </ExtendedFloatingActionButton>
    </div>

    <div class="yam3x-demo__row">
      <Checkbox
        v-model="expanded"
        :label="t('Expanded', '展开')"
      />
      <Checkbox
        v-model="lowered"
        :label="t('Lowered', '降低')"
      />
    </div>
  </section>
</template>

<style scoped>
.extended-fab-example__row {
  gap: 24px;
}
</style>
