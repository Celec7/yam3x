<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { ListOption, SelectionList, type ListVariant } from '@registry/components/list'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const variant = ref<ListVariant>('segmented')
const selectedDestination = ref('inbox')
const selectedFilters = ref(['unread'])
const formDestination = ref<string | null>(null)
const formStatus = ref('')
const showDraggedState = ref(false)

function onFormSubmit(event: SubmitEvent): void {
  const form = event.currentTarget
  if (!(form instanceof HTMLFormElement)) return
  const values = new FormData(form).getAll('destination')
  formStatus.value = `${t('Form submitted:', '表单提交值：')} ${values.join(', ')}`
}
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
        <h3>{{ t('Single- and multi-select lists', '单选与多选列表') }}</h3>
        <SelectionList
          v-model="selectedDestination"
          :variant="variant"
          :label="t('Default inbox', '默认收件箱')"
        >
          <ListOption
            value="inbox"
            leading-type="icon"
            :dragged="showDraggedState"
          >
            {{ t('Inbox', '收件箱') }}
            <template #leading
              ><span
                class="yam3x-list-demo__icon"
                aria-hidden="true"
                >✉</span
              ></template
            >
            <template #overline
              ><span aria-hidden="true">{{ t('Default', '默认') }}</span></template
            >
            <template #supporting-text>{{ t('4 unread messages', '4 封未读邮件') }}</template>
            <template #trailing><span aria-hidden="true">09:41</span></template>
          </ListOption>
          <ListOption
            value="priority"
            :dragged="showDraggedState"
            >{{ t('Priority', '优先') }}</ListOption
          >
          <ListOption
            value="archive"
            disabled
            >{{ t('Archive (unavailable)', '归档（不可用）') }}</ListOption
          >
        </SelectionList>
        <SelectionList
          v-model="selectedFilters"
          :variant="variant"
          mode="multiple"
          :label="t('Mail filters', '邮件筛选')"
          class="yam3x-list-demo__filter-list"
        >
          <ListOption
            value="unread"
            :dragged="showDraggedState"
            >{{ t('Unread', '未读') }}</ListOption
          >
          <ListOption
            value="attachments"
            :dragged="showDraggedState"
            >{{ t('Has attachments', '含附件') }}</ListOption
          >
        </SelectionList>
      </section>
      <section>
        <h3>{{ t('Form integration', '表单集成') }}</h3>
        <form
          class="yam3x-list-demo__form"
          :aria-label="t('Inbox preferences form', '收件箱偏好表单')"
          @submit.prevent="onFormSubmit"
          @reset="formStatus = ''"
        >
          <SelectionList
            v-model="formDestination"
            :variant="variant"
            name="destination"
            required
            :label="t('Choose an inbox to submit', '选择要提交的收件箱')"
            @invalid="formStatus = t('Choose an inbox.', '请选择一个收件箱。')"
            @change="formStatus = ''"
          >
            <ListOption value="primary">{{ t('Primary', '主要邮件') }}</ListOption>
            <ListOption value="updates">{{ t('Updates', '更新') }}</ListOption>
            <ListOption
              value="spam"
              disabled
              >{{ t('Spam (unavailable)', '垃圾邮件（不可用）') }}</ListOption
            >
          </SelectionList>
          <div class="yam3x-list-demo__form-actions">
            <Button type="submit">{{ t('Save preferences', '保存偏好') }}</Button>
            <Button type="reset">{{ t('Reset', '重置') }}</Button>
          </div>
          <output
            role="status"
            aria-live="polite"
            >{{ formStatus }}</output
          >
        </form>
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
.yam3x-list-demo__form {
  display: grid;
  gap: 12px;
}
.yam3x-list-demo__form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.yam3x-list-demo__form output:empty {
  display: none;
}
.yam3x-list-demo h3 {
  margin-block: 0 12px;
}
.yam3x-list-demo__filter-list {
  margin-block-start: 16px;
}
@container (min-width: 760px) {
  .yam3x-list-demo__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
