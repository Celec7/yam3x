<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import {
  Option,
  OptionGroup,
  OptionPanel,
  type OptionSelectionDetail,
} from '@registry/components/option'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const anchor = ref<HTMLButtonElement | null>(null)
const panelRef = ref<{ show: () => void; hide: () => void; toggle: () => void } | null>(null)
const open = ref(false)
const selected = ref('all')
const panelMode = ref<'options' | 'loading' | 'empty'>('options')
const options = [
  { value: 'all', label: t('All projects', '所有项目') },
  { value: 'recent', label: t('Recently opened', '最近打开') },
  { value: 'shared', label: t('Shared with me', '与我共享') },
  { value: 'archived', label: t('Archived', '已归档'), disabled: true },
]
const status = ref('')
const selectionSource = ref('')
function setAnchor(component: unknown) {
  const element =
    component instanceof HTMLButtonElement
      ? component
      : (component as { $el?: unknown } | null)?.$el
  anchor.value = element instanceof HTMLButtonElement ? element : null
}

function toggle() {
  panelRef.value?.toggle()
}
async function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    panelRef.value?.hide()
    return
  }
  if (event.key !== 'ArrowDown' || open.value) return
  event.preventDefault()
  if (!open.value) {
    panelRef.value?.show()
    const panel = document.getElementById('option-panel-demo')
    for (
      let frame = 0;
      panel && open.value && getComputedStyle(panel).visibility === 'hidden' && frame < 60;
      frame++
    ) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }
    if (open.value)
      panel?.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])')?.focus()
  }
}
function choose(detail: OptionSelectionDetail) {
  selected.value = detail.value
  selectionSource.value = detail.source
  status.value = `${t('Current selection:', '当前选择：')} ${options.find((option) => option.value === detail.value)?.label}`
  panelRef.value?.hide()
  anchor.value?.focus()
}
function onPanelKeydown(event: KeyboardEvent) {
  const items = [
    ...document.querySelectorAll<HTMLElement>(
      '#option-panel-demo [role="option"]:not([aria-disabled="true"])',
    ),
  ]
  const current = items.indexOf(document.activeElement as HTMLElement)
  if (event.key === 'Escape') {
    event.preventDefault()
    panelRef.value?.hide()
    anchor.value?.focus()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(current + step + items.length) % items.length]?.focus()
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
  } else if (event.key === 'Tab') panelRef.value?.hide()
}
</script>

<template>
  <div class="yam3x-demo option-demo">
    <label
      id="option-trigger-label"
      class="option-demo__label"
      >{{ t('Project view', '项目视图') }}</label
    >
    <label class="option-demo__mode"
      >{{ t('Panel content', '面板内容') }}
      <Select
        v-model="panelMode"
        :aria-label="t('Panel content', '面板内容')"
      >
        <Option
          value="options"
          :label="t('Options', '选项')"
        />
        <Option
          value="loading"
          :label="t('Loading', '加载中')"
        />
        <Option
          value="empty"
          :label="t('No results', '无结果')"
        />
      </Select>
    </label>
    <Button
      :ref="setAnchor"
      class="option-demo__trigger"
      variant="outlined"
      size="medium"
      aria-haspopup="listbox"
      :aria-expanded="open"
      aria-controls="option-panel-demo"
      aria-labelledby="option-trigger-label"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      {{ options.find((option) => option.value === selected)?.label }}
      <Icon
        aria-hidden="true"
        name="expand_more"
      />
    </Button>
    <OptionPanel
      id="option-panel-demo"
      ref="panelRef"
      v-model:open="open"
      :anchor="anchor"
      :label="t('Project view options', '项目视图选项')"
      :loading="panelMode === 'loading'"
      :empty="panelMode === 'empty'"
      @keydown="onPanelKeydown"
    >
      <OptionGroup :label="t('Projects', '项目')">
        <Option
          v-for="(option, index) in options"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :selected="selected === option.value"
          :disabled="option.disabled"
          :first="index === 0"
          :last="index === options.length - 1"
          @select="choose"
        />
      </OptionGroup>
    </OptionPanel>
    <p
      class="yam3x-demo__status"
      role="status"
    >
      {{ status }}
    </p>
    <output data-testid="option-selection-source"
      >{{ t('Last selection source:', '最近选择来源：') }}
      {{ selectionSource || t('None selected', '未选择') }}</output
    >
  </div>
</template>

<style scoped>
.option-demo {
  position: relative;
  display: grid;
  justify-items: start;
  gap: 12px;
}
.option-demo__label {
  color: var(--md-sys-color-on-surface-variant);
}
.option-demo__mode {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.option-demo__trigger {
  gap: 24px;
  min-inline-size: 220px;
  justify-content: space-between;
}
.option-demo__trigger svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}
</style>
