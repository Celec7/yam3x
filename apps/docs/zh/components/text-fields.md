# Text fields

文本字段让用户在界面中输入文字，通常出现在表单和对话框中。

本项目没有单独导出 `TextField` 组件。请将 [Form field](/zh/components/form-field) 与原生 `input`、`textarea` 或 `select` 组合使用，并选择 `outlined` 或 `filled` 外观。

## 在应用中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'

const email = ref('')
const displayName = ref('')
</script>

<template>
  <FormField
    label="电子邮件"
    hint="用于接收账户通知"
  >
    <input
      v-model="email"
      type="email"
      name="email"
      autocomplete="email"
      required
    />
  </FormField>

  <FormField
    label="显示名称"
    variant="filled"
  >
    <input
      v-model="displayName"
      name="display-name"
      autocomplete="name"
    />
  </FormField>
</template>
```

第一个字段使用默认的 `outlined` 外观，第二个通过 `variant="filled"` 使用填充外观。包装器负责标签、辅助文字与错误展示；值与校验由原生控件和消费端表单负责。属性、插槽、行为与样式钩子见 [Form field](/zh/components/form-field)。

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility)
