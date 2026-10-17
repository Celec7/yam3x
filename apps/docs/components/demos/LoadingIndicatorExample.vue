<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { LoadingIndicator } from '@registry/components/loading-indicator'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const contained = ref(false)
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack loading-demo">
    <Checkbox
      v-model="contained"
      :label="t('Use container', '使用容器')"
    />
    <div class="loading-demo__stage">
      <LoadingIndicator
        data-testid="loading-indicator"
        :aria-label="t('Loading article', '正在加载文章')"
        :variant="contained ? 'contained' : 'uncontained'"
      />
    </div>
    <p>
      {{
        t(
          'Use a loading indicator for brief tasks with unknown progress. For waits expected to exceed 5 seconds, prefer a progress indicator.',
          '短时间且进度未知的任务可使用加载指示器。预计等待超过 5 秒时，优先使用进度指示器。',
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.loading-demo__stage {
  display: grid;
  min-height: 112px;
  place-items: center;
}
.loading-demo p {
  margin: 0;
}
</style>
