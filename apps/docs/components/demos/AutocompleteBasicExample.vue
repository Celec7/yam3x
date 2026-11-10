<script setup lang="ts">
import { computed, ref } from 'vue'
import { Autocomplete, type AutocompleteOption } from '@registry/components/autocomplete'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const query = ref('')
const selected = ref<string | null>(null)
const options = computed<AutocompleteOption[]>(() => [
  { value: 'amsterdam', label: t('Amsterdam', '阿姆斯特丹') },
  { value: 'berlin', label: t('Berlin', '柏林') },
  { value: 'lisbon', label: t('Lisbon', '里斯本') },
  { value: 'madrid', label: t('Madrid', '马德里') },
  { value: 'oslo', label: t('Oslo', '奥斯陆') },
])
</script>

<template>
  <section
    class="autocomplete-basic"
    data-testid="autocomplete-basic"
  >
    <Autocomplete
      v-model="query"
      v-model:selected="selected"
      :options="options"
      :label="t('City', '城市')"
      :hint="t('Filter the list by typing a city name.', '输入城市名称以筛选列表。')"
      :placeholder="t('Choose a city', '选择城市')"
      :locale="localeTag"
    />
    <p data-testid="autocomplete-basic-selected">
      {{ t('Selected city:', '已选城市：') }} {{ selected || t('None', '无') }}
    </p>
  </section>
</template>

<style scoped>
.autocomplete-basic {
  display: grid;
  gap: 16px;
  max-inline-size: 24rem;
}
.autocomplete-basic p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
