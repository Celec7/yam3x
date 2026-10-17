<script setup lang="ts">
import ButtonExample from '../../components/demos/ButtonExample.vue'
import ToggleButtonExample from '../../components/demos/ToggleButtonExample.vue'
</script>

# Buttons

操作或链接使用 `Button`；需要保持选中状态的选项使用 `ToggleButton`。

## 交互示例

### 操作与链接

<div class="vp-raw yam3x-doc-demo-theme">
  <ButtonExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/ButtonExample.vue{vue}

:::

### 持续选择

<div class="vp-raw yam3x-doc-demo-theme">
  <ToggleButtonExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/ToggleButtonExample.vue{vue}

:::

## 在应用中使用

按[安装指南](/zh/guide/installation)复制组件后，从应用中导入：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, ToggleButton } from './components/yam3x/button'

const saved = ref(false)
const favorite = ref(false)
</script>

<template>
  <Button @click="saved = true">保存</Button>
  <ToggleButton v-model:checked="favorite">收藏</ToggleButton>
  <p role="status">{{ saved ? '已保存' : '' }}</p>
</template>
```

## API

### `Button`

| 属性                          | 类型                                                     | 默认值   | 说明                                           |
| ----------------------------- | -------------------------------------------------------- | -------- | ---------------------------------------------- |
| `variant`                     | `filled \| filled-tonal \| elevated \| outlined \| text` | `filled` | 视觉优先级。                                   |
| `size`                        | `extra-small \| small \| medium \| large \| extra-large` | `small`  | 尺寸。                                         |
| `shape`                       | `round \| square`                                        | `round`  | 静止形状；按压时会按组件契约变形。             |
| `href`                        | `string`                                                 | —        | 使用原生链接导航；链接模式不参与表单提交。     |
| `disabled`                    | `boolean`                                                | `false`  | 禁用按钮；禁用链接会保留链接语义但取消导航。   |
| `disabledInteractive`         | `boolean`                                                | `false`  | 显示禁用状态但仍可聚焦；取消激活和导航。       |
| `type`                        | `button \| submit \| reset`                              | `button` | 原生表单按钮类型。                             |
| `id`, `name`, `value`, `form` | 原生属性                                                 | —        | 转交给原生 button；`href` 模式不参与表单提交。 |

`Button` 发出 `click(MouseEvent)`。默认插槽提供标签；`#icon` 和 `#trailing-icon` 提供装饰性图标。

### `ToggleButton`

| 属性                          | 类型                                                     | 默认值   | 说明                           |
| ----------------------------- | -------------------------------------------------------- | -------- | ------------------------------ |
| `variant`                     | `filled \| filled-tonal \| elevated \| outlined`         | `filled` | 视觉强调程度。                 |
| `size`                        | `extra-small \| small \| medium \| large \| extra-large` | `small`  | 尺寸。                         |
| `shape`                       | `round \| square`                                        | `round`  | 静止形状；按下和选中时会变形。 |
| `v-model:checked`             | `boolean`                                                | `false`  | 持续选中状态。                 |
| `disabled`                    | `boolean`                                                | `false`  | 禁用按钮。                     |
| `role`                        | `button \| radio`                                        | —        | 在单选组中组合时使用 `radio`。 |
| `type`                        | `button \| submit \| reset`                              | `button` | 原生表单按钮类型。             |
| `id`, `name`, `value`, `form` | 原生属性                                                 | —        | 透传到原生 button。            |

`ToggleButton` 发出 `click(MouseEvent)` 和 `update:checked(boolean)`。默认插槽提供标签；选中时可用 `#selected` 替换。`#icon`、`#selected-icon` 和 `#trailing-icon` 提供装饰性图标。

## 行为与无障碍

设置 `href` 后，`Button` 渲染为原生链接，不参与表单提交。禁用链接保留链接语义，但不能导航，也不会进入键盘导航。`disabledInteractive` 保留按钮或链接的焦点能力，同时取消激活。

阻止 `ToggleButton` 的 click 默认行为也会阻止选中状态变化。组件默认使用 `aria-pressed`；设为 `role="radio"` 时使用 `aria-checked`。两个组件的 `type` 均默认为 `button`，避免意外提交表单。

图标不提供可访问名称；应提供可见标签。`#trailing-icon` 是项目拓展；使用 `#icon` 可遵循 Material 的方向适配前置图标位置。

## 样式

`--yam3x-button-container-color` 可覆盖变体和选中状态对应的容器颜色。导出的 `buttonVariants({ variant, size })` 辅助函数可为自定义组合返回对应样式类。

## Material 参考

[概览](https://m3.material.io/components/buttons/overview) · [指南](https://m3.material.io/components/buttons/guidelines) · [规格](https://m3.material.io/components/buttons/specs) · [无障碍](https://m3.material.io/components/buttons/accessibility)
