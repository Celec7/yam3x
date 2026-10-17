<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import {
  BottomSheet,
  BottomSheetAction,
  type BottomSheetDetent,
} from '@registry/components/bottom-sheet'
import { SideSheet } from '@registry/components/side-sheet'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const standardOpen = ref(false)
const modalOpen = ref(false)
const wideSideSheetOpen = ref(false)
const standardDetent = ref<BottomSheetDetent>('fit')
const modalDetent = ref<BottomSheetDetent>('partially-expanded')
const modalClosable = ref(true)
const showHandle = ref(true)
const events = ref<string[]>([])
function record(event: string): void {
  events.value.push(event)
}
function guardClose(event: Event): void {
  record('closing')
  if (!modalClosable.value) event.preventDefault()
}
</script>

<template>
  <div class="yam3x-demo yam3x-bottom-sheet-demo">
    <Checkbox
      v-model="showHandle"
      :label="t('Show drag handle', '显示拖动手柄')"
    />
    <BottomSheet
      v-model:open="standardOpen"
      v-model:detent="standardDetent"
      :detents="['fit', 'partially-expanded', 'expanded']"
      :handle="showHandle"
      :label="t('Supporting panel', '辅助面板')"
      @opening="record('opening')"
      @opened="record('opened')"
      @closing="record('closing')"
      @closed="record('closed')"
    >
      <template #trigger="{ triggerProps }"
        ><Button
          v-bind="triggerProps"
          type="button"
          >{{ t('Open standard sheet', '打开标准底部表单') }}</Button
        ></template
      >
      <template #header>{{ t('Supporting panel', '辅助面板') }}</template>
      <p>
        {{
          t(
            'A standard sheet sits alongside page content, leaving the rest of the page interactive. Content wraps naturally and the sheet grows with it.',
            '标准底部表单与页面内容并存，页面其余部分仍可操作。内容可以自然换行，表单也会随内容增高。',
          )
        }}
      </p>
      <p>{{ t('Current detent:', '当前停靠点：') }} {{ standardDetent }}</p>
      <template #resize-control="{ resize }"
        ><Button
          type="button"
          :aria-label="t('Resize sheet', '调整表单高度')"
          style="min-width: 48px; min-height: 48px"
          @click="resize"
          >{{ t('Resize', '调整大小') }}</Button
        ></template
      >
      <template #collapse-action="{ collapse }"
        ><Button
          type="button"
          @click="collapse"
          >{{ t('Collapse', '收起') }}</Button
        ></template
      >
    </BottomSheet>
    <div class="bottom-sheet-demo__mobile-modal">
      <BottomSheet
        v-model:open="modalOpen"
        v-model:detent="modalDetent"
        variant="modal"
        :detents="['collapsed', 'partially-expanded', 'expanded']"
        :handle="showHandle"
        :label="t('Sharing settings', '分享设置')"
        @opening="record('opening')"
        @opened="record('opened')"
        @closing="guardClose"
        @closed="record('closed')"
        @cancel="record('cancel')"
      >
        <template #trigger="{ triggerProps }"
          ><Button
            v-bind="triggerProps"
            type="button"
            >{{ t('Open modal sheet', '打开模态底部表单') }}</Button
          ></template
        >
        <template #header>{{ t('Sharing settings', '分享设置') }}</template>
        <p>
          {{
            t(
              'A modal sheet temporarily blocks interaction with the background page. Its initial visible height is at most half the viewport.',
              '模态底部表单打开时会暂时阻止与背景页面交互。初始可见高度不超过视口的一半。',
            )
          }}
        </p>
        <Checkbox
          v-model="modalClosable"
          :label="t('Allow closing the modal sheet', '允许关闭模态底部表单')"
        />
        <div style="min-height: 340px">
          {{ t('Scrollable settings content goes here.', '这里是可独立滚动的设置内容。') }}
        </div>
        <template #resize-control="{ resize }"
          ><Button
            type="button"
            :aria-label="t('Resize sheet', '调整表单高度')"
            style="min-width: 48px; min-height: 48px"
            @click="resize"
            >{{ t('Toggle height', '切换高度') }}</Button
          ></template
        >
        <BottomSheetAction>{{ t('Done', '完成') }}</BottomSheetAction>
      </BottomSheet>
    </div>
    <div class="bottom-sheet-demo__wide-side-sheet">
      <SideSheet
        v-model:open="wideSideSheetOpen"
        mode="adaptive"
        :label="t('Sharing settings', '分享设置')"
        :close-label="t('Close sharing settings', '关闭分享设置')"
      >
        <template #toggle="{ expanded, controls, toggle }"
          ><Button
            type="button"
            :aria-expanded="expanded"
            :aria-controls="controls"
            @click="toggle"
            >{{
              expanded
                ? t('Close sharing settings', '关闭分享设置')
                : t('Open sharing settings', '打开分享设置')
            }}</Button
          ></template
        >
        <main>
          <h3>{{ t('Page content', '页面内容') }}</h3>
          <p>
            {{
              t(
                'At wider window sizes, use a Side sheet for contextual settings.',
                '在较宽窗口中，使用 Side sheet 呈现上下文设置。',
              )
            }}
          </p>
        </main>
        <template #headline>{{ t('Sharing settings', '分享设置') }}</template>
        <template #sheet
          ><p>
            {{
              t(
                'A side sheet keeps related settings beside the page.',
                'Side sheet 将相关设置放在页面旁边。',
              )
            }}
          </p></template
        >
      </SideSheet>
    </div>
    <p role="status">
      {{ t('Standard sheet:', '标准底部表单：') }}
      {{ standardOpen ? t('Open', '打开') : t('Closed', '关闭') }}；{{
        t('Modal sheet:', '模态底部表单：')
      }}
      {{ modalOpen ? t('Open', '打开') : t('Closed', '关闭') }}
    </p>
    <p role="log">{{ t('Events:', '事件：') }} {{ events.join(' → ') || t('None', '无') }}</p>
  </div>
</template>

<style scoped>
.bottom-sheet-demo__wide-side-sheet {
  display: none;
}
@media (min-width: 600px) {
  .bottom-sheet-demo__mobile-modal {
    display: none;
  }
  .bottom-sheet-demo__wide-side-sheet {
    display: block;
  }
}
</style>
