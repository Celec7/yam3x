<script setup lang="ts">
import FormFieldExample from '../../components/demos/FormFieldExample.vue'
</script>

# Text fields

使用 `FormField` 包装原生输入控件，创建 filled 或 outlined 文本字段。控件及其表单负责值和提交。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FormFieldExample.vue{vue}

:::

## 在应用中使用

```vue
<script setup lang="ts">
import { FormField } from './components/yam3x/form-field'
</script>

<template>
  <FormField
    label="电子邮件"
    hint="用于接收账户通知"
  >
    <input
      type="email"
      name="email"
      autocomplete="email"
      required
    />
  </FormField>
</template>
```

本项目没有单独导出 `TextField` 组件。包装器的 API 与行为见 [Form field](/zh/components/form-field)；校验由原生控件及消费端表单管理。

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility)
