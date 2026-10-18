<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete } from '@registry/components/autocomplete'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { t, locale } = useDemoLocale()
const query = ref('')
const selected = ref<string | null>(null)
const virtual = ref(true)
const loading = ref(false)
const options = Array.from({ length: 10000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index + 1}`,
  disabled: index === 9998,
}))
</script>

<template>
  <section
    class="autocomplete-virtual-demo"
    data-testid="autocomplete-virtual"
  >
    <form>
      <Autocomplete
        v-model="query"
        v-model:selected="selected"
        :label="t('Large suggestion catalog', '大型建议目录')"
        :options="options"
        :virtual="virtual"
        :loading="loading"
        :locale="locale === 'zh' ? 'zh-CN' : 'en-US'"
        panel-class="autocomplete-virtual-demo__panel"
        name="suggestion"
      >
        <template #option="{ option }">
          <span class="autocomplete-virtual-demo__row">
            {{ option.label }}
            <small v-if="Number(option.value.slice(5)) % 7 === 0">{{
              t(
                'Additional context wraps to fit the suggestion.',
                '附加说明会根据建议菜单的宽度自动换行。',
              )
            }}</small>
          </span>
        </template>
      </Autocomplete>
      <Button
        type="reset"
        variant="text"
        >{{ t('Reset suggestions', '重置建议') }}</Button
      >
    </form>
    <Checkbox
      v-model="virtual"
      :label="t('Virtualize suggestions', '虚拟化建议')"
    />
    <Checkbox
      v-model="loading"
      :label="t('Loading suggestions', '正在加载建议')"
    />
    <p>
      {{ t('Accepted value', '已确认的值') }}: <output>{{ selected ?? '—' }}</output>
    </p>
  </section>
</template>

<style>
.autocomplete-virtual-demo {
  display: grid;
  gap: 16px;
}
.autocomplete-virtual-demo form {
  display: grid;
  justify-items: start;
  gap: 16px;
}
.autocomplete-virtual-demo .yam3x-autocomplete {
  inline-size: min(100%, 320px);
}
.autocomplete-virtual-demo__panel .yam3x-autocomplete__option {
  block-size: auto;
}
.autocomplete-virtual-demo__row {
  display: grid;
  gap: 4px;
  padding-block: 12px;
}
.autocomplete-virtual-demo__row small {
  font-size: inherit;
  font-weight: 400;
}
</style>
