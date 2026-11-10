<script setup lang="ts">
import LocalizationExample from '../../components/demos/LocalizationExample.vue'
import LocalizationOverridesExample from '../../components/demos/LocalizationOverridesExample.vue'
</script>

# 本地化

`LocaleProvider` 是项目扩展，用于在 Vue 子树中共享内置界面语言和文案覆盖。它翻译组件生成的文案，例如操作名称、空状态和验证提示；不会翻译应用标签、记录数据或服务端错误。

需要统一配置相关组件时使用它。单个实例优先使用组件自身的 `locale`、`messages` 或标签属性。Material 未定义本地化 provider；组件映射和优先级规则由项目决定。

## 示例

### Provider 与继承

<div class="vp-raw yam3x-doc-demo-theme"><LocalizationExample /></div>

::: details 查看演示源码

<<< ../../components/demos/LocalizationExample.vue{vue}

:::

切换继承语言时，页面、文件、数字、选择和表单状态保持不变。嵌套英文 provider 在外层语言变化后仍保留自己的分页文案。示例还展示了应用标签保持应用语言，而内置文案随之翻译。

### 组件覆盖

<div class="vp-raw yam3x-doc-demo-theme"><LocalizationOverridesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/LocalizationOverridesExample.vue{vue}

:::

一个 provider 设置 `en-US` 并覆盖分页 `next` 文案。组件 `locale` 替换该实例的语言，组件 `messages` 条目则同时替换两者。省略的条目执行回退；空字符串表示显式覆盖。

## 在应用中使用

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
const messages = ref<LocaleOverrides>({ pagination: { next: '继续浏览' } })
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

::: details 服务端渲染

为服务端和客户端选择同一个显式语言：

```vue
<script setup lang="ts">
import { LocaleProvider } from './components/yam3x/localization'
</script>

<template>
  <LocaleProvider locale="en-US">
    <slot />
  </LocaleProvider>
</template>
```

服务端渲染时，不同 provider 树保持独立配置。未配置 provider 时，Calendar、Date input、Date pickers 和 Time pickers 使用浏览器语言回退；请在两端设置相同的显式语言，避免水合不一致。

:::

## 行为与无障碍

### 解析顺序

对每个已支持的组件，配置按以下顺序解析：

1. 组件 `locale`、最近 provider 的 `locale`，再回退到组件独立默认值（`en-US`；Calendar、Date input、Date pickers 和 Time pickers 在客户端使用浏览器语言）。
2. 内置英文文案，再叠加适用语言的内置文案。
3. 同语言的父 provider 覆盖、最近 provider 覆盖、组件 `messages` 或独立标签/文案属性。

组件显式指定其他语言时，会排除来自不同语言 provider 的文案。嵌套 provider 在语言相同时继承文案覆盖，包括不同地区的标记。

### 语言包与回退

- 内置翻译分别位于 `localization/locales/` 中。英文和简体中文覆盖所有已支持的命名空间。
- 其他部分语言包保留 Date input 的 `ar`、`de`、`es`、`fr`、`it`、`ja`、`ko`、`pt` 和 `ru` 组标签。
- 中文语言标记使用简体中文默认文案；需要其他中文翻译时请提供覆盖。
- 其他有效标记保留语言敏感格式化行为，未翻译条目使用英文。无效语言标记回退到 `en-US`。
- 省略或设为 `undefined` 的文案条目执行回退。空字符串表示显式覆盖。

### 响应性

配置更新具有响应性，不重新挂载控件，也不重置页码、选择、勾选、队列或表单值。已存储的错误消息和适配器结果仍保留来源快照。Date input 当前错误等计算得到的验证反馈会跟随活动语言包更新。语言变化不会重新启动 Form 验证适配器或重试请求。

### 作用域与 SSR

provider 翻译内置界面文案，不翻译应用标签、记录数据、浏览器原生验证消息或服务端错误。请由应用设置文档或区域的 `lang` 和 `dir`；不产生外层元素的 Vue provider 不修改 DOM 语言或书写方向。不同 provider 树的配置相互独立，服务端渲染时也如此。

### 文案命名空间

`LocaleOverrides` 对象以组件命名空间为键。每个命名空间接受部分条目；`LocaleMessages` 描述完整契约。

::: details 命名空间映射

| 命名空间       | 覆盖内容                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `actions`      | 对话框、面板、菜单、Tabs、Chip、徽章、面包屑、滑块、表单和 Snackbar 的共享操作、生成名称与角色标签。 |
| `select`       | Select 空列表文案。                                                                                  |
| `autocomplete` | 结果数量、建议名称和必选选择文案。                                                                   |
| `optionPanel`  | 加载和无数据文案。                                                                                   |
| `datePicker`   | 字段、范围、导航、模式、操作和验证文案。                                                             |
| `timePicker`   | 字段、模式、操作、对话框、表盘和验证文案。                                                           |
| `dateInput`    | 日期、时间和日期时间组标签、验证及分段名称。                                                         |
| `calendar`     | 导航、周期和范围文案。                                                                               |
| `numberField`  | 范围和步进文案；函数接收格式化边界或字段标签。                                                       |
| `pagination`   | 标签、翻页、每页数量、等待和范围文案。                                                               |
| `form`         | 摘要、验证、提交、成功和失败文案。                                                                   |
| `fileUpload`   | 选择、队列、进度、操作、拒绝和摘要文案。                                                             |
| `dataTable`    | 查询、选择、加载、空、错误和滚动文案。                                                               |
| `treeView`     | 说明、展开、勾选、加载、失败和空状态文案。                                                           |
| `treeSelect`   | 搜索、空和无结果文案。                                                                               |
| `cascader`     | 搜索、空、无结果和层级文案。                                                                         |
| `descriptions` | 空和缺失值文案。                                                                                     |

函数条目接收带类型的参数。例如 `numberField.rangeUnderflow(minimum)` 和 `rangeOverflow(maximum)` 接收格式化边界，`pagination.range(start, end, total)` 接收格式化数量。

:::

## API

### 导出

| 导出                                | 说明                             |
| ----------------------------------- | -------------------------------- |
| `LocaleProvider`                    | 向后代提供语言和文案覆盖。       |
| `LocaleMessages`、`LocaleOverrides` | 完整命名空间契约和部分覆盖映射。 |

### 属性

| 属性       | 类型              | 默认值                        | 用途                                                        |
| ---------- | ----------------- | ----------------------------- | ----------------------------------------------------------- |
| `locale`   | `string`          | 父 provider，再回退到 `en-US` | BCP 47 语言标记，用于选择内置文案及组件已有的语言敏感操作。 |
| `messages` | `LocaleOverrides` | 继承的覆盖项                  | 以组件命名空间为键的部分对象；各命名空间接受部分文案覆盖。  |

### 插槽

| 插槽      | 用途                                        |
| --------- | ------------------------------------------- |
| `default` | 直接渲染子内容，不增加 DOM 元素或外层包装。 |

provider 没有模型、事件或公开方法。原有的组件文案类型导出继续可用。

## 样式

provider 不增加元素或样式入口。子组件保留各自的 token 和公开覆盖项。
