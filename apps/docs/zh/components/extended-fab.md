<script setup lang="ts">
import ExtendedFabExample from '../../components/demos/ExtendedFabExample.vue'
</script>

# Extended FABs

Extended FAB 将页面的主要操作与简短的可见标签组合。`ExtendedFloatingActionButton` 是 Material 3 Expressive 的 Extended FAB。当标签比单独图标更能说明操作时使用它；当图标含义明确时使用纯图标 [FAB](/zh/components/fab)；当一个控件需要展开多个操作时使用 [FAB menu](/zh/components/fab-menu)。

Material 定义了 small、medium 和 large 三种 Expressive 尺寸以及六种颜色样式。本项目默认使用 medium，保留 56 px 的 small Expressive 形式，并将带图标 FAB 的视觉折叠视为同一控件的项目表现方式。

## 示例

### 尺寸与展开

演示对比 small、medium 和 large 尺寸、纯文字 Extended FAB 以及展开状态。`expanded` 只会折叠带图标的 FAB；标签仍保留在无障碍名称中。第二个控件会切换项目专有的 `lowered` 高度。

<div class="vp-raw yam3x-doc-demo-theme"><ExtendedFabExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ExtendedFabExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ExtendedFloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <ExtendedFloatingActionButton>
    <template #icon>
      <Icon
        name="add"
        filled
      />
    </template>
    创建项目
  </ExtendedFloatingActionButton>
</template>
```

::: details 折叠、较低高度与链接形式

```vue
<script setup lang="ts">
import { ExtendedFloatingActionButton } from './components/yam3x/fab'
import { Icon } from './components/yam3x/icon'
</script>

<template>
  <ExtendedFloatingActionButton
    :expanded="false"
    size="small"
    variant="secondary-container"
  >
    <template #icon>
      <Icon
        name="edit"
        filled
      />
    </template>
    编辑页面
  </ExtendedFloatingActionButton>

  <ExtendedFloatingActionButton
    lowered
    href="/zh/guide/start/installation"
  >
    <template #icon>
      <Icon
        name="arrow_forward"
        filled
      />
    </template>
    打开指南
  </ExtendedFloatingActionButton>
</template>
```

:::

布局使用方负责放置位置。每个屏幕只保留一个 FAB 系列控件，并在操作不可用时省略。

## 行为与无障碍

### 尺寸与字体

- `small` 使用 56 px 容器和 title-medium 字体，`medium` 使用 80 px 和 title-large，`large` 使用 96 px 和 headline-small。默认值为 `medium`。
- Expressive small 尺寸使用 56 px 容器；旧的 baseline Extended FAB 与 surface 样式已不再推荐。
- 图标是可选的。只有图标而没有可见标签时属于 FAB，而不是 Extended FAB，因此必须保留标签。

### 标签与命名

- 标签控制在一至两个词内，并保持单行，不换行、不截断。
- 标签与可选图标处于同一个可聚焦控件中。已有可见标签时不需要提示。
- 若显式设置无障碍名称，其开头应与可见标签的第一个词一致。

### 展开与较低高度

- `expanded` 默认为 `true`。设为 `false` 时，带图标的 FAB 会在视觉上把标签折叠为纯图标形式；无障碍名称仍包含标签。纯文字 Extended FAB 会忽略折叠并保持展开。
- 组件只渲染一个 button 或链接；展开与折叠不会创建第二个控件，也不会改变无障碍名称。
- `lowered` 是项目扩展：静止、focus 和 pressed 时使用 level 1 高度，hover 时使用 level 2。
- 操作不可用时应省略控件。Material 不定义禁用的 Extended FAB。

### 链接与表单

- `href` 渲染原生锚点。
- `type`、`id`、`name`、`value` 和 `form` 仅在 button 模式下生效。
- 焦点使用共享的 3 px `secondary` 指示器，偏移 2 px，并沿用该尺寸的容器形状。

## API

### 导出

| 导出                                                                  | 说明                                         |
| --------------------------------------------------------------------- | -------------------------------------------- |
| `ExtendedFloatingActionButton`                                        | 带可选图标的 Extended FAB。                  |
| `FloatingActionButton`                                                | 纯图标 FAB；参见 [FAB](/zh/components/fab)。 |
| `ToggleFloatingActionButton`                                          | FAB menu 的 toggle 触发器。                  |
| `ToggleFloatingActionButtonSize`, `ToggleFloatingActionButtonVariant` | toggle FAB 的类型。                          |

### `ExtendedFloatingActionButton` 属性与模型

| 属性 / 模型 | 类型                                                                                                             | 默认值                | 说明                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------- |
| `size`      | `'small' \| 'medium' \| 'large'`                                                                                 | `'medium'`            | 容器高度、图标尺寸、字体样式和圆角形状。 |
| `expanded`  | `boolean`                                                                                                        | `true`                | 存在图标时在视觉上折叠标签。             |
| `variant`   | `'primary-container' \| 'secondary-container' \| 'tertiary-container' \| 'primary' \| 'secondary' \| 'tertiary'` | `'primary-container'` | 六种 Expressive 颜色样式之一。           |
| `lowered`   | `boolean`                                                                                                        | `false`               | 项目扩展，选择较低的高度处理。           |
| `href`      | `string`                                                                                                         | 未定义                | 定义时渲染原生链接。                     |

::: details 原生按钮属性

| 属性    | 类型                              | 说明                            |
| ------- | --------------------------------- | ------------------------------- |
| `type`  | `'button' \| 'submit' \| 'reset'` | 原生按钮类型；默认为 `button`。 |
| `id`    | `string`                          | 传递给根元素。                  |
| `name`  | `string`                          | 表单字段名；链接模式忽略。      |
| `value` | `string`                          | 表单值；链接模式忽略。          |
| `form`  | `string`                          | 关联的表单 ID；链接模式忽略。   |

:::

### `ExtendedFloatingActionButton` 事件

| 事件    | 载荷         | 说明                                         |
| ------- | ------------ | -------------------------------------------- |
| `click` | `MouseEvent` | 激活时触发。阻止该事件可取消导航或表单提交。 |

### `ExtendedFloatingActionButton` 插槽

| 插槽      | 说明                                  |
| --------- | ------------------------------------- |
| `default` | 简短的可见标签；Extended FAB 所必需。 |
| `icon`    | 可选装饰性前置图标。                  |

### 方法

`ExtendedFloatingActionButton` 不暴露公开实例方法。

## 样式

颜色遵循主题角色，几何与字体来自尺寸映射。共享覆盖使用 `--yam3x-extended-fab-<property>`；单一尺寸使用 `--yam3x-extended-fab-<size>-<property>`。可设置在组件或祖先元素上。形状默认映射到 Material 系统圆角 token。

::: details CSS 覆盖

| 属性                                             | 默认值         | 说明                       |
| ------------------------------------------------ | -------------- | -------------------------- |
| `--yam3x-extended-fab-container-height`          | 随尺寸变化     | 容器高度。                 |
| `--yam3x-extended-fab-shape`                     | 系统圆角 token | 圆角半径。                 |
| `--yam3x-extended-fab-leading-space`             | 随尺寸变化     | 图标前的行内内边距。       |
| `--yam3x-extended-fab-trailing-space`            | 随尺寸变化     | 标签后的行内内边距。       |
| `--yam3x-extended-fab-icon-label-space`          | 随尺寸变化     | 图标与标签之间的间距。     |
| `--yam3x-extended-fab-icon-size`                 | 随尺寸变化     | 图标盒子尺寸。             |
| `--yam3x-extended-fab-<size>-shape`              | 系统圆角 token | 单一尺寸的圆角半径。       |
| `--yam3x-extended-fab-<size>-leading-space`      | 随尺寸变化     | 单一尺寸的起始行内内边距。 |
| `--yam3x-extended-fab-<size>-trailing-space`     | 随尺寸变化     | 单一尺寸的尾部行内内边距。 |
| `--yam3x-<variant>-extended-fab-container-color` | 颜色角色       | 单一颜色样式的容器颜色。   |

将 `<size>` 替换为 `small`、`medium` 或 `large`，将 `<variant>` 替换为六种样式名称之一。

:::

## Material 参考

[Extended FAB 概览](https://m3.material.io/components/extended-fab/overview) · [指南](https://m3.material.io/components/extended-fab/guidelines) · [规格](https://m3.material.io/components/extended-fab/specs) · [无障碍](https://m3.material.io/components/extended-fab/accessibility)
