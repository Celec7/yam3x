<script setup lang="ts">
import AutocompleteExample from '../../components/demos/AutocompleteExample.vue'
</script>

# Autocomplete

Autocomplete 是项目定义的组件，会根据输入筛选建议，并允许用户确认某项建议或保留自由文本。查询内容与已选值是彼此独立的状态。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><AutocompleteExample /></div>

::: details 查看演示源码

<<< ../../components/demos/AutocompleteExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Autocomplete, type AutocompleteOption } from './components/yam3x/autocomplete'

const query = ref('')
const selected = ref<string | null>(null)
const options: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
]
</script>

<template>
  <Autocomplete
    v-model="query"
    v-model:selected="selected"
    :options="options"
    label="Fruit"
  />
</template>
```

## API

内置状态、结果播报、建议名称和必选验证文案可继承 [LocaleProvider](/zh/components/localization) 的 `autocomplete` 配置。显式 `locale` 优先，默认使用 provider，再回退到 `en-US`；`loadingText`、`noDataText`、`resultsLabel` 和相应插槽继续优先。查询文本、选项标签和选择值由应用拥有。

| 属性                                                                | 类型                                                                         | 默认值                   | 说明                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `options`                                                           | `{ value, label, disabled? }[]`                                              | 必填                     | 建议项，`value` 在列表中唯一。                                                     |
| `modelValue`, `v-model`                                             | `string`                                                                     | `''`                     | 当前可编辑文本。                                                                   |
| `selected`, `v-model:selected`                                      | `string \| null`                                                             | `null`                   | 已提交建议项的值。                                                                 |
| `label`                                                             | `string`                                                                     | 必填                     | 可见字段标签和可访问名称。                                                         |
| `filter`                                                            | `contains \| starts-with \| ends-with \| none \| (option, query) => boolean` | `contains`               | 默认不区分大小写。                                                                 |
| `caseSensitive`, `autoActivate`, `openOnFocus`                      | `boolean`                                                                    | `false`, `false`, `true` | 控制过滤大小写、初始活动项和聚焦展开。自动活动不会提交选项。                       |
| `required`, `selectionRequired`                                     | `boolean`                                                                    | `false`                  | 分别表示原生非空验证和必须从建议项中选择。                                         |
| `disabled`, `readonly`, `name`, `form`, `autocomplete`              | 原生输入属性                                                                 | —                        | 原生文本输入与表单行为。                                                           |
| `loading`, `loadingText`, `noDataText`, `resultsLabel`              | 状态属性                                                                     | —                        | 加载、无匹配项和结果数量播报。                                                     |
| `hideLoading`, `hideNoData`, `hideSelectionIndicator`, `panelClass` | 状态属性                                                                     | —                        | 隐藏对应状态/标记，或向弹出面板添加类名。                                          |
| `variant`                                                           | `standard \| vibrant`                                                        | `standard`               | 使用官方 Expressive Menu 颜色映射；将其公开为 Autocomplete 属性属于项目 API 决定。 |

`#input` 插槽接收 `{ inputProps, query, selected }`，并且必须将 `inputProps` 绑定到一个原生可编辑输入。`#option` 接收 `{ option, active, selected, query }`；选项内容中不要放按钮等交互控件。也可通过 `#loading`、`#no-data` 自定义状态行。`#trailing` 可替换展开按钮中的图标。事件包括 `query`、可取消的 `beforeselect`、`select`、`change`、`toggle`、`open` 和 `close`。`beforeselect` 接收选项与可取消事件；调用 `preventDefault()` 可阻止选择。

## 行为与无障碍

使用键盘浏览建议项时，焦点会留在输入框中。方向键移动活动项，Enter 提交选择，Escape 关闭列表但保留输入文本，Tab 按页面顺序离开。

Standard 变体使用 `surface-container-low` 弹出面板，选中项使用 `tertiary-container` / `on-tertiary-container`。Vibrant 使用 [Expressive Menu 规格](https://m3.material.io/components/menus/specs)中的 tertiary 颜色映射。Material 定义的是 Menu 样式；将 `variant` 属性用于此过滤交互属于项目拓展。

## 样式

支持的 CSS 覆盖项为 `--yam3x-autocomplete-popup-min-width`、`--yam3x-autocomplete-popup-max-width`、`--yam3x-autocomplete-popup-max-height`、`--yam3x-autocomplete-popup-padding-block`、`--yam3x-autocomplete-popup-padding-inline`、`--yam3x-autocomplete-popup-shape`、`--yam3x-autocomplete-popup-elevation`、`--yam3x-autocomplete-option-container-height`、`--yam3x-autocomplete-option-shape`、`--yam3x-autocomplete-option-first-child-shape`、`--yam3x-autocomplete-option-last-child-shape`、`--yam3x-autocomplete-option-selected-shape` 和 `--yam3x-autocomplete-option-label-text-font-size`。在 Autocomplete 根元素上设置这些属性。主题颜色由当前 System token 和 `variant` 控制。

## Material 参考

[菜单指南](https://m3.material.io/components/menus/guidelines) · [菜单规格](https://m3.material.io/components/menus/specs) · [文本框规格](https://m3.material.io/components/text-fields/specs)
