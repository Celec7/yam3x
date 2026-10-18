<script setup lang="ts">
import TreeViewExample from '../../components/demos/TreeViewExample.vue'
</script>

# Tree view

`TreeView` 是层级记录的项目拓展组件，分别管理焦点、展开、选择与可选勾选。它遵循 Web 树交互模式，采用 Material 3 Expressive 列表层级和排版角色；Material 未定义独立的 Tree view 组件。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><TreeViewExample /></div>

::: details 查看示例源码

<<< ../../components/demos/TreeViewExample.vue{vue}

:::

## 在项目中使用

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

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

| 属性或模型      | 默认值                        | 用途                                                                           |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `nodes`         | 必需                          | 无环的 `TreeViewNode` 森林，同一棵树内所有键唯一。                             |
| `label`         | 必需                          | 可见 Title Medium 标题与树的无障碍名称。                                       |
| `description`   | 空                            | 与树关联的常驻说明。                                                           |
| `expandedKeys`  | `[]`                          | 展开分支的模型。                                                               |
| `selectedKeys`  | `[]`                          | 节点选择模型，单选最多使用一个键。                                             |
| `checkedKeys`   | `[]`                          | 显式勾选记录及派生的完整分支键模型。                                           |
| `selectionMode` | `single`，勾选模式下为 `none` | `none`、`single` 或无需修饰键的 `multiple`。                                   |
| `checkMode`     | `none`                        | `none`、`independent` 或 `cascade`；带加载器的树始终独立勾选。                 |
| `loadChildren`  | 无                            | `(node, { signal }) => Promise<readonly TreeViewNode[]>`；未解析分支必须提供。 |
| `disabled`      | `false`                       | 禁止展开、激活、选择、勾选、重试和新读取。已有读取可完成，焦点导航仍可用。     |
| `locale`        | Provider → `en-US`            | 随语言变化的前缀查找及内置中英文文案。                                         |
| `instructions`  | 内置可见键盘说明              | 自定义文字，或在其他位置提供同等说明后设为 false。                             |
| `messages`      | 内置文案                      | 部分 `TreeViewMessages`，覆盖名称、说明、加载、失败和空状态。                  |

节点必须包含 `key: string \| number` 和 `label`，还可包含 `description`、`icon`、不透明的 `value`、`children`、`hasChildren`、`disabled`、`selectable` 和 `checkable`。键在更新之间标识同一记录，必须在整棵树中唯一，包括已加载子项。说明作为树条目的无障碍描述。图标具有装饰意义，使用项目的 Icon 组件。

已知直接子项通过 `children` 提供，显式空数组表示叶节点。未解析分支省略子项并设置 `hasChildren: true`。成功加载空数组后，该分支成为叶节点。禁用状态作用于节点及已知后代；`selectable: false` 和 `checkable: false` 只影响该节点对应的操作。

事件：`expand({ node, expanded, keys })`、`select({ node, keys })` 和 `check({ node, keys })` 随模型更新报告提议。`activate(node)` 在标签激活或 Enter 后触发。`load({ node, children })` 报告已接受的子项结果。`loadError({ node, error })` 携带诊断详情；界面使用通用恢复文字，不显示原始异常。

组件 ref 暴露 `focus(key)`，返回能否聚焦某个可见节点；`reload(key)` 使加载器拥有的缓存失效，返回该请求是否适用。已展开节点立即重读，折叠节点在下次展开时加载。这些方法不生成缺失节点，也不改变选择。

`#leading="{ node, expanded }"` 提供装饰性前导媒体，请在 `node.label` 中保留完整身份。`#empty` 替换默认 Empty state。避免在装饰性媒体中加入未经协调的可聚焦控件。

## 行为与无障碍

### 导航与选择

树导航遵循 [WAI tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)。

树具有一个巡游 Tab 入口。上下键在可见节点间移动，不改变值；Home/End 转到首尾可见节点。展开方向键展开关闭的分支或进入首个子项，反向键折叠分支或转到父节点；RTL 中左右方向镜像。失败的已展开分支可通过展开方向键重试。Enter 激活节点；空格在单选树中选择节点，在无需修饰键的多选中切换选择。输入前缀以聚焦匹配的可见标签，重复字符会轮换匹配项。700 ms 后或使用导航命令时重置前缀。组合输入事件和修饰键快捷键交由各自处理者负责。

折叠后代离开焦点序列。包含焦点的后代消失时，焦点返回最近的可见祖先或其他可用入口。外部变化不会从无关内容处抢回焦点。禁用节点仍可聚焦以供发现，并暴露 `aria-disabled`，但不能改变值。没有节点时，带名称的树仍可聚焦，并由 Empty state 解释空内容。

### 勾选

独立勾选只修改目标键。级联勾选切换完整静态子树中启用且可勾选的记录，依据符合条件的后代派生父节点勾选或混合状态，保留无关和禁用键。只有父节点键并不隐含选择新添加的子项。不完整静态分支独立勾选。提供加载器后，整棵树始终独立勾选，即使某分支已完成加载；展开已勾选分支不会选择未见记录。

勾选默认使用 `selectionMode="none"`。树条目暴露勾选或混合状态，Enter/空格或标签可切换勾选。若要分别提供查看和批量成员身份，请显式启用选择，并说明两者含义。此组合中，树条目暴露 `aria-selected`，单独命名的原生勾选控件暴露批量状态；Enter/标签选择节点，空格勾选。勾选控件不增加 Tab 停靠点。示例的组合模式展示了区别。

原生勾选控件不带名称，不提交表单值；表单重置保留已接受的勾选模型。应用可显式重置所有模型，或为新记录会话更换 Vue `key`。已删除记录的键在应用清除前仍由应用拥有。

可用节点行在指针、Enter 或空格按下时显示涟漪，松开或取消后淡出。反馈限制在当前行，展开按钮和勾选控件保留各自的反馈。分支展开与折叠使用高度和透明度过渡；折叠开始时，其后代立即退出可访问与交互序列。减少动态效果时不播放空间过渡，仍保留可见的状态变化。

### 分支加载与恢复

仅已接受、可见且展开的分支开始读取。加载器返回完整的直接子项集合，更深层未解析的后代用各自分支表示。传输、超时和解析由适配器负责；格式错误或键重复的节点数组会被拒绝，不替换整棵树。失败保留在对应分支旁，提供可访问的重试操作。其他分支、选择和勾选仍可用。

折叠、移除、重读和卸载会请求取消。读取适配器应响应信号；即使旧结果迟到，也不会应用。新读取可取代取消的读取，因为适配器是读取操作。不要将它用于需要串行执行或服务端回滚保证的写操作。

加载的子项按稳定节点键缓存，折叠和元数据对象替换后仍保留。显式 `children` 属性优先。移除分支会清除其缓存；远端资源变化时调用 `reload`，不同树会话使用新的 Vue `key`。仅改变加载器函数不会自动清空缓存。

## 样式

标签使用 Body Large，元数据和说明使用 Body Small，标题使用 Title Medium。行最小高度为 56 px，外侧水平内边距为 16 px，每级缩进 24 px，文字可换行并增长。所选节点使用 Secondary Container/On Secondary Container，焦点具有独立的可见轮廓。仅展开不会选择一行。

节点行使用 Medium 圆角（默认 12 px），悬停、选中背景和焦点轮廓采用相同形状。此映射属于项目设计选择。通过 `--yam3x-tree-view-row-shape` 覆盖圆角；默认取 `--md-sys-shape-corner-medium`。

`--yam3x-tree-view-label-min-width` 覆盖项默认为 `10rem`。深层缩进和放大字号采用区域内横向溢出，不缩小标签。溢出时，外层带名称的区域增加独立 Tab 入口以支持横向键盘滚动；树自身仍只有一个巡游入口。展开箭头遵循减少动态效果偏好，强制颜色下仍可区分焦点与选择。

## Material 参考

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Applying type](https://m3.material.io/styles/typography/applying-type)
