<script setup lang="ts">
import SideSheetExample from '../../components/demos/SideSheetExample.vue'
</script>

# Side sheets

Side sheet 把辅助内容锚定在屏幕侧边。使用 side sheet 提供可选的辅助内容与操作，同时不打断主内容。

两种变体：standard 与 modal。`SideSheet` 通过 `mode` 同时支持两者，并额外提供项目定义的 `adaptive` 值，且以其作为默认值。

## 示例

### 基础

示例把 sheet 放在可调整宽度的容器中。可用控件比较 `adaptive`、`modal` 与 `standard` 呈现方式，切换到 RTL，改变预览宽度，并添加返回入口。状态行会显示 `change` 的原因。

<div class="vp-raw yam3x-doc-demo-theme"><SideSheetExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SideSheetExample.vue{vue}

:::

## 在应用中导入

从 `./components/yam3x/side-sheet` 导入已复制的组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SideSheet } from './components/yam3x/side-sheet'

const open = ref(false)
</script>

<template>
  <SideSheet
    v-model:open="open"
    label="设置"
    mode="adaptive"
    @change="(value, reason) => console.log(value, reason)"
  >
    <template #toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        设置
      </button>
    </template>
    <main>主要内容</main>
    <template #headline>设置</template>
    <template #sheet>辅助内容</template>
    <template #actions>
      <button
        type="button"
        @click="open = false"
      >
        完成
      </button>
    </template>
  </SideSheet>
</template>
```

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 命名空间。`locale` 可覆盖语言，默认使用 provider，再回退到 `en-US`；标签属性优先于对应的共享默认文案。

## 行为与无障碍

### 模式与布局

- `modal` 在主要内容上方显示 scrim、约束焦点，并暴露 `aria-modal="true"`。
- `standard` 会重新布局主要内容并保持其可交互，同时在两个区域之间显示分隔线。容器需要足够宽，才能为两侧区域保留可用空间。
- `adaptive` 按容器宽度切换：低于 `adaptiveBreakpoint` 时以 modal 呈现，达到或超过时以 standard 呈现。响应式布局建议使用它；若在断点以下强制使用 `standard`，可能导致侧边面板空间不足。
- 面板锚定在逻辑行末，因此在 RTL 布局中会移到左侧。

### 焦点与关闭

- 必填的 `label` 为 side sheet 对话框命名；未提供 `#headline` 时也会作为标题文本。
- 两种呈现方式都暴露一个 dialog 语义边界；只有 modal 呈现设置 `aria-modal="true"` 并约束焦点。
- Material 要求 side sheet 内始终存在关闭入口（例如关闭图标按钮）。本组件始终渲染该入口；`closeLabel` 用于设置其无障碍名称。
- Scrim 和 Escape 是补充关闭方式。关闭时面板为 inert，并对辅助技术隐藏。
- 由于 side sheet 后方或旁边的主要内容始终可见，必须提供离开 side sheet 并返回主内容的入口。使用 `#back` 添加 sheet 内的返回入口；未提供该插槽时不会渲染返回按钮。

### 键盘

- Tab 按顺序经过 sheet 内的控件：存在返回入口时先到它，然后是关闭图标按钮、sheet 正文和操作区。
- Space 或 Enter 激活当前聚焦的控件。
- modal 呈现下，Tab 在 sheet 内循环，Escape 关闭并把焦点交还打开它的控件。

### 状态归属

- `v-model:open` 管理显隐，也可从 sheet 外部设置。
- `#toggle` 接收 `{ expanded, controls, toggle }`，用于在主内容中渲染可访问的打开控件。
- 用户切换、激活 scrim 或按 Escape 关闭时，`change` 会报告新状态和原因（`toggle` 或 `dismiss`）。
- `#actions` 仅在提供插槽时渲染；`#sheet` 可独立于主内容纵向滚动。

## API

### 导出

`SideSheet`，以及 `SideSheetMode`、`SideSheetToggleSlotProps` 类型。

### `SideSheet`

| 属性                 | 类型                                  | 默认值                  | 说明                                                  |
| -------------------- | ------------------------------------- | ----------------------- | ----------------------------------------------------- |
| `label`              | `string`                              | 必填                    | 对话框的可访问名称；同时作为标题回退文字。            |
| `mode`               | `'modal' \| 'standard' \| 'adaptive'` | `'adaptive'`            | 呈现方式，或按容器宽度在 modal 与 standard 之间切换。 |
| `open`               | `v-model:open: boolean`               | `false`                 | 显隐状态。                                            |
| `width`              | `string`                              | `'400px'`               | 面板宽度。                                            |
| `maxWidth`           | `string`                              | `'400px'`               | 面板最大宽度。                                        |
| `adaptiveBreakpoint` | `number`                              | `600`                   | `adaptive` 切换呈现方式的容器宽度（像素）。           |
| `closeLabel`         | `string`                              | 本地化默认文案          | 关闭图标按钮的无障碍名称。                            |
| `backLabel`          | `string`                              | 本地化默认文案          | 传给 `#back` 插槽的无障碍名称。                       |
| `locale`             | `string`                              | 先 provider，再 `en-US` | 内置界面文案所用语言。                                |

### 事件

| 事件     | 载荷                                             | 说明                                           |
| -------- | ------------------------------------------------ | ---------------------------------------------- |
| `change` | `(open: boolean, reason: 'toggle' \| 'dismiss')` | 通过切换、scrim 或 Escape 关闭时显隐发生变化。 |

### 插槽

| 插槽       | 作用域                           | 说明                                  |
| ---------- | -------------------------------- | ------------------------------------- |
| 默认插槽   | —                                | 主要内容；standard 呈现时会重新布局。 |
| `sheet`    | —                                | 面板正文，可独立纵向滚动。            |
| `headline` | —                                | 面板标题；`label` 作为回退。          |
| `actions`  | —                                | 面板末尾的操作区；未使用时不渲染。    |
| `back`     | `{ backLabel: string }`          | 可选的返回入口，位于标题之前。        |
| `toggle`   | `{ expanded, controls, toggle }` | 渲染在主内容中的打开控件。            |

## 样式

面板复用共享的 drawer 容器实现宽度、最大宽度和模式切换，因此 `width` 与 `maxWidth` 是受支持的尺寸控制项。颜色、文字样式和间距由组件 token 提供，这里不提供公共样式钩子。

## Material 参考

[Side sheets 概览](https://m3.material.io/components/side-sheets/overview) · [指南](https://m3.material.io/components/side-sheets/guidelines) · [规格](https://m3.material.io/components/side-sheets/specs) · [无障碍](https://m3.material.io/components/side-sheets/accessibility)
