<script setup lang="ts">
import SegmentedButtonExample from '../../components/demos/SegmentedButtonExample.vue'
</script>

# Segmented buttons

Segmented button 是 Material 的经典控件，项目继续支持现有用例。Material 已不再建议新设计使用它；新的紧凑选择界面请使用 [Connected Button Group](./button-group)。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <SegmentedButtonExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/SegmentedButtonExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  MultiChoiceSegmentedButtonRow,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from './components/yam3x/segmented-button'

const view = ref<string | null>('list')
const filters = ref(['recent'])
</script>

<template>
  <SingleChoiceSegmentedButtonRow
    v-model="view"
    aria-label="显示方式"
  >
    <SegmentedButton value="list">列表</SegmentedButton>
    <SegmentedButton value="grid">网格</SegmentedButton>
  </SingleChoiceSegmentedButtonRow>

  <MultiChoiceSegmentedButtonRow
    v-model="filters"
    aria-label="内容筛选"
  >
    <SegmentedButton value="recent">最近</SegmentedButton>
    <SegmentedButton value="saved">收藏</SegmentedButton>
  </MultiChoiceSegmentedButtonRow>
</template>
```

单选使用 `SingleChoiceSegmentedButtonRow` 管理一个值，多选使用 `MultiChoiceSegmentedButtonRow` 管理一组值。将 `SegmentedButton` 子项放在默认插槽中；每个分组内的 `value` 必须唯一。子项可以单独禁用。`icon` 插槽接收 `{ selected }`；未提供该插槽时，选中项显示默认勾选图标。

## API

### `SingleChoiceSegmentedButtonRow`

| 属性       | 类型               | 默认值  | 说明                               |
| ---------- | ------------------ | ------- | ---------------------------------- |
| `v-model`  | `string \| null`   | `null`  | 当前选中分段的值。                 |
| `disabled` | `boolean`          | `false` | 禁用所有分段。                     |
| `name`     | `string`           | —       | 将已选且启用的值作为表单字段提交。 |
| `density`  | `0 \| 1 \| 2 \| 3` | `0`     | 每级减少 4px 视觉高度。            |

### `MultiChoiceSegmentedButtonRow`

| 属性       | 类型               | 默认值  | 说明                               |
| ---------- | ------------------ | ------- | ---------------------------------- |
| `v-model`  | `string[]`         | `[]`    | 已选分段的值；可以全部取消选择。   |
| `disabled` | `boolean`          | `false` | 禁用所有分段。                     |
| `name`     | `string`           | —       | 将已选且启用的值作为表单字段提交。 |
| `density`  | `0 \| 1 \| 2 \| 3` | `0`     | 每级减少 4px 视觉高度。            |

两个 Row 都接受 `aria-label` 或 `aria-labelledby` 作为组的可访问名称；选择变化时会发出载荷为 `{ previousValue, value }` 的 `change` 事件。

### `SegmentedButton`

| 属性       | 类型      | 默认值  | 说明               |
| ---------- | --------- | ------- | ------------------ |
| `value`    | `string`  | 必填    | 在所属分组中唯一。 |
| `disabled` | `boolean` | `false` | 禁用此分段。       |

默认插槽提供可见标签。`icon` 插槽接收 `{ selected }`，可据此为不同状态提供图标。分段的可访问名称来自可见标签；仅图标内容需提供 `aria-label`。

## 行为与无障碍

方向键在可用分段间移动焦点，但不会改变选择。Space、Enter 或指针激活才会更改选择。Tab 首次进入时，在 LTR 中聚焦第一个可用分段，在 RTL 中聚焦最后一个可用分段；进入后，焦点停留在最近聚焦的分段。单选组使用 radio 语义，多选组使用 checkbox 语义。组件沿用经典规范中的 40px 视觉高度和 48px 交互目标。`name`、组级 `disabled`、表单提交和 `density` 是围绕经典控件提供的项目拓展。

## 样式

标准视觉高度为 40px，带 1px 描边、居中标签、至少 12px 水平内边距，图标与标签间隔 8px。交互目标为 48px。选中项使用 `secondary-container` / `on-secondary-container` 颜色。

## Material 参考

[分段按钮概览](https://m3.material.io/components/segmented-buttons/overview) · [指南](https://m3.material.io/components/segmented-buttons/guidelines) · [规格](https://m3.material.io/components/segmented-buttons/specs) · [无障碍](https://m3.material.io/components/segmented-buttons/accessibility)
