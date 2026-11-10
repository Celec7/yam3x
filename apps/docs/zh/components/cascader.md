<script setup lang="ts">
import CascaderBasicExample from '../../components/demos/CascaderBasicExample.vue'
import CascaderSearchExample from '../../components/demos/CascaderSearchExample.vue'
import CascaderExample from '../../components/demos/CascaderExample.vue'
</script>

# Cascader

Cascader 是项目拓展组件，用于从层级结构中选择一条路径。它使用具名列表展示每个直接子集合，将浏览与已确认值分离，并在窄容器中切换为单层视图。

Material 没有定义独立的 Cascader 组件。最接近的 Compose Material 3 组合是包含 listbox 的对话框或嵌套菜单；路径选择与对话框语义属于项目决定。当展开的层级本身就是主要导航模型时，使用 [TreeSelect](/zh/components/tree-select)。

组件期望获得完整的当前已知层级。它不定义加载器、分页或多选约定；应用获知更多记录时应提供新的 `options`。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><CascaderBasicExample /></div>

打开选择器逐层浏览直接子项。选择叶节点会确认路径并关闭对话框；已确认值显示在字段下方。此示例启用了搜索与清除。

::: details 查看示例源码

<<< ../../components/demos/CascaderBasicExample.vue{vue}

:::

### 搜索与分支路径

<div class="vp-raw yam3x-doc-demo-theme"><CascaderSearchExample /></div>

搜索匹配完整的显示路径，包括不同分支中的重复值。启用 `select-branches` 后，可通过“选择此路径”显式确认中间路径；单纯浏览仍不会提交。禁用的分支与叶节点无法确认。

::: details 查看示例源码

<<< ../../components/demos/CascaderSearchExample.vue{vue}

:::

### 选择、布局与状态

<div class="vp-raw yam3x-doc-demo-theme"><CascaderExample /></div>

控件可镜像选择器、通过 fieldset 禁用字段、允许确认分支、通过可取消的 `beforeinput` 事件拒绝更改，以及清空目录。示例还展示已确认路径、禁用叶节点和禁用分支。重置会恢复初始已确认路径。

::: details 查看示例源码

<<< ../../components/demos/CascaderExample.vue{vue}

:::

## 在应用中使用

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件与字段包装组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Cascader, type CascaderOption } from './components/yam3x/cascader'
import { FormField } from './components/yam3x/form-field'

const value = ref<string[]>([])
const options: CascaderOption[] = [
  {
    value: 'product',
    label: '产品',
    children: [{ value: 'design', label: '设计', children: [{ value: 'brief', label: '简报' }] }],
  },
]
</script>

<template>
  <FormField label="目标位置">
    <Cascader
      v-model="value"
      :options="options"
      label="目标位置"
      name="destination"
      searchable
      required
    />
  </FormField>
</template>
```

`v-model` 是有序值数组。空数组表示未选择。触发器、对话框标题和可见的第 2 级弹层标题使用 `label`；使用 FormField 提供持续可见的字段标签和辅助文本。

::: details 搜索、分支确认与清除

```vue
<template>
  <Cascader
    v-model="value"
    v-model:query="query"
    v-model:open="open"
    :options="options"
    label="目标位置"
    searchable
    select-branches
    clearable
  />
</template>
```

`select-branches` 添加显式的 “选择此路径”操作，并让搜索结果包含中间路径。浏览分支不会提交它。`clearable` 添加“清除”操作；已知禁用的已确认路径无法从界面清除。

:::

::: details 读取提交的路径

```vue
<script setup lang="ts">
function onSubmit(event: SubmitEvent): void {
  const body = new FormData(event.currentTarget as HTMLFormElement)
  const raw = body.get('destination')
  const path = typeof raw === 'string' && raw ? JSON.parse(raw) : []
  console.log(path) // ["product","design","brief"]
}
</script>
```

隐藏的原生 select 将已确认路径作为 JSON 数组字符串提交。`separator` 只影响显示。

:::

## 行为与无障碍

### 浏览与确认

- 打开时，以已确认路径的有效前缀初始化草稿。进入分支只打开其子选项，不修改字段值。
- 替换祖先会丢弃过时的草稿后缀；返回同一祖先则保留原草稿。默认在叶节点确认并关闭。
- 启用 `select-branches` 后，可使用“选择此路径”显式确认中间草稿。浏览分支仍不会提交。
- Escape 和关闭操作丢弃浏览变化，保留已确认值。
- 每个可见层级是具名的单选 listbox。`aria-selected` 标记该层级中的当前草稿选择，DOM 焦点可独立移动。
- 上／下箭头跳过禁用项；Home／End 到达列表边缘；输入前缀查找启用标签而不确认值。前缀在 700ms 或导航操作后重置。
- 展开方向箭头进入分支，反方向箭头返回父层级；RTL 下方向镜像。Enter 或 Space 激活选项。
- 禁用祖先会阻止后代确认。值可以在不同分支重复，因此 `['east', 'shared']` 与 `['west', 'shared']` 是不同路径。

### 搜索与布局

- 搜索按当前 locale 匹配完整的显示路径。默认结果为完整叶路径；`select-branches` 还会提供中间路径。
- 修改查询或语言不会更改已确认值。未知的已确认后缀保留原始值，用于显示和表单值，直到应用主动移除。
- 较宽的弹层容器并排展示层级列表，必要时横向滚动。弹层内容宽度不超过 36rem 时，仅显示活动层级。
- 紧凑布局仍显示祖先路径与返回操作，键盘依然能够切换层级。完整标签在当前面板内换行。

### 焦点与关闭

- 触发器是打开非模态对话框的仅选择型 combobox。初始焦点进入搜索框，无搜索时进入当前层级。
- 从搜索框按向下箭头进入当前列表。输入法组合键和带修饰键的文本编辑快捷键保留原生含义。
- Escape 或关闭返回触发器；Tab 和外部关闭保留目标焦点。背景内容仍可交互。

### 原生表单

- 隐藏的原生 select 将已确认路径作为 JSON 数组字符串提交，例如 `["product","design","brief"]`。请使用 `JSON.parse` 读取，`separator` 不影响它。
- 空选择使用原生缺失值状态。已知禁用的已确认路径遵循原生 select 规则，不进入 `FormData`。
- 校验失败聚焦可见触发器。原生重置恢复初始已确认路径并关闭弹层。
- 外层禁用的 fieldset 也会禁用已传送的选择器，并关闭打开的对话框。
- 选项变化可以调整草稿及其焦点，但不会裁剪应用控制的已确认路径。原已确认路径后来变为中间路径时，即使 `select-branches` 为 false 也会保留。
- 如果业务要求路径必须当前可解析且为终端路径，请使用 Form 提供应用级校验。

### 状态归属

`v-model` 拥有已确认路径，`v-model:open` 拥有对话框可见性，`v-model:query` 拥有搜索文字。对话框草稿路径和键盘焦点为内部状态，关闭时丢弃。应用拥有标签、记录加载，以及路径是否仍然有效的业务规则。

## API

内置标签使用 [LocaleProvider](/zh/components/localization) 的 `cascader` 命名空间（`search`、`root`、`empty`、`noResults`、`choosePath`、`level(position, parent)`、`results(label)`）。页脚导航使用 `actions`。显式 locale 和文案 props 优先，标签、值与业务格式由应用控制。

### 导出

| 导出             | 类型 | 用途                                                                  |
| ---------------- | ---- | --------------------------------------------------------------------- |
| `Cascader`       | 组件 | 路径触发器、对话框、列导航与原生表单代理。                            |
| `CascaderOption` | 类型 | 包含 `value`、`label`、可选 `disabled` 和可选 `children` 的层级节点。 |

### 属性与模型

| 属性 / 模型               | 类型                        | 默认值             | 说明                                                                       |
| ------------------------- | --------------------------- | ------------------ | -------------------------------------------------------------------------- |
| `options`                 | `readonly CascaderOption[]` | 必填               | 完整的当前已知层级。值必须非空，并在每个直接同级集合内唯一；层级必须无环。 |
| `label`                   | `string`                    | 必填               | 触发器、对话框及可见第 2 级弹层标题。                                      |
| `modelValue` / `v-model`  | `string[]`                  | `[]`               | 已确认的有序路径；空数组表示未选择。                                       |
| `open` / `v-model:open`   | `boolean`                   | `false`            | 对话框可见性。禁用的字段无法打开。                                         |
| `query` / `v-model:query` | `string`                    | `''`               | 与已确认路径独立的搜索文字，关闭时清空。                                   |
| `searchable`              | `boolean`                   | `false`            | 添加原生搜索框与完整路径结果。                                             |
| `selectBranches`          | `boolean`                   | `false`            | 添加“选择此路径”，并让搜索结果包含中间路径。                               |
| `clearable`               | `boolean`                   | `false`            | 为可移除的已确认路径添加清除操作。                                         |
| `separator`               | `string`                    | `' / '`            | 仅用于显示的分隔符；表单序列化始终使用 JSON。                              |
| `id`                      | `string`                    | 自动生成           | 触发器 ID。                                                                |
| `name`                    | `string`                    | —                  | 原生表单字段名。                                                           |
| `form`                    | `string`                    | —                  | 通过 id 将原生代理关联到表单。                                             |
| `required`                | `boolean`                   | `false`            | 原生校验时要求已确认路径。                                                 |
| `disabled`                | `boolean`                   | `false`            | 禁用触发器、对话框与选择。                                                 |
| `locale`                  | `string`                    | Provider → `en-US` | 内置消息语言。                                                             |
| `searchLabel`             | `string`                    | 本地化             | 覆盖搜索字段标签。                                                         |
| `noDataText`              | `string`                    | 本地化             | 覆盖无匹配结果文案。                                                       |
| `panelClass`              | `string`                    | `''`               | 添加到弹层表面的类名。                                                     |

### 事件

| 事件          | 载荷                   | 说明                                                                         |
| ------------- | ---------------------- | ---------------------------------------------------------------------------- |
| `beforeinput` | `Event`                | 可取消；在叶节点确认、显式分支确认、搜索结果确认和清除前触发。浏览不会触发。 |
| `input`       | `{ values: string[] }` | 随模型更新报告选择提议。                                                     |
| `change`      | `{ values: string[] }` | 报告已确认的选择变化。                                                       |
| `invalid`     | `Event`                | 转发原生校验失败。                                                           |

更新后，原生 `input` 和 `change` 事件也会从表单代理冒泡。

### 方法

通过模板引用访问这些成员。

| 成员                   | 签名                               | 说明                                          |
| ---------------------- | ---------------------------------- | --------------------------------------------- |
| `show()`               | `() => void`                       | 字段可更改时打开对话框。                      |
| `close(restoreFocus?)` | `(restoreFocus?: boolean) => void` | 关闭对话框；传入 `false` 可保留当前焦点目标。 |
| `focus()`              | `() => void`                       | 聚焦触发器。                                  |
| `trigger`              | `HTMLButtonElement \| undefined`   | 原生触发器元素。                              |

::: details `CascaderOption` 结构

| 字段       | 类型                        | 说明                                     |
| ---------- | --------------------------- | ---------------------------------------- |
| `value`    | `string`                    | 在其直接同级集合内稳定且非空的标识。     |
| `label`    | `string`                    | 可见且可访问的选项标签。                 |
| `disabled` | `boolean`                   | 阻止确认并阻止其后代。                   |
| `children` | `readonly CascaderOption[]` | 直接子项；缺省或空 children 表示叶节点。 |

:::

## 样式

Cascader 不暴露公共 CSS 自定义属性。使用 FormField 提供轮廓或填充字段外观与辅助文本。弹层复用 OptionPanel 与 Option 菜单行，包括其圆角、状态层和按下反馈。

对话框提供随密度缩放的 12px 内边距，并重置 OptionPanel 的菜单内边距，使行表面与标题、搜索字段和页脚对齐。首选最小宽度为 640px，最大为 800px，且受视口可用宽度限制。层级列表的弹性基础宽度为 192px，最大高度为 280px；弹层整体最大高度为 520px。空间更小时，这些上限会相应降低。可用 `panelClass` 设置弹层样式；[Option](/zh/components/option) 拥有行样式约定。

## Material 参考

[Text fields 指导](https://m3.material.io/components/text-fields/guidelines) · [Lists 指导](https://m3.material.io/components/lists/guidelines) · [Menus 指导](https://m3.material.io/components/menus/guidelines)
