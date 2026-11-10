<script setup lang="ts">
import DescriptionsBasicExample from '../../components/demos/DescriptionsBasicExample.vue'
import DescriptionsExample from '../../components/demos/DescriptionsExample.vue'
</script>

# Descriptions

Descriptions 用于展示单条记录的各项属性，例如项目摘要或账户详情。读者需要浏览单个条目的属性时使用它；重复行使用 [List](/zh/components/list)，比较多条记录使用 [Data table](/zh/components/data-table)。

Descriptions 是项目扩展。它是只读的信息组合，不是可编辑的 [Form](/zh/components/form)，也不是比较表格。Compose Material 3 没有 Descriptions 基元；`Column` 与 `Row`、`Text` 以及分隔线可以组成同样的结构。本项目提供原生描述列表、响应式列行为，以及空列表和缺失值的本地化文案。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><DescriptionsBasicExample /></div>

基础记录只需要 `items`。每项包含稳定的 `key`、`label` 和基本类型 `value`。可选 `title` 命名描述列表，`outlined` 在圆角表面上分组属性。

::: details 查看演示源码

<<< ../../components/demos/DescriptionsBasicExample.vue{vue}

:::

### 布局、状态与值插槽

<div class="vp-raw yam3x-doc-demo-theme"><DescriptionsExample /></div>

控件对比上下与并排标签、带边框与无边框分组、窄容器和空记录。值插槽渲染联系链接、格式化布尔值，并提供自己的缺失值文案，同时 `0` 仍作为真实值显示。整行备注在任意容器尺寸下都占据可用行。

::: details 查看演示源码

<<< ../../components/demos/DescriptionsExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'

const items: DescriptionItem[] = [
  { key: 'project', label: '项目', value: '地图集' },
  { key: 'owner', label: '负责人', value: 'Ada' },
  { key: 'budget', label: '剩余预算', value: 0 },
  { key: 'review', label: '评审日期', value: null },
  {
    key: 'notes',
    label: '备注',
    value: '容器变窄时，完整记录仍然可读。',
    fullWidth: true,
  },
]
</script>

<template>
  <Descriptions
    :items="items"
    title="项目详情"
    :columns="3"
    outlined
  />
</template>
```

标签和值由应用控制。传入已本地化的文本和已格式化的值，或使用插槽处理链接、日期和金额。

::: details 自定义值与空内容

```vue
<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'

const items: DescriptionItem[] = [
  { key: 'contact', label: '联系邮箱', value: 'ada@example.com' },
  { key: 'notifications', label: '通知', value: false },
]
</script>

<template>
  <Descriptions :items="items">
    <template #value="{ item, value }">
      <a
        v-if="item.key === 'contact'"
        :href="`mailto:${value}`"
        >{{ value }}</a
      >
      <template v-else-if="typeof value === 'boolean'">{{ value ? '开启' : '关闭' }}</template>
      <template v-else-if="value != null">{{ value }}</template>
      <template v-else>未提供</template>
    </template>
  </Descriptions>
  <Descriptions
    :items="[]"
    empty-text="尚未记录任何属性"
  />
</template>
```

`#label` 和 `#value` 替换对应内容，`#empty` 替换空列表呈现。值插槽同时负责缺失值显示和格式化。值中的链接和按钮保留原生键盘行为；属性其余部分保持静态。

:::

## 行为与无障碍

### 结构与关联

- 组件渲染原生 `dl`。每个 `dt` 后紧跟对应的 `dd`，顺序与 `items` 一致。
- 设置 `title` 会渲染 Heading，并在 `dl` 上设置 `aria-labelledby`。`headingLevel` 应与周围大纲匹配，默认 `3`。
- 没有标题时，应为分组提供邻近上下文或有描述意义的外层标题。组件不会自行生成无障碍名称。
- 静态属性没有悬浮、按下、选择或 Tab 状态。插槽中的链接和按钮保留原生键盘行为。

### 值与空状态

- `DescriptionItem.value` 接受 `string`、`number`、`boolean`、`null` 或省略。
- `0`、`false` 和 `''` 是真实值，会照常渲染。只有 `null` 和省略使用缺失值文案。
- `items` 为空数组时渲染空状态。`emptyText` 和 `missingValueText` 可覆盖本地化默认文案。
- 内置文案通过 [LocaleProvider](/zh/components/localization) 的 `descriptions` 命名空间（`empty`、`missingValue`）解析。显式 `locale` 和文案属性优先。
- `fullWidth: true` 在任意容器尺寸下占据可用行。

### 响应式布局

- 布局响应组件自身容器宽度，而不是页面视口。
- 内容宽度小于 `32rem` 时使用一列。在 `32rem`、`48rem`、`64rem` 时，布局可增加到两列、三列、四列，但不超过 `columns`。
- `stacked` 将标签放在值上方，间距随密度缩放。`inline` 并排显示，采用 `2:3` 的标签/值比例和随密度缩放的列间距。
- 标签和值允许换行。长标识符和完整值保持可读，不会被裁切。
- `outlined` 增加 1px 边框、Medium 圆角角色和内边距。边框属于分组，不属于每个属性。

### 状态归属

Descriptions 没有模型，也不提交数据。应用拥有标签、值、格式化、本地化以及插槽中的操作。值需要编辑时应使用 Form field。

## API

### 导出

| 导出              | 类型 | 用途                       |
| ----------------- | ---- | -------------------------- |
| `Descriptions`    | 组件 | 单条记录的带标签属性。     |
| `DescriptionItem` | 类型 | `items` 接受的行数据结构。 |

### 属性

| 属性               | 默认值             | 说明                                                     |
| ------------------ | ------------------ | -------------------------------------------------------- |
| `items`            | `[]`               | 只读 `DescriptionItem[]`；每项需要唯一的 `key`。         |
| `title`            | `''`               | 用于命名描述列表的可见 Title Medium 标题。               |
| `headingLevel`     | `3`                | 原生标题级别，取值 `1` 至 `6`，与视觉字号角色独立。      |
| `columns`          | `3`                | 最大列数：`1`、`2`、`3` 或 `4`；实际列数由容器宽度决定。 |
| `layout`           | `'stacked'`        | `stacked` 将标签置于值上方；`inline` 并排排列。          |
| `outlined`         | `false`            | 添加圆角组边框与内部留白。                               |
| `locale`           | Provider → `en-US` | 选择内置空列表和缺失值文案。                             |
| `emptyText`        | 本地化文案         | 覆盖空列表文案。                                         |
| `missingValueText` | 本地化文案         | 覆盖 null 或省略值文案。                                 |

### 描述项

| 字段        | 类型                                  | 说明                               |
| ----------- | ------------------------------------- | ---------------------------------- |
| `key`       | `string`                              | 列表内稳定且唯一的标识。           |
| `label`     | `string`                              | `dt` 中显示的术语。                |
| `value`     | `string \| number \| boolean \| null` | 可选描述值；省略和 null 表示缺失。 |
| `fullWidth` | `boolean`                             | 在任意容器尺寸下占据可用行。       |

### 事件

Descriptions 不发出事件。

### 插槽

| 插槽    | 作用域            | 用途                                   |
| ------- | ----------------- | -------------------------------------- |
| `label` | `{ item }`        | 替换术语内容。                         |
| `value` | `{ item, value }` | 替换描述内容，包括格式化和缺失值显示。 |
| `empty` | —                 | 替换空列表呈现。                       |

### 方法

Descriptions 不暴露实例方法。

## 样式

公开接口是 `--yam3x-descriptions-gap`，用于设置分组内边距和属性间距。默认值为按 `--md-sys-density-spacing-scale` 缩放的 `24px`。同一密度比例还会调整堆叠布局的 4px 标签/值间距、并排布局的 16px 列间距以及边框内边距。

| 属性                             | 默认值              | 用途                   |
| -------------------------------- | ------------------- | ---------------------- |
| `--yam3x-descriptions-gap`       | 按密度缩放的 `24px` | 分组内边距与属性间距。 |
| `--md-sys-density-spacing-scale` | `1`                 | 按密度缩放组件间距。   |

标签使用 Label Large / On Surface Variant；值使用 Body Large / On Surface。可选边框使用 1px Outline Variant 边框和 Medium 圆角角色。文字放大时仍应保留完整内容。除这些接口外，没有项目专用的颜色或形状接口。

## Material 参考

- [Lists 指导：对齐、非交互列表与自适应设计](https://m3.material.io/components/lists/guidelines)
- [应用排版](https://m3.material.io/styles/typography/applying-type)
