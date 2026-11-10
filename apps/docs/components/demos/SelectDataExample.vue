<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormField } from '@registry/components/form-field'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select, type SelectOption } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const dataChoice = ref('forest')
const dataChoices = ref(['violet', 'remote'])
const remoteCatalog = ref(false)
const dataOptions = computed<readonly SelectOption[]>(() =>
  remoteCatalog.value
    ? [{ value: 'remote', label: t('Remote preset', '远程预设') }]
    : [
        { value: 'violet', label: t('Violet', '紫罗兰') },
        { value: 'disabled-preset', label: t('Unavailable preset', '不可用预设'), disabled: true },
        { value: 'forest', label: t('Forest', '森林') },
      ],
)
</script>

<template>
  <section
    class="select-data-demo"
    data-testid="select-data"
  >
    <form id="select-data-form">
      <FormField :label="t('Preset', '预设')"
        ><Select
          v-model="dataChoice"
          :options="dataOptions"
          name="preset"
          required
      /></FormField>
      <FormField :label="t('Preset collection', '预设集合')"
        ><Select
          v-model="dataChoices"
          :options="dataOptions"
          name="presets"
          selection-display="chips"
          multiple
      /></FormField>
      <Button
        type="reset"
        variant="text"
        >{{ t('Reset presets', '重置预设') }}</Button
      >
    </form>
    <Checkbox
      v-model="remoteCatalog"
      :label="t('Use another catalog', '使用另一组选项')"
    />
    <p class="select-data-demo__note">
      {{
        t(
          'Switch the catalog to see an accepted value without metadata: the trigger keeps the raw value and native submission retains it.',
          '切换选项目录可查看缺少元数据的已接受值：触发器保留原始值，原生提交也会保留它。',
        )
      }}
    </p>
  </section>
</template>

<style scoped>
.select-data-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-data-demo form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-data-demo :deep(.yam3x-form-field) {
  inline-size: min(100%, 320px);
}
.select-data-demo__note {
  flex-basis: 100%;
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
