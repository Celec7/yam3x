<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { OptionPanel } from '@registry/components/option'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const anchor = ref<HTMLButtonElement | null>(null)
const panelRef = ref<{
  panel: HTMLElement | null
  positioned: boolean
  show: () => void
  hide: () => void
  toggle: () => void
} | null>(null)
const open = ref(false)
const showArchived = ref(false)
const showShared = ref(true)

function setAnchor(component: unknown): void {
  const element =
    component instanceof HTMLButtonElement
      ? component
      : (component as { $el?: unknown } | null)?.$el
  anchor.value = element instanceof HTMLButtonElement ? element : null
}
function toggle(): void {
  panelRef.value?.toggle()
}
function close(returnFocus = true): void {
  panelRef.value?.hide()
  if (returnFocus) void nextTick(() => anchor.value?.focus())
}
function focusFirstControl(): void {
  panelRef.value?.panel?.querySelector<HTMLElement>('input, button')?.focus()
}
watch(
  () => panelRef.value?.positioned,
  (positioned) => {
    if (positioned) void nextTick(focusFirstControl)
  },
)
function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}
function onPanelFocusout(event: FocusEvent): void {
  const next = event.relatedTarget
  if (!(next instanceof Node)) return
  if (panelRef.value?.panel?.contains(next) || anchor.value?.contains(next)) return
  close(false)
}
function onPanelClosed(): void {
  const active = document.activeElement
  if (panelRef.value?.panel?.contains(active)) anchor.value?.focus()
}
</script>

<template>
  <section
    class="option-dialog"
    data-testid="option-dialog"
  >
    <Button
      :ref="setAnchor"
      variant="outlined"
      aria-haspopup="dialog"
      :aria-expanded="open"
      aria-controls="option-dialog-panel"
      @click="toggle"
    >
      {{ t('Filter columns', '筛选列') }}
    </Button>
    <OptionPanel
      id="option-dialog-panel"
      ref="panelRef"
      v-model:open="open"
      :anchor="anchor"
      role="dialog"
      :label="t('Column filters', '列筛选')"
      :fit-anchor-width="false"
      @keydown="onPanelKeydown"
      @focusout="onPanelFocusout"
      @close="onPanelClosed"
    >
      <div class="option-dialog__content">
        <p class="option-dialog__title">{{ t('Column filters', '列筛选') }}</p>
        <Checkbox
          v-model="showArchived"
          :label="t('Show archived projects', '显示已归档项目')"
        />
        <Checkbox
          v-model="showShared"
          :label="t('Show projects shared with me', '显示与我共享的项目')"
        />
        <div class="option-dialog__actions">
          <Button
            variant="text"
            @click="close"
            >{{ t('Apply filters', '应用筛选') }}</Button
          >
        </div>
      </div>
    </OptionPanel>
    <p class="yam3x-demo__status">
      {{ t('Showing:', '正在显示：') }}
      {{ showArchived ? t('archived', '已归档') : t('active', '进行中') }},
      {{ showShared ? t('shared', '共享') : t('owned', '自有') }}
    </p>
  </section>
</template>

<style scoped>
.option-dialog {
  display: grid;
  justify-items: start;
  gap: 12px;
  min-inline-size: 0;
}
.option-dialog p {
  margin: 0;
}
.option-dialog__content {
  display: grid;
  gap: 12px;
  min-inline-size: 14rem;
  padding: 4px;
}
.option-dialog__title {
  font: var(--md-sys-typescale-title-small);
}
.option-dialog__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
