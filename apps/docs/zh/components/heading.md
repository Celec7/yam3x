<script setup lang="ts">
import HeadingExample from '../../components/demos/HeadingExample.vue'
</script>

# Heading

Heading 将语义标题元素映射到 Material 字阶。文本需要同时参与文档大纲并采用 display、headline、title 或 label 样式时使用它。

Heading 是项目扩展，不是 Compose Material 3 组件。在 Compose 中，同样的效果由带 `MaterialTheme.typography` 样式的 `Text` 加标题语义组合而成；本项目改为提供一个组件，通过 `level`、`variant`、`size` 和 `emphasized` 属性控制。级别与视觉字阶刻意保持独立，因此视觉上的标题仍可作为 `h2` 提供给辅助技术。

## 示例

### 语义级别与字阶

<div class="vp-raw yam3x-doc-demo-theme"><HeadingExample /></div>

画廊展示每个字族和尺寸的标准与强调形态。下方 `level="1"` 和 `level="2"` 生成原生标题，第三个示例保持普通 `span`。可对比 `variant` 表示的类别、`size` 表示的同类别层级，以及 `emphasized` 表示的 Expressive 字重。

::: details 查看演示源码

<<< ../../components/demos/HeadingExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { Heading } from './components/yam3x/heading'
</script>

<template>
  <article>
    <Heading
      variant="headline"
      size="medium"
      :level="2"
      >账户设置</Heading
    >
    <Heading
      variant="label"
      size="large"
      :level="3"
      >个人资料可见性</Heading
    >
  </article>
</template>
```

`level` 应按周围文档层级选择，而不是按视觉尺寸选择。确定标题顺序后，再用 `display large` 表示页面标题、`title small` 表示卡片标题等视觉角色。

::: details 纯视觉文本与响应式字阶

```vue
<template>
  <Heading
    variant="title"
    size="small"
  >
    没有标题语义的普通文本
  </Heading>
  <Heading
    variant="display"
    size="small"
    class="responsive-title"
    :level="1"
  >
    会换行成多行的长页面标题
  </Heading>
</template>

<style scoped>
.responsive-title {
  max-inline-size: 24ch;
  text-wrap: balance;
}
</style>
```

未设置 `level` 时，Heading 渲染为 `span`。组件不会随视口缩放；页面需要响应式字阶时，应选择更小的 `size` 或使用消费端媒体查询。

:::

## 行为与无障碍

### 标题大纲

- `level` 渲染 `h1` 到 `h6`。未设置时渲染没有标题角色、也没有 `aria-level` 的 `span`。
- 无效的运行时 `level` 会被忽略，组件回退为普通 `span`。
- `variant` 和 `size` 只影响视觉。从 `display large` 改为 `title small` 不会改变标题级别。
- 内置组合会自行选择级别：Descriptions、Empty state 和 Inline message 提供 `headingLevel`，默认 3；Form 提供 `summaryHeadingLevel`，默认 2；Cascading select 的标题固定为级别 2。

### 字阶与换行

- `variant` 接受 `display`、`headline`、`title` 或 `label`；无效值回退到 `display`。
- `size` 接受 `small`、`medium` 或 `large`；无效值回退到 `medium`。
- `emphasized` 选择相同类别和尺寸的 Expressive 强调字阶。
- Heading 是零外边距的块级元素。它继承父级颜色和字体族，默认允许换行。
- 组件没有内置截断。设计需要固定行数时，可使用 `text-wrap`、`overflow-wrap` 或消费端 `line-clamp`；不要隐藏承载唯一标题文案的文本。

## API

### 导出

| 导出      | 类型 | 用途                       |
| --------- | ---- | -------------------------- |
| `Heading` | 组件 | 语义标题或纯视觉字阶文本。 |

### 属性

| 属性         | 类型                                    | 默认值    | 说明                                            |
| ------------ | --------------------------------------- | --------- | ----------------------------------------------- |
| `variant`    | `display \| headline \| title \| label` | `display` | 字阶类别。无效运行时值回退到 `display`。        |
| `size`       | `small \| medium \| large`              | `medium`  | 字阶类别内的级别。无效运行时值回退到 `medium`。 |
| `emphasized` | `boolean`                               | `false`   | 使用所选字族与尺寸的 Expressive 强调字重。      |
| `level`      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`            | —         | 原生标题级别；未设置时渲染无标题语义的 `span`。 |

### 事件

Heading 不发出事件。

### 插槽

| 插槽    | 作用域 | 用途       |
| ------- | ------ | ---------- |
| default | —      | 标题内容。 |

### 方法

Heading 不暴露实例方法。

## 样式

组件将所选字族、尺寸和强调状态映射到对应的 System `--md-sys-typescale-*` token，token 仍是公开样式接口。它不直接设置 `font-size` 或 `font-weight`，因此主题 token 覆盖和继承字体族继续有效。组件不提供项目专用自定义属性。

| 接口                                              | 用途                             |
| ------------------------------------------------- | -------------------------------- |
| `--md-sys-typescale-<family>-<size>-*`            | 字体族、字号、字重、行高和字距。 |
| `--md-sys-typescale-emphasized-<family>-<size>-*` | 对应的 Expressive 强调字阶。     |
| 继承的 `color`                                    | Heading 使用周围文本颜色。       |

System 主题提供字体族和度量。默认字体族为 Roboto。

## Material 参考

[应用排版](https://m3.material.io/styles/typography/applying-type) · [字阶 token](https://m3.material.io/styles/typography/type-scale-tokens) · [无障碍：标题](https://m3.material.io/foundations/accessible-design/accessibility-basics)
