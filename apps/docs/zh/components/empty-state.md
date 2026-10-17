<script setup lang="ts">
import EmptyStateExample from '../../components/demos/EmptyStateExample.vue'
</script>

# Empty state

`EmptyState` 是项目拓展组件，用来解释集合或结果区域为何没有内容，并提供有用的下一步操作。适用于新建集合或没有匹配结果；加载、请求失败和任务完成应使用各自的反馈。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><EmptyStateExample /></div>

::: details 查看示例源码

<<< ../../components/demos/EmptyStateExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { EmptyState } from './components/yam3x/empty-state'
import { Button } from './components/yam3x/button'
</script>

<template>
  <EmptyState
    title="没有匹配的文档"
    align="start"
    :heading-level="2"
  >
    请尝试其他关键词，或清除搜索以查看全部文档。
    <template #actions><Button variant="outlined">清除搜索</Button></template>
  </EmptyState>
</template>
```

## API

| 属性           | 默认值     | 用途                                                                                  |
| -------------- | ---------- | ------------------------------------------------------------------------------------- |
| `title`        | 必需       | 简短解释当前区域为何为空。                                                            |
| `description`  | 空         | 补充说明；提供默认插槽时被替换。                                                      |
| `context`      | `embedded` | `embedded` 使用 Title Medium / Body Medium；`page` 使用 Headline Small / Body Large。 |
| `align`        | `center`   | `center` 或遵循书写方向的 `start`。                                                   |
| `icon`         | 无         | 可选的装饰性 Material Symbol，以 48 px 显示。                                         |
| `headingLevel` | 无         | 语义标题层级，1–6；省略时标题渲染为 span。请根据周围文档结构选择。                    |

默认插槽提供补充内容。`#illustration` 用图片或插画替换图标区域。信息性图片需提供合适的替代文本；装饰内容使用空替代文本或 `aria-hidden="true"`。`#actions` 放置下一步操作，按所在页面选择合适的 Button 层级。属性应用于根元素。

## 行为与无障碍

组件继承所在表面，不添加卡片背景，不获取数据、不创建内容，也不会自动公告自身。请将区块标题、有用的搜索控件、筛选和导航保留在空内容区域之外。如果表格需要保留表头，可将空状态放在跨越所有列的单元格内。

区分“还没有条目”和“没有匹配结果”。新集合可提供创建操作，无匹配结果可提供修改查询或筛选的操作。请求失败时应保留失败原因和恢复操作，不能声称集合为空。

操作可换行，文字可增大，起始对齐遵循书写方向。出现时不会移动焦点。外层结果区域可使用自己的状态区，为用户发起的查询结果公告一次。应用负责操作结果及替换空内容后的焦点安排。

## 样式

排版、间距和前景色使用共享 Material 角色。区域内边距为 24 px，主要部分之间为 16 px，标题与描述之间为 8 px。空间允许时文字块约限制在 40 个字符宽度。可通过 `class` 或 `style` 调整所在区域尺寸，保持高度随内容增长。

## Material 参考

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Shape principles](https://m3.material.io/styles/shape/overview-principles) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
