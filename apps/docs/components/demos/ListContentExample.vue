<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { List, ListItem, type ListVariant } from '@registry/components/list'
import { HorizontalDivider } from '@registry/components/divider'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const variant = ref<ListVariant>('segmented')
const showDraggedState = ref(false)
</script>

<template>
  <section class="yam3x-list-demo">
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
      <Checkbox
        v-model="showDraggedState"
        :label="t('Simulate dragged state', '模拟拖动状态')"
      />
    </div>
    <div class="yam3x-list-demo__columns">
      <section>
        <h3>{{ t('Passive content list', '被动内容列表') }}</h3>
        <List
          :variant="variant"
          :aria-label="t('Recent contacts', '最近联系人')"
        >
          <ListItem
            leading-type="avatar"
            :dragged="showDraggedState"
          >
            Ada Lovelace
            <template #leading><span class="yam3x-list-demo__avatar">AL</span></template>
            <template #supporting-text>{{
              t(
                'Last active: today; the latest message mentioned the new release and team plans.',
                '上次活动：今天；最近一条消息提到了新版本发布和团队计划',
              )
            }}</template>
            <template #trailing-text>09:41</template>
          </ListItem>
          <ListItem leading-type="avatar">
            Grace Hopper
            <template #leading><span class="yam3x-list-demo__avatar">GH</span></template>
            <template #overline>{{ t('Team updates', '团队更新') }}</template>
            <template #supporting-text>{{
              t('Last active: yesterday', '上次活动：昨天')
            }}</template>
          </ListItem>
        </List>
      </section>
      <section>
        <h3>{{ t('Leading media and dividers', '前置媒体与分隔符') }}</h3>
        <List
          :variant="variant"
          :aria-label="t('Media and dividers', '媒体与分隔符')"
        >
          <ListItem leading-type="icon">
            {{ t('Primary', '主要邮件') }}
            <template #leading
              ><span
                class="yam3x-list-demo__icon"
                aria-hidden="true"
                >✉</span
              ></template
            >
            <template #overline
              ><span aria-hidden="true">{{ t('Inbox', '收件箱') }}</span></template
            >
            <template #supporting-text>{{
              t(
                'Three lines of list content with aligned icons.',
                '这里展示三行列表内容和图标对齐。',
              )
            }}</template>
          </ListItem>
          <li
            class="yam3x-list-divider"
            role="separator"
            aria-orientation="horizontal"
          >
            <HorizontalDivider />
          </li>
          <ListItem leading-type="image">
            {{ t('Contact photo', '联系人照片') }}
            <template #leading
              ><img
                src="/avatar-example.svg"
                :alt="t('Contact photo example', '联系人照片示例')"
            /></template>
          </ListItem>
          <ListItem
            leading-type="video"
            disabled
          >
            {{ t('Unavailable video attachment', '不可用的视频附件') }}
            <template #leading
              ><video
                poster="/avatar-example.svg"
                aria-hidden="true"
                muted
                preload="none"
              ></video
            ></template>
            <template #overline>{{ t('Unavailable media', '不可用媒体') }}</template>
            <template #supporting-text>{{
              t('This video attachment cannot be opened right now.', '此视频附件当前无法打开')
            }}</template>
            <template #trailing-text>{{ t('Video', '视频') }}</template>
            <template #trailing><span aria-hidden="true">⋮</span></template>
          </ListItem>
        </List>
      </section>
    </div>
  </section>
</template>

<style scoped>
.yam3x-list-demo {
  container-type: inline-size;
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
.yam3x-list-demo__columns {
  display: grid;
  gap: 24px;
  min-inline-size: 0;
}
.yam3x-list-demo__columns section {
  min-inline-size: 0;
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
.yam3x-list-demo__avatar {
  display: grid;
  place-items: center;
  inline-size: 40px;
  block-size: 40px;
  border-radius: 50%;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-size: 13px;
}
@container (min-width: 760px) {
  .yam3x-list-demo__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
