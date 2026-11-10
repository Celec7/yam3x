<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormField } from '@registry/components/form-field'
import { Option, OptionGroup } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const density = ref('comfortable')
const options = computed(() => [
  { value: 'comfortable', label: t('Comfortable', '舒适') },
  { value: 'compact', label: t('Compact', '紧凑') },
  { value: 'custom', label: t('Custom spacing', '自定义间距') },
])
const current = computed(
  () => options.value.find((option) => option.value === density.value)?.label ?? density.value,
)
</script>

<template>
  <section
    class="option-basic"
    data-testid="option-basic"
  >
    <FormField
      :label="t('Row density', '行密度')"
      width="16rem"
    >
      <Select
        v-model="density"
        name="density"
        :aria-label="t('Row density', '行密度')"
      >
        <OptionGroup :label="t('Density', '密度')">
          <Option
            value="comfortable"
            :label="t('Comfortable', '舒适')"
          />
          <Option
            value="compact"
            :label="t('Compact', '紧凑')"
          />
          <Option
            value="custom"
            :label="t('Custom spacing', '自定义间距')"
            disabled
          />
        </OptionGroup>
      </Select>
    </FormField>
    <p class="yam3x-demo__status">
      {{ t('Current density:', '当前密度：') }} {{ current }}
    </p>
  </section>
</template>

<style scoped>
.option-basic {
  display: grid;
  gap: 12px;
  min-inline-size: 0;
}
.option-basic p {
  margin: 0;
}
</style>
