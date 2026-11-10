<script setup lang="ts">
import FabExample from '../../components/demos/FabExample.vue'
import FabStatesExample from '../../components/demos/FabStatesExample.vue'
</script>

# Floating action buttons (FABs)

浮动操作按钮（FAB）突出页面中最重要的构建性操作。`FloatingActionButton` 是 Material 3 Expressive 的纯图标 FAB。当简短的可见标签更能说明操作时，请使用 [Extended FAB](/zh/components/extended-fab)；当一个控件需要展开多个相关操作时，请使用 [FAB menu](/zh/components/fab-menu)。

Material 定义了 FAB 尺寸、六种 Expressive 颜色样式和高度。本项目仍以 56 px 基础尺寸作为默认值，并将 medium 与 large 作为独立尺寸提供。`lowered` 是项目扩展，用于选择较低的高度。

## 示例

### 尺寸与颜色

演示先对比 default、medium 和 large 三种纯图标 FAB 尺寸，再展示六种 Expressive 颜色样式。small 仍然可用，但已不再推荐。

<div class="vp-raw yam3x-doc-demo-theme"><FabExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FabExample.vue{vue}

:::

### 状态、链接与可用性

lowered 样式使用项目定义的较低高度。`href` 渲染原生链接；兼容示例让不可用的 FAB 保持可聚焦，同时取消激活。

<div class="vp-raw yam3x-doc-demo-theme"><FabStatesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FabStatesExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { FloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <FloatingActionButton aria-label="创建项目">
    <Icon
      name="add"
      filled
    />
  </FloatingActionButton>
</template>
```

::: details 颜色、较低高度与链接

```vue
<script setup lang="ts">
import { FloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <FloatingActionButton
    variant="tertiary-container"
    size="large"
    aria-label="创建项目"
  >
    <Icon
      name="add"
      filled
    />
  </FloatingActionButton>

  <FloatingActionButton
    lowered
    aria-label="创建草稿"
  >
    <Icon
      name="edit"
      filled
    />
  </FloatingActionButton>

  <FloatingActionButton
    href="/zh/guide/installation"
    variant="secondary-container"
    aria-label="打开安装指南"
  >
    <Icon
      name="arrow_forward"
      filled
    />
  </FloatingActionButton>
</template>
```

:::

布局使用方负责放置位置，并决定 FAB 与其他内容的关系。组件本身不定位，也不在标准与 extended 形式之间自动选择。

## 行为与无障碍

### 尺寸与颜色

- `default` 是 56 px 基础 FAB。`medium` 使用 80 px，`large` 使用 96 px，各自拥有对应的图标尺寸与字体样式。`small` 为兼容而保留，但已不再推荐。
- 六种颜色样式选择 `primary`、`secondary` 或 `tertiary`，可使用容器角色对或直接颜色角色。旧的 surface 样式不再提供。
- 高度随颜色样式变化：静止为 level 3，hover 提升到 level 4，focus 与 pressed 回到静止层级。

### 命名与图标

- FAB 没有可见标签，因此必须通过 `aria-label` 或 `aria-labelledby` 描述操作。图标插槽是装饰内容，对辅助技术隐藏。
- 使用实心图标。在 Web 上，为 hover 与 focus 组合[提示](/zh/components/tooltip)，而不要把提示作为唯一的无障碍名称。
- 每个屏幕只保留一个 FAB 系列控件，并将其用于构建性的主要操作。

### 可用性与高度

- 操作不可用时应省略 FAB。`disabled` 与 `disabledInteractive` 仅为兼容既有流程而保留；Material 建议省略 FAB 而不是显示禁用状态。
- `disabledInteractive` 让控件保留在 Tab 顺序中，暴露 `aria-disabled="true"`，并取消激活且不发出 `click`。
- `lowered` 是项目扩展。静止、focus 和 pressed 时使用 level 1 高度，hover 时使用 level 2。

### 链接与表单

- `href` 渲染具有链接语义的原生锚点。禁用链接保留 `role="link"`、暴露 `aria-disabled`、移除 `href` 并离开 Tab 顺序；`disabledInteractive` 链接保持可聚焦，但仍会阻止导航。
- `type`、`id`、`name`、`value` 和 `form` 仅在 button 模式下生效，此时 FAB 参与原生表单提交。
- 焦点使用共享的 3 px `secondary` 指示器，偏移 2 px，并沿用该尺寸的容器形状。

## API

### 导出

| 导出                                                                  | 说明                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `FloatingActionButton`                                                | 纯图标 FAB。                                                       |
| `ExtendedFloatingActionButton`                                        | Extended FAB；参见 [Extended FAB](/zh/components/extended-fab)。   |
| `ToggleFloatingActionButton`                                          | [FAB menu](/zh/components/fab-menu) 的 toggle 触发器；在该页说明。 |
| `ToggleFloatingActionButtonSize`, `ToggleFloatingActionButtonVariant` | toggle FAB 的类型。                                                |

### `FloatingActionButton` 属性与模型

| 属性 / 模型           | 类型                                                                                                             | 默认值                | 说明                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------- |
| `size`                | `'small' \| 'default' \| 'medium' \| 'large'`                                                                    | `'default'`           | 容器高度、图标尺寸、字体样式和圆角形状。 |
| `variant`             | `'primary-container' \| 'secondary-container' \| 'tertiary-container' \| 'primary' \| 'secondary' \| 'tertiary'` | `'primary-container'` | 六种 Expressive 颜色样式之一。           |
| `lowered`             | `boolean`                                                                                                        | `false`               | 项目扩展，选择较低的高度处理。           |
| `href`                | `string`                                                                                                         | 未定义                | 定义时渲染原生链接。                     |
| `disabled`            | `boolean`                                                                                                        | `false`               | 已弃用的兼容状态，阻止激活。             |
| `disabledInteractive` | `boolean`                                                                                                        | `false`               | 已弃用；让不可用的 FAB 保持可聚焦。      |

::: details 原生按钮属性

| 属性    | 类型                              | 说明                            |
| ------- | --------------------------------- | ------------------------------- |
| `type`  | `'button' \| 'submit' \| 'reset'` | 原生按钮类型；默认为 `button`。 |
| `id`    | `string`                          | 传递给根元素。                  |
| `name`  | `string`                          | 表单字段名；链接模式忽略。      |
| `value` | `string`                          | 表单值；链接模式忽略。          |
| `form`  | `string`                          | 关联的表单 ID；链接模式忽略。   |

:::

### `FloatingActionButton` 事件

| 事件    | 载荷         | 说明                                         |
| ------- | ------------ | -------------------------------------------- |
| `click` | `MouseEvent` | 激活时触发。阻止该事件可取消导航或表单提交。 |

### `FloatingActionButton` 插槽

| 插槽      | 说明                                        |
| --------- | ------------------------------------------- |
| `default` | 装饰性图标内容；请在 FAB 上提供无障碍名称。 |

### 方法

`FloatingActionButton` 不暴露公开实例方法。

## 样式

颜色遵循主题角色，几何与字体来自尺寸映射。公开自定义属性使用 `--yam3x-floating-action-button-<property>` 表示共享值，使用 `--yam3x-<variant>-floating-action-button-<property>` 针对单一颜色样式；可设置在 FAB 或祖先元素上。这些属性名与覆盖行为属于项目 API。

::: details CSS 覆盖

| 属性                                                                 | 默认值     | 说明                          |
| -------------------------------------------------------------------- | ---------- | ----------------------------- |
| `--yam3x-floating-action-button-container-height`                    | 随尺寸变化 | 容器高度。                    |
| `--yam3x-floating-action-button-shape`                               | 随尺寸变化 | 圆角半径。                    |
| `--yam3x-floating-action-button-icon-size`                           | 随尺寸变化 | 图标盒子尺寸。                |
| `--yam3x-floating-action-button-leading-space`                       | 随尺寸变化 | 图标前的行内内边距。          |
| `--yam3x-floating-action-button-trailing-space`                      | 随尺寸变化 | 图标后的行内内边距。          |
| `--yam3x-<variant>-floating-action-button-container-color`           | 颜色角色   | 单一颜色样式的容器颜色。      |
| `--yam3x-<variant>-floating-action-button-container-elevation`       | Level 3    | 单一颜色样式的静止高度。      |
| `--yam3x-<variant>-floating-action-button-hover-container-elevation` | Level 4    | 单一颜色样式的 hover 高度。   |
| `--yam3x-<variant>-floating-action-button-hover-state-layer-opacity` | Hover 状态 | 单一颜色样式的 hover 状态层。 |

将 `<variant>` 替换为六种样式名称之一。焦点环厚度与偏移来自共享焦点 token。

:::

## Material 参考

[Floating action buttons 概览](https://m3.material.io/components/floating-action-button/overview) · [指南](https://m3.material.io/components/floating-action-button/guidelines) · [规格](https://m3.material.io/components/floating-action-button/specs) · [无障碍](https://m3.material.io/components/floating-action-button/accessibility)
