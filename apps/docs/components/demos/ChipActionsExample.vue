<script setup lang="ts">
import { ref } from 'vue'
import { AssistChip, SuggestionChip } from '@registry/components/chips'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const assistCount = ref(0)
const suggestion = ref('')
const docsHref = t('/components/', '/zh/components/')
</script>

<template>
  <section
    class="yam3x-demo yam3x-demo__stack"
    data-testid="chip-actions"
  >
    <div class="yam3x-demo__row">
      <AssistChip
        variant="outlined"
        @click="assistCount++"
      >
        <template #icon><Icon name="history" /></template>
        {{ t('Refresh content', '刷新内容') }}
      </AssistChip>
      <SuggestionChip
        variant="outlined"
        @click="suggestion = t('Nearby cafes', '周边咖啡馆')"
      >
        <template #icon><Icon name="map" /></template>
        {{ t('Nearby cafes', '周边咖啡馆') }}
      </SuggestionChip>
      <AssistChip
        variant="elevated"
        :href="docsHref"
      >
        <template #icon><Icon name="arrow_forward" /></template>
        {{ t('Open components', '打开组件') }}
      </AssistChip>
      <SuggestionChip variant="elevated">
        <template #icon><Icon name="star" /></template>
        {{ t('Try a suggestion', '尝试建议') }}
      </SuggestionChip>
      <SuggestionChip
        variant="outlined"
        disabled
      >
        {{ t('Unavailable suggestion', '不可用的建议') }}
      </SuggestionChip>
    </div>
    <p
      class="yam3x-demo__status"
      aria-live="polite"
    >
      {{ t('Assistant actions:', '助手操作') }} {{ assistCount }} · {{ t('Suggestion:', '建议：') }}
      {{ suggestion || t('Not selected', '尚未选择') }}
    </p>
  </section>
</template>
