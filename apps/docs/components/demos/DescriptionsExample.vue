<script setup lang="ts">
import { computed, ref } from 'vue'
import { Descriptions, type DescriptionItem } from '@registry/components/descriptions'
import { LocaleProvider } from '@registry/components/localization'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'
const { t, locale } = useDemoLocale()
const inline = ref(false)
const outlined = ref(true)
const narrow = ref(false)
const empty = ref(false)
const items = computed<DescriptionItem[]>(() =>
  empty.value
    ? []
    : [
        { key: 'project', label: t('Project', '项目'), value: 'Atlas' },
        { key: 'owner', label: t('Owner', '负责人'), value: 'Ada' },
        { key: 'budget', label: t('Remaining budget', '剩余预算'), value: 0 },
        { key: 'contact', label: t('Contact', '联系邮箱'), value: 'ada@example.com' },
        { key: 'notification', label: t('Notifications', '通知'), value: false },
        { key: 'review', label: t('Review date', '评审日期'), value: null },
        {
          key: 'notes',
          label: t('Notes', '备注'),
          fullWidth: true,
          value: t(
            'This project summary keeps complete record details readable when the container narrows or text is enlarged.',
            '此项目摘要会在容器变窄或文字放大时保留完整记录内容，避免截断标签和值。',
          ),
        },
      ],
)
</script>
<template>
  <section
    class="descriptions-demo"
    data-testid="descriptions-demo"
  >
    <div class="descriptions-demo__controls">
      <Checkbox
        v-model="inline"
        :label="t('Inline labels', '标签与值并排')"
      />
      <Checkbox
        v-model="outlined"
        :label="t('Outlined group', '显示组边框')"
      />
      <Checkbox
        v-model="narrow"
        :label="t('Narrow container', '窄容器')"
      />
      <Checkbox
        v-model="empty"
        :label="t('Empty record', '空记录')"
      />
    </div>
    <LocaleProvider :locale="locale === 'zh' ? 'zh-CN' : 'en-US'">
      <Descriptions
        :items="items"
        :title="t('Project details', '项目详情')"
        :layout="inline ? 'inline' : 'stacked'"
        :outlined="outlined"
        :style="{ maxInlineSize: narrow ? '20rem' : undefined }"
      >
        <template #value="{ item, value }">
          <a
            v-if="item.key === 'contact'"
            :href="`mailto:${value}`"
            >{{ value }}</a
          >
          <template v-else-if="typeof value === 'boolean'">{{
            value ? t('On', '开启') : t('Off', '关闭')
          }}</template>
          <template v-else-if="value != null">{{ value }}</template>
          <template v-else>{{ t('Not provided', '未提供') }}</template>
        </template>
      </Descriptions>
    </LocaleProvider>
  </section>
</template>
<style>
.descriptions-demo {
  display: grid;
  gap: 24px;
}
.descriptions-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
