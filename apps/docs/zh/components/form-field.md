<script setup lang="ts">
import FormFieldExample from '../../components/demos/FormFieldExample.vue'
</script>

# Form field

`FormField` 是项目拓展，可在原生 input 外提供 Material 风格的字段容器、标签及辅助或错误文本。控件值和校验仍由消费端表单管理。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FormFieldExample.vue{vue}

:::

## 在应用中导入

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

## API

| 属性                 | 默认值            | 用途                                              |
| -------------------- | ----------------- | ------------------------------------------------- |
| `label`              | 必填              | 可见字段标签；可由 `#label` 插槽替换。            |
| `id`                 | 自动生成          | 控件没有 ID 时为其设置 ID。                       |
| `variant`            | `outlined`        | `outlined` 或 `filled` 字段容器。                 |
| `hint`、`error`      | —                 | 辅助或错误文本；也可使用 `#hint`、`#error` 插槽。 |
| `hideRequiredMarker` | `false`           | 隐藏可见的必填星号。                              |
| `hideSubscript`      | `never`           | `never`、`auto` 或 `always`，控制辅助文本可见性。 |
| `floatLabel`         | `auto`            | `auto` 或 `always` 标签位置。                     |
| `width`              | `270px`           | 首选宽度，受父容器限制。                          |
| `counterLabel`       | `Character count` | 字符计数的无障碍名称。                            |

默认插槽放置控件。`#prefix`、`#prefix-text`、`#suffix` 和 `#suffix-text` 在控件周围添加内容。`#counter` 接收 `{ count, max }`。

## 行为与无障碍

`FormField` 找到默认插槽中的第一个 `input`、`textarea`、`select` 或 `data-form-field-control`，并关联标签和辅助文本。现有 ID 与 ARIA 描述会保留。控件值和校验仍由表单管理。必填控件默认显示星号；表单应解释其含义。`error` 属性或插槽会替代 hint 并标记无效状态。`:error="true"` 只标记无效，不提供解释，因此应尽可能提供错误文本。错误文本使用 alert 角色。

原生 `maxlength` 会显示并关联字符计数。可用 `#counter` 自定义，并用 `counterLabel` 本地化无障碍名称。`hideSubscript="always"` 仍会让辅助文本和计数供辅助技术读取。没有 `maxlength` 时，自定义计数插槽应包含本地化名称与数值。消费者提供的图标及前后缀控件需要准确的可访问名称。

### 关联文字前缀和后缀

为有语义的前后缀文字设置唯一 ID，并将这些 ID 加入控件的 `aria-describedby`。`FormField` 会保留这些引用，并按需添加自身的 hint、error 和计数器 ID。

```vue
<FormField label="金额" hint="请输入美元金额">
  <template #prefix-text><span id="amount-prefix">$</span></template>
  <input aria-describedby="amount-prefix amount-suffix" inputmode="decimal" />
  <template #suffix-text><span id="amount-suffix">USD</span></template>
</FormField>
```

错误图标是可选的附加视觉提示。示例将图标与错误文本同时展示；图标不能替代文本，也不能只依靠颜色表达错误。

## 样式

标签会完整显示。标签较长时可增加 `width`。以下受支持的项目 CSS 属性可在 `FormField` 根元素上覆盖外观：

| 自定义属性                                 | 作用范围                        |
| ------------------------------------------ | ------------------------------- |
| `--yam3x-form-field-container-shape`       | Outlined 和 Filled 容器圆角     |
| `--yam3x-form-field-container-color`       | Filled 容器背景                 |
| `--yam3x-form-field-outline-color`         | 默认描边和 Filled 指示线        |
| `--yam3x-form-field-focused-color`         | 聚焦标签                        |
| `--yam3x-form-field-focused-outline-color` | 聚焦描边或激活指示线            |
| `--yam3x-form-field-invalid-color`         | 错误描边/指示线、标签和辅助文本 |

错误样式优先于聚焦样式。错误悬停时，指示线和标签颜色会基于配置的无效状态颜色与当前主题的 `on-surface` 角色计算；辅助文本保留无效状态颜色。

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility)
