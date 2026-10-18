<script setup lang="ts">
import DataTableExample from '../../components/demos/DataTableExample.vue'
</script>

# Data table

`DataTable` 是用于比较记录的项目拓展组件，支持列筛选、排序、选择与可选分页。它采用原生 HTML table 和独立控件。排版、颜色及控件样式遵循已采用的 Material 3 Expressive 规范；表格自身的几何与行为属于项目决策。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><DataTableExample /></div>

::: details 查看示例源码

<<< ../../components/demos/DataTableExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  DataTable,
  type DataTableColumn,
  type DataTableKey,
  type DataTableFilters,
  type DataTableSort,
} from './components/yam3x/data-table'
interface Project {
  id: string
  name: string
  budget: number
}
const rows: Project[] = [
  { id: 'atlas', name: '地图集', budget: 1250 },
  { id: 'beacon', name: '灯塔', budget: 340 },
]
const columns: DataTableColumn<Project>[] = [
  { id: 'name', label: '项目', value: (row) => row.name, rowHeader: true, sortable: true },
  {
    id: 'budget',
    label: '预算',
    value: (row) => row.budget,
    numeric: true,
    sortable: true,
    filter: {
      options: [
        { value: 1250, label: '1,250' },
        { value: 340, label: '340' },
      ],
    },
  },
]
const sort = ref<DataTableSort | null>(null)
const filters = ref<DataTableFilters>({})
const page = ref(1)
const pageSize = ref(10)
const selected = ref<DataTableKey[]>([])
</script>

<template>
  <DataTable
    v-model:sort="sort"
    v-model:filters="filters"
    v-model:page="page"
    v-model:page-size="pageSize"
    v-model:selected-keys="selected"
    caption="项目预算"
    :columns="columns"
    :rows="rows"
    :row-key="(row) => row.id"
    selectable
    paginated
  />
</template>
```

查询和选择属性描述已接受的状态。像示例一样绑定模型，可立即接受本地请求。若不接受发出的更新，表格保留原有顺序、页码与选择，不维护另一份内部选择或查询缓存。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

| 属性               | 默认值                        | 用途                                                                       |
| ------------------ | ----------------------------- | -------------------------------------------------------------------------- |
| `caption`          | 必需                          | 可见的 Title Medium 标题，与表格和滚动区域关联。                           |
| `columns`          | 必需                          | 非空的 `DataTableColumn<T>` 数组，各 ID 唯一。                             |
| `rows`             | 必需                          | 完整的客户端集合，或已接受的服务端页面。                                   |
| `rowKey`           | 必需                          | `(row) => string \| number`；键唯一，排序和分页时保持稳定。                |
| `rowLabel`         | 行标题/第一列文字，再回退到键 | 行选择的无障碍名称。                                                       |
| `mode`             | `client`                      | `client` 在本地筛选、排序和分页；`server` 原样呈现传入记录。               |
| `sort`             | `null`                        | `{ column, direction: 'ascending' \| 'descending' }` 或 null。             |
| `filters`          | 未定义                        | 已接受的 `DataTableFilters`：列 ID 映射到只读的字符串/数字选项键数组。     |
| `selectable`       | `false`                       | 显示行复选框及当前页全选控件。                                             |
| `selectedKeys`     | `[]`                          | 已接受的键，包括其他页的键。                                               |
| `isRowSelectable`  | 所有行                        | `(row) => boolean`；false 禁用选择，但不移除已保留的键。                   |
| `paginated`        | `false`                       | 已接受的页面有记录时，组合项目的 Pagination 控件。                         |
| `page`、`pageSize` | `1`、`10`                     | 已接受的页码和每页数量；排序和筛选请求回到第一页。                         |
| `pageSizes`        | `[]`                          | 可选的每页数量选项。                                                       |
| `total`            | 客户端筛选后的记录数量        | 服务端分页时必须提供已知总数；客户端模式忽略该值。                         |
| `loading`          | `false`                       | 显示分组进度与状态、标记表格忙碌；保留已有记录，暂停排序、筛选和翻页请求。 |
| `error`            | 空                            | 应用提供的失败文字及重试操作。                                             |
| `emptyKind`        | `empty`                       | `empty` 表示空集合，`filtered` 表示无匹配结果。                            |
| `disabled`         | `false`                       | 禁用内置查询、选择和恢复控件。                                             |
| `locale`           | Provider → `en-US`            | 内置中英文文案与本地文字比较。                                             |
| `messages`         | 内置文案                      | 部分 `DataTableMessages`，覆盖状态、选择名称与说明。                       |

列包含 `id`、`label`，以及可选的 `value(row)`、`format(value, row)`、`supporting(row)`、`sortable`、`compare(leftRow, rightRow)`、`numeric`、`rowHeader` 和 CSS `width`。值可以是文字、数值、布尔值、Date、null 或 undefined。格式化函数负责货币和日期等领域显示；默认使用 `String(value)`，空值显示为空。`supporting` 添加 Body Small 辅助文字。`numeric` 使用尾端对齐及等宽数字。`rowHeader` 呈现原生行标题单元格。宽度是布局提示，不是截断策略。

可排序列依次切换升序、降序和传入顺序。本地比较支持数值、Date、布尔值及随语言变化的自然文字排序；空值或无效值在两个方向都位于末尾，相等值保留原有顺序。每列应使用一致的值类型，或提供 `compare` 处理领域规则。自定义比较函数自行处理缺失值。所有客户端记录先排序，再分页，不修改输入数组。客户端列筛选先于排序和分页执行；应用自有搜索也可先缩小传入集合。外部搜索变化时请重置 `page`。超出范围的页面提供返回第一页的请求。

事件：`update:sort`、`update:page` 和 `update:pageSize` 提议查询变化；`change({ sort, page, pageSize })` 报告一次完整查询请求。`update:selectedKeys(keys)` 提议完整键集合。`selectionChange({ selectedKeys, changedKeys, source })` 标识受影响的键及 `source: 'row' \| 'page'`。`retry()` 要求应用重复失败的查询。请处理重试，或通过 `#error-actions` 提供其他恢复路径。

### 列筛选

为列设置 `filter: { options, matches? }` 可显示独立筛选菜单。每个 `DataTableFilterOption` 包含唯一的 `value: string | number`、`label` 和可选 `disabled`；标签语言变化时键应保持稳定。默认比较为 `Object.is(column.value(row), optionValue)`。范围、布尔值、日期或其他领域规则可提供 `matches(row, optionValue)`。同列所选值按 OR 组合，不同活动列按 AND 组合。空数组及未配置筛选的列不增加约束。选项或列变化时，由应用协调过期键；保留的未知选项键仍会传给 `matches`。

菜单编辑临时草稿。应用操作提议草稿，清除操作提议移除该列条件，Escape 或外部关闭丢弃未应用的编辑。保留其他已接受筛选、排序和选择键；筛选请求回到第一页。触发按钮仅报告已接受的选择数量。传入集合非空但本地筛选无匹配时，自动使用筛选空状态；外部或服务端筛选使用 `emptyKind`。

`update:filters(filters)` 提议完整筛选映射。在筛选请求后，或传入 `filters` 属性时，`DataTableQuery` 与 `change` 包含可选的 `filters`；否则保留原有结构。排序和翻页请求携带已接受筛选。应用筛选和重置页码形成一次 `change` 请求，模型更新仍是独立事件。

### 插槽

`#cell-ID="{ row, column, value, rowIndex }"` 替换指定列的单元格，例如使用 `#cell-actions` 放置单独命名的行按钮。其他列保留默认格式。`rowIndex` 是已接受结果顺序中的零基索引，包含分页偏移。自定义单元格应保留可读名称，以及所选行继承的前景色。

`#actions="{ selectedKeys }"` 位于标题之前。`#empty="{ kind }"` 替换空内容展示；`#empty-actions="{ kind }"` 向默认 Empty state 添加操作。`#error-actions` 替换默认重试按钮。`#footer="{ total, selectedKeys }"` 位于分页之后；未启用服务端分页时总量可未知。自定义操作负责自身名称、行为及焦点结果。

## 行为与无障碍

排序语义参考 [WAI sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)。

### 服务端结果与选择

服务端模式下，用普通属性传入已接受的 `sort`、`filters`、`page`、`pageSize`、`rows` 和 `total`，并处理 `change`。加载期间单独保存提议的查询。成功时同时替换已接受的查询和记录；失败时保留它们并设置 `error`。示例展示了此流程。传输、超时、过期响应拒绝及取消由应用负责。直接绑定查询模型会在响应前接受提议，仅在需要立即接受时采用。

当前页全选仅修改可选择的可见记录，保留其他页及不可选择的键，不表示已选择所有服务端结果。跨页策略、清除已删除记录和批量操作由应用负责。若新筛选条件应建立不同的选择范围，请显式清除键。刷新期间，仍可选择已接受的记录。单元格和行不会获得网格焦点，也不会成为整行点击操作。选择控件不带名称，不提交表单值；原生表单重置保留已接受的键集合。需要时，由应用重置 `selectedKeys`。

加载、失败和空内容期间保留列标题。首次加载不属于空结果；刷新保留已有记录，并使用一个不定进度条表示分组进度。请求失败使用 Inline message 提供恢复。空集合与无匹配结果使用不同文案。已排序标题暴露 `aria-sort`；排序控件使用原生按钮、完整标签及形状有别的方向图示。分页记录暴露自身位置与已知总量，其中包括标题行。

带标题的滚动区域可通过键盘聚焦，并容纳横向溢出。关键列及完整单元格值始终可访问，不依赖仅悬停可用的详情。内置恢复操作消失时，若焦点仍属于它，则将焦点返回该区域。排序控件在请求等待期间保留焦点，后台变化不会从无关内容处抢回焦点。

## 样式

项目样式采用 Surface 表体、Surface Container Low 表头、Outline Variant 分隔线，以及 Secondary Container/On Secondary Container 所选行。标题使用 Title Medium，列标题使用 Title Small，单元格使用 Body Medium，辅助文字使用 Body Small。单元格水平内边距为 16 px、垂直为 12 px；行最小高度为 56 px，可随控件和换行内容增长。选择、悬停和焦点保持独立展示。

公开的 `--yam3x-data-table-min-width` 覆盖项默认为 `40rem`，可按列内容调整，例如紧凑的两列表格使用 `100%`。标题及周围操作按区域宽度换行，不随表格列横向滚动。

## Material 参考

[Menus guidelines](https://m3.material.io/components/menus/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
