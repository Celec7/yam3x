<script setup lang="ts">
import TreeSelectBasicExample from '../../components/demos/TreeSelectBasicExample.vue'
import TreeSelectMultipleExample from '../../components/demos/TreeSelectMultipleExample.vue'
import TreeSelectExample from '../../components/demos/TreeSelectExample.vue'
</script>

# TreeSelect

TreeSelect 是项目拓展组件，用于在紧凑字段中选择层级记录。它组合了具名对话框、Tree view 导航、可选搜索，以及用于多个值的可移除芯片。

Material 3 Expressive 没有定义 TreeSelect。最接近的 Compose 组合是带有树选择器的 `ExposedDropdownMenuBox`；并不存在 TreeSelect 原语。字段、树和芯片处理来自项目的 [Form field](/zh/components/form-field)、[Tree view](/zh/components/tree-view) 和 [Input chip](/zh/components/chips) 设计，而对话框与选择行为属于项目决定。

当记录形成层级且字段需要保持紧凑时使用它。主要任务是逐层选择一条路径时使用 [Cascader](/zh/components/cascader)；完整树应持续显示在页面上时使用 [Tree view](/zh/components/tree-view)。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectBasicExample /></div>

打开对话框可搜索标签或浏览树。展开分支不会选择它；Enter 确认可选记录。字段保留已确认键，并在示例下方打印。

::: details 查看示例源码

<<< ../../components/demos/TreeSelectBasicExample.vue{vue}

:::

### 多选

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectMultipleExample /></div>

多选模式把已确认记录显示为 Input chip。移除芯片会独立于展开状态更新模型。示例初始包含一个未知键和一个禁用的已确认记录：未知芯片仍可移除，而禁用记录会保留，且无法通过界面移除。

::: details 查看示例源码

<<< ../../components/demos/TreeSelectMultipleExample.vue{vue}

:::

### 状态、加载与大型目录

<div class="vp-raw yam3x-doc-demo-theme"><TreeSelectExample /></div>

主示例组合了单选和多选字段、镜像方向、fieldset 禁用、拒绝更改、可重试的失败加载器，以及带虚拟化和可移除开头记录的一万条记录目录。已确认文档显示在字段下方。

::: details 查看示例源码

<<< ../../components/demos/TreeSelectExample.vue{vue}

:::

## 在应用中使用

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件与字段包装组件：

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
    label: '工作区',
    selectable: false,
    children: [
      { key: 'brief', label: '简报' },
      { key: 'notes', label: '笔记' },
    ],
  },
]
</script>

<template>
  <FormField label="文档">
    <TreeSelect
      v-model="value"
      v-model:expanded-keys="expanded"
      :nodes="nodes"
      label="文档"
      name="document"
      searchable
      required
    />
  </FormField>
</template>
```

键必须是全局唯一且非空的字符串。`selectable: false` 保留分支导航，但阻止两种模式下的值确认。禁用节点也会禁用其后代。显式空 `children` 数组是叶节点；省略 children 且设置 `hasChildren: true` 时需要加载器。

::: details 多值与芯片

```vue
<template>
  <TreeSelect
    v-model="values"
    :nodes="nodes"
    label="文档集合"
    name="documents"
    multiple
    searchable
    clearable
  />
</template>
```

绑定数组会启用独立多选。切换 `multiple` 会把模型规范化为对应形状。芯片移除与清除操作使用与树确认相同的可取消 `beforeinput` 路径。

:::

::: details 懒加载分支与虚拟化

```vue
<script setup lang="ts">
import {
  TreeSelect,
  type TreeSelectLoader,
  type TreeSelectNode,
} from './components/yam3x/tree-select'

const loadChildren: TreeSelectLoader = async (node, { signal }) => {
  const response = await fetch(`/api/records/${node.key}/children`, { signal })
  const rows = (await response.json()) as TreeSelectNode[]
  return rows
}
</script>

<template>
  <TreeSelect
    v-model="value"
    :nodes="nodes"
    :load-children="loadChildren"
    :virtual="{ estimateSize: 40, overscan: 6 }"
    label="文档"
  />
</template>
```

加载器返回完整的直接子集合，而不是服务端分页。虚拟化使用 Tree view 的测量窗口，不隐含记录加载或分页。

:::

## 行为与无障碍

### 对话框与选择

- 单值触发器是带 dialog 弹层的仅选择型 combobox；多值触发器是由已确认标签描述的按钮。
- 打开后焦点进入搜索框，无搜索框时进入树。从搜索框按向下箭头可进入树。
- Tree view 负责方向感知导航、前缀查找，以及独立于选择的焦点。Enter 确认可选节点；多选模式还支持 Space 切换键。
- 选择分支不会选择其后代。单选确认后关闭弹层，多选确认后保持打开。
- Escape 或关闭会关闭对话框并恢复触发器焦点。Escape 保留多选模式中已经确认的选择。
- Tab 可离开非模态对话框，并关闭弹层而不改变目标焦点。外部指针关闭也保留目标焦点。背景内容仍可交互。
- 输入法组合期间的 Escape 和向下箭头，以及带修饰键的文本编辑快捷键，保留其文本输入含义。

### 搜索与加载

- 搜索按当前 locale 匹配标签，显示匹配记录及其祖先，不搜索尚未加载的后代。
- 搜索展开状态是临时状态，与 `expandedKeys` 独立；语言变化时保留查询及已有的搜索分支选择。搜索不会清除结果集以外的已确认值。
- 加载遵循 [Tree view](/zh/components/tree-view) 的重试、校验与取消行为。关闭弹层会取消其中尚未完成的读取；过期结果不能填入字段。
- 已接受的子集合会在多次打开之间缓存；替换源节点对象或提供显式 children 会使其加载缓存失效。
- 加载器返回完整的直接子集合，而非服务端分页。`load` 和 `loadError` 报告已接受结果与诊断信息。

### 表单

- 隐藏的原生 select 负责已确认键、name/form 关联、必填校验与提交。多值以重复字段名提交。
- 校验失败聚焦可见触发器；原生表单重置恢复初始已确认模型并关闭弹层。
- 禁用组件或外层 fieldset 会关闭弹层并阻止选择。
- 未知的已确认键保留原始标签与可移除芯片。已禁用的已确认键继续存储，无法从界面移除。已知禁用项遵循原生 select 提交规则，不进入 `FormData`。
- 移除芯片后焦点移到仍存在的芯片或触发器。展开状态与业务值仍由应用控制。

### 大型目录

`virtual` 使用 Tree view 的测量窗口，包含焦点行及必要的祖先和分组。筛选和标签解析基于完整的已知层级，原生表单代理仅需保留已确认值。可从 TreeSelect 入口导入 `VirtualListOptions` 配置初始估计与额外渲染行数。

目录更新遵循 [Tree view 的视口锚点策略](/zh/components/tree-view#虚拟化)，在保留已确认值的同时保持阅读位置。

### 状态归属

`v-model` 拥有已确认键，`v-model:expanded-keys` 拥有应用展开状态，`v-model:open` 拥有对话框可见性，`v-model:query` 拥有搜索文字。搜索展开是内部临时状态。应用拥有记录标签、加载器数据，以及已确认键到业务值的映射。

## API

内置搜索与空态文案使用 [LocaleProvider](/zh/components/localization) 的 `treeSelect` 命名空间（`search`、`empty`、`noResults`）。树导航、芯片和页脚操作分别使用已有的 `treeView` 与 `actions` 命名空间。显式 locale 与文案 props 优先，记录标签由应用控制。

### 导出

| 导出                 | 类型 | 用途                                               |
| -------------------- | ---- | -------------------------------------------------- |
| `TreeSelect`         | 组件 | 字段触发器、对话框、树选择器、芯片与原生表单代理。 |
| `TreeSelectNode`     | 类型 | 具有字符串键和 Tree view 字段的层级记录。          |
| `TreeSelectLoader`   | 类型 | 加载单个节点直接子项的异步加载器。                 |
| `VirtualListOptions` | 类型 | `virtual` 的窗口选项。                             |

### 属性与模型

| 属性 / 模型                              | 类型                            | 默认值             | 说明                                                                 |
| ---------------------------------------- | ------------------------------- | ------------------ | -------------------------------------------------------------------- |
| `nodes`                                  | `readonly TreeSelectNode[]`     | 必填               | 完整的已知层级，键为全局唯一且非空的字符串。                         |
| `label`                                  | `string`                        | 必填               | 触发器名称与可见树标题；也用于命名对话框。                           |
| `modelValue` / `v-model`                 | `string \| string[] \| null`    | `null`             | 单个键、多选模式下的数组，或表示未选择的 null。                      |
| `multiple`                               | `boolean`                       | `false`            | 以可移除 Input chip 展示的独立多选。                                 |
| `open` / `v-model:open`                  | `boolean`                       | `false`            | 对话框可见性。禁用的字段无法打开。                                   |
| `expandedKeys` / `v-model:expanded-keys` | `string[]`                      | `[]`               | 非搜索状态的应用展开状态。要在初始时显示选中的后代，请提供其祖先键。 |
| `searchable`                             | `boolean`                       | `false`            | 在弹层内添加原生搜索输入框。                                         |
| `query` / `v-model:query`                | `string`                        | `''`               | 与已确认键分离的搜索文字，关闭弹层时清空。                           |
| `clearable`                              | `boolean`                       | `false`            | 为可移除的选择提供清除操作；禁用值仍保留。                           |
| `loadChildren`                           | `TreeSelectLoader`              | —                  | 加载节点的直接子项。                                                 |
| `virtual`                                | `boolean \| VirtualListOptions` | `false`            | 将测量窗口委托给 Tree view。                                         |
| `id`                                     | `string`                        | 自动生成           | 触发器 ID。                                                          |
| `name`                                   | `string`                        | —                  | 原生表单字段名。                                                     |
| `form`                                   | `string`                        | —                  | 通过 id 将原生代理关联到表单。                                       |
| `required`                               | `boolean`                       | `false`            | 原生校验时要求已确认键。                                             |
| `disabled`                               | `boolean`                       | `false`            | 禁用字段并关闭弹层。                                                 |
| `locale`                                 | `string`                        | Provider → `en-US` | 内置消息语言。                                                       |
| `searchLabel`                            | `string`                        | 本地化             | 覆盖搜索字段标签。                                                   |
| `noDataText`                             | `string`                        | 本地化             | 覆盖无匹配结果文案。                                                 |
| `panelClass`                             | `string`                        | `''`               | 添加到弹层表面的类名。                                               |

### 事件

| 事件          | 载荷                   | 说明                                     |
| ------------- | ---------------------- | ---------------------------------------- |
| `beforeinput` | `Event`                | 可取消；在树确认、芯片移除和清除前触发。 |
| `input`       | `{ values: string[] }` | 随模型更新报告选择提议。                 |
| `change`      | `{ values: string[] }` | 报告已确认的选择变化。                   |
| `invalid`     | `Event`                | 转发原生校验失败。                       |
| `load`        | `{ node, children }`   | 报告已接受的加载器结果。                 |
| `loadError`   | `{ node, error }`      | 携带诊断信息，树中仍显示通用恢复文案。   |

更新后，原生 `input` 和 `change` 事件也会从表单代理冒泡。

### 插槽

| 插槽      | 参数                 | 说明                                             |
| --------- | -------------------- | ------------------------------------------------ |
| `leading` | `{ node, expanded }` | 在树行前添加装饰内容。请勿在此插槽放置交互控件。 |

### 方法

通过模板引用访问这些成员。

| 成员                   | 签名                               | 说明                                          |
| ---------------------- | ---------------------------------- | --------------------------------------------- |
| `show()`               | `() => void`                       | 打开对话框并聚焦搜索框或树。                  |
| `close(restoreFocus?)` | `(restoreFocus?: boolean) => void` | 关闭对话框；传入 `false` 可保留当前焦点目标。 |
| `focus()`              | `() => void`                       | 聚焦触发器。                                  |
| `trigger`              | `HTMLButtonElement \| undefined`   | 原生触发器元素。                              |

::: details `TreeSelectNode` 结构

| 字段          | 类型                        | 说明                                      |
| ------------- | --------------------------- | ----------------------------------------- |
| `key`         | `string`                    | 必填的全局唯一且非空记录标识。            |
| `label`       | `string`                    | 可见且可访问的记录标签。                  |
| `description` | `string`                    | 可选辅助文本。                            |
| `icon`        | `string`                    | 可选图标名称，转发给 Tree view。          |
| `value`       | `unknown`                   | 应用元数据；不影响选择。                  |
| `disabled`    | `boolean`                   | 禁用节点及其后代。                        |
| `selectable`  | `boolean`                   | 为 `false` 时保留分支导航，但阻止值确认。 |
| `children`    | `readonly TreeSelectNode[]` | 直接子项；显式空数组表示叶节点。          |
| `hasChildren` | `boolean`                   | 为 `true` 且省略 children 时需要加载器。  |

:::

## 样式

使用 FormField 提供轮廓或填充字段外观与辅助文本。弹层复用 OptionPanel 表面和 Tree view 的圆角行、状态层、焦点指示与按下反馈。它提供随密度缩放的 12px 内边距和区块间距，重置 OptionPanel 的菜单内边距，使搜索字段、树和底部操作共享同一内容边缘，并让多选展开按钮保持 48×48px 点击目标。

弹层宽度跟随字段，可用空间足够时最小为 400px，最大为 640px 且受视口限制。最大高度为 480px，树滚动区为 280px；小视口可能进一步降低这些上限。可通过 `panelClass` 设置弹层样式。[Tree view](/zh/components/tree-view) 和 [Input chip](/zh/components/chips) 各自拥有组件样式约定。

| 属性                                  | 默认值                  | 说明                                       |
| ------------------------------------- | ----------------------- | ------------------------------------------ |
| `--yam3x-tree-select-container-shape` | System extra-small 圆角 | 字段容器圆角。                             |
| `--yam3x-tree-select-tree-max-height` | `280px`                 | 树滚动区最大高度，视口限制可能进一步降低。 |

## Material 参考

[Text fields 指导](https://m3.material.io/components/text-fields/guidelines) · [Lists 指导](https://m3.material.io/components/lists/guidelines) · [Chips 指导](https://m3.material.io/components/chips/guidelines)
