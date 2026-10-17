<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import {
  ActionList,
  ExpandableListItem,
  ListAction,
  type ListVariant,
} from '@registry/components/list'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const variant = ref<ListVariant>('segmented')
const paneWidth = ref<'narrow' | 'wide'>('wide')
const direction = ref<'ltr' | 'rtl'>('ltr')
const rightToLeft = computed({
  get: () => direction.value === 'rtl',
  set: (value: boolean) => {
    direction.value = value ? 'rtl' : 'ltr'
  },
})
const openFolder = ref(false)
const activeDestination = ref('inbox')
const showDraggedState = ref(false)
const paneInlineSize = computed(() => (paneWidth.value === 'narrow' ? '360px' : '100%'))
</script>

<template>
  <section
    class="yam3x-list-demo"
    :dir="direction"
  >
    <div class="yam3x-list-demo__controls">
      <label
        >{{ t('Appearance', '外观') }}
        <Select
          v-model="variant"
          :aria-label="t('List appearance', '列表外观')"
        >
          <Option
            value="standard"
            :label="t('Standard', '标准')"
          />
          <Option
            value="segmented"
            :label="t('Segmented', '分段')"
          />
        </Select>
      </label>
      <label
        >{{ t('List pane width', '列表栏宽度') }}
        <Select
          v-model="paneWidth"
          :aria-label="t('List pane width', '列表栏宽度')"
        >
          <Option
            value="wide"
            :label="t('Use available width', '使用可用宽度')"
          />
          <Option
            value="narrow"
            :label="t('Narrow list pane (360px)', '窄列表栏（360px）')"
          />
        </Select>
      </label>
      <Checkbox
        v-model="rightToLeft"
        :label="t('Right-to-left (RTL)', '从右到左 (RTL)')"
      />
      <Checkbox
        v-model="showDraggedState"
        :label="t('Simulate dragged state', '模拟拖动状态')"
      />
    </div>

    <div class="yam3x-list-demo__layout-container">
      <div
        class="yam3x-list-demo__adaptive"
        :class="{ 'yam3x-list-demo__adaptive--wide-list': paneWidth === 'wide' }"
        :aria-label="t('Resizable list and detail layout', '可调整的列表与详情布局')"
      >
        <div
          class="yam3x-list-demo__list-pane"
          :style="{ inlineSize: paneInlineSize }"
        >
          <ActionList
            :variant="variant"
            :aria-label="t('Mail actions', '邮件操作')"
          >
            <ExpandableListItem
              v-model:open="openFolder"
              :dragged="showDraggedState"
              :current="activeDestination === 'inbox'"
            >
              {{ t('Inbox', '收件箱') }}
              <template #leading
                ><span
                  class="yam3x-list-demo__icon"
                  aria-hidden="true"
                  >▣</span
                ></template
              >
              <template #supporting-text>{{ t('4 unread messages', '4 封未读邮件') }}</template>
              <template #items>
                <ListAction
                  :dragged="showDraggedState"
                  :aria-current="activeDestination === 'primary' ? 'page' : undefined"
                  @click="activeDestination = 'primary'"
                  >{{ t('Primary', '主要邮件') }}</ListAction
                >
                <ListAction
                  :dragged="showDraggedState"
                  :aria-current="activeDestination === 'updates' ? 'page' : undefined"
                  @click="activeDestination = 'updates'"
                  >{{ t('Updates', '更新') }}</ListAction
                >
              </template>
            </ExpandableListItem>
            <ListAction
              href="#sent"
              :dragged="showDraggedState"
              :aria-current="activeDestination === 'sent' ? 'page' : undefined"
              @click.prevent="activeDestination = 'sent'"
            >
              {{ t('Sent', '已发送') }}
              <template #leading
                ><span
                  class="yam3x-list-demo__icon"
                  aria-hidden="true"
                  >↗</span
                ></template
              >
            </ListAction>
            <ListAction
              :dragged="showDraggedState"
              :aria-current="activeDestination === 'drafts' ? 'page' : undefined"
              @click="activeDestination = 'drafts'"
            >
              {{ t('Drafts', '草稿') }}
              <template #leading
                ><span
                  class="yam3x-list-demo__icon"
                  aria-hidden="true"
                  >▤</span
                ></template
              >
              <template #actions>
                <Button
                  type="button"
                  :aria-label="t('More draft actions', '草稿更多操作')"
                  @click.stop="activeDestination = 'draft-actions'"
                  >⋮</Button
                >
              </template>
            </ListAction>
          </ActionList>
        </div>
        <section
          class="yam3x-list-demo__detail"
          aria-live="polite"
        >
          <h3>{{ t('Current page:', '当前页面：') }} {{ activeDestination }}</h3>
          <p>
            {{
              t(
                'The app layout manages this detail pane. It sits beside the list in a wider container and stacks below it in a narrower one.',
                '此详情面板由应用布局管理。加宽容器时与列表并排；缩窄容器时上下排列。',
              )
            }}
          </p>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.yam3x-list-demo {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}
.yam3x-list-demo__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.yam3x-list-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.yam3x-list-demo__layout-container {
  container-type: inline-size;
  min-inline-size: 0;
}
.yam3x-list-demo__adaptive {
  display: grid;
  gap: 24px;
  align-items: start;
  min-inline-size: 0;
}
.yam3x-list-demo__list-pane {
  position: relative;
  min-inline-size: 0;
  max-inline-size: 100%;
}
.yam3x-list-demo__detail {
  min-block-size: 240px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  background: var(--md-sys-color-surface-container-low);
}
.yam3x-list-demo__detail h3,
.yam3x-list-demo__detail p {
  margin-block: 0 12px;
}
.yam3x-list-demo h3 {
  margin-block: 0 12px;
}
.yam3x-list-demo__icon {
  display: grid;
  place-items: center;
  inline-size: 24px;
  block-size: 24px;
  font-size: 20px;
}
@container (min-width: 760px) {
  .yam3x-list-demo__adaptive:not(.yam3x-list-demo__adaptive--wide-list) {
    grid-template-columns: minmax(280px, 0.7fr) minmax(0, 1.3fr);
  }
  .yam3x-list-demo__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container (min-width: 1000px) {
  .yam3x-list-demo__adaptive--wide-list {
    grid-template-columns: minmax(600px, 1.2fr) minmax(0, 1fr);
  }
}
</style>
