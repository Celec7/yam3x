<script setup lang="ts">
import ExtendedFabExample from '../../components/demos/ExtendedFabExample.vue'
</script>

# Extended FABs

Extended FAB 将主要操作与简短的可见标签组合。当文字比单独的图标更能说明操作时，使用 Extended FAB。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <ExtendedFabExample />
</div>

示例对比 small、medium、large 三种尺寸及纯文字样式。勾选框可以折叠带图标的 small FAB 标签；纯文字 Extended FAB 始终显示标签。

::: details 查看演示源码

<<< ../../components/demos/ExtendedFabExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import ExtendedFloatingActionButton from './components/yam3x/fab/extended-fab.vue'
import Icon from './components/yam3x/icon/icon.vue'
</script>

<template>
  <ExtendedFloatingActionButton>
    <template #icon
      ><Icon
        name="add"
        filled
    /></template>
    创建项目
  </ExtendedFloatingActionButton>
</template>
```

## API

| 属性                                  | 类型                                                                                                 | 默认值              | 说明                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `size`                                | `small \| medium \| large`                                                                           | `medium`            | 使用 Expressive Extended FAB 尺寸：56px、80px 或 96px。                                    |
| `expanded`                            | `boolean`                                                                                            | `true`              | 有图标时在视觉上折叠标签，同时保留辅助技术可读取的操作名称；纯文字 Extended FAB 保持展开。 |
| `variant`                             | `primary-container \| secondary-container \| tertiary-container \| primary \| secondary \| tertiary` | `primary-container` | 选择六种 Expressive 配色之一。                                                             |
| `lowered`                             | `boolean`                                                                                            | `false`             | 项目扩展，用于提供较低的表面层级。                                                         |
| `href`                                | `string`                                                                                             | —                   | 使用原生链接导航。                                                                         |
| `disabled`                            | `boolean`                                                                                            | `false`             | 兼容属性，用于禁止激活。                                                                   |
| `disabledInteractive`                 | `boolean`                                                                                            | `false`             | 使不可用 Extended FAB 保持可聚焦并暴露 `aria-disabled`。                                   |
| `type`, `id`, `name`, `value`, `form` | 原生表单属性                                                                                         | `type="button"`     | 仅 button 模式参与表单操作。                                                               |

默认插槽用于放置简短可见标签；`#icon` 用于放置可选图标。组件发出 `click(MouseEvent)`。

## 行为与无障碍

标签控制在一至两个词内，避免换行或截断。若显式设置无障碍名称，其开头应与可见标签的第一个词一致。标签与可选图标处于同一个可聚焦控件中；标签已说明操作时无需提示。每个屏幕只使用一个 FAB 系列控件；操作不可用时应省略。

## 样式

设置以 `--yam3x-extended-fab-` 开头的自定义属性可调整尺寸和外观。颜色属性在组件名前包含对应颜色角色，例如 `--yam3x-secondary-container-extended-fab-container-color`。Expressive small、medium 和 large 尺寸分别使用 56px、80px 和 96px 容器；small 使用 title-medium 字体样式。基础版和 surface 样式已不再推荐；`lowered` 是项目扩展。

## Material 参考

[Extended FAB 概览](https://m3.material.io/components/extended-fab/overview) · [指南](https://m3.material.io/components/extended-fab/guidelines) · [规格](https://m3.material.io/components/extended-fab/specs) · [无障碍](https://m3.material.io/components/extended-fab/accessibility)
