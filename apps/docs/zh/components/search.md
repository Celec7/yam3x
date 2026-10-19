<script setup lang="ts">
import SearchExample from '../../components/demos/SearchExample.vue'
</script>

# Search

Search 允许用户输入查询并查看相关建议或结果。应选择便于用户理解查询与结果上下文的呈现方式。

## 交互示例

拖动窗格宽度，再聚焦搜索框，观察全屏和停靠模式如何切换。展开时可以输入文本、按 Enter 搜索、用方向键遍历结果，也可以选择建议或按 Escape 返回。

<div class="vp-raw yam3x-doc-demo-theme"><SearchExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SearchExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Search } from './components/yam3x/search'

const query = ref('')
const open = ref(false)
const suggestions = ref([{ id: '1', title: '项目文档' }])

function runSearch(value: string): void {
  console.log('search:', value)
}

function select(item: { id: string; title: string }): void {
  console.log('selected:', item.title)
}
</script>

<template>
  <Search
    v-model:query="query"
    v-model:open="open"
    label="搜索消息"
    @search="runSearch"
  >
    <template #input-field="{ inputProps }">
      <input
        v-bind="inputProps"
        class="my-search-input"
      />
    </template>
    <template #default="{ query, close }">
      <ul aria-label="搜索建议和结果">
        <li
          v-for="item in suggestions"
          :key="item.id"
        >
          <button
            type="button"
            @click="
              select(item)
              close()
            "
          >
            {{ item.title }}
          </button>
        </li>
      </ul>
    </template>
  </Search>
</template>
```

## API

该组件的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

| 属性               | 默认值       | 说明                                                                                                                    |
| ------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `label`            | 本地化默认值 | 同时作为输入框提示和无障碍名称；建议说明可搜索的内容。                                                                  |
| `layout`           | `auto`       | `auto` 按当前内容窗格宽度适配：低于项目定义的 600px 断点时全屏，600px 及以上停靠。也可固定为 `fullscreen` 或 `docked`。 |
| `variant`          | `contained`  | 设置视觉样式。`contained` 是 M3 Expressive 推荐样式；项目也保留基线样式 `divided` 作为可选项。                          |
| `disabled`         | `false`      | 禁用输入和展开。                                                                                                        |
| `hide-search-icon` | `false`      | 隐藏默认装饰性搜索图标；所在界面应提供其他可见搜索入口。                                                                |
| `clearable`        | `true`       | 查询非空时显示清除按钮。                                                                                                |
| `close-label`      | `Back`       | 展开状态下返回按钮的无障碍名称。                                                                                        |
| `clear-label`      | `Clear`      | 清除按钮的无障碍名称。                                                                                                  |
| `v-model:query`    | `''`         | 查询文本，可受控或由组件内部管理。                                                                                      |
| `v-model:open`     | `false`      | 展开状态，可受控或由组件内部管理。                                                                                      |

## 行为与无障碍

Search 发出 `search(query)` 和 `clear` 事件。`input-field` 插槽可替换原生输入框，并接收 `{ inputProps, query, open, disabled }`；请将 `inputProps` 绑定到实际的原生 `<input>`，以保持查询更新、焦点行为、无障碍属性和禁用状态。省略该插槽时，Search 会渲染默认原生输入框。默认插槽显示建议或结果，并接收 `{ query, close }`；行项目由调用方负责交互，`close` 会恢复输入框焦点。建议和结果应放在带有无障碍名称的语义列表（`<ul>` 或 `<ol>`）中，并为每个可操作项提供清晰的无障碍名称。Search 已将结果容器设为礼貌播报区域，并播报新增或变更的结果内容；请勿为同一批更新再嵌套 live region。`leading` 与 `trailing` 插槽提供图标或最多两个辅助操作；`back` 插槽可自定义返回图标。插槽内的图标按钮需要明确的无障碍名称。

## 样式

搜索框会适配内容窗格。停靠模式下，结果面板与窗格同宽，并显示在遮罩上方。

## Material 参考

[搜索概览](https://m3.material.io/components/search/overview) · [指南](https://m3.material.io/components/search/guidelines) · [规格](https://m3.material.io/components/search/specs) · [无障碍](https://m3.material.io/components/search/accessibility)
