<script setup lang="ts">
import ListExample from '../../components/demos/ListExample.vue'
import ListContentExample from '../../components/demos/ListContentExample.vue'
import ListSelectionExample from '../../components/demos/ListSelectionExample.vue'
</script>

# Lists

List 以连续、便于浏览的序列呈现相关项目。根据每行的用途选择静态条目、操作或选择选项。

## 交互示例

### 操作列表与展开条目

<div class="vp-raw yam3x-doc-demo-theme"><ListExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ListExample.vue{vue}

:::

### 内容列表

<div class="vp-raw yam3x-doc-demo-theme"><ListContentExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ListContentExample.vue{vue}

:::

### 选择列表与表单

<div class="vp-raw yam3x-doc-demo-theme"><ListSelectionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ListSelectionExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ActionList, ListAction } from './components/yam3x/list'
</script>

<template>
  <ActionList aria-label="邮件操作">
    <ListAction>
      草稿
      <template #actions>
        <button
          type="button"
          aria-label="草稿更多操作"
          style="min-width: 48px; min-height: 48px"
        >
          ⋮
        </button>
      </template>
    </ListAction>
  </ActionList>
</template>
```

## API

`ExpandableListItem` 的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

`List` 和 `ActionList` 接受 `variant="standard" | "segmented"`。`ListItem` 是静态条目；`ListAction` 渲染原生按钮，设置 `href` 后渲染链接。`ActionList` 提供用于独立尾随控件的 `actions` 插槽。这些组件以及 `SelectionList`、`ListOption`、`ExpandableListItem` 均由 `./components/yam3x/list` 导出。

条目默认使用 `lines="auto"`；需要固定基准布局时可设为 `one`、`two` 或 `three`。`SelectionList` 必须设置无障碍名称 `label`；`mode` 默认为 `single`，`multiple` 启用独立多选。其 `v-model` 是字符串、`null` 或字符串数组。每个 `ListOption` 都需要稳定且唯一的 `value`。设置 `name` 可提交选中值，`form` 可关联外部表单，`required` 可启用原生校验；校验不依赖 `name`。

`ExpandableListItem` 接受 `v-model:open`、`items` 插槽、`current` 和 `presentation="fullScreen"`。默认的行内展开及可选的全屏 container transform 属于项目扩展。`ListItem`、`ListAction`、`ListOption` 和 `ExpandableListItem` 接受 `dragged`，用于展示外部排序系统的拖动状态；组件不实现排序。

## 行为与无障碍

辅助文字最多换行三行，超出后截断；行布局会匹配一行、两行或三行内容。主内容区应保留最宽空间；自定义操作需要描述用途的名称，交互目标至少为 48 × 48px。避免嵌套会打断行导航或造成焦点顺序不清晰的控件。

展开会显示子项。`current` 独立设置 `aria-current="page"` 和目的地选中状态。全屏模式下，通过 `fullScreenTitle`、`#full-screen-title` 插槽或根组件的 `aria-label` 为对话框命名；后者也用作可见标题的回退值。打开时焦点限制在对话框内；Escape 或返回按钮可关闭。

## 样式

标准列表需要显式水平分隔线时，可在 `<li class="yam3x-list-divider" role="separator">` 中放置[分隔线](/zh/components/divider)。默认逻辑起始和末尾内缩量均为 16px。分段列表改用条目间距。条目填满父容器宽度；周围布局负责列数和文本行长。

## Material 参考

[Lists 概览](https://m3.material.io/components/lists/overview) · [指南](https://m3.material.io/components/lists/guidelines) · [规格](https://m3.material.io/components/lists/specs) · [无障碍](https://m3.material.io/components/lists/accessibility)
