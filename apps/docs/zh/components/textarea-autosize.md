<script setup>
import TextareaAutosizeBasicExample from '../../components/demos/TextareaAutosizeBasicExample.vue'
import TextareaAutosizeExample from '../../components/demos/TextareaAutosizeExample.vue'
</script>

# Textarea autosize

`vTextareaAutosize` 是让原生 `<textarea>` 随内容增高的项目可选指令。它不是 Material 组件；它适配原生控件，并保持表单、焦点、选区和校验行为不变。最接近的 Compose Material 3 组合是带测量文本高度的 `OutlinedTextField` 或 `BasicTextField`。

Material 的 Web 指引建议固定高度并在内部滚动。读者输入时布局可以移动字段下方内容时，使用该指令。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><TextareaAutosizeBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TextareaAutosizeBasicExample.vue{vue}

:::

`minRows` 防止短留言塌缩，`maxRows` 停止增长。达到上限后，textarea 在自身边框内滚动，而不是继续把下方内容推下去。

### 状态与恢复

<div class="vp-raw yam3x-doc-demo-theme"><TextareaAutosizeExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TextareaAutosizeExample.vue{vue}

:::

关闭自动调整可恢复 textarea 原有的内联高度和溢出行为。字段仍可编辑和提交。通过程序更新值、提交原生表单数据、重置表单或移除字段，可观察测量、重置和清理行为。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { vTextareaAutosize } from './components/yam3x/textarea-autosize'
</script>

<template>
  <label for="message">消息</label>
  <textarea
    id="message"
    v-textarea-autosize="{ minRows: 2, maxRows: 6 }"
    rows="2"
  />
</template>
```

::: details 切换自动调整

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { vTextareaAutosize } from './components/yam3x/textarea-autosize'

const message = ref('')
const enabled = ref(true)
const options = computed(() => ({ minRows: 2, maxRows: 6, enabled: enabled.value }))
</script>

<template>
  <textarea
    v-model="message"
    v-textarea-autosize="options"
    rows="2"
  />
</template>
```

更改 `enabled` 会恢复或重新应用指令拥有的样式，而不会重新挂载字段。

:::

## 行为与无障碍

### 尺寸与选项

- `minRows` 默认取 textarea 的 `rows`；`maxRows` 默认为 `0`，表示不限制增长。
- `minRows` 必须为正整数，`maxRows` 必须为非负整数；正的 `maxRows` 必须不小于 `minRows`。无效值会抛出 `RangeError`。
- 指令会测量计算后的行高、内边距、边框和 `box-sizing`，然后只为当前内容设置所需的内联高度。
- 内容超过 `maxRows` 时设置 `overflow-y: auto`；否则恢复原有溢出值。元素保留自己的滚动位置、焦点和选区。
- 输入事件、表单重置、元素尺寸变化、字体加载以及 `class`、`placeholder` 或 `rows` 变化都会触发重新测量。程序化值变化在下一次更新时测量。

### 启用与恢复

- `enabled` 默认为 `true`。设为 `false` 会恢复原有的内联 `height` 和 `overflow-y`，包括其优先级。
- 指令只拥有这两个内联属性，不改变值、名称、校验、选区、焦点或提交行为。
- 移除 textarea 或卸载组件时，会在元素释放前恢复已保存的样式。

### 原生表单与焦点

textarea 仍是原生表单控件。其值通过 `name` 提交，原生校验和 `required` 行为仍然有效，表单重置会恢复值并重新测量字段。指令从不移动焦点或拦截键盘输入。

### SSR 与无 JavaScript

指令在挂载后的客户端运行。服务端渲染和无 JavaScript 页面保留 textarea 的原生 `rows` 和任何内联高度；不会运行测量，也不会隐藏内容。请提供合理的 `rows` 值或内联高度，使初始字段具有预期尺寸。

### 响应式与 RTL

- 宽度变化会重新测量换行后的内容，因此可用行内尺寸变窄时字段会增高。
- 指令使用布局的逻辑测量，不读取或设置书写方向；原生 textarea 继续遵循文档或区域的 `dir`。
- 减少动态效果不会影响高度更新，因为指令改变高度时没有使用动画。

## API

### 导出

| 导出                      | 说明                                |
| ------------------------- | ----------------------------------- |
| `vTextareaAutosize`       | 用于原生 textarea 元素的 Vue 指令。 |
| `TextareaAutosizeOptions` | 指令值类型。                        |

### 选项

| 值        | 类型      | 默认值             | 说明                                                                                           |
| --------- | --------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `minRows` | `number`  | textarea 的 `rows` | 内容少时保留的最小可见行数。                                                                   |
| `maxRows` | `number`  | `0`（不限）        | 达到上限后在 textarea 内纵向滚动。                                                             |
| `enabled` | `boolean` | `true`             | 启用自动调整。设为 `false` 时，指令恢复原有内联 `height` 和 `overflow-y`；字段仍可编辑和提交。 |

指令没有事件、插槽或公开方法。

## 样式

指令不暴露 CSS 自定义属性，也不添加包装元素或类名。它只改变内联高度，并在达到上限时改变 `overflow-y`。所有视觉样式来自 textarea 自身的 CSS。

请为字段保留可见的边框或背景：指令改变几何，不改变校验或焦点样式。固定的 `box-sizing: border-box` 和明确的行高可让测量更可预测。

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [指南](https://m3.material.io/components/text-fields/guidelines) · [规格](https://m3.material.io/components/text-fields/specs) · [无障碍](https://m3.material.io/components/text-fields/accessibility)
