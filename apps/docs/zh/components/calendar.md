<script setup>
import CalendarExample from '../../components/demos/CalendarExample.vue'
</script>

# Calendar

Calendar 是嵌入表单、弹出层或页面区域的日期选择拓展，支持选择日期和范围，但不自带对话框或文本输入框。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><CalendarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CalendarExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from './components/yam3x/calendar'

const selected = ref<string | null>(null)
</script>

<template>
  <Calendar
    v-model="selected"
    locale="zh-CN"
  />
</template>
```

## API

内置文案及日期格式可继承 [LocaleProvider](/zh/components/localization)；显式 `locale` 和各标签属性优先。未配置 provider 时，客户端保留浏览器语言默认值，服务端使用 `en-US`。使用 SSR 时显式提供相同语言，以保持两端一致。

| 属性                                                                                                                         | 类型                                | 默认值                | 说明                                    |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------- | --------------------------------------- |
| `modelValue`                                                                                                                 | `string \| null`                    | `null`                | 单选 ISO 日期（`YYYY-MM-DD`）           |
| `selection`                                                                                                                  | `'single' \| 'range'`               | `'single'`            | 单日期或范围选择                        |
| `rangeStart`, `rangeEnd`                                                                                                     | `string \| null`                    | `null`                | 通过 `selection="range"` 使用的范围端点 |
| `startAt`                                                                                                                    | `string \| null`                    | 已选日期或今天        | 初始显示月份，不会自动选择日期          |
| `startView`                                                                                                                  | `'month' \| 'year' \| 'multi-year'` | `'month'`             | 初始日期视图                            |
| `minDate`, `maxDate`                                                                                                         | `string \| null`                    | 无                    | 包含边界的可选日期范围                  |
| `isDateSelectable`                                                                                                           | `(date: string) => boolean`         | 全部允许              | 返回 `false` 时禁用日期                 |
| `isSpecialDate`                                                                                                              | `(date: string) => boolean`         | 无                    | 以特殊日期样式显示日期，不改变其可选性  |
| `locale`                                                                                                                     | `string`                            | Provider → 浏览器语言 | 日期格式、星期名称和周起始日            |
| `label`                                                                                                                      | `string`                            | 按语言区域本地化      | 日历区域的无障碍名称                    |
| `specialDateLabel`, `rangeStartLabel`, `rangeEndLabel`, `inRangeLabel`                                                       | `string`                            | 按语言区域本地化      | 为特殊日期和范围状态补充屏幕阅读器描述  |
| `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `previousMultiYearLabel`, `nextMultiYearLabel` | `string`                            | 按语言区域本地化      | 周期导航按钮的无障碍名称。              |

## 行为与无障碍

事件：`update:modelValue`、`update:rangeStart`、`update:rangeEnd` 和 `change`。范围完成后再次选择会开始新范围；若第二个端点早于起点，则从该日期重新开始。

具名插槽 `header` 可完全替换月份/年份标题和前后导航。插槽属性提供 `view`、`periodLabel`、`canPrevious`、`canNext`、`previous`、`next` 和 `toggle`。组件实例公开同名周期导航与切换方法，以及 `resetActiveView()`、`updateTodayDate()` 和 `focusActiveCell()`，供组合控件调用。

键盘：方向键移动日期，Home/End 移到当月第一天／最后一天，Page Up/Down 移动月份，Shift+Page Up/Down 和 Alt+Page Up/Down 移动年份，Shift+M 打开月份选择，Shift+Y 打开年份选择；Enter/Space 选择日期。年份视图可选年份并进入月份视图，18 年视图可翻页。

## 样式

将以下项目自定义属性设置在 Calendar 根元素上。默认值使用 Date picker 颜色角色，以及共享排版和运动 System token。

| 区域                 | 支持的属性                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 容器                 | `--yam3x-calendar-container-color`、`--yam3x-calendar-container-shape`、`--yam3x-calendar-padding`                                                                                                                                                                                                                                                                                               |
| 周期和星期标签       | `--yam3x-calendar-period-button-text-color`、`--yam3x-calendar-weekday-color`、`--yam3x-calendar-weekday-font-size`、`--yam3x-calendar-weekday-font-weight`、`--yam3x-calendar-weekday-line-height`、`--yam3x-calendar-weekday-tracking`                                                                                                                                                         |
| 日期标签             | `--yam3x-calendar-date-font-size`、`--yam3x-calendar-date-font-weight`、`--yam3x-calendar-date-line-height`、`--yam3x-calendar-date-tracking`、`--yam3x-calendar-item-color`、`--yam3x-calendar-item-font-size`、`--yam3x-calendar-item-font-weight`、`--yam3x-calendar-item-line-height`、`--yam3x-calendar-item-tracking`                                                                      |
| 选中和今天状态       | `--yam3x-calendar-item-selected-color`、`--yam3x-calendar-item-selected-container-color`、`--yam3x-calendar-item-selected-ripple-color`、`--yam3x-calendar-item-selected-hover-color`、`--yam3x-calendar-item-selected-focus-color`、`--yam3x-calendar-item-current-outline-color`、`--yam3x-calendar-item-current-outline-thickness`、`--yam3x-calendar-date-current-outline-thickness`         |
| 特殊、范围和禁用状态 | `--yam3x-calendar-item-special-color`、`--yam3x-calendar-item-special-container-color`、`--yam3x-calendar-item-special-ripple-color`、`--yam3x-calendar-item-special-hover-color`、`--yam3x-calendar-item-special-focus-color`、`--yam3x-calendar-range-color`、`--yam3x-calendar-range-container-color`、`--yam3x-calendar-item-disabled-color`、`--yam3x-calendar-item-disabled-color-opacity` |
| 运动                 | `--yam3x-calendar-slide-animation-duration`                                                                                                                                                                                                                                                                                                                                                      |

## Material 参考

[日期选择器概览](https://m3.material.io/components/date-pickers/overview) · [指南](https://m3.material.io/components/date-pickers/guidelines)
