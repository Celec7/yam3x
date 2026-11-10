<script setup lang="ts">
import CardExample from '../../components/demos/CardExample.vue'
import CardInteractionExample from '../../components/demos/CardInteractionExample.vue'
</script>

# 卡片

卡片把围绕同一主题的相关内容和操作组合在一起。用于需要一起浏览的可扫描信息，并且只有在整张卡片代表一个明确操作时才让整张卡片可交互。

卡片是 Material 3 基线组件。Elevated、Filled 和 Outlined 是 Material 变体；横向和行内布局、命名内容 slot 以及 `disabledInteractive` 行为是项目扩展。

## 示例

### 变体与组合

<div class="vp-raw yam3x-doc-demo-theme"><CardExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CardExample.vue{vue}

:::

画廊展示三种变体、使用标准 16 px 内边距的默认文本卡片、包含页眉、内容、操作和页脚的行内横向卡片，以及媒体贴合页眉边缘的卡片。卡片随内容确定尺寸，不设置固定高度。

### 交互与禁用状态

<div class="vp-raw yam3x-doc-demo-theme"><CardInteractionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CardInteractionExample.vue{vue}

:::

交互演示区分被动卡片、可操作按钮卡片、禁用但仍可聚焦的卡片、禁用链接，以及提交或重置原生表单的卡片。计数器报告已接受的激活，被动卡片会忽略指针点击。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { Card } from './components/yam3x/card'
</script>

<template>
  <Card variant="outlined">
    <template #header>行程摘要</template>
    <template #content>周六已保存三个停靠点。</template>
  </Card>
</template>
```

未设置 `interactive` 或 `href` 的卡片渲染为中性的 `div`；默认 slot 与 `#content` 共用同一内容区域。卡片需要结构化层级时，使用命名 slot 放置页眉、操作和页脚。

::: details 可操作卡片与链接

```vue
<script setup lang="ts">
import { Card } from './components/yam3x/card'

function openPlan() {
  // 导航或打开所选计划。
}
</script>

<template>
  <Card
    interactive
    aria-label="打开阅读计划"
    @click="openPlan"
  >
    阅读计划
  </Card>
  <Card
    href="/plans/current"
    aria-label="打开当前计划"
  >
    当前计划
  </Card>
</template>
```

`interactive` 渲染原生按钮并触发 `click`。提供 `href` 会渲染原生链接，并优先于 `interactive`。两种形式中都不要嵌套按钮或链接；需要独立控件时使用被动卡片。

:::

## 行为与无障碍

### 语义

- 被动卡片是 `div`，不带有 article、button 或 link 角色。周围页面需要 article 语义时，请将其包装在 `<article>` 中。
- `interactive` 卡片是原生按钮。带 `href` 的卡片是原生链接；两者同时设置时 `href` 优先。
- 卡片不提供可访问名称。可见内容不足以作为单一操作名称时，请添加 `aria-label` 或 `aria-labelledby`。
- 装饰性媒体应隐藏或提供空替代文本；信息性媒体需要文本替代。

### 交互与焦点

- 只有可操作卡片会获得指针与键盘激活能力以及焦点停靠点。被动卡片不触发 `click` 事件，也不显示激活反馈。
- 可操作卡片在 System 悬停、焦点和按下透明度下共用一个状态层。焦点是 3 px Secondary 外圈，偏移 2 px。
- Card 不拦截 Enter 或 Space；使用原生按钮激活行为。链接卡片保留原生链接行为，包括修饰键打开。

### 禁用状态

- 按钮卡片上的 `disabled` 使用原生禁用状态，并将其移出 Tab 顺序。
- `disabledInteractive` 设置 `aria-disabled`，保持卡片可聚焦，并抑制激活与状态反馈。仅在让用户发现不可用操作有帮助时使用。
- 禁用的链接卡片会移除 `href`，保留 `role="link"`，并离开 Tab 顺序，除非同时设置 `disabledInteractive`。激活会被阻止。
- 禁用卡片不会激活。不要只靠透明度解释操作为何不可用。

### 媒体与布局

- `orientation` 在纵向与横向排列之间切换。`inline` 让卡片在周围行内保持内容宽度。
- 默认内容区域或 `#header` 中直接放置的 `img` 或 `video` 会贴边填满，不使用常规内边距。其他内容使用卡片内边距。
- 命名 slot 的外边距遵循布局方向，因此横向卡片在 RTL 中保持相同间距。

### 表单

- 按钮卡片支持原生 `type`、`name` 和 `value`。`type="submit"` 参与周围表单，`type="reset"` 恢复原生字段值。
- 链接卡片忽略 `type`、`name` 和 `value`。

## API

### 导出

| 导出   | 说明                             |
| ------ | -------------------------------- |
| `Card` | 围绕单一主题及其操作的边界表面。 |

### 属性与模型

| 属性                  | 默认值     | 说明                                                          |
| --------------------- | ---------- | ------------------------------------------------------------- |
| `variant`             | `filled`   | `elevated`、`filled` 或 `outlined` 表面样式。                 |
| `interactive`         | `false`    | 渲染原生按钮并触发 `click`。                                  |
| `href`                | 未定义     | 渲染原生链接；优先于 `interactive`。                          |
| `type`                | `button`   | 原生按钮类型：`button`、`submit` 或 `reset`。仅用于按钮卡片。 |
| `name`                | 未定义     | 提交按钮的原生表单字段名。                                    |
| `value`               | 未定义     | 提交按钮的原生表单字段值。                                    |
| `disabled`            | `false`    | 禁用按钮卡片；链接卡片会移除 `href` 并离开 Tab 顺序。         |
| `disabledInteractive` | `false`    | 项目扩展：设置 `aria-disabled`，保持焦点，并抑制激活与反馈。  |
| `orientation`         | `vertical` | 项目扩展：结构化内容的 `vertical` 或 `horizontal` 排列。      |
| `inline`              | `false`    | 项目扩展：让卡片在周围行内保持内容宽度。                      |

### 事件

| 事件    | 载荷         | 说明                                             |
| ------- | ------------ | ------------------------------------------------ |
| `click` | `MouseEvent` | 启用的可操作卡片被激活时触发。被动卡片不会触发。 |

### 插槽

| 插槽      | 用途                                       |
| --------- | ------------------------------------------ |
| `default` | 内容。没有 `#content` 时共用内容区域。     |
| `header`  | 前置页眉区域，例如标题或贴边媒体。         |
| `content` | 主内容区域，优先于默认 slot。              |
| `actions` | 尾部操作区域；被动卡片的独立控件放在这里。 |
| `footer`  | 内容与操作之后的辅助元数据。               |

### 方法

Card 不暴露实例方法。

## 样式

Card 暴露两个项目定义的自定义属性。变体颜色、抬升、轮廓、状态层和焦点外圈使用共享 Material 角色，并保持为组件内部实现。

| 属性                   | 默认值             | 用途                               |
| ---------------------- | ------------------ | ---------------------------------- |
| `--yam3x-card-shape`   | System medium 圆角 | 卡片圆角半径。                     |
| `--yam3x-card-padding` | `16px` × 密度      | 默认 slot 和命名 slot 内容内边距。 |

## Material 参考

[卡片概览](https://m3.material.io/components/cards/overview) · [指南](https://m3.material.io/components/cards/guidelines) · [规格](https://m3.material.io/components/cards/specs) · [无障碍](https://m3.material.io/components/cards/accessibility)
