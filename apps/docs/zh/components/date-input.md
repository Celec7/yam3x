<script setup>
import DateInputExample from '../../components/demos/DateInputExample.vue'
</script>

# Date input

DateInput 是项目拓展，用于通过键盘编辑本地化的日期和时间分段。它支持范围限制和校验；应用负责提供外层表单或对话框。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><DateInputExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DateInputExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DateInput } from './components/yam3x/date-input'

const value = ref<Date | null>(null)
</script>

<template>
  <DateInput
    v-model="value"
    label="活动日期"
    locale="zh-CN"
    required
    name="event-date"
  />
</template>
```

## API

内置文案、分段名称和日期格式可继承 [LocaleProvider](/zh/components/localization)。显式 `locale`、`label`、`labels`、`requiredMessage` 和 `invalidMessage` 优先。未配置 provider 时，客户端仍使用浏览器语言，服务端回退到 `en-US`；SSR 应显式配置相同语言。

| 属性                                   | 类型                                        | 默认值                | 说明                                                             |
| -------------------------------------- | ------------------------------------------- | --------------------- | ---------------------------------------------------------------- |
| `modelValue` / `value`                 | `Date \| null`                              | `null`                | `v-model` 的本地化日期或时间值；`value` 是兼容别名。             |
| `type`                                 | `'date' \| 'time' \| 'datetime'`            | `'date'`              | 编辑日期、时间或两者                                             |
| `showSeconds`                          | `boolean`                                   | `false`               | 时间是否包含秒段                                                 |
| `timeFormat`                           | `'12' \| '24' \| 'auto'`                    | `'auto'`              | 小时格式；auto 根据 locale 选择                                  |
| `minDate`, `maxDate`                   | `Date \| null`                              | 无                    | 日期边界                                                         |
| `minTime`, `maxTime`                   | `'HH:mm[:ss]' \| TimeParts \| null`         | 无                    | 时间边界                                                         |
| `isDateSelectable`, `isTimeSelectable` | 函数                                        | 全部允许              | 自定义日期或时间的有效性                                         |
| `blackoutDates`, `blackoutTimes`       | 函数                                        | 无                    | 排除不可选的日期或时间。                                         |
| `locale`                               | `string`                                    | Provider → 浏览器语言 | 段顺序、分隔符、小时周期和标签                                   |
| `labels`                               | `Partial<Record<DateInputSegment, string>>` | 本地化默认值          | 覆盖各段的无障碍名称                                             |
| `disabled`, `readonly`, `required`     | `boolean`                                   | `false`               | 原生禁用、只读与必填语义；必填字段显示星号标记。                 |
| `requiredMessage`, `invalidMessage`    | `string`                                    | 本地化默认值          | 必填与无效状态消息；无效文本会关联到分段输入并作为 alert 播报。  |
| `name`                                 | `string`                                    | 无                    | 表单值字段名称，提交 ISO 时间戳                                  |
| `label`                                | `string`                                    | 按模式本地化          | 组的可见标签和无障碍名称；根据模式默认为日期、时间或日期与时间。 |

## 行为与无障碍

项目决策：自动小时制下，未完成的时间草稿在语言切换后保留原有小时周期，直到有效提交或清除，以免把 12 小时制输入误解为 24 小时制值。标签和分段顺序仍随语言更新，保留草稿及当前聚焦的分段；切换语言本身不会提交值。

事件：`update:modelValue`、`update:value`、`beforeinput`、`input`、`change` 和 `invalid`。日期与日期时间使用 locale 顺序的独立数字段；用户在空字段输入时，不插入遮罩字符。12 小时输入显示本地 AM/PM 段，24 小时输入使用 0–23 小时范围。必填状态显示可见标记；错误文本关联到受影响的输入分段并通过 alert 播报，同时显示错误图标。

将验证文案覆盖为空字符串会隐藏可见文本，但不会让无效值通过验证；原生有效性仍保留回退消息。

此模块提供独立输入部件。日期选择器的手动输入模式继续由 DatePicker 自己管理事务提交与对话框切换，两者不共享提交生命周期。

## 样式

将以下项目自定义属性设置在 DateInput 分组根元素上。默认颜色映射到适用的 Text field 与 System 角色。

| 属性                                         | 说明                       |
| -------------------------------------------- | -------------------------- |
| `--yam3x-date-input-color`                   | 启用状态的输入段文字颜色。 |
| `--yam3x-date-input-focused-container-color` | 聚焦输入段背景色。         |
| `--yam3x-date-input-focused-color`           | 聚焦输入段文字颜色。       |
| `--yam3x-date-input-disabled-color`          | 禁用输入段文字颜色。       |
| `--yam3x-date-input-disabled-opacity`        | 禁用输入段透明度。         |

## Material 参考

[日期选择器](https://m3.material.io/components/date-pickers/overview) · [时间选择器](https://m3.material.io/components/time-pickers/) · [文本框](https://m3.material.io/components/text-fields/overview)
