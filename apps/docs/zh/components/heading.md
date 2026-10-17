<script setup lang="ts">
import HeadingExample from '../../components/demos/HeadingExample.vue'
</script>

# Heading

Heading 是将语义标题元素映射到 Material 字体角色的项目组件。文本需要参与文档标题大纲时，应设置 `level`。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <HeadingExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/HeadingExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import Heading from './components/yam3x/heading/heading.vue'
</script>

<template>
  <Heading
    variant="headline"
    size="medium"
    :level="2"
    >账户设置</Heading
  >
</template>
```

## API

| 属性         | 类型                                    | 默认值    | 说明                                               |
| ------------ | --------------------------------------- | --------- | -------------------------------------------------- |
| `variant`    | `display \| headline \| title \| label` | `display` | 字阶类别。无效运行时值回退到 `display`。           |
| `size`       | `small \| medium \| large`              | `medium`  | 字阶尺寸。无效运行时值回退到 `medium`。            |
| `emphasized` | `boolean`                               | `false`   | 使用强调字重。                                     |
| `level`      | `1 \| 2 \| 3 \| 4 \| 5 \| 6`            | —         | 可选标题级别；未设置时是普通文本，不声明标题语义。 |

默认插槽提供内容。

## 行为与无障碍

未设置 `level` 时，Heading 渲染为没有标题语义的普通文本。应按文档层级选择 `level`，与视觉尺寸无关。

## 样式

所选字阶类别、尺寸和强调状态会映射到对应的 System `--md-sys-typescale-*` token。强调状态会选择相同类别与尺寸的 Expressive emphasized 字阶；字体和度量由 System 主题提供。默认字体为 Roboto。

## Material 参考

[Applying type](https://m3.material.io/styles/typography/applying-type)
