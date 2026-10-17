<script setup>
import RadioGroupExample from '../../components/demos/RadioGroupExample.vue'
</script>

# Radio button

Radio button 允许用户从互斥选项中选择一项。选项及其标签应便于浏览；本页使用原生 radio input 处理表单和键盘行为。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><RadioGroupExample /></div>

::: details 查看演示源码

<<< ../../components/demos/RadioGroupExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RadioGroup, RadioButton } from './components/yam3x/radio-group'

const delivery = ref<string | null>(null)
</script>

<template>
  <RadioGroup
    v-model="delivery"
    label="配送方式"
    name="delivery"
  >
    <RadioButton value="pickup">自取</RadioButton>
    <RadioButton value="shipping">配送</RadioButton>
  </RadioGroup>
</template>
```

## API

`RadioGroup` 通过 `v-model` 接受字符串或 `null`。它提供 `id`、`label`、`description`、`name`、`form`、`required`、`disabled` 和 `invalid`。`RadioButton` 接受 `id`、唯一字符串 `value`、可选 `description` 和 `disabled`；默认插槽是可见选项标签。每个 `RadioButton` 都应放在 `RadioGroup` 内。

选择选项时，组会发出 `update:modelValue`，并转发原生 `input`、`change` 和 `invalid` 事件。

## 行为与无障碍

原生 radio input 提供表单提交、必填校验和键盘行为。使用受控 model 时，父组件可以不更新 model 来拒绝新值。

当产品没有有意义的默认值时，组件允许初始为空。再次激活当前选项不会清空选择；父组件仍可通过代码将 model 设为 `null`。如需允许用户主动选择不选任何项，应提供明确的“无”选项。这些是项目行为，不是额外的 Material 要求。

## Material 参考

[Radio button 概览](https://m3.material.io/components/radio-button/overview) · [指南](https://m3.material.io/components/radio-button/guidelines) · [规格](https://m3.material.io/components/radio-button/specs) · [无障碍](https://m3.material.io/components/radio-button/accessibility)
