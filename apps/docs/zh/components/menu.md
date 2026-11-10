<script setup lang="ts">
import MenuExample from '../../components/demos/MenuExample.vue'
import MenuFieldsExample from '../../components/demos/MenuFieldsExample.vue'
</script>

# Menus

Menu 在临时表面上显示一组选项。菜单可以从多种控件打开，包括图标按钮和文本框。菜单应与触发器保持关联；需要持续可见的操作应采用其他模式。

## 示例

### 菜单与选择

演示组合了显式操作、复选项、单选项、子菜单、链接和分组表面。可使用控件切换颜色、紧凑间距、定位和方向，并通过 `show(anchor)` 打开上下文菜单。分组菜单使用项目 gap 分隔表面；Web 下拉菜单优先使用 divider。

<div class="vp-raw yam3x-doc-demo-theme"><MenuExample /></div>

::: details 查看演示源码

<<< ../../components/demos/MenuExample.vue{vue}

:::

### 菜单项构成

菜单项可以显示前置图标、辅助文本、徽标、尾部文本或快捷键，以及尾部图标。禁用项仍可获得焦点，便于键盘用户了解其内容。

<div class="vp-raw yam3x-doc-demo-theme"><MenuFieldsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/MenuFieldsExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入：

```vue
<script setup lang="ts">
import { Menu, type MenuItem } from './components/yam3x/menu'

const items: MenuItem[] = [
  { value: 'open', label: '打开' },
  { value: 'favorite', label: '收藏', type: 'checkbox' },
  { value: 'more', label: '更多', items: [{ value: 'share', label: '共享' }] },
]
</script>

<template>
  <Menu
    :items="items"
    label="文件操作"
  />
</template>
```

::: details 上下文菜单、分组菜单项和自定义触发器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from './components/yam3x/menu'

const menu = ref<InstanceType<typeof Menu> | null>(null)
const items: MenuItem[] = [
  { value: 'rename', label: '重命名', leadingIcon: true },
  { value: 'group-gap', type: 'gap' },
  { value: 'export', label: '导出', trailingIcon: true },
  { value: 'divider-1', type: 'divider' },
  { value: 'delete', label: '删除' },
]
</script>

<template>
  <button
    type="button"
    @click="menu?.show($event.currentTarget as HTMLElement)"
  >
    打开上下文菜单
  </button>
  <Menu
    ref="menu"
    :items="items"
    label="图层操作"
  >
    <template #trigger="{ triggerProps }">
      <button
        v-bind="triggerProps"
        type="button"
      >
        选择图层操作
      </button>
    </template>
  </Menu>
</template>
```

:::

## 行为与无障碍

### 选择

- 菜单发出可取消的 `beforetoggle` 和 `beforeselect` 事件，以及 `toggle`、`select` 事件；可在前置事件上调用 `preventDefault()` 阻止开合或选择。
- 复选项将各值保存到 `v-model:checked`，选择后菜单保持打开。
- 单选项按菜单项的 `group` 名称保存每组已选值到 `v-model:selected`，选择后关闭菜单。
- 操作项和链接激活后关闭菜单；子菜单激活会打开其嵌套菜单。
- 链接项保留原生导航，并遵循 `target`、`rel` 和 `download`。
- 禁用项可以获得焦点，但不能激活。

### 键盘与子菜单

- 打开菜单后焦点移到首项。在触发器上按方向键下或上会从首项或末项打开。
- 方向键会在启用和禁用的操作项之间循环。Home 和 End 跳到首项或末项，字符键按标签检索。
- 在子菜单中，从左到右布局按方向键右打开下一级，从右到左布局按方向键左打开。相反方向键返回父菜单，Escape 逐级关闭并恢复焦点。
- Tab 关闭菜单并按文档顺序移动焦点。Escape 与外部点击也会关闭菜单。

### 分组与间距

- 使用 `{ value: 'divider-1', type: 'divider' }` 或 `{ value: 'gap-1', type: 'gap' }` 分隔分组；每项都需要唯一的 `value`。
- 项目定义的 gap 将分组显示为独立表面；菜单滚动时，gap 会转为分隔线。
- `{ type: 'label' }` 添加仅用于呈现的分组标题。
- 菜单项的 `leadingIcon` 与 `trailingIcon` 可在图标插槽按项条件渲染时保留对应的 20px 空间。未提供图标插槽时，普通菜单项不会留下空图标槽。

### 定位与 RTL

- `position-x` 与 `position-y` 设置首选展开方向。浮层会在窗口边缘自动翻转和移动，过渡会从靠近触发控件的一侧展开。
- 子菜单在父项旁边打开，并跟随菜单的书写方向。
- `dense` 减少容器纵向内边距，不改变菜单项标签或角色。
- 内容超过最大高度时菜单会滚动，并保持焦点项可见。

## API

### 导出

| 导出                                                                        | 说明                         |
| --------------------------------------------------------------------------- | ---------------------------- |
| `Menu`                                                                      | 触发器、浮层和选择行为。     |
| `MenuItem`、`MenuItemType`、`MenuVariant`、`MenuPositionX`、`MenuPositionY` | 菜单项和属性使用的类型导出。 |

### `Menu` 属性与模型

| 属性 / 模型    | 类型                                       | 默认值                     | 说明                                     |
| -------------- | ------------------------------------------ | -------------------------- | ---------------------------------------- |
| `items`        | `MenuItem[]`                               | 必填                       | 菜单定义；每项都需要唯一的 `value`。     |
| `label`        | `string`                                   | 本地化 `Options`           | 菜单浮层的可访问名称。                   |
| `triggerLabel` | `string`                                   | 本地化 `Open menu`         | 内置触发器的可访问名称。                 |
| `variant`      | `'standard' \| 'vibrant'`                  | `'standard'`               | 颜色映射；`vibrant` 使用 tertiary 角色。 |
| `dense`        | `boolean`                                  | `false`                    | 减少容器纵向内边距。                     |
| `positionX`    | `'before' \| 'after'`                      | `'after'`                  | 相对触发器的首选水平展开方向。           |
| `positionY`    | `'above' \| 'below'`                       | `'below'`                  | 相对触发器的首选垂直展开方向。           |
| `locale`       | `string`                                   | Provider，再回退到 `en-US` | 覆盖内置界面标签的语言。                 |
| `open`         | `v-model:open: boolean`                    | `false`                    | 控制显示状态。                           |
| `checked`      | `v-model:checked: string[]`                | `[]`                       | 已选复选项的值。                         |
| `selected`     | `v-model:selected: Record<string, string>` | `{}`                       | 以组名称为键的单选值。                   |

内置标签继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置；标签属性优先于对应的共享默认文案。

### `Menu` 事件

| 事件           | 载荷                                                          | 说明                                     |
| -------------- | ------------------------------------------------------------- | ---------------------------------------- |
| `beforetoggle` | `CustomEvent<{ open: boolean }>`                              | 可取消。菜单打开或关闭前触发。           |
| `toggle`       | `CustomEvent<{ open: boolean }>`                              | 菜单打开或关闭后触发。                   |
| `beforeselect` | `(item: MenuItem, event: CustomEvent<{ item, sourceEvent }>)` | 可取消。菜单项被选择前触发。             |
| `select`       | `(item: MenuItem, event: CustomEvent<{ item, sourceEvent }>)` | 菜单项被选择后触发，包括复选和单选变化。 |

### `Menu` 插槽

| 插槽            | 属性                             | 说明                                                  |
| --------------- | -------------------------------- | ----------------------------------------------------- |
| `trigger`       | `{ open, toggle, triggerProps }` | 替换内置触发器。绑定 `triggerProps` 或调用 `toggle`。 |
| `icon`          | `{ item }`                       | 为保留前置槽的菜单项提供前置图标内容。                |
| `trailing-icon` | `{ item }`                       | 为保留尾部槽的菜单项提供尾部图标内容。                |

### `Menu` 方法

通过模板 ref 访问。组件还暴露 `root`，即其宿主元素。

| 方法              | 返回   | 说明                                               |
| ----------------- | ------ | -------------------------------------------------- |
| `show(anchor?)`   | `void` | 以 `anchor` 为锚点打开菜单；省略时使用内置触发器。 |
| `hide()`          | `void` | 关闭菜单，不恢复焦点。                             |
| `toggle(anchor?)` | `void` | 切换 `anchor` 或内置触发器的菜单显示状态。         |

### `MenuItem` 结构

| 字段             | 类型                                                                            | 适用项               | 说明                                       |
| ---------------- | ------------------------------------------------------------------------------- | -------------------- | ------------------------------------------ |
| `value`          | `string`                                                                        | 所有项               | 必填的唯一标识，供模型和事件使用。         |
| `type`           | `'item' \| 'checkbox' \| 'radio' \| 'submenu' \| 'divider' \| 'label' \| 'gap'` | 所有项               | 默认为 `item`。                            |
| `label`          | `string`                                                                        | 操作项、子菜单、标题 | 可见文本；操作项、子菜单和标题项需要提供。 |
| `group`          | `string`                                                                        | 单选项               | 对单选项分组；默认为 `default`。           |
| `items`          | `MenuItem[]`                                                                    | 子菜单               | 嵌套菜单项；带 `items` 的项会成为子菜单。  |
| `href`           | `string`                                                                        | 末端操作项           | 渲染为链接而不是按钮。                     |
| `target`         | `string`                                                                        | 末端操作项           | 链接目标，随 `href` 透传。                 |
| `rel`            | `string`                                                                        | 末端操作项           | 链接关系，随 `href` 透传。                 |
| `download`       | `boolean \| string`                                                             | 末端操作项           | 链接下载属性，随 `href` 透传。             |
| `disabled`       | `boolean`                                                                       | 操作项、子菜单       | 保留焦点能力但阻止激活。                   |
| `supportingText` | `string`                                                                        | 操作项、子菜单       | 标签下方的辅助文本。                       |
| `trailingText`   | `string`                                                                        | 操作项、子菜单       | 尾部文本；优先于 `shortcut`。              |
| `badge`          | `string \| number`                                                              | 操作项、子菜单       | 尾部徽标内容。                             |
| `shortcut`       | `string`                                                                        | 操作项、子菜单       | 显示在尾部文本位置的快捷键提示。           |
| `leadingIcon`    | `boolean`                                                                       | 操作项、子菜单       | 保留 20px 前置图标槽。                     |
| `trailingIcon`   | `boolean`                                                                       | 末端操作项           | 保留 20px 尾部图标槽。                     |

## 样式

在 `Menu` 根元素上设置这些属性。`variant="vibrant"` 使用自身的颜色映射；运行时定位和滚动上限由组件内部管理。Material 定义组件角色与尺寸；这些 CSS 属性名和覆盖行为属于项目 API。

::: details CSS 覆盖项

| 属性                                     | 默认值                  | 说明                         |
| ---------------------------------------- | ----------------------- | ---------------------------- |
| `--yam3x-menu-container-min-width`       | `112px`                 | 浮层最小宽度。               |
| `--yam3x-menu-container-max-height`      | `280px`，并受视口限制   | 滚动前的浮层最大高度。       |
| `--yam3x-menu-container-padding-block`   | `2px`                   | 菜单项列表周围的纵向内边距。 |
| `--yam3x-menu-container-shape`           | System large 圆角       | 浮层圆角。                   |
| `--yam3x-menu-active-container-shape`    | System large 圆角       | 活动菜单表面的圆角。         |
| `--yam3x-menu-inactive-container-shape`  | System small 圆角       | 非活动分组表面的圆角。       |
| `--yam3x-menu-item-container-height`     | `44px`                  | 菜单项最小高度。             |
| `--yam3x-menu-item-icon-label-space`     | `12px`                  | 前置图标与标签之间的间距。   |
| `--yam3x-menu-item-shape`                | System extra-small 圆角 | 菜单项圆角。                 |
| `--yam3x-menu-item-focus-ring-shape`     | 继承菜单项 shape        | 焦点环圆角。                 |
| `--yam3x-menu-item-label-text-font-size` | System `label-large`    | 菜单项标签字号。             |

:::

## Material 参考

[Menus 概览](https://m3.material.io/components/menus/overview) · [指南](https://m3.material.io/components/menus/guidelines) · [规格](https://m3.material.io/components/menus/specs) · [无障碍](https://m3.material.io/components/menus/accessibility)
