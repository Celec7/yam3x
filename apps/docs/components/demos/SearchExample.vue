<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@registry/components/button'
import { IconButton } from '@registry/components/icon-button'
import { Checkbox } from '@registry/components/checkbox'
import { Slider } from '@registry/components/slider'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Search, type SearchLayout, type SearchVariant } from '@registry/components/search'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const width = ref(960)
const layout = ref<SearchLayout>('auto')
const variant = ref<SearchVariant>('contained')
const direction = ref<'ltr' | 'rtl'>('ltr')
const disabled = ref(false)
const hideSearchIcon = ref(false)
const showTrailing = ref(true)
const query = ref('')
const open = ref(false)
const selected = ref('')
const suggestions = computed(() => [
  {
    title: t('Material 3 expressive search', 'Material 3 Expressive 搜索'),
    detail: t('Design guide · Updated today', '设计指南 · 今天更新'),
  },
  {
    title: t('Responsive search patterns', '自适应搜索模式'),
    detail: t('Product notes · Updated yesterday', '产品说明 · 昨天更新'),
  },
  {
    title: t('Search keyboard shortcuts', '搜索键盘快捷键'),
    detail: t('Help article · 8 min read', '帮助文章 · 阅读约 8 分钟'),
  },
  {
    title: t('Recent searches', '最近搜索'),
    detail: t('Search history · 3 items', '搜索历史 · 3 项'),
  },
])
const matches = computed(() => {
  const normalized = query.value.trim().toLocaleLowerCase()
  if (!normalized) return suggestions.value
  const filtered = suggestions.value.filter((item) =>
    `${item.title} ${item.detail}`.toLocaleLowerCase().includes(normalized),
  )
  return filtered.length > 0
    ? filtered
    : [
        {
          title: t(`Search for “${query.value}”`, `搜索“${query.value}”`),
          detail: t('Press Enter to search all content', '按 Enter 搜索全部内容'),
        },
      ]
})

function pick(item: { title: string }, close: () => void): void {
  query.value = item.title
  selected.value = item.title
  close()
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack search-demo">
    <div class="search-demo__controls">
      <label
        >{{ t('Layout', '布局') }}
        <Select
          v-model="layout"
          :aria-label="t('Search layout', '搜索布局')"
        >
          <Option
            value="auto"
            :label="t('Adaptive', '自适应')"
          />
          <Option
            value="fullscreen"
            :label="t('Full screen', '全屏')"
          />
          <Option
            value="docked"
            :label="t('Docked', '停靠')"
          />
        </Select>
      </label>
      <label
        >{{ t('Style', '样式') }}
        <Select
          v-model="variant"
          :aria-label="t('Search style', '搜索样式')"
        >
          <Option
            value="contained"
            :label="t('Contained', '包含式')"
          />
          <Option
            value="divided"
            :label="t('Divided', '分隔式')"
          />
        </Select>
      </label>
      <label class="search-demo__width"
        >{{ t('Pane width', '窗格宽度') }} {{ width }}px
        <Slider
          v-model="width"
          :min="320"
          :max="1600"
          :step="1"
          :aria-label="t('Search pane width', '搜索窗格宽度')"
        />
      </label>
      <label
        >{{ t('Direction', '方向') }}
        <Select
          v-model="direction"
          :aria-label="t('Search text direction', '搜索文本方向')"
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
      <Checkbox
        v-model="disabled"
        :label="t('Disable Search', '禁用搜索')"
      />
      <Checkbox
        v-model="hideSearchIcon"
        :label="t('Hide default Search icon', '隐藏默认搜索图标')"
      />
      <Checkbox
        v-model="showTrailing"
        :label="t('Show trailing actions', '显示辅助操作')"
      />
      <Button
        class="search-demo__background-action"
        type="button"
        @click="selected = t('Page action performed', '页面操作已执行')"
        >{{ t('Page action', '页面操作') }}</Button
      >
    </div>

    <div
      class="search-demo__viewport"
      role="region"
      :aria-label="t('Search responsive width preview', '搜索自适应宽度预览')"
      tabindex="0"
    >
      <div
        class="search-demo__pane"
        :style="{ width: `${width}px` }"
        :dir="direction"
      >
        <Search
          v-model:query="query"
          v-model:open="open"
          :layout="layout"
          :variant="variant"
          :disabled="disabled"
          :hide-search-icon="hideSearchIcon"
          :label="t('Search messages', '搜索消息')"
          data-testid="search"
          @search="selected = `${t('Searching:', '正在搜索：')} ${$event}`"
        >
          <template
            v-if="showTrailing"
            #trailing
          >
            <IconButton
              class="search-demo__voice"
              variant="standard"
              :aria-label="t('Voice search', '语音搜索')"
              @click="selected = t('Voice search requested', '已请求打开语音搜索')"
              >◖</IconButton
            >
            <IconButton
              class="search-demo__filter"
              variant="standard"
              :aria-label="t('Filter search', '筛选搜索')"
              @click="selected = t('Search filters requested', '已请求打开搜索筛选')"
              >☷</IconButton
            >
          </template>
          <template #default="{ query: currentQuery, close }">
            <div class="search-demo__results-heading">
              {{ currentQuery ? t('Results', '搜索结果') : t('Suggestions', '搜索建议') }}
            </div>
            <ul
              class="search-demo__results-list"
              :aria-label="t('Search suggestions and results', '搜索建议和结果')"
            >
              <li
                v-for="item in matches"
                :key="item.title"
              >
                <Button
                  type="button"
                  data-search-result
                  @click="pick(item, close)"
                >
                  <span
                    class="search-demo__result-icon"
                    aria-hidden="true"
                    >⌕</span
                  >
                  <span class="search-demo__result-copy">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.detail }}</small>
                  </span>
                  <span
                    class="search-demo__result-arrow"
                    aria-hidden="true"
                    >↗</span
                  >
                </Button>
              </li>
            </ul>
          </template>
        </Search>
        <div class="search-demo__page-content">
          <h3>{{ t('Current content pane', '当前内容窗格') }}</h3>
          <p>
            {{
              t(
                'Adjust the pane width, then focus Search. Below 600px, it uses a full-screen layout; at 600px and above, it uses a docked results panel.',
                '调整窗格宽度，再聚焦搜索框。低于 600px 时使用全屏布局；从 600px 起使用停靠结果面板。',
              )
            }}
          </p>
          <output aria-live="polite">{{
            selected ||
            t(
              'Choose a suggestion, or enter a query and press Enter.',
              '选择一个建议，或输入查询并按 Enter。',
            )
          }}</output>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.search-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.search-demo__width input {
  width: 160px;
}
.search-demo__viewport {
  width: 100%;
  overflow: auto;
  border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  background: var(--md-sys-color-surface-container-low, #f7f2fa);
}
.search-demo__pane {
  box-sizing: border-box;
  min-height: 420px;
  overflow: hidden;
  padding-block: 24px;
  background: var(--md-sys-color-surface, #fdf7ff);
}
.search-demo__page-content {
  display: grid;
  gap: 8px;
  padding: 24px;
  color: var(--md-sys-color-on-surface, #1d1b20);
}
.search-demo__page-content h3,
.search-demo__page-content p {
  margin: 0;
}
.search-demo__page-content output {
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
.search-demo__voice,
.search-demo__filter {
  font-size: 20px;
}
.search-demo__results-heading {
  padding: 12px 16px 4px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-size: 14px;
  font-weight: 600;
}
.search-demo__results-list {
  display: grid;
  gap: 2px;
  padding: 0 4px 4px;
  margin: 0;
  list-style: none;
}
.search-demo__results-list li {
  min-width: 0;
}
.search-demo__results-list .yam3x-button {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 64px;
  justify-content: flex-start;
  gap: 16px;
  padding: 8px 12px;
  border-radius: 12px;
  text-align: start;
}
.search-demo__result-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: var(--md-sys-color-secondary-container, #e8def8);
  color: var(--md-sys-color-on-secondary-container, #1d192b);
  font-size: 20px;
}
.search-demo__result-copy {
  display: grid;
  flex: 1;
  gap: 3px;
  min-width: 0;
}
.search-demo__result-copy strong {
  overflow: hidden;
  font-size: 16px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-demo__result-copy small {
  color: inherit;
  font-size: 14px;
}
.search-demo__result-arrow {
  color: inherit;
}
@media (max-width: 600px) {
  .search-demo__controls {
    gap: 12px;
  }
}
</style>
