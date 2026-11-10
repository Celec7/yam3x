<script setup lang="ts">
import SwitchExample from '../../components/demos/SwitchExample.vue'
import SwitchFormExample from '../../components/demos/SwitchFormExample.vue'
import SwitchIconsExample from '../../components/demos/SwitchIconsExample.vue'
</script>

# Switch

开关用于开启或关闭某个项目的选择。开关是让用户调整设置的最佳方式。

`Switch` 是 Material 组件。图标映射、按下时的滑块过渡和自定义滑块插槽是项目决策，见下文。

## 示例

### 基础

演示为每个设置提供稳定的标签和可选说明。前几个开关立即生效，自定义滑块内容接收接受状态，最后一个示例保持禁用并保留未选中图标。

<div class="vp-raw yam3x-doc-demo-theme"><SwitchExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SwitchExample.vue{vue}

:::

### 图标与方向

`icons="selected"` 仅在开启时显示对勾，`icons="both"` 在关闭时额外显示关闭图标。`dir` 决定滑块位置和标签的书写方向。

<div class="vp-raw yam3x-doc-demo-theme"><SwitchIconsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SwitchIconsExample.vue{vue}

:::

### 表单参与与禁用 fieldset

开关通过其渲染的原生 checkbox 提交。此表单要求先开启公告开关才能提交；下方的 fieldset 会禁用其中的控件。

<div class="vp-raw yam3x-doc-demo-theme"><SwitchFormExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SwitchFormExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from './components/yam3x/switch'

const notifications = ref(false)
</script>

<template>
  <Switch
    v-model="notifications"
    label="通知"
    name="notifications"
    description="接收重要更新"
  />
</template>
```

`label` 为必填项，并提供可访问名称。请把设置名称写在标签中，不要只放在图标里。

::: details 自定义滑块内容与必填开关

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from './components/yam3x/icon'
import { Switch } from './components/yam3x/switch'

const sync = ref(true)
const announcements = ref(false)
</script>

<template>
  <Switch
    v-model="sync"
    label="跨设备同步"
  >
    <template #thumb-content="{ checked }">
      <Icon :name="checked ? 'check' : 'close'" />
    </template>
  </Switch>
  <form>
    <Switch
      v-model="announcements"
      label="产品公告"
      name="announcements"
      required
    />
  </form>
</template>
```

`#thumb-content` 会替换内置图标，其包裹层保持装饰性。内容应适配图标区域，以维持滑块几何。

:::

## 行为与无障碍

### 激活与状态

- 开关被激活后设置立即更新，没有单独的提交动作。
- 隐藏的原生 checkbox 反映状态，因此 `required` 和表单关联遵循原生约束校验。
- `disabled` 和禁用的祖先 `fieldset` 都会阻止激活。使用 `icons="both"` 时，未选中图标在禁用状态下仍然可见。
- `icons="selected"` 仅在开启时显示对勾；`icons="both"` 在开启时显示对勾，关闭时显示关闭图标。图标是装饰性的。
- 自定义 `#thumb-content` 接收 `{ checked }` 并替换图标处理；其包裹层对辅助技术隐藏。
- 开关没有只读模式；`disabled` 会阻止更改并从表单数据中省略该控件。

### 键盘与焦点

- Tab 聚焦开关的隐藏 input，它暴露 `role="switch"` 和 `aria-checked`。
- Space 使用原生行为切换。Enter 也会被处理并切换开关。
- 焦点在轨道周围绘制 3px 的 `secondary` 指示器，偏移 2px。40px 状态层保持在 48px 目标区域内。
- 按下时滑块扩展到 28px，并通过空间弹簧恢复。

### 方向与布局

- `dir` 设置开关自身的方向并决定滑块的逻辑起始侧；省略时继承文档方向。
- 行内标签和补充说明跟随解析后的书写方向。
- 开关不是分组控件：互斥选择使用单选按钮，多选使用 checkbox。

### 表单

- 开启的开关以 `name` 提交其 `value`（默认 `'on'`）；关闭的开关不提交任何值。
- `form` 可将控件关联到子树之外的表单。
- `disabled` 会从表单数据中省略该值。子控件继承 `fieldset[disabled]`。
- 原生重置由周围表单负责；需要特定初始状态时，应用应恢复自己的模型。

## API

### 导出

| 导出     | 类型 | 用途                     |
| -------- | ---- | ------------------------ |
| `Switch` | 组件 | 立即生效的单个二元设置。 |

### `Switch` 属性与模型

| 属性 / 模型   | 类型                             | 默认值   | 说明                                     |
| ------------- | -------------------------------- | -------- | ---------------------------------------- |
| `v-model`     | `boolean`                        | `false`  | 接受的开启/关闭状态。                    |
| `label`       | `string`                         | 必填     | 可见标签与可访问名称。                   |
| `description` | `string`                         | —        | 与隐藏 input 关联的补充说明。            |
| `icons`       | `'none' \| 'selected' \| 'both'` | `'none'` | 轨道图标模式。                           |
| `disabled`    | `boolean`                        | `false`  | 禁止激活；禁用的 fieldset 也会禁用开关。 |
| `dir`         | `'ltr' \| 'rtl'`                 | 继承     | 决定滑块侧与书写方向。                   |
| `id`          | `string`                         | —        | 应用于隐藏 input 的 ID。                 |
| `name`        | `string`                         | —        | 原生表单字段名。                         |
| `value`       | `string`                         | `'on'`   | 开启时提交的值。                         |
| `form`        | `string`                         | —        | 按 ID 将 input 关联到表单。              |
| `required`    | `boolean`                        | `false`  | 原生校验要求开启。                       |

### `Switch` 插槽

| 插槽            | 作用域        | 说明                                   |
| --------------- | ------------- | -------------------------------------- |
| `thumb-content` | `{ checked }` | 替换内置图标；包裹层带 `aria-hidden`。 |

### 事件

唯一的更新事件是 `update:modelValue`，通过 `v-model` 绑定。组件不再声明其他事件。

### 方法

组件不提供实例方法。

## 样式

没有公开的组件级 CSS 自定义属性。开关通过内部 token 映射共享 System 角色。

轨道为 52 × 32px，关闭时带 2px 描边，完全圆角。滑块关闭时为 16px、开启时为 24px；任一状态显示图标时使用 24px，按下时扩展到 28px。未选中与选中的滑块中心分别距轨道起始边 16px 和 36px。选中轨道使用 `primary`，滑块使用 `on-primary`；未选中滑块使用 `outline`，悬停时使用 `on-surface-variant`。焦点使用 3px 的 `secondary` 指示器，偏移 2px。选中图标使用 `primary`，选中的悬停滑块使用 `primary-container`；这些映射属于项目决策。

## Material 参考

[Switch 概览](https://m3.material.io/components/switch/overview) · [指南](https://m3.material.io/components/switch/guidelines) · [规格](https://m3.material.io/components/switch/specs) · [无障碍](https://m3.material.io/components/switch/accessibility)
