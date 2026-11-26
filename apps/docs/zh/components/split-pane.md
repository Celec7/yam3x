<script setup lang="ts">
import SplitPaneExample from '../../components/demos/SplitPaneExample.vue'
import SplitPaneContentHeightExample from '../../components/demos/SplitPaneContentHeightExample.vue'
</script>

# Split pane

Split pane 将主要内容与相关辅助内容并排放置，并允许调整分隔比例。两个区域都需要保持可见，且相对空间值得调整时使用它。

Split pane 是项目扩展。Material 描述了[辅助窗格](/zh/guide/foundations/layout)布局，但没有定义独立可拖动组件；Compose Material 3 也没有直接基元，最接近的组合是带可拖动分隔器的 `Row` 或 `Box`。紧凑宽度单窗格切换、compact 与 expanded 断点以及分隔器交互都属于项目决策。分隔器语义和键盘行为遵循 [WAI-ARIA window splitter 模式](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)。

## 示例

### 可调整的辅助窗格

<div class="vp-raw yam3x-doc-demo-theme"><SplitPaneExample /></div>

演示以 66% 的起始窗格开始，停靠点为 25、50、66 和 75。可以拖动分隔器，或将焦点移到分隔器后使用方向键。控件可切换方向、为 RTL 镜像布局、禁用调整、移除任一窗格、切换紧凑窗格，并调用 `collapse()` 与 `expand()`。输出显示已接受的比例和完成变更的次数。

::: details 查看演示源码

<<< ../../components/demos/SplitPaneExample.vue{vue}

:::

### 内容高度与页面滚动

<div class="vp-raw yam3x-doc-demo-theme"><SplitPaneContentHeightExample /></div>

`content-height` 让外层滚动容器拥有纵向滚动。在任一窗格内滚动：页面移动，分隔器显示为全高线条。收起起始窗格可看到 inert 窗格不再贡献高度。

::: details 查看演示源码

<<< ../../components/demos/SplitPaneContentHeightExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

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
    <template #start>
      <main>主要内容</main>
    </template>
    <template #end>
      <aside>相关辅助内容</aside>
    </template>
  </SplitPane>
</template>
```

默认为外层容器提供高度；组件会填满它，每个窗格管理自己的滚动。当页面级滚动容器应拥有纵向滚动时，设置 `content-height`：组件随内容增长，窗格不再形成滚动容器，分隔器渲染为全高线条。`content-height` 仅适用于水平窗格；垂直窗格保留由比例控制的高度和自己的滚动。将主要任务放在 `#start`，将支持它的内容放在 `#end`。

::: details 紧凑切换与受控收起

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SplitPane } from './components/yam3x/split-pane'

const width = ref(66)
const compactPane = ref<'primary' | 'supporting'>('primary')
const pane = ref<InstanceType<typeof SplitPane> | null>(null)
</script>

<template>
  <div>
    <button
      type="button"
      @click="compactPane = compactPane === 'primary' ? 'supporting' : 'primary'"
    >
      切换紧凑窗格
    </button>
    <button
      type="button"
      @click="pane?.collapse()"
    >
      收起
    </button>
    <button
      type="button"
      @click="pane?.expand()"
    >
      展开
    </button>
    <SplitPane
      ref="pane"
      v-model="width"
      v-model:compact-pane="compactPane"
      orientation="auto"
      label="主要内容"
    >
      <template #start><main>主要内容</main></template>
      <template #end><aside>辅助内容</aside></template>
    </SplitPane>
  </div>
</template>
```

`compactPane` 只在 `orientation="auto"` 且低于 600px 时生效。目的地切换和路由变化由外层 scaffold 负责；组件只分配空间。

:::

## 行为与无障碍

### 指针调整

- 在分隔器上按下指针会捕获指针并聚焦分隔器。鼠标、触控和触笔使用同一路径。
- 指针移动会合并到单个动画帧，只应用最新位置；数值变化时发出 `input`。
- 越过 `min` 或 `max` 时最多预览 `overshootLimit` 个百分点的越界回弹，但接受值始终在范围内。
- 释放后吸附到最近停靠点，然后为一次完整交互发出一个 `change`。没有停靠点时会保留释放位置。
- 拖动改变了数值后，`pointercancel` 会恢复到拖动起始值。被取消的 `beforeinput` 也会阻止数值变化。
- 停靠吸附过程中可以再次抓住分隔器，而不会跳回吸附后的位置。

### 键盘

- 分隔器是单个 Tab 停靠点。水平布局使用左右方向键；垂直布局使用上下方向键。
- 设置停靠点时，方向键移动到相邻停靠点。Home 和 End 移动到首个和最后一个允许的停靠点。
- Page Up 和 Page Down 移动到上一个或下一个停靠点；未设置停靠点时至少移动 10 个百分点。
- Enter 收起到首个停靠点或 `min`，再次按下恢复之前的展开比例。Space 切换到下一个停靠点，`wrapDetents` 可选择循环。
- RTL 中，左方向键增加起始窗格，右方向键减少起始窗格，按键跟随物理移动方向。
- `disabled` 设置 `tabindex="-1"` 和 `aria-disabled="true"`，并阻止指针和键盘调整。
- 焦点使用共享的 3px secondary 内嵌环。

### 方向与断点

- `orientation="horizontal"` 并排显示窗格；`vertical` 上下堆叠。分隔器的 `aria-orientation` 与窗格方向相反。
- `orientation="auto"` 在低于 600px 时显示一个窗格，600px 到 839px 上下显示两个窗格，840px 及以上并排显示两个窗格。
- 紧凑宽度下分隔器被移除，`v-model:compact-pane` 选择 `primary` 或 `supporting`，默认 `primary`。
- 方向变化时保留比例。中等和展开布局中分隔器仍可调整。
- 没有可见子元素的窗格视为不存在。任一窗格为空时，分隔器消失，剩余窗格填满容器。

### 内容高度与滚动所有权

- `content-height` 是面向“页面拥有纵向滚动”的水平窗格的项目扩展。
- 根节点增长到最高窗格，两个窗格使用 `overflow: visible`，滚轮交给最近的滚动祖先。窗格不再形成独立滚动容器。
- 分隔器变成全高线条。悬停加粗到 2px；键盘焦点以 secondary 色加粗到 3px。24px 轨道仍是拖拽目标。
- 只有 0% 或 100% 时 `inert` 的窗格停止贡献高度。折叠到正数 `min` 或首个 detent 的窗格仍然可见并贡献高度。
- 此模式不处理行内溢出：内容必须适配窗格的行内尺寸。内部独立滚动区域仍负责在边界处传递滚动。
- 垂直窗格忽略 `content-height`，因为高度就是比例轴。`orientation="auto"` 只在解析为水平时应用该模式。

### 状态归属

`v-model` 拥有分配给起始窗格的已接受百分比。组件测量可用空间、限制到 `min` 和 `max`、吸附到 `detents` 并提出变更；它不保存路由、窗格内容或第二份比例。应用拥有每个窗格显示的内容、紧凑目的地切换，以及断点处需要变化的布局。

### RTL 与国际化

- 内缩、窗格顺序和指针方向遵循书写方向。RTL 中起始窗格在右侧，LTR 中在左侧。
- 默认 `aria-valuetext` 是英文 `"Start pane N%, end pane N%"`。界面不是英文时，应传入本地化的 `valueText`。
- `label` 为必填，应命名分隔器控制的主要窗格。它同时是分隔器的无障碍名称。

## API

### 导出

| 导出                   | 类型 | 用途                                       |
| ---------------------- | ---- | ------------------------------------------ |
| `SplitPane`            | 组件 | 带命名分隔器的可调整双窗格布局。           |
| `SplitPaneOrientation` | 类型 | `'horizontal'`、`'vertical'` 或 `'auto'`。 |

### 属性与模型

| 属性与模型               | 类型                                   | 默认值         | 说明                                                             |
| ------------------------ | -------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `v-model` / `modelValue` | `number`                               | `50`           | 起始窗格占可用空间的已接受百分比。                               |
| `v-model:compact-pane`   | `'primary' \| 'supporting'`            | `'primary'`    | `auto` 模式下低于 600px 时显示的窗格。                           |
| `min`、`max`             | `number`                               | `0`、`100`     | 已接受边界，限制在 0–100。                                       |
| `step`                   | `number`                               | `1`            | 无停靠点时的键盘步长。非正值回退到 `1`。                         |
| `detents`                | `number[]`                             | `[]`           | 吸附点；会限制、去重并排序。首尾停靠点同时定义收起和展开。       |
| `wrapDetents`            | `boolean`                              | `false`        | Space 从最后一个停靠点循环到第一个。                             |
| `orientation`            | `'horizontal' \| 'vertical' \| 'auto'` | `'horizontal'` | 布局方向或响应式行为。                                           |
| `contentHeight`          | `boolean`                              | `false`        | 仅水平的页面滚动模式：随内容增长、移除窗格滚动、渲染全高分隔线。 |
| `label`                  | `string`                               | 必填           | 分隔器的无障碍名称；应命名主要窗格。                             |
| `valueText`              | `string`                               | 生成的英文文本 | 当前窗格比例的无障碍描述。                                       |
| `disabled`               | `boolean`                              | `false`        | 禁用指针和键盘调整。                                             |
| `overshootLimit`         | `number`                               | `4`            | 拖动越界时的视觉回弹幅度，单位为百分点。                         |

### 事件

| 事件          | 载荷                            | 说明                                             |
| ------------- | ------------------------------- | ------------------------------------------------ |
| `beforeinput` | `(event: Event, value: number)` | 数值变化前发出，可调用 `preventDefault()` 取消。 |
| `input`       | `(event: Event, value: number)` | 拖动或调整期间的连续更新。                       |
| `change`      | `(event: Event, value: number)` | 一次完成的交互。                                 |

相同的原生事件也会从根元素冒泡，因此可在组件或外层元素上监听 `@beforeinput`、`@input` 和 `@change`。

### 插槽

| 插槽    | 作用域 | 用途           |
| ------- | ------ | -------------- |
| `start` | —      | 逻辑起始窗格。 |
| `end`   | —      | 逻辑末尾窗格。 |

### 方法

通过模板 ref 访问。

| 成员                 | 签名                      | 说明                                     |
| -------------------- | ------------------------- | ---------------------------------------- |
| `collapse()`         | `() => void`              | 将起始窗格吸附到首个停靠点或 `min`。     |
| `expand()`           | `() => void`              | 将起始窗格吸附到最后一个停靠点或 `max`。 |
| `snapToValue(value)` | `(value: number) => void` | 吸附到最近的已接受停靠点边界值。         |
| `separator`          | `HTMLElement \| null`     | 已渲染的分隔器元素；挂载前为 null。      |

## 样式

分隔器使用项目定义的 24px 全高轨道和 4px 可见把手。它是连续调整目标，因此不会扩展到 48px 离散控件目标。把手颜色、状态透明度、焦点颜色、按下形状和过渡默认引用共享 System token；由于 Material 没有为辅助布局定义独立可调整分隔器，尺寸和交互外观属于项目定义。

| 区域       | 支持的属性                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 手柄几何   | `--yam3x-split-pane-drag-handle-container-width`、`--yam3x-split-pane-drag-handle-width`、`--yam3x-split-pane-drag-handle-height`、`--yam3x-split-pane-drag-handle-shape`、`--yam3x-split-pane-drag-handle-pressed-width`、`--yam3x-split-pane-drag-handle-pressed-height`、`--yam3x-split-pane-drag-handle-pressed-shape` |
| 手柄颜色   | `--yam3x-split-pane-drag-handle-color`、`--yam3x-split-pane-drag-handle-hover-color`、`--yam3x-split-pane-drag-handle-focus-color`、`--yam3x-split-pane-drag-handle-pressed-color`                                                                                                                                         |
| 状态透明度 | `--yam3x-split-pane-drag-handle-hover-opacity`、`--yam3x-split-pane-drag-handle-focus-opacity`                                                                                                                                                                                                                             |

将这些属性设置在 SplitPane 根元素上。默认把手过渡为 0.15s；减少动态效果会移除它。

## Material 参考

[辅助窗格布局](https://m3.material.io/foundations/layout/canonical-examples/supporting-pane) · [列表详情布局](https://m3.material.io/foundations/layout/canonical-examples/list-detail) · [WAI-ARIA window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)
