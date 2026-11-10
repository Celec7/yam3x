<script setup lang="ts">
import TreeViewSelectionExample from '../../components/demos/TreeViewSelectionExample.vue'
import TreeViewCheckingExample from '../../components/demos/TreeViewCheckingExample.vue'
import TreeViewLazyExample from '../../components/demos/TreeViewLazyExample.vue'
import TreeViewVirtualExample from '../../components/demos/TreeViewVirtualExample.vue'
</script>

# Tree view

`TreeView` 是用于层级记录的项目拓展组件，分别管理焦点、展开、选择与可选勾选。它遵循 [WAI tree view 模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)，采用 Material 3 Expressive 列表层级、排版和状态角色。Material 未定义独立的 Tree view 组件。

Compose Material 3 没有树基元。最接近的组合是带前导展开控件的 `LazyColumn` 与类似 `ListItem` 的行；树语义、键盘模型、懒加载和虚拟化由项目定义。

需要就地浏览嵌套记录时使用树。平面选项使用 [Select](/zh/components/select) 或 [List](/zh/components/list)；只读记录使用 [Descriptions](/zh/components/descriptions)。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewSelectionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TreeViewSelectionExample.vue{vue}

:::

树只有一个焦点入口，选择状态独立。控件暴露禁用操作、无需修饰键的多选和 RTL 导航，同时保持展开节点、焦点和已选键可见。选择节点不会展开它，展开分支也不会选择它。

### 勾选

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewCheckingExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TreeViewCheckingExample.vue{vue}

:::

`check-mode="cascade"` 依据启用后代派生父节点勾选，并保持禁用记录不变。启用“分别查看与勾选”后，选择与勾选并存：Enter 或标签选择正在查看的记录，空格或带名称的勾选控件切换批量状态。两种结果都打印在树下方。

### 分支加载

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewLazyExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TreeViewLazyExample.vue{vue}

:::

`loadChildren` 解析标记了 `hasChildren` 的分支。示例可接受、拒绝或取消请求，从而观察加载、失败、重试和过期结果行为。带加载器的树始终独立勾选，即使分支已完成加载。

### 虚拟化

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewVirtualExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TreeViewVirtualExample.vue{vue}

:::

`virtual` 在数据中保留一万条记录，只挂载视口、额外缓冲区、焦点节点及祖先。导航、勾选、禁用记录和测量都使用完整树。全部折叠、镜像树或隐藏开头记录，可检查焦点恢复和窗口变化。

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TreeView, type TreeViewKey, type TreeViewNode } from './components/yam3x/tree-view'

const nodes: TreeViewNode[] = [
  {
    key: 'documents',
    label: '文档',
    children: [
      { key: 'brief', label: '项目简报', description: '今天更新' },
      { key: 'notes', label: '团队笔记' },
    ],
  },
]
const expanded = ref<TreeViewKey[]>(['documents'])
const selected = ref<TreeViewKey[]>([])
</script>

<template>
  <TreeView
    v-model:expanded-keys="expanded"
    v-model:selected-keys="selected"
    label="项目文档"
    :nodes="nodes"
  />
</template>
```

模型可选：未绑定时，树拥有相应的本地状态。若要受控使用，请同时绑定值和更新处理器，通常使用 `v-model`。被拒绝的受控展开请求不会开始加载。模型值是稳定节点键，不是可见索引。组件提议新数组，记录移除后不会自行清除应用拥有的选择或勾选键。

::: details 可勾选与懒加载记录

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  TreeView,
  type TreeViewKey,
  type TreeViewLoader,
  type TreeViewNode,
} from './components/yam3x/tree-view'

const nodes: TreeViewNode[] = [
  { key: 'inbox', label: '收件箱', children: [{ key: 'today', label: '今天' }] },
  { key: 'archive', label: '归档', hasChildren: true },
]
const expanded = ref<TreeViewKey[]>([])
const checked = ref<TreeViewKey[]>([])
const loadChildren: TreeViewLoader = async (node, { signal }) => {
  const response = await fetch(`/api/records/${node.key}`, { signal })
  if (!response.ok) throw new Error(String(response.status))
  return (await response.json()) as TreeViewNode[]
}
</script>

<template>
  <TreeView
    v-model:expanded-keys="expanded"
    v-model:checked-keys="checked"
    check-mode="independent"
    label="消息记录"
    :nodes="nodes"
    :load-children="loadChildren"
  />
</template>
```

加载器返回完整的直接子项集合。已知直接子项通过 `children` 提供；省略子项并设置 `hasChildren: true` 表示未解析分支。成功加载空数组后，该分支成为叶节点。

:::

## 行为与无障碍

### 导航与焦点

- 树只有一个巡游 Tab 入口。上下键在可见节点间移动，不改变值；Home 和 End 转到首个或最后一个可见节点。
- 展开方向键展开关闭的分支或进入首个子项；反向键折叠分支或转到父节点。方向在 RTL 中镜像。
- Enter 激活节点和标签；空格在单选树中选择节点，或在无需修饰键的多选中切换选择。
- 输入前缀可聚焦匹配的可见标签。重复字符会轮换匹配项。700 ms 后或使用导航命令时重置前缀。组合输入事件和修饰键快捷键交由各自处理者负责。
- 折叠后代离开焦点序列。包含焦点的后代消失时，焦点返回最近的可见祖先或其他可用入口。外部变化不会抢走无关焦点。
- 禁用节点仍可聚焦以供发现，并暴露 `aria-disabled`，但不能改变值。没有节点时，带名称的树仍可聚焦，并由 Empty state 解释空内容。

### 选择与勾选

- 选择与展开相互独立。单选最多保留一个键；多选无需修饰键。`selectionMode` 默认为 `single`，启用勾选时默认为 `none`。
- 独立勾选只修改目标键。级联勾选切换完整静态子树中启用且可勾选的记录，依据符合条件的后代派生父节点勾选或混合状态，保留无关和禁用键。
- 只有父节点键并不隐含选择新添加的子项。不完整静态分支独立勾选。提供加载器后，整棵树始终独立勾选，即使某分支已完成加载。
- 树条目暴露勾选或混合状态。分别提供查看和批量成员身份时，条目暴露 `aria-selected`，单独命名的原生勾选控件暴露批量状态；Enter 或标签选择节点，空格勾选。勾选控件不增加 Tab 停靠点。
- 原生勾选控件不带名称，不提交表单值；表单重置保留已接受的勾选模型。应用可显式重置所有模型，或为新记录会话更换 Vue `key`。已删除记录的键在应用清除前仍由应用拥有。

### 分支加载与恢复

- 仅已接受、可见且展开的分支开始读取。传输、超时、解析和取消由适配器负责。格式错误或键重复的节点数组会被拒绝，不替换整棵树。
- 每个加载器返回完整的直接子项集合，更深层未解析的后代用各自分支表示。
- 失败保留在对应分支旁，并提供可访问的重试操作；其他分支、选择和勾选仍可用。
- 折叠、移除、重读和卸载会请求取消。读取适配器应响应信号；即使旧结果迟到，也不会应用。新读取可取代取消的读取，因为适配器是读取操作。
- 加载的子项按稳定节点键缓存，折叠和元数据对象替换后仍保留。显式 `children` 属性优先。移除分支会清除其缓存。远端资源变化时调用 `reload(key)`，不同树会话使用新的 Vue `key`。

### 虚拟化

- `virtual` 默认关闭。设为 `true` 时，初始行高估计为 56 px，并在视口两侧各额外渲染四行；也可以传入对象覆盖 `estimateSize` 和 `overscan`。可从 Tree view 入口导入 `VirtualListOptions`。
- 行高会按实际内容测量，不会被固定。`--yam3x-tree-view-virtual-max-height` 控制滚动视口的最大高度，默认为 400 px。
- 窗口按树顺序包含已展开记录，并保留焦点节点及必要祖先。祖先仍具有带标签的树节点和分组；每个节点报告其层级及其在完整直接同级集合中的位置。
- 导航、选择、级联勾选、禁用后代和加载缓存均基于完整数据，包括窗口以外的记录。虚拟化不会加载记录，也不定义服务端分页约定。
- 数据插入或移除时，会保留首个可见记录及其行内偏移。若该记录被移除，窗口优先从原顺序中下一个存活记录的开头显示，其次回退到前一个存活记录；整批替换且没有存活记录时回到开头。显式键盘导航与搜索跳转优先。
- `focus(key)` 接受逻辑上可见的节点，并在返回 `true` 后于 Vue 的下一次渲染中挂载和聚焦该节点；隐藏或未知的键返回 `false`。折叠或移除焦点节点时，焦点会恢复到仍存在的祖先，同时不会抢走外部焦点。
- 优先需要分支几何动画时，使用默认模式。虚拟模式下窗口回收和分支插入、移除立即完成，仍保留行的按下反馈。

### 表单与状态归属

树提议数组变化，而不会直接修改传入的模型。未绑定时，树拥有本地展开、选择和勾选状态；绑定时，它渲染已接受的数组，并通过 `update:*` 事件推送提议。更新被拒绝时，之前的数组保持接受状态。数据更新（包括已加载子项）之间请保留相同的稳定键。

### 响应式与 RTL

- 标签可换行并增长；深层缩进和放大字号采用区域内横向溢出，不缩小标签。区域溢出时，外层带名称的区域增加独立 Tab 入口以支持横向键盘滚动；树自身仍只有一个巡游入口。
- 行高从 56 px 开始，跟随 container density 缩放并以 48 px 为下限；外侧内边距、缩进和间距使用 spacing density。展开、勾选和焦点目标保持至少 48 px。
- 分支和展开箭头运动在 RTL 中镜像，并遵循减少动态效果设置。强制颜色下仍可区分焦点与选择。

## API

内置界面文案可继承共享的 [LocaleProvider](/zh/components/localization) 配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                                                                                   | 说明                                    |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `TreeView`                                                                                             | 树、模型、加载和虚拟化。                |
| `TreeViewNode`、`TreeViewKey`、`TreeViewSelectionMode`、`TreeViewCheckMode`、`TreeViewCheckState`     | 节点与模型类型。                        |
| `TreeViewLoader`、`TreeViewMessages`、`VirtualListOptions`                                            | 加载器、文案和虚拟化类型。              |

### 属性与模型

| 属性或模型      | 默认值                        | 用途                                                                                                      |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `nodes`         | 必需                          | 无环的 `TreeViewNode` 森林，同一棵树内所有键唯一。                                                        |
| `virtual`       | `false`                       | `boolean \| VirtualListOptions`；按实际行高渲染窗口，可配置 `estimateSize`（56 px）和 `overscan`（4 行）。 |
| `label`         | 必需                          | 可见 Title Medium 标题与树的无障碍名称。                                                                  |
| `description`   | 空                            | 与树关联的常驻说明。                                                                                      |
| `expandedKeys`  | `[]`                          | 展开分支的模型。                                                                                          |
| `selectedKeys`  | `[]`                          | 节点选择模型，单选最多使用一个键。                                                                        |
| `checkedKeys`   | `[]`                          | 显式勾选记录及派生的完整分支键模型。                                                                      |
| `selectionMode` | `single`，勾选模式下为 `none` | `none`、`single` 或无需修饰键的 `multiple`。                                                              |
| `checkMode`     | `none`                        | `none`、`independent` 或 `cascade`；带加载器的树始终独立勾选。                                            |
| `loadChildren`  | 未定义                        | `(node, { signal }) => Promise<readonly TreeViewNode[]>`；未解析分支必须提供。                            |
| `disabled`      | `false`                       | 禁止展开、激活、选择、勾选、重试和新读取。已有读取可完成，焦点导航仍可用。                                |
| `locale`        | Provider → `en-US`            | 随语言变化的前缀查找及内置中英文文案。                                                                    |
| `instructions`  | 内置可见键盘说明              | 自定义文字，或在其他位置提供同等说明后设为 `false`。                                                      |
| `messages`      | 内置文案                      | 部分 `TreeViewMessages`，覆盖名称、说明、加载、失败和空状态。                                             |

### 事件

| 事件        | 载荷                                                         | 用途                                                     |
| ----------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `expand`    | `{ node, expanded, keys }`                                   | 随结果键报告展开提议。                                   |
| `select`    | `{ node, keys }`                                             | 随结果键报告选择提议。                                   |
| `check`     | `{ node, keys }`                                             | 随结果键报告勾选提议。                                   |
| `activate`  | `node`                                                       | 在标签激活或 Enter 后触发。                              |
| `load`      | `{ node, children }`                                         | 报告已接受的子项结果。                                   |
| `loadError` | `{ node, error }`                                            | 携带诊断失败详情；可见文案使用通用恢复。                 |

### 插槽

| 插槽      | 作用域                    | 用途                                                                     |
| --------- | ------------------------- | ------------------------------------------------------------------------ |
| `leading` | `{ node, expanded }`      | 节点的装饰性前导媒体；请在 `node.label` 中保留完整身份。                 |
| `empty`   | —                         | 替换默认 Empty state。                                                   |

避免在装饰性媒体中加入未经协调的可聚焦控件。

### 方法

通过模板 ref 访问。

| 方法         | 返回      | 用途                                                                                     |
| ------------ | --------- | ---------------------------------------------------------------------------------------- |
| `focus(key)` | `boolean` | 聚焦逻辑上可见的节点；可用或在下次渲染挂载时返回 `true`。                                |
| `reload(key)`| `boolean` | 使加载器拥有的缓存失效；请求适用时返回 `true`。                                          |

已展开节点立即重读，折叠节点在下次展开时加载。这些方法不生成缺失节点，也不改变选择。

### 节点结构

| 字段          | 类型                          | 用途                                                     |
| ------------- | ----------------------------- | -------------------------------------------------------- |
| `key`         | `string \| number`            | 必需稳定标识；在整棵树中唯一。                           |
| `label`       | `string`                      | 必需可见名称与无障碍标签。                               |
| `description` | `string`                      | 无障碍描述与辅助文本。                                   |
| `icon`        | `string`                      | 项目 Icon 组件的装饰性图标名称。                         |
| `value`       | `unknown`                     | 应用不透明数据。                                         |
| `children`    | `readonly TreeViewNode[]`     | 已知直接子项；显式空数组表示叶节点。                     |
| `hasChildren` | `boolean`                     | 省略 `children` 时标记未解析分支。                       |
| `disabled`    | `boolean`                     | 作用于该节点及已知后代。                                 |
| `selectable`  | `boolean`                     | 只控制该节点的选择。                                     |
| `checkable`   | `boolean`                     | 只控制该节点的勾选。                                     |

## 样式

`TreeView` 在树根元素暴露以下公开属性。行几何、间距、缩进和排版遵循 Material 系统 density、spacing、type、color、shape、elevation 和 motion 角色。

| 属性                                      | 默认值                                   | 用途                     |
| ----------------------------------------- | ---------------------------------------- | ------------------------ |
| `--yam3x-tree-view-virtual-max-height`    | `400px`                                  | 虚拟视口最大高度。       |
| `--yam3x-tree-view-label-min-width`       | `10rem`                                  | 溢出前标签的最小宽度。   |
| `--yam3x-tree-view-row-shape`             | `--md-sys-shape-corner-medium`（12 px）  | 行、悬停、选择和焦点形状。 |

标签使用 Body Large，元数据和说明使用 Body Small，标题使用 Title Medium。所选节点使用 Secondary Container 与 On Secondary Container；焦点具有独立的可见轮廓。仅展开不会选择一行。共享行形状属于项目设计选择。

::: details 密度与动效

- 行高从 56 px 开始，跟随 `--md-sys-density-container-scale` 缩放并以 48 px 为下限。
- 行使用 16 px 外侧行内内边距，每级额外缩进 24 px。
- 内边距、缩进和间距跟随 `--md-sys-density-spacing-scale`。
- 分支展开与折叠使用高度和透明度过渡；折叠开始时，其后代立即退出可访问与交互序列。
- 可用节点行在指针、Enter 或空格按下时显示涟漪，松开或取消后淡出。hover 使用共享的 8% 状态层；pressed 反馈只由涟漪提供，不再叠加静态按压填充。反馈限制在当前行，展开按钮和勾选控件保留各自的反馈。
- 减少动态效果时不播放空间过渡，仍保留可见的状态变化。强制颜色下仍可区分焦点与选择。

:::

## Material 参考

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type) · [WAI-ARIA tree view 模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
