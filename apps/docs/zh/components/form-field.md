<script setup lang="ts">
import FormFieldBasicExample from '../../components/demos/FormFieldBasicExample.vue'
import FormFieldExample from '../../components/demos/FormFieldExample.vue'
import FormFieldSlotsExample from '../../components/demos/FormFieldSlotsExample.vue'
</script>

# Form field

文本字段让用户在 UI 中输入文本。它们通常出现在表单和对话框中。

`FormField` 是项目包装组件，把 Material 文本字段容器、标签以及补充或错误文本应用到原生 `input`、`textarea` 或 `select`。Compose Material 3 没有等价的插槽式包装；最接近的组合是 `OutlinedTextField` 或 `TextField`。包装组件负责呈现与可访问关联，而组合的控件负责其值、校验和提交。

## 示例

### 基础

包装组件找到默认插槽中的第一个控件，关联可见标签，并把提示添加为它的描述。

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FormFieldBasicExample.vue{vue}

:::

### 校验、标签与补充说明

表单校验必填的电子邮件 input。原生 invalid 和演示自身的检查会把提示替换为错误文本，错误插槽添加图标，重置按钮恢复空字段。控制项可切换外观、辅助文字可见性和标签位置。

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FormFieldExample.vue{vue}

:::

### 插槽与容器状态

画廊添加带描述 ID 的文本前后缀、前置图标、自定义标签、自定义计数器、只读与禁用控件，以及带真实模式约束的错误插槽。

<div class="vp-raw yam3x-doc-demo-theme"><FormFieldSlotsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FormFieldSlotsExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'

const email = ref('')
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
</template>
```

除非 `#label` 插槽提供可见标签，否则 `label` 为必填项。值有专用编辑器时，优先使用 [Number field](/zh/components/number-field) 或 [Select](/zh/components/select) 等控件。

::: details 前后缀、计数器与描述 ID

```vue
<script setup lang="ts">
import { FormField } from './components/yam3x/form-field'
</script>

<template>
  <FormField
    label="金额"
    hint="请输入美元金额"
  >
    <template #prefix-text><span id="amount-prefix">$</span></template>
    <input
      aria-describedby="amount-prefix amount-suffix"
      inputmode="decimal"
    />
    <template #suffix-text><span id="amount-suffix">USD</span></template>
  </FormField>
  <FormField
    label="显示名称"
    :counter-label="'字符计数'"
  >
    <input maxlength="24" />
    <template #counter="{ count, max }">
      <strong>{{ count }}/{{ max }}</strong>
    </template>
  </FormField>
</template>
```

请为有意义的文本前后缀提供唯一 ID，并把它们加入控件的 `aria-describedby`；包装组件会保留这些引用，并按需添加自己的提示、错误和计数器 ID。

:::

## 行为与无障碍

### 控件关联

- 包装组件使用默认插槽中第一个 `[data-form-field-control]`、`input`、`textarea` 或 `select` 作为被标注的控件。
- 控件没有 ID 时它分配一个，并把标签渲染为原生 `for` 关联。既有 `aria-label` 会被尊重；既有 `aria-labelledby` 会追加生成的标签 ID。
- 调用方的 `aria-describedby` 会被保留。提示、错误和计数器 ID 会随这些元素出现或移除。
- 点击标签会聚焦控件，点击容器空白区域也会如此。禁用控件保持不可聚焦。

### 状态与校验

- 必填星号跟随控件的原生 `required` 或 `aria-required`；`hideRequiredMarker` 可隐藏它。请在表单中说明必填标记的含义。
- `error` 接受消息字符串或 `true`，并通过 `aria-invalid` 把控件标记为无效。消息或 `#error` 插槽会替换提示并以 `role="alert"` 渲染；单独使用 `:error="true"` 只标记无效而不给出说明，因此请尽量提供错误文本。
- 原生 `invalid` 事件会显示控件的校验消息和错误状态。值变为有效或表单重置后该状态会清除。
- `disabled`、`readonly` 和禁用的祖先 `fieldset` 会从控件反映，并在这些属性变化时更新。
- `floatLabel="auto"` 在聚焦或控件有值时浮起标签；`always` 保持浮起。

### 插槽与计数器

- 默认插槽放置控件。`#prefix` 和 `#suffix` 接受控件或图标；`#prefix-text` 和 `#suffix-text` 接受货币或单位文本。
- `hideSubscript="auto"` 仅在聚焦或无效时显示补充说明，并在隐藏时从描述中移除提示。`always` 保持视觉隐藏但对辅助技术可用。
- 原生 `maxlength` 会显示并关联字符计数器。`#counter` 接收 `{ count, max }`，`counterLabel` 为辅助技术命名计数器。
- 调用方图标和前后缀控件需要准确的可访问名称。装饰性图标应设置 `aria-hidden`。
- 不要只依赖颜色：像错误插槽那样，把错误呈现与文本配对。

## API

内置界面文字可继承共享的 [LocaleProvider](/zh/components/localization) 配置。显式 `locale` 和 `counterLabel` 优先；没有 provider 时区域默认为 `en-US`。

### 导出

| 导出        | 类型 | 用途                                   |
| ----------- | ---- | -------------------------------------- |
| `FormField` | 组件 | 围绕一个原生控件的 Material 字段呈现。 |

### 属性

| 属性                 | 类型                            | 默认值             | 说明                                                     |
| -------------------- | ------------------------------- | ------------------ | -------------------------------------------------------- |
| `label`              | `string`                        | 必填               | 可见字段标签；`#label` 插槽可替换其内容。                |
| `locale`             | `string`                        | Provider → `en-US` | 内置计数器文字的语言。                                   |
| `id`                 | `string`                        | 生成               | 控件没有 ID 时分配给插槽控件。                           |
| `variant`            | `'outlined' \| 'filled'`        | `'outlined'`       | 字段容器样式。                                           |
| `hint`               | `string`                        | —                  | 补充说明；`#hint` 插槽是替代方案。                       |
| `error`              | `string \| boolean`             | —                  | 错误文本或无效标记；`#error` 插槽是替代方案。            |
| `hideRequiredMarker` | `boolean`                       | `false`            | 隐藏可见的必填星号。                                     |
| `hideSubscript`      | `'never' \| 'auto' \| 'always'` | `'never'`          | 辅助文字可见性：始终显示、聚焦或无效时显示、或视觉隐藏。 |
| `floatLabel`         | `'auto' \| 'always'`            | `'auto'`           | 在聚焦或控件有值时浮起标签，或始终浮起。                 |
| `width`              | `string`                        | `270px`            | 首选宽度，受父级限制。                                   |
| `counterLabel`       | `string`                        | 本地化默认值       | 字符计数器的可访问名称。                                 |

### 插槽

| 插槽          | 作用域           | 说明                                                      |
| ------------- | ---------------- | --------------------------------------------------------- |
| 默认插槽      | —                | 被标注的原生控件。                                        |
| `label`       | —                | 替换可见标签内容。                                        |
| `prefix`      | —                | 容器内的前置控件或图标。                                  |
| `prefix-text` | —                | 前置货币或单位文本。                                      |
| `suffix`      | —                | 容器内的尾部控件或图标。                                  |
| `suffix-text` | —                | 尾部单位文本。                                            |
| `hint`        | —                | 替换提示内容。                                            |
| `error`       | —                | 替换错误内容；仍以 alert 角色渲染。                       |
| `counter`     | `{ count, max }` | 替换可见计数器内容。没有 `maxlength` 时 `max` 为 `null`。 |

### 事件

`FormField` 不发出事件。属性和类转发应用于包装根节点；插槽控件保留自己的属性。

### 方法

`FormField` 不暴露实例方法。

## 样式

标签保持完整可见；标签较长时请增加 `width`。默认容器高 56px，首选宽度 270px。描边字段使用 1px 启用描边和 3px 聚焦描边；错误样式优先于聚焦样式。

::: details CSS 覆盖

在 `FormField` 根节点设置以下受支持的项目 CSS 属性：

| 属性                                       | 应用位置                         |
| ------------------------------------------ | -------------------------------- |
| `--yam3x-form-field-container-shape`       | 描边和填充容器的圆角             |
| `--yam3x-form-field-container-color`       | 填充容器背景                     |
| `--yam3x-form-field-outline-color`         | 启用描边与填充指示条             |
| `--yam3x-form-field-focused-color`         | 聚焦标签                         |
| `--yam3x-form-field-focused-outline-color` | 聚焦描边或激活指示条             |
| `--yam3x-form-field-invalid-color`         | 错误描边或指示条、标签和支持文字 |

错误悬停会从配置的无效颜色和当前 on-surface 角色派生指示条与标签颜色；支持文字保持无效颜色。密度可降低容器高度，但目标区域至少保持 48px。

:::

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility)
