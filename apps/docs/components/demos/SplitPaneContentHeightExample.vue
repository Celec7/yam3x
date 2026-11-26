<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { SplitPane } from '@registry/components/split-pane'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const value = ref(40)
const pane = ref<InstanceType<typeof SplitPane> | null>(null)
</script>

<template>
  <div class="split-pane-content-demo">
    <div class="split-pane-content-demo__actions">
      <Button
        type="button"
        @click="pane?.collapse()"
        >{{ t('Collapse start pane', '收起起始窗格') }}</Button
      >
      <Button
        type="button"
        @click="pane?.snapToValue(40)"
        >{{ t('Restore 40%', '恢复 40%') }}</Button
      >
    </div>
    <div
      class="split-pane-content-demo__scroll"
      data-testid="content-height-scroll"
    >
      <SplitPane
        ref="pane"
        v-model="value"
        content-height
        label="Content height panes"
        :value-text="
          t(
            `Start pane ${value}%, end pane ${100 - value}%`,
            `起始窗格 ${value}%，结束窗格 ${100 - value}%`,
          )
        "
        :min="0"
        :max="100"
        :detents="[0, 40, 100]"
      >
        <template #start>
          <section class="split-pane-content-demo__pane">
            <h3>{{ t('Directory', '目录') }}</h3>
            <p
              v-for="index in 14"
              :key="index"
            >
              {{ t('Directory row', '目录行') }} {{ index }}
            </p>
          </section>
        </template>
        <template #end>
          <section class="split-pane-content-demo__pane">
            <h3>{{ t('Details', '详情') }}</h3>
            <p
              v-for="index in 20"
              :key="index"
            >
              {{ t('Detail row', '详情行') }} {{ index }}
            </p>
            <p data-testid="content-height-end">{{ t('End of details', '详情结束') }}</p>
          </section>
        </template>
      </SplitPane>
    </div>
  </div>
</template>

<style scoped>
.split-pane-content-demo {
  display: grid;
  gap: 12px;
}
.split-pane-content-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.split-pane-content-demo__scroll {
  max-block-size: 22rem;
  overflow: auto;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  background: var(--md-sys-color-surface);
}
.split-pane-content-demo__pane {
  min-block-size: 100%;
  padding: 16px;
}
.split-pane-content-demo__pane h3 {
  margin-block: 0 12px;
}
</style>
