<script setup lang="ts">
import LocalizationExample from '../../components/demos/LocalizationExample.vue'
</script>

# 本地化

`LocaleProvider` 是项目扩展，用于在 Vue 子树中共享内置界面语言和文案覆盖。它可以统一配置相关组件，同时将应用内容、翻译和组件行为分离。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><LocalizationExample /></div>

::: details 查看示例源码

<<< ../../components/demos/LocalizationExample.vue{vue}

:::

## 在项目中使用

完成[安装](/zh/guide/installation)后，将 `localization` 与所需组件一起添加。安装已迁移的组件会复制其内部本地化依赖；添加 `localization` 可获得公开 provider 入口。

已有应用升级时，请按[更新复制的源码](/zh/guide/updating)合并参与组件；CLI 会保留现有文件，仅添加 provider 不会改写原来的组件。

```sh
pnpm dlx @celec7/yam3x@latest add localization pagination
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LocaleProvider, type LocaleOverrides } from './components/yam3x/localization'
import { Pagination } from './components/yam3x/pagination'

const locale = ref('zh-CN')
const messages: LocaleOverrides = { pagination: { next: '继续浏览' } }
</script>

<template>
  <LocaleProvider
    :locale="locale"
    :messages="messages"
  >
    <Pagination :total="200" />
  </LocaleProvider>
</template>
```

应用翻译请保存在独立文件中，并传入响应式文案对象。函数型文案保留参数类型，因此应用可适配已有翻译库，而不必让复制的组件依赖该库。

## API

| 属性       | 默认值                        | 用途                                                                                                                                                        |
| ---------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`   | 父 provider，再回退到 `en-US` | BCP 47 语言标记，用于选择内置文案及组件已有的语言敏感操作。                                                                                                 |
| `messages` | 继承的覆盖项                  | `LocaleOverrides`，以 `calendar`、`numberField`、`pagination`、`form`、`fileUpload`、`dataTable` 和 `treeView` 为键的部分对象；各命名空间接受部分文案覆盖。 |

默认插槽直接渲染子内容，不增加 DOM 元素。provider 没有模型、事件或公开方法。`LocaleMessages` 描述完整的命名空间契约；原有的组件文案类型导出继续可用。

目前支持 provider 的组件包括 [Calendar](/zh/components/calendar)、[Number field](/zh/components/number-field)、[Pagination](/zh/components/pagination)、[Form](/zh/components/form)、[File upload](/zh/components/file-upload)、[Data table](/zh/components/data-table) 和 [Tree view](/zh/components/tree-view)。其他组件保留各自的语言和标签 API。

`numberField` 的 `rangeUnderflow(minimum)`、`rangeOverflow(maximum)`、`increment(label)` 和 `decrement(label)` 是函数，接收已格式化边界值或字段标签。Number field 自身的 `messages` 继续接受原有字符串，并优先于 provider 文案。

`calendar` 的 `choosePeriod(period)`、`chooseMonth(year)` 和 `chooseYear(period)` 接收已格式化的周期或年份。Calendar 现有的独立标签属性优先于 provider 文案。Calendar 未配置 provider 时保留浏览器语言默认值，服务端回退到 `en-US`；SSR 应显式配置相同语言。

## 行为与无障碍

对每个已支持的组件，配置按以下顺序解析：

1. 组件 `locale`、最近 provider 的 `locale`，再回退到组件独立默认值（`en-US`；Calendar 在客户端使用浏览器语言）。
2. 内置英文文案，再叠加适用语言的内置文案。
3. 同语言的父 provider 覆盖、最近 provider 覆盖、组件 `messages`。

英文和简体中文文案分别位于 `localization/locales/` 中。中文语言标记使用简体中文默认文案；需要其他中文翻译时请提供覆盖。其他有效标记保留语言敏感格式化行为，未翻译条目使用英文。无效语言标记回退到 `en-US`。省略或设为 `undefined` 的文案条目执行回退，空字符串则表示显式覆盖。

嵌套 provider 在语言相同时继承文案覆盖，包括不同地区的标记。切换语言后，从对应语言默认文案开始，不携带父级其他语言的覆盖。组件显式指定其他语言时，也会排除来自不同语言 provider 的文案。

配置更新具有响应性，不重新挂载控件，也不重置页码、选择、勾选、队列或表单值。已生成的错误消息和适配器结果仍保留来源快照；语言变化不会重新验证或重试请求。不同 provider 树的配置相互独立，服务端渲染时也如此。

provider 翻译内置界面文案，不翻译应用标签、记录数据、浏览器原生验证消息或服务端错误。请由应用设置文档或区域的 `lang` 和 `dir`；不产生外层元素的 Vue provider 不修改 DOM 语言或书写方向。

## 样式

provider 不增加元素或样式入口。子组件保留各自的 token 和公开覆盖项。
