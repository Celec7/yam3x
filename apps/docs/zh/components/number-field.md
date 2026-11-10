<script setup lang="ts">
import NumberFieldBasicExample from '../../components/demos/NumberFieldBasicExample.vue'
import NumberFieldExample from '../../components/demos/NumberFieldExample.vue'
import NumberFieldStatesExample from '../../components/demos/NumberFieldStatesExample.vue'
</script>

# Number field

文本字段让用户在 UI 中输入文本。它们通常出现在表单和对话框中。

`NumberField` 是面向数量和普通小数值的项目扩展。它应用 Material 文本字段呈现，并增加本地化解析、步进和提交。Compose Material 3 没有数字字段基元；最接近的组合是带有尾部 `IconButton` 的 `OutlinedTextField` 或 `TextField`。标识符、电话号码和由应用负责的精确十进制运算请使用普通的[表单字段](/zh/components/form-field)或文本字段。

## 示例

### 基础

字段在 `v-model` 中保留已提交数字，执行包含式限制，并通过尾部操作或键盘按配置的增量步进。

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NumberFieldBasicExample.vue{vue}

:::

### 编辑、校验与表单提交

输入会改变编辑文本，但不会改变模型。Enter、失焦、步进操作或原生表单提交会提交有效值。演示会阻止无效提交，保留超出范围的输入，并以 `name` 提交未本地化的数字字符串。

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NumberFieldExample.vue{vue}

:::

控制项可在描边和填充之间切换，并可隐藏指针步进操作而保留键盘步进。

### 区域格式与状态

画廊展示带前缀和后缀文本的德语金额、带小数的重量、中文数量、只读与禁用字段、填充变体，以及在字段内显示校验错误的必填字段。

<div class="vp-raw yam3x-doc-demo-theme"><NumberFieldStatesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NumberFieldStatesExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/start/installation)复制组件及其 Form field 与 Icon button 依赖，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

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
    hint="范围为 0 至 10 千克"
  >
    <template #suffix-text>kg</template>
  </NumberField>
</template>
```

`v-model` 保存有限数字或 `null`。`input` 报告编辑文本，`change` 报告已提交值，因此请把校验留在应用中，并用模型绑定接受值。

::: details 消息、前后缀与程序化校验

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NumberField, type NumberFieldInvalidDetail } from './components/yam3x/number-field'

const field = ref<InstanceType<typeof NumberField> | null>(null)
const quantity = ref<number | null>(null)
const error = ref('')

function onInvalid(detail: NumberFieldInvalidDetail): void {
  error.value = detail.message
}
</script>

<template>
  <form @submit.prevent>
    <NumberField
      ref="field"
      v-model="quantity"
      label="数量"
      name="quantity"
      required
      :min="1"
      :max="99"
      :messages="{ valueMissing: '请选择数量。' }"
      :error="error"
      @invalid="onInvalid"
    >
      <template #prefix-text>#</template>
    </NumberField>
    <button
      type="button"
      @click="field?.reportValidity()"
    >
      检查数量
    </button>
  </form>
</template>
```

`error` 接受消息字符串，或传 `true` 使用本地化的通用消息。`#prefix-text` 与 `#suffix-text` 的内容会加入编辑器的可访问描述。

:::

## 行为与无障碍

### 编辑与提交

- 编辑文本与已提交模型分离。减号或末尾小数点等临时输入保持可编辑。
- Enter、失焦、步进操作或正常表单提交会提交有效值。格式化发生在提交时，而不是每次按键。
- 无效文本和超出范围的值保持可见；字段不会静默截断输入。
- 空的可选输入提交 `null`；空的必填输入无效。
- 外部模型更新会替换编辑文本并清除显示中的校验反馈。
- 组件 ref 上提供 `focus()`、`checkValidity()` 和 `reportValidity()`。

### 约束与步进操作

- `min` 和 `max` 是包含式有限限制；`step` 是正增量，但不会把直接输入的值限制到网格。
- 步进操作在当前有效编辑或无效编辑时的最后提交值上加减 `step`。
- 对空编辑器步进会从零开始，并把第一个结果带入允许范围。
- 会越过边界的步进不可用，其指针操作处于禁用状态。禁用和只读字段不能步进。
- 滚轮滚动永远不会改变数值。

### 区域格式与格式化

- 解析接受本地化数字、分组和十进制分隔符，并校验分组。科学计数法和任意精度小数不在此字段的范围内。
- 内置消息、数字格式化和解析会继承 [LocaleProvider](/zh/components/localization)。显式 `locale` 和 `messages` 优先；没有 provider 时区域为 `en-US`。
- 区域变化会重新格式化可解析的待提交编辑，但不会提交它。
- `input` 报告编辑文本；`change` 仅在与上一个值不同时报告已提交值。
- `invalid` 报告 `{ reason, message }`，原因可能是 `valueMissing`、`badInput`、`rangeUnderflow`、`rangeOverflow` 或 `customError`。

### 键盘与焦点

- 上、下方向键步进数值。Home 和 End 选择提供的最大值或最小值；带修饰键的编辑快捷键保持原生行为。
- Enter 提交当前编辑。编辑器是唯一的 Tab 停靠点；指针步进操作使用 `tabindex="-1"`，并把焦点返回编辑器。
- 编辑器暴露 `role="spinbutton"`、`inputmode="decimal"`，以及数字型的 `aria-valuenow`、`aria-valuetext`、`aria-valuemin` 和 `aria-valuemax`。

### 表单

- 原生表单以 `name` 接收未本地化的数字字符串，`null` 则为空字符串。禁用字段不参与提交。
- 即使模型仍保留较早的值，无效编辑也会阻止正常的已校验提交。请在读取提交数据前使用表单提交动作提交待处理编辑。
- 重置恢复初始模型值并清除显示中的校验反馈；被阻止的重置会被尊重。
- `form` 可将编辑器及其隐藏值 input 关联到子树之外的表单。

## API

### 导出

| 导出                       | 类型 | 用途                                                                                     |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------- |
| `NumberField`              | 组件 | 带可选步进操作的本地化数字编辑器。                                                       |
| `NumberFieldMessages`      | 类型 | 校验消息与步进操作消息的覆盖项。                                                         |
| `NumberFieldInvalidReason` | 类型 | `'valueMissing' \| 'badInput' \| 'rangeUnderflow' \| 'rangeOverflow' \| 'customError'`。 |
| `NumberFieldInvalidDetail` | 类型 | `invalid` 事件的 `{ reason, message }`。                                                 |

### 属性与模型

| 属性 / 模型          | 类型                           | 默认值             | 说明                                                                                   |
| -------------------- | ------------------------------ | ------------------ | -------------------------------------------------------------------------------------- |
| `v-model`            | `number \| null`               | `null`             | 已提交的有限数字，或空的可选字段为 null。                                              |
| `label`              | `string`                       | 必填               | 可见标签与可访问名称基础。                                                             |
| `id`                 | `string`                       | 生成               | 编辑器 ID；也用于字段标签。                                                            |
| `name`               | `string`                       | —                  | 提交字段名。                                                                           |
| `form`               | `string`                       | —                  | 按 ID 将编辑器关联到表单。                                                             |
| `locale`             | `string`                       | Provider → `en-US` | 数字、分组、十进制分隔符和内置消息。                                                   |
| `min` / `max`        | `number`                       | 无限制             | 包含式有限限制。                                                                       |
| `step`               | `number`                       | `1`                | 步进操作和键盘步进的正增量。                                                           |
| `required`           | `boolean`                      | `false`            | 原生必填校验。                                                                         |
| `disabled`           | `boolean`                      | `false`            | 禁用编辑、步进和表单提交。                                                             |
| `readonly`           | `boolean`                      | `false`            | 禁止编辑和步进，但仍提交值。                                                           |
| `controls`           | `boolean`                      | `true`             | 显示指针步进操作；键盘步进仍可用。                                                     |
| `variant`            | `'outlined' \| 'filled'`       | `'outlined'`       | 文本字段容器样式。                                                                     |
| `hint`               | `string`                       | `''`               | 补充说明。                                                                             |
| `error`              | `string \| boolean`            | `false`            | 错误文本，或 `true` 使用本地化通用消息。                                               |
| `width`              | `string`                       | Form field `270px` | 首选宽度，受父级限制。                                                                 |
| `hideRequiredMarker` | `boolean`                      | `false`            | 隐藏可见的必填星号。                                                                   |
| `messages`           | `Partial<NumberFieldMessages>` | 区域消息           | 覆盖 `valueMissing`、`badInput`、范围消息、`customError`、`increment` 和 `decrement`。 |

### 事件

| 事件      | 载荷                       | 说明                                     |
| --------- | -------------------------- | ---------------------------------------- |
| `input`   | `string`                   | 每次编辑后的编辑文本；此时不会改变模型。 |
| `change`  | `number \| null`           | 与上一个值不同的已提交值。               |
| `invalid` | `NumberFieldInvalidDetail` | 提交失败或原生校验失败，包含原因和消息。 |

### 插槽

| 插槽          | 说明                                       |
| ------------- | ------------------------------------------ |
| `prefix-text` | 编辑器前的货币或单位文本；包含在其描述中。 |
| `suffix-text` | 编辑器后的单位文本；包含在其描述中。       |

### 方法

通过模板 ref 访问。

| 方法               | 返回      | 说明                                           |
| ------------------ | --------- | ---------------------------------------------- |
| `focus()`          | `void`    | 将焦点移到编辑器。                             |
| `checkValidity()`  | `boolean` | 将原生有效性与当前编辑同步，然后返回是否有效。 |
| `reportValidity()` | `boolean` | 编辑无效时显示原生校验消息。                   |

`class` 和 `style` 应用于字段根节点。`placeholder`、`autocomplete`、`aria-describedby` 等其他属性会到达编辑器；其类型、值、数字角色和状态属性由组件拥有。既有描述会与字段自身的描述一并保留。

## 样式

在 Number field 根节点使用支持的 [Form field 样式钩子](/zh/components/form-field#样式)。字段会添加自己的块级内边距和步进操作几何；编辑器使用等宽数字。

描边字段为 Form field 容器和编辑器控件增加 4px 块级内边距。填充字段增加 4px 容器块级内边距，并在控件顶部增加 16px 内嵌、底部不增加。每个步进操作至少保留 48 × 40px 的盒子，两个操作之间为 4px；默认 56px 字段解析为 48 × 48px。标签、补充说明和控制间距会随语言高度和放大文本增长。

## Material 参考

[Text fields 指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility) · [Icon buttons](https://m3.material.io/components/icon-buttons/overview) · [Applying type](https://m3.material.io/styles/typography/applying-type)
