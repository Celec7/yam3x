<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { AppBar } from '@registry/components/app-bar'
import { Search } from '@registry/components/search'
import { useDemoLocale } from './use-demo-locale'

const { localeTag, t } = useDemoLocale()
const open = ref(false)
const mounted = ref(false)
const query = ref('')
const selected = ref('')
const shell = ref<HTMLElement | null>(null)

const results = computed(() => [
  t('Workspace settings', '工作区设置'),
  t('Shared with me', '与我共享'),
  t('Recent activity', '最近活动'),
])

const matches = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  if (!needle) return results.value
  return results.value.filter((item) => item.toLocaleLowerCase().includes(needle))
})

function startSearch(): void {
  mounted.value = true
  open.value = true
}

function selectResult(item: string, close: () => void): void {
  selected.value = item
  query.value = item
  close()
}

function onOpenUpdate(value: boolean): void {
  open.value = value
  if (value) return
  mounted.value = false
  void nextTick(() => {
    shell.value?.querySelector<HTMLButtonElement>('.yam3x-app-bar__search-trigger')?.focus()
  })
}
</script>

<template>
  <section
    class="search-app-bar"
    data-testid="search-app-bar"
  >
    <div
      ref="shell"
      class="search-app-bar__shell"
    >
      <AppBar
        variant="search"
        :search-label="t('Search workspace', '搜索工作区')"
        :locale="localeTag"
        @search="startSearch"
      />
      <div class="search-app-bar__content">
        <h3>{{ t('Workspace', '工作区') }}</h3>
        <p>
          {{
            t(
              'The app bar keeps a single search entry point. Activating it opens Search over the current page.',
              '应用栏只保留一个搜索入口。激活后会在当前页面上方打开 Search。',
            )
          }}
        </p>
        <output>{{ selected || t('Nothing selected', '未选择任何内容') }}</output>
      </div>
      <Search
        v-if="mounted"
        v-model:query="query"
        :open="open"
        :label="t('Search workspace', '搜索工作区')"
        :locale="localeTag"
        @update:open="onOpenUpdate"
        @search="selected = $event"
      >
        <template #default="{ close }">
          <ul
            class="search-app-bar__results"
            :aria-label="t('Workspace results', '工作区结果')"
          >
            <li
              v-for="item in matches"
              :key="item"
            >
              <button
                type="button"
                @click="selectResult(item, close)"
              >
                {{ item }}
              </button>
            </li>
          </ul>
          <p
            v-if="!matches.length"
            role="status"
          >
            {{ t('No matching workspace items', '没有匹配的工作区项目') }}
          </p>
        </template>
      </Search>
    </div>
  </section>
</template>

<style scoped>
.search-app-bar__shell {
  position: relative;
  display: grid;
  gap: 24px;
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  border-radius: 12px;
  background: var(--md-sys-color-surface, #fdf7ff);
}
.search-app-bar__content {
  display: grid;
  gap: 8px;
  padding: 0 24px 24px;
}
.search-app-bar__content h3,
.search-app-bar__content p {
  margin: 0;
}
.search-app-bar__content output {
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
.search-app-bar__results {
  display: grid;
  gap: 2px;
  padding: 0 4px 4px;
  margin: 0;
  list-style: none;
}
.search-app-bar__results button {
  width: 100%;
  min-height: 48px;
  padding: 8px 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
}
.search-app-bar__results button:hover {
  background: var(--md-sys-color-surface-container-high, #ece6f0);
}
</style>
