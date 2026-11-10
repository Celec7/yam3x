<script setup lang="ts">
import IconButtonExample from '../../components/demos/IconButtonExample.vue'
import IconButtonSizesExample from '../../components/demos/IconButtonSizesExample.vue'
import IconButtonToggleExample from '../../components/demos/IconButtonToggleExample.vue'
</script>

# Icon buttons

Icon button 使用图标执行紧凑操作。`IconButton` 是操作形式，`IconToggleButton` 保存二态状态。两者都是 Material 3 Expressive 图标按钮，提供 standard、filled、tonal、outlined 四种样式、五种尺寸、三种宽度以及圆形或方形形状。

每个图标按钮都需要描述操作的无障碍名称，因为图标本身只是装饰内容。一次性命令使用操作按钮，只有真正的二态选择才使用 toggle。

## 示例

### 操作与变体

演示展示四种样式、操作与 toggle 形式、提示、链接以及兼容性的禁用控件。选中状态通过 `#selected-icon` 替换 toggle 的图标。

<div class="vp-raw yam3x-doc-demo-theme"><IconButtonExample /></div>

::: details 查看演示源码

<<< ../../components/demos/IconButtonExample.vue{vue}

:::

### 尺寸与宽度

五种尺寸与三种宽度组合出不同的可见容器，同时每种组合都保留至少 48 × 48 px 的交互目标。

<div class="vp-raw yam3x-doc-demo-theme"><IconButtonSizesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/IconButtonSizesExample.vue{vue}

:::

### Toggle 选择

toggle 暴露 `aria-pressed`。选中的圆形 toggle 采用该尺寸的方形圆角，选中的方形 toggle 变为完整圆形，因此选中状态不只依赖颜色就能看出。

<div class="vp-raw yam3x-doc-demo-theme"><IconButtonToggleExample /></div>

::: details 查看演示源码

<<< ../../components/demos/IconButtonToggleExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconButton, IconToggleButton } from './components/yam3x/icon-button'
import { Icon } from './components/yam3x/icon'

const favorite = ref(false)
</script>

<template>
  <IconButton aria-label="搜索">
    <Icon
      name="search"
      filled
    />
  </IconButton>

  <IconToggleButton
    v-model:checked="favorite"
    aria-label="收藏"
  >
    <Icon name="favorite" />
    <template #selected-icon>
      <Icon
        name="favorite"
        filled
      />
    </template>
  </IconToggleButton>
</template>
```

::: details 链接与 radio 样式 toggle

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconButton, IconToggleButton } from './components/yam3x/icon-button'
import { Icon } from './components/yam3x/icon'

const alignment = ref('start')
</script>

<template>
  <IconButton
    href="/zh/guide/installation"
    variant="outlined"
    aria-label="打开安装指南"
  >
    <Icon
      name="arrow_forward"
      filled
    />
  </IconButton>

  <div
    role="radiogroup"
    aria-label="对齐方式"
  >
    <IconToggleButton
      v-for="option in ['start', 'center', 'end']"
      :key="option"
      role="radio"
      :checked="alignment === option"
      :aria-label="`对齐：${option}`"
      @update:checked="alignment = option"
    >
      <Icon :name="option === 'start' ? 'format_italic' : 'format_bold'" />
    </IconToggleButton>
  </div>
</template>
```

:::

radio 样式的 toggle 再次激活时不会自行取消选择；由应用更新共享选择。若采用该组合，请提供外层的 `radiogroup` 名称并管理 roving focus。

## 行为与无障碍

### 无障碍名称

- 每个图标按钮都必须通过 `aria-label` 或 attrs 中的 `aria-labelledby` 提供名称。图标是 `aria-hidden`，从不提供名称。
- 在 Web 上，为 hover 与 focus 组合[提示](/zh/components/tooltip)，但无障碍名称必须独立于提示。
- 操作按钮使用实心图标。toggle 未选中时使用描边图标，选中时通过 `#selected-icon` 提供实心版本；若没有实心版本，请提高图标字重。

### Toggle 状态与形状

- `IconToggleButton` 通过 `v-model:checked` 绑定，并默认暴露 `aria-pressed`。
- 设置 `role="radio"` 时暴露 `aria-checked`，再次激活不会取消选择。组件不提供组内导航；请自行提供 `radiogroup` 容器与 roving focus。
- 选择变化遵循规范的圆角映射：选中的圆形 toggle 使用方形圆角，选中的方形 toggle 变为完整圆形。按压状态还会产生自身的形状变形。
- 不支持链接形式的 toggle：`href` 不属于 toggle API，toggle 始终渲染 button。

### 尺寸、宽度与目标

- `size` 设置容器高度与图标尺寸；`width` 通过 `narrow`、`default` 或 `wide` 设置图标周围的行内空间。
- 紧凑组合仍保留 48 × 48 px 的交互目标，扩展目标会跟随可见圆角形状。
- Tab 会到达控件；Space 或 Enter 激活。焦点指示器是 3 px 的 `secondary` 外环，偏移 2 px。

### 链接、禁用状态与表单

- `href` 渲染具有链接语义的原生链接。禁用链接保留 `role="link"`、暴露 `aria-disabled`、移除 `href` 并离开 Tab 顺序；`disabledInteractive` 链接保持可聚焦并阻止导航。
- 按钮上的 `disabledInteractive` 保持可聚焦，暴露 `aria-disabled="true"`，并抑制激活与状态反馈。
- `type`、`id`、`name`、`value` 和 `form` 在 button 模式下生效。带 `type="submit"` 与 `name`/`value` 的 toggle 会像原生按钮一样提交；仅设置 `aria-pressed` 不会添加表单值。toggle 从不渲染链接，因此 `IconToggleButton` 不提供 `href`。

## API

### 导出

| 导出                                                                        | 说明                               |
| --------------------------------------------------------------------------- | ---------------------------------- |
| `IconButton`                                                                | 由图标表示的操作。                 |
| `IconToggleButton`                                                          | 由图标表示的持续二态选择。         |
| `IconButtonVariant`, `IconButtonSize`, `IconButtonWidth`, `IconButtonShape` | 样式、尺寸、宽度与形状的类型导出。 |

### `IconButton` 属性与模型

| 属性 / 模型           | 类型                                                               | 默认值      | 说明                                    |
| --------------------- | ------------------------------------------------------------------ | ----------- | --------------------------------------- |
| `variant`             | `'standard' \| 'filled' \| 'tonal' \| 'outlined'`                  | `'filled'`  | 视觉样式与强调程度。                    |
| `size`                | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`   | 容器高度与图标尺寸。                    |
| `width`               | `'narrow' \| 'default' \| 'wide'`                                  | `'default'` | 图标周围的行内空间。                    |
| `shape`               | `'round' \| 'square'`                                              | `'round'`   | 静止圆角形状。                          |
| `disabled`            | `boolean`                                                          | `false`     | 禁用按钮，或移除链接目标与 Tab 停靠点。 |
| `disabledInteractive` | `boolean`                                                          | `false`     | 保持禁用控件可聚焦，并取消激活。        |
| `href`                | `string`                                                           | 未定义      | 定义时渲染原生链接。                    |

::: details 原生按钮属性

`type`（`'button' | 'submit' | 'reset'`，默认 `'button'`）、`id`、`name`、`value` 和 `form` 在 button 模式下转发。其他属性与监听器会转发到根元素。

:::

### `IconButton` 事件

| 事件    | 载荷         | 说明                           |
| ------- | ------------ | ------------------------------ |
| `click` | `MouseEvent` | 激活时触发。阻止它可取消导航。 |

### `IconButton` 插槽

| 插槽      | 说明                                         |
| --------- | -------------------------------------------- |
| `default` | 图标内容；它是装饰内容，不能提供无障碍名称。 |

### `IconToggleButton` 属性与模型

| 属性 / 模型           | 类型                                                               | 默认值      | 说明                                    |
| --------------------- | ------------------------------------------------------------------ | ----------- | --------------------------------------- |
| `checked`             | `v-model:checked: boolean`                                         | `false`     | 选中状态。                              |
| `variant`             | `'standard' \| 'filled' \| 'tonal' \| 'outlined'`                  | `'filled'`  | 视觉样式与强调程度。                    |
| `size`                | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`   | 容器高度与图标尺寸。                    |
| `width`               | `'narrow' \| 'default' \| 'wide'`                                  | `'default'` | 图标周围的行内空间。                    |
| `shape`               | `'round' \| 'square'`                                              | `'round'`   | 静止形状；选中时互换。                  |
| `role`                | `'button' \| 'radio'`                                              | `'button'`  | 暴露 `aria-pressed` 或 `aria-checked`。 |
| `disabled`            | `boolean`                                                          | `false`     | 禁用 toggle。                           |
| `disabledInteractive` | `boolean`                                                          | `false`     | 保持禁用的 toggle 可聚焦并取消激活。    |

::: details 原生按钮属性

`type`（`'button' | 'submit' | 'reset'`，默认 `'button'`）、`id`、`name`、`value` 和 `form` 会转发。不提供 `href`。

:::

### `IconToggleButton` 事件

| 事件             | 载荷         | 说明                                 |
| ---------------- | ------------ | ------------------------------------ |
| `click`          | `MouseEvent` | 在状态变化前触发；阻止它可保持选择。 |
| `update:checked` | `boolean`    | 提议新的选中状态。                   |

### `IconToggleButton` 插槽

| 插槽            | 说明                                 |
| --------------- | ------------------------------------ |
| `default`       | 未选中时的图标内容。                 |
| `selected-icon` | 选中时的图标内容；回退到 `default`。 |

### 方法

两个组件都不暴露公开实例方法。

## 样式

颜色使用 Material 系统角色，因此修改应用主题会同步更新所有样式与选中状态。组件不提供公开自定义属性：几何、交互目标、状态层和焦点行为都保留在内部，可调整的公开接口是 `size`、`width` 和 `shape`。

::: details 颜色与状态映射

filled 样式使用 `primary`/`on-primary`；tonal 使用 `secondary-container`/`on-secondary-container`；outlined 保持透明容器并带描边；standard 使用透明容器。未选中的 filled toggle 使用 `surface-container` 与 `on-surface-variant`。hover 会添加共享状态层但不改变图标，强制颜色模式下仍保留可见边界。

:::

## Material 参考

[Icon buttons 概览](https://m3.material.io/components/icon-buttons/overview) · [指南](https://m3.material.io/components/icon-buttons/guidelines) · [规格](https://m3.material.io/components/icon-buttons/specs) · [无障碍](https://m3.material.io/components/icon-buttons/accessibility)
