<script setup lang="ts">
import BottomSheetDetentsExample from '../../components/demos/BottomSheetDetentsExample.vue'
import BottomSheetExample from '../../components/demos/BottomSheetExample.vue'
</script>

# Bottom sheets

Bottom sheet 从屏幕边缘呈现辅助内容或操作。Standard sheet 与主界面并存；modal sheet 会管理焦点、阻止与背景交互并添加 scrim。紧凑布局优先使用 modal sheet；页面需要保持可交互时使用 standard sheet。

## 示例

### 标准与模态底部表单

演示会打开一个高度随内容变化的标准表单，以及一个初始高度不超过视口一半的模态表单。两个表单都会报告生命周期事件，手势或控件变化会更新当前停靠点。在较宽窗口下，演示还会展示相同上下文内容的 side sheet 替代方案。

<div class="vp-raw yam3x-doc-demo-theme"><BottomSheetExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BottomSheetExample.vue{vue}

:::

### 自定义停靠点

停靠点可以是命名值、百分比、像素字符串或数字。切换单位即可看到同一表单以不同的项目定义高度打开。

<div class="vp-raw yam3x-doc-demo-theme"><BottomSheetDetentsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BottomSheetDetentsExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BottomSheet, BottomSheetAction } from './components/yam3x/bottom-sheet'

const open = ref(false)
</script>

<template>
  <button
    type="button"
    @click="open = true"
  >
    打开选项
  </button>
  <BottomSheet
    v-model:open="open"
    variant="modal"
    label="更多选项"
  >
    <template #header>更多选项</template>
    <p>选择所需操作。</p>
    <BottomSheetAction>完成</BottomSheetAction>
  </BottomSheet>
</template>
```

::: details 组合停靠点、触发器插槽与方法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BottomSheet, BottomSheetAction } from './components/yam3x/bottom-sheet'

const sheet = ref<InstanceType<typeof BottomSheet> | null>(null)
const open = ref(false)
const detent = ref<'fit' | 'expanded'>('fit')
</script>

<template>
  <BottomSheet
    ref="sheet"
    v-model:open="open"
    v-model:detent="detent"
    :detents="['fit', 'expanded']"
    handle
    hideable
    label="辅助面板"
  >
    <template #trigger="{ triggerProps }">
      <button
        v-bind="triggerProps"
        type="button"
      >
        打开辅助面板
      </button>
    </template>
    <template #header>辅助面板</template>
    <p>表单内容。</p>
    <button
      type="button"
      @click="sheet?.requestDetent('expanded')"
    >
      展开
    </button>
    <BottomSheetAction>完成</BottomSheetAction>
  </BottomSheet>
</template>
```

:::

## 行为与无障碍

### 键盘

- 焦点位于表单内时，方向键上、下可切换当前停靠点。
- 拖动手柄和默认 Resize 按钮可用 Enter 或 Space 切换停靠点；拖动手柄还响应单指针操作。
- 模态表单会将 Tab 和 Shift+Tab 限制在表单内，直到关闭。
- Escape 可关闭标准表单，也可关闭模态表单。

### 焦点与关闭

- 关闭的标准表单会设置 `inert` 与 `aria-hidden`，其控件不进入 Tab 顺序。
- 标准表单始终显示标注明确的关闭按钮；展开时还会显示独立的收起操作，回到最低停靠点。只有在内容提供自己的可见关闭控件时才设置 `showCloseButton=false`；Escape、scrim 点击和拖动不能替代可见控件。
- 模态表单在每个停靠高度都显示标注明确的关闭按钮，也可通过 Escape 或点击 scrim 关闭；启用 `handle` 时，在手柄区域向下滑动也可关闭。关闭后焦点返回打开它的元素。
- 组件主动关闭时，会先触发 `cancel`，再触发 `closing`。在任一事件上调用 `preventDefault()` 都可保持表单打开。
- 父级对 `v-model:open` 的更新具有权威性，不会被组件事件取消，因此外部状态变化始终生效。
- 模态表单会在不高于视口一半的最高停靠点打开。关闭时会保留当前停靠点，再次打开时恢复。

### 停靠点与状态

- 受控的 `detent` 具有权威性，包括 modal 首次打开时；其值必须包含在 `detents` 中。
- 命名停靠点为 `collapsed`、`fit`、`partially-expanded` 和 `expanded`。`collapsed`、百分比、像素字符串和数字属于项目扩展。
- 数字停靠点按 CSS 像素解释。`fit` 跟随表单内容，`expanded` 在顶部边缘下方停止。
- `hideable` 允许标准表单通过将手柄拖到最低停靠点以下或越过最高停靠点关闭。启用 `handle` 时，模态表单也可通过向下滑动关闭。

### 响应式与 RTL

- 模态表单默认最宽 640px。可通过 `maxWidth` 或宽度自定义属性修改上限。
- 较宽视口下表单顶部保留 56px，宽度不超过 640px 时保留 72px。
- 内容与动效跟随文档方向；表单始终锚定在底部边缘。

## API

### 导出

| 导出                 | 说明                                     |
| -------------------- | ---------------------------------------- |
| `BottomSheet`        | 表单容器与行为。                         |
| `BottomSheetAction`  | 请求关闭的原生操作按钮。                 |
| `BottomSheetDetent`  | `detent` 模型和 `detents` 项使用的类型。 |
| `BottomSheetVariant` | `variant` 属性使用的类型。               |

### `BottomSheet` 属性与模型

| 属性 / 模型       | 类型                                | 默认值                                                                | 说明                                                                                                                      |
| ----------------- | ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variant`         | `'standard' \| 'modal'`             | `'standard'`                                                          | 标准 sheet 与页面并存；模态 sheet 管理焦点并遮罩背景。                                                                    |
| `open`            | `v-model:open: boolean`             | `false`                                                               | 控制显示状态。                                                                                                            |
| `detent`          | `v-model:detent: BottomSheetDetent` | 标准 `fit`，模态 `partially-expanded`                                 | 当前停靠高度，必须包含在 `detents` 中。可用值：`collapsed`、`fit`、`partially-expanded`、`expanded`、百分比、像素或数字。 |
| `detents`         | `BottomSheetDetent[]`               | 标准 `['fit', 'expanded']`；模态 `['partially-expanded', 'expanded']` | 按高度从低到高排列的停靠点。模态默认在视口高度不超过一半的最高停靠点打开。                                                |
| `hideable`        | `boolean`                           | `false`                                                               | 是否允许标准 sheet 通过将手柄拖到最低停靠点以下或越过最高停靠点隐藏。启用 `handle` 时，模态 sheet 也可通过向下滑动关闭。  |
| `handle`          | `boolean`                           | `false`                                                               | 显示可拖动且可通过键盘激活的调整手柄。                                                                                    |
| `label`           | `string`                            | —                                                                     | sheet 的可访问名称；未提供时使用 `header` 标题，再回退到本地化默认值。                                                    |
| `handleLabel`     | `string`                            | 本地化默认值                                                          | 拖动手柄和默认调整控件的可访问名称。                                                                                      |
| `closeLabel`      | `string`                            | 本地化默认值                                                          | 关闭按钮的可访问名称。                                                                                                    |
| `showCloseButton` | `boolean`                           | `true`                                                                | 是否渲染可见关闭按钮。两种变体默认在每个停靠高度都显示。只有内容提供自己的可见关闭控件时才设为 `false`。                  |
| `collapseLabel`   | `string`                            | 本地化默认值                                                          | 标准 sheet 展开时回到较低停靠点的操作名称。                                                                               |
| `maxWidth`        | `string`                            | `640px`                                                               | 自定义最大宽度。                                                                                                          |
| `locale`          | `string`                            | Provider，再回退到 `en-US`                                            | 覆盖内置操作标签的语言。                                                                                                  |

内置标签继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置；现有标签属性优先于对应的共享默认文案。

### `BottomSheet` 事件

| 事件      | 载荷    | 说明                                                                           |
| --------- | ------- | ------------------------------------------------------------------------------ |
| `opening` | `Event` | 可取消。组件主动请求打开时触发。                                               |
| `opened`  | `Event` | 表单打开后触发。                                                               |
| `closing` | `Event` | 可取消。组件主动请求关闭时触发。                                               |
| `closed`  | `Event` | 表单关闭后触发。                                                               |
| `cancel`  | `Event` | 可取消。组件主动关闭时在 `closing` 前触发；`preventDefault()` 可保持表单打开。 |

### `BottomSheet` 插槽

| 插槽              | 属性                         | 说明                                                                              |
| ----------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `default`         | —                            | 正文内容。                                                                        |
| `trigger`         | `{ triggerProps, activate }` | 自定义触发器。绑定 `triggerProps` 以获得 ARIA 关联和点击处理，或调用 `activate`。 |
| `header`          | —                            | 表单标题；未提供 `label` 时也作为表单名称。                                       |
| `handle`          | —                            | 替换手柄图形。                                                                    |
| `resize-control`  | `{ resize }`                 | 未启用 `handle` 且存在多个停靠点时，替换默认 Resize 按钮。                        |
| `collapse-action` | `{ collapse }`               | 替换标准表单展开时的收起操作。                                                    |

### `BottomSheet` 方法

通过模板 ref 访问。

| 方法                    | 返回      | 说明                                                        |
| ----------------------- | --------- | ----------------------------------------------------------- |
| `close()`               | `boolean` | 通过 `cancel` 与 `closing` 请求关闭；返回请求是否被接受。   |
| `requestOpen(open)`     | `boolean` | 请求指定的显示状态；返回请求是否被接受。                    |
| `requestDetent(detent)` | `void`    | 切换停靠点、更新高度；目标为 `collapsed` 时关闭可隐藏表单。 |

### `BottomSheetAction`

`BottomSheetAction` 渲染原生 `<button>`，并透传属性和监听器。它发出 `click`；若事件未被 `preventDefault()` 阻止，激活后会请求关闭所在表单。

| 事件    | 载荷         | 说明               |
| ------- | ------------ | ------------------ |
| `click` | `MouseEvent` | 在关闭请求前触发。 |

## 样式

以下项目覆盖属性可设置在 sheet 或 scrim 元素上。运行时停靠高度和 `maxWidth` 属性由组件内部管理。Material 定义组件角色与尺寸；这些 CSS 属性名和覆盖行为属于项目 API。

::: details 样式覆盖

**颜色**

| 属性                                   | 默认值                         | 说明             |
| -------------------------------------- | ------------------------------ | ---------------- |
| `--yam3x-bottom-sheet-container-color` | System `surface-container-low` | sheet 容器颜色。 |
| `--yam3x-bottom-sheet-color`           | System `on-surface`            | sheet 内容颜色。 |

**形状与高度**

| 属性                                             | 默认值                   | 说明                             |
| ------------------------------------------------ | ------------------------ | -------------------------------- |
| `--yam3x-bottom-sheet-container-shape`           | System extra-large 圆角  | sheet 顶部圆角。                 |
| `--yam3x-bottom-sheet-minimized-container-shape` | `0`                      | sheet 关闭时的顶部圆角。         |
| `--yam3x-bottom-sheet-expanded-container-shape`  | 容器 shape               | sheet 展开停靠点的顶部圆角。     |
| `--yam3x-bottom-sheet-elevation`                 | System elevation level 1 | sheet 阴影。                     |
| `--yam3x-bottom-sheet-expanded-elevation`        | sheet elevation          | sheet 展开时的阴影。             |
| `--yam3x-bottom-sheet-modal-elevation`           | sheet elevation          | modal sheet 未完全展开时的阴影。 |

**布局与间距**

| 属性                                     | 默认值                                         | 说明                                              |
| ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| `--yam3x-bottom-sheet-width`             | 可用宽度                                       | `max-width` 前应用的可选宽度上限。                |
| `--yam3x-bottom-sheet-max-width`         | `640px`                                        | CSS 最大宽度；`maxWidth` 属性还可施加第二个上限。 |
| `--yam3x-bottom-sheet-top-space`         | `56px`                                         | 宽视口下 sheet 顶部保留的空间。                   |
| `--yam3x-bottom-sheet-compact-top-space` | `72px`                                         | 宽度不超过 640px 时 sheet 顶部保留的空间。        |
| `--yam3x-bottom-sheet-peek-height`       | `96px`                                         | 项目 `collapsed` 停靠点使用的高度。               |
| `--yam3x-bottom-sheet-padding-inline`    | `24px` × System density scale                  | 标题和内容区的行内间距。                          |
| `--yam3x-bottom-sheet-padding-block`     | 标题 `8px`；内容 `24px` × System density scale | 标题和内容区的块间距。                            |

**排版**

| 属性                                       | 默认值                            | 说明             |
| ------------------------------------------ | --------------------------------- | ---------------- |
| `--yam3x-bottom-sheet-header-font-size`    | `24px`                            | 项目标题字号。   |
| `--yam3x-bottom-sheet-header-font-weight`  | `400`                             | 项目标题字重。   |
| `--yam3x-bottom-sheet-header-line-height`  | `32px` × System line-height scale | 项目标题行高。   |
| `--yam3x-bottom-sheet-header-tracking`     | `0`                               | 项目标题字间距。 |
| `--yam3x-bottom-sheet-content-font-size`   | `16px`                            | 内容字号。       |
| `--yam3x-bottom-sheet-content-font-weight` | `400`                             | 内容字重。       |
| `--yam3x-bottom-sheet-content-line-height` | `24px` × System line-height scale | 内容行高。       |
| `--yam3x-bottom-sheet-content-tracking`    | `0.5px`                           | 内容字间距。     |

**手柄**

| 属性                                                | 默认值                      | 说明                              |
| --------------------------------------------------- | --------------------------- | --------------------------------- |
| `--yam3x-bottom-sheet-drag-handle-container-height` | `48px`                      | 可选拖动手柄预留的高度。          |
| `--yam3x-bottom-sheet-handle-width`                 | `32px`                      | 拖动手柄宽度。                    |
| `--yam3x-bottom-sheet-handle-height`                | `4px`                       | 拖动手柄高度。                    |
| `--yam3x-bottom-sheet-handle-shape`                 | `999px`                     | 拖动手柄圆角。                    |
| `--yam3x-bottom-sheet-handle-color`                 | System `on-surface-variant` | 拖动手柄颜色。                    |
| `--yam3x-bottom-sheet-handle-focus-ring-offset`     | `2px`                       | 手柄和 sheet 控件焦点轮廓的偏移。 |

**层叠与 scrim**

| 属性                                 | 默认值                          | 说明                                         |
| ------------------------------------ | ------------------------------- | -------------------------------------------- |
| `--yam3x-bottom-sheet-z-index`       | modal 为 `61`；standard 为 `30` | sheet 的堆叠顺序。                           |
| `--yam3x-bottom-sheet-scrim-color`   | System `scrim`                  | modal scrim 颜色。                           |
| `--yam3x-bottom-sheet-scrim-opacity` | 共享 overlay 默认值（`32%`）    | modal scrim 不透明度；共享默认值是项目决策。 |

:::

## Material 参考

[Bottom sheets 概览](https://m3.material.io/components/bottom-sheets/overview) · [指南](https://m3.material.io/components/bottom-sheets/guidelines) · [规格](https://m3.material.io/components/bottom-sheets/specs) · [无障碍](https://m3.material.io/components/bottom-sheets/accessibility)
