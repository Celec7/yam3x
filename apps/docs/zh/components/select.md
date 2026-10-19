<script setup>
import SelectExample from '../../components/demos/SelectExample.vue'
import SelectVirtualExample from '../../components/demos/SelectVirtualExample.vue'
</script>

# Select

Select 是项目表单控件，用于从弹出列表中选择一个或多个值。它组合项目字段和选项基元，同时保留原生表单提交与校验。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><SelectExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SelectExample.vue{vue}

:::

### 大型选项目录

<div class="vp-raw yam3x-doc-demo-theme"><SelectVirtualExample /></div>

::: details 查看大型目录示例源码

<<< ../../components/demos/SelectVirtualExample.vue{vue}

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

| 属性                      | 类型                            | 默认值       | 说明                                                                                                    |
| ------------------------- | ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `options`                 | `readonly SelectOption[]`       | 未定义       | 数据式选项目录；传入时渲染这些选项，而不使用默认插槽。                                                  |
| `virtual`                 | `boolean \| VirtualListOptions` | `false`      | 对数据式 `options` 启用可测量行高的窗口渲染；不能与纯插槽目录同时使用。                                 |
| `searchable`              | `boolean`                       | `false`      | 使用可编辑的搜索输入框，文字只筛选选项，不会替换已接受的值。                                            |
| `query` / `v-model:query` | `string`                        | `''`         | 独立的筛选文字；接受选择或关闭列表后清空。                                                              |
| `filter`                  | `SelectFilter`                  | `'contains'` | 不区分大小写的 `contains`、`starts-with`、`ends-with`，或 `none`、自定义 `(option, query) => boolean`。 |
| `id`                      | `string`                        | 自动生成     | 触发器 ID。                                                                                             |
| `modelValue` / `v-model`  | `string \| string[] \| null`    | `null`       | 当前选中值；启用 `multiple` 时为多个选中值。                                                            |
| `open` / `v-model:open`   | `boolean`                       | `false`      | 受控的弹出面板显示状态。                                                                                |
| `name`                    | `string`                        | —            | 原生表单字段名。                                                                                        |
| `form`                    | `string`                        | —            | 控件位于表单子树之外时，通过 id 关联表单。                                                              |
| `required`                | `boolean`                       | `false`      | 在原生表单校验中要求必须选择。                                                                          |
| `disabled`                | `boolean`                       | `false`      | 禁用触发器和选项选择。                                                                                  |
| `multiple`                | `boolean`                       | `false`      | 允许选择多个值。                                                                                        |
| `selectionDisplay`        | `'text' \| 'chips'`             | `'text'`     | 将已接受的多选值显示为文本或可移除的输入芯片。单选保持文本展示。                                        |
| `hideSelectionIndicator`  | `boolean`                       | `false`      | 隐藏选项的选中指示器。                                                                                  |
| `panelClass`              | `string`                        | `''`         | 应用于浮动选项面板的 CSS 类。                                                                           |
| `fitAnchorWidth`          | `boolean`                       | `true`       | 让选项面板与触发器等宽。                                                                                |
| `anchorOffset`            | `number`                        | `4`          | 触发器与面板之间的间距，单位为 CSS 像素。                                                               |
| `closeOnTab`              | `boolean`                       | `true`       | Tab 离开触发器时关闭面板。                                                                              |

默认 slot 放置 `Option` 或 `OptionGroup`。`#value` 接收 `{ value, options }`；`#arrow` 替换下拉图标，`#no-data` 提供空列表提示。slot 选项应使用唯一字符串值和标签。

值改变前会发出可取消的 DOM `beforeinput` 事件；取消后保留当前值。`input` 与 `change` 接收 `{ value, source }`；`beforetoggle` 可取消，`toggle` 接收 `{ open, source }`。此外还会发出 `open`、`close` 和 `invalid`。

### 数据式选项

传入 `:options="[{ value: 'daily', label: '每日摘要' }, { value: 'weekly', label: '每周摘要', disabled: true }]"` 可使用扁平数据目录。`SelectOption` 包含唯一且非空的字符串 `value`、`label`，以及可选的 `disabled` 和初始 `selected`。类型从 Select 模块导入；此模式下应用无需导入 Option。分组或自定义 Option 组合仍使用现有默认插槽。

`#option="{ option, selected, active }"` 自定义数据式行内容，无障碍名称仍为 `option.label`。内容应保持非交互性。`#value` 继续自定义触发器。当元数据暂时不包含已接受值时，触发器显示原始值，原生提交仍保留它；元数据到达后更新标签，不发出选择变化。应用永久移除选择时，请显式清除模型。

### 虚拟化

大型目录可设置 `:options="options" virtual`。`VirtualListOptions` 可从 Select 模块导入，提供 `estimateSize`（默认 `48` CSS 像素）与 `overscan`（每侧默认 `4` 行）。例如 `:virtual="{ estimateSize: 64, overscan: 6 }"`。估算值只用于尚未测量的行，不会固定内容高度；可见行会自动测量，并响应换行、字体和密度变化。

窗口只挂载视口附近及活动选项，导航与筛选仍使用完整目录。键盘远距离跳转会挂载并滚动到目标；选项的无障碍位置与总数按完整筛选结果计算。原生代理只保留已选值，仍按目录顺序提交，缺少信息的已选值随后提交。选择、可取消事件、重置和必填校验保持相同语义。虚拟化需要数据式 `options`，因为已卸载的插槽无法提供完整目录；纯插槽调用会报告配置错误。

### 可搜索选择

设置 `searchable` 可在数据式选项和分组插槽选项中搜索。`v-model` 保留已接受的值，`v-model:query` 独立保存筛选文字。输入、空结果、Escape 和焦点离开都不会清除已选项；接受选择或关闭列表时清空查询。设置 `filter="none"` 可由应用根据查询提供选项；已选项信息暂缺时仍保留其表单值。

输入框支持原生文字编辑。方向键移动活动选项，Enter 接受它，单选随后关闭列表，多选保持打开。Home、End、空格和修改键保持原生编辑行为。中文等输入法组合结束后才筛选；组合期间 Enter 不会接受选项。查询输入框本身没有表单名称，原生提交和 `required` 校验仍使用已接受的选择。`#value` 适用于不可搜索的触发按钮；可搜索模式由原生输入框呈现文字。

### 多选值展示

设置 `multiple selection-display="chips"`，将已接受的值显示为[输入芯片](/zh/components/chips)。芯片使用选项名称，缺少选项信息时回退到原始值。激活芯片主体会在对应选项处打开菜单（信息暂缺时使用第一个可用选项）；末尾移除操作、Backspace 或 Delete 会通过与菜单选择相同的可取消 `beforeinput` 流程移除该值。已禁用的选项和已禁用的 Select 不能移除。选项信息暂缺的值仍可移除。

芯片与具名的菜单触发按钮并列，分别获得焦点。移除后焦点移至下一个可用芯片、上一个可用芯片，或在全部移除后回到触发按钮；每个芯片主体与移除操作均可通过键盘访问。触发按钮保留包含已选名称的无障碍描述和 `#value` 自定义能力。两种展示模式的原生表单值与重置均使用已接受的模型。

## 行为与无障碍

不可搜索的多选列表中，目录更新移除或禁用活动选项时，只有列表仍持有焦点才会将焦点移至可用的替代项。列表为空时由列表容器接收焦点，并保留 Escape 关闭能力。外部焦点与已接受的值保持不变。

可搜索模式是项目定义的组合：单选与多选均保持输入框焦点，以 `aria-activedescendant` 指向活动选项。多选列表暴露 `aria-multiselectable`，输入框的无障碍描述包含已接受的值。空分组不出现在筛选结果中。

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

- [Chips 指南](https://m3.material.io/components/chips/guidelines)

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [Menus 概览](https://m3.material.io/components/menus/overview)
