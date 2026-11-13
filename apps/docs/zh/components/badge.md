<script setup lang="ts">
import BadgeExample from '../../components/demos/BadgeExample.vue'
import BadgePositionsExample from '../../components/demos/BadgePositionsExample.vue'
</script>

# 徽标

徽标在图标或导航目标旁显示通知、计数或简短状态。它是次要指示器，不是独立控件。

徽标是 Material 3 基线组件。本项目为图标导航以外的布局增加了逻辑位置；表面、排版、颜色和固定圆点几何遵循 Material 徽标规范。

## 示例

### 锚定徽标

<div class="vp-raw yam3x-doc-demo-theme"><BadgeExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BadgeExample.vue{vue}

:::

没有渲染内容的徽标显示为 6 px 圆点。有内容时显示大徽标：`3` 使用标准标签度量，`999+` 切换为紧凑的四字符度量。`for` 让每个徽标始终定位在对应目标上，应用在消息读完后隐藏圆点。

### 定位与方向

<div class="vp-raw yam3x-doc-demo-theme"><BadgePositionsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BadgePositionsExample.vue{vue}

:::

画廊覆盖八种逻辑位置。前侧和后侧遵循书写方向；`above-after` 是默认值，对应 Material 的右上角位置。方向控件会镜像整个画廊，而不改变任何位置值。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from './components/yam3x/badge'

const unread = ref(true)
const open = ref(false)
</script>

<template>
  <span class="badge-anchor">
    <button
      id="inbox"
      type="button"
      @click="open = true"
    >
      收件箱
    </button>
    <Badge
      for="inbox"
      aria-label="3 条未读消息"
      :hidden="!unread"
      >3</Badge
    >
  </span>
</template>

<style scoped>
.badge-anchor {
  position: relative;
  display: inline-flex;
}
</style>
```

徽标需要跟随目标时，请把它放进定位包装元素，并提供描述含义而不是只重复数字的可访问名称。激活由目标控件负责；徽标设置 `pointer-events: none`，不会进入 Tab 顺序。如果目标控件已在可访问名称中包含计数，请对辅助技术隐藏徽标或省略其标签，避免重复播报。

::: details 圆点与缩写计数

```vue
<template>
  <span class="badge-anchor">
    <button
      id="alerts"
      type="button"
    >
      提醒
    </button>
    <Badge
      for="alerts"
      aria-label="有新提醒"
    />
  </span>
  <span class="badge-anchor">
    <button
      id="activity"
      type="button"
    >
      动态
    </button>
    <Badge
      for="activity"
      aria-label="超过 999 条未读内容"
      >999+</Badge
    >
  </span>
</template>
```

Badge 不计数、不截断，也不自动缩写。大徽标内容最多四个字符（包含 `+`），缩写由应用计算。

:::

## 行为与无障碍

### 内容与尺寸

- 组件根据 slot 的渲染结果选择形态：没有内容或只有空白时显示小圆点；渲染任何元素或非空白文本时显示大徽标。
- 大徽标对一至三个字符使用 11 px 标签度量。四个字符（包含 `+`）使用 10 px 紧凑度量与 4 px 内联内边距，以保持在 16 × 34 dp 的最大范围内。
- Badge 不截断或改写内容。更长文本仍使用紧凑度量，并可能超出预期的计数形状，因此请在应用中缩写。
- `0` 是普通内容。组件不会自动隐藏零计数；计数归零时请设置 `hidden`。
- 徽标带有 `role="img"`，没有焦点目标。圆点形态会把内容对辅助技术隐藏。

### 定位与 RTL

- `position` 表示逻辑边缘：`above`、`below`、`before`、`after` 及其角部组合。默认是 `above-after`。
- 在从右到左布局中，`before` 和 `after` 会镜像；`above` 和 `below` 保持垂直。仅当周围方向无法提供正确书写方向时才设置 `dir`。
- 目标移动、缩放或稍后插入时，徽标会继续跟随。在目标存在并完成位置测量之前，已附加的徽标保持不可见。
- 目标缺失或重命名时，徽标保持未附加状态，不会猜测新的锚点。

### 已读状态

- 已读状态由父级控制。目标被选择后隐藏导航徽标，仅在未读条件再次出现时恢复。
- `hidden` 会把徽标从布局和无障碍树中移除。不要只通过颜色传达未读状态。

### 对比度与强制颜色

- 默认使用 Error 与 On Error 角色，确保徽标在两种主题下都能与周围内容区分并保持可读。自定义颜色对需要在两个方向上至少保持 3:1 对比度。
- 强制颜色模式下，徽标保留可见边界并使用系统颜色，而不是主题填充。

## API

### 导出

| 导出    | 说明                             |
| ------- | -------------------------------- |
| `Badge` | 锚定在项目旁的圆点或计数指示器。 |

### 属性与模型

小徽标从 [LocaleProvider](/zh/components/localization) 的 `actions.newNotification` 继承本地化标签，默认是 `New notification`；`locale` 覆盖语言，`aria-label` 覆盖标签。

| 属性与原生特性 | 默认值                     | 说明                                                                                                            |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `position`     | `above-after`              | 逻辑位置：`above-after`、`above-before`、`below-after`、`below-before`、`above`、`below`、`before` 或 `after`。 |
| `for`          | 未定义                     | 同一 document 或 shadow root 中目标的 ID。徽标会跟随该目标。                                                    |
| `dir`          | 继承自目标                 | 显式 `ltr` 或 `rtl` 方向，用于逻辑定位。                                                                        |
| `aria-label`   | 圆点为 `New notification`  | 可访问名称。大徽标没有默认值，请为计数显式命名。                                                                |
| `locale`       | Provider，再回退到 `en-US` | 默认圆点标签的语言。                                                                                            |
| `hidden`       | `false`                    | 原生隐藏状态；应用在目标被查看后设置。                                                                          |

### 事件

Badge 不触发事件。

### 插槽

| 插槽      | 用途                                       |
| --------- | ------------------------------------------ |
| `default` | 徽标内容。空内容或空白内容渲染为圆点形态。 |

### 方法

Badge 不暴露实例方法。

## 样式

Badge 暴露的项目覆盖项映射到 Material 徽标规范与共享 System token。小圆点的 6 px 尺寸和完整圆角形状是固定的；大徽标默认高度和最小宽度为 16 px。

::: details 自定义属性

| 属性                                 | 默认值                       | 说明                                                     |
| ------------------------------------ | ---------------------------- | -------------------------------------------------------- |
| `--yam3x-badge-container-color`      | System `error`               | 徽标容器颜色。与周围内容至少保持 3:1 对比度。            |
| `--yam3x-badge-color`                | System `on-error`            | 徽标标签颜色。与容器至少保持 3:1 对比度。                |
| `--yam3x-badge-large-size`           | `16px`                       | 大徽标的高度和最小宽度。                                 |
| `--yam3x-badge-large-font-size`      | System Label Small           | 大徽标标签字号。                                         |
| `--yam3x-badge-large-font-weight`    | System Label Small           | 大徽标标签字重。                                         |
| `--yam3x-badge-large-line-height`    | System Label Small           | 大徽标标签行高。                                         |
| `--yam3x-badge-large-tracking`       | System Label Small           | 大徽标标签字符间距。                                     |
| `--yam3x-badge-long-label-font-size` | `10px`                       | 超过三个字符的标签字号。                                 |
| `--yam3x-badge-long-label-tracking`  | `0.1px`                      | 超过三个字符的标签字符间距。                             |
| `--yam3x-badge-small-offset`         | 小 `6px`；大 `14px` × `12px` | 锚点偏移（像素）。提供的标量会同时应用到水平和垂直位置。 |

:::

## Material 参考

[徽标概览](https://m3.material.io/components/badges/overview) · [指南](https://m3.material.io/components/badges/guidelines) · [规格](https://m3.material.io/components/badges/specs) · [无障碍](https://m3.material.io/components/badges/accessibility)
