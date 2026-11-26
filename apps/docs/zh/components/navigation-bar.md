<script setup lang="ts">
import NavigationBarExample from '../../components/demos/NavigationBarExample.vue'
import NavigationBarNavigateExample from '../../components/demos/NavigationBarNavigateExample.vue'
import NavigationBarStatesExample from '../../components/demos/NavigationBarStatesExample.vue'
</script>

# Navigation bar

Navigation bar 让人们在较小的设备上切换界面视图，是手持屏幕中常见的导航组件。

`NavigationBar` 渲染带原生链接的导航地标，用于 compact 与 medium 窗口；更宽的布局应使用 [Navigation rail](/zh/components/navigation-rail)。

## 示例

### 基础

Navigation bar 可包含三到五个目的地。此演示在 840px 切换为 navigation rail，并且不会同时渲染两种导航控件。

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/NavigationBarExample.vue{vue}

:::

### 状态

`disabled` 会将项目移出顺序键盘焦点。`disabledInteractive` 保留可聚焦能力以便用户发现，但仍保持禁用语义；两种状态都不会导航或改变选择。

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarStatesExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/NavigationBarStatesExample.vue{vue}

:::

### 取消导航

`navigate` 在 `v-model` 更新之前触发。在其事件上调用 `preventDefault()` 会同时取消选择更新和原生链接导航。

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarNavigateExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/NavigationBarNavigateExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationBar, NavigationBarItem } from './components/yam3x/navigation-bar'
import { Icon } from './components/yam3x/icon'

const current = ref('home')

function guardNavigation(destination: { value: string }, event: MouseEvent) {
  if (destination.value === 'saved') event.preventDefault()
}
</script>

<template>
  <NavigationBar
    v-model="current"
    label="主导航"
    @navigate="guardNavigation"
  >
    <NavigationBarItem
      value="home"
      label="首页"
      href="/"
    >
      <template #icon="{ selected }">
        <Icon
          name="home"
          :filled="selected"
        />
      </template>
    </NavigationBarItem>
    <NavigationBarItem
      value="saved"
      label="收藏"
      href="/saved"
    >
      <template #icon="{ selected }">
        <Icon
          name="bookmark"
          :filled="selected"
        />
      </template>
    </NavigationBarItem>
  </NavigationBar>
</template>
```

## 行为与无障碍

### 键盘

- Enter 与 Space 都会激活链接；Space 不会滚动页面。
- Tab 按顺序到达每个启用项。`disabled` 项会被跳过；`disabledInteractive` 项仍保留在 Tab 顺序中。
- 修饰键点击与鼠标中键保留原生链接行为，且不会改变当前选择。

### 焦点与激活

- 选中项使用 `aria-current="page"`、加粗标签，以及你提供的填充图标或 `#selected-icon`。
- 禁用项渲染 `aria-disabled="true"`，省略 `href`、`target`、`rel` 和 `download`，且无法激活。
- 修饰键点击、非主键点击或已被阻止的事件不会发出 `navigate`；此时 `v-model` 也不会改变。

### 响应式与 RTL

- `layout="auto"` 在视口宽度达到 600px 时由垂直项目切换为水平项目。该断点是项目决策，并非 Material 官方断点。
- 水平项使用固定 144px 宽度；溢出时导航栏横向滚动，`safe center` 保持起始边可达。
- `fitHorizontal` 是面向五个目的地中等宽度栏的项目扩展。它允许水平项收缩到 48px 行内尺寸，并让标签换行，而不是强制横向滚动。Material Expressive 导航栏规定水平项固定宽度，因此需要严格对齐官方时不要开启。
- 标签保持完整可见，并可在 2× 缩放下换行。导航栏纵向增长，不截断标签。
- 图标、标签和徽标会随文档方向镜像；组件不会根据 `dir` 切换布局。

### 状态所有权

- `v-model` 拥有当前目的地，并应与路由保持同步。
- 每个项目的 `href` 执行原生导航。路由变化时，由路由器或路由侦听器更新模型。
- 页面决定何时用 navigation rail 替换导航栏；两个组件不会自动互相切换。

## API

### 导出

`NavigationBar`、`NavigationBarItem`、`NavigationBarDestination` 和 `NavigationBarLayout`。

### `NavigationBar`

| 属性            | 类型                                   | 默认值   | 说明                                                             |
| --------------- | -------------------------------------- | -------- | ---------------------------------------------------------------- |
| `label`         | `string`                               | 必填     | 导航地标的可访问名称。                                           |
| `layout`        | `'vertical' \| 'horizontal' \| 'auto'` | `'auto'` | 项目排列方式；`auto` 在 600px 视口切换为水平。                   |
| `fitHorizontal` | `boolean`                              | `false`  | 允许水平项收缩到 48px 并换行。项目扩展；官方水平项使用固定宽度。 |
| `modelValue`    | `string`（`v-model`）                  | `''`     | 当前目的地的 `value`。                                           |

### `NavigationBarItem`

| 属性                  | 类型                | 默认值  | 说明                                                |
| --------------------- | ------------------- | ------- | --------------------------------------------------- |
| `value`               | `string`            | 必填    | 稳定唯一的目的地值。                                |
| `label`               | `string`            | 必填    | 可见目的地标签。                                    |
| `href`                | `string`            | 必填    | 原生目的地 URL。                                    |
| `ariaLabel`           | `string`            | —       | 可见标签含义需要补充时使用的可访问名称。            |
| `disabled`            | `boolean`           | `false` | 禁止导航并移出顺序键盘焦点。                        |
| `disabledInteractive` | `boolean`           | `false` | 显示禁用语义但保留 Tab 焦点；不导航、不改变选择。   |
| `target`              | `string`            | —       | 原生链接目标；禁用或 disabledInteractive 项不渲染。 |
| `rel`                 | `string`            | —       | 原生链接关系；禁用或 disabledInteractive 项不渲染。 |
| `download`            | `boolean \| string` | —       | 原生下载属性；禁用或 disabledInteractive 项不渲染。 |

### 事件

| 事件       | 载荷                                                         | 说明                                                             |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `navigate` | `(destination: NavigationBarDestination, event: MouseEvent)` | 在模型更新前发出；调用 `preventDefault()` 会取消选择和原生导航。 |

`NavigationBarItem` 不发出组件事件；`click` 等原生侦听器会透传到其锚点元素。

### 插槽

| 组件                | 插槽            | 属性                    | 说明                                       |
| ------------------- | --------------- | ----------------------- | ------------------------------------------ |
| `NavigationBar`     | `default`       | —                       | `NavigationBarItem` 子项。                 |
| `NavigationBarItem` | `icon`          | `{ selected: boolean }` | 目的地图标；可用 `selected` 渲染填充变体。 |
| `NavigationBarItem` | `selected-icon` | —                       | 选中时替代 `icon`。                        |
| `NavigationBarItem` | `badge`         | `{ selected: boolean }` | 位于图标旁的点状或计数徽标。               |

### 方法

`NavigationBar` 与 `NavigationBarItem` 不暴露公开方法。

## 样式

组件没有公开的专用 CSS 自定义属性。颜色、形状、排版和状态层遵循 System token；请通过主题全局修改。需要一次性调整布局时，可为导航栏或项目传入 class。

## Material 参考

[Navigation bar 概览](https://m3.material.io/components/navigation-bar/overview) · [指南](https://m3.material.io/components/navigation-bar/guidelines) · [规格](https://m3.material.io/components/navigation-bar/specs) · [无障碍](https://m3.material.io/components/navigation-bar/accessibility)
