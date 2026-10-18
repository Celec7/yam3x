<script setup>
import DatePickerExample from '../../components/demos/DatePickerExample.vue'
</script>

# Date pickers

Date picker 用于选择日期或日期范围。单日期使用 `DatePicker`，范围使用 `DateRangePicker`。两者均结合日历选择与文本输入，并支持 modal 或 docked 呈现。

模态范围选择以纵向连续月份供滚动浏览。单日期和 docked 日历仍按月切换。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><DatePickerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DatePickerExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, DateRangePicker, type DateRangeValue } from './components/yam3x/date-picker'

const date = ref<string | null>(null)
const dateRange = ref<DateRangeValue>({ start: null, end: null })
</script>

<template>
  <DatePicker
    v-model="date"
    label="活动日期"
  />
  <DateRangePicker
    v-model="dateRange"
    label="预订日期"
  />
</template>
```

## API

两个入口均可继承 [LocaleProvider](/zh/components/localization) 的语言和 `datePicker` 文案。显式 `locale` 与原有独立标签属性优先。未配置 provider 时，客户端仍使用浏览器语言，服务端使用 `en-US`；SSR 应显式配置相同语言。

两个组件均接受以下属性：

| 属性                                                                                                                                       | 类型                            | 默认值                | 说明                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | --------------------- | ------------------------------------------------ |
| `mode`                                                                                                                                     | `'auto' \| 'docked' \| 'modal'` | `'auto'`              | 根据 Material 窗口断点自适应，或显式指定呈现形态 |
| `open`                                                                                                                                     | `boolean`                       | 非受控                | 控制模态开关，可用 `v-model:open`                |
| `initialDate`                                                                                                                              | `string`                        | 今天                  | 初始显示日期                                     |
| `minDate`, `maxDate`                                                                                                                       | `string`                        | 无                    | 可选择的日期边界                                 |
| `yearRange`                                                                                                                                | `[number, number]`              | `[1900, 2100]`        | 年份菜单范围                                     |
| `isDateSelectable`                                                                                                                         | `(isoDate: string) => boolean`  | 全部允许              | 自定义禁用日期                                   |
| `locale`                                                                                                                                   | `string`                        | Provider → 浏览器语言 | 日期格式、日历标题与日期朗读语言                 |
| `label`                                                                                                                                    | `string`                        | 本地化默认值          | 字段和对话框名称                                 |
| `startDateLabel`, `endDateLabel`                                                                                                           | `string`                        | 本地化默认值          | 范围两端的可见标签与无障碍名称                   |
| `supportingText`                                                                                                                           | `string`                        | 无                    | 日期格式说明或用途提示                           |
| `placeholder`                                                                                                                              | `string`                        | 本地日期格式          | 空值字段提示                                     |
| `clearable`                                                                                                                                | `boolean`                       | `false`               | 显示清除操作                                     |
| `calendarLabel`, `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `confirmLabel`, `cancelLabel`, `clearLabel` | `string`                        | 本地化默认值          | 日历、导航与对话框操作的无障碍名称或标签。       |

`DatePicker` 的 `modelValue` 类型为 `string | null`；`DateRangePicker` 的类型为 `DateRangeValue`，结构是 `{ start: string | null, end: string | null }`。两种值均使用 ISO 日期。

## 行为与无障碍

项目决策：语言切换保留当前视图、日历焦点和未确认的选择，不提交新值。已输入的日期按开始编辑时的语言解析，范围端点分别记录解析语言；未编辑的日期随新语言重新格式化。清空字段后开始的新输入使用当前语言。验证状态独立于文案，空文案覆盖不会使无效范围通过确认。

两个组件均触发 `update:modelValue`、`change`、`update:open` 和 `invalid`。Modal 形态先在草稿中选择，OK 提交、Cancel/Escape/点击遮罩丢弃并返回触发焦点。Docked 文本可独立编辑，日历选取通过底部操作确认。`auto` 是项目提供的便利模式，会根据 Material 窗口断点选择 Modal 或 Docked 呈现。

## 样式

在组件上设置 `--yam3x-date-picker-container-elevation`，可自定义 Docked 或 Modal 表面的阴影层级。

## Material 参考

[日期选择器概览](https://m3.material.io/components/date-pickers/overview) · [指南](https://m3.material.io/components/date-pickers/guidelines) · [规格](https://m3.material.io/components/date-pickers/specs) · [无障碍](https://m3.material.io/components/date-pickers/accessibility)
