<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { SplitButton, type ButtonSize, type MenuItem } from '@registry/components/split-button'
import Button from '@registry/components/button/button.vue'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const open = ref(false)
const variant = ref<'elevated' | 'filled' | 'filled-tonal' | 'outlined'>('filled')
const shape = ref<'round' | 'square'>('round')
const requestedSize = ref<ButtonSize>('small')
const responsive = ref(true)
const viewport = ref<'compact' | 'medium' | 'expanded' | 'large'>('compact')
const selected = ref('document')
const primaryActionCount = ref(0)
const isRtl = ref(false)
const positionX = ref<'after' | 'before'>('after')
const positionY = ref<'below' | 'above'>('below')
const menuTransitions = ref<string[]>([])
let compactQuery: MediaQueryList | undefined
let expandedQuery: MediaQueryList | undefined
let largeQuery: MediaQueryList | undefined

const size = computed<ButtonSize>(() => {
  if (!responsive.value) return requestedSize.value
  if (viewport.value === 'large') return 'large'
  return viewport.value === 'compact' ? 'small' : 'medium'
})
const items: MenuItem[] = [
  { value: 'document', label: t('Save document', '保存文档'), type: 'radio', group: 'format' },
  { value: 'image', label: t('Export as image', '导出为图片'), type: 'radio', group: 'format' },
  { value: 'separator', type: 'divider' },
  { value: 'copy', label: t('Save a copy', '保存副本') },
]

function updateViewport() {
  viewport.value = largeQuery?.matches
    ? 'large'
    : expandedQuery?.matches
      ? 'expanded'
      : compactQuery?.matches
        ? 'medium'
        : 'compact'
}
function listenForViewport() {
  compactQuery = window.matchMedia('(min-width: 600px)')
  expandedQuery = window.matchMedia('(min-width: 840px)')
  largeQuery = window.matchMedia('(min-width: 1200px)')
  updateViewport()
  compactQuery.addEventListener('change', updateViewport)
  expandedQuery.addEventListener('change', updateViewport)
  largeQuery.addEventListener('change', updateViewport)
}
function stopListeningForViewport() {
  compactQuery?.removeEventListener('change', updateViewport)
  expandedQuery?.removeEventListener('change', updateViewport)
  largeQuery?.removeEventListener('change', updateViewport)
}
function runPrimaryAction() {
  primaryActionCount.value++
}
function recordMenuTransition(opened: boolean) {
  menuTransitions.value = [...menuTransitions.value.slice(-3), opened ? 'open' : 'closed']
}

onMounted(listenForViewport)
onBeforeUnmount(stopListeningForViewport)
</script>

<template>
  <div
    class="yam3x-demo split-demo"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <div class="split-demo__controls">
      <label
        >{{ t('Color', '颜色') }}
        <Select
          v-model="variant"
          :aria-label="t('Split button color', '分体按钮颜色')"
        >
          <Option
            value="elevated"
            :label="t('Elevated', '浮起')"
          /><Option
            value="filled"
            :label="t('Filled', '填充')"
          /><Option
            value="filled-tonal"
            :label="t('Tonal', '柔和')"
          /><Option
            value="outlined"
            :label="t('Outlined', '轮廓')"
          />
        </Select>
      </label>
      <label
        >{{ t('Shape', '形状') }}
        <Select
          v-model="shape"
          :aria-label="t('Split button shape', '分体按钮形状')"
          ><Option
            value="round"
            :label="t('Rounded', '圆角')" /><Option
            value="square"
            :label="t('Square (project extension)', '方角（项目扩展）')"
        /></Select>
      </label>
      <Checkbox
        v-model="responsive"
        :label="t('Adjust size to window width', '按窗口宽度调整尺寸')"
      />
      <label v-if="!responsive"
        >{{ t('Size', '尺寸') }}
        <Select
          v-model="requestedSize"
          :aria-label="t('Split button size', '分体按钮尺寸')"
        >
          <Option
            value="extra-small"
            label="XS"
          /><Option
            value="small"
            label="S"
          /><Option
            value="medium"
            label="M"
          /><Option
            value="large"
            label="L"
          /><Option
            value="extra-large"
            label="XL"
          />
        </Select>
      </label>
      <Checkbox
        v-model="isRtl"
        :label="t('Right-to-left (RTL)', '从右到左 (RTL)')"
      />
      <label
        >{{ t('Menu edge', '菜单对齐边') }}
        <Select
          v-model="positionX"
          :aria-label="t('Menu edge', '菜单对齐边')"
          ><Option
            value="after"
            :label="t('Trailing edge', '行末边')" /><Option
            value="before"
            :label="t('Leading edge', '行首边')"
        /></Select>
      </label>
      <label
        >{{ t('Menu side', '菜单方向') }}
        <Select
          v-model="positionY"
          :aria-label="t('Menu side', '菜单方向')"
          ><Option
            value="below"
            :label="t('Below', '下方')" /><Option
            value="above"
            :label="t('Above', '上方')"
        /></Select>
      </label>
    </div>

    <div class="split-demo__row">
      <SplitButton
        v-model:open="open"
        :label="t('Save', '保存')"
        :items="items"
        :variant="variant"
        :size="size"
        :shape="shape"
        :menu-label="t('Save options', '保存选项')"
        :group-label="t('Save actions', '保存操作')"
        :position-x="positionX"
        :position-y="positionY"
        @click="runPrimaryAction"
        @toggle="(event) => recordMenuTransition(event.detail.open)"
        @select="
          (item: MenuItem) => {
            if (item.type === 'radio') selected = item.value
          }
        "
      >
        <template #icon><Icon name="save" /></template>
        <template #menu-icon="{ item }"
          ><Icon
            v-if="item.type === 'radio' && item.value === selected"
            class="split-demo__check"
            name="check"
        /></template>
      </SplitButton>
      <Button
        :variant="variant"
        :size="size"
        @click="runPrimaryAction"
        >{{ t('Share', '分享') }}</Button
      >
      <IconButton
        :variant="
          variant === 'filled-tonal' ? 'tonal' : variant === 'elevated' ? 'filled' : variant
        "
        :size="size"
        :aria-label="t('More page actions', '更多页面操作')"
        ><Icon name="more_horiz"
      /></IconButton>
    </div>

    <div class="split-demo__row">
      <output data-testid="split-button-state"
        >{{ t('Primary action run', '主操作已执行') }} {{ primaryActionCount }} ·
        {{ open ? t('Menu open', '菜单展开') : t('Menu closed', '菜单关闭') }} · {{ size }} ·
        {{ menuTransitions.join(' → ') }}</output
      >
      <Button
        type="button"
        class="split-demo__external-toggle"
        @click="open = true"
        >{{ t('Open menu externally', '外部打开菜单') }}</Button
      >
      <Button
        type="button"
        class="split-demo__external-toggle"
        @click="open = false"
        >{{ t('Close menu externally', '外部关闭菜单') }}</Button
      >
    </div>
  </div>
</template>

<style scoped>
.split-demo {
  display: grid;
  gap: 20px;
  min-block-size: 280px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.split-demo__controls,
.split-demo__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.split-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.split-demo__row {
  position: relative;
  min-block-size: 72px;
  gap: 16px;
}
.split-demo svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
.split-demo__check {
  display: inline-grid;
  place-items: center;
  inline-size: 20px;
  font-weight: 700;
}
.split-demo output {
  color: var(--md-sys-color-on-surface-variant);
}
</style>
