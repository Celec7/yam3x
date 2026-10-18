<script setup lang="ts">
import SliderExample from '../../components/demos/SliderExample.vue'
</script>

# Sliders

Slider 允许用户从有限范围中选择数值或区间。应设置有意义的上下限和步长；任务需要精确值时，还应提供其他输入方式。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><SliderExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SliderExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RangeSlider, Slider } from './components/yam3x/slider'
const volume = ref(40)
const price = ref<[number, number]>([25, 75])
</script>

<template>
  <Slider
    v-model="volume"
    label="音量"
    :min="0"
    :max="100"
  />
  <RangeSlider
    v-model="price"
    label="价格区间"
    :min="0"
    :max="100"
  />
</template>
```

## API

范围端点名称可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 文案。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`。已有标签覆盖属性优先。

`RangeSlider` 的 `lowerLabel`、`upperLabel` 优先于生成名称；`formatValue` 继续由应用格式化数值。

| 属性                                    | 默认              | 说明                                                                                                                                                        |
| --------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Slider v-model`                        | `0`               | 单个数值。要使用 `[下限, 上限]`，请改用 `RangeSlider`。                                                                                                     |
| `Slider variant`                        | `standard`        | `standard` 或 `centered`；区间滑块由独立的 `RangeSlider` 组件提供。                                                                                         |
| `RangeSlider v-model`                   | `[min, max]`      | 包含下限与上限的二元组，两个手柄保持有序。                                                                                                                  |
| `size`                                  | `extra-small`     | `extra-small`、`small`、`medium`、`large` 或 `extra-large`。                                                                                                |
| `orientation`                           | `horizontal`      | `horizontal` 或 `vertical`。Material 建议区间滑块采用横向，并建议避免纵向区间滑块，因为双滑块会增加认知负担，用户通常也预期滑块为横向。组件仍支持两种方向。 |
| `min` / `max` / `step`                  | `0` / `100` / `1` | 数值边界与步长。`RangeSlider` 默认值为 `[min, max]`。                                                                                                       |
| `Slider center`                         | 边界中点          | 项目拓展：居中模式的轨道起点。                                                                                                                              |
| `stops`                                 | `false`           | `step > 1` 时显示内部停靠点；仅在边界仍连接未填充轨道时显示端点标记。数值始终按 `step` 吸附。                                                               |
| `labelled`                              | `false`           | 交互时显示当前值。                                                                                                                                          |
| `disabled`                              | `false`           | 禁用交互与表单提交。                                                                                                                                        |
| `label`                                 | —                 | 无障碍名称；对 `RangeSlider` 来说是组名称。                                                                                                                 |
| `RangeSlider lowerLabel` / `upperLabel` | —                 | 分别为下限和上限手柄设置无障碍名称。                                                                                                                        |
| `name` / `form`                         | —                 | 表单字段名与外部表单 ID；区间字段为 `${name}-min`、`${name}-max`。                                                                                          |
| `formatValue`                           | —                 | 显示值和 `aria-valuetext` 格式化函数。                                                                                                                      |

中、大、特大的标准 `Slider` 支持通过默认插槽设置可选的内嵌图标。

旧用法 `<Slider variant="range" v-model="range">` 应迁移为 `<RangeSlider v-model="range">`。`SliderModel` 现在是 `number`；`RangeSliderModel` 是 `[number, number]`。

## 行为与无障碍

选中值会在交互过程中即时生效。请用可见文字或 `label` 为滑块命名。键盘方向键按视觉方向调整一步，Home/End 到边界，PageUp/PageDown 调整十步；Tab 可分别进入 `RangeSlider` 的两个手柄。拖动或按键时触发 `beforeinput`（可取消）与 `input`，完成操作时触发 `change`。

## Material 参考

[Sliders 概览](https://m3.material.io/components/sliders/overview) · [指南](https://m3.material.io/components/sliders/guidelines) · [规格](https://m3.material.io/components/sliders/specs) · [无障碍](https://m3.material.io/components/sliders/accessibility)
