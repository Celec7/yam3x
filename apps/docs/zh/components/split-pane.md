<script setup lang="ts">
import SplitPaneExample from '../../components/demos/SplitPaneExample.vue'
</script>

# Split pane

SplitPane 是项目布局基元，用于在可调整大小的相邻区域中放置相关内容。它不选择路由。紧凑宽度下单窗格切换、展开宽度下可调整的布局比例和像素断点，都是对 Material 辅助窗格布局的项目扩展。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><SplitPaneExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitPaneExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SplitPane } from './components/yam3x/split-pane'

const width = ref(66)
</script>

<template>
  <SplitPane
    v-model="width"
    label="主要内容"
    :min="24"
    :max="76"
    :detents="[24, 50, 66, 76]"
  >
    <template #start><main>主要内容</main></template>
    <template #end><aside>相关辅助内容</aside></template>
  </SplitPane>
</template>
```

## API

| 属性                                | 类型                                   | 默认值         | 说明                                                            |
| ----------------------------------- | -------------------------------------- | -------------- | --------------------------------------------------------------- |
| `v-model`                           | `number`                               | `50`           | start 窗格比例，范围为 0–100%。                                 |
| `min`, `max`                        | `number`                               | `0`, `100`     | 可停靠比例边界。                                                |
| `step`                              | `number`                               | `1`            | 键盘调整步长。                                                  |
| `detents`                           | `number[]`                             | `[]`           | 释放、Home/End 或 Space 使用的百分比停靠点。                    |
| `wrap-detents`                      | `boolean`                              | `false`        | Space 在末尾停靠点是否循环到首个。                              |
| `orientation`                       | `'horizontal' \| 'vertical' \| 'auto'` | `'horizontal'` | 左右、上下或按紧凑、中等、展开视口自适应。                      |
| `compact-pane`                      | `'primary' \| 'supporting'`            | `'primary'`    | `auto` 紧凑模式中显示的窗格；外层 scaffold 提供目的地切换控件。 |
| `label`                             | `string`                               | 必填           | 分隔器的可访问名称；应与主要窗格名称一致。                      |
| `value-text`                        | `string`                               | 自动生成       | 更适合读屏的当前窗格比例描述。                                  |
| `disabled`                          | `boolean`                              | `false`        | 禁止键盘及指针调整。                                            |
| `overshoot-limit`                   | `number`                               | `4`            | 拖过边界时的视觉回弹幅度，单位为百分点。                        |
| `#start`, `#end`                    | slot                                   | —              | 逻辑起始窗格与逻辑末尾窗格。                                    |
| `@beforeinput`, `@input`, `@change` | event                                  | —              | 取消、连续更新和调整完成事件；均携带事件与百分比。              |

## 行为与无障碍

`v-model` 是 start 窗格占可用空间的百分比。通过 `min`、`max`、`step` 和 `detents` 控制拖动边界、键盘步长和释放后的吸附位置。分隔器使用 `label` 标识它控制的主窗格，左右键在 RTL 中按物理方向工作。`orientation="auto"` 下，紧凑宽度一次显示一个窗格；`v-model:compact-pane` 选择主要或辅助窗格。这种紧凑模式切换是项目决定；Material 辅助窗格示例在紧凑宽度下也将辅助内容放在主要区域下方，可使用 bottom sheet 保持对主要区域的关注。中等宽度将辅助内容放在主要内容下方。展开宽度并排显示两个窗格，分隔器仍可调整；Material 示例则使用固定 360dp 宽的辅助区域。

鼠标、触控和触笔拖动均跟随指针，键盘支持方向键、Home/End、PageUp/PageDown 和 Enter；Space 在设置 `detents` 时切换到下一停靠点。拖动期间发出 `input`，结束时发出 `change`；`beforeinput` 可取消用户值变更。组件暴露 `collapse()`、`expand()` 和 `snapToValue(value)`。

## 样式

在 SplitPane 根元素上设置这些项目定义的 Component 属性。拖动手柄的颜色、状态透明度、焦点颜色、按下形状和过渡默认引用共享 System token；Material 未为辅助窗格布局定义独立的可调整分隔器，因此手柄尺寸和交互外观由项目定义。

| 区域       | 支持的属性                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 手柄几何   | `--yam3x-split-pane-drag-handle-container-width`、`--yam3x-split-pane-drag-handle-width`、`--yam3x-split-pane-drag-handle-height`、`--yam3x-split-pane-drag-handle-shape`、`--yam3x-split-pane-drag-handle-pressed-width`、`--yam3x-split-pane-drag-handle-pressed-height`、`--yam3x-split-pane-drag-handle-pressed-shape` |
| 手柄颜色   | `--yam3x-split-pane-drag-handle-color`、`--yam3x-split-pane-drag-handle-hover-color`、`--yam3x-split-pane-drag-handle-focus-color`、`--yam3x-split-pane-drag-handle-pressed-color`                                                                                                                                         |
| 状态透明度 | `--yam3x-split-pane-drag-handle-hover-opacity`、`--yam3x-split-pane-drag-handle-focus-opacity`                                                                                                                                                                                                                             |

## Material 参考

[辅助窗格布局](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane) · [列表详情布局](https://m3.material.io/foundations/layout/canonical-examples/list-detail)
