<script setup lang="ts">
import SearchExample from '../../components/demos/SearchExample.vue'
import SearchAppBarExample from '../../components/demos/SearchAppBarExample.vue'
</script>

# Search

Search 让用户输入查询并查看相关建议或结果。Search 是 Material 3 Expressive 组件；应选择能让查询与结果上下文保持易读的呈现方式。

它不同于 Search 应用栏变体，后者是打开独立搜索视图的入口。组件负责查询输入、展开的结果表面和焦点管理；使用它的功能负责搜索数据、结果排序以及选择结果后的行为。

## 示例

### 基础与布局状态

<div class="vp-raw yam3x-doc-demo-theme"><SearchExample /></div>

调整窗格宽度可在全屏与停靠结果之间切换，也可更改搜索栏样式、镜像布局，并添加加载或空结果。聚焦搜索框、输入、按 Enter 搜索、使用方向键遍历结果、选择建议，或清除并关闭表面。尾部操作属于组合内容，不是 Search 的内置操作。

::: details 查看示例源码

<<< ../../components/demos/SearchExample.vue{vue}

:::

### 在应用栏中

<div class="vp-raw yam3x-doc-demo-theme"><SearchAppBarExample /></div>

应用栏只保留一个入口，并仅在打开时挂载 Search。功能关闭并卸载搜索视图后，把焦点返回应用栏触发器。页面内容保留在停靠遮罩或全屏表面之后。

::: details 查看示例源码

<<< ../../components/demos/SearchAppBarExample.vue{vue}

:::

## 在应用中使用

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件：

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
    <template #default="{ query: currentQuery, close }">
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
      <p v-if="!suggestions.length">没有与 {{ currentQuery }} 匹配的结果</p>
    </template>
  </Search>
</template>
```

`default` 插槽拥有结果内容，并接收 `{ query, close }`。渲染具名语义列表，并为每个可操作项提供清晰名称。选择后调用 `close()` 返回折叠搜索栏。

::: details 自定义输入与图标插槽

```vue
<template>
  <Search
    v-model:query="query"
    v-model:open="open"
    label="搜索文件"
  >
    <template #input-field="{ inputProps }">
      <input
        v-bind="inputProps"
        class="my-search-input"
      />
    </template>
    <template #leading>
      <span aria-hidden="true">⌕</span>
    </template>
    <template #trailing>
      <button
        type="button"
        aria-label="搜索筛选"
      >
        ☷
      </button>
    </template>
    <template #back>
      <span aria-hidden="true">←</span>
    </template>
  </Search>
</template>
```

请把 `inputProps` 绑定到实际的原生 `<input>`，以保持查询更新、焦点、无障碍属性和禁用状态连接。`trailing` 内的图标按钮需要自己的可访问名称。

:::

## 行为与无障碍

### 查询与结果

- `label` 同时是输入框的可访问名称和占位符，也用于命名结果区域（`<label> suggestions and results`）。应描述可搜索内容，而不是操作。
- 打开的表面是带 `aria-modal="true"` 的模态对话框；打开期间页面滚动被锁定。结果区域是礼貌 live region，并在提交搜索后获得焦点。
- 提交表单会发出 `search(query)`，使输入框失焦，并把焦点移到结果。`default` 插槽接收当前查询和 `close` 回调。
- 清除按钮仅在表面打开且查询非空时显示。它会清空查询、发出 `clear`，并重新聚焦输入框。
- `v-model:query` 拥有文本，`v-model:open` 拥有展开状态。两者都可受控，也可交给组件管理。
- 不要在结果外再嵌套 live region。结果排序、加载和空结果策略属于使用 Search 的功能。

### 键盘与焦点

- 组件未禁用时，聚焦字段会打开表面。打开后焦点进入搜索输入框。
- 从输入框按向下箭头会把焦点移入结果。向下和向上箭头在可见结果与控件间循环。
- Enter 提交查询。Escape 关闭表面。Tab 在打开的表面内循环控件与结果，而不会到达背景内容。
- 清除和返回按钮具有操作专属名称；返回按钮折叠表面。关闭会卸载结果视图并释放页面滚动锁。
- `disabled` 阻止打开，并关闭已经打开的表面。`clearable` 为 false 时不渲染清除按钮。

### 布局与关闭

- `layout="auto"` 测量内容窗格，低于 600px 时选择全屏，600px 及以上选择停靠。设置 `fullscreen` 或 `docked` 可移除该测量。
- 全屏结果会用结果表面替换搜索栏周边。停靠结果显示在搜索栏下方，与栏同宽，并位于遮罩上方。
- 点击停靠遮罩会关闭表面。全屏 Search 通过返回或 Escape 关闭。
- Contained 是默认的 Expressive 样式；divided 作为基线项目选项保留。两者在显示结果时都保持查询可见。
- 组件遵循周围书写方向。搜索栏和结果适配可用窗格而不是溢出，因此极窄窗格可能比标称最小宽度更窄。

### 组合

Search 应用栏变体只是入口。用户打开搜索时挂载 Search，把功能的查询和结果数据保留在组件外，并在关闭后把焦点返回应用栏触发器。Search 组件本身不调用 API、不排序结果，也不选择记录。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可选 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；`label`、`closeLabel` 和 `clearLabel` 覆盖对应默认值。

### 导出

| 导出            | 类型 | 用途                                     |
| --------------- | ---- | ---------------------------------------- |
| `Search`        | 组件 | 查询栏、模态结果表面与焦点管理。         |
| `SearchLayout`  | 类型 | `'auto'`、`'fullscreen'` 或 `'docked'`。 |
| `SearchVariant` | 类型 | `'contained'` 或 `'divided'`。           |

### 属性与模型

| 属性 / 模型               | 类型                                 | 默认值             | 说明                                         |
| ------------------------- | ------------------------------------ | ------------------ | -------------------------------------------- |
| `label`                   | `string`                             | 本地化 `Search`    | 输入占位符与可访问名称；也用于命名结果区域。 |
| `layout`                  | `'auto' \| 'fullscreen' \| 'docked'` | `'auto'`           | 低于 600px 使用全屏，从 600px 起使用停靠。   |
| `variant`                 | `'contained' \| 'divided'`           | `'contained'`      | Expressive 包含式搜索栏或基线分隔式搜索栏。  |
| `disabled`                | `boolean`                            | `false`            | 禁用输入和展开，并关闭已打开的表面。         |
| `hideSearchIcon`          | `boolean`                            | `false`            | 隐藏前置搜索图标；应提供其他可见搜索入口。   |
| `clearable`               | `boolean`                            | `true`             | 打开的查询非空时显示清除按钮。               |
| `closeLabel`              | `string`                             | 本地化 `Back`      | 返回按钮的可访问名称。                       |
| `clearLabel`              | `string`                             | 本地化 `Clear`     | 清除按钮的可访问名称。                       |
| `query` / `v-model:query` | `string`                             | `''`               | 查询文本。                                   |
| `open` / `v-model:open`   | `boolean`                            | `false`            | 展开表面状态。                               |
| `locale`                  | `string`                             | Provider → `en-US` | 内置界面标签的语言。                         |

### 事件

| 事件     | 载荷            | 说明                     |
| -------- | --------------- | ------------------------ |
| `search` | `query: string` | 查询已提交。             |
| `clear`  | —               | 通过清除操作清空了查询。 |

### 插槽

| 插槽          | 参数                                    | 说明                                               |
| ------------- | --------------------------------------- | -------------------------------------------------- |
| `default`     | `{ query, close }`                      | 建议或结果。选择后调用 `close`。                   |
| `input-field` | `{ inputProps, query, open, disabled }` | 替换原生输入框；把 `inputProps` 绑定到原生输入框。 |
| `leading`     | —                                       | 替换折叠状态的前置图标。                           |
| `trailing`    | —                                       | 在输入框旁添加尾部操作。                           |
| `back`        | —                                       | 展开状态替换返回图标。                             |

### 方法

通过模板引用访问这些成员。

| 成员      | 签名         | 说明                                  |
| --------- | ------------ | ------------------------------------- |
| `close()` | `() => void` | 折叠结果表面。                        |
| `clear()` | `() => void` | 清空查询、发出 `clear` 并聚焦输入框。 |
| `focus()` | `() => void` | 聚焦搜索输入框。                      |

## 样式

Search 不暴露公共 CSS 自定义属性。其搜索栏、结果视图、焦点指示和遮罩映射到 Material System 颜色与形状角色，由主题提供这些值。内容使用插槽，布局专属调整使用宿主元素。

::: details 采用的 System 角色与尺寸

| 部分               | 处理                                                |
| ------------------ | --------------------------------------------------- |
| 搜索栏             | Surface Container High；56px 高度；full 圆角。      |
| 焦点指示           | 3px secondary 外框，偏移 2px。                      |
| 全屏结果           | Surface Container Low。                             |
| 停靠结果           | Surface Container High，并在页面内容上方显示遮罩。  |
| 输入与前置图标     | On Surface。                                        |
| 辅助文本与尾部图标 | On Surface Variant。                                |
| 图标               | 24px；前置／尾部点击目标为 48px，距搜索栏边缘 4px。 |
| 窗格边距           | 包含式样式下未聚焦 24px，聚焦 12px。                |

:::

## Material 参考

[搜索概览](https://m3.material.io/components/search/overview) · [指南](https://m3.material.io/components/search/guidelines) · [规格](https://m3.material.io/components/search/specs) · [无障碍](https://m3.material.io/components/search/accessibility)
