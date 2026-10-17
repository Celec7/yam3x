<script setup lang="ts">
import IconButtonExample from '../../components/demos/IconButtonExample.vue'
</script>

# Icon buttons

Icon button 使用图标表示紧凑操作。每个按钮都需要稳定的可访问名称来说明操作，即使同时显示 tooltip 也一样。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <IconButtonExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/IconButtonExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
import IconToggleButton from './components/yam3x/icon-button/icon-toggle-button.vue'
import Icon from './components/yam3x/icon/icon.vue'

const favorite = ref(false)
</script>

<template>
  <IconButton aria-label="搜索"
    ><Icon
      name="search"
      filled
  /></IconButton>
  <IconToggleButton
    v-model:checked="favorite"
    aria-label="收藏"
  >
    <Icon name="favorite" />
    <template #selected-icon
      ><Icon
        name="favorite"
        filled
    /></template>
  </IconToggleButton>
</template>
```

## API

| 属性                                  | 类型                                                     | 默认值          | 说明                                                           |
| ------------------------------------- | -------------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| `variant`                             | `standard \| filled \| tonal \| outlined`                | `filled`        | 视觉样式。                                                     |
| `size`                                | `extra-small \| small \| medium \| large \| extra-large` | `small`         | 图标按钮尺寸。                                                 |
| `width`                               | `narrow \| default \| wide`                              | `default`       | 横向尺寸。                                                     |
| `shape`                               | `round \| square`                                        | `round`         | 静止形状。                                                     |
| `href`, `disabled`                    | `string`, `boolean`                                      | —, `false`      | `IconButton` 的原生链接模式与禁用状态。                        |
| `disabledInteractive`                 | `boolean`                                                | `false`         | 保持禁用控件可聚焦并说明其不可用原因，同时阻止激活与状态反馈。 |
| `type`, `id`, `name`, `value`, `form` | 原生属性                                                 | `type="button"` | button 模式的表单属性。                                        |
| `IconToggleButton` `v-model:checked`  | `boolean`                                                | `false`         | 二态选择状态。组内单选选项使用 `role="radio"`。                |

`IconButton` 发出 `click(MouseEvent)`。`IconToggleButton` 发出 `click(MouseEvent)` 和 `update:checked`；通过 `#selected-icon` 提供选中状态的内容。

## 行为与无障碍

`IconButton` 执行操作，`IconToggleButton` 保存二态选择。radio toggle 再次激活时保持选中。普通图标按钮应使用实心图标。toggle 未选中时使用描边图标，选中时通过 `#selected-icon` 提供对应的实心图标；如果没有实心版本，则将图标字重加粗至 semibold，必要时使用 bold。请提供 `aria-label` 或其他稳定的无障碍名称，不能只依靠提示。Web 中的纯图标操作应在 hover 与 focus 时组合使用[提示](/zh/components/tooltip)。导航请使用 `href` 并保留原生链接行为。

## 样式

颜色使用 Material 系统角色，因此修改应用主题会同步更新此组件。组件专属几何 token 仅供内部实现，不提供覆写接口。

## Material 参考

[Icon buttons 概览](https://m3.material.io/components/icon-buttons/overview) · [指南](https://m3.material.io/components/icon-buttons/guidelines) · [规格](https://m3.material.io/components/icon-buttons/specs) · [无障碍](https://m3.material.io/components/icon-buttons/accessibility)
