<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { LoadingIndicator } from '@registry/components/loading-indicator'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const contained = ref(false)
</script>

<template>
  <div class="yam3x-demo loading-demo">
    <div class="loading-demo__stage">
      <LoadingIndicator
        data-testid="loading-indicator"
        :aria-label="t('Loading article', '正在加载文章')"
        :variant="contained ? 'contained' : 'uncontained'"
      />
    </div>
    <Checkbox
      v-model="contained"
      :label="t('Use container', '使用容器')"
    />
    <p class="loading-demo__note">
      {{
        t(
          'The indicator is uncontained by default. The container adds a surface without changing the accessible name or the indeterminate value.',
          '指示器默认无容器。容器会增加背景表面，但不会改变无障碍名称或不确定状态。',
        )
      }}
    </p>
  </div>
</template>

<style scoped>
.loading-demo {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.loading-demo__stage {
  display: grid;
  inline-size: 100%;
  min-block-size: 112px;
  place-items: center;
}
.loading-demo__note {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
