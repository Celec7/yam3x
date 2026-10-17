<script setup lang="ts">
import ButtonGroupExample from '../../components/demos/ButtonGroupExample.vue'
</script>

# Button groups

Button group 将相关操作或选项放在一起。使用 `ButtonGroup` 与 `ButtonGroupItem` 组合操作；需要共享选择模型时使用 `ButtonGroupSelection`。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <ButtonGroupExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/ButtonGroupExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Button from './components/yam3x/button/button.vue'
import { ButtonGroup, ButtonGroupItem, ButtonGroupSelection } from './components/yam3x/button-group'

const currentView = ref('list')

function onActivate({ value }: { value: string }) {
  console.log('操作:', value)
}
</script>

<template>
  <ButtonGroup
    label="文件操作"
    @activate="onActivate"
  >
    <ButtonGroupItem
      value="save"
      label="保存"
    >
      <Button>保存</Button>
    </ButtonGroupItem>
    <ButtonGroupItem
      value="share"
      label="分享"
    >
      <Button>分享</Button>
    </ButtonGroupItem>
  </ButtonGroup>

  <ButtonGroupSelection
    v-model="currentView"
    label="显示方式"
    :options="[
      { label: '列表', value: 'list' },
      { label: '网格', value: 'grid' },
    ]"
    variant="connected"
  />
</template>
```

使用默认插槽组合自定义控件。`ButtonGroup` 设置 `overflow="menu"` 后可提供 `#overflow-indicator`。插槽接收 `{ items, activate }`，用于呈现调用方的菜单；选中项目时调用 `activate(item.value)`。未提供溢出插槽时，组可横向滚动。`ButtonGroupSelection` 是项目提供的 options 便利组件。

手动组合按钮组时，应让组的 `size`、`shape` 与子按钮一致。Standard 间距随 `size` 变化；Connected 默认间距为 2px。`gap` 属性优先级最高；未设置时，`--yam3x-button-group-gap` 可覆盖默认间距。两者都未设置时，`--yam3x-connected-button-group-spacing` 可覆盖 Connected 间距。

## API

### `ButtonGroup`

| 属性       | 类型                                                    | 默认值     | 说明                                        |
| ---------- | ------------------------------------------------------- | ---------- | ------------------------------------------- |
| `variant`  | `standard \| connected`                                 | `standard` | 使用分离按钮布局或连接选择布局。            |
| `size`     | Button 尺寸                                             | `small`    | 选择按尺寸变化的组间距和圆角。              |
| `shape`    | `round \| square`                                       | `round`    | 选择 Connected 组的外侧形状。               |
| `label`    | `string`                                                | —          | 控件组的可访问名称。                        |
| `role`     | `string`                                                | `group`    | 组角色；`ButtonGroupSelection` 会自动设置。 |
| `overflow` | `none \| menu`                                          | `none`     | 提供插槽时启用溢出测量。                    |
| `gap`      | `string \| number`                                      | —          | 覆盖项目之间的间距。                        |
| `justify`  | `start \| center \| end \| between \| around \| evenly` | `start`    | 设置组内项目的对齐方式。                    |

`ButtonGroupItem` 在激活时会发出包含原始 `MouseEvent` 的 `activate` 事件。组会发出载荷为 `{ value, source, event }` 的 `activate` 事件；`source` 为 `button` 或 `overflow`。

### `ButtonGroupItem`

| 属性            | 类型      | 默认值  | 说明                               |
| --------------- | --------- | ------- | ---------------------------------- |
| `value`         | `string`  | 必填    | 组内唯一的值。                     |
| `label`         | `string`  | —       | 提供给溢出插槽的标签。             |
| `disabled`      | `boolean` | `false` | 禁用插槽控件及其激活行为。         |
| `weight`        | `number`  | `0`     | Standard 组内额外宽度的相对权重。  |
| `animate-width` | `boolean` | `true`  | 启用 Standard 组按压时的宽度动画。 |

### `ButtonGroupSelection`

| 属性                  | 类型                                                                       | 默认值         | 说明                         |
| --------------------- | -------------------------------------------------------------------------- | -------------- | ---------------------------- |
| `options`             | `{ label, value, kind?, disabled?, buttonVariant?, iconButtonVariant? }[]` | 必填           | 选项定义；值必须唯一。       |
| `label`               | `string`                                                                   | 必填           | 组的可访问名称。             |
| `variant`             | `standard \| connected`                                                    | `standard`     | 组布局。                     |
| `selection-mode`      | `single \| multiple`                                                       | `single`       | 模型类型与选择行为。         |
| `selection-required`  | `boolean`                                                                  | `false`        | 有可用项时保持一个项目选中。 |
| `button-variant`      | ToggleButton 变体                                                          | `filled-tonal` | 普通选项的默认按钮样式。     |
| `icon-button-variant` | IconButton 变体                                                            | `tonal`        | 图标选项的默认样式。         |
| `size`                | Button 尺寸                                                                | `small`        | 传给按钮组和每个选项。       |
| `shape`               | Button 形状                                                                | `round`        | 传给按钮组和每个选项。       |
| `overflow`            | `none \| menu`                                                             | `none`         | 启用自定义溢出插槽。         |
| `gap`                 | `string \| number`                                                         | —              | 覆盖项目之间的间距。         |

## 行为与无障碍

单选 `v-model` 使用字符串，多选使用字符串数组。选择变化时会发出包含新值和选项的 `select` 事件。`#option` 插槽接收 `{ option, selected, disabled }`。选项支持 `kind: 'icon'`，使用 IconButton 外观。Connected 组对所有选项统一应用组级按钮变体；Standard 组允许单项使用不同变体。单选模式下，方向键会移动焦点并更新选中项；禁用项会被跳过。

## Material 参考

[Button groups 概览](https://m3.material.io/components/button-groups/overview) · [指南](https://m3.material.io/components/button-groups/guidelines) · [规格](https://m3.material.io/components/button-groups/specs) · [无障碍](https://m3.material.io/components/button-groups/accessibility)
