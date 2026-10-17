<script setup lang="ts">
import { ref } from 'vue'
import Button from '@registry/components/button/button.vue'
import { RichTooltip, RichTooltipAction, Tooltip } from '@registry/components/tooltip'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const helpOpen = ref(false)
const featureOpen = ref(false)
const persistentOpen = ref(false)
const lastAction = ref('')

function recordAction(action: string): void {
  lastAction.value = action
  featureOpen.value = false
}
</script>

<template>
  <section class="grid gap-8 rounded-3xl border border-outline-variant p-6 text-on-surface">
    <div class="flex flex-wrap items-center gap-4">
      <Button
        id="tooltip-help-trigger"
        variant="filled-tonal"
        type="button"
        :aria-label="t('Help', '帮助')"
        >?</Button
      >
      <Tooltip
        v-model:open="helpOpen"
        for="tooltip-help-trigger"
        >{{ t('Help', '帮助') }}</Tooltip
      >
      <span>{{
        t(
          'Hover over or keyboard-focus the icon to see its help tooltip.',
          '将鼠标悬停或用键盘聚焦带有帮助提示的图标。',
        )
      }}</span>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <Button
        id="tooltip-info-trigger"
        variant="filled-tonal"
        type="button"
        :aria-label="t('More information', '更多信息')"
        >i</Button
      >
      <Tooltip
        for="tooltip-info-trigger"
        position="below"
        >{{ t('More info', '更多信息') }}</Tooltip
      >
    </div>

    <header class="flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant p-3">
      <Button
        id="tooltip-header-trigger"
        variant="text"
        type="button"
        :aria-label="t('Toolbar actions', '工具栏操作')"
        >⋯</Button
      >
      <Tooltip for="tooltip-header-trigger">{{ t('Toolbar actions', '工具栏操作') }}</Tooltip>
    </header>

    <div class="flex flex-wrap items-center gap-4">
      <Button
        id="tooltip-rich-transient-trigger"
        variant="outlined"
        type="button"
        :aria-label="t('Sync status', '同步状态')"
        >{{ t('Sync status', '同步状态') }}</Button
      >
      <RichTooltip
        for="tooltip-rich-transient-trigger"
        position="below"
      >
        <template #subhead>{{ t('Sync complete', '已完成同步') }}</template>
        {{ t('The last sync finished a few seconds ago.', '最近一次同步在几秒前完成。') }}
      </RichTooltip>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <Button
        id="tooltip-feature-trigger"
        variant="outlined"
        type="button"
        :aria-label="t('New sharing features', '新共享功能')"
        >{{ t('Sharing settings', '共享设置') }}</Button
      >
      <RichTooltip
        v-model:open="featureOpen"
        for="tooltip-feature-trigger"
        :aria-label="t('New sharing features', '新共享功能')"
      >
        <template #subhead>{{ t('New sharing settings', '新的共享设置') }}</template>
        {{
          t(
            'Adjust image quality and manage storage for shared albums.',
            '调整图片质量并管理共享相册的存储空间。',
          )
        }}
        <template #actions>
          <Button
            variant="text"
            size="extra-small"
            type="button"
            @click="recordAction(t('Later', '稍后'))"
            ><RichTooltipAction>{{ t('Later', '稍后') }}</RichTooltipAction></Button
          >
          <Button
            variant="text"
            size="extra-small"
            type="button"
            @click="recordAction(t('Learn more', '了解详情'))"
            ><RichTooltipAction>{{ t('Learn more', '了解详情') }}</RichTooltipAction></Button
          >
        </template>
      </RichTooltip>
      <output aria-live="polite">{{
        lastAction
          ? `${t('Selected:', '已选择：')} ${lastAction}`
          : t('Select the control to open a tooltip with actions', '点按控件可打开带操作的说明')
      }}</output>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <Button
        id="tooltip-persistent-trigger"
        variant="text"
        type="button"
        :aria-label="t('Show persistent tooltip', '显示固定说明')"
        >{{ t('Persistent tooltip', '固定说明') }}</Button
      >
      <RichTooltip
        v-model:open="persistentOpen"
        for="tooltip-persistent-trigger"
        persistent
        position="below-after"
      >
        <template #subhead>{{ t('Persistent tooltip', '持续显示的说明') }}</template>
        {{
          t(
            'The tooltip closes when you click elsewhere or focus another control.',
            '点击页面其他位置或聚焦其他控件后，提示会关闭。',
          )
        }}
      </RichTooltip>
    </div>
  </section>
</template>
