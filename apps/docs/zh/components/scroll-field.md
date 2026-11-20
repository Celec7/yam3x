<script setup lang="ts">
import ScrollFieldExample from '../../components/demos/ScrollFieldExample.vue'
</script>

# 滚轮字段

`ScrollField` 通过垂直滚动列表选择数值和计量值。它是 Material 3 Expressive 组件：支持三种尺寸、有限或循环列表，以及滚动与文本输入两种模式。选择时间请使用[时间选择器](/zh/components/time-picker)；需要精确或长文本输入时使用文本字段。Compose Material 3 仅用无限分页实现滚轮，输入模式、标签和错误由调用方组合。

## 示例

### 数值、尺寸与状态

滚轮按字段的 locale 格式化数值，居中项吸附并在停止后提交。三种尺寸对应 Material 的一到两位、三位和四位数字最小宽度；禁用字段的内容保持 38% 不透明度。

<div class="vp-raw yam3x-doc-demo-theme"><ScrollFieldExample /></div>

::: details 查看示例源码

<<< ../../components/demos/ScrollFieldExample.vue{vue}

:::

### 滚动与键盘

可用鼠标、触控笔或手指拖动，使用滚轮或触控板，或在字段获得焦点时按方向键。滚动停止时会以 Material fast spatial 弹簧吸附到最近的值。上、下键选择相邻值，Page Up/Page Down 移动五个步长，Home/End 跳到首尾值。启用 `loop` 后，键盘与点击选择都会在范围两端循环。

每一行至少保留 48 px 指针目标，即使部分位于容器之外。行本身不可单独聚焦：整个字段是一个 `spinbutton`，向辅助技术提供值、范围和值文本。

### 文本输入模式

Material 要求每个滚轮字段都能用文本输入。绑定 `v-model:mode` 并提供切换控件：示例把字段切换为原生数字输入，并使用激活态描边与光标。Enter 或失焦提交有效值；无效输入保留草稿、标记字段无效并触发 `invalid`。绑定 `error` 可在字段下方显示消息。

### 标签与多字段

Material 将标签排除在字段结构之外。将 `label` 作为无障碍名称，并在字段旁放置可见标签。多个字段跟踪不同数值时，为每个字段加标签并并排布置。

## 在应用中使用

完成[安装](/zh/guide/start/installation)后，用 CLI 添加 `scroll-field`。它会复制组件及其工具模块，因此请通过 `./components/yam3x/` 这类使用方路径导入。示例源码中的 `@registry` 路径仅用于本站。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ScrollField } from './components/yam3x/scroll-field'

const minutes = ref(30)
const mode = ref<'scroll' | 'input'>('scroll')
</script>

<template>
  <ScrollField
    v-model="minutes"
    v-model:mode="mode"
    label="Minutes"
    unit="minutes"
    :min="0"
    :max="59"
    name="minutes"
  />
</template>
```

在字段旁放置带标签的模式切换，确保文本输入始终可达，并在应用模型中保存已提交值。`name` 会生成原生表单提交所需的隐藏输入；模式切换和可见标签由应用负责。

## 行为与无障碍

- 字段是单个焦点停靠点与单个 `spinbutton`。方向键移动选择；Page Up/Page Down 移动五个值；Home/End 跳到两端。
- 值、范围和格式化值文本会一起暴露，因此提交变化后屏幕阅读器会朗读当前选择。
- 文本输入使用数字键盘、激活态的 primary 描边与光标，并暴露相同的值与范围属性。Enter 或失焦提交；无效草稿保持可见并标记 `aria-invalid`。
- 焦点指示器为 3 px 的 `secondary` 描边、外偏移 2 px。指针目标至少 48 px 高，禁用字段移出 Tab 顺序。
- 减少动效时移除选择和状态层过渡，但不改变已提交的值。
- 强制颜色模式下绘制 `CanvasText` 边界，并让选中值保持 `CanvasText`。
- 数值使用 locale 的数字与分隔符。滚轮是垂直的，因此不强制阅读方向。

## API

| 属性                    | 类型                             | 默认值     | 说明                                    |
| ----------------------- | -------------------------------- | ---------- | --------------------------------------- |
| `modelValue`            | `number`                         | —          | `v-model`；当前选中值。                 |
| `min` / `max`           | `number`                         | `0` / `59` | 含端点范围。                            |
| `step`                  | `number`                         | `1`        | 步长；小数步长按其小数位数格式化。      |
| `size`                  | `'small' \| 'medium' \| 'large'` | `'medium'` | 最小宽度分别为 100、120、186 px。       |
| `loop`                  | `boolean`                        | `false`    | 在范围两端循环。                        |
| `label`                 | `string`                         | 必填       | 无障碍名称；可见标签放在字段外。        |
| `unit`                  | `string`                         | `''`       | 追加到 `aria-valuetext`。               |
| `mode`                  | `'scroll' \| 'input'`            | `'scroll'` | `v-model:mode`；当前编辑模式。          |
| `locale`                | `string`                         | 浏览器     | 数值格式化与解析所用的 locale。         |
| `disabled` / `readonly` | `boolean`                        | `false`    | 禁用交互或只允许提交。                  |
| `required`              | `boolean`                        | `false`    | 暴露 `aria-required`。                  |
| `error`                 | `string`                         | `''`       | 字段下方消息；同时设置 `aria-invalid`。 |
| `name` / `form`         | `string`                         | —          | 为原生表单提交添加隐藏输入。            |

事件：选择提交后触发 `change(value)`；文本输入无法提交时触发 `invalid(detail)`；文本草稿成功提交时触发 `valid`。

## 样式

`--yam3x-scroll-field-height` 设置容器高度（默认 200 px，最小 120 px）。`--yam3x-scroll-field-width` 覆盖尺寸宽度，例如填满网格单元。字段的颜色、字体角色、形状和动效映射到系统令牌；请通过主题而不是逐实例的颜色覆盖来调整。

## Material 参考

[滚轮字段概览](https://m3.material.io/components/scroll-fields/overview) · [规范](https://m3.material.io/components/scroll-fields/specs) · [指南](https://m3.material.io/components/scroll-fields/guidelines) · [无障碍](https://m3.material.io/components/scroll-fields/accessibility)
