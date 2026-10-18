<script setup lang="ts">
import DescriptionsExample from '../../components/demos/DescriptionsExample.vue'
</script>

# Descriptions

Descriptions 是用于展示单条记录各项属性的项目拓展组件。它使用原生描述列表，支持响应式列数、上下或并排排列的标签，以及由应用控制的值格式。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><DescriptionsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DescriptionsExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { Descriptions, type DescriptionItem } from './components/yam3x/descriptions'
const items: DescriptionItem[] = [
  { key: 'name', label: 'Project', value: 'Atlas' },
  { key: 'budget', label: 'Budget', value: 0 },
  { key: 'review', label: 'Review date', value: null },
]
</script>

<template>
  <Descriptions
    :items="items"
    title="Project details"
    outlined
  />
</template>
```

## API

| Prop                            | 默认值               | 说明                                                                                                   |
| ------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `items`                         | `[]`                 | 只读 `DescriptionItem[]`。每项包含唯一的 `key`、`label`、可选的基本类型 `value` 和可选的 `fullWidth`。 |
| `title`                         | `''`                 | 用于命名描述列表的可见 Title Medium 标题。                                                             |
| `headingLevel`                  | `3`                  | 原生标题级别，取值 `1` 至 `6`，与视觉字号角色独立。                                                    |
| `columns`                       | `3`                  | 最大列数，可选 `1`、`2`、`3`、`4`；实际列数取决于容器宽度。                                            |
| `layout`                        | `stacked`            | `stacked` 将标签置于值上方；`inline` 将标签和值并排排列。                                              |
| `outlined`                      | `false`              | 添加圆角组边框与内部留白。                                                                             |
| `locale`                        | 继承，然后为 `en-US` | 通过 LocaleProvider 选择内置文案。                                                                     |
| `emptyText`、`missingValueText` | 本地化文案           | 覆盖空列表和 null／未提供值的文案。                                                                    |

`DescriptionItem.value` 支持 `string`、`number`、`boolean`、`null` 或省略。`0`、`false`、`''` 均保留为真实值，只有 null 和省略使用缺失值文案。`fullWidth: true` 在任意容器尺寸下占据整行。

`#label="{ item }"` 和 `#value="{ item, value }"` 插槽替换对应内容。值插槽同时负责缺失值显示和格式化。`#empty` 替换空列表内容。可使用这些插槽提供本地化日期、金额、链接或协调的操作；组件没有选择或表单模型。

内置文案使用 [LocaleProvider](/zh/components/localization) 的 `descriptions` 命名空间（`empty`、`missingValue`）。显式 `locale` 和文案 props 优先，标签和值由应用控制。

## 行为与无障碍

每个原生 `dt` 后紧跟其 `dd`，顺序与 `items` 一致。响应式布局保留 DOM 阅读顺序。可选标题用于命名列表，请按周围文档大纲设置 `headingLevel`。没有标题时，应提供邻近的上下文或有描述意义的外层标题。

组件内容可用宽度小于 32rem 时使用一列。在 32rem、48rem、64rem 时，布局可依次增加到两列、三列、四列，且不超过 `columns`。并排布局中每项属性的标签和值保持 2:3 比例，两种布局均允许文字换行。静态属性没有悬浮、按下、选择或 Tab 状态。插槽中的链接和按钮保留原生键盘行为。

比较多条记录时使用 Data table，编辑值时使用 Form field。Descriptions 不负责业务值格式化或提交数据。

## 样式

组件使用主题颜色和排版 token。标签采用 Label Large / On Surface Variant，值采用 Body Large / On Surface。可选边框采用 Outline Variant 和 Medium 圆角角色。可覆盖 `--yam3x-descriptions-gap` 调整组内边距和属性间距，默认为按密度缩放的 24px。放大文字时应保留完整内容的可读性。

## Material 参考

- [Lists 指导：对齐、非交互列表与自适应设计](https://m3.material.io/components/lists/guidelines)
- [应用排版](https://m3.material.io/styles/typography/applying-type)
