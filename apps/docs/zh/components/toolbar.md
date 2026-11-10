<script setup lang="ts">
import ToolbarBasicExample from '../../components/demos/ToolbarBasicExample.vue'
import ToolbarGalleryExample from '../../components/demos/ToolbarGalleryExample.vue'
import ToolbarExample from '../../components/demos/ToolbarExample.vue'
</script>

# Toolbars

`Toolbar` 将适用于当前页面或所选内容的操作集中呈现。它是 Material 3 Expressive 工具栏，提供 floating 与 docked 布局、standard 与 vibrant 配色、圆角与方角形状，以及可选的纵向排列。

Floating 工具栏适合当前页面或所选内容的操作。Docked 工具栏适合跨页面保持一致的操作，并替代基线的 bottom app bar。应让最重要的操作保持可见，空间不足时把次要操作放入菜单。

## 示例

### 基础

Floating 工具栏将紧凑的操作组放在内容附近。此静态示例使用两个标准图标按钮；工具栏是一个横向的 `toolbar` 地标。

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ToolbarBasicExample.vue{vue}

:::

### 变体与形状

画廊展示 floating standard、floating vibrant、纵向方角，以及 docked 圆角工具栏。Docked 圆角从视口宽度 840 px 起显示；低于该宽度时 docked 保持方角。

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarGalleryExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ToolbarGalleryExample.vue{vue}

:::

### 布局与颜色控件

交互演示可切换布局、颜色、形状、阴影和纵向排列。点击操作会在预览下方报告，控件也展示了 floating 与 docked 默认值的差异。

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ToolbarExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件。请使用 `./components/yam3x/` 之类的调用方路径；演示源码中的 `@registry` 路径仅用于文档站点。

```vue
<script setup lang="ts">
import { Toolbar } from './components/yam3x/toolbar'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <Toolbar aria-label="文档操作">
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="撤销"
    >
      <Icon name="undo" />
    </IconButton>
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="重做"
    >
      <Icon name="redo" />
    </IconButton>
  </Toolbar>
</template>
```

为工具栏提供无障碍名称，并为每个子控件提供各自的名称。工具栏将属性转发到根元素，因此 `class`、`style`、`aria-label` 和 data 属性都会应用到工具栏元素。多个操作构成一个分段控件时，可在默认插槽中组合 [Button group](/zh/components/button-group)；工具栏本身只负责排列插槽控件。

::: details Docked 放置

```vue
<template>
  <div class="bottom-bar">
    <Toolbar
      layout="docked"
      aria-label="页面操作"
    >
      <IconButton
        variant="standard"
        style="color: var(--md-sys-color-primary)"
        aria-label="返回"
      >
        <Icon name="arrow_back" />
      </IconButton>
    </Toolbar>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  width: 100%;
}
</style>
```

:::

工具栏不自行定位。Floating 工具栏应保持在视口内；docked 工具栏应放在布局底部的全宽容器中。不要同时显示 docked 工具栏和 bottom navigation bar。

## 行为与无障碍

### 键盘

- 工具栏不使用 roving tab index：每个操作按文档顺序保留为 Tab 停靠点。
- 横向工具栏用左右方向键在操作间移动；纵向工具栏用上下方向键。Home 与 End 移到首个和末个操作，方向移动会循环。
- RTL 会反转水平方向键，同时保持视觉顺序有意义。
- 文本框、选择框、文本区域、可编辑区域，以及 tablist、menu、listbox 等复合控件保留自己的方向键行为。工具栏不会拦截这些按键。
- 禁用和隐藏的控件会被跳过。Enter 与 Space 的激活由子组件处理。

### 方向与 RTL

- `aria-orientation` 跟随实际布局：纵向 floating 工具栏为 `vertical`，其他情况为 `horizontal`。Docked 工具栏始终横向；`vertical` 仅在 floating 布局下生效。
- 起始与末尾位置跟随书写方向。工具栏使用逻辑内边距和间距值，因此 RTL 会镜像容器并反转水平方向键行为，同时保持 DOM 顺序不变。

### 子控件与颜色

- 子控件保留自己的样式、尺寸和状态。使用共享的 Icon button 或 Button 组件，以保留焦点和触摸目标行为。
- Standard 配色下，标准图标按钮使用 Primary；Filled 和 Tonal 按钮使用各自的常规角色。Vibrant 配色下，标准图标按钮使用 On Primary Container，选中的 Tonal 控件使用 Surface Container 与 On Surface，Filled 按钮保持常规角色。
- 工具栏不会为子控件重新着色，也不会为它们补充标签。

### 放置、溢出与密度

- 工具栏是可组合的操作容器。它不会折叠条目、生成溢出菜单，也不会附着到视口。
- 溢出操作可使用 Menu；floating 工具栏旁最多搭配一个高优先级浮动操作。
- Docked 工具栏填满容器，并保持至少 16 px 的内联内边距。低于 600 px 时操作分布在整个宽度；达到 600 px 及以上时操作组居中并使用更大间距。
- 密度会影响间距 token，但不得让子控件触摸目标小于共享最小值。

## API

### 导出

| 导出      | 类型 | 用途                         |
| --------- | ---- | ---------------------------- |
| `Toolbar` | 组件 | 带布局与颜色变体的操作容器。 |

### 属性

| 属性       | 类型                      | 默认值                              | 用途                                                             |
| ---------- | ------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `layout`   | `'floating' \| 'docked'`  | `'floating'`                        | 内容尺寸的 floating 工具栏或全宽 docked 工具栏。                 |
| `variant`  | `'standard' \| 'vibrant'` | `'standard'`                        | Surface Container 或 Primary Container 配色。                    |
| `shape`    | `'rounded' \| 'square'`   | Floating `rounded`；Docked `square` | 圆角处理。Docked 圆角从视口宽度 840 px 起渲染。                  |
| `vertical` | `boolean`                 | `false`                             | 纵向排列 floating 工具栏，并设置 `aria-orientation="vertical"`。 |
| `elevated` | `boolean`                 | Floating `true`；Docked `false`     | 添加阴影。                                                       |

### 事件

`Toolbar` 不触发事件。激活事件由子控件负责。

### 插槽

| 插槽     | 作用域 | 用途                                       |
| -------- | ------ | ------------------------------------------ |
| 默认插槽 | —      | 图标按钮、按钮、文本框或菜单触发器等操作。 |

### 方法

`Toolbar` 不提供方法。通过属性改变布局和颜色。

## 样式

在 Toolbar 根元素上设置以下项目自定义属性。Standard 映射为 Surface Container 与 On Surface；Vibrant 映射为 Primary Container 与 On Primary Container。

::: details CSS 覆盖项

| 属性                                       | 默认值                                                        | 用途                                     |
| ------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------- |
| `--yam3x-toolbar-size`                     | `64px`                                                        | 最小高度；纵向工具栏的最小宽度。         |
| `--yam3x-toolbar-spacing`                  | `4px`；docked 在 600 px 及以上使用 `32px`                     | 控件间距。                               |
| `--yam3x-toolbar-rounded-shape`            | System `corner-full`                                          | Floating 圆角。                          |
| `--yam3x-toolbar-docked-rounded-shape`     | System `corner-large`（`16px`）                               | 宽屏 docked 圆角。                       |
| `--yam3x-toolbar-padding-block`            | `8px`；纵向方角使用 `16px`                                    | 块轴内边距。                             |
| `--yam3x-toolbar-padding-inline`           | 圆角 floating `8px`；方角 floating `16px`；docked 至少 `16px` | 内联轴内边距；docked 保持 16 px 最小值。 |
| `--yam3x-toolbar-standard-container-color` | System `surface-container`                                    | Standard 容器颜色。                      |
| `--yam3x-toolbar-standard-color`           | System `on-surface`                                           | Standard 继承文字颜色。                  |
| `--yam3x-toolbar-vibrant-container-color`  | System `primary-container`                                    | Vibrant 容器颜色。                       |
| `--yam3x-toolbar-vibrant-color`            | System `on-primary-container`                                 | Vibrant 继承文字颜色。                   |

:::

Material 允许 Web 和大屏 docked 使用圆角，但没有规定圆角值或断点。本项目从视口宽度 840 px 起使用 System `corner-large`，并将 4 px floating 间距作为项目映射。内边距属性可以增大 docked 的内联内边距，但不能低于 16 px。强制颜色模式会用系统颜色替换背景和文字，并添加轮廓。

## Material 参考

[Toolbars 概览](https://m3.material.io/components/toolbars/overview) · [指南](https://m3.material.io/components/toolbars/guidelines) · [规格](https://m3.material.io/components/toolbars/specs) · [无障碍](https://m3.material.io/components/toolbars/accessibility)
