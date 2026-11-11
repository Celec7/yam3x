<script setup lang="ts">
import OptionBasicExample from '../../components/demos/OptionBasicExample.vue'
import OptionExample from '../../components/demos/OptionExample.vue'
import OptionDialogExample from '../../components/demos/OptionDialogExample.vue'
</script>

# Option

`Option`、`OptionGroup` 与 `OptionPanel` 是用于选择列表和弹出表面的项目基元。它们渲染由 [Select](/zh/components/select)、[Autocomplete](/zh/components/autocomplete) 等父控件拥有的行、分组和面板。这些基元属于项目扩展；行和菜单处理遵循 Material 3 Expressive 菜单指南，组合与键盘契约由项目决定。

最接近的 Compose Material 3 类比是用于选择的 `SelectableDropdownMenuItem` 和用于可勾选行的 `CheckableDropdownMenuItem`。Material 在 Menus 和 Lists 等所属表面内定义条目处理，而不是通用独立 Option。

需要标准表单控件时使用 [Select](/zh/components/select)；触发器、面板内容或焦点模型由应用拥有时，使用这些基元。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><OptionBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/OptionBasicExample.vue{vue}

:::

使用 `OptionGroup` 为相关行分组。父控件拥有已接受的值、移动焦点并提交选择；`Option` 只报告 `{ value, source }`，不会保存第二份选中值。禁用行保持可见，但不能被激活。

### 锚定面板

<div class="vp-raw yam3x-doc-demo-theme"><OptionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/OptionExample.vue{vue}

:::

独立面板通过 `anchor` 锚定到元素。示例从触发器打开面板，在 `positioned` 变为 true 后将焦点移到首个启用选项，并实现面板期望父级提供的方向键、Home、End、Escape 和 Tab 行为。面板内容控件暴露加载和空状态，但不会创建可选择的选项。

### Dialog 模式

<div class="vp-raw yam3x-doc-demo-theme"><OptionDialogExample /></div>

::: details 查看演示源码

<<< ../../components/demos/OptionDialogExample.vue{vue}

:::

表面包含不属于单一选项列表的控件时，设置 `role="dialog"`。应用为对话框命名，在定位后将焦点移入，按 Escape 或焦点离开时关闭，并将焦点返回触发器。Dialog 模式只改变表面语义；`OptionPanel` 不会捕获焦点，也不会使页面不可交互。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'
import { Option, OptionGroup } from './components/yam3x/option'
import { Select } from './components/yam3x/select'

const order = ref('recent')
</script>

<template>
  <FormField label="排序方式">
    <Select
      v-model="order"
      name="order"
    >
      <OptionGroup label="排序">
        <Option
          value="recent"
          label="最近添加"
        />
        <Option
          value="name"
          label="名称"
        />
      </OptionGroup>
    </Select>
  </FormField>
</template>
```

::: details 带锚点的独立面板

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Option, OptionGroup, OptionPanel } from './components/yam3x/option'

const anchor = ref<HTMLElement | null>(null)
const panel = ref<{ show: () => void } | null>(null)
const open = ref(false)
const selected = ref('all')
</script>

<template>
  <button
    ref="anchor"
    type="button"
    aria-haspopup="listbox"
    :aria-expanded="open"
    @click="panel?.show()"
  >
    选择项目
  </button>
  <OptionPanel
    ref="panel"
    v-model:open="open"
    :anchor="anchor"
    label="项目"
  >
    <OptionGroup label="项目">
      <Option
        value="all"
        label="所有项目"
        :selected="selected === 'all'"
      />
      <Option
        value="recent"
        label="最近打开"
        :selected="selected === 'recent'"
      />
    </OptionGroup>
  </OptionPanel>
</template>
```

将焦点移入新打开的面板前应等待 `positioned`。定位过程仍将弹层隐藏时该标志为 false。

:::

::: details Dialog 模式表面

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OptionPanel } from './components/yam3x/option'

const anchor = ref<HTMLElement | null>(null)
const panel = ref<{ show: () => void } | null>(null)
const open = ref(false)
const showArchived = ref(false)
</script>

<template>
  <button
    ref="anchor"
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="open"
    @click="panel?.show()"
  >
    筛选列
  </button>
  <OptionPanel
    ref="panel"
    v-model:open="open"
    :anchor="anchor"
    role="dialog"
    label="列筛选"
  >
    <label>
      <input
        v-model="showArchived"
        type="checkbox"
      />
      显示已归档项目
    </label>
  </OptionPanel>
</template>
```

Dialog 模式中，父级必须为表面命名、将焦点移入、处理 Escape 和焦点离开，并在关闭时返回焦点。

:::

## 行为与无障碍

### 父级所有权与选择

- `Option` 是受控的。`selected` 是属性，父级接受或拒绝 `select` 详情。在 Select 内，父级上下文提供已接受的选择并注册选项。
- `Option` 渲染 `role="option"` 和 `aria-selected`；禁用选项暴露 `aria-disabled`，并保持 `tabindex="-1"`。
- `OptionGroup` 渲染带可见标签的 `role="group"`。`hidden` 会从渲染中移除分组及其行。
- `OptionPanel` 渲染临时表面。它报告打开、关闭和切换事件，但从不选择值。

### 键盘与焦点

- 父控件负责方向键导航、Home 和 End、前缀查找、接受和焦点返回。选项默认使用 `tabindex="-1"`，使父级保持一个巡游入口。
- 已获得焦点的启用选项处理 Enter 和空格，并报告 `source: 'keyboard'`。指针激活报告 `source: 'pointer'`。
- 面板自身使用 `tabindex="-1"` 可聚焦；它不会捕获焦点或增加 Tab 停靠点。
- 将焦点移入新打开的表面之前等待 `positioned`。定位过程仍将弹层隐藏时，它保持 `false`。
- Dialog 模式中，父级必须将焦点移入表面，并在对话框关闭时恢复。

### 定位与关闭

- 面板围绕 `anchor` 定位，在视口内翻转和平移，并约束宽高。`fitAnchorWidth` 默认为 `true`；`anchorOffset` 默认为 `4` px。
- `teleport` 默认为 `false`。启用后面板移动到 `body`，并继承锚点的方向和自定义属性。
- 外部指针输入会关闭面板。`scrollStrategy="hide"` 还会在锚点滚动时关闭；默认的 `reposition` 保持对齐。
- `role` 默认为 `listbox`。`multiple` 只为列表框添加 `aria-multiselectable`。
- `role="dialog"` 只改变表面语义。它会省略列表框专用属性，不会添加模态行为、焦点捕获或页面不可交互状态。

### 加载、空状态与面板方法

- `loading` 暴露 `aria-busy="true"`，渲染状态而不是选项。`empty` 渲染无数据状态。两种状态文案使用 `optionPanel` 语言命名空间；`loadingText`、`noDataText` 及相应插槽优先。
- 状态行不是选项，不能选择。
- 通过组件 ref 可使用 `show()`、`hide()` 和 `toggle()`。`show()` 针对提供的锚点打开，不移动焦点。
- 每次程序化、外部或滚动导致的变化前都会触发可取消的 `beforetoggle`。调用 `preventDefault()` 保持面板之前的状态。

### 表单与状态归属

基元不提交表单值。所属表单控件保存已接受的值、必选校验和重置行为。父级为自定义控件时，请在应用中维护 `selected`；`Option` 从不保存独立值。`OptionGroup` 和 `OptionPanel` 只保存展示状态。

## API

内置加载和空状态文案可继承共享 [LocaleProvider](/zh/components/localization) 配置的 `optionPanel` 命名空间。`locale`、`loadingText`、`noDataText` 及相应插槽优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                                                                          | 说明                       |
| --------------------------------------------------------------------------------------------- | -------------------------- |
| `Option`、`OptionGroup`、`OptionPanel`                                                        | 行、分组和弹出表面基元。   |
| `OptionHighlightMode`、`OptionSelectionDetail`、`OptionSelectionSource`、`OptionToggleDetail` | 高亮、选择和切换类型导出。 |

### `Option` 属性与模型

| 属性                     | 类型                                         | 默认值       | 用途                                       |
| ------------------------ | -------------------------------------------- | ------------ | ------------------------------------------ |
| `value`                  | `string`                                     | 必填         | `select` 报告的唯一选项值。                |
| `label`                  | `string`                                     | 必填         | 可见文本和无障碍名称。                     |
| `selected`               | `boolean`                                    | `false`      | 已接受的选择；值由父级拥有。               |
| `disabled`               | `boolean`                                    | `false`      | 禁止激活，并保持行不可选择。               |
| `id`                     | `string`                                     | 自动生成     | 供 `aria-activedescendant` 使用的元素 ID。 |
| `first`                  | `boolean`                                    | `false`      | 应用外侧首行圆角处理。                     |
| `last`                   | `boolean`                                    | `false`      | 应用外侧末行圆角处理。                     |
| `tabindex`               | `number`                                     | `-1`         | 选项作为焦点入口时的 Tab 索引。            |
| `term`                   | `string`                                     | `''`         | 用于匹配高亮的搜索词。                     |
| `highlightMode`          | `'contains' \| 'starts-with' \| 'ends-with'` | `'contains'` | `term` 的匹配策略。                        |
| `disableHighlight`       | `boolean`                                    | `false`      | 禁用匹配高亮，同时保留标签。               |
| `hideSelectionIndicator` | `boolean`                                    | `false`      | 移除内置选择标记。                         |
| `selectionSource`        | `'pointer' \| 'keyboard' \| 'programmatic'`  | `'pointer'`  | 指针激活时报告的来源。                     |

### `Option` 事件

| 事件     | 载荷                | 用途                             |
| -------- | ------------------- | -------------------------------- |
| `select` | `{ value, source }` | 报告启用选项的激活；由父级接受。 |

### `Option` 插槽

| 插槽                 | 用途                                       |
| -------------------- | ------------------------------------------ |
| `default`            | 自定义标签内容；无障碍名称仍来自 `label`。 |
| `leading`            | 装饰性前导媒体，例如图标或头像。           |
| `selected-indicator` | 替换内置选择标记。                         |
| `trailing`           | 尾部元数据或徽章。                         |

请保持行交互目标内没有嵌套控件或第二个独立操作。

### `OptionGroup` 属性

| 属性         | 类型      | 默认值  | 用途                           |
| ------------ | --------- | ------- | ------------------------------ |
| `label`      | `string`  | 未定义  | 可见分组标签和无障碍分组名称。 |
| `labelledby` | `string`  | 未定义  | 为分组命名的现有元素 ID。      |
| `hidden`     | `boolean` | `false` | 移除分组及其选项。             |

### `OptionGroup` 插槽

| 插槽      | 用途                 |
| --------- | -------------------- |
| `default` | 分组选项。           |
| `label`   | 自定义可见分组标签。 |

### `OptionPanel` 属性与模型

| 属性与模型       | 类型                     | 默认值             | 用途                                  |
| ---------------- | ------------------------ | ------------------ | ------------------------------------- |
| `open`           | `v-model:open: boolean`  | `false`            | 控制显示状态。                        |
| `id`             | `string`                 | 自动生成           | 显式面板元素 ID。                     |
| `anchor`         | `HTMLElement \| null`    | `null`             | 面板定位所依据的元素。                |
| `role`           | `'listbox' \| 'dialog'`  | `'listbox'`        | 表面语义。                            |
| `label`          | `string`                 | `''`               | 表面无障碍名称。                      |
| `labelledby`     | `string`                 | `''`               | 为表面命名的现有元素 ID。             |
| `multiple`       | `boolean`                | `false`            | 为列表框添加 `aria-multiselectable`。 |
| `fitAnchorWidth` | `boolean`                | `true`             | 使面板宽度匹配锚点。                  |
| `anchorOffset`   | `number`                 | `4`                | 锚点与面板的间距，单位为 CSS 像素。   |
| `scrollStrategy` | `'reposition' \| 'hide'` | `'reposition'`     | 保持对齐，或在锚点滚动时关闭。        |
| `loading`        | `boolean`                | `false`            | 显示加载状态并设置 `aria-busy`。      |
| `empty`          | `boolean`                | `false`            | 显示无数据状态。                      |
| `teleport`       | `boolean`                | `false`            | 将面板移动到 `body`。                 |
| `loadingText`    | `string`                 | 本地化             | 覆盖加载文案。                        |
| `noDataText`     | `string`                 | 本地化             | 覆盖空状态文案。                      |
| `panelClass`     | `string`                 | `''`               | 面板元素上的额外类名。                |
| `locale`         | `string`                 | Provider → `en-US` | 内置状态文案语言。                    |

### `OptionPanel` 事件

| 事件           | 载荷                            | 用途                                           |
| -------------- | ------------------------------- | ---------------------------------------------- |
| `beforetoggle` | `CustomEvent<{ open, source }>` | 变化前可取消。调用 `preventDefault()` 可阻止。 |
| `toggle`       | `{ open, source }`              | 打开状态变化后触发。                           |
| `open`         | —                               | 面板打开后触发。                               |
| `close`        | —                               | 面板关闭后触发。                               |

`source` 为 `programmatic`、`outside` 或 `anchor-scroll`。

### `OptionPanel` 插槽

| 插槽      | 用途               |
| --------- | ------------------ |
| `default` | 选项或对话框内容。 |
| `loading` | 替换加载状态。     |
| `no-data` | 替换空状态。       |

### `OptionPanel` 方法

通过模板 ref 访问。组件还暴露 `panel` 元素和响应式 `positioned` 标志。

| 方法       | 返回   | 用途                             |
| ---------- | ------ | -------------------------------- |
| `show()`   | `void` | 针对提供的锚点打开，不移动焦点。 |
| `hide()`   | `void` | 关闭，不恢复焦点。               |
| `toggle()` | `void` | 切换当前状态。                   |

## 样式

基元在对应根元素暴露公开的 `--yam3x-option-*` 属性。默认值映射到所属 Material 表面和系统 token。主指针为精确指针时使用 16 px 起始和 10 px 结束内缩及 12 px 图标间距；主指针为粗指针时两侧均为 12 px，间距为 8 px。可见行高为 44 px，交互目标为 48 px。行使用 Medium 外侧圆角和 extra-small 内侧圆角；已选行保留已选的 Medium 形状。焦点使用视觉行上内缩 3 px 的 `secondary` 环，且不改变圆角。Option 标签使用 Label Large；分组标签使用相同角色，并保持 32 px 最小高度、12 px 起始和 4 px 结束内边距。Select 触发器的覆盖项见 [Select 页面](/zh/components/select#样式)。

::: details 常用 CSS 属性

| 区域     | 属性                                                                                                                                                                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 行       | `--yam3x-option-container-height`、`--yam3x-option-height`、`--yam3x-option-shape`、`--yam3x-option-first-child-shape`、`--yam3x-option-last-child-shape`                                                                                                                                                                     |
| 已选行   | `--yam3x-option-selected-container-color`、`--yam3x-option-selected-color`、`--yam3x-option-selected-container-hover-color`、`--yam3x-option-selected-container-focus-color`                                                                                                                                                  |
| 文本     | `--yam3x-option-color`、`--yam3x-option-disabled-color`、`--yam3x-option-label-text-font-size`、`--yam3x-option-label-text-font-weight`、`--yam3x-option-label-text-line-height`、`--yam3x-option-label-text-tracking`                                                                                                        |
| 间距     | `--yam3x-option-padding-start`、`--yam3x-option-padding-end`、`--yam3x-option-icon-size`、`--yam3x-option-icon-label-space`                                                                                                                                                                                                   |
| 状态     | `--yam3x-option-container-hover-color`、`--yam3x-option-container-focus-color`、`--yam3x-option-ripple-color`                                                                                                                                                                                                                 |
| 分组     | `--yam3x-option-group-label-color`、`--yam3x-option-group-divider-color`、`--yam3x-option-group-divider-inset`                                                                                                                                                                                                                |
| 面板     | `--yam3x-option-panel-container-color`、`--yam3x-option-panel-container-shape`、`--yam3x-option-panel-container-min-width`、`--yam3x-option-panel-container-max-width`、`--yam3x-option-panel-container-max-height`                                                                                                           |
| 面板状态 | `--yam3x-option-panel-container-padding-inline`、`--yam3x-option-panel-container-padding-block`、`--yam3x-option-panel-container-elevation`、`--yam3x-option-panel-divider-spacing`、`--yam3x-option-panel-loading-color`、`--yam3x-option-panel-text-highlight-color`、`--yam3x-option-panel-text-highlight-container-color` |

临时面板默认使用 System `surface-container-low` 角色和 level 2 高度，并继承选项行与分组的值。它使用 2 px 块方向内边距和 4 px 行内边距。悬停和焦点使用独立状态层；已选行保留已选容器，同时使用已选状态层。

:::

## Material 参考

[Menus 概览](https://m3.material.io/components/menus/overview) · [指南](https://m3.material.io/components/menus/guidelines) · [规格](https://m3.material.io/components/menus/specs) · [Menus 无障碍](https://m3.material.io/components/menus/accessibility) · [Select 规格](https://m3.material.io/components/select/specs)
