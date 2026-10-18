<script setup>
import SelectExample from '../../components/demos/SelectExample.vue'
</script>

# Select

Select 是项目表单控件，用于从弹出列表中选择一个或多个值。它组合项目字段和选项基元，同时保留原生表单提交与校验。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><SelectExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SelectExample.vue{vue}

:::

## 在应用中导入

先运行 `pnpm dlx @celec7/yam3x@latest add select option form-field`，然后组合使用：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'
import { Option } from './components/yam3x/option'
import { Select } from './components/yam3x/select'

const frequency = ref('daily')
</script>

<template>
  <FormField label="通知频率">
    <Select
      v-model="frequency"
      name="frequency"
      required
    >
      <Option
        value="immediate"
        label="即时通知"
      />
      <Option
        value="daily"
        label="每天汇总"
      />
      <Option
        value="weekly"
        label="每周汇总"
      />
    </Select>
  </FormField>
</template>
```

多选时使用数组 model，切换选项时弹层保持打开。相关选项应使用 `OptionGroup` 标签分组；选项面板在内容超出时滚动。

## API

内置空状态文案可继承 [LocaleProvider](/zh/components/localization) 的 `select` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；`#no-data` 插槽优先。语言更新保留弹出层状态和单选或多选值。

| 属性                     | 类型                         | 默认值   | 说明                                                   |
| ------------------------ | ---------------------------- | -------- | ------------------------------------------------------ |
| `options`                | `readonly SelectOption[]`    | 未定义   | 数据式选项目录；传入时渲染这些选项，而不使用默认插槽。 |
| `id`                     | `string`                     | 自动生成 | 触发器 ID。                                            |
| `modelValue` / `v-model` | `string \| string[] \| null` | `null`   | 当前选中值；启用 `multiple` 时为多个选中值。           |
| `open` / `v-model:open`  | `boolean`                    | `false`  | 受控的弹出面板显示状态。                               |
| `name`                   | `string`                     | —        | 原生表单字段名。                                       |
| `form`                   | `string`                     | —        | 控件位于表单子树之外时，通过 id 关联表单。             |
| `required`               | `boolean`                    | `false`  | 在原生表单校验中要求必须选择。                         |
| `disabled`               | `boolean`                    | `false`  | 禁用触发器和选项选择。                                 |
| `multiple`               | `boolean`                    | `false`  | 允许选择多个值。                                       |
| `hideSelectionIndicator` | `boolean`                    | `false`  | 隐藏选项的选中指示器。                                 |
| `panelClass`             | `string`                     | `''`     | 应用于浮动选项面板的 CSS 类。                          |
| `fitAnchorWidth`         | `boolean`                    | `true`   | 让选项面板与触发器等宽。                               |
| `anchorOffset`           | `number`                     | `4`      | 触发器与面板之间的间距，单位为 CSS 像素。              |
| `closeOnTab`             | `boolean`                    | `true`   | Tab 离开触发器时关闭面板。                             |

默认 slot 放置 `Option` 或 `OptionGroup`。`#value` 接收 `{ value, options }`；`#arrow` 替换下拉图标，`#no-data` 提供空列表提示。slot 选项应使用唯一字符串值和标签。

值改变前会发出可取消的 DOM `beforeinput` 事件；取消后保留当前值。`input` 与 `change` 接收 `{ value, source }`；`beforetoggle` 可取消，`toggle` 接收 `{ open, source }`。此外还会发出 `open`、`close` 和 `invalid`。

### 数据式选项

传入 `:options="[{ value: 'daily', label: '每日摘要' }, { value: 'weekly', label: '每周摘要', disabled: true }]"` 可使用扁平数据目录。`SelectOption` 包含唯一且非空的字符串 `value`、`label`，以及可选的 `disabled` 和初始 `selected`。类型从 Select 模块导入；此模式下应用无需导入 Option。分组或自定义 Option 组合仍使用现有默认插槽。

`#option="{ option, selected, active }"` 自定义数据式行内容，无障碍名称仍为 `option.label`。内容应保持非交互性。`#value` 继续自定义触发器。当元数据暂时不包含已接受值时，触发器显示原始值，原生提交仍保留它；元数据到达后更新标签，不发出选择变化。应用永久移除选择时，请显式清除模型。

## 行为与无障碍

单选触发器的名称由外层 `FormField` 标签或 `aria-label`／`aria-labelledby` 提供，并使用 combobox 语义；活动选项通过 `aria-activedescendant` 暴露，DOM 焦点保留在触发器上。多选模式下，触发器是按钮，其无障碍描述会提供当前选中值；打开后焦点移至多选 listbox 中的活动选项。方向键移动选项焦点，Space 或 Enter 切换选择，弹层保持打开。Escape 关闭列表并将焦点返回触发器；Tab 关闭列表并继续离开该控件。

## 样式

将以下项目自定义属性设置在 Select 根元素上。触发器形状默认映射到 System small 圆角；聚焦和打开颜色映射到 System 角色。

| 属性                                    | 说明                                   |
| --------------------------------------- | -------------------------------------- |
| `--yam3x-select-container-shape`        | 触发器圆角。                           |
| `--yam3x-select-icon-size`              | 下拉图标尺寸。                         |
| `--yam3x-select-disabled-color`         | 应用透明度之前的禁用触发器颜色。       |
| `--yam3x-select-disabled-color-opacity` | 禁用触发器颜色透明度。                 |
| `--yam3x-select-panel-max-width`        | 弹出面板最大宽度，默认不超过视口宽度。 |

面板表面、选项行和状态内容使用 [Option 样式](/zh/components/option#样式)。

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [Menus 概览](https://m3.material.io/components/menus/overview)
