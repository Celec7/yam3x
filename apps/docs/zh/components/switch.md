<script setup lang="ts">
import SwitchExample from '../../components/demos/SwitchExample.vue'
</script>

# Switch

Switch 用于控制立即生效的设置。应搭配清晰标签；用户需要从一组选项中择一时使用 radio button。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <SwitchExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/SwitchExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Switch from './components/yam3x/switch/switch.vue'

const notifications = ref(false)
</script>

<template>
  <Switch
    v-model="notifications"
    label="通知"
    name="notifications"
  />
</template>
```

## API

| 属性                          | 类型                       | 默认值       | 说明                                 |
| ----------------------------- | -------------------------- | ------------ | ------------------------------------ |
| `label`                       | `string`                   | 必填         | 可见标签，也是开关的可访问名称。     |
| `modelValue`                  | `boolean`                  | `false`      | 开启/关闭状态，通过 `v-model` 绑定。 |
| `description`                 | `string`                   | —            | 与开关 input 关联的补充说明。        |
| `icons`                       | `none \| selected \| both` | `none`       | 轨道图标显示方式。                   |
| `disabled`, `required`        | `boolean`                  | `false`      | 禁用和原生必填状态。                 |
| `dir`                         | `ltr \| rtl`               | 继承         | 控件方向；未设置时继承文档方向。     |
| `id`, `name`, `value`, `form` | 原生表单属性               | `value="on"` | 控制 ID、提交值与表单关联。          |

`#thumb-content` 插槽接收 `{ checked }`，用于在手柄内呈现自定义视觉内容。提供插槽时会替代内置 `icons` 内容；未提供时，`icons` 按原方式生效。插槽内容应仅用于装饰，并适配 16px 图标区域。

## 行为与无障碍

设置 `icons="both"` 时，开关禁用后仍会显示未选中图标。

Switch 表示立即生效的二元设置，不应用来表示仅在提交表单时才应用的多个选项之一。请使用清晰的可见标签；不要只靠开/关图标表达状态。按 Tab 时焦点落在开关手柄上；按 Space 或 Enter 可切换状态。组件也支持表单提交与重置，并会响应 `fieldset disabled`。

## Material 参考

[Switch 概览](https://m3.material.io/components/switch/overview) · [指南](https://m3.material.io/components/switch/guidelines) · [规格](https://m3.material.io/components/switch/specs) · [无障碍](https://m3.material.io/components/switch/accessibility)
