<script setup lang="ts">
import ListExample from '../../components/demos/ListExample.vue'
import ListContentExample from '../../components/demos/ListContentExample.vue'
import ListSelectionExample from '../../components/demos/ListSelectionExample.vue'
</script>

# Lists

List 以连续、便于浏览的序列呈现相关项目。根据每行的用途选择静态条目、操作或选择选项。

List 属于 Material 3 Expressive 组件组。项目导出一个支持 standard 与 segmented 变体的列表容器，以及静态、操作、选择和可展开条目组件。Expressive 行样式是默认视觉目标；当内容层级更适合时，仍可使用 standard 与 segmented 配置。

## 示例

### 操作列表与展开条目

<div class="vp-raw yam3x-doc-demo-theme"><ListExample /></div>

此演示是一个包含可展开收件箱、链接目的地和带独立尾部操作行的 `ActionList`。控件可切换 standard 与 segmented 外观、缩窄列表栏、为 RTL 镜像布局，并模拟拖动状态。列表外部的详情面板显示应用接受的目的地。

::: details 查看演示源码

<<< ../../components/demos/ListExample.vue{vue}

:::

### 内容与媒体列表

<div class="vp-raw yam3x-doc-demo-theme"><ListContentExample /></div>

内容演示对比一行、两行和三行的静态条目、头像与图标前置内容、图片、不可用视频附件（带尾部文字和图标），以及显式分隔线。外观控件说明 standard 与 segmented 列表在形状和间距上的差异。

::: details 查看演示源码

<<< ../../components/demos/ListContentExample.vue{vue}

:::

### 选择列表与表单

<div class="vp-raw yam3x-doc-demo-theme"><ListSelectionExample /></div>

选择演示组合单选 listbox、多选 listbox 和原生表单。它展示选中与禁用选项、键盘漫游、`required` 校验及无效状态、提交值和重置。外观与拖动状态控件作用于演示中的每个列表。

::: details 查看演示源码

<<< ../../components/demos/ListSelectionExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ActionList, ListAction } from './components/yam3x/list'

function openDrafts(): void {
  // 导航到应用拥有的草稿目的地。
}
</script>

<template>
  <ActionList aria-label="邮件操作">
    <ListAction @click="openDrafts">
      草稿
      <template #supporting-text>4 封未读草稿</template>
      <template #actions>
        <button
          type="button"
          aria-label="草稿更多操作"
          style="min-inline-size: 48px; min-block-size: 48px"
        >
          ⋮
        </button>
      </template>
    </ListAction>
  </ActionList>
</template>
```

`ActionList` 为其行提供一个漫游 Tab 停靠点。`ListAction` 渲染原生按钮，设置 `href` 时渲染链接。为列表提供无障碍名称，并为每个自定义尾部控件提供描述性名称。

::: details 静态内容、选择与展开

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  List,
  ListItem,
  ListAction,
  ListOption,
  SelectionList,
  ExpandableListItem,
} from './components/yam3x/list'

const destination = ref('inbox')
const open = ref(false)
</script>

<template>
  <List aria-label="最近联系人">
    <ListItem leading-type="avatar">
      Ada Lovelace
      <template #supporting-text>今天活跃</template>
      <template #trailing-text>09:41</template>
    </ListItem>
  </List>

  <SelectionList
    v-model="destination"
    label="默认收件箱"
  >
    <ListOption value="inbox">收件箱</ListOption>
    <ListOption value="priority">优先</ListOption>
    <ListOption
      value="archive"
      disabled
      >归档</ListOption
    >
  </SelectionList>

  <ExpandableListItem v-model:open="open">
    收件箱
    <template #items>
      <ListAction>主要邮件</ListAction>
    </template>
  </ExpandableListItem>
</template>
```

不要将 `ListOption` 直接放入 `List`；选择选项应位于 `SelectionList` 内。可展开项的 `items` 插槽通常放 `ListAction` 行；子行需要选择值时，可在其中嵌套 `SelectionList`。

:::

## 行为与无障碍

### 条目结构与行数

- `lines="auto"` 会检测是否提供 overline 和辅助内容，然后测量换行。需要固定基准时可设 `lines="one" | "two" | "three"`。
- 辅助文字最多三行，超出后按可用空间截断。标题文字始终是主要可读内容。
- `leadingType` 决定前置区域尺寸：`icon` 为 20px，`avatar` 为 40px，`image` 为 56px，`video` 为 100 × 56px。`control` 与 `custom` 由插槽内容决定尺寸。
- 保持内容区域最宽。前置媒体使用小圆角；图片和视频以 `object-fit: cover` 填满前置区域。
- `dragged` 只绘制外部排序状态。组件不实现排序、放置区域或拖动事件。

### 操作与焦点

- `ActionList` 应用漫游 tabindex：一个可用操作具有 `tabindex="0"`，其余为 `-1`。焦点进入列表后，该行成为活动停靠点。
- 下、上方向键在可用操作间循环。Home 和 End 跳到首尾。右、左方向键按逻辑顺序移动，在 RTL 中反向。
- 禁用操作、隐藏行和关闭的可展开面板会被跳过。行内的次级控件加入同一漫游顺序，不是单独的 Tab 停靠点。
- 按钮使用 Space 或 Enter 激活；链接使用 Enter 激活并保留原生导航。可展开标题上的 `beforetoggle` 可以取消开合。
- Escape 关闭打开的行内展开面板，并将焦点返回标题。全屏模式下，焦点进入对话框，Tab 被限制在内部；Escape 或返回按钮关闭并恢复焦点。
- `current` 设置 `aria-current="page"` 和当前目的地样式。它与选项选择相互独立，不会设置 `aria-selected`。

### 选择与表单

- `SelectionList` 是带 `label` 无障碍名称的 listbox。单选模式在唯一选项上使用 `aria-selected`；`mode="multiple"` 增加 `aria-multiselectable`。
- 一个启用选项是 Tab 停靠点。方向键在启用选项间循环，Home 和 End 跳到两端，Space 或 Enter 选择或切换当前选项。禁用选项以 `aria-disabled="true"` 保持可见并被跳过。
- 模型变化前会在 listbox 上派发可取消的 `beforeinput` 事件。取消该事件会保留之前的选择。
- 模型是字符串、`null` 或字符串数组。切换到 `multiple` 会将单值转为数组；切回单选时保留第一个值。
- 每个 `ListOption` 都需要稳定且唯一的 `value`。重复值会在控制台产生警告。
- 设置 `name` 可通过隐藏输入提交选中值。`form` 关联外部表单，`required` 启用原生约束校验，`disabled` 阻止选择。校验不依赖 `name`。
- 无效提交会设置 `aria-invalid="true"`、发出 `invalid`，并聚焦首个启用选项。原生重置恢复初始模型、清除无效状态并恢复 `required` 代理。
- 选中的值按选项顺序提交。内部校验代理会从 `FormData` 中移除，绝不会作为提交值出现。
- `invalid` 是应用拥有的状态。组件不渲染错误消息；应与 [Inline message](/zh/components/inline-message) 或 Form field 文案搭配。

### 变体、分隔线与本地化

- standard 列表保持行占满宽度，并依赖组间的显式分隔线。将 `<HorizontalDivider />` 放在 `<li class="yam3x-list-divider" role="separator">` 内；列表提供 16px 逻辑起始与末尾内缩。
- segmented 列表是一个视觉分组，带 2px 间距和大容器圆角。每组使用各自带标签的列表，不要嵌套分组。
- `ExpandableListItem` 的全屏返回标签使用 `actions` 命名空间。`closeLabel` 覆盖该标签；`locale` 先选择 provider 语言，再回退到 `en-US`。
- 列表会渲染所有传入行。组件没有内置虚拟滚动；大型集合应在渲染前由应用分页或开窗。

### 响应式与 RTL

- 条目填满父容器宽度；周围布局控制列数、分组间距和文本行长。行会随文字增长，而不是裁切文字。
- 列表布局使用逻辑属性。前置内容位于行内起始端，尾部内容位于行内末尾端，RTL 会镜像顺序。
- 漫游方向键顺序在 RTL 中反向。
- 自定义尾部目标至少保持 48 × 48px，不要在标题中嵌套交互控件。

### 状态归属

`ActionList` 拥有焦点移动，而不是活动目的地；应用更新 `aria-current`、路由和详情内容。`SelectionList` 通过 `v-model` 拥有已接受选择，应用拥有选项数据、校验消息和提交处理。`ExpandableListItem` 只拥有 `open` 模型和展开行为。拖动状态和排序仍由应用负责。

## API

### 导出

| 导出                 | 类型 | 用途                                            |
| -------------------- | ---- | ----------------------------------------------- |
| `List`               | 组件 | 支持 standard 或 segmented 外观的静态列表容器。 |
| `ListItem`           | 组件 | 非交互条目。                                    |
| `ListAction`         | 组件 | 按钮或链接条目。                                |
| `ActionList`         | 组件 | 使用漫游 tabindex 的操作行列表。                |
| `SelectionList`      | 组件 | 支持单选或多选及表单的 listbox。                |
| `ListOption`         | 组件 | `SelectionList` 内的可选条目。                  |
| `ExpandableListItem` | 组件 | 行内或全屏子列表的展开条目。                    |
| `ListVariant`        | 类型 | `'standard' \| 'segmented'`。                   |
| `ListSelectionMode`  | 类型 | `'single' \| 'multiple'`。                      |

### `List`

| 属性      | 类型                        | 默认值       | 说明                     |
| --------- | --------------------------- | ------------ | ------------------------ |
| `variant` | `'standard' \| 'segmented'` | `'standard'` | 行形状、间距和分组外观。 |

| 插槽    | 作用域 | 用途     |
| ------- | ------ | -------- |
| default | —      | 列表行。 |

`List` 渲染带 `role="list"` 的 `ul`，并将其他属性（包括 `aria-label`）透传到该元素。

### `ListItem`

| 属性          | 类型                                                                | 默认值     | 说明               |
| ------------- | ------------------------------------------------------------------- | ---------- | ------------------ |
| `disabled`    | `boolean`                                                           | `false`    | 应用禁用行样式。   |
| `dragged`     | `boolean`                                                           | `false`    | 绘制外部排序状态。 |
| `leadingType` | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'` | 决定前置区域尺寸。 |
| `lines`       | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`   | 内容行数。         |

| 插槽              | 作用域 | 用途                                     |
| ----------------- | ------ | ---------------------------------------- |
| default           | —      | 标题内容。                               |
| `leading`         | —      | 图标、头像、图片、视频或自定义前置内容。 |
| `overline`        | —      | 标题上方的小字。                         |
| `supporting`      | —      | 标题下方的辅助文字。                     |
| `supporting-text` | —      | 优先于 `supporting` 的别名。             |
| `trailing-text`   | —      | 行内末尾文字。                           |
| `trailing`        | —      | 尾部图标或控件。                         |

`ListItem` 是静态条目：不添加角色、焦点目标或点击行为。`disabled` 与 `dragged` 只改变外观。

### `ListAction`

| 属性          | 类型                                                                | 默认值     | 说明                              |
| ------------- | ------------------------------------------------------------------- | ---------- | --------------------------------- |
| `disabled`    | `boolean`                                                           | `false`    | 禁用按钮或链接。                  |
| `dragged`     | `boolean`                                                           | `false`    | 绘制外部排序状态。                |
| `href`        | `string`                                                            | —          | 渲染链接而不是按钮。              |
| `target`      | `string`                                                            | —          | 链接 target，与 `href` 一起透传。 |
| `rel`         | `string`                                                            | —          | 链接 rel，与 `href` 一起透传。    |
| `download`    | `string \| boolean`                                                 | —          | 链接 download 属性。              |
| `type`        | `'button' \| 'submit' \| 'reset'`                                   | `'button'` | 原生按钮类型。                    |
| `leadingType` | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'` | 决定前置区域尺寸。                |
| `lines`       | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`   | 内容行数。                        |

| 事件    | 载荷                  | 说明       |
| ------- | --------------------- | ---------- |
| `click` | `(event: MouseEvent)` | 行被激活。 |

| 插槽              | 作用域 | 用途                         |
| ----------------- | ------ | ---------------------------- |
| default           | —      | 行标签。                     |
| `leading`         | —      | 前置内容。                   |
| `overline`        | —      | 标签上方的小字。             |
| `supporting`      | —      | 辅助文字。                   |
| `supporting-text` | —      | 优先于 `supporting` 的别名。 |
| `trailing-text`   | —      | 行内末尾文字。               |
| `trailing`        | —      | 尾部图标。                   |
| `actions`         | —      | 行操作之外的独立尾部控件。   |

在 `ActionList` 中，行本身与其 `actions` 控件共享一个漫游 Tab 停靠点。没有该上下文时，行是普通 Tab 停靠点。

### `ActionList`

| 属性      | 类型                        | 默认值       | 说明                     |
| --------- | --------------------------- | ------------ | ------------------------ |
| `variant` | `'standard' \| 'segmented'` | `'standard'` | 行形状、间距和分组外观。 |

| 插槽    | 作用域 | 用途                     |
| ------- | ------ | ------------------------ |
| default | —      | 操作行，包括可展开条目。 |

`ActionList` 渲染带 `role="list"` 的 `ul`，透传属性，并管理上文所述的漫游 tabindex。

### `SelectionList`

| 属性与模型 | 类型                         | 默认值       | 说明                         |
| ---------- | ---------------------------- | ------------ | ---------------------------- |
| `label`    | `string`                     | 必填         | listbox 的无障碍名称。       |
| `v-model`  | `string \| string[] \| null` | `null`       | 已接受值；多选模式为值数组。 |
| `mode`     | `'single' \| 'multiple'`     | `'single'`   | 选择行为。                   |
| `variant`  | `'standard' \| 'segmented'`  | `'standard'` | 行形状、间距和分组外观。     |
| `name`     | `string`                     | —            | 通过隐藏输入提交选中值。     |
| `form`     | `string`                     | —            | 按 id 关联外部表单。         |
| `required` | `boolean`                    | `false`      | 原生校验要求至少选择一个值。 |
| `disabled` | `boolean`                    | `false`      | 禁用所有选项和 listbox。     |
| `invalid`  | `boolean`                    | `false`      | 将 listbox 标记为无效。      |

| 事件          | 载荷    | 说明                                  |
| ------------- | ------- | ------------------------------------- |
| `beforeinput` | `Event` | 模型变化前发出，可取消。              |
| `input`       | `Event` | 已接受模型变化。                      |
| `change`      | `Event` | 已接受模型变化，在 `input` 之后发出。 |
| `invalid`     | `Event` | 原生约束校验失败。                    |

| 插槽    | 作用域 | 用途       |
| ------- | ------ | ---------- |
| default | —      | 列表选项。 |

listbox 会从属性暴露 `aria-multiselectable`、`aria-required`、`aria-invalid` 和 `aria-disabled`。

### `ListOption`

| 属性          | 类型                                                                | 默认值     | 说明                 |
| ------------- | ------------------------------------------------------------------- | ---------- | -------------------- |
| `value`       | `string`                                                            | 必填       | 稳定且唯一的选项值。 |
| `disabled`    | `boolean`                                                           | `false`    | 阻止选择和焦点。     |
| `dragged`     | `boolean`                                                           | `false`    | 绘制外部排序状态。   |
| `leadingType` | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'` | 决定前置区域尺寸。   |
| `lines`       | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`   | 内容行数。           |

| 插槽              | 作用域 | 用途                         |
| ----------------- | ------ | ---------------------------- |
| default           | —      | 选项标签。                   |
| `leading`         | —      | 前置内容。                   |
| `overline`        | —      | 标签上方的小字。             |
| `supporting`      | —      | 辅助文字。                   |
| `supporting-text` | —      | 优先于 `supporting` 的别名。 |
| `trailing-text`   | —      | 选择指示器之前的文字。       |
| `trailing`        | —      | 尾部图标。                   |
| `indicator`       | —      | 替换单选或复选指示器。       |

`ListOption` 渲染 `role="option"`，带有 `aria-selected` 和 `aria-disabled`，并使用选择列表上下文。替换 `#indicator` 不会改变选项语义或键盘行为。

### `ExpandableListItem`

| 属性与模型        | 类型                                                                | 默认值             | 说明                                          |
| ----------------- | ------------------------------------------------------------------- | ------------------ | --------------------------------------------- |
| `v-model:open`    | `boolean`                                                           | `false`            | 展开状态。                                    |
| `disabled`        | `boolean`                                                           | `false`            | 禁用展开标题。                                |
| `dragged`         | `boolean`                                                           | `false`            | 绘制外部排序状态。                            |
| `current`         | `boolean`                                                           | `false`            | 设置 `aria-current="page"` 和当前目的地样式。 |
| `leadingType`     | `'custom' \| 'icon' \| 'avatar' \| 'image' \| 'video' \| 'control'` | `'custom'`         | 决定前置区域尺寸。                            |
| `lines`           | `'auto' \| 'one' \| 'two' \| 'three'`                               | `'auto'`           | 标题内容行数。                                |
| `presentation`    | `'inline' \| 'fullScreen'`                                          | `'inline'`         | 行内展开或全屏容器变换。                      |
| `locale`          | `string`                                                            | Provider → `en-US` | 内置返回标签的语言。                          |
| `closeLabel`      | `string`                                                            | 本地化 `Back`      | 覆盖全屏返回标签。                            |
| `fullScreenTitle` | `string`                                                            | `''`               | 全屏模式下的可见标题回退。                    |

| 事件           | 载荷    | 说明                     |
| -------------- | ------- | ------------------------ |
| `beforetoggle` | `Event` | 面板开合前发出，可取消。 |
| `opening`      | `Event` | 面板即将打开。           |
| `opened`       | `Event` | 打开过渡结束。           |
| `closing`      | `Event` | 面板即将关闭。           |
| `closed`       | `Event` | 关闭过渡结束。           |

| 插槽                | 作用域 | 用途                         |
| ------------------- | ------ | ---------------------------- |
| default             | —      | 标题标签。                   |
| `leading`           | —      | 前置内容。                   |
| `overline`          | —      | 标签上方的小字。             |
| `supporting`        | —      | 辅助文字。                   |
| `supporting-text`   | —      | 优先于 `supporting` 的别名。 |
| `toggle-icon`       | —      | 替换展开/收起图标。          |
| `items`             | —      | 子列表内容。                 |
| `full-screen-title` | —      | 替换全屏对话框标题。         |

行内模式下，面板是 `list`；全屏模式下，它是模态 `dialog`。使用 `fullScreenTitle`、`#full-screen-title` 或根 `aria-label` 命名该对话框；最后一项也提供可见标题回退。模型接受 `open` 后控制面板；组件不暴露命令式打开或关闭方法。

### 事件

事件列在发出它们的组件说明中。`ListItem`、`List` 和 `ActionList` 不发出事件。

### 方法

列表组件都不暴露实例方法。选择通过模型控制，展开通过 `v-model:open` 控制。

## 样式

列表几何、内缩、间距、媒体尺寸和状态形状由组件拥有，并映射到 Expressive 列表样式。没有公开的列表专用自定义属性；请使用共享 System 字阶 token 以及共享状态层和涟漪接口。

| 接口                                                                     | 用途                               |
| ------------------------------------------------------------------------ | ---------------------------------- |
| `--md-sys-typescale-body-large-*`                                        | 标题角色。                         |
| `--md-sys-typescale-body-medium-*`                                       | 辅助文字角色。                     |
| `--md-sys-typescale-label-small-*`                                       | Overline 和尾部文字角色。          |
| `--md-sys-density-spacing-scale`                                         | 按密度缩放列表间距。               |
| `--yam3x-state-layer-hover-color`、`--yam3x-state-layer-focus-color`     | 操作行和选项表面的共享状态层颜色。 |
| `--yam3x-state-layer-hover-opacity`、`--yam3x-state-layer-focus-opacity` | 共享状态层透明度。                 |
| `--yam3x-ripple-color`、`--yam3x-ripple-opacity`                         | 操作行和选择行的共享按下涟漪颜色。 |
| `--yam3x-collapsible-animation-duration`                                 | 展开与收起时长；默认 `300ms`。     |

segmented 列表是一个视觉分组，带 2px 间距和大容器圆角。standard 列表保持整行宽度并依赖显式分隔线。条目填满父容器宽度；周围布局控制列数和阅读宽度。前置与尾部图标以 20px 渲染，前置头像 40px，图片 56px，视频 100 × 56px。选中的前置和尾部图标使用选中内容角色；悬停、聚焦和按压的选中状态会将图标切换为 `on-surface`，而标签保持选中标签角色。

## Material 参考

[Lists 概览](https://m3.material.io/components/lists/overview) · [指南](https://m3.material.io/components/lists/guidelines) · [规格](https://m3.material.io/components/lists/specs) · [无障碍](https://m3.material.io/components/lists/accessibility)
