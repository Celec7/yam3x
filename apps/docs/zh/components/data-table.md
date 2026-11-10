<script setup lang="ts">
import DataTableBasicExample from '../../components/demos/DataTableBasicExample.vue'
import DataTableExample from '../../components/demos/DataTableExample.vue'
import DataTableLayoutExample from '../../components/demos/DataTableLayoutExample.vue'
import DataTableServerExample from '../../components/demos/DataTableServerExample.vue'
</script>

# Data table

`DataTable` 是用于比较记录的项目拓展组件，支持列筛选、排序、选择与可选分页。它保留原生 HTML table 语义，并组合项目的 Button、Checkbox、Menu、Empty state、Inline message 与 Pagination 组件。

排版、颜色及控件样式遵循已采用的 Material 3 Expressive 规范；表格自身的几何与行为属于项目决策。

当读者需要跨多条记录比较数值时使用它；若每条记录都独立阅读，请优先使用 [List](/zh/components/list) 或 [Descriptions](/zh/components/descriptions)。传入用于比较的记录，并由 `columns` 负责标签、取值、格式化与筛选。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><DataTableBasicExample /></div>

`caption`、`columns`、`rows` 和 `row-key` 为必需属性。`format` 负责货币与日期显示，`supporting` 添加 Body Small 辅助文字，`numeric` 使用尾端对齐及等宽数字。基础表格无需模型：它按传入顺序渲染。

::: details 查看示例源码

<<< ../../components/demos/DataTableBasicExample.vue{vue}

:::

### 查询与选择

<div class="vp-raw yam3x-doc-demo-theme"><DataTableExample /></div>

查询示例在本地集合上筛选、排序、选择与分页。工具栏使空集合、被拒绝的选择请求与禁用状态可观察，已接受的键会显示在表格下方。

::: details 查看示例源码

<<< ../../components/demos/DataTableExample.vue{vue}

:::

### 服务端结果

<div class="vp-raw yam3x-doc-demo-theme"><DataTableServerExample /></div>

服务端模式原样呈现传入页面。示例请求一次结果，然后接受或拒绝响应，因此保留的记录、排序与页码都可观察。

::: details 查看示例源码

<<< ../../components/demos/DataTableServerExample.vue{vue}

:::

### 固定表头与列

<div class="vp-raw yam3x-doc-demo-theme"><DataTableLayoutExample /></div>

布局示例用 `max-height="16rem"` 限定滚动区域，将表头保留在块起始端，并在逻辑起始端与结束端固定列。RTL 控件会镜像两端，footer 插槽报告总量与已接受的选择。

::: details 查看示例源码

<<< ../../components/demos/DataTableLayoutExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；示例源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { DataTable, type DataTableColumn } from './components/yam3x/data-table'

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
  { id: 'name', label: '项目', value: (row) => row.name, rowHeader: true },
  {
    id: 'budget',
    label: '预算',
    value: (row) => row.budget,
    numeric: true,
    format: (value) => `$${value}`,
  },
]
</script>

<template>
  <DataTable
    caption="项目预算"
    :columns="columns"
    :rows="rows"
    :row-key="(row) => row.id"
  />
</template>
```

::: details 绑定查询模型

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

:::

查询和选择属性描述已接受的状态。像上面这样绑定模型，可立即接受本地请求。若不接受发出的更新，表格保留原有顺序、页码与选择，不维护另一份内部选择或查询缓存。

::: details 服务端模式

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { DataTable, type DataTableColumn, type DataTableQuery } from './components/yam3x/data-table'

interface Project {
  id: string
  name: string
  budget: number
}

const columns: DataTableColumn<Project>[] = [
  { id: 'name', label: '项目', value: (row) => row.name, rowHeader: true, sortable: true },
  { id: 'budget', label: '预算', value: (row) => row.budget, numeric: true, sortable: true },
]
const rows = shallowRef<Project[]>([])
const total = ref(0)
const error = ref('')
const loading = ref(false)
const accepted = ref<DataTableQuery>({ sort: null, page: 1, pageSize: 10 })

async function onChange(query: DataTableQuery) {
  loading.value = true
  error.value = ''
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    ...(query.sort ? { sort: query.sort.column, direction: query.sort.direction } : {}),
  })
  try {
    const response = await fetch(`/api/projects?${params}`)
    if (!response.ok) throw new Error(String(response.status))
    const page = (await response.json()) as { rows: Project[]; total: number }
    accepted.value = query
    rows.value = page.rows
    total.value = page.total
  } catch {
    error.value = '无法加载记录，请重试以重新请求。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <DataTable
    mode="server"
    caption="已接受的服务端结果"
    :columns="columns"
    :rows="rows"
    :row-key="(row) => row.id"
    :sort="accepted.sort"
    :page="accepted.page"
    :page-size="accepted.pageSize"
    :total="total"
    :loading="loading"
    :error="error"
    paginated
    @change="onChange"
    @retry="onChange(accepted)"
  />
</template>
```

:::

## 行为与无障碍

排序语义参考 [WAI sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)。

### 排序与分页

- 可排序列依次切换升序、降序和传入顺序。
- 本地比较支持数值、Date、布尔值及随语言变化的自然文字排序；空值或无效值在两个方向都位于末尾，相等值保留原有顺序。
- 每列应使用一致的值类型，或提供 `compare` 处理领域规则。自定义比较函数自行处理缺失值。
- 所有客户端记录先排序，再分页，不修改输入数组。
- 客户端列筛选先于排序和分页执行；应用自有搜索也可先缩小传入集合。该搜索变化时请重置 `page`。
- 超出范围的页面提供返回第一页的请求。
- 分页记录暴露自身位置与已知总量，其中包括标题行。
- 已排序标题暴露 `aria-sort`；排序使用紧凑的文本 Button，提供圆形悬浮反馈、独立焦点环及形状有别的方向图示。状态层跟随操作本身，不铺满标题单元格。

### 选择

- 当前页全选仅修改可选择的可见记录，保留其他页及不可选择的键，不表示已选择所有服务端结果。
- 跨页策略、清除已删除记录和批量操作由应用负责。若新筛选条件应建立不同的选择范围，请显式清除键。
- 刷新期间，仍可选择已接受的记录。
- 单元格和行不会获得网格焦点，也不会成为整行点击操作。
- 选择控件不带名称，不提交表单值；原生表单重置保留已接受的键集合。需要时，由应用重置 `selectedKeys`。

### 加载、空与错误状态

- 加载、失败和空内容期间保留列标题。
- 首次加载不属于空结果。刷新保留已有记录，并使用一个不定进度条表示分组进度。
- 请求失败使用 Inline message 提供恢复。空集合与无匹配结果使用不同文案。
- 内置恢复操作消失时，若带标题的滚动区域仍拥有焦点，则将焦点返回该区域。
- 排序控件在请求等待期间保留焦点，后台变化不会从无关内容处抢回焦点。

### 键盘与焦点

- 带标题的滚动区域可通过键盘聚焦，并容纳横向溢出，因此关键列及完整单元格值始终可访问，不依赖仅悬停可用的详情。
- 排序按钮与筛选触发按钮是表头内的 Tab 停靠点；列标题本身不可聚焦。
- Escape 或外部关闭会丢弃筛选编辑，并将焦点返回触发按钮。

### 响应式与 RTL

- `sticky-header` 将表头保留在表格自身滚动区域内，不会将它吸附到页面视口。
- 低于 `--yam3x-data-table-min-width` 时，滚动区域承载横向溢出；标题及周围操作按区域宽度换行，不随表格列横向滚动。
- 源码顺序中，起始端固定列排在前面，结束端固定列排在最后。RTL 自动镜像两端；有起始端固定列时，选择列也保留在起始端。
- 列 `width` 是布局提示，不是截断策略。较长的单元格值会换行并保持可用。
- 如果固定组总宽度占满滚动区域，就解除行内固定，各列仍可通过滚动访问；表头固定保留。

### 状态归属

表格完全受控：它渲染已接受状态并提议变更，不保存自己的查询或选择。服务端模式下，用普通属性传入已接受的 `sort`、`filters`、`page`、`pageSize`、`rows` 和 `total`，并处理 `change`；加载期间单独保存提议的查询，成功时同时替换已接受的查询和记录，失败时保留它们并设置 `error`。传输、超时、过期响应拒绝及取消由应用负责。直接绑定查询模型会在响应前接受提议，仅在需要立即接受时采用。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                    | 类型 | 用途                                                            |
| ----------------------- | ---- | --------------------------------------------------------------- |
| `DataTable`             | 组件 | 渲染表格、查询控件、选择与分页。                                |
| `DataTableColumn`       | 类型 | 声明列、取值函数、格式化与筛选。                                |
| `DataTableCell`         | 类型 | 单元格插槽作用域：行、列、值与行索引。                          |
| `DataTableColumnFilter` | 类型 | 列筛选选项与可选的自定义匹配。                                  |
| `DataTableFilterOption` | 类型 | 一个稳定筛选键及其可见标签。                                    |
| `DataTableFilters`      | 类型 | 已接受的列 ID 到所选筛选键的映射。                              |
| `DataTableKey`          | 类型 | 稳定的字符串或数字行标识。                                      |
| `DataTableMessages`     | 类型 | 内置文案的部分覆盖。                                            |
| `DataTableQuery`        | 类型 | 完整的排序、筛选、页码与每页数量请求。                          |
| `DataTableSelection`    | 类型 | 选择事件中的已选、变更与来源键。                                |
| `DataTableSort`         | 类型 | 排序列与升序/降序方向。                                         |
| `DataTableValue`        | 类型 | 可比较的单元格值：文本、数字、布尔值、Date、null 或 undefined。 |

### 属性与模型

| 属性与模型         | 默认值                        | 用途                                                                       |
| ------------------ | ----------------------------- | -------------------------------------------------------------------------- |
| `caption`          | 必需                          | 可见的 Title Medium 标题，与表格和滚动区域关联。                           |
| `columns`          | 必需                          | 非空的 `DataTableColumn<T>` 数组，各 ID 唯一。                             |
| `rows`             | 必需                          | 完整的客户端集合，或已接受的服务端页面。                                   |
| `rowKey`           | 必需                          | `(row) => string \| number`；键唯一，排序和分页时保持稳定。                |
| `rowLabel`         | 行标题/第一列文字，再回退到键 | 行选择的无障碍名称。                                                       |
| `mode`             | `client`                      | `client` 在本地筛选、排序和分页；`server` 原样呈现传入记录。               |
| `sort`             | `null`                        | `{ column, direction: 'ascending' \| 'descending' }` 或 null。             |
| `filters`          | 未定义                        | 已接受的 `DataTableFilters`：列 ID 映射到只读的字符串/数字选项键数组。     |
| `stickyHeader`     | `false`                       | 将列标题保留在表格自身滚动区域的块起始端。                                 |
| `maxHeight`        | 未定义                        | 区域的 CSS 最大块尺寸，例如 `24rem`；需要时启用纵向滚动。                  |
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

### 列

| 字段         | 类型                            | 用途                                                    |
| ------------ | ------------------------------- | ------------------------------------------------------- |
| `id`         | `string`                        | 唯一列 ID，也用于筛选和 `#cell-ID`。                    |
| `label`      | `string`                        | 静态表头文字。                                          |
| `value`      | `(row) => DataTableValue`       | 单元格值：文字、数值、布尔值、Date、null 或 undefined。 |
| `format`     | `(value, row) => string`        | 显示文字；负责领域相关的货币与日期格式。                |
| `supporting` | `(row) => string`               | 单元格值下方的 Body Small 辅助文字。                    |
| `sortable`   | `boolean`                       | 依次切换升序、降序和传入顺序。                          |
| `compare`    | `(leftRow, rightRow) => number` | 领域专用排序，替换本地比较。                            |
| `numeric`    | `boolean`                       | 尾端对齐单元格并使用等宽数字。                          |
| `rowHeader`  | `boolean`                       | 呈现原生行标题单元格。                                  |
| `filter`     | `DataTableColumnFilter<T>`      | 该列的独立筛选菜单。                                    |
| `fixed`      | `'start' \| 'end'`              | 将列固定到滚动区域的逻辑边缘。                          |
| `width`      | `string`                        | 布局用 CSS 宽度提示，不是截断策略。                     |

默认显示为 `String(value)`，空值显示为空。

### 列筛选

为列设置 `filter: { options, matches? }` 可显示独立筛选菜单。每个 `DataTableFilterOption` 包含唯一的 `value: string | number`、`label` 和可选 `disabled`；标签语言变化时键应保持稳定。

::: details 比较、草稿与请求行为

默认比较为 `Object.is(column.value(row), optionValue)`。范围、布尔值、日期或其他领域规则可提供 `matches(row, optionValue)`。同列所选值按 OR 组合，不同活动列按 AND 组合。空数组及未配置筛选的列不增加约束。选项或列变化时，由应用协调过期键；保留的未知选项键仍会传给 `matches`。

菜单编辑临时草稿。应用操作提议草稿，清除操作提议移除该列条件，Escape 或外部关闭丢弃未应用的编辑。保留其他已接受筛选、排序和选择键；筛选请求回到第一页。触发按钮仅报告已接受的选择数量。传入集合非空但本地筛选无匹配时，自动使用筛选空状态；外部或服务端筛选使用 `emptyKind`。

排序和翻页请求携带已接受筛选。应用筛选和重置页码形成一次 `change` 请求，模型更新仍是独立事件。

:::

### 事件

| 事件与模型            | 载荷                    | 用途                                                                 |
| --------------------- | ----------------------- | -------------------------------------------------------------------- |
| `update:sort`         | `DataTableSort \| null` | 提议排序变化。                                                       |
| `update:page`         | `number`                | 提议页码变化。                                                       |
| `update:pageSize`     | `number`                | 提议每页数量变化。                                                   |
| `update:filters`      | `DataTableFilters`      | 提议完整筛选映射。                                                   |
| `change`              | `DataTableQuery`        | 一次完整请求的查询，包含 `sort`、`page` 和 `pageSize`。              |
| `update:selectedKeys` | `DataTableKey[]`        | 提议完整键集合。                                                     |
| `selectionChange`     | `DataTableSelection`    | `{ selectedKeys, changedKeys, source }`，`source: 'row' \| 'page'`。 |
| `retry`               | —                       | 要求应用重复失败的查询。                                             |

筛选请求或传入 `filters` 属性时，`change` 查询包含 `filters`；否则省略该属性。

### 插槽

| 插槽            | 作用域                             | 用途                                                  |
| --------------- | ---------------------------------- | ----------------------------------------------------- |
| `actions`       | `{ selectedKeys }`                 | 位于标题之前。                                        |
| `cell-ID`       | `{ row, column, value, rowIndex }` | 替换指定列的单元格，例如 `#cell-actions` 放置行按钮。 |
| `empty`         | `{ kind }`                         | 替换空内容展示。                                      |
| `empty-actions` | `{ kind }`                         | 向默认 Empty state 添加操作。                         |
| `error-actions` | —                                  | 替换默认重试按钮。                                    |
| `footer`        | `{ total, selectedKeys }`          | 位于分页之后；未启用服务端分页时总量可未知。          |

`cell-ID` 中其他列保留默认格式。`rowIndex` 是已接受结果顺序中的零基索引，包含分页偏移。自定义单元格应保留可读名称，以及所选行继承的前景色。自定义操作负责自身名称、行为及焦点结果。

### 方法

`DataTable` 不暴露实例方法。恢复能力由 `retry` 事件提供：请处理该事件，或通过 `#error-actions` 提供其他恢复路径。

## 样式

项目样式采用 Surface 表体、Surface Container Low 表头、Outline Variant 分隔线，以及 Secondary Container/On Secondary Container 所选行。标题使用 Title Medium，静态列标题使用 Title Small，排序操作采用文本 Button 的角色，单元格使用 Body Medium，辅助文字使用 Body Small。单元格水平内边距为 16 px、垂直为 12 px；行最小高度为 56 px，可随控件和换行内容增长。选择、悬停和焦点保持独立展示。

::: details 覆盖项与测量几何

公开的 `--yam3x-data-table-min-width` 覆盖项默认为 `40rem`，可按列内容调整，例如紧凑的两列表格使用 `100%`。标题及周围操作按区域宽度换行，不随表格列横向滚动。

可选择的首列宽度由共享 touch-target token 加两侧水平内边距计算，既保留 48 px 控件目标，也会随密度收窄。可筛选表头使用共享 spacing token 的 8 px 尾部内边距，排序方向图标为 20 px。固定单元格继承表头或所选/悬停行的表面，每个交互控件仅保留一份。固定列偏移来自实际渲染的表头单元格，不是独立的固定值，并会在尺寸或内容变化后更新。

:::

## Material 参考

[Buttons specs](https://m3.material.io/components/buttons/specs) · [Menus guidelines](https://m3.material.io/components/menus/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
