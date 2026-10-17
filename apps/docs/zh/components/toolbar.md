<script setup lang="ts">
import ToolbarExample from '../../components/demos/ToolbarExample.vue'
</script>

# Toolbars

Toolbar 将适用于当前页面或所选内容的操作集中呈现。应让最相关的操作保持可见，并按布局选择 docked 或 floating 位置。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><ToolbarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ToolbarExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { Toolbar } from './components/yam3x/toolbar'
import IconButton from './components/yam3x/icon-button/icon-button.vue'
</script>

<template>
  <Toolbar aria-label="编辑操作">
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="撤销"
      >↶</IconButton
    >
    <IconButton
      variant="standard"
      style="color: var(--md-sys-color-primary)"
      aria-label="重做"
      >↷</IconButton
    >
  </Toolbar>
</template>
```

## API

| 属性       | 默认值     | 说明                                                                                                       |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `layout`   | `floating` | `floating` 或 `docked`。                                                                                   |
| `variant`  | `standard` | `standard` 或 `vibrant` 配色。                                                                             |
| `shape`    | 随布局     | Floating 默认圆角；Docked 默认方角。可显式设置 `rounded` 或 `square`。Docked 圆角从视口宽度 840px 起生效。 |
| `vertical` | `false`    | Floating 工具栏纵向排列，并将 `aria-orientation` 设为 `vertical`。                                         |
| `elevated` | 随布局     | Floating 默认有阴影；Docked 默认无阴影。                                                                   |

## 行为与无障碍

组件根据实际生效的布局设置 `aria-orientation`：纵向 Floating 工具栏为 `vertical`，其他情况为 `horizontal`，使其语义、布局和键盘行为保持一致。

为工具栏及每个图标按钮提供清楚的无障碍名称。各操作保留原生 Tab 顺序；横向工具栏可用左右方向键、纵向用上下方向键切换操作，Home/End 到首尾。文本输入框保留自己的方向键。按 Enter 或 Space 激活操作时由子组件处理。

插槽控件保留各自的颜色变体。Standard 配色下，标准图标按钮使用 `primary`；Filled 和 Tonal 按钮使用各自的常规颜色角色。Vibrant 配色下，标准图标按钮使用 `on-primary-container`，选中的 Tonal 控件使用 `surface-container` / `on-surface`，Filled 按钮仍使用常规角色。工具栏不会修改子控件样式。

组件自身不定位、折叠或生成溢出菜单。Floating 应由页面保持在视口内；内容过多时把次要操作放入菜单。底部不要同时显示工具栏和导航栏。Docked 填满所在容器；若要符合 Material 的全屏宽度指导，应将它放在窗口底部的全宽容器中。Floating 可与单个高优先级 FAB 搭配。

## 样式

在 `Toolbar` 根元素设置以下属性，以覆盖组件映射：

| 属性                                       | 默认映射                                                      | 说明                                              |
| ------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------- |
| `--yam3x-toolbar-size`                     | `64px`                                                        | 最小高度；纵向工具栏的最小宽度。                  |
| `--yam3x-toolbar-spacing`                  | `4px`；Docked 在视口宽度 600px 起使用 `32px`                  | 控件间距。                                        |
| `--yam3x-toolbar-rounded-shape`            | System `corner-full`                                          | Floating 圆角。                                   |
| `--yam3x-toolbar-docked-rounded-shape`     | System `corner-large`（`16px`）                               | 宽屏 Docked 圆角。                                |
| `--yam3x-toolbar-padding-block`            | `8px`；方角纵向工具栏使用 `16px`                              | 块轴内边距。Docked 的内联轴最小内边距为 `16px`。  |
| `--yam3x-toolbar-padding-inline`           | 圆角 Floating `8px`；方角 Floating `16px`；Docked 至少 `16px` | 内联轴内边距；Docked 不会低于 Material 的最小值。 |
| `--yam3x-toolbar-standard-container-color` | System `surface-container`                                    | Standard 容器颜色。                               |
| `--yam3x-toolbar-standard-color`           | System `on-surface`                                           | Standard 继承文字颜色。                           |
| `--yam3x-toolbar-vibrant-container-color`  | System `primary-container`                                    | Vibrant 容器颜色。                                |
| `--yam3x-toolbar-vibrant-color`            | System `on-primary-container`                                 | Vibrant 继承文字颜色。                            |

Material 允许 Web 和大屏 Docked 使用圆角，但没有规定圆角值或断点。本项目从 `840px` 起使用 System `corner-large`（`16px`）。Floating 默认 `4px` 间距也是项目映射。断点以下不绘制 Docked 圆角。内边距属性可以增大 Docked 的内联轴内边距，但不能小于 `16px`。

## Material 参考

[Toolbars 概览](https://m3.material.io/components/toolbars/overview) · [指南](https://m3.material.io/components/toolbars/guidelines) · [规格](https://m3.material.io/components/toolbars/specs) · [无障碍](https://m3.material.io/components/toolbars/accessibility)
