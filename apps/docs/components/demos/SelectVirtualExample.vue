<script setup lang="ts">
import { computed, ref } from 'vue'
import { Select } from '@registry/components/select'
import { FormField } from '@registry/components/form-field'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'
const { t } = useDemoLocale()
const options = Array.from({ length: 10000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index + 1}`,
  disabled: index === 9998,
}))
const value = ref('item-9999')
const values = ref(['item-1'])
const searchable = ref(false)
const zeroOverscan = ref(false)
const hideLeading = ref(false)
const empty = ref(false)
const catalog = computed(() => (empty.value ? [] : hideLeading.value ? options.slice(2) : options))
</script>
<template>
  <section
    class="select-virtual-demo"
    data-testid="select-virtual"
  >
    <form>
      <FormField :label="t('Large catalog', '大型选项目录')">
        <Select
          v-model="value"
          :options="catalog"
          :virtual="{ overscan: zeroOverscan ? 0 : 4 }"
          :searchable="searchable"
          name="large-item"
        >
          <template #option="{ option }"
            ><span class="select-virtual-demo__row"
              >{{ option.label
              }}<small v-if="Number(option.value.slice(5)) % 7 === 0">{{
                t(
                  'Additional context can wrap without clipping the row.',
                  '附加说明可以换行，选项内容不会被固定行高截断。',
                )
              }}</small></span
            ></template
          >
        </Select>
      </FormField>
      <FormField :label="t('Large collection', '大型选项集合')"
        ><Select
          v-model="values"
          :options="catalog"
          :virtual="{ overscan: zeroOverscan ? 0 : 4 }"
          multiple
          selection-display="chips"
          name="large-items"
      /></FormField>
      <Button
        type="reset"
        variant="text"
        >{{ t('Reset large catalog', '重置大型目录') }}</Button
      >
    </form>
    <Checkbox
      v-model="searchable"
      :label="t('Search catalog', '搜索目录')"
    />
    <Checkbox
      v-model="zeroOverscan"
      :label="t('Use zero overscan', '不预渲染额外行')"
    />
    <Checkbox
      v-model="hideLeading"
      :label="t('Hide leading choices', '隐藏开头选项')"
    />
    <Checkbox
      v-model="empty"
      :label="t('Empty large catalog', '清空大型目录')"
    />
  </section>
</template>
<style scoped>
.select-virtual-demo,
.select-virtual-demo form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-virtual-demo :deep(.yam3x-form-field) {
  inline-size: min(100%, 320px);
}
.select-virtual-demo__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.select-virtual-demo__row small {
  white-space: normal;
  font-size: 0.85em;
}
</style>
