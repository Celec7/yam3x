<script setup lang="ts">
import { ref } from 'vue'
import AssistChip from '@registry/components/chips/assist-chip.vue'
import SuggestionChip from '@registry/components/chips/suggestion-chip.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const assistCount = ref(0)
const suggestion = ref('')
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <div class="yam3x-demo__row">
      <AssistChip @click="assistCount++">{{ t('Refresh content', '刷新内容') }}</AssistChip>
      <SuggestionChip @click="suggestion = t('Nearby cafes', '周边咖啡馆')">{{
        t('Nearby cafes', '周边咖啡馆')
      }}</SuggestionChip>
      <span
        class="yam3x-demo__status"
        aria-live="polite"
        >{{ t('Assistant actions:', '助手操作') }} {{ assistCount }} ·
        {{ t('Suggestion:', '建议：') }} {{ suggestion || t('Not selected', '尚未选择') }}</span
      >
    </div>
  </div>
</template>
