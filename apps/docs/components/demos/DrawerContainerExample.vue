<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Slider } from '@registry/components/slider'
import { DrawerContainer, type DrawerMode } from '@registry/components/drawer-container'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const mode = ref<DrawerMode>('overlay')
const endMode = ref<DrawerMode>('overlay')
const open = ref(false)
const endOpen = ref(false)
const frameWidth = ref(960)
const autoCompactBreakpoint = ref(600)
const autoBreakpoint = ref(840)
const direction = ref<'ltr' | 'rtl'>('ltr')
const selected = ref('home')
const events = ref<string[]>([])
function record(edge: string, state: boolean, reason: string) {
  events.value.push(`${edge}:${state ? 'open' : 'closed'}:${reason}`)
}
function selectDestination(item: string) {
  selected.value = item
  if (mode.value === 'overlay' || (mode.value === 'auto' && frameWidth.value < 600))
    open.value = false
}
</script>

<template>
  <div class="drawer-demo">
    <div class="drawer-demo__controls">
      <label
        >{{ t('Mode', '模式') }}
        <Select
          v-model="mode"
          :aria-label="t('Drawer mode', '抽屉模式')"
        >
          <Option
            value="overlay"
            :label="t('Overlay', '浮层')"
          /><Option
            value="push"
            :label="t('Push', '推挤')"
          /><Option
            value="side"
            :label="t('Side', '侧栏')"
          /><Option
            value="auto"
            :label="t('Auto', '自动')"
          />
        </Select>
      </label>
      <label
        >{{ t('Supporting pane mode', '辅助面板模式') }}
        <Select
          v-model="endMode"
          :aria-label="t('Supporting pane mode', '辅助面板模式')"
        >
          <Option
            value="overlay"
            :label="t('Overlay', '浮层')"
          /><Option
            value="push"
            :label="t('Push', '推挤')"
          /><Option
            value="side"
            :label="t('Side', '侧栏')"
          /><Option
            value="auto"
            :label="t('Auto', '自动')"
          />
        </Select>
      </label>
      <label
        >{{ t('Container width', '容器宽度') }}
        <Slider
          v-model="frameWidth"
          :aria-label="t('Container width', '容器宽度')"
          :min="320"
          :max="1120"
          :step="20"
        />
        <output>{{ frameWidth }}px</output>
      </label>
      <label
        >{{ t('Compact breakpoint', '紧凑断点') }}
        <Slider
          v-model="autoCompactBreakpoint"
          :aria-label="t('Compact breakpoint', '紧凑断点')"
          :min="320"
          :max="1000"
          :step="20"
        />
        <output>{{ autoCompactBreakpoint }}px</output>
      </label>
      <label
        >{{ t('Expanded breakpoint', '展开断点') }}
        <Slider
          v-model="autoBreakpoint"
          :aria-label="t('Expanded breakpoint', '展开断点')"
          :min="320"
          :max="1600"
          :step="20"
        />
        <output>{{ autoBreakpoint }}px</output>
      </label>
      <Button
        type="button"
        @click="direction = direction === 'ltr' ? 'rtl' : 'ltr'"
        >{{ t('Switch direction', '切换') }} {{ direction.toUpperCase() }}</Button
      >
    </div>
    <div
      class="drawer-demo__frame"
      :dir="direction"
      :style="{ '--drawer-demo-width': `${frameWidth}px` }"
    >
      <DrawerContainer
        v-model:open="open"
        v-model:end-open="endOpen"
        :start-mode="mode"
        :end-mode="endMode"
        :auto-compact-breakpoint="autoCompactBreakpoint"
        :auto-breakpoint="autoBreakpoint"
        :start-divider="true"
        width="360px"
        max-width="360px"
        :start-label="t('Main navigation', '主导航')"
        :end-label="t('Supporting pane', '辅助面板')"
        @change="record"
      >
        <template #start>
          <nav
            class="drawer-demo__nav"
            :aria-label="t('Main navigation', '主导航')"
          >
            <strong>{{ t('Workspace', '工作区') }}</strong>
            <Button
              variant="text"
              size="medium"
              type="button"
              @click="open = false"
              >{{ t('Close navigation', '关闭导航') }}</Button
            >
            <Button
              v-for="item in ['home', 'inbox', 'saved']"
              :key="item"
              variant="text"
              size="medium"
              type="button"
              :aria-current="selected === item ? 'page' : undefined"
              @click="selectDestination(item)"
              >{{
                item === 'home'
                  ? t('Home', '首页')
                  : item === 'inbox'
                    ? t('Inbox', '收件箱')
                    : t('Saved', '收藏')
              }}</Button
            >
            <Button
              variant="text"
              size="medium"
              type="button"
              @click="endOpen = true"
              >{{ t('Open supporting pane', '打开辅助面板') }}</Button
            >
            <span class="drawer-demo__status">{{
              t('Navigation destinations', '导航目的地')
            }}</span>
          </nav>
        </template>
        <template #start-toggle="{ expanded, controls, toggle }">
          <Button
            class="drawer-demo__toggle"
            variant="filled-tonal"
            type="button"
            :aria-expanded="expanded"
            :aria-controls="controls"
            :aria-label="t('Open navigation', '打开导航')"
            @click="toggle"
            ><Icon
              v-if="!expanded"
              name="menu"
            />{{
              expanded ? t('Collapse navigation', '收起导航') : t('Navigation', '导航')
            }}</Button
          >
        </template>
        <template #end>
          <aside class="drawer-demo__end">
            <strong>{{ t('Supporting pane', '辅助面板') }}</strong>
            <p>
              {{
                t(
                  'Provides contextual tools alongside the main navigation.',
                  '可同时提供与主导航不同的上下文工具。',
                )
              }}
            </p>
            <Button
              variant="outlined"
              type="button"
              @click="endOpen = false"
              >{{ t('Close supporting pane', '关闭辅助面板') }}</Button
            >
          </aside>
        </template>
        <template #end-toggle="{ expanded, controls, toggle }">
          <Button
            class="drawer-demo__toggle"
            variant="filled-tonal"
            type="button"
            :aria-expanded="expanded"
            :aria-controls="controls"
            :aria-label="t('Open supporting pane', '打开辅助面板')"
            @click="toggle"
            >{{ t('Supporting pane', '辅助面板') }}</Button
          >
        </template>
        <main class="drawer-demo__main">
          <h3>
            {{ t('Current page:', '当前页面：') }}
            {{
              selected === 'home'
                ? t('Home', '首页')
                : selected === 'inbox'
                  ? t('Inbox', '收件箱')
                  : t('Saved', '收藏')
            }}
          </h3>
          <p>
            {{
              t(
                'Content and navigation scroll independently. Adjust the container width to see auto mode switch between overlay and side.',
                '内容与导航栏可以独立滚动。调整容器宽度，观察自动模式在浮层与侧栏布局之间切换。',
              )
            }}
          </p>
          <output data-testid="drawer-events">{{ events.join(' → ') }}</output>
        </main>
      </DrawerContainer>
    </div>
  </div>
</template>

<style scoped>
.drawer-demo {
  display: grid;
  gap: 16px;
  width: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
  overflow-x: auto;
}
.drawer-demo__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.drawer-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.drawer-demo__frame {
  box-sizing: border-box;
  inline-size: min(100%, var(--drawer-demo-width, 960px));
  min-inline-size: 0;
  max-inline-size: 100%;
  block-size: 420px;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.drawer-demo__nav {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 24px 16px;
}
.drawer-demo__nav strong {
  padding: 0 8px 12px;
}
.drawer-demo__nav .yam3x-button {
  inline-size: 100%;
  justify-content: flex-start;
  color: var(--md-sys-color-on-surface-variant);
}
.drawer-demo__nav .yam3x-button[aria-current='page'] {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}
.drawer-demo__toggle {
  margin: 8px;
}
.drawer-demo__main {
  padding: 24px;
}
.drawer-demo__end {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 24px 16px;
}
.drawer-demo__status {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 12px;
}
</style>
