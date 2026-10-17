<script setup lang="ts">
import NumberFieldExample from '../../components/demos/NumberFieldExample.vue'
</script>

# Number field

`NumberField` 是用于数量及普通小数输入的项目扩展，组合 Material 文本框外观、本地化编辑和可选的步进操作。标识符、电话号码，以及由应用处理的精确小数运算应使用文本输入。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldExample /></div>

::: details 查看示例源码

<<< ../../components/demos/NumberFieldExample.vue{vue}

:::

## 在应用中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NumberField } from './components/yam3x/number-field'

const weight = ref<number | null>(0.1)
</script>

<template>
  <NumberField
    v-model="weight"
    label="重量"
    name="weight"
    :min="0"
    :max="10"
    :step="0.1"
  >
    <template #suffix-text>kg</template>
  </NumberField>
</template>
```

## API

| 属性                               | 默认值       | 用途                                                                                                                                                |
| ---------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                            | 必填         | 可见的字段标签。                                                                                                                                    |
| `id`、`name`、`form`               | —            | 编辑器 ID、提交字段名称，以及可选的外部表单 ID。                                                                                                    |
| `locale`                           | `en-US`      | 数字、分组符、小数分隔符和显示格式的语言区域。                                                                                                      |
| `min`、`max`                       | 无边界       | 包含边界的有限数值范围。                                                                                                                            |
| `step`                             | `1`          | 正有限步长，不要求直接输入的值落在步进网格上。                                                                                                      |
| `required`、`disabled`、`readonly` | `false`      | 原生字段状态；禁用和只读字段不可步进。                                                                                                              |
| `controls`                         | `true`       | 显示指针步进控件，隐藏后仍可使用键盘步进。                                                                                                          |
| `variant`                          | `outlined`   | `outlined` 或 `filled`。                                                                                                                            |
| `hint`、`error`                    | 空 / `false` | 说明文字或外部错误。非空错误字符串作为提示，`true` 使用本地化的通用提示。                                                                           |
| `width`                            | `270px`      | 首选宽度，受父容器限制。                                                                                                                            |
| `hideRequiredMarker`               | `false`      | 隐藏可见星号；使用必填标记时，应在表单中说明其含义。                                                                                                |
| `messages`                         | 英文或中文   | 覆盖 `valueMissing`、`badInput`、`rangeUnderflow`、`rangeOverflow`、`customError`、`increment` 和 `decrement`。其他语言区域在未覆盖时使用英文提示。 |

`v-model` 为有限 `number` 或 `null`。`input(text)` 报告编辑文本；`change(value)` 报告确认时提出的新值；`invalid({ reason, message })` 报告确认失败或原生校验失败。`reason` 为上表中前五个提示键之一。组件同时导出 `NumberFieldMessages`、`NumberFieldInvalidReason` 和 `NumberFieldInvalidDetail` 类型。

`#prefix-text` 和 `#suffix-text` 插槽添加单位或货币文字，并自动加入编辑器的无障碍描述。组件引用暴露 `focus()`、`checkValidity()` 和 `reportValidity()`。

`class` 和 `style` 应用于字段根元素，`placeholder`、`autocomplete`、`aria-describedby` 等其他属性传入编辑器。类型、值、数字语义和状态属性由组件管理。已有描述会与字段自身的描述一并保留。

## 行为与无障碍

输入只改变编辑文本，不立即改变 `v-model`。Enter、失焦、步进或正常表单提交会确认有效值。临时的正负号或末尾小数分隔符可继续编辑；无效文本或越界值保留显示，不会被悄悄限制到边界。可选字段清空后确认 `null`，必填字段清空后无效。

上下方向键执行步进；配置边界后，Home 和 End 分别选择最小值和最大值，带修饰键的编辑快捷键仍使用原生行为。编辑器是步进输入的 Tab 停靠点，指针步进操作会将焦点返回编辑器。滚轮不会改变数值。越过边界的步进不可用；空编辑器从零开始，并将首次步进结果调整到允许范围内。

解析支持本地化数字和分隔符，并检查分组格式。仅在确认时格式化，不会在每次输入后改写文本。本组件不处理科学计数法或任意精度小数。语言区域变化会重新格式化可解析的待确认文本，但不确认数值；外部模型更新会替换待确认文本。

原生表单以 `name` 提交未本地化的数字字符串，`null` 提交为空字符串。即使模型仍保存旧值，无效编辑也会阻止正常校验提交。通过正常提交操作或 `requestSubmit()` 确认待编辑值后再读取提交数据。重置恢复初始模型值并清除已显示的校验反馈；禁用字段不进入表单数据。

## 样式

可在 Number field 根元素使用 [Form field 样式钩子](/zh/components/form-field#样式)。输入使用等宽数字；标签、说明和控件间距可随语言行高及文字放大增长。即使可见图标较小，步进操作也保留独立的点击区域。

## Material 参考

[Text fields 指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility) · [Icon buttons](https://m3.material.io/components/icon-buttons/overview) · [Applying type](https://m3.material.io/styles/typography/applying-type)
