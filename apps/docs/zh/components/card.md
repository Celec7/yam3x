<script setup lang="ts">
import CardExample from '../../components/demos/CardExample.vue'
</script>

# Cards

Card 在有界表面中组合相关内容。只有整张卡片代表一个明确操作时才让卡片整体可交互；独立操作应使用各自的控件。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <CardExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/CardExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import Card from './components/yam3x/card/card.vue'
</script>

<template>
  <Card variant="outlined">
    <template #header>行程摘要</template>
    <template #content>已保存周六的三个站点。</template>
  </Card>
</template>
```

## API

| 属性                  | 类型                             | 默认值     | 说明                                                                 |
| --------------------- | -------------------------------- | ---------- | -------------------------------------------------------------------- |
| `variant`             | `elevated \| filled \| outlined` | `filled`   | 卡片表面样式。                                                       |
| `interactive`         | `boolean`                        | `false`    | 使用原生 button 并发出 `click(MouseEvent)`；需提供清晰的可访问名称。 |
| `href`                | `string`                         | —          | 使用原生链接卡片进行导航；同时设置时优先于 `interactive`。           |
| `type`                | `button \| submit \| reset`      | `button`   | 对应原生表单按钮行为。                                               |
| `name`                | `string`                         | —          | 原生提交按钮的表单字段名。                                           |
| `value`               | `string`                         | —          | 原生提交按钮的表单字段值。                                           |
| `orientation`         | `vertical \| horizontal`         | `vertical` | 项目扩展：控制结构化卡片内容的排列方向。                             |
| `inline`              | `boolean`                        | `false`    | 项目扩展：让卡片与周围内容同行排布。                                 |
| `disabled`            | `boolean`                        | `false`    | 禁用交互卡片；禁用链接会移除 `href` 并退出 Tab 顺序。                |
| `disabledInteractive` | `boolean`                        | `false`    | 项目扩展：设置 `aria-disabled`、保留焦点并抑制激活与状态反馈。       |

卡片提供默认插槽，以及可选的 `header`、`content`、`actions` 和 `footer` 插槽。这些插槽和布局控制属于 Vue 项目扩展。

## 行为与无障碍

被动卡片渲染为中性的 `div`，不会发出根级 `click`；交互卡片渲染为 `button`，带 `href` 的卡片渲染为 `a`。同时设置 `href` 和 `interactive` 时优先使用链接。被动卡片可以包含独立可聚焦的控件；只有当整张卡片是 button 或 link 时，才应避免嵌套其他按钮或链接。若外围内容需要 article 语义，可在被动卡片外包一层 `<article>`。

## 样式

默认插槽有 16px 内边距；直接内容是 `img` 或 `video` 时贴边。具名插槽会根据方向和位置增加 16px 间距。

| 自定义属性             | 默认值              | 说明                               |
| ---------------------- | ------------------- | ---------------------------------- |
| `--yam3x-card-shape`   | System medium 圆角  | 覆盖卡片容器的圆角。               |
| `--yam3x-card-padding` | 16px × 密度缩放比例 | 覆盖默认内容和具名插槽周围的间距。 |

其他卡片样式值由组件管理，并随当前主题和卡片变体映射。

## Material 参考

[Cards 概览](https://m3.material.io/components/cards/overview) · [指南](https://m3.material.io/components/cards/guidelines) · [规格](https://m3.material.io/components/cards/specs) · [无障碍](https://m3.material.io/components/cards/accessibility)
