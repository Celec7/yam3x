<script setup>
import DateInputExample from '../../components/demos/DateInputExample.vue'
import DateInputModesExample from '../../components/demos/DateInputModesExample.vue'
import DateInputStatesExample from '../../components/demos/DateInputStatesExample.vue'
</script>

# 日期输入

`DateInput` 是一个项目拓展，用于在同一个带标签的表单字段中输入日期、时间或两者。它结合了 Material 描边文本框的外观和独立的数字片段，会校验符合语言区域的值，并参与原生表单。

最接近的 Compose Material 3 组合是 `DatePicker` 和 `TimePicker` 中的手动输入字段（一个描边文本框）；独立的分段编辑器、范围限制和排除行为属于项目决策。当用户需要输入值，而外层表单或对话框由应用负责时，使用 `DateInput`。当主要任务是从日历中选择时，使用[日期选择器](/zh/components/date-picker)；当需要表盘或专用对话框时，使用[时间选择器](/zh/components/time-picker)。

## 示例

### 基础

基础示例是原生表单中的必填字段。提交空字段会显示必填消息并将其关联到各片段；输入完整日期后即可提交。表单值是 ISO 时间戳，事件日志会记录 `beforeinput`、`input`、`change` 和 `invalid`。

<div class="vp-raw yam3x-doc-demo-theme"><DateInputExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DateInputExample.vue{vue}

:::

### 模式与范围

日期、时间和日期时间模式共用同一套 API。`time-format` 选择 12 小时制（带上午/下午片段）或 24 小时制，`show-seconds` 增加秒片段。受限示例拒绝 2026 年 10 月 10–20 日之外的日期和 09:00–17:00 之外的时间，并通过排除回调禁用 15 日和第 45 分钟。

<div class="vp-raw yam3x-doc-demo-theme"><DateInputModesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DateInputModesExample.vue{vue}

:::

### 状态

禁用、只读和从右向左的字段保持相同的片段结构。禁用字段仍显示值，但不会随表单提交。只读字段保留值并拒绝编辑。从右向左示例使用希伯来语区域，因此片段顺序和方向来自语言区域，而不是方向属性。

<div class="vp-raw yam3x-doc-demo-theme"><DateInputStatesExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DateInputStatesExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件。使用 `./components/yam3x/` 之类的使用者路径；演示源码中的 `@registry` 路径仅用于本站。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from './components/yam3x/date-input'

const value = ref<Date | null>(null)
</script>

<template>
  <form>
    <DateInput
      v-model="value"
      label="活动日期"
      name="event-date"
      required
    />
  </form>
</template>
```

`v-model` 的值是 `Date` 或 `null`。值使用浏览器本地时间；`name` 通过隐藏输入提交 `currentValue.toISOString()`。绑定 `minDate`、`maxDate`、`minTime` 和 `maxTime` 可限制接受的值。

::: details 范围、排除日期和自定义可用性

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from './components/yam3x/date-input'

const start = ref<Date | null>(null)
const minDate = new Date(2026, 9, 10)
const maxDate = new Date(2026, 9, 20)
const isDateSelectable = (date: Date) => date.getDay() !== 0
const blackoutDates = (date: Date) => date.getDate() === 15
</script>

<template>
  <DateInput
    v-model="start"
    label="开始日期"
    name="start-date"
    :min-date="minDate"
    :max-date="maxDate"
    :is-date-selectable="isDateSelectable"
    :blackout-dates="blackoutDates"
  />
</template>
```

`minTime` 和 `maxTime` 接受 `'HH:mm'`、`'HH:mm:ss'` 或 `{ hour, minute, second? }`。`isDateSelectable` 和 `isTimeSelectable` 接收候选值，返回 `false` 时拒绝；`blackoutDates` 和 `blackoutTimes` 返回 `true` 时拒绝。每个片段完成时都会检查范围和可用性，字段会保留最近一次被接受的值。

:::

::: details 片段名称与消息

`labels` 通过 `Partial<Record<DateInputSegment, string>>` 覆盖单个片段的名称。`requiredMessage` 和 `invalidMessage` 替换内置的必填和无效文案。将覆盖值设为空字符串会隐藏可见文本，但不会让无效值通过验证；原生有效性仍保留回退消息。

```vue
<DateInput
  v-model="value"
  label="开始日期"
  :labels="{ month: '月', day: '日', year: '年' }"
  required-message="请选择开始日期。"
  invalid-message="该日期不完整或不可用。"
/>
```

:::

## 行为与无障碍

### 片段与语言区域

- 日期使用按语言区域排序的月、日、年片段；日期时间还会追加小时、分钟和可选的秒片段。
- 在空片段中输入不会插入遮罩字符。片段填写完成后，焦点会移到下一个片段。
- 12 小时制显示本地化的上午/下午片段；24 小时制接受 0 到 23 的小时。`time-format="auto"` 跟随语言区域。
- 项目决策：在自动小时制模式下，未完成的时间草稿在语言切换后保留原有小时周期，直到有效提交或清除。标签和片段顺序仍会更新，同时保留草稿和当前聚焦的片段；仅切换语言不会提交值。

### 键盘与焦点

- 整个分组只有一个 Tab 停靠点。左右方向键在片段间移动，在从右向左布局中方向反转。上下方向键将当前片段调整 1；Page Up 和 Page Down 调整 5。
- Home 和 End 选择当前片段的最小值和最大值。Backspace 和 Delete 清除当前片段。
- `beforeinput` 可取消。取消事件后，片段和模型保持不变。
- 值更新时焦点保留在当前片段上，分组显示 3px 内嵌焦点轮廓，且不改变内边距。

### 表单与校验

- `required` 显示可见标记并参与原生约束校验。未交互的必填字段显示 hint；输入、离开分组或原生 invalid 事件后显示错误。
- 错误文本会关联到受影响的片段，通过 alert 播报，并显示错误图标。`invalid` 会报告消息以及 `valueMissing`、`typeMismatch`、`rangeUnderflow`、`rangeOverflow` 或 `customError` 原因。
- 原生表单重置会恢复初始模型值并清除校验反馈。禁用字段不提交值；只读字段保留值。

### 响应式与从右向左

- 片段在窄宽度下保持 48px 目标，分组使用逻辑间距，不会隐藏片段。
- 方向来自解析后的语言区域。从右向左的语言区域会反转片段顺序以及左右方向键的行为。

### 状态归属

`v-model` 拥有被接受的 `Date`。片段草稿、当前片段和校验反馈由组件内部管理，并在外部模型更新时丢弃。组件不会打开对话框或选择日历；请自行组合表单、校验摘要或弹出层。

## API

内置文案、片段名称和日期格式可继承 [LocaleProvider](/zh/components/localization)。显式 `locale`、`label`、`labels`、`requiredMessage` 和 `invalidMessage` 优先。未配置 provider 时，客户端仍使用浏览器语言，服务端回退到 `en-US`；SSR 应显式配置相同语言。

### 导出

| 导出                  | 说明                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `DateInput`           | 带标签的分段编辑器。                                                         |
| `DateInputType`       | `'date' \| 'time' \| 'datetime'`。                                           |
| `DateInputTimeFormat` | `'12' \| '24' \| 'auto'`。                                                   |
| `DateInputSegment`    | `'month' \| 'day' \| 'year' \| 'hour' \| 'minute' \| 'second' \| 'period'`。 |

### 属性与模型

| 属性                                | 类型                                           | 默认值                | 说明                                                        |
| ----------------------------------- | ---------------------------------------------- | --------------------- | ----------------------------------------------------------- |
| `modelValue` / `v-model`            | `Date \| null`                                 | `null`                | 被接受的本地日期或时间值。                                  |
| `type`                              | `DateInputType`                                | `'date'`              | 编辑日期、时间或两者。                                      |
| `showSeconds`                       | `boolean`                                      | `false`               | 在时间和日期时间模式中增加秒片段。                          |
| `timeFormat`                        | `DateInputTimeFormat`                          | `'auto'`              | 小时制；`auto` 跟随语言区域。                               |
| `minDate`, `maxDate`                | `Date \| null`                                 | `null`                | 包含边界的日期范围。                                        |
| `minTime`, `maxTime`                | `string \| { hour, minute, second? } \| null`  | `null`                | 包含边界的时间范围，使用 `'HH:mm[:ss]'` 或时间片段对象。    |
| `isDateSelectable`                  | `(date: Date) => boolean`                      | 全部允许              | 返回 `false` 时拒绝该日期。                                 |
| `isTimeSelectable`                  | `(time: { hour, minute, second? }) => boolean` | 全部允许              | 返回 `false` 时拒绝该时间。                                 |
| `blackoutDates`                     | `(date: Date) => boolean`                      | 无                    | 返回 `true` 时拒绝该日期。                                  |
| `blackoutTimes`                     | `(time: { hour, minute, second? }) => boolean` | 无                    | 返回 `true` 时拒绝该时间。                                  |
| `label`                             | `string`                                       | 按 `type` 本地化      | 组的可见标签和无障碍名称。                                  |
| `hint`                              | `string`                                       | `''`                  | 校验失败前显示的辅助文本；错误会替换它。                    |
| `labels`                            | `Partial<Record<DateInputSegment, string>>`    | 本地化默认值          | 覆盖各片段的无障碍名称。                                    |
| `disabled`, `readonly`, `required`  | `boolean`                                      | `false`               | 原生禁用、只读与必填语义；必填字段显示可见星号。            |
| `requiredMessage`, `invalidMessage` | `string`                                       | 本地化默认值          | 必填与无效状态消息；无效文本会关联到片段并作为 alert 播报。 |
| `name`                              | `string`                                       | `''`                  | 表单字段名称；提交 ISO 时间戳。                             |
| `locale`                            | `string`                                       | Provider → 浏览器语言 | 片段顺序、分隔符、小时周期和标签。                          |

### 事件

| 事件                | 载荷                                                                                                                      | 说明                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `update:modelValue` | `Date \| null`                                                                                                            | 供 `v-model` 使用的候选值。       |
| `beforeinput`       | `InputEvent`                                                                                                              | 片段编辑前触发的可取消 DOM 事件。 |
| `input`             | `Date \| null`                                                                                                            | 编辑过程中值变化后触发。          |
| `change`            | `Date \| null`                                                                                                            | 提交变更后触发，包括离开分组时。  |
| `invalid`           | `{ message: string, validity: 'valueMissing' \| 'typeMismatch' \| 'rangeUnderflow' \| 'rangeOverflow' \| 'customError' }` | 校验失败及其原生原因。            |

### 方法

通过模板 ref 访问。

| 成员              | 签名               | 说明                     |
| ----------------- | ------------------ | ------------------------ |
| `focus()`         | `() => void`       | 聚焦第一个片段。         |
| `blur()`          | `() => void`       | 移除当前片段的焦点。     |
| `checkValidity()` | `() => boolean`    | 报告当前值是否通过校验。 |
| `validityMessage` | `string`（getter） | 当前校验消息。           |

## 样式

描边字段的标签使用 Label Large，片段使用 Body Large，辅助文本使用 Body Small。焦点是 3px primary 内嵌轮廓，不改变内边距；无效状态的焦点使用 error 角色。将以下项目自定义属性设置在 `DateInput` 分组根元素上。默认颜色映射到适用的 Text field 与 System 角色。

| 属性                                         | 说明                       |
| -------------------------------------------- | -------------------------- |
| `--yam3x-date-input-color`                   | 启用状态的输入段文字颜色。 |
| `--yam3x-date-input-container-shape`         | 字段圆角形状。             |
| `--yam3x-date-input-focused-container-color` | 聚焦输入段背景色。         |
| `--yam3x-date-input-focused-color`           | 聚焦输入段文字颜色。       |
| `--yam3x-date-input-disabled-color`          | 禁用输入段文字颜色。       |
| `--yam3x-date-input-disabled-opacity`        | 禁用输入段透明度。         |

## Material 参考

[日期选择器](https://m3.material.io/components/date-pickers/overview) · [时间选择器](https://m3.material.io/components/time-pickers/overview) · [文本框](https://m3.material.io/components/text-fields/overview)
