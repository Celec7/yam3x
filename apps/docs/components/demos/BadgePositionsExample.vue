<script setup lang="ts">
import Badge from '@registry/components/badge/badge.vue'
import Button from '@registry/components/button/button.vue'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { useDemoDirection } from './use-demo-direction'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const { direction, toggle } = useDemoDirection()
</script>

<template>
  <div
    class="yam3x-demo badge-positions-example"
    data-testid="badge-positions"
  >
    <div class="badge-positions-example__header">
      <p>
        {{
          t(
            'Badges use logical positions, so before and after swap in right-to-left layouts.',
            '徽标使用逻辑位置，因此在从右到左布局中，前侧与后侧会互换。',
          )
        }}
      </p>
      <Button
        variant="outlined"
        @click="toggle"
        >{{
          direction === 'ltr'
            ? t('Switch to right-to-left', '切换到从右到左')
            : t('Switch to left-to-right', '切换到从左到右')
        }}</Button
      >
    </div>
    <div
      class="yam3x-demo__row badge-example__positions"
      :dir="direction"
    >
      <Badge />
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-start"
          :aria-label="t('Before', '前侧')"
        /><Badge
          for="badge-pos-start"
          position="above-before"
          >1</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-end"
          :aria-label="t('After', '后侧')"
        /><Badge
          for="badge-pos-end"
          position="below-after"
          >2</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-top"
          :aria-label="t('Above', '上方')"
        /><Badge
          for="badge-pos-top"
          position="above"
          >3</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-bottom"
          :aria-label="t('Below', '下方')"
        /><Badge
          for="badge-pos-bottom"
          position="below"
          >4</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-below-before"
          :aria-label="t('Below before', '下方前侧')"
        /><Badge
          for="badge-pos-below-before"
          position="below-before"
          >5</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-before"
          :aria-label="t('Before side', '前侧')"
        /><Badge
          for="badge-pos-before"
          position="before"
          >6</Badge
        ></span
      >
      <span class="badge-example__anchor"
        ><IconButton
          id="badge-pos-after"
          :aria-label="t('After side', '后侧')"
        /><Badge
          for="badge-pos-after"
          position="after"
          >7</Badge
        ></span
      >
    </div>
  </div>
</template>

<style scoped>
.badge-example__anchor {
  position: relative;
  display: inline-flex;
}
.badge-example__positions {
  flex-wrap: wrap;
  gap: 32px;
}
.badge-positions-example {
  display: grid;
  gap: 16px;
}
.badge-positions-example__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.badge-positions-example__header p {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
</style>
