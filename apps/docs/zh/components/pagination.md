<script setup lang="ts">
import PaginationBasicExample from '../../components/demos/PaginationBasicExample.vue'
import PaginationExample from '../../components/demos/PaginationExample.vue'
</script>

# Pagination

`Pagination` 是项目拓展组件，用于已知结果总数的集合。Material 3 Expressive 没有独立的 Pagination 组件，Compose Material 3 也没有分页基元；最接近的组合是一行 Material `Button` 与 `IconButton`。本组件在此基础上增加页码窗口、每页条数选择器、范围摘要和自适应紧凑呈现。

当应用知道记录总数时，可将它用于表格、列表或结果网格。它不获取数据、不保存结果缓存，也不会为只有游标的服务虚构页数。结果总数未知或只追加内容时，请改用“加载更多”操作。

## 示例

### 基础

基础示例将两个模型绑定到本地状态，展示范围摘要、带省略号的页码按钮、上一页和下一页控件，以及每页条数选择器。

<div class="vp-raw yam3x-doc-demo-theme"><PaginationBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/PaginationBasicExample.vue{vue}

:::

### 已接受、等待与失败请求

交互演示将本地翻页与服务端式结果区域分开。请求翻页后接受或拒绝：已接受标记跟随当前展示的结果，等待状态保持上一页可识别，失败时保留之前的结果并提供恢复文案。最后展示零结果分页器。

<div class="vp-raw yam3x-doc-demo-theme"><PaginationExample /></div>

::: details 查看演示源码

<<< ../../components/demos/PaginationExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件。请使用 `./components/yam3x/` 之类的调用方路径；演示源码中的 `@registry` 路径仅用于文档站点。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Pagination, type PaginationChange } from './components/yam3x/pagination'

const page = ref(1)
const pageSize = ref(10)

function onChange(next: PaginationChange) {
  page.value = next.page
  pageSize.value = next.pageSize
}
</script>

<template>
  <Pagination
    :page="page"
    :page-size="pageSize"
    :total="200"
    :page-sizes="[10, 25, 50]"
    @change="onChange"
  />
</template>
```

`change({ page, pageSize }, event?)` 报告请求，不直接改变已接受的属性。`v-model:page` 与 `v-model:page-size` 会立即接受本地请求。异步结果应传入已接受的值，加载时设置 `pending`，仅在成功后同时替换数值与记录。失败时保留当前展示的记录和当前页标记，并在结果区域提供恢复反馈。

::: details 原生链接与自定义摘要

```vue
<script setup lang="ts">
import { Pagination, type PaginationChange } from './components/yam3x/pagination'

const href = (page: number, pageSize: number) => `/zh/results?page=${page}&size=${pageSize}`

function onChange(next: PaginationChange, event?: MouseEvent) {
  event?.preventDefault()
  // router.push(href(next.page, next.pageSize))
}
</script>

<template>
  <Pagination
    :page="1"
    :page-size="20"
    :total="480"
    :href="href"
    @change="onChange"
  >
    <template #summary="{ start, end, total }">
      第 {{ start }}–{{ end }} 条，共 {{ total }} 条结果
    </template>
  </Pagination>
</template>
```

:::

提供 `href` 时，普通点击保留原生链接跳转；`change` 的第二个参数让客户端路由调用 `preventDefault()`。带修饰键的点击仍走原生行为，不为当前视图发出请求。未提供 `href` 时使用按钮。

## 行为与无障碍

### 页码窗口与边界

- 页码窗口始终包含首页、末页、当前页及其相邻页。间隔一页时会补上该页；更大的间隔显示为不可交互的省略号。
- 省略号不是控件。当前页使用 `aria-current="page"`，不使用切换按钮的按下语义。
- 首页禁用上一页，末页禁用下一页。请求已经展示的页面不会产生操作。
- 改变每页条数时，会请求包含原先首条可见记录的页面，并限制到最后一个有效页。
- 零结果显示零范围，没有数字页码操作。只有一页时省略冗余导航，同时保留摘要。
- 总数缩减到已接受页码之外时，组件不会自动发出请求，不会虚构当前页标记，并禁用导航，直到应用提供有效页码。

### 自适应呈现

- 组件测量自身宽度。当数字窗口、上一页和下一页无法容纳时，数字页码会从布局、焦点顺序和辅助技术中隐藏。
- 紧凑模式在可见的当前页/总页数摘要两侧保留上一页和下一页。已接受页码在呈现切换后保持不变。
- 每页条数选择器和范围摘要会在次级区域中换行；它们不会把主导航压缩到触摸目标以下。
- 页面目标预留共享 touch-target 尺寸，间距使用共享的 8 px token，且不会压缩到 8 px 以下。

### 焦点与等待状态

- 紧凑模式替换聚焦的当前页时，焦点移到等价摘要；恢复完整呈现后，焦点返回当前页按钮。
- 页码窗口变化时，焦点会尽量留在幸存的等价控件上。
- `pending` 在导航上设置 `aria-busy`、禁用请求、保留已接受页码标记，并显示本地化状态消息。
- 替换结果内容后的焦点由应用负责，因为组件无法知道应聚焦哪条结果或哪个标题。

### 本地化与 RTL

- 内置文案来自 [LocaleProvider](/zh/components/localization) 的 `pagination` 配置。显式 `locale` 与 `messages` 优先；未配置 provider 时默认使用 `en-US`。
- 数字使用当前语言的 `Intl.NumberFormat`。页码标签和回调接收已格式化的字符串。
- 范围文字使用 `dir="auto"`，上一页和下一页图标在 RTL 下镜像。页码按钮仍为普通 Tab 停靠点，不添加网格式方向键操作。

### 状态归属

请求页码、已接受页码、每页条数和结果数据都由应用负责。组件负责溢出测量和紧凑/完整呈现，不保存第二份页码。服务端模式下，将提议值与已接受值分开保存，仅在成功时同时替换，并由应用修正无效的已接受页码。

## API

### 导出

| 导出                                     | 类型 | 用途                               |
| ---------------------------------------- | ---- | ---------------------------------- |
| `Pagination`                             | 组件 | 页码导航、每页条数选择与范围摘要。 |
| `PaginationChange`、`PaginationMessages` | 类型 | `change` 参数与消息覆盖。          |

### 属性与模型

| 属性与模型                       | 类型                          | 默认值                   | 用途                                                     |
| -------------------------------- | ----------------------------- | ------------------------ | -------------------------------------------------------- |
| `total`                          | `number`                      | 必填                     | 已知结果总数；非负安全整数。                             |
| `page` / `v-model:page`          | `number`                      | `1`                      | 已接受的从 1 开始的页码。                                |
| `pageSize` / `v-model:page-size` | `number`                      | `10`                     | 正安全整数。                                             |
| `pageSizes`                      | `readonly number[]`           | `[]`                     | 可选的每页条数；非空数组启用选择器。当前值始终包含在内。 |
| `locale`                         | `string`                      | Provider，再回退 `en-US` | 数字与内置文案的语言。                                   |
| `pending`                        | `boolean`                     | `false`                  | 显示加载状态、设置 `aria-busy` 并阻止请求。              |
| `disabled`                       | `boolean`                     | `false`                  | 禁用导航和每页条数调整。                                 |
| `href`                           | `(page, pageSize) => string`  | —                        | 为可寻址页面提供原生链接。                               |
| `messages`                       | `Partial<PaginationMessages>` | 内置文案                 | 覆盖标签与格式化回调。                                   |

### 事件

| 事件              | 参数                            | 用途                                         |
| ----------------- | ------------------------------- | -------------------------------------------- |
| `update:page`     | `number`                        | 提议页码。                                   |
| `update:pageSize` | `number`                        | 提议每页条数，并给出包含原先首条记录的页码。 |
| `change`          | `PaginationChange, MouseEvent?` | 报告请求的页码与条数，不改变已接受的属性。   |

`messages` 接受字符串字段 `label`、`previous`、`next`、`pageSize`、`pending`，以及回调 `page(formattedPage)`、`current(formattedPage, formattedCount)` 和 `range(formattedStart, formattedEnd, formattedTotal)`。

### 插槽

| 插槽      | 作用域                  | 用途                                         |
| --------- | ----------------------- | -------------------------------------------- |
| `summary` | `{ start, end, total }` | 替换结果范围。值为数字，不是格式化后的文字。 |

### 方法

`Pagination` 不提供方法。绑定 `page` 与 `pageSize`，或在请求需要接受时处理 `change`。

## 样式

组件没有项目特有的 CSS 自定义属性。它将当前页映射为 tonal Button 样式，普通页码使用文字按钮，辅助文字使用 Label Large 与 Body Small 角色。它读取共享的 touch-target 与密度 token，因此修改这些 token 会影响所有分页实例。

通过 `class` 或 `style` 测量并约束根元素；组件依据自身宽度而非视口断点切换呈现。页面中有多个分页器时，为每个导航区域设置不同的 `messages.label`，不要依赖继承的 `class` 或 `style` 来区分区域名称。

## Material 参考

[Buttons 指南](https://m3.material.io/components/buttons/guidelines) · [Icon buttons 无障碍](https://m3.material.io/components/icon-buttons/accessibility) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
