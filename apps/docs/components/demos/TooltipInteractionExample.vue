<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import { Checkbox } from '@registry/components/checkbox'
import { Option } from '@registry/components/option'
import { Select } from '@registry/components/select'
import { Tooltip } from '@registry/components/tooltip'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const delay = ref<'0' | '400' | '1200'>('400')
const rtl = ref(false)
const showDelay = computed(() => Number(delay.value))
</script>

<template>
  <section
    class="tooltip-interaction-demo"
    data-testid="tooltip-interaction-example"
  >
    <div class="tooltip-interaction-demo__row">
      <label class="tooltip-interaction-demo__field">
        <span>{{ t('Opening delay', '打开延迟') }}</span>
        <Select
          v-model="delay"
          :aria-label="t('Opening delay', '打开延迟')"
        >
          <Option
            value="0"
            :label="`${t('None', '无')} · 0ms`"
          />
          <Option
            value="400"
            :label="`400ms`"
          />
          <Option
            value="1200"
            :label="`1200ms`"
          />
        </Select>
      </label>
      <Button
        id="tooltip-delay-trigger"
        variant="filled-tonal"
        type="button"
        :aria-label="t('Delayed tooltip', '延迟提示')"
        >{{ t('Delayed tooltip', '延迟提示') }}</Button
      >
      <Tooltip
        for="tooltip-delay-trigger"
        :show-delay="showDelay"
      >
        {{ t('This message opens after the selected delay.', '此消息会在所选延迟后打开。') }}
      </Tooltip>
    </div>

    <div class="tooltip-interaction-demo__row">
      <Button
        id="tooltip-disabled-trigger"
        variant="outlined"
        type="button"
        :aria-label="t('Tooltip disabled', '提示已禁用')"
        >{{ t('Tooltip disabled', '提示已禁用') }}</Button
      >
      <Tooltip
        for="tooltip-disabled-trigger"
        disabled
      >
        {{ t('A disabled tooltip never opens.', '禁用的提示不会打开。') }}
      </Tooltip>
      <span class="tooltip-interaction-demo__hint">{{
        t(
          'Hover or focus the control: no tooltip appears while disabled is set.',
          '悬停或聚焦该控件：设置 disabled 后不会出现提示。',
        )
      }}</span>
    </div>

    <div class="tooltip-interaction-demo__row">
      <Button
        id="tooltip-long-trigger"
        variant="outlined"
        type="button"
        :aria-label="t('Release notes', '发布说明')"
        >{{ t('Release notes', '发布说明') }}</Button
      >
      <Tooltip
        for="tooltip-long-trigger"
        class="tooltip-interaction-demo__wide"
      >
        {{
          t(
            'Long supporting text wraps inside the plain tooltip instead of being clipped, so short explanations can stay in place.',
            '较长的正文会在普通提示内换行而不是被裁切，因此简短说明仍可放在原地。',
          )
        }}
      </Tooltip>
    </div>

    <div
      class="tooltip-interaction-demo__row"
      :dir="rtl ? 'rtl' : 'ltr'"
    >
      <Button
        id="tooltip-rtl-trigger"
        variant="outlined"
        type="button"
        :aria-label="t('Aligned tooltip', '对齐提示')"
        >{{ t('Aligned tooltip', '对齐提示') }}</Button
      >
      <Tooltip
        for="tooltip-rtl-trigger"
        position="after"
      >
        {{ t('after follows the reading direction.', 'after 会随阅读方向变化。') }}
      </Tooltip>
      <Checkbox
        v-model="rtl"
        :label="t('Right-to-left (RTL)', '从右到左 (RTL)')"
      />
    </div>
  </section>
</template>

<style scoped>
.tooltip-interaction-demo {
  display: grid;
  gap: 24px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  color: var(--md-sys-color-on-surface);
}
.tooltip-interaction-demo__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.tooltip-interaction-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tooltip-interaction-demo__hint {
  color: var(--md-sys-color-on-surface-variant);
}
.tooltip-interaction-demo__wide {
  --yam3x-tooltip-max-width: 260px;
}
</style>
