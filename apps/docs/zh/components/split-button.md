<script setup lang="ts">
import SplitButtonExample from '../../components/demos/SplitButtonExample.vue'
import SplitButtonStatesExample from '../../components/demos/SplitButtonStatesExample.vue'
import SplitButtonCompositionExample from '../../components/demos/SplitButtonCompositionExample.vue'
import SplitButtonPopupExample from '../../components/demos/SplitButtonPopupExample.vue'
</script>

# Split buttons

Split button 打开一个菜单，提供与某个操作相关的更多选项。当常用操作需要独立按钮、而相关选项只需一步即可访问时使用。

Split button 用于在主操作旁增加一组操作菜单。它通过隐藏额外选项减少视觉复杂度。Split button 可以单独使用，也可以与普通按钮和图标按钮一起使用。

## 示例

### 基础

主按钮执行操作，尾随按钮通过 `items` 打开 Menu。可使用控件比较颜色、形状、尺寸、菜单位置和从右到左布局。

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonExample.vue{vue}

:::

### 状态

可分别禁用主操作、菜单或两者。主操作保留原生按钮与表单行为，支持 `href`，也可只显示图标并提供自己的可访问名称。

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonStatesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonStatesExample.vue{vue}

:::

## 在应用中导入

从 `./components/yam3x/split-button` 导入已复制的组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SplitButton, type MenuItem } from './components/yam3x/split-button'

const open = ref(false)
const items: MenuItem[] = [
  { value: 'document', label: '保存文档', type: 'radio', group: 'format' },
  { value: 'image', label: '导出为图片', type: 'radio', group: 'format' },
]

function save(): void {
  console.log('已保存')
}
</script>

<template>
  <SplitButton
    v-model:open="open"
    label="保存"
    :items="items"
    menu-label="保存选项"
    group-label="保存操作"
    @click="save"
  />
</template>
```

用 `label` 或默认插槽提供简短的主操作文字，图标使用 `#icon`。生成的菜单名称与尾随按钮名称可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 文案；`locale` 可覆盖语言，默认使用 provider，再回退到 `en-US`，标签属性优先。

## 高级

### 组合

需要直接控制两个按钮或弹层时，使用组合式 API。`SplitButtonLayout` 提供共同的 variant、size、shape 和间距；通过 `#leading` 与 `#trailing` 插槽分别组合两个控件。间距默认采用 Material 的 2px，可用 `spacing` 覆盖。`SplitButtonTrailingButton` 通过 `v-model:checked` 暴露展开状态。布局本身不管理菜单状态或内容。

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonCompositionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonCompositionExample.vue{vue}

:::

::: details 组合示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from './components/yam3x/menu'
import {
  SplitButtonLayout,
  SplitButtonLeadingButton,
  SplitButtonTrailingButton,
} from './components/yam3x/split-button'

const open = ref(false)
const items: MenuItem[] = [{ value: 'copy', label: '保存副本' }]

function save(): void {
  console.log('已保存')
}
</script>

<template>
  <SplitButtonLayout
    aria-label="保存操作"
    spacing="4px"
  >
    <template #leading>
      <SplitButtonLeadingButton @click="save">保存</SplitButtonLeadingButton>
    </template>
    <template #trailing>
      <Menu
        v-model:open="open"
        :items="items"
        label="保存选项"
        trigger-label="更多保存选项"
      >
        <template #trigger="{ triggerProps }">
          <SplitButtonTrailingButton
            v-bind="triggerProps"
            v-model:checked="open"
            aria-label="更多保存选项"
          />
        </template>
      </Menu>
    </template>
  </SplitButtonLayout>
</template>
```

:::

### 自定义弹层

按钮需要打开卡片等其他内容时，使用 `#popup`。它接收 `{ anchor, open, close, popupId }`，插槽渲染在与尾随按钮对应的定位容器中，因此绝对定位的弹层可用 `inset-block-start: calc(100% + 4px); inset-inline-start: 0` 展开到按钮下方。插槽内容自行决定最终位置、语义和交互。使用 `popupId` 连接 `aria-controls`，用 `popupRole` 指明弹层类型。菜单优先使用内置 `items`。

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonPopupExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonPopupExample.vue{vue}

:::

## 行为与无障碍

### 键盘

- Tab 在两个按钮之间移动；Space 或 Enter 激活当前聚焦的按钮。
- 只有主按钮发出 `click`；尾随按钮打开和关闭菜单或弹层。
- 由 `items` 打开的菜单遵循 [Menu](/zh/components/menu) 的键盘行为：方向键在项目间移动，Space 或 Enter 选择，Escape 关闭菜单。
- Space 与 Enter 只激活聚焦的按钮，因此禁用其中一个按钮不会影响另一个。

### 焦点与关闭

- 焦点应先落在主按钮，再移到尾随按钮；具体取决于操作系统设置。
- 选择菜单项或按 Escape 后，焦点返回尾随按钮。
- 点击菜单外部、聚焦页面其他控件或按 Escape 都会关闭 `items` 菜单。
- 自定义 `#popup` 会收到 `close()`，并自行负责关闭、语义和键盘处理。声明 `role="menu"` 的弹层必须实现菜单焦点、键盘导航和关闭行为。

### 响应式与 RTL

- Split buttons 提供五档推荐尺寸，与按钮、图标按钮提供的尺寸一致。在大断点中放大 split button，或在较小窗口中用它强调重点。
- 在从右到左的语言中，组件布局会镜像。
- 尺寸可与相邻控件不同：同一操作区可以混合较大的重点控件与较小的次要控件。

### 状态归属

- `v-model:open` 管理菜单或弹层的显隐，也可从组件外部设置。
- 菜单生命周期与选择事件会转发：`beforetoggle`、`toggle`、`beforeselect`、`select`。
- 主按钮与尾随按钮可分别通过 `primaryDisabled`、`menuDisabled` 禁用；`disabled` 同时禁用二者，并关闭已打开的菜单。

## API

### 导出

`SplitButton`、`SplitButtonLayout`、`SplitButtonLeadingButton`、`SplitButtonTrailingButton`，以及 `MenuItem`、`ButtonSize`、`ButtonShape`、`SplitButtonVariant` 类型。

### `SplitButton`

| 属性              | 类型                                                            | 默认值                            | 说明                                             |
| ----------------- | --------------------------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| `label`           | `string`                                                        | —                                 | 默认插槽为空时的主按钮文字。                     |
| `items`           | `MenuItem[]`                                                    | —                                 | 尾随按钮打开的菜单项；使用内置 Menu。            |
| `variant`         | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'`        | `'filled'`                        | 两个按钮共享的颜色角色。                         |
| `size`            | `ButtonSize`                                                    | `'small'`                         | 两个按钮的尺寸：`extra-small` 到 `extra-large`。 |
| `shape`           | `'round' \| 'square'`                                           | `'round'`                         | 组合的外侧形状；`square` 为项目扩展。            |
| `menuLabel`       | `string`                                                        | 本地化的 `"<label> options"`      | 菜单的可访问名称。                               |
| `menuButtonLabel` | `string`                                                        | 本地化的 `"More <label> options"` | 尾随按钮的可访问名称。                           |
| `groupLabel`      | `string`                                                        | —                                 | `role="group"` 容器的可访问名称。                |
| `positionX`       | `'before' \| 'after'`                                           | `'after'`                         | 首选菜单对齐边。                                 |
| `positionY`       | `'above' \| 'below'`                                            | `'below'`                         | 首选菜单方向。                                   |
| `disabled`        | `boolean`                                                       | `false`                           | 禁用两个按钮，并关闭已打开的菜单。               |
| `primaryDisabled` | `boolean`                                                       | `false`                           | 仅禁用主按钮。                                   |
| `menuDisabled`    | `boolean`                                                       | `false`                           | 仅禁用尾随按钮。                                 |
| `popupId`         | `string`                                                        | 自动生成                          | 自定义弹层的 ID，也用于 `aria-controls`。        |
| `popupRole`       | `'menu' \| 'dialog' \| 'listbox' \| 'tree' \| 'grid' \| 'true'` | `'true'`                          | 自定义弹层的 `aria-haspopup` 值。                |
| `locale`          | `string`                                                        | 先 provider，再 `en-US`           | 生成的可访问名称所用语言。                       |
| `open`            | `v-model:open: boolean`                                         | `false`                           | 菜单或弹层的显隐。                               |

| 事件           | 载荷                                                                                | 说明                            |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| `click`        | `(event: MouseEvent)`                                                               | 主按钮被激活。                  |
| `beforetoggle` | `(event: CustomEvent<{ open: boolean }>)`                                           | 转发自 Menu，在显隐变化前触发。 |
| `toggle`       | `(event: CustomEvent<{ open: boolean }>)`                                           | 转发自 Menu，在显隐变化后触发。 |
| `beforeselect` | `(item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>)` | 转发自 Menu，在选择前触发。     |
| `select`       | `(item: MenuItem, event: CustomEvent<{ item: MenuItem; sourceEvent: MouseEvent }>)` | 转发自 Menu，在选择后触发。     |

| 插槽        | 作用域                             | 说明                               |
| ----------- | ---------------------------------- | ---------------------------------- |
| 默认插槽    | —                                  | 主按钮内容；`label` 作为回退。     |
| `icon`      | —                                  | 主按钮图标。                       |
| `menu-icon` | `{ item: MenuItem }`               | 内置菜单中各项目的前置图标。       |
| `popup`     | `{ anchor, open, close, popupId }` | 渲染在尾随按钮旁的自定义弹层内容。 |

::: details 方法

| 方法                  | 说明                                    |
| --------------------- | --------------------------------------- |
| `show(anchor?)`       | 打开菜单或弹层，可指定锚点元素。        |
| `hide(restoreFocus?)` | 关闭菜单或弹层，可选择恢复焦点。        |
| `toggle(target?)`     | 通过元素或点击事件目标切换菜单或弹层。  |
| `root`                | 布局根 `HTMLElement`，挂载前为 `null`。 |

:::

### `SplitButtonLayout`

| 属性      | 类型                                                     | 默认值     | 说明                       |
| --------- | -------------------------------------------------------- | ---------- | -------------------------- |
| `variant` | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'` | `'filled'` | 传给内部按钮上下文的变体。 |
| `size`    | `ButtonSize`                                             | `'small'`  | 决定内侧圆角与间距的尺寸。 |
| `shape`   | `'round' \| 'square'`                                    | `'round'`  | 组合的外侧形状。           |
| `spacing` | `string`                                                 | `'2px'`    | 两个按钮之间的间距。       |

| 插槽       | 说明         |
| ---------- | ------------ |
| `leading`  | 主按钮控件。 |
| `trailing` | 尾随控件。   |

布局渲染 `role="group"`，并把其他属性（包括 `class`、`style`、`aria-label`）转发到该根元素。它向按钮子组件提供 `variant`、`size`、`shape`，并暴露 `root`。

### `SplitButtonLeadingButton`

| 属性       | 类型                                                     | 默认值   | 说明             |
| ---------- | -------------------------------------------------------- | -------- | ---------------- |
| `variant`  | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'` | 继承布局 | 覆盖布局的变体。 |
| `size`     | `ButtonSize`                                             | 继承布局 | 覆盖布局的尺寸。 |
| `shape`    | `'round' \| 'square'`                                    | 继承布局 | 覆盖布局的形状。 |
| `disabled` | `boolean`                                                | `false`  | 禁用按钮。       |

| 插槽            | 说明                   |
| --------------- | ---------------------- |
| 默认插槽        | 按钮标签。             |
| `icon`          | 前置图标。             |
| `trailing-icon` | 标签区域内的尾随图标。 |

它发出 `click`，并把原生按钮属性、表单属性或 `href` 转发给底层 Button。没有布局上下文时，默认值为 `filled`、`small`、`round`。

### `SplitButtonTrailingButton`

| 属性       | 类型                                                     | 默认值      | 说明                                 |
| ---------- | -------------------------------------------------------- | ----------- | ------------------------------------ |
| `variant`  | `'elevated' \| 'filled' \| 'filled-tonal' \| 'outlined'` | 继承布局    | 覆盖布局的变体。                     |
| `size`     | `ButtonSize`                                             | 继承布局    | 覆盖布局的尺寸。                     |
| `shape`    | `'round' \| 'square'`                                    | 继承布局    | 覆盖布局的形状。                     |
| `width`    | `'narrow' \| 'default' \| 'wide'`                        | `'default'` | 图标按钮宽度。                       |
| `disabled` | `boolean`                                                | `false`     | 禁用按钮。                           |
| `checked`  | `v-model:checked: boolean`                               | `false`     | 展开状态，同时驱动 `aria-expanded`。 |

它渲染展开/收起图标，在 `checked` 为 true 时将该图标居中，并把其他属性转发给底层 IconButton。没有布局上下文时，默认值为 `filled`、`small`、`round`、`default`。

## 样式

内侧圆角与按钮间距来自布局和 `size`；Material 间距为 2px，手动组合时可用 `spacing` 覆盖。颜色、状态层和动效由组件 token 管理，因此这里不提供公共样式钩子。

## Material 参考

[Split buttons 概览](https://m3.material.io/components/split-button/overview) · [指南](https://m3.material.io/components/split-button/guidelines) · [规格](https://m3.material.io/components/split-button/specs) · [无障碍](https://m3.material.io/components/split-button/accessibility)
