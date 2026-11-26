<script setup lang="ts">
import AutocompleteExample from '../../components/demos/AutocompleteExample.vue'
import AutocompleteBasicExample from '../../components/demos/AutocompleteBasicExample.vue'
import AutocompleteStatesExample from '../../components/demos/AutocompleteStatesExample.vue'
import AutocompleteVirtualExample from '../../components/demos/AutocompleteVirtualExample.vue'
</script>

# Autocomplete

Autocomplete 是项目拓展组件，会在用户输入时筛选建议，并允许用户确认建议或保留自由文本。查询内容与已选值是彼此独立的状态。

Material 在 [Menus](https://m3.material.io/components/menus/overview) 中记录此过滤模式，而不是将其定义为独立组件。最接近的 Compose Material 3 组合是带有可编辑文本字段和 `DropdownMenuItem` 建议的 `ExposedDropdownMenuBox`。Combobox 语义、已确认值模型、弹层限制和验证行为属于项目决定。

当输入应缩小已知目录范围、但不应强制选择时使用它。所有值都来自封闭列表时使用 [Select](/zh/components/select)；建议没有额外价值时，使用 [Form field](/zh/components/form-field) 搭配普通输入框。

## 示例

### 过滤与变体

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteExample /></div>

输入以筛选水果建议，然后使用向下箭头和 Enter 确认一项。已确认值、查询文本和发出的事件分开显示。颜色控件切换 Standard 与 Vibrant 菜单映射；两者保持相同的过滤行为。

::: details 查看示例源码

<<< ../../components/demos/AutocompleteExample.vue{vue}

:::

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteBasicExample /></div>

基础字段筛选本地列表并报告已确认值。`v-model` 拥有可编辑文本，`v-model:selected` 拥有建议值；确认后清空或编辑文本会清除已选值。

::: details 查看示例源码

<<< ../../components/demos/AutocompleteBasicExample.vue{vue}

:::

### 验证与状态

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteStatesExample /></div>

示例覆盖原生必填验证、`selection-required`、表单重置、自定义过滤模式、自定义谓词、自定义输入插槽、自动激活、实时选项更新、禁用与只读字段、隐藏的加载与无数据行、隐藏的选中指示器，以及无效字段。展开区块可检查每种状态。

::: details 查看示例源码

<<< ../../components/demos/AutocompleteStatesExample.vue{vue}

:::

### 大型目录

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteVirtualExample /></div>

`virtual` 为大型建议目录渲染按实际行高测量的窗口。筛选、键盘导航、选择和结果播报仍基于完整数据。控件还会展示加载、零额外渲染、自定义选项插槽，以及移除开头记录。

::: details 查看示例源码

<<< ../../components/demos/AutocompleteVirtualExample.vue{vue}

:::

## 在应用中使用

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  Autocomplete,
  type AutocompleteFilter,
  type AutocompleteOption,
} from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const filter = ref<AutocompleteFilter>('contains')
const options: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'unavailable', label: 'Unavailable', disabled: true },
]
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    :filter="filter"
    label="Fruit"
    hint="输入以筛选列表。"
  />
</template>
```

组件不会自行获取建议。应用提供 `options`；请求进行时设置 `loading`，完成后替换 `options`。查询文本、标签和已选值由应用拥有。

::: details 异步选项与自定义选项插槽

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Autocomplete, type AutocompleteOption } from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const options = shallowRef<AutocompleteOption[]>([])
const loading = ref(false)
let sequence = 0

async function onQuery({ query: value }: { query: string }): Promise<void> {
  const current = ++sequence
  loading.value = true
  try {
    const response = await fetch(`/api/fruit?q=${encodeURIComponent(value)}`)
    const rows = (await response.json()) as AutocompleteOption[]
    if (current === sequence) options.value = rows
  } finally {
    if (current === sequence) loading.value = false
  }
}
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    :loading="loading"
    label="Fruit"
    @query="onQuery"
  >
    <template #option="{ option, selected: committed }">
      <span>{{ option.label }}</span>
      <small v-if="committed">已确认</small>
    </template>
  </Autocomplete>
</template>
```

:::

::: details 大型目录

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete, type AutocompleteOption } from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const options: AutocompleteOption[] = Array.from({ length: 10000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index + 1}`,
}))
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    :virtual="{ estimateSize: 48, overscan: 4 }"
    label="Item"
  />
</template>
```

:::

## 行为与无障碍

可编辑输入框是拥有 DOM 焦点的 combobox。弹层是由 `label` 命名的 listbox；活动建议通过 `aria-activedescendant` 暴露，结果数量或状态文本通过礼貌 live region 播报。

### 查询、选择与 `aria-selected`

- 输入会更新查询，并按 `filter` 筛选标签：默认不区分大小写的 `contains`，也可使用 `starts-with`、`ends-with`、`none` 或自定义 `(option, query) => boolean`。
- `filter="none"` 显示完整的已提供目录。当应用根据查询自行提供选项时使用它。
- Enter 或指针激活会确认活动的启用建议。确认会把选项标签写入查询，并把其 `value` 写入 `v-model:selected`。
- 确认后编辑文本会清除 `selected`，并以 `option: null`、`value: null` 和新查询发出 `change`。允许自由文本；设置 `selection-required` 可在原生验证中拒绝它。
- 从外部设置 `selected` 会把查询更新为匹配的选项标签。设置不在 `options` 中的值会保留当前文本。
- `aria-selected` 标识活动建议，而不是已确认值。已确认值由输入文本和尾部勾选指示器表示；`hide-selection-indicator` 可移除该指示器。
- 禁用建议仍可阅读，但会被键盘移动和激活跳过。

### 键盘与焦点

- 弹层可用时，向下和向上箭头会打开弹层，然后在启用的建议间循环移动。
- 弹层打开时，Enter 确认活动建议。空格会作为文本输入。
- Escape 关闭弹层并保留查询文本。Tab 关闭弹层并按页面顺序离开。
- 查询为空时，Backspace 或 Delete 会关闭弹层。
- 失焦会关闭弹层。启用 `selection-required` 时，查询会恢复为已确认标签，使字段不会保留无效的自由文本。
- 输入法组合结束前，导航与激活会忽略组合事件。
- `openOnFocus`（默认 `true`）会在聚焦时打开可用建议。`autoActivate` 会把已确认选项或首个启用建议设为活动行，但不会确认该行。

### 弹出状态与表单参与

- `loading` 设置 `aria-busy`、卸载选项行，并显示加载行，除非设置 `hide-loading`。加载文本可来自 `loadingText` 或 `#loading` 插槽。
- 无匹配时显示无数据行，除非设置 `hide-no-data`；`noDataText` 和 `#no-data` 覆盖本地化默认值。若两种状态行都被隐藏，空结果的弹层不会打开。
- 结果数量和状态文本会在查询稳定后播报，快速输入不会用每个中间数量反复打断辅助技术。
- 当弹层无法打开且字段启用时，尾部建议按钮会省略；禁用和只读字段保留可见的禁用按钮。
- 受控查询会在父组件渲染后结算。若父组件规范化查询，活动项和弹层状态使用规范化后的值。
- `hint` 通过 `aria-describedby` 关联。`error` 替换提示、标记字段无效，并通过 alert 播报。
- `floatLabel="always"` 使用 Form field 的 outlined 缺口几何：预填值时标签仍可见，缺口在文本缩放和 RTL 下跟随实际标签宽度。
- 原生输入承载 `name`、`form`、`disabled`、`readonly` 和 `required`。在已确认选项标签与文本匹配之前，`selection-required` 会添加原生自定义有效性错误。原生表单重置会恢复初始查询和已选值。
- `resultsLabel`、`loadingText` 和 `noDataText` 覆盖内置播报。`#input` 插槽必须把 `inputProps` 绑定到原生可编辑输入框。
- 虚拟化要求唯一且稳定的选项值。只有附近和活动建议会挂载；`aria-posinset` 和 `aria-setsize` 描述其在筛选结果中的位置。目录变化会保留首个可见记录及其偏移，显式导航优先。

### 响应式与 RTL

弹层相对字段定位，视口较矮时向上翻转，并平移以保持位于视口内。其宽度在 `--yam3x-autocomplete-popup-min-width` 与 `--yam3x-autocomplete-popup-max-width` 之间匹配字段。弹层跟随书写方向，并在 RTL 布局中镜像到字段的行内末端。字段本身填满容器。

## API

内置状态、结果播报、建议名称和必选验证文案可继承 [LocaleProvider](/zh/components/localization) 的 `autocomplete` 配置。可选 `locale` 优先，默认使用 provider，再回退到 `en-US`；`loadingText`、`noDataText`、`resultsLabel` 和相应插槽继续优先。查询文本、选项标签和选择值由应用拥有。

### 导出

| 导出                          | 类型 | 用途                                                       |
| ----------------------------- | ---- | ---------------------------------------------------------- |
| `Autocomplete`                | 组件 | 带过滤建议列表的可编辑 combobox。                          |
| `AutocompleteOption`          | 类型 | 具有唯一 `value`、`label` 和可选 `disabled` 的建议行。     |
| `AutocompleteFilter`          | 类型 | 过滤模式或 `(option, query) => boolean` 谓词。             |
| `AutocompleteFilterMode`      | 类型 | `'contains'`、`'starts-with'`、`'ends-with'` 或 `'none'`。 |
| `AutocompleteSelectionSource` | 类型 | `'keyboard'` 或 `'pointer'`。                              |
| `AutocompleteVariant`         | 类型 | `'standard'` 或 `'vibrant'`。                              |
| `VirtualListOptions`          | 类型 | `virtual` 的窗口选项。                                     |

### 属性与模型

| 属性 / 模型                     | 类型                                    | 默认值             | 说明                                                                           |
| ------------------------------- | --------------------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| `options`                       | `AutocompleteOption[]`                  | 必填               | 建议项；每个 `value` 在列表中唯一。                                            |
| `label`                         | `string`                                | 必填               | 可见字段标签和可访问名称。                                                     |
| `floatLabel`                    | `'always'`                              | —                  | 将标签放在 outlined field 内，作为常驻的缺口标签。不设置时标签保留在字段上方。 |
| `hint`                          | `string`                                | `''`               | 辅助文本，与输入框关联。                                                       |
| `error`                         | `string`                                | `''`               | 无效消息；替换提示并标记字段无效。                                             |
| `modelValue` / `v-model`        | `string`                                | `''`               | 当前可编辑文本。                                                               |
| `selected` / `v-model:selected` | `string \| null`                        | `null`             | 已确认建议的值。                                                               |
| `filter`                        | `AutocompleteFilter`                    | `'contains'`       | 不区分大小写的模式或自定义谓词。                                               |
| `caseSensitive`                 | `boolean`                               | `false`            | 区分大小写匹配标签。                                                           |
| `autoActivate`                  | `boolean`                               | `false`            | 将已确认或首个启用建议设为活动项，但不确认它。                                 |
| `openOnFocus`                   | `boolean`                               | `true`             | 输入框聚焦时打开可用建议。                                                     |
| `loading`                       | `boolean`                               | `false`            | 显示加载状态并移除选项行。                                                     |
| `loadingText`                   | `string`                                | 本地化             | 覆盖加载状态文本。                                                             |
| `noDataText`                    | `string`                                | 本地化             | 覆盖无结果文本。                                                               |
| `resultsLabel`                  | `string \| ((count: number) => string)` | 本地化             | 覆盖结果数量播报。                                                             |
| `variant`                       | `'standard' \| 'vibrant'`               | `'standard'`       | 作为项目变体公开的菜单颜色映射。                                               |
| `hideSelectionIndicator`        | `boolean`                               | `false`            | 隐藏已确认值勾选图标。                                                         |
| `hideLoading`                   | `boolean`                               | `false`            | 隐藏加载行；加载时也隐藏弹层。                                                 |
| `hideNoData`                    | `boolean`                               | `false`            | 隐藏无结果行；为空时也隐藏弹层。                                               |
| `panelClass`                    | `string`                                | `''`               | 应用到弹层 listbox 的类名。                                                    |
| `virtual`                       | `boolean \| VirtualListOptions`         | `false`            | 渲染测量窗口；`true` 使用 48px 估计和 4 行额外渲染。                           |
| `id`                            | `string`                                | 自动生成           | 输入框 ID。                                                                    |
| `placeholder`                   | `string`                                | `''`               | 原生输入占位符。                                                               |
| `name`                          | `string`                                | —                  | 原生表单字段名。                                                               |
| `form`                          | `string`                                | —                  | 通过 id 将输入框关联到表单。                                                   |
| `autocomplete`                  | `string`                                | `'off'`            | 原生自动完成提示。                                                             |
| `required`                      | `boolean`                               | `false`            | 对非空值进行原生必填验证。                                                     |
| `selectionRequired`             | `boolean`                               | `false`            | 要求文本与已确认选项标签匹配。                                                 |
| `disabled`                      | `boolean`                               | `false`            | 禁用输入框和弹层。                                                             |
| `readonly`                      | `boolean`                               | `false`            | 使输入框只读并关闭弹层。                                                       |
| `locale`                        | `string`                                | Provider → `en-US` | 内置状态与验证文本的语言。                                                     |

### 事件

| 事件           | 载荷                                | 说明                                                    |
| -------------- | ----------------------------------- | ------------------------------------------------------- |
| `query`        | `{ query: string }`                 | 输入文本变化。                                          |
| `beforeselect` | `(option, event)`                   | 可取消；`event.detail` 包含 `{ option, source }`。      |
| `select`       | `{ option, source }`                | 建议已被确认。                                          |
| `change`       | `{ option, value, query, source? }` | 已确认值或查询变化；编辑清除确认时 `option` 为 `null`。 |
| `toggle`       | `{ open: boolean }`                 | 弹层可见性变化。                                        |
| `open`         | —                                   | 弹层打开。                                              |
| `close`        | —                                   | 弹层关闭。                                              |

### 插槽

| 插槽       | 参数                                  | 说明                                                 |
| ---------- | ------------------------------------- | ---------------------------------------------------- |
| `input`    | `{ inputProps, query, selected }`     | 替换原生输入框；把 `inputProps` 绑定到可编辑输入框。 |
| `option`   | `{ option, active, selected, query }` | 替换建议内容；保持非交互。                           |
| `loading`  | —                                     | 替换加载行。                                         |
| `no-data`  | —                                     | 替换无结果行。                                       |
| `trailing` | —                                     | 替换展开按钮图标。                                   |

### 方法

通过模板引用访问这些成员。

| 成员      | 类型                            | 说明               |
| --------- | ------------------------------- | ------------------ |
| `close()` | `() => void`                    | 关闭弹层。         |
| `focus()` | `() => void`                    | 聚焦可编辑输入框。 |
| `open`    | `Ref<boolean>`                  | 当前弹层可见性。   |
| `input`   | `Ref<HTMLInputElement \| null>` | 原生输入元素。     |

## 样式

组件在根元素上公开项目定义的几何、形状、高度和标签字号覆盖项。主题颜色保持映射到 System 角色，并通过 `variant` 切换；颜色属性不是公共钩子。弹层的选项表面无间隙，默认高度上限为 280px。

::: details CSS 覆盖项

| 属性                                               | 默认值                  | 说明                              |
| -------------------------------------------------- | ----------------------- | --------------------------------- |
| `--yam3x-autocomplete-popup-min-width`             | `112px`                 | 弹层最小宽度。                    |
| `--yam3x-autocomplete-popup-max-width`             | `280px`                 | 弹层最大宽度。                    |
| `--yam3x-autocomplete-popup-max-height`            | `280px`                 | 滚动前的弹层最大高度。            |
| `--yam3x-autocomplete-popup-padding-block`         | 随密度缩放的 `2px`      | 选项列表的块向内边距。            |
| `--yam3x-autocomplete-popup-padding-inline`        | 随密度缩放的 `4px`      | 选项列表的行向内边距。            |
| `--yam3x-autocomplete-popup-shape`                 | System large 圆角       | 弹层圆角。                        |
| `--yam3x-autocomplete-popup-elevation`             | Level 2                 | 弹层高度。                        |
| `--yam3x-autocomplete-option-container-height`     | `44px`                  | 48px 点击目标内的可见行表面高度。 |
| `--yam3x-autocomplete-option-shape`                | System extra-small 圆角 | 行圆角。                          |
| `--yam3x-autocomplete-option-first-child-shape`    | System medium 圆角      | 首行圆角。                        |
| `--yam3x-autocomplete-option-last-child-shape`     | System medium 圆角      | 末行圆角。                        |
| `--yam3x-autocomplete-option-selected-shape`       | System medium 圆角      | 已确认行圆角。                    |
| `--yam3x-autocomplete-option-label-text-font-size` | Label large             | 建议标签字号。                    |

:::

## Material 参考

[菜单指南](https://m3.material.io/components/menus/guidelines) · [菜单规格](https://m3.material.io/components/menus/specs) · [文本框规格](https://m3.material.io/components/text-fields/specs) · [Combobox 模式](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
