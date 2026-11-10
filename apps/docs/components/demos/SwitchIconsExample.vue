<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Switch } from '@registry/components/switch'
import { useDemoDirection } from './use-demo-direction'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const { direction, dir, toggle } = useDemoDirection()

const noneMode = ref(true)
const selectedMode = ref(true)
const bothMode = ref(false)
const directional = ref(true)
</script>

<template>
  <section
    data-testid="switch-icons"
    class="yam3x-demo yam3x-demo__stack switch-icons-demo"
  >
    <div class="switch-icons-demo__gallery">
      <Switch
        v-model="noneMode"
        icons="none"
        :label="t('Icons off', '无图标')"
        :description="t('Neither state shows a track icon', '两种状态都不显示图标')"
      />
      <Switch
        v-model="selectedMode"
        icons="selected"
        :label="t('Selected icon only', '仅选中图标')"
        :description="
          t('The check icon appears only when the setting is on', '仅开启时显示对勾图标')
        "
      />
      <Switch
        v-model="bothMode"
        icons="both"
        :label="t('Icons in both states', '两种状态都显示图标')"
        :description="
          t('A check or close icon always shows the state', '始终用对勾或关闭图标表示状态')
        "
      />
    </div>
    <div class="switch-icons-demo__rtl">
      <Switch
        v-model="directional"
        :dir="dir"
        icons="both"
        :label="t('Writing direction', '书写方向')"
        :description="
          t('The handle follows the resolved direction', '滑块位置跟随解析后的书写方向')
        "
      />
      <Button
        variant="outlined"
        type="button"
        @click="toggle"
        >{{ t('Toggle direction', '切换方向') }}</Button
      >
      <p class="yam3x-demo__status">
        {{ t('Direction:', '方向：') }} {{ direction.toUpperCase() }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.switch-icons-demo__gallery,
.switch-icons-demo__rtl {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.switch-icons-demo__rtl {
  padding-block-start: 16px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}
</style>
