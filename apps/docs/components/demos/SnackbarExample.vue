<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Slider } from '@registry/components/slider'
import SnackbarControls from './SnackbarControls.vue'
import { SnackbarProvider } from '@registry/components/snackbar'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const alignment = ref<'center' | 'start'>('center')
const bottomOffset = ref(0)
const anchorEnabled = ref(false)
const anchorElement = ref<HTMLElement | null>(null)
</script>

<template>
  <div class="vp-raw">
    <SnackbarProvider
      :alignment="alignment"
      :anchor="anchorEnabled ? anchorElement : null"
      :bottom-offset="bottomOffset"
    >
      <div class="yam3x-snackbar-demo__host-settings">
        <label
          >{{ t('Alignment', '对齐方式') }}
          <Select v-model="alignment">
            <Option
              value="center"
              :label="t('Center', '居中')"
            />
            <Option
              value="start"
              :label="t('Start', '起始边')"
            />
          </Select>
        </label>
        <label
          >{{ t('Bottom offset', '底部避让') }}
          <Slider
            v-model="bottomOffset"
            :aria-label="t('Bottom offset', '底部避让')"
            :min="0"
            :max="160"
          />
          <span aria-hidden="true">{{ bottomOffset }}px</span>
        </label>
      </div>
      <SnackbarControls>
        <div
          v-if="anchorEnabled"
          ref="anchorElement"
          class="yam3x-snackbar-demo__anchor"
        >
          <Button
            variant="filled-tonal"
            size="small"
            type="button"
          >
            {{ t('Snackbar anchor button', 'Snackbar 锚点按钮') }}
          </Button>
        </div>
      </SnackbarControls>
      <label class="yam3x-snackbar-demo__anchor-toggle">
        <input
          v-model="anchorEnabled"
          type="checkbox"
        />
        {{ t('Anchor snackbar above demo button', '在示例按钮上方显示通知') }}
      </label>
    </SnackbarProvider>
  </div>
</template>

<style scoped>
.yam3x-snackbar-demo__host-settings {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-block-end: 16px;
}
.yam3x-snackbar-demo__anchor {
  display: flex;
  width: fit-content;
  justify-content: flex-end;
  margin: 16px 24px 0 auto;
}
.yam3x-snackbar-demo__anchor-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block-start: 16px;
}
.yam3x-snackbar-demo__host-settings label {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
