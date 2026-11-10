<script setup>
import SelectExample from '../../components/demos/SelectExample.vue'
import SelectDataExample from '../../components/demos/SelectDataExample.vue'
import SelectSearchExample from '../../components/demos/SelectSearchExample.vue'
import SelectVirtualExample from '../../components/demos/SelectVirtualExample.vue'
</script>

# Select

Select 用于从弹出列表中选择一个或多个值。它是项目表单控件，组合本项目的 [Form field](/zh/components/form-field) 与 [Option](/zh/components/option) 基元，同时保留原生表单提交与校验。

当选项较多、有顺序要求或来自数据时应使用它。若选项很少且始终可见，优先使用 [Radio group](/zh/components/radio-group) 或 [Chips](/zh/components/chips)。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><SelectExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SelectExample.vue{vue}

:::

演示为每个场景加了标签：单选、多选、带提交操作的必选字段、关联外部表单、自定义触发器内容，以及禁用与空状态。未选择发布状态就提交时，字段保持无效状态，并在字段内显示校验信息。

### 数据式选项

<div class="vp-raw yam3x-doc-demo-theme"><SelectDataExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SelectDataExample.vue{vue}

:::

传入 `:options="[{ value: 'daily', label: '每日摘要' }, { value: 'weekly', label: '每周摘要', disabled: true }]"` 可使用扁平数据目录。`SelectOption` 包含唯一且非空的字符串 `value`、`label`，以及可选的 `disabled` 和初始 `selected`。类型从 Select 模块导入；此模式下应用无需导入 `Option`。分组或自定义 Option 组合仍使用默认插槽。

当元数据暂时不包含已接受值时，触发器显示原始值，原生提交仍保留它；元数据到达后更新标签，不发出选择变化。应用永久移除选择时，请显式清除模型。

### 可搜索选择

<div class="vp-raw yam3x-doc-demo-theme"><SelectSearchExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SelectSearchExample.vue{vue}

:::

设置 `searchable` 可在数据式选项和分组插槽选项中搜索。`v-model` 保留已接受的值，`v-model:query` 独立保存筛选文字。`filter` 属性可选择不区分大小写的 `contains`、`starts-with`、`ends-with`、`none`，或自定义 `(option, query) => boolean`。由应用根据查询提供选项时使用 `filter="none"`；已选项信息暂缺时仍保留其表单值。

输入、空结果、Escape 和焦点离开都不会清除已选项；接受选择或关闭列表时清空查询。只有输入框中的文字会筛选列表，且查询输入框本身没有表单名称：原生提交和 `required` 校验仍使用已接受的选择。

可搜索模式是项目定义的组合：单选与多选均保持输入框焦点，以 `aria-activedescendant` 指向活动选项。多选列表暴露 `aria-multiselectable`，输入框的无障碍描述包含已接受的值。空分组不出现在筛选结果中。

### 大型目录

<div class="vp-raw yam3x-doc-demo-theme"><SelectVirtualExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SelectVirtualExample.vue{vue}

:::

大型目录可设置 `:options="options" virtual`。`VirtualListOptions` 可从 Select 模块导入，提供 `estimateSize`（默认 `48` CSS 像素）与 `overscan`（每侧默认 `4` 行）。例如 `:virtual="{ estimateSize: 64, overscan: 6 }"`。`overscan: 0` 取消额外预渲染行，仍完整覆盖含弹层内边距的可见区域。估算值只用于尚未测量的行，不会固定内容高度；可见行会自动测量，并响应换行、字体和密度变化。

窗口只挂载视口附近及活动选项，导航与筛选仍使用完整目录。键盘远距离跳转会挂载并滚动到目标；选项的无障碍位置与总数按完整筛选结果计算。选择、可取消事件、重置和必填校验保持相同语义。虚拟化需要数据式 `options`，因为已卸载的插槽无法提供完整目录；纯插槽调用会报告配置错误。

数据插入或移除时，会保留首个可见记录及其行内偏移。若该记录被移除，窗口优先从原顺序中下一个存活记录的开头显示，其次回退到前一个存活记录；整批替换且没有存活记录时回到开头。滚动边界仍然生效。显式键盘导航与搜索跳转优先，数据更新不会强制滚回未变化的屏外焦点项。

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

多选时使用数组 model，切换选项时弹层保持打开。相关选项应使用带标签的 `OptionGroup` 分组。这些选项仍通过组件渲染的原生 `<select>` 提交，因此外层表单负责校验与重置。

::: details 使用输入芯片展示多个值

```vue
<FormField label="发布渠道">
  <Select
    v-model="channels"
    name="channels"
    multiple
    selection-display="chips"
  >
    <Option value="stable" label="稳定版" />
    <Option value="beta" label="测试版" />
  </Select>
</FormField>
```

:::

## 行为与无障碍

触发器的名称由外层 `FormField` 标签或 `aria-label`／`aria-labelledby` 提供。弹出层是 listbox；空结果仍然可以到达，并会播报其状态。

### 键盘

- 单选使用 combobox 语义。DOM 焦点保留在触发器上，活动选项通过 `aria-activedescendant` 暴露；方向键移动活动选项，Enter 接受它，Escape 关闭列表并将焦点返回触发器。
- 多选使用按钮触发器，其无障碍描述会列出当前选中值。打开后焦点移至多选 listbox 中的活动选项；方向键移动选项焦点，Space 或 Enter 切换选择，弹层保持打开。
- Tab 关闭列表并继续离开该控件。将 `closeOnTab` 设为 `false` 可在焦点离开时保持弹层打开。
- 可搜索模式下，方向键移动活动选项，Enter 接受它；单选随后关闭列表，多选保持打开。Home、End、空格和修改键保持原生文字编辑行为。输入法组合结束后才筛选，组合期间 Enter 不会接受选项。

### 焦点与关闭

- 指向面板外部、Escape，以及在 `closeOnTab` 开启时按 Tab 都会关闭弹层。`beforetoggle` 可取消；`toggle` 接收 `{ open, source }`，来源为 `programmatic`、`outside` 或 `anchor-scroll`。
- 面板传送到文档 body 上，并相对触发器定位；空间不足时会翻转或偏移以留在视口内。内容超出时面板自身滚动。
- 不可搜索的多选列表中，目录更新移除或禁用活动选项时，只有列表仍持有焦点才会将焦点移至可用的替代项。列表为空时由列表容器接收焦点，并保留 Escape 关闭能力。外部焦点与已接受的值保持不变。
- 芯片展示模式下，芯片与具名的菜单触发按钮并列，分别获得焦点。移除后焦点移至下一个可用芯片、上一个可用芯片，或在全部移除后回到触发按钮。

### 表单

- `name` 与 `form` 写入组件渲染的原生 `<select>`；原生代理只包含已接受的值，并保持 `aria-hidden`。多选按目录顺序提交，缺少元数据的已接受值随后提交。
- `required` 参与原生约束校验，`disabled` 禁用触发器与选择。原生重置在两种展示模式下都会恢复已接受的模型。
- 查询文字变化时，已接受的值仍保留其表单值：输入、空结果与关闭都不会改写模型。
- 查询输入框没有表单名称，因此 `FormData` 不会包含筛选文字。

### 值展示

- `multiple selection-display="chips"` 会将已接受的值显示为[输入芯片](/zh/components/chips)。芯片标签使用选项名称，缺少选项信息时回退到原始值。
- 激活芯片主体会在对应选项处打开菜单（信息暂缺时使用第一个可用选项）。末尾移除操作、Backspace 或 Delete 会通过与菜单选择相同的可取消 `beforeinput` 流程移除该值。
- 已禁用的选项和已禁用的 Select 不能移除。选项信息暂缺的值仍可移除。
- 两种展示模式下，触发器都保留包含已选名称的无障碍描述和 `#value` 自定义能力。

### 状态归属

`v-model` 持有已接受的值，`v-model:open` 持有受控显示状态，`v-model:query` 持有筛选文字。从目录中移除选项不会改写模型，需要应用显式清除。选项面板在自身容器内滚动，不会撑高页面。

### 响应式与 RTL

设置 `fitAnchorWidth` 时面板保持触发器宽度，并受 `--yam3x-select-panel-max-width` 与视口限制；页面滚动或尺寸变化时会重新定位。传送后的面板继承触发器的 `direction`，因此 RTL 布局下面板仍对齐到行内起始侧。

## API

内置空状态文案可继承 [LocaleProvider](/zh/components/localization) 的 `select` 配置。可选 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；`#no-data` 插槽优先。语言更新保留弹出层状态和单选或多选值。

### 导出

| 导出                 | 类型 | 用途                                                                |
| -------------------- | ---- | ------------------------------------------------------------------- |
| `Select`             | 组件 | 弹出选择控件。                                                      |
| `SelectOption`       | 类型 | 数据式 `options` 目录的行结构。                                     |
| `SelectFilter`       | 类型 | `'contains'`、`'starts-with'`、`'ends-with'`、`'none'` 或匹配函数。 |
| `VirtualListOptions` | 类型 | `virtual` 的窗口渲染配置。                                          |

`Option` 与 `OptionGroup` 来自 `./components/yam3x/option`，放入默认插槽。

### 属性与模型

值与选择：

| 属性                      | 类型                         | 默认值   | 说明                                                             |
| ------------------------- | ---------------------------- | -------- | ---------------------------------------------------------------- |
| `modelValue` / `v-model`  | `string \| string[] \| null` | `null`   | 当前选中值；启用 `multiple` 时为多个选中值。                     |
| `multiple`                | `boolean`                    | `false`  | 允许选择多个值。                                                 |
| `selectionDisplay`        | `'text' \| 'chips'`          | `'text'` | 将已接受的多选值显示为文本或可移除的输入芯片。单选保持文本展示。 |
| `hideSelectionIndicator`  | `boolean`                    | `false`  | 隐藏选项的选中指示器。                                           |
| `open` / `v-model:open`   | `boolean`                    | `false`  | 受控的弹出面板显示状态。                                         |
| `query` / `v-model:query` | `string`                     | `''`     | 独立的筛选文字；接受选择或关闭列表后清空。                       |

目录与筛选：

| 属性         | 类型                            | 默认值       | 说明                                                                                                    |
| ------------ | ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `options`    | `readonly SelectOption[]`       | 未定义       | 数据式选项目录；传入时渲染这些选项，而不使用默认插槽。                                                  |
| `virtual`    | `boolean \| VirtualListOptions` | `false`      | 对数据式 `options` 启用可测量行高的窗口渲染；不能与纯插槽目录同时使用。                                 |
| `searchable` | `boolean`                       | `false`      | 使用可编辑的搜索输入框，文字只筛选选项，不会替换已接受的值。                                            |
| `filter`     | `SelectFilter`                  | `'contains'` | 不区分大小写的 `contains`、`starts-with`、`ends-with`，或 `none`、自定义 `(option, query) => boolean`。 |

表单参与：

| 属性       | 类型      | 默认值   | 说明                                       |
| ---------- | --------- | -------- | ------------------------------------------ |
| `id`       | `string`  | 自动生成 | 触发器 ID。                                |
| `name`     | `string`  | —        | 原生表单字段名。                           |
| `form`     | `string`  | —        | 控件位于表单子树之外时，通过 id 关联表单。 |
| `required` | `boolean` | `false`  | 在原生表单校验中要求必须选择。             |
| `disabled` | `boolean` | `false`  | 禁用触发器和选项选择。                     |

面板与布局：

| 属性             | 类型      | 默认值 | 说明                                      |
| ---------------- | --------- | ------ | ----------------------------------------- |
| `panelClass`     | `string`  | `''`   | 应用于浮动选项面板的 CSS 类。             |
| `fitAnchorWidth` | `boolean` | `true` | 让选项面板与触发器等宽。                  |
| `anchorOffset`   | `number`  | `4`    | 触发器与面板之间的间距，单位为 CSS 像素。 |
| `closeOnTab`     | `boolean` | `true` | Tab 离开触发器时关闭面板。                |

本地化：

| 属性     | 类型     | 默认值             | 说明                         |
| -------- | -------- | ------------------ | ---------------------------- |
| `locale` | `string` | Provider → `en-US` | 空列表等内置文案使用的语言。 |

### 事件

| 事件           | 载荷                | 说明                                                  |
| -------------- | ------------------- | ----------------------------------------------------- |
| `beforeinput`  | `Event`             | 值改变前发出的可取消 DOM 事件；取消后保留当前值。     |
| `input`        | `{ value, source }` | `source` 为 `pointer`、`keyboard` 或 `programmatic`。 |
| `change`       | `{ value, source }` | 已接受的模型变化后发出。                              |
| `invalid`      | `Event`             | 由隐藏的 `<select>` 转发的原生约束失败。              |
| `beforetoggle` | `CustomEvent`       | 可取消；其 detail 携带 `{ open, source }`。           |
| `toggle`       | `{ open, source }`  | 显示状态变化后发出。                                  |
| `open`         | —                   | 弹层打开。                                            |
| `close`        | —                   | 弹层关闭。                                            |

### 插槽

| 插槽      | 作用域                         | 用途                                                                  |
| --------- | ------------------------------ | --------------------------------------------------------------------- |
| default   | `{ values, selected, select }` | 放置 `Option` 或 `OptionGroup`。`select(value, source?)` 提交一个值。 |
| `value`   | `{ value, options }`           | 替换触发器的值内容。                                                  |
| `option`  | `{ option, selected, active }` | 替换数据式行的内容。                                                  |
| `arrow`   | —                              | 替换下拉图标。                                                        |
| `no-data` | —                              | 空列表提示；优先于本地化文案。                                        |

插槽选项应使用唯一字符串值和标签。数据式行的无障碍名称仍为 `option.label`，因此 `#option` 的内容应保持非交互性。`#value` 用于自定义不可搜索的触发器；可搜索字段由原生输入框呈现文字。

### 方法

| 成员      | 签名         | 用途                                      |
| --------- | ------------ | ----------------------------------------- |
| `show()`  | `() => void` | 通过可取消的切换流程打开弹层。            |
| `close()` | `() => void` | 通过可取消的切换流程关闭弹层。            |
| `trigger` | 元素         | 触发按钮或搜索输入框。                    |
| `open`    | 模型 ref     | 暴露的打开状态；优先使用 `v-model:open`。 |

## 样式

将以下项目自定义属性设置在 Select 根元素上。触发器形状默认映射到 System small 圆角；聚焦和打开颜色映射到 System 角色。

| 属性                                    | 说明                                   |
| --------------------------------------- | -------------------------------------- |
| `--yam3x-select-container-shape`        | 触发器圆角。                           |
| `--yam3x-select-icon-size`              | 下拉图标尺寸。                         |
| `--yam3x-select-disabled-color`         | 应用透明度之前的禁用触发器颜色。       |
| `--yam3x-select-disabled-color-opacity` | 禁用触发器颜色透明度。                 |
| `--yam3x-select-panel-max-width`        | 弹出面板最大宽度，默认不超过视口宽度。 |

弹出面板打开时，已接受的值仍使用 on-surface 文本角色，只有尾部箭头使用 primary。面板表面、选项行和状态内容使用 [Option 样式](/zh/components/option#样式)。

## Material 参考

- [Chips 指南](https://m3.material.io/components/chips/guidelines)
- [Menus 指南](https://m3.material.io/components/menus/guidelines)

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [Menus 概览](https://m3.material.io/components/menus/overview)
