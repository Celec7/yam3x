<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pagination, type PaginationChange } from '@registry/components/pagination'
import { InlineMessage } from '@registry/components/inline-message'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'
const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const page = ref(5)
const pageSize = ref(10)
const accepted = ref(4)
const acceptedSize = ref(10)
const pending = ref<PaginationChange | null>(null)
const failed = ref(false)
const records = computed(() =>
  Array.from(
    { length: Math.min(pageSize.value, 200 - (page.value - 1) * pageSize.value) },
    (_, i) => (page.value - 1) * pageSize.value + i + 1,
  ),
)
function onChange(detail: PaginationChange) {
  page.value = detail.page
  pageSize.value = detail.pageSize
}
function onRequest(detail: PaginationChange) {
  pending.value = detail
  failed.value = false
}
function onAccept() {
  if (!pending.value) return
  accepted.value = pending.value.page
  acceptedSize.value = pending.value.pageSize
  pending.value = null
}
function onFail() {
  pending.value = null
  failed.value = true
}
</script>

<template>
  <div class="pagination-demo">
    <section
      :aria-label="t('Local results', '本地结果')"
      class="pagination-demo__section"
    >
      <p>
        {{ t('Displayed records:', '当前展示记录：') }}
        <output data-testid="pagination-records">{{ records.join(', ') }}</output>
      </p>
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="200"
        :page-sizes="[10, 25, 50]"
        :locale="fieldLocale"
        @change="onChange"
      />
    </section>
    <section
      :aria-label="t('Accepted results', '已接受结果')"
      class="pagination-demo__section"
    >
      <p>
        {{
          t(
            'Request a page, then accept or fail the request. The marker follows the displayed result.',
            '先请求翻页，再接受或拒绝请求。当前页标记始终跟随已展示的结果。',
          )
        }}
      </p>
      <p>
        {{ t('Displayed page:', '已展示页：') }}
        <output data-testid="pagination-accepted">{{ accepted }}</output>
      </p>
      <Pagination
        :page="accepted"
        :page-size="acceptedSize"
        :total="200"
        :pending="Boolean(pending)"
        :locale="fieldLocale"
        :messages="{ label: t('Server results pages', '服务端结果分页') }"
        @change="onRequest"
      />
      <div
        v-if="pending"
        class="pagination-demo__actions"
      >
        <Button @click="onAccept">{{ t('Accept page request', '接受翻页请求') }}</Button>
        <Button
          variant="outlined"
          @click="onFail"
          >{{ t('Fail page request', '拒绝翻页请求') }}</Button
        >
      </div>
      <InlineMessage
        v-if="failed"
        tone="error"
        announcement="polite"
        >{{
          t(
            'The next page could not be loaded. Your previous results are still available; try again.',
            '下一页加载失败。之前的结果仍然可用，请重试。',
          )
        }}</InlineMessage
      >
    </section>
    <Pagination
      :total="0"
      :locale="fieldLocale"
    />
  </div>
</template>

<style scoped>
.pagination-demo {
  display: grid;
  gap: 24px;
}
.pagination-demo__section {
  display: grid;
  gap: 16px;
  min-inline-size: 0;
}
.pagination-demo__section p {
  margin: 0;
  overflow-wrap: anywhere;
}
.pagination-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
