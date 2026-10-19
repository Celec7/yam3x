<script setup lang="ts">
import TreeSelectExample from '../../components/demos/TreeSelectExample.vue'
</script>

# TreeSelect

TreeSelect 是用于在紧凑字段中选择层级记录的项目拓展组件。它组合了具名对话弹层、Tree view 导航、可选搜索及多选值的可移除芯片。Material 没有定义独立的 TreeSelect 组件。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TreeSelectExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect, type TreeSelectNode } from './components/yam3x/tree-select'
import { FormField } from './components/yam3x/form-field'
const value = ref<string | string[] | null>(null)
const expanded = ref(['workspace'])
const nodes: TreeSelectNode[] = [
  {
    key: 'workspace',
    label: 'Workspace',
    selectable: false,
    children: [
      { key: 'brief', label: 'Brief' },
      { key: 'notes', label: 'Notes' },
    ],
  },
]
</script>

<template>
  <FormField label="Document">
    <TreeSelect
      v-model="value"
      v-model:expanded-keys="expanded"
      :nodes="nodes"
      label="Document"
      name="document"
      searchable
      required
    />
  </FormField>
</template>
```

## API

| Prop 或模型                                  | 默认值               | 说明                                                                             |
| -------------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `nodes`                                      | 必填                 | 只读 `TreeSelectNode[]`，键必须为全局唯一的非空字符串。                          |
| `label`                                      | 必填                 | 触发器名称、可见树标题及对话框名称；用 FormField 提供持续可见的字段标签。        |
| `modelValue`、`v-model`                      | `null`               | 单个字符串键、多选模式下的数组，或表示未选择的 null。                            |
| `multiple`                                   | `false`              | 独立多选，以可移除的 Input chip 展示。切换模式时，模型会规范化为对应形状。       |
| `open`、`v-model:open`                       | `false`              | 弹层状态；禁用的字段无法打开。                                                   |
| `expandedKeys`、`v-model:expanded-keys`      | `[]`                 | 非搜索状态的应用展开状态。要在初始时显示选中的后代，请提供其祖先键。             |
| `searchable`                                 | `false`              | 在弹层内添加原生搜索输入框。                                                     |
| `query`、`v-model:query`                     | `''`                 | 与已确认键分离的搜索文字，关闭弹层时清空。                                       |
| `clearable`                                  | `false`              | 为可移除的选择提供清除操作；禁用值仍保留。                                       |
| `loadChildren`                               | —                    | `TreeSelectLoader`：`(node, { signal }) => Promise<readonly TreeSelectNode[]>`。 |
| `virtual`                                    | `false`              | `boolean \| VirtualListOptions`，复用 Tree view 的测量窗口。                     |
| `id`、`name`、`form`、`required`、`disabled` | 原生默认值           | 显式触发器 ID、原生表单关联、已确认值的校验与禁用状态。                          |
| `locale`                                     | 继承，然后为 `en-US` | 通过 LocaleProvider 选择内置文案语言。                                           |
| `searchLabel`、`noDataText`                  | 本地化文案           | 覆盖搜索标签和没有匹配结果时的文案。                                             |
| `panelClass`                                 | `''`                 | 添加到弹层表面的类名。                                                           |

`TreeSelectNode` 包含 `key`、`label`，以及可选的 `description`、`icon`、`value`（应用元数据）、`disabled`、`selectable`、`children`、`hasChildren`。`selectable: false` 保留分支导航，但阻止两种模式下的值确认。禁用状态会作用于后代。显式空子数组是叶节点；省略 children 且设置 `hasChildren: true` 时需要加载器。与支持更多键类型的 Tree view 不同，这里的键必须为字符串，使原生表单值保持明确的身份。

可选 `#leading="{ node, expanded }"` 插槽提供装饰内容，请勿在其中放置交互控件。组件引用暴露 `show()`、`close(restoreFocus = true)`、`focus()` 和原生 `trigger` 元素。

`beforeinput(event)` 可取消树选择、芯片移除与清除，调用 `preventDefault()` 可保留已确认值。`input({ values })` 和 `change({ values })` 随模型更新报告选择提议。更新后，原生 input/change 事件从表单代理冒泡。`invalid(event)` 转发原生校验失败。`load({ node, children })` 报告已接受的加载结果；`loadError({ node, error })` 携带诊断信息，树中仍显示通用恢复文案。

内置搜索与空态文案使用 [LocaleProvider](/zh/components/localization) 的 `treeSelect` 命名空间（`search`、`empty`、`noResults`）。树导航、芯片和页脚操作分别使用已有的 `treeView` 与 `actions` 命名空间。显式 locale 与文案 props 优先，记录标签由应用控制。

## 行为与无障碍

### 对话框与选择

单值触发器是带 dialog 弹层的仅选择型 combobox；多值触发器是由已确认标签描述的按钮。打开后焦点进入搜索框，无搜索框时进入树。从搜索框按向下箭头可进入树。Tree view 负责方向感知导航、前缀查找，以及独立于选择的焦点。Enter 确认可选节点，多选模式还支持 Space 切换键。选择分支不会选择其后代。

单选确认后关闭弹层，多选确认后保持打开。Escape 或关闭按钮会关闭弹层并恢复触发器焦点。Escape 保留多选模式中已经确认的选择。Tab 可离开非模态对话框，并关闭弹层而不改变目标焦点；外部指针关闭也保留目标焦点。背景内容仍可交互。输入法组合期间的 Escape／向下箭头以及带修饰键的文本编辑快捷键保留其文本输入含义。

未知的已确认键保留原始键标签与可移除芯片。已禁用的已确认键继续存储，无法从界面移除。已知禁用项遵循原生 select 提交规则，不进入 FormData。移除芯片后焦点移到仍存在的芯片或触发器。

### 搜索与加载

搜索按当前 locale 匹配标签，显示匹配记录及其祖先，不搜索尚未加载的后代。搜索展开状态是临时状态，与 `expandedKeys` 独立；语言变化时保留查询及已有的搜索分支选择。搜索不会清除结果集以外的已确认值。

加载遵循 [Tree view](/zh/components/tree-view) 的重试、校验与取消行为。关闭弹层会取消其中尚未完成的读取，过期结果不能填入字段。已接受的子集合会在多次打开之间缓存；替换源节点对象或提供显式 children 会使其加载缓存失效。加载器应返回完整的直接子集合，而非服务端分页。

### 表单与大型目录

隐藏的原生 select 负责已确认键、name/form 关联、必填校验与提交。多值以重复字段名提交。校验失败聚焦可见触发器；原生表单重置恢复初始已确认模型并关闭弹层。禁用组件或外层 fieldset 会关闭弹层并阻止选择。展开状态与业务值仍由应用控制。

`virtual` 使用 Tree view 的测量窗口，包含焦点行及必要的祖先／分组。筛选和标签解析基于完整的已知层级，原生表单代理仅需保留已确认值。可从 TreeSelect 入口导入 `VirtualListOptions` 配置初始估计与额外渲染行数。虚拟化不隐含记录加载或分页。

## 样式

使用 FormField 提供轮廓／填充字段外观与说明文字。弹层复用 OptionPanel 表面和 Tree view 的圆角行、状态层、焦点指示与按下反馈。弹层宽度跟随字段，可用空间足够时最小为 400px，最大为 640px 且受视口限制；最大高度为 480px，树滚动区为 280px。小视口的可用空间可能进一步降低这些上限。可通过 `panelClass` 设置弹层样式；[Tree view](/zh/components/tree-view) 和 [Input chip](/zh/components/chips) 各自拥有相应的组件样式约定。

## Material 参考

- [Text fields 指导](https://m3.material.io/components/text-fields/guidelines)
- [Lists 指导](https://m3.material.io/components/lists/guidelines)
- [Chips 指导](https://m3.material.io/components/chips/guidelines)
