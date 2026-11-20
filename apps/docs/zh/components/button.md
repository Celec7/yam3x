<script setup lang="ts">
import ButtonExample from '../../components/demos/ButtonExample.vue'
import ButtonSizesExample from '../../components/demos/ButtonSizesExample.vue'
import ButtonStatesExample from '../../components/demos/ButtonStatesExample.vue'
import ToggleButtonExample from '../../components/demos/ToggleButtonExample.vue'
</script>

# Buttons

`Button` 执行操作或导航到目标位置。`ToggleButton` 保持二态选择，直到用户更改。两者都是 Material 3 Expressive 按钮，提供五种颜色样式、五种尺寸以及圆形或方形形状。当多个相关操作或选项共用一个容器时，请使用[按钮组](/zh/components/button-group)。

最重要的操作使用 filled，中等强调使用 tonal 或 outlined，最低强调使用 text。仅在需要持续二态状态时使用 toggle，并让图标和标签共同表达该状态。

## 示例

### 变体

五种颜色样式对应 Material 颜色角色。filled 强调最高；elevated 与 tonal 次之，outlined 与 text 最克制。

<div class="vp-raw yam3x-doc-demo-theme"><ButtonExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ButtonExample.vue{vue}

:::

### 尺寸与形状

从 extra-small 到 extra-large 的尺寸保持相同的标签与图标结构，并且每种尺寸都保留 48 px 交互目标。`shape="square"` 会将静止状态的全圆角替换为该尺寸的方形圆角，按压与选中时形状会再次变化。

<div class="vp-raw yam3x-doc-demo-theme"><ButtonSizesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ButtonSizesExample.vue{vue}

:::

### 链接与禁用状态

`href` 会渲染原生链接。`disabledInteractive` 让不可用控件保留在 Tab 顺序中并暴露 `aria-disabled`，同时取消激活；状态文本会报告被阻止的激活次数。禁用行应用 Material 禁用颜色并移除高度。

<div class="vp-raw yam3x-doc-demo-theme"><ButtonStatesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ButtonStatesExample.vue{vue}

:::

### 持续选择

`ToggleButton` 通过 `v-model:checked` 绑定选择，并通过插槽替换前置图标和标签，同时暴露 `aria-pressed`；设置 `role="radio"` 时使用 `aria-checked`。toggle 不支持 text 样式。

<div class="vp-raw yam3x-doc-demo-theme"><ToggleButtonExample /></div>

::: details 查看演示源码

<<< ../../components/demos/ToggleButtonExample.vue{vue}

:::

## 在应用中使用

按[安装指南](/zh/guide/start/installation)复制组件后，从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, ToggleButton } from './components/yam3x/button'

const saved = ref(false)
const favorite = ref(false)
</script>

<template>
  <Button @click="saved = true">保存</Button>
  <ToggleButton v-model:checked="favorite">收藏</ToggleButton>
  <p role="status">{{ saved ? '已保存' : '' }}</p>
  <p role="status">{{ favorite ? '已收藏' : '未收藏' }}</p>
</template>
```

::: details 链接、表单与 radio 样式 toggle

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, ToggleButton } from './components/yam3x/button'

const alignment = ref('start')
</script>

<template>
  <Button
    href="/zh/guide/start/installation"
    variant="outlined"
  >
    安装
  </Button>

  <form @submit.prevent="save">
    <Button
      type="submit"
      name="intent"
      value="save"
    >
      保存更改
    </Button>
    <Button
      type="reset"
      variant="text"
    >
      重置
    </Button>
  </form>

  <div
    role="radiogroup"
    aria-label="对齐方式"
  >
    <ToggleButton
      v-for="option in ['start', 'center', 'end']"
      :key="option"
      role="radio"
      :name="`alignment-${option}`"
      :value="option"
      :checked="alignment === option"
      @update:checked="alignment = option"
    >
      {{ option }}
    </ToggleButton>
  </div>
</template>
```

:::

未设置 `href` 的按钮按配置的 `type` 参与原生表单提交；默认值是 `button`，因此请显式选择 `submit` 或 `reset`。链接不会提交所在表单；禁用链接保留链接语义，但会移除目标和 Tab 停靠点。

## 行为与无障碍

### 键盘与焦点

- Tab 会依次到达每个启用的按钮；Space 或 Enter 激活按钮。
- 共享焦点指示器是 3 px 的 `secondary` 外环，偏移 2 px；在 200% 文字大小和强制颜色模式下仍保持可见。
- `disabled` 会将按钮移出 Tab 顺序并取消激活。`disabledInteractive` 保持可聚焦，保留 `aria-disabled="true"`，取消激活且不触发 click 事件。
- 禁用链接暴露 `role="link"`、`aria-disabled="true"`，且没有 `href`，也不会成为 Tab 停靠点。`disabledInteractive` 链接保持可聚焦，但仍会阻止导航。

### 链接与表单

- `href` 会将渲染元素切换为锚点。原生链接导航以及 target、rel、download 属性由使用方通过 attrs 控制。
- 原生 `id`、`name`、`value` 和 `form` 会转交给 button 元素。链接模式下会省略这些仅属于按钮的属性。
- 阻止 `click` 事件会同时阻止指针与键盘触发的导航或提交。

### Toggle 选择

- `ToggleButton` 先发出 `click`，随后在事件未被取消时切换 `checked`。因此在 `click` 上调用 `preventDefault()` 会保留之前的选择。
- 默认 `role="button"` 通过 `aria-pressed` 暴露选择；设置 `role="radio"` 时通过 `aria-checked` 暴露。组件仍会切换存储的值，因此 radio 组必须只接受应改变其单选状态的更新。
- 选中状态可通过 `selected` 和 `selected-icon` 插槽替换可见标签与前置图标。装饰性图标对辅助技术隐藏。
- 圆形 toggle 选中时使用方形圆角；方形 toggle 选中时变为完整圆形。

### 标签与图标

- 可见标签提供无障碍名称。请保持简洁并只占一行；图标插槽是装饰内容，因此不支持纯图标内容。
- 可选前置图标在 LTR 中位于标签之前，在 RTL 中位于标签之后。`#trailing-icon` 是项目扩展，始终位于标签之后。
- 两个组件都没有内置加载状态。工作尚未完成时，请禁用触发器或更改标签，而不是只显示一个 spinner。

## API

### 导出

| 导出                                                                | 说明                             |
| ------------------------------------------------------------------- | -------------------------------- |
| `Button`                                                            | 操作或链接按钮。                 |
| `ToggleButton`                                                      | 持续二态选择。                   |
| `buttonVariants`                                                    | 为自定义组合返回类名。           |
| `ButtonVariant`, `ToggleButtonVariant`, `ButtonSize`, `ButtonShape` | 支持的样式、尺寸与形状类型导出。 |

### `Button` 属性与模型

| 属性 / 模型           | 类型                                                               | 默认值     | 说明                                       |
| --------------------- | ------------------------------------------------------------------ | ---------- | ------------------------------------------ |
| `variant`             | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined' \| 'text'` | `'filled'` | 颜色样式与强调程度。                       |
| `size`                | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`  | 标签字体、高度、图标尺寸和图标与标签间距。 |
| `shape`               | `'round' \| 'square'`                                              | `'round'`  | 静止形状；按压状态会从该形状变形。         |
| `type`                | `'button' \| 'submit' \| 'reset'`                                  | `'button'` | button 模式下的原生按钮类型。              |
| `href`                | `string`                                                           | 未定义     | 定义时渲染原生链接而非按钮。               |
| `disabled`            | `boolean`                                                          | `false`    | 禁用按钮，或移除链接目标与 Tab 停靠点。    |
| `disabledInteractive` | `boolean`                                                          | `false`    | 保持禁用控件可聚焦，并取消激活。           |

::: details 原生按钮属性

| 属性    | 类型     | 说明                          |
| ------- | -------- | ----------------------------- |
| `id`    | `string` | 传递给根元素。                |
| `name`  | `string` | 表单字段名；链接模式忽略。    |
| `value` | `string` | 表单值；链接模式忽略。        |
| `form`  | `string` | 关联的表单 ID；链接模式忽略。 |

其他属性与监听器会转发到根元素。

:::

### `Button` 事件

| 事件    | 载荷         | 说明                                     |
| ------- | ------------ | ---------------------------------------- |
| `click` | `MouseEvent` | 激活时触发。阻止该事件可取消导航或提交。 |

### `Button` 插槽

| 插槽            | 说明                                |
| --------------- | ----------------------------------- |
| `default`       | 可见标签；无障碍名称所必需。        |
| `icon`          | 装饰性前置图标，在 RTL 中镜像位置。 |
| `trailing-icon` | 装饰性尾部图标；项目扩展。          |

### `ToggleButton` 属性与模型

| 属性 / 模型 | 类型                                                               | 默认值     | 说明                                                 |
| ----------- | ------------------------------------------------------------------ | ---------- | ---------------------------------------------------- |
| `checked`   | `v-model:checked: boolean`                                         | `false`    | 选中状态。                                           |
| `variant`   | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined'`           | `'filled'` | 颜色样式；不支持 text 样式。                         |
| `size`      | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'small'`  | 与 `Button` 相同的尺寸映射。                         |
| `shape`     | `'round' \| 'square'`                                              | `'round'`  | 静止形状；选中时互换。                               |
| `role`      | `'button' \| 'radio'`                                              | 未定义     | 通过 `aria-pressed` 或 `aria-checked` 暴露选中状态。 |
| `disabled`  | `boolean`                                                          | `false`    | 禁用 toggle。                                        |
| `type`      | `'button' \| 'submit' \| 'reset'`                                  | `'button'` | 原生按钮类型。                                       |

::: details 原生按钮属性

`id`、`name`、`value` 和 `form` 会转交给 button 元素。toggle 从不渲染链接，因此其 API 不包含 `href`。

:::

### `ToggleButton` 事件

| 事件             | 载荷         | 说明                                   |
| ---------------- | ------------ | -------------------------------------- |
| `click`          | `MouseEvent` | 在选择变化前触发；阻止它可保持原状态。 |
| `update:checked` | `boolean`    | 提议新的选中状态。                     |

### `ToggleButton` 插槽

| 插槽            | 说明                           |
| --------------- | ------------------------------ |
| `default`       | 未选中时显示的可见标签。       |
| `icon`          | 未选中时显示的装饰性前置图标。 |
| `selected`      | 选中时替换标签。               |
| `selected-icon` | 选中时替换前置图标。           |
| `trailing-icon` | 装饰性尾部图标；项目扩展。     |

### `buttonVariants`

`buttonVariants({ variant?, size? })` 为自定义元素返回类名，接受 `ButtonVariant` 与 `ButtonSize`。它不提供行为、插槽或状态处理。

### 类型

| 类型                  | 值                                                                 |
| --------------------- | ------------------------------------------------------------------ |
| `ButtonVariant`       | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined' \| 'text'` |
| `ToggleButtonVariant` | `'filled' \| 'filled-tonal' \| 'elevated' \| 'outlined'`           |
| `ButtonSize`          | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` |
| `ButtonShape`         | `'round' \| 'square'`                                              |

## 样式

颜色使用 Material 系统角色，因此修改应用主题会同步更新所有样式和选中状态。`--yam3x-button-container-color` 可覆盖所有变体和 toggle 状态的容器颜色；可设置在按钮或祖先元素上。`buttonVariants({ variant, size })` 为自定义组合暴露相同的类名。

::: details 形状、交互目标与动效

紧凑尺寸即使可见容器更小，也会保留 48 × 48 CSS px 的交互目标。圆形按钮静止时为完整圆角，方形按钮使用该尺寸的方形圆角；按压反馈会以共享的生成式弹簧曲线（155 ms）向按压形状变形，并在减少动效时禁用过渡。焦点、状态层与禁用透明度保留在组件内部。

:::

## Material 参考

[Buttons 概览](https://m3.material.io/components/buttons/overview) · [指南](https://m3.material.io/components/buttons/guidelines) · [规格](https://m3.material.io/components/buttons/specs) · [无障碍](https://m3.material.io/components/buttons/accessibility)
