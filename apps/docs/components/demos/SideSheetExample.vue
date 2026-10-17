<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Checkbox } from '@registry/components/checkbox'
import { SideSheet } from '@registry/components/side-sheet'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const open = ref(false)
const mode = ref<'adaptive' | 'modal' | 'standard'>('adaptive')
const direction = ref<'ltr' | 'rtl'>('ltr')
const previewSize = ref<'container' | 'medium' | 'expanded'>('container')
const showPageTitle = ref(true)
const density = ref<'standard' | 'compact'>('standard')
const previewInlineSize = computed(
  () => ({ container: '100%', medium: '640px', expanded: '960px' })[previewSize.value],
)
</script>

<template>
  <div class="side-sheet-demo">
    <label class="side-sheet-demo__mode">
      <span>{{ t('Display mode', '显示模式') }}</span>
      <Select
        v-model="mode"
        :aria-label="t('Display mode', '显示模式')"
      >
        <Option
          value="adaptive"
          :label="t('Adaptive (modal on narrow screens)', '自适应（窄屏模态）')"
        />
        <Option
          value="modal"
          :label="t('Modal', '模态')"
        />
        <Option
          value="standard"
          :label="t('Standard (wide screens)', '标准（宽屏）')"
        />
      </Select>
    </label>
    <label class="side-sheet-demo__mode">
      <span>{{ t('Direction', '方向') }}</span>
      <Select
        v-model="direction"
        :aria-label="t('Direction', '方向')"
      >
        <Option
          value="ltr"
          :label="t('Left to right (LTR)', '从左到右 (LTR)')"
        />
        <Option
          value="rtl"
          :label="t('Right to left (RTL)', '从右到左 (RTL)')"
        />
      </Select>
    </label>
    <label class="side-sheet-demo__mode">
      <span>{{ t('Preview container', '预览容器') }}</span>
      <Select
        v-model="previewSize"
        :aria-label="t('Preview container', '预览容器')"
      >
        <Option
          value="container"
          :label="t('Current container width', '当前容器宽度')"
        />
        <Option
          value="medium"
          :label="`${t('Medium', '中等')} · 640px`"
        />
        <Option
          value="expanded"
          :label="`${t('Expanded', '展开')} · 960px`"
        />
      </Select>
    </label>
    <div
      class="side-sheet-demo__scroll"
      role="region"
      :aria-label="t('Horizontally scrollable side sheet preview', '可横向滚动的侧边表单预览')"
      tabindex="0"
    >
      <div
        class="side-sheet-demo__frame"
        :style="{ inlineSize: previewInlineSize }"
        :dir="direction"
      >
        <SideSheet
          v-model:open="open"
          :mode="mode"
          :label="t('Page settings', '页面设置')"
          :close-label="t('Close page settings', '关闭页面设置')"
        >
          <template #toggle="{ expanded, controls, toggle }">
            <Button
              type="button"
              :aria-expanded="expanded"
              :aria-controls="controls"
              @click="toggle"
              >{{
                expanded ? t('Close settings', '关闭设置') : t('Open settings', '打开设置')
              }}</Button
            >
          </template>
          <main class="side-sheet-demo__main">
            <h3>{{ t('Main content', '主内容') }}</h3>
            <p>
              {{
                t(
                  'The main content remains interactive with a standard side sheet open. Narrow the example to see adaptive mode switch to a modal side sheet.',
                  '标准侧边表单打开时，主内容仍可操作。缩窄示例区域可查看自适应模式切换为模态侧边表单。',
                )
              }}
            </p>
            <Button
              type="button"
              @click="open = !open"
              >{{
                open
                  ? t('Close from main content', '从主内容关闭')
                  : t('Open from main content', '从主内容打开')
              }}</Button
            >
          </main>
          <template #headline>{{ t('Page settings', '页面设置') }}</template>
          <template #sheet>
            <p>
              {{
                t(
                  'A side sheet holds supporting settings in context with the current page.',
                  '侧边表单承载辅助设置，与当前页面内容保持上下文关系。',
                )
              }}
            </p>
            <Checkbox
              v-model="showPageTitle"
              :label="t('Show page title', '显示页面标题')"
            />
            <p>
              <label
                >{{ t('Density', '密度') }}
                <Select
                  v-model="density"
                  :aria-label="t('Density', '密度')"
                  ><Option
                    value="standard"
                    :label="t('Standard', '标准')" /><Option
                    value="compact"
                    :label="t('Compact', '紧凑')" /></Select
              ></label>
            </p>
          </template>
          <template #actions
            ><Button
              type="button"
              @click="open = false"
              >{{ t('Apply', '应用') }}</Button
            ></template
          >
        </SideSheet>
      </div>
    </div>
  </div>
</template>

<style scoped>
.side-sheet-demo {
  display: grid;
  gap: 12px;
}
.side-sheet-demo__mode {
  display: flex;
  align-items: center;
  gap: 12px;
}
.side-sheet-demo__scroll {
  max-inline-size: 100%;
  overflow: auto;
  overscroll-behavior: contain;
}
.side-sheet-demo__frame {
  block-size: 480px;
  min-inline-size: 0;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
}
.side-sheet-demo__frame :deep(.yam3x-drawer) {
  block-size: 100%;
}
.side-sheet-demo__main {
  box-sizing: border-box;
  min-block-size: 100%;
  padding: 24px;
  background: var(--md-sys-color-surface);
}
.side-sheet-demo__main p {
  max-inline-size: 36rem;
  line-height: 1.6;
}
</style>
