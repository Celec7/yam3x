<script setup lang="ts">
import PaginationExample from '../../components/demos/PaginationExample.vue'
</script>

# Pagination

`Pagination` 是项目拓展组件，用于已知结果总数的集合，组合 Material 按钮、图标按钮及可选的每页条数选择器。它不获取数据，也不会为只有游标的服务虚构页数。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><PaginationExample /></div>

::: details 查看示例源码

<<< ../../components/demos/PaginationExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Pagination, type PaginationChange } from './components/yam3x/pagination'
const page = ref(1)
const pageSize = ref(10)
function showPage(next: PaginationChange) {
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
    @change="showPage"
  />
</template>
```

同步的本地结果也可使用 `v-model:page` 和 `v-model:page-size`。异步结果应传入已接受的 `page` 与 `pageSize`，加载时设置 `pending`，仅在成功后同时应用新值。失败时保留之前的记录及当前页标记，并在结果区域提供恢复反馈。应用负责取消及过期结果保护。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

| 属性        | 默认值             | 用途                                                                       |
| ----------- | ------------------ | -------------------------------------------------------------------------- |
| `total`     | 必需               | 已知记录总数，非负安全整数。                                               |
| `page`      | `1`                | 已接受的页码，从 1 开始。需处于可用范围内；空结果使用 1。                  |
| `pageSize`  | `10`               | 正安全整数。                                                               |
| `pageSizes` | `[]`               | 可选每页条数；非空数组启用选择器。当前值始终包含在内，重复和无效项会移除。 |
| `locale`    | Provider → `en-US` | 数字格式语言；默认提供英文或中文消息。                                     |
| `pending`   | `false`            | 显示加载状态并阻止重复请求。                                               |
| `disabled`  | `false`            | 禁用导航及每页条数调整。                                                   |
| `href`      | 无                 | `(page, pageSize) => string`，为可寻址页面提供原生链接。                   |
| `messages`  | 英文或中文         | 覆盖标签和格式化回调，详见下文。                                           |

`change({ page, pageSize }, event?)` 报告请求，不直接改变已接受的属性。`update:page` 和 `update:pageSize` 支持 Vue 模型绑定。改变每页条数会请求包含原先首条可见记录的页码。请求已经展示的页面不会产生操作。

提供 `href` 时，普通点击保留原生链接跳转。`change` 的可选第二参数是原生鼠标事件；客户端路由可调用 `event.preventDefault()`。带修饰键的点击保留原生行为，不为当前视图触发请求。未提供 `href` 时使用按钮。上一页和下一页拥有独立的无障碍名称及工具提示。

`messages` 接受字符串字段 `label`、`previous`、`next`、`pageSize` 和 `pending`，以及回调 `page(formattedPage)`、`current(formattedPage, formattedCount)` 和 `range(formattedStart, formattedEnd, formattedTotal)`。回调参数是本地化字符串。其他语言默认使用英文文案，需自行覆盖。组件导出 `PaginationChange` 和 `PaginationMessages`。

`#summary="{ start, end, total }"` 插槽替换结果范围，插槽参数为数字。属性应用于根元素，因此多个实例可设置各自的类和样式。通过 `messages.label` 区分导航区域。

## 行为与无障碍

页码窗口包含首页、末页、当前页及相邻页。省略号不是控件。当实测内容无法放入容器时，同一组上一页和下一页控件围绕当前页及总页数摘要显示；此时数字页码不进入焦点顺序，也不会暴露给辅助技术。当前页使用 `aria-current="page"`，不使用切换按钮语义。调整尺寸保留已接受页码，并在需要时将焦点移到等价的当前页展示元素。

零结果显示零范围且没有数字页码操作。只有一页时省略冗余导航。如果总数缩减到已接受页码之外，应用需确定有效页码：组件不会自动发出请求、不会虚构当前页标记，并在纠正前禁用导航。每页条数选择器和范围摘要独立于主要导航换行。

组件使用等宽数字、预留独立的 48 px 目标区域，并在 RTL 下镜像方向图标。页码按钮保持普通 Tab 顺序，不添加网格式方向键操作。等待状态保留已接受页码标记，并提供状态消息。应用负责替换结果内容后的焦点安排。

## 样式

当前页使用已采用的 tonal Button 样式，其他页码使用文字按钮。容器通过测量适配，不依赖视口断点。可通过根元素的 `class` 或 `style` 设置宽度；文字、次要控件和紧凑摘要可增长或换行，不缩小操作目标。

## Material 参考

[Buttons guidelines](https://m3.material.io/components/buttons/guidelines) · [Icon buttons accessibility](https://m3.material.io/components/icon-buttons/accessibility) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
