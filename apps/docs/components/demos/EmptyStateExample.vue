<script setup lang="ts">
import { ref } from 'vue'
import { EmptyState } from '@registry/components/empty-state'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'
const { t } = useDemoLocale()
const created = ref(false)
const query = ref('quarterly')
function onCreate() {
  created.value = true
}
function onClear() {
  query.value = ''
}
</script>

<template>
  <div class="empty-state-demo">
    <section :aria-label="t('Documents', '文档')">
      <EmptyState
        v-if="!created"
        :title="t('No documents yet', '还没有文档')"
        :description="
          t(
            'Create your first document to share ideas with your team.',
            '创建第一份文档，与团队分享想法。',
          )
        "
        icon="draft"
        :heading-level="3"
      >
        <template #actions
          ><Button @click="onCreate">{{ t('Create document', '创建文档') }}</Button></template
        >
      </EmptyState>
      <div
        v-else
        class="empty-state-demo__result"
        role="status"
      >
        {{
          t(
            'Untitled document created. Start editing your document.',
            '已创建未命名文档，现在可以开始编辑。',
          )
        }}
      </div>
    </section>
    <section :aria-label="t('Search results', '搜索结果')">
      <label class="empty-state-demo__search"
        >{{ t('Search documents', '搜索文档')
        }}<input
          v-model="query"
          type="search"
      /></label>
      <EmptyState
        v-if="query"
        :title="t('No matching documents', '没有匹配的文档')"
        align="start"
        :heading-level="3"
        icon="search_off"
      >
        {{
          t(
            'Try a different term, or clear the search to see all documents.',
            '请尝试其他关键词，或清除搜索以查看所有文档。',
          )
        }}
        <template #actions
          ><Button
            variant="outlined"
            @click="onClear"
            >{{ t('Clear search', '清除搜索') }}</Button
          ></template
        >
      </EmptyState>
      <p
        v-else
        role="status"
      >
        {{ t('Showing all documents: Project notes.', '显示全部文档：项目笔记。') }}
      </p>
    </section>
    <EmptyState
      context="page"
      :title="t('Your reading list starts here', '在这里开始你的阅读清单')"
      :description="
        t(
          'Save articles as you find them. They will be waiting here when you have time to read.',
          '发现好文章时先收藏，有时间阅读时就能在这里找到。',
        )
      "
      icon="bookmarks"
      :heading-level="3"
    />
  </div>
</template>

<style scoped>
.empty-state-demo {
  display: grid;
  gap: 24px;
}
.empty-state-demo__search {
  display: grid;
  gap: 8px;
  color: var(--md-sys-color-on-surface);
}
.empty-state-demo__search input {
  width: 100%;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
}
.empty-state-demo__result {
  padding: 24px;
}
</style>
