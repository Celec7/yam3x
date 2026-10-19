<script setup lang="ts">
import TabsExample from '../../components/demos/TabsExample.vue'
</script>

# Tabs

Tab 用于在信息层级相同的相关视图间切换。标签应简洁并说明对应视图，同时保持 tab 与内容之间的关联。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><TabsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TabsExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Tabs } from './components/yam3x/tabs'
const current = ref('overview')
const items = [
  { value: 'overview', label: '概览' },
  { value: 'details', label: '详情', badge: '3' },
]
</script>

<template>
  <Tabs
    v-model="current"
    label="商品内容"
    :items="items"
    variant="primary"
  >
    <template #tab-content="{ item, selected }">
      <strong>{{ item.label }}</strong>
      <span
        v-if="selected"
        aria-hidden="true"
        >●</span
      >
    </template>
    <template #panel="{ item }">{{ item.label }}内容</template>
  </Tabs>
</template>
```

## API

该组件的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

| 属性                                  | 默认         | 作用                                                                              |
| ------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| `items`                               | 必填         | `value`、`label`、可选的 `ariaLabel`、`disabled`、`badge`。                       |
| `v-model`                             | 首个可用项   | 当前标签的 `value`。                                                              |
| `variant`                             | `secondary`  | `primary` 或 `secondary`。                                                        |
| `layout`                              | `auto`       | `fixed`、`scrollable` 或 `auto`；自动布局在超过四项时滚动。                       |
| `headerPosition`                      | `before`     | 标题栏位于内容上方或下方；`after` 是项目扩展，Material 规范将 Tabs 放在内容之前。 |
| `stretch`                             | `false`      | 让标签占满可用宽度。                                                              |
| `disablePagination`                   | `false`      | 隐藏分页按钮；`auto` 在粗指针设备上隐藏。                                         |
| `disableSwipe`                        | `false`      | 阻止固定布局中的内容区横向滑动切换；可滚动标签使用横向手势滚动标签栏。            |
| `previousPageLabel` / `nextPageLabel` | 本地化默认名 | 分页按钮的无障碍名称。                                                            |

## 行为与无障碍

插槽：`#tab-content="{ item, selected }"` 用于替换每个标签默认的图标、文字和徽标内容，同时保留标签按钮的语义和交互；自定义内容的无障碍名称使用 `ariaLabel`，未设置时回退到 `label`。其他插槽有 `#panel="{ item, selected }"`、`#icon="{ item }"`、`#badge="{ item }"`、`#previous-icon`、`#next-icon`。面板保持挂载，未选中的面板从布局及无障碍树隐藏。为整个标签栏提供 `label`，模糊的单个可见名称可用条目的 `ariaLabel` 澄清。方向键只移动焦点；Space/Enter 激活并更新面板。Tab 可逐项到达可用标签。

用户激活其他标签时，先触发 `update:modelValue`，再触发 `select(item)`。再次激活当前标签时只触发 `select(item)`，不会再次更新模型。禁用标签不会触发 `select`。分页按钮只滚动标签栏。Primary 标签默认高 48px，带图标时高 64px；Secondary 标签高 48px。可滚动标签栏保留 52px 起始内缩，标签不会受固定宽度或行数截断。固定布局中的横向滑动会切换标签；可滚动布局中的横向手势用于滚动标签栏。切换时，指示器会向目标延展，内容沿切换方向滑入；点击标签会产生裁切在其形状内的 ripple。系统启用减少动态效果时，这些装饰动画会停止。

## 样式

| 属性                                              | 默认值                                    | 作用                                          |
| ------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| `--yam3x-tabs-active-indicator-color`             | System `primary`                          | 两种变体的活动指示器颜色。                    |
| `--yam3x-tabs-primary-active-indicator-thickness` | `3px`                                     | Primary 活动指示器的厚度。                    |
| `--yam3x-tab-selected-color`                      | Primary `primary`；Secondary `on-surface` | 已选标签文字与图标颜色。                      |
| `--yam3x-tab-font-size`                           | `14px`                                    | 标签文字字号。                                |
| `--yam3x-tab-spacing`                             | `8px`                                     | 行内标签内容间距，包括自定义 `#tab-content`。 |

## Material 参考

[Tabs 概览](https://m3.material.io/components/tabs/overview) · [指南](https://m3.material.io/components/tabs/guidelines) · [规格](https://m3.material.io/components/tabs/specs) · [无障碍](https://m3.material.io/components/tabs/accessibility)
