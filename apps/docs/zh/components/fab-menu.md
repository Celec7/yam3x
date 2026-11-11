<script setup lang="ts">
import FabMenuExample from '../../components/demos/FabMenuExample.vue'
import FabMenuCompositionExample from '../../components/demos/FabMenuCompositionExample.vue'
</script>

# FAB menu

浮动操作按钮（FAB）菜单从 FAB 打开，用于显示多个相关操作。

需要数据驱动的操作列表时使用 `FabMenu`；需要直接控制触发器或项目内容时，用 `FloatingActionButtonMenu` 组合 `FloatingActionButtonMenuItem` 与 `ToggleFloatingActionButton`。FAB 菜单从 FAB 打开，在屏幕上浮动显示 2–6 个相关操作。FAB 菜单不用于 extended FAB，并提供 primary、secondary、tertiary 三组颜色。

## 示例

### 基础

`FabMenu` 渲染标准触发器，并管理展开状态、定位、焦点和键盘导航。所有尺寸的 FAB 共用一种 FAB 菜单尺寸；菜单不提供 extended FAB 尺寸。

<div class="vp-raw yam3x-doc-demo-theme">
  <FabMenuExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/FabMenuExample.vue{vue}

:::

### 组合

组合 API 暴露触发插槽、展开模型，以及公开的 `open`、`close`、`toggle` 方法。此演示还展示禁用组合菜单以及外部打开、关闭控件。

<div class="vp-raw yam3x-doc-demo-theme">
  <FabMenuCompositionExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/FabMenuCompositionExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { FabMenu, type FabMenuItem } from './components/yam3x/fab-menu'

const actions: FabMenuItem[] = [
  { value: 'camera', label: '拍摄照片' },
  { value: 'upload', label: '上传文件' },
]
</script>

<template>
  <FabMenu
    :items="actions"
    label="创建操作"
    trigger-label="创建"
  />
</template>
```

::: details 组合用法

将 `triggerProps` 绑定到触发器，以获得菜单语义和键盘行为。`FloatingActionButtonMenu` 不会在 `triggerProps` 中加入点击处理；请通过 `v-model:checked` 与 `ToggleFloatingActionButton` 共享模型，或在使用其他触发器时调用 `toggle`。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ToggleFloatingActionButton } from './components/yam3x/fab'
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from './components/yam3x/fab-menu'

const expanded = ref(false)
</script>

<template>
  <FloatingActionButtonMenu
    v-model:expanded="expanded"
    label="创建操作"
  >
    <template #trigger="{ triggerProps }">
      <ToggleFloatingActionButton
        v-bind="triggerProps"
        v-model:checked="expanded"
        aria-label="创建"
      />
    </template>
    <FloatingActionButtonMenuItem
      value="camera"
      label="拍摄照片"
    />
    <FloatingActionButtonMenuItem
      value="upload"
      label="上传文件"
    />
  </FloatingActionButtonMenu>
</template>
```

:::

## 行为与无障碍

### 键盘

- Tab 可到达触发器。Enter 或 Space 会切换菜单。
- 菜单关闭时，在触发器上按 Arrow Down 或 Arrow Up 会打开菜单，并移到第一个或最后一个启用操作。
- 菜单打开时，Arrow Down 与 Arrow Up 在启用操作间移动并循环；Home 与 End 跳到首尾启用操作。
- Escape 关闭菜单，并将焦点恢复到触发器。
- Tab 关闭菜单，并按页面顺序继续。
- 禁用操作保持可见，但会被焦点跳过且无法激活。
- 激活启用操作会发出 `select`、关闭菜单，并将焦点恢复到触发器。

### 焦点与关闭

- 打开后焦点保留在触发器。
- 点击触发器与浮层之外的区域会关闭菜单。
- `FabMenu` 在改变状态前于根元素派发可取消的 `beforetoggle` DOM 事件。`FloatingActionButtonMenu` 发出 `beforetoggle`，并提供 `open`、`close`、`toggle`。
- `beforeselect` 可取消；调用 `preventDefault()` 会保持菜单打开。
- 禁用菜单会关闭且无法打开；调用 `close()` 仍然安全。

### 定位与响应式

- 胶囊堆叠默认向上打开。仅当上方放不下两个操作且下方有空间时向下打开；恰好能放下两个操作时保持向上。页面滚动时会重新计算定位。
- `presentation` 选择 `pill-stack` 或 `web-menu`。这是项目决策；布局不会按视口尺寸自动切换。
- `horizontal-alignment` 默认为 `end`；`start` 与 `center` 是项目定位选项。
- 浮层会传送到 `body`，随文档方向镜像，并从最近的 `[data-theme]` 祖先读取 System token。
- 操作列表会在可用空间内滚动，不会遮挡触发器。

### 状态所有权

- `v-model:expanded` 是状态来源。`FabMenu` 还可通过公开方法打开和关闭。
- `FloatingActionButtonMenuItem.selected` 是项目扩展，由调用者控制。它仅在 `web-menu` 中显示 baseline Menu 选中外观，不会改变激活或关闭行为。
- 禁用操作是项目扩展。两种 API 中它们都保持可见、使用相同的弱化容器与内容样式，并被键盘导航跳过。Material 的 FAB menu API 不定义禁用操作。
- 原生 `href`、`target`、`rel` 与 `download` 会渲染为链接。禁用项会省略链接且无法激活。
- 触发器的颜色 variant 应与菜单的 `variant` 匹配。

## API

### 导出

`FabMenu`、`FloatingActionButtonMenu`、`FloatingActionButtonMenuItem`，以及类型 `FabMenuItem`、`FabMenuVariant`、`FabMenuPresentation`、`FabMenuHorizontalAlignment`、`FabMenuTriggerSize` 和 `FabMenuSelectionSource`。标准触发器是从 FAB 入口导出的 `ToggleFloatingActionButton`。

### 属性与模型

`FabMenu` 与 `FloatingActionButtonMenu` 的内置界面文案继承 [LocaleProvider](/zh/components/localization) 的 `actions` 命名空间。`locale` 覆盖 provider 语言，并回退到 `en-US`；`label` 与 `triggerLabel` 优先于共享默认文案。

#### `FabMenu`

| 属性                  | 类型                                     | 默认值         | 说明                                         |
| --------------------- | ---------------------------------------- | -------------- | -------------------------------------------- |
| `items`               | `FabMenuItem[]`                          | 必填           | 菜单中的操作与链接。                         |
| `label`               | `string`                                 | LocaleProvider | 菜单的可访问名称。                           |
| `triggerLabel`        | `string`                                 | LocaleProvider | 默认触发器的可访问名称。                     |
| `variant`             | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'`    | 触发器与胶囊堆叠项目的颜色组。               |
| `presentation`        | `'pill-stack' \| 'web-menu'`             | `'pill-stack'` | 操作列表的项目呈现方式。                     |
| `horizontalAlignment` | `'start' \| 'center' \| 'end'`           | `'end'`        | 浮层相对触发器的对齐方式。                   |
| `triggerSize`         | `'default' \| 'medium' \| 'large'`       | `'medium'`     | 默认触发器 FAB 的尺寸。                      |
| `disabled`            | `boolean`                                | `false`        | 禁用触发器、关闭菜单并阻止打开。             |
| `locale`              | `string`                                 | Provider       | 覆盖 LocaleProvider 语言，再回退到 `en-US`。 |
| `expanded`            | `boolean`（`v-model:expanded`）          | `false`        | 展开状态。                                   |

#### `FabMenuItem`

| 字段       | 类型                | 默认值  | 说明                                    |
| ---------- | ------------------- | ------- | --------------------------------------- |
| `value`    | `string`            | 必填    | 稳定唯一的操作值。                      |
| `label`    | `string`            | 必填    | 可见操作标签。                          |
| `disabled` | `boolean`           | `false` | 保持可见，但阻止激活与聚焦。            |
| `selected` | `boolean`           | `false` | `web-menu` 中的选中外观；由调用者控制。 |
| `href`     | `string`            | —       | 使用原生链接 URL 代替按钮操作。         |
| `target`   | `string`            | —       | 原生链接目标。                          |
| `rel`      | `string`            | —       | 原生链接关系。                          |
| `download` | `boolean \| string` | —       | 原生下载属性。                          |

#### `FloatingActionButtonMenu`

| 属性                  | 类型                                     | 默认值         | 说明                                         |
| --------------------- | ---------------------------------------- | -------------- | -------------------------------------------- |
| `label`               | `string`                                 | LocaleProvider | 菜单的可访问名称。                           |
| `variant`             | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'`    | 传给浮层与项目的颜色组。                     |
| `presentation`        | `'pill-stack' \| 'web-menu'`             | `'pill-stack'` | 插槽项目的项目呈现方式。                     |
| `horizontalAlignment` | `'start' \| 'center' \| 'end'`           | `'end'`        | 浮层相对触发器的对齐方式。                   |
| `disabled`            | `boolean`                                | `false`        | 关闭菜单并阻止打开。                         |
| `locale`              | `string`                                 | Provider       | 覆盖 LocaleProvider 语言，再回退到 `en-US`。 |
| `expanded`            | `boolean`（`v-model:expanded`）          | `false`        | 展开状态。                                   |

#### `FloatingActionButtonMenuItem`

| 属性       | 类型                | 默认值  | 说明                                    |
| ---------- | ------------------- | ------- | --------------------------------------- |
| `value`    | `string`            | 必填    | 稳定唯一的操作值。                      |
| `label`    | `string`            | 必填    | 可见操作标签及默认插槽内容。            |
| `disabled` | `boolean`           | `false` | 保持可见，但阻止激活与聚焦。            |
| `selected` | `boolean`           | `false` | `web-menu` 中的选中外观；由调用者控制。 |
| `href`     | `string`            | —       | 使用原生链接 URL 代替按钮操作。         |
| `target`   | `string`            | —       | 原生链接目标。                          |
| `rel`      | `string`            | —       | 原生链接关系。                          |
| `download` | `boolean \| string` | —       | 原生下载属性。                          |

#### `ToggleFloatingActionButton`

| 属性       | 类型                                     | 默认值      | 说明                           |
| ---------- | ---------------------------------------- | ----------- | ------------------------------ |
| `size`     | `'default' \| 'medium' \| 'large'`       | `'default'` | 关闭尺寸：56px、80px 或 96px。 |
| `variant`  | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | FAB 颜色组。                   |
| `disabled` | `boolean`                                | `false`     | 禁用触发器。                   |
| `type`     | `'button' \| 'submit' \| 'reset'`        | `'button'`  | 原生按钮类型。                 |
| `checked`  | `boolean`（`v-model:checked`）           | `false`     | 与菜单共享的展开状态。         |

### 事件

#### `FabMenu`

| 事件           | 载荷                                                        | 说明                                              |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `toggle`       | `{ expanded: boolean }`                                     | 展开状态已变化。                                  |
| `open`         | —                                                           | 菜单已打开。                                      |
| `close`        | —                                                           | 菜单已关闭。                                      |
| `beforeselect` | `(item: FabMenuItem, event: CustomEvent<{ item, source }>)` | 可取消的选择请求；`preventDefault()` 会保持打开。 |
| `select`       | `{ item: FabMenuItem, source: 'pointer' \| 'keyboard' }`    | 启用操作已被激活。                                |

#### `FloatingActionButtonMenu`

| 事件           | 载荷                                                                | 说明                 |
| -------------- | ------------------------------------------------------------------- | -------------------- |
| `beforetoggle` | `CustomEvent<{ expanded: boolean }>`                                | 可取消的可见性请求。 |
| `toggle`       | `{ expanded: boolean }`                                             | 展开状态已变化。     |
| `open`         | —                                                                   | 菜单已打开。         |
| `close`        | —                                                                   | 菜单已关闭。         |
| `select`       | `{ value: string, label: string, source: 'pointer' \| 'keyboard' }` | 启用项目已被激活。   |

#### `FloatingActionButtonMenuItem` 与 `ToggleFloatingActionButton`

| 组件                           | 事件    | 载荷         | 说明           |
| ------------------------------ | ------- | ------------ | -------------- |
| `FloatingActionButtonMenuItem` | `click` | `MouseEvent` | 项目被点击。   |
| `ToggleFloatingActionButton`   | `click` | `MouseEvent` | 触发器被点击。 |

### 插槽

#### `FabMenu`

| 插槽           | 属性                                           | 说明                                          |
| -------------- | ---------------------------------------------- | --------------------------------------------- |
| `trigger`      | `{ expanded, toggle, triggerProps, progress }` | 替换默认触发器；`triggerProps` 包含点击处理。 |
| `trigger-icon` | `{ expanded: boolean, progress: number }`      | 替换默认触发器图标与动画。                    |
| `icon`         | `{ item: FabMenuItem }`                        | 每个项目的前置图标。                          |
| `item`         | `{ item, expanded, activate, itemProps }`      | 替换项目内容。                                |

#### `FloatingActionButtonMenu`

| 插槽      | 属性                                              | 说明                                      |
| --------- | ------------------------------------------------- | ----------------------------------------- |
| `default` | —                                                 | `FloatingActionButtonMenuItem` 子项。     |
| `trigger` | `{ expanded, toggle, setExpanded, triggerProps }` | 必填触发器；`triggerProps` 不含点击处理。 |

#### `FloatingActionButtonMenuItem`

| 插槽      | 属性 | 说明           |
| --------- | ---- | -------------- |
| `default` | —    | 替换可见标签。 |
| `icon`    | —    | 前置图标。     |

#### `ToggleFloatingActionButton`

| 插槽   | 属性                                     | 说明                 |
| ------ | ---------------------------------------- | -------------------- |
| `icon` | `{ checked: boolean, progress: number }` | 替换加号与关闭图标。 |

### 方法

#### `FabMenu`

| 方法       | 说明           |
| ---------- | -------------- |
| `open()`   | 请求展开状态。 |
| `close()`  | 请求折叠状态。 |
| `toggle()` | 翻转展开状态。 |

#### `FloatingActionButtonMenu`

| 方法       | 说明           |
| ---------- | -------------- |
| `open()`   | 请求展开状态。 |
| `close()`  | 请求折叠状态。 |
| `toggle()` | 翻转展开状态。 |

#### `ToggleFloatingActionButton`

| 属性      | 说明                      |
| --------- | ------------------------- |
| `element` | 底层按钮元素，或 `null`。 |

## 样式

在菜单根元素上设置公开的 FAB 菜单属性。菜单会把它们复制到传送后的浮层与项目。

::: details 样式属性

| 区域               | 属性                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 菜单几何           | `--yam3x-fab-menu-spacing`、`--yam3x-fab-menu-max-width`                                                                                                                                                                                                                                                                                                                                                                                 |
| 项目表面           | `--yam3x-fab-menu-item-container-color`、`--yam3x-fab-menu-item-content-color`                                                                                                                                                                                                                                                                                                                                                           |
| Primary FAB 角色   | `--yam3x-primary-fab-color`、`--yam3x-primary-fab-container-color`、`--yam3x-primary-fab-hover-color`、`--yam3x-primary-fab-focus-color`、`--yam3x-primary-fab-ripple-color`                                                                                                                                                                                                                                                             |
| Secondary FAB 角色 | `--yam3x-secondary-fab-color`、`--yam3x-secondary-fab-container-color`、`--yam3x-secondary-fab-hover-color`、`--yam3x-secondary-fab-focus-color`、`--yam3x-secondary-fab-ripple-color`                                                                                                                                                                                                                                                   |
| Tertiary FAB 角色  | `--yam3x-tertiary-fab-color`、`--yam3x-tertiary-fab-container-color`、`--yam3x-tertiary-fab-hover-color`、`--yam3x-tertiary-fab-focus-color`、`--yam3x-tertiary-fab-ripple-color`                                                                                                                                                                                                                                                        |
| 项目尺寸           | `--yam3x-fab-menu-item-height`、`--yam3x-fab-menu-item-font-size`、`--yam3x-fab-menu-item-font-weight`、`--yam3x-fab-menu-item-line-height`、`--yam3x-fab-menu-item-tracking`、`--yam3x-fab-menu-item-shape`、`--yam3x-fab-menu-item-leading-space`、`--yam3x-fab-menu-item-trailing-space`、`--yam3x-fab-menu-item-top-space`、`--yam3x-fab-menu-item-bottom-space`、`--yam3x-fab-menu-item-spacing`、`--yam3x-fab-menu-item-icon-size` |
| 禁用操作           | `--yam3x-fab-menu-item-disabled-container-color`、`--yam3x-fab-menu-item-disabled-container-opacity`、`--yam3x-fab-menu-item-disabled-color`、`--yam3x-fab-menu-item-disabled-opacity`                                                                                                                                                                                                                                                   |

:::

## Material 参考

[FAB menu 概览](https://m3.material.io/components/fab-menu/overview) · [指南](https://m3.material.io/components/fab-menu/guidelines) · [规格](https://m3.material.io/components/fab-menu/specs) · [无障碍](https://m3.material.io/components/fab-menu/accessibility)
