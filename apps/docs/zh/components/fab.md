<script setup lang="ts">
import FabExample from '../../components/demos/FabExample.vue'
</script>

# Floating action buttons (FABs)

浮动操作按钮用于突出页面的主要操作。一个页面只应使用一个 FAB 承载醒目的纯图标构建操作。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <FabExample />
</div>

示例对比 default、medium 和 large FAB 尺寸。不可用 FAB 仅作兼容示例。

::: details 查看演示源码

<<< ../../components/demos/FabExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import FloatingActionButton from './components/yam3x/fab/floating-action-button.vue'
import Icon from './components/yam3x/icon/icon.vue'
</script>

<template>
  <FloatingActionButton aria-label="创建项目">
    <Icon
      name="add"
      filled
    />
  </FloatingActionButton>
</template>
```

## API

| 属性                                  | 类型                                                                                                 | 默认值              | 说明                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------- |
| `size`                                | `small \| default \| medium \| large`                                                                | `default`           | 使用对应的 FAB 尺寸。`default` 是 56px 基础 FAB；small 可用但不推荐。 |
| `variant`                             | `primary-container \| secondary-container \| tertiary-container \| primary \| secondary \| tertiary` | `primary-container` | 选择六种 Expressive 配色之一。                                        |
| `lowered`                             | `boolean`                                                                                            | `false`             | 项目扩展，用于提供较低的表面层级。                                    |
| `href`                                | `string`                                                                                             | —                   | 使用原生链接导航。                                                    |
| `disabled`                            | `boolean`                                                                                            | `false`             | 兼容属性，用于禁止激活。                                              |
| `disabledInteractive`                 | `boolean`                                                                                            | `false`             | 使不可用 FAB 保持可聚焦并暴露 `aria-disabled`。                       |
| `type`, `id`, `name`, `value`, `form` | 原生表单属性                                                                                         | `type="button"`     | 仅 button 模式参与表单操作。                                          |

默认插槽用于放置图标。组件发出 `click(MouseEvent)`。

## 行为与无障碍

使用实心图标，并通过 `aria-label` 或 `aria-labelledby` 提供描述操作的名称。在 Web 上，为纯图标操作组合[提示](/zh/components/tooltip)。每个屏幕只使用一个 FAB；操作不可用时应省略。[FAB menu](/zh/components/fab-menu) 自行管理触发器和关闭图标。

## 样式

设置以 `--yam3x-floating-action-button-` 开头的自定义属性可调整尺寸和外观。颜色属性在组件名前包含对应颜色角色，例如 `--yam3x-primary-container-floating-action-button-container-color`。六种配色遵循 Expressive 调色板；`lowered` 是项目扩展。

## Material 参考

[Floating action buttons 概览](https://m3.material.io/components/floating-action-button/overview) · [指南](https://m3.material.io/components/floating-action-button/guidelines) · [规格](https://m3.material.io/components/floating-action-button/specs) · [无障碍](https://m3.material.io/components/floating-action-button/accessibility)
