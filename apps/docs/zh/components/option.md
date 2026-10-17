<script setup lang="ts">
import OptionExample from '../../components/demos/OptionExample.vue'
</script>

# Option

Option、OptionGroup 与 OptionPanel 是项目选择列表和弹出面板的组合基元。[Select](/zh/components/select) 等父控件负责选择和焦点。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><OptionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/OptionExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from './components/yam3x/form-field'
import { Option, OptionGroup } from './components/yam3x/option'
import { Select } from './components/yam3x/select'

const order = ref('recent')
</script>

<template>
  <FormField label="排序方式">
    <Select
      v-model="order"
      name="order"
    >
      <OptionGroup label="排序">
        <Option
          value="recent"
          label="最近添加"
        />
        <Option
          value="name"
          label="名称"
        />
      </OptionGroup>
    </Select>
  </FormField>
</template>
```

## API

`Option` 需要 `value` 和可访问名称 `label`；`selected` 和 `disabled` 是受控属性。启用选项的 `select` 事件报告 `{ value, source }`。`term`、`highlightMode` 和 `disableHighlight` 控制匹配高亮。可用 `#leading`、`#selected-indicator`、`#trailing` 放置自定义内容；`hideSelectionIndicator` 隐藏内置标记。

`OptionGroup` 使用 `label`、`labelledby` 或 `#label` 插槽为相关选项分组；`hidden` 会移除分组。`OptionPanel` 使用 `anchor` 锚定到 `HTMLElement`。它支持 `v-model:open`、`loading`、`empty`、`#loading` 和 `#no-data`。`fitAnchorWidth`、`anchorOffset`、`scrollStrategy`、`teleport`、`panelClass` 可配置面板；`label` 或 `labelledby` 为面板命名。它会发出 `beforetoggle`、`toggle`、`open` 和 `close`。

## 行为与无障碍

父控件负责提交或拒绝选择，并管理焦点和方向键导航。选项默认使用 `tabindex="-1"`。OptionPanel 围绕锚点定位，在视口内翻转，并在外部指针操作时关闭。每个选项的触控目标至少为 48 × 48px；不要在一行中嵌套控件或加入第二个独立操作。

## 样式

以下常用项目覆盖项设置在对应根元素上；默认值映射到所属 Material 表面和 System token。

| 区域        | 示例属性                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| Option 行   | `--yam3x-option-container-height`、`--yam3x-option-shape`、`--yam3x-option-selected-container-color`                        |
| Option 文字 | `--yam3x-option-color`、`--yam3x-option-label-text-font-size`                                                               |
| 分组        | `--yam3x-option-group-label-color`、`--yam3x-option-group-divider-color`                                                    |
| 面板        | `--yam3x-option-panel-container-color`、`--yam3x-option-panel-container-shape`、`--yam3x-option-panel-container-max-height` |
| 状态        | `--yam3x-option-panel-loading-color`、`--yam3x-option-panel-text-highlight-color`                                           |

临时面板默认使用 System `surface-container-low` 角色，并继承选项行与分组的值。Select 触发器的覆盖项见 [Select 页面](/zh/components/select#样式)。

## Material 参考

[Menus 概览](https://m3.material.io/components/menus/overview) · [指南](https://m3.material.io/components/menus/guidelines)
