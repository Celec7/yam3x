<script setup lang="ts">
import CascaderExample from '../../components/demos/CascaderExample.vue'
</script>

# Cascader

Cascader 是用于从层级结构中选择一条路径的项目拓展组件。它使用具名列表展示直接子选项，将浏览与已确认值分离，并在窄容器中切换为单层视图。Material 没有定义独立的 Cascader 组件。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><CascaderExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CascaderExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Cascader, type CascaderOption } from './components/yam3x/cascader'
import { FormField } from './components/yam3x/form-field'
const value = ref<string[]>([])
const options: CascaderOption[] = [
  {
    value: 'product',
    label: 'Product',
    children: [
      { value: 'design', label: 'Design', children: [{ value: 'brief', label: 'Brief' }] },
    ],
  },
]
</script>

<template>
  <FormField label="Destination">
    <Cascader
      v-model="value"
      :options="options"
      label="Destination"
      name="destination"
      searchable
      required
    />
  </FormField>
</template>
```

## API

| Prop 或模型                                  | 默认值               | 说明                                                                              |
| -------------------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `options`                                    | 必填                 | 只读 `CascaderOption[]`。值必须为非空字符串，在直接同级集合内唯一，层级必须无环。 |
| `label`                                      | 必填                 | 触发器、对话框及可见弹层标题；用 FormField 提供持续可见的字段标签。               |
| `modelValue`、`v-model`                      | `[]`                 | 已确认的有序字符串路径，空数组表示未选择。                                        |
| `open`、`v-model:open`                       | `false`              | 弹层状态；禁用的字段无法打开。                                                    |
| `searchable`                                 | `false`              | 添加原生搜索框与完整路径结果。                                                    |
| `query`、`v-model:query`                     | `''`                 | 与已确认路径独立的搜索文字，关闭时清空。                                          |
| `selectBranches`                             | `false`              | 添加显式选择此路径操作，并让搜索结果包含中间路径；浏览分支仍不提交。              |
| `clearable`                                  | `false`              | 添加清除操作，已知禁用的已确认路径无法从界面清除。                                |
| `separator`                                  | `' / '`              | 仅用于显示的分隔符，表单序列化始终使用 JSON。                                     |
| `id`、`name`、`form`、`required`、`disabled` | 原生默认值           | 显式触发器 ID、原生表单关联、已确认值的校验与禁用状态。                           |
| `locale`                                     | 继承，然后为 `en-US` | 通过 LocaleProvider 选择内置文案语言。                                            |
| `searchLabel`、`noDataText`                  | 本地化文案           | 覆盖搜索标签和无匹配结果文案。                                                    |
| `panelClass`                                 | `''`                 | 添加到弹层表面的类名。                                                            |

`CascaderOption` 包含 `value`、`label`，以及可选的 `disabled` 和只读 `children`。缺省或空 children 表示叶节点。值可在不同分支重复，例如 `['east', 'shared']` 与 `['west', 'shared']` 是不同路径。请提供完整的当前已知层级，Cascader 不定义加载器或分页约定。

`beforeinput(event)` 可取消叶节点确认、显式分支确认、搜索结果确认和清除，单纯浏览不会触发。`input({ values })` 和 `change({ values })` 随模型更新报告选择提议。更新后，原生 input/change 事件从表单代理冒泡。`invalid(event)` 转发原生校验失败。组件引用暴露 `show()`、`close(restoreFocus = true)`、`focus()` 和原生 `trigger` 元素。

内置标签使用 [LocaleProvider](/zh/components/localization) 的 `cascader` 命名空间（`search`、`root`、`empty`、`noResults`、`choosePath`、`level(position, parent)`、`results(label)`）。页脚导航使用 `actions`。显式 locale 和文案 props 优先，标签、值与业务格式由应用控制。

## 行为与无障碍

### 浏览与确认

打开时，以已确认路径的有效前缀初始化草稿。进入分支只打开其子选项，不修改字段值。替换祖先会丢弃过时的草稿后缀，返回同一祖先则保留原草稿。默认只在叶节点提交并关闭；启用 `selectBranches` 后，可使用选择此路径显式确认中间草稿。Escape 和关闭操作丢弃浏览变化，保留已确认值。

每个可见层级是具名的单选 listbox。`aria-selected` 标记该层级中的当前草稿选择，DOM 焦点可独立移动。上／下箭头跳过禁用项，Home／End 到达列表边缘，输入前缀查找启用标签而不确认值。展开方向箭头进入分支，反方向箭头返回父层级，RTL 下方向镜像。Enter 或 Space 激活选项。前缀在 700ms 或导航操作后重置。禁用祖先会阻止后代确认。

### 搜索、布局与焦点

搜索按当前 locale 匹配完整的显示路径，默认结果为完整叶路径，`selectBranches` 还会提供中间路径。修改查询或语言不会更改已确认值。未知的已确认后缀保留原始值，用于显示和表单值，直到应用主动移除。

触发器是打开非模态对话框的仅选择型 combobox。初始焦点进入搜索框，无搜索时进入当前层级；在搜索框按向下箭头进入当前列表。输入法组合键和带修饰键的文本编辑快捷键保留原生含义。Escape 或关闭返回触发器；Tab 和外部关闭保留目标焦点。背景内容仍可交互。

较宽的弹层容器并排展示层级列表，必要时横向滚动。弹层内容宽度不超过 36rem 时，仅显示活动层级。祖先路径和返回操作仍可见，键盘依然能够切换层级。完整标签在当前面板内换行。

### 原生表单

隐藏的原生 select 将已确认路径作为 JSON 数组字符串提交，例如 `["product","design","brief"]`。请使用 `JSON.parse` 读取，`separator` 不影响序列化。空选择使用原生缺失值状态。已知禁用的已确认路径遵循原生 select 规则，不进入 FormData。校验失败聚焦可见触发器。原生重置恢复初始已确认路径并关闭弹层，外层禁用 fieldset 也会禁用已传送的选择器。

选项变化可以调整草稿及其焦点，但不会裁剪应用控制的已确认路径。原已确认路径后来变为中间路径时，即使 `selectBranches` 为 false 也会保留。如果业务要求路径必须当前可解析且为叶路径，请使用 Form 提供应用级校验。

## 样式

使用 FormField 提供轮廓／填充字段外观与说明文字。弹层复用 OptionPanel 与 Option 菜单行的圆角、状态层及按下反馈。首选最小宽度为 640px，最大为 800px，且受视口可用宽度限制。列表的弹性基础宽度为 192px，最大高度为 280px，弹层整体最大高度为 520px；空间更小时，这些上限会相应降低。可用 `panelClass` 设置弹层样式，[Option](/zh/components/option) 拥有行样式约定。

## Material 参考

- [Text fields 指导](https://m3.material.io/components/text-fields/guidelines)
- [Lists 指导](https://m3.material.io/components/lists/guidelines)
- [Menus 指导](https://m3.material.io/components/menus/guidelines)
