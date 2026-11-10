<script setup lang="ts">
import SliderBasicExample from '../../components/demos/SliderBasicExample.vue'
import SliderExample from '../../components/demos/SliderExample.vue'
import SliderRangeExample from '../../components/demos/SliderRangeExample.vue'
</script>

# Sliders

滑块让用户从一组数值范围中进行选择。共有四种配置：连续、离散、居中、范围选择。

`Slider` 表示单个数值，`RangeSlider` 表示一对上下限值。两者都是 Material 组件；范围选择拆分为独立组件。停靠点位置、内嵌图标阈值和垂直范围滑块的可用性属于项目决策。

## 示例

### 基础

单滑块绑定一个数字，并通过 `label` 获得可访问名称。请设置真实的边界和与决策匹配的步长。

<div class="vp-raw yam3x-doc-demo-theme"><SliderBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SliderBasicExample.vue{vue}

:::

### 变体、尺寸与状态

控制项在标准、居中和范围之间切换，可改变尺寸和方向，并切换停靠点、数值标签和禁用状态。输出报告接受值，同一元素在各模式下保持 `data-testid="slider"`。

<div class="vp-raw yam3x-doc-demo-theme"><SliderExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SliderExample.vue{vue}

:::

`stops` 要求 `step > 1`。数值会吸附到步长，`labelled` 让数值标签在聚焦或悬停时出现，禁用的滑块会移除标签并阻止键盘和指针输入。

### 区间选择、格式化与 RTL

`RangeSlider` 绑定 `[lower, upper]` 元组。演示用 `formatValue` 格式化货币，通过原生表单提交 `price-min` 与 `price-max`，并切换方向以展示横向方向键跟随解析后的书写方向。

<div class="vp-raw yam3x-doc-demo-theme"><SliderRangeExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SliderRangeExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { RangeSlider, Slider } from './components/yam3x/slider'

const volume = ref(40)
const price = ref<[number, number]>([20, 80])
</script>

<template>
  <Slider
    v-model="volume"
    label="音量"
    :min="0"
    :max="100"
    labelled
  />
  <RangeSlider
    v-model="price"
    label="价格区间"
    :min="0"
    :max="100"
    :step="5"
  />
</template>
```

请为每个滑块提供可见名称或设置 `label`；用户需要在交互前知道数值控制的是什么。

::: details 居中滑块、停靠点与格式化数值

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from './components/yam3x/slider'

const balance = ref(0)
const level = ref(50)
const format = (value: number) => `${value}%`
</script>

<template>
  <Slider
    v-model="balance"
    label="余额"
    variant="centered"
    :min="-50"
    :max="50"
    :step="10"
    :stops="true"
    labelled
  />
  <Slider
    v-model="level"
    label="等级"
    :format-value="format"
    :stops="true"
    :step="10"
  />
</template>
```

`center` 覆盖居中轨道的原点，默认取 `min` 与 `max` 的中点。`formatValue` 提供数值指示文字和 `aria-valuetext`。

:::

## 行为与无障碍

### 选择与吸附

- 标准滑块的激活轨道从最小值开始；居中滑块从 `center` 开始；范围滑块在同一轨道上保留两个滑块。
- 接受值会吸附到 `step`。位于 `max` 的值保持为 `max`，不会吸附到范围之外。
- 范围滑块保持有序：下限滑块不能越过上限值，上限也不能越过下限。
- 使用 `stops` 时 `step` 必须大于一。当前滑块自身的位置不显示停靠点，内部端点被省略，每个可见的非激活端使用端点停靠标记。
- 所属功能决定边界、步长、单位和任何同步的数值输入。

### 数值指示

- `labelled` 在聚焦和悬停时显示当前值。指示器使用 Label Large 的尺寸和行高，配合 Body Large 的字重与字距。
- `formatValue` 格式化指示器并成为 `aria-valuetext`；未提供时使用原生范围值播报。
- 默认插槽可为 medium、large 和 extra-large 的标准滑块添加内嵌图标。激活比例低于 30% 时，图标位于非激活侧。

### 键盘与焦点

- Tab 可到达每个滑块；范围滑块有两个 Tab 停靠点。
- 方向键按视觉方向移动一步。Home 和 End 选择可见的最小值和最大值；PageUp 和 PageDown 移动十步。
- 按住 Space 再按方向键时，在未启用停靠点的情况下移动十步。
- RTL 会镜像横向移动：左方向键增加，右方向键减少。
- 指针拖动和键盘更改在数值变化前发出可取消的 `beforeinput`，随后发出 `input`；交互结束时发出 `change`。
- 聚焦时滑块收缩到 2px，同时保留可见焦点指示。禁用的滑块不发出更新。

### 表单与方向

- 单滑块以 `name` 提交其数值；范围滑块提交 `${name}-min` 和 `${name}-max`。
- `form` 可将 input 关联到子树之外的表单。原生重置恢复滑块挂载时接受的模型。
- `orientation="vertical"` 将轨道纵向排列；上、下方向键仍分别增加和减少数值。Material 建议范围滑块保持横向；垂直方向作为项目选项保留。

## API

范围端点名称可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 消息。`lowerLabel` 和 `upperLabel` 优先于生成的名称；`locale` 覆盖语言，默认取 provider，再回退到 `en-US`。

### 导出

| 导出               | 类型 | 用途                                                                 |
| ------------------ | ---- | -------------------------------------------------------------------- |
| `Slider`           | 组件 | 标准或居中轨道上的单个数值。                                         |
| `RangeSlider`      | 组件 | 同一轨道上的上下限数值对。                                           |
| `SliderModel`      | 类型 | `number`。                                                           |
| `RangeSliderModel` | 类型 | `[number, number]`。                                                 |
| `SliderProps`      | 类型 | `Slider` 接受的属性。                                                |
| `RangeSliderProps` | 类型 | `RangeSlider` 接受的属性。                                           |
| `SliderSize`       | 类型 | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'`。 |
| `SliderVariant`    | 类型 | `'standard' \| 'centered'`。                                         |

### `Slider` 属性与模型

| 属性 / 模型   | 类型                         | 默认值             | 说明                                |
| ------------- | ---------------------------- | ------------------ | ----------------------------------- |
| `v-model`     | `number`                     | `0`                | 接受值。                            |
| `label`       | `string`                     | —                  | 可访问名称；也可使用 `aria-label`。 |
| `variant`     | `'standard' \| 'centered'`   | `'standard'`       | 轨道原点在最小值或 `center`。       |
| `center`      | `number`                     | 边界中点           | 项目扩展：居中变体的原点。          |
| `min` / `max` | `number`                     | `0` / `100`        | 包含的边界。                        |
| `step`        | `number`                     | `1`                | 正步长；数值会吸附。                |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'`     | 轨道轴向。                          |
| `size`        | `SliderSize`                 | `'extra-small'`    | 轨道与滑块尺寸。                    |
| `stops`       | `boolean`                    | `false`            | `step > 1` 时显示停靠点。           |
| `labelled`    | `boolean`                    | `false`            | 交互期间显示数值指示。              |
| `disabled`    | `boolean`                    | `false`            | 阻止输入并移除指示。                |
| `name`        | `string`                     | —                  | 原生表单字段名。                    |
| `form`        | `string`                     | —                  | 按 ID 将 input 关联到表单。         |
| `formatValue` | `(value: number) => string`  | —                  | 指示文字与 `aria-valuetext`。       |
| `locale`      | `string`                     | Provider → `en-US` | 生成范围名称的语言。                |

### `RangeSlider` 属性与模型

| 属性 / 模型   | 类型                         | 默认值             | 说明                                    |
| ------------- | ---------------------------- | ------------------ | --------------------------------------- |
| `v-model`     | `[number, number]`           | `[min, max]`       | 接受的上下限值；滑块保持有序。          |
| `lowerLabel`  | `string`                     | 本地化名称         | 下限滑块的可访问名称。                  |
| `upperLabel`  | `string`                     | 本地化名称         | 上限滑块的可访问名称。                  |
| `label`       | `string`                     | —                  | 分组的可访问名称。                      |
| `min` / `max` | `number`                     | `0` / `100`        | 包含的边界。                            |
| `step`        | `number`                     | `1`                | 正步长；数值会吸附。                    |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'`     | 轨道轴向。                              |
| `size`        | `SliderSize`                 | `'extra-small'`    | 轨道与滑块尺寸。                        |
| `stops`       | `boolean`                    | `false`            | `step > 1` 时显示停靠点。               |
| `labelled`    | `boolean`                    | `false`            | 交互期间显示数值指示。                  |
| `disabled`    | `boolean`                    | `false`            | 阻止输入并移除指示。                    |
| `name`        | `string`                     | —                  | `${name}-min` 和 `${name}-max` 的前缀。 |
| `form`        | `string`                     | —                  | 按 ID 将 input 关联到表单。             |
| `formatValue` | `(value: number) => string`  | —                  | 指示文字与 `aria-valuetext`。           |
| `locale`      | `string`                     | Provider → `en-US` | 生成滑块名称的语言。                    |

### 事件

| 事件          | 载荷    | 说明                               |
| ------------- | ------- | ---------------------------------- |
| `beforeinput` | `Event` | 可取消；阻止后保持当前值。         |
| `input`       | `Event` | 模型接受每次指针或键盘更改后发出。 |
| `change`      | `Event` | 交互结束时发出一次。               |

### 插槽

`Slider` 有一个默认插槽，用于 medium、large 和 extra-large 尺寸标准滑块的内嵌图标；`RangeSlider` 没有插槽。

### 方法

两个组件都不暴露实例方法。

## 样式

没有公开的组件级 CSS 自定义属性。滑块映射共享 System 角色；请在主题根节点调整 `--md-sys-color-*`、字阶、动效或密度 token。

::: details 尺寸几何

| 尺寸          | 轨道高度 | 滑块高度 | 轨道圆角 |
| ------------- | -------- | -------- | -------- |
| `extra-small` | 16px     | 44px     | 8px      |
| `small`       | 24px     | 44px     | 8px      |
| `medium`      | 40px     | 52px     | 12px     |
| `large`       | 56px     | 68px     | 16px     |
| `extra-large` | 96px     | 108px    | 28px     |

停靠点位置使用圆角轨道端帽中心之间的可用跨度。内部停靠点需显式启用，当前滑块位置的停靠点被省略，起点与终点指示保持相同的间隔网格。

:::

## Material 参考

[Sliders 概览](https://m3.material.io/components/sliders/overview) · [指南](https://m3.material.io/components/sliders/guidelines) · [规格](https://m3.material.io/components/sliders/specs) · [无障碍](https://m3.material.io/components/sliders/accessibility)
