<script setup>
import DatePickerExample from '../../components/demos/DatePickerExample.vue'
</script>

# 日期选择器

日期选择器让用户选择一个日期或一个日期范围。

`DatePicker` 和 `DateRangePicker` 是 Material 3 日期选择器。`DatePicker` 选择一个日期，`DateRangePicker` 选择开始和结束日期。两者都结合日历与手动输入，并支持停靠式或模态呈现。`auto` 模式和紧凑全屏处理属于项目决策；模态范围日历的连续滚动遵循 Material 范围指南。

当主要任务是从日历中选择时使用选择器。当外层表单应负责分段文本框时，使用[日期输入](/zh/components/date-input)；当日历直接属于页面区域或弹出层时，使用[日历](/zh/components/calendar)。

## 示例

### 模式、选择与提交

演示在自适应、停靠式和模态呈现之间切换，也在单个日期和范围之间切换。单日期选择器接受输入的日期，并将可选范围限制在今天到未来两年。范围模式下，停靠式字段直接编辑每个端点，而模态范围日历可连续滚动浏览月份。值行只报告已提交的值；无效的手动输入会单独报告。

<div class="vp-raw yam3x-doc-demo-theme"><DatePickerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DatePickerExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件。使用 `./components/yam3x/` 之类的使用者路径；演示源码中的 `@registry` 路径仅用于本站。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, DateRangePicker, type DateRangeValue } from './components/yam3x/date-picker'

const date = ref<string | null>(null)
const range = ref<DateRangeValue>({ start: null, end: null })
</script>

<template>
  <DatePicker
    v-model="date"
    label="活动日期"
    min-date="2026-10-01"
  />
  <DateRangePicker
    v-model="range"
    label="预订日期"
    start-date-label="入住"
    end-date-label="退房"
  />
</template>
```

两个模型都使用 ISO 日期（`YYYY-MM-DD`）或 `null`。范围模型为 `{ start: string | null, end: string | null }`。传入 `mode="docked"` 或 `mode="modal"` 可固定呈现形态；保持 `auto` 则跟随 Material 窗口断点。

::: details 受控可见性与校验

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker } from './components/yam3x/date-picker'

const date = ref<string | null>(null)
const open = ref(false)
const message = ref('')

function onInvalid(raw: string) {
  message.value = `“${raw}”不是可用日期。`
}
</script>

<template>
  <DatePicker
    v-model="date"
    v-model:open="open"
    label="活动日期"
    :min-date="'2026-10-01'"
    :max-date="'2026-12-31'"
    :is-date-selectable="(value) => value !== '2026-10-15'"
    @invalid="onInvalid"
  />
  <p v-if="message">{{ message }}</p>
</template>
```

:::

::: details 标签覆盖

`calendarLabel` 命名停靠式日历触发器。`previousMonthLabel`、`nextMonthLabel`、`previousYearLabel` 和 `nextYearLabel` 命名周期导航。`confirmLabel`、`saveLabel`、`cancelLabel`、`closeLabel` 和 `clearLabel` 替换对话框和字段操作。

| 属性                                   | 默认值                 | 说明                           |
| -------------------------------------- | ---------------------- | ------------------------------ |
| `calendarLabel`                        | 本地化 `Open calendar` | 停靠式日历触发器的无障碍名称。 |
| `previousMonthLabel`, `nextMonthLabel` | 本地化默认值           | 上一月和下一月导航。           |
| `previousYearLabel`, `nextYearLabel`   | 本地化默认值           | 上一年和下一年的导航。         |
| `confirmLabel`                         | 本地化 `OK`            | 确认停靠式或模态选择。         |
| `saveLabel`                            | 本地化 `Save`          | 从紧凑模态标题栏确认。         |
| `cancelLabel`                          | 本地化 `Cancel`        | 放弃停靠式或模态选择。         |
| `closeLabel`                           | 本地化 `Close`         | 关闭紧凑模态。                 |
| `clearLabel`                           | 本地化 `Clear`         | 清除已接受的值。               |

每个属性都会覆盖对应的内置语言区域消息。

:::

## 行为与无障碍

### 呈现与提交

- 停靠式选择器显示字段和锚定日历。日历选择通过底部操作确认，输入的日期在按 Enter 或失焦时提交。
- 模态选择器将日历和手动输入编辑保留为草稿。点击“确定”提交，取消、Escape 或点击遮罩会放弃草稿并将焦点还给触发器。全屏模态还会在标题栏提供关闭和保存操作。
- `auto` 在紧凑断点选择模态呈现，在更宽窗口使用停靠式呈现。停靠式日历在下方空间不足时会翻转到字段上方。
- 范围模式下，模态日历以纵向连续月份呈现，共用一行星期标题和月份小标题。单日期和停靠式日历按月翻页。

### 手动输入

- 输入的日期接受 ISO `YYYY-MM-DD`、按语言区域数字顺序并使用 `/`、`.`、`-` 或空格分隔的形式，以及八位紧凑形式。组件不会强制输入遮罩。
- 无效或不可用的文本会通过 `invalid` 报告原始文本，并显示关联的错误文本和 `aria-invalid`；已提交的值不会改变。
- 范围模式下，早于开始日期的结束日期会被范围消息拒绝，且不会提交。

### 日历导航与键盘

- 方向键在日期之间移动，Home 和 End 移到当月第一天或最后一天，Page Up 和 Page Down 切换月份。
- Shift+M 打开月份选择，Shift+Y 打开年份选择。选项列表支持漫游焦点，并可用 Enter 或 Space 激活。
- 停靠式日历将月份和年份控件分为两组，各自带下拉和前后切换箭头。模态日历把月份和年份合并为一个下拉，旁边保留月份切换箭头。
- 星期标题使用单字符缩写，完整星期名称保留为无障碍名称。日期提供完整的本地化名称和选择状态。

### 校验

- `minDate`、`maxDate` 和 `isDateSelectable` 同时约束日历和输入。不可用日期会被禁用，超出范围的文本会被拒绝。
- 校验状态独立于文案。空文案覆盖不会使无效范围通过确认。
- 项目决策：语言切换保留当前视图、日历焦点和未确认的选择，不提交新值。已输入的日期按开始编辑时的语言解析，范围端点分别记录解析语言；未编辑的日期随新语言重新格式化。

### 响应式与从右向左

- 在紧凑宽度下，无法容纳的受限对话框会变为全屏模态。停靠式选择器锚定到字段并保持在视口内。
- 在 480px 及以下时，范围字段会收紧内边距和文字尺寸，以保持两个端点可用。这是项目适配，不是 Material 断点。
- 布局使用逻辑属性：导航图标、范围条和字段标签在从右向左布局中镜像，而时间顺序的值保持不变。

### 状态归属

`v-model` 拥有已提交的值，`v-model:open` 拥有可见性。模态草稿、输入文本、当前显示月份和活动视图由组件内部管理。应用负责持久化、服务端校验，以及超出所提供可用性回调的业务规则。`initialDate` 只选择初始显示月份，不会选择值。

## API

两个入口均可继承 [LocaleProvider](/zh/components/localization) 的语言和 `datePicker` 文案。显式 `locale` 与各标签属性优先。未配置 provider 时，客户端仍使用浏览器语言，服务端使用 `en-US`；SSR 应显式配置相同语言。

### 导出

| 导出                    | 说明                                               |
| ----------------------- | -------------------------------------------------- |
| `DatePicker`            | 单日期字段、日历和手动输入视图。                   |
| `DateRangePicker`       | 范围字段、日历和手动输入视图。                     |
| `DateRangeValue`        | `{ start: string \| null, end: string \| null }`。 |
| `DatePickerMode`        | `'auto' \| 'docked' \| 'modal'`。                  |
| `DatePickerProps`       | `DatePicker` 的属性。                              |
| `DateRangePickerProps`  | `DateRangePicker` 的属性。                         |
| `DatePickerCommonProps` | 两个入口共享的属性。                               |

### `DatePicker` 属性与模型

| 属性                     | 类型                           | 默认值                | 说明                                           |
| ------------------------ | ------------------------------ | --------------------- | ---------------------------------------------- |
| `modelValue` / `v-model` | `string \| null`               | `null`                | 已提交的 ISO 日期。                            |
| `mode`                   | `DatePickerMode`               | `'auto'`              | 呈现形态；`auto` 跟随 Material 窗口断点。      |
| `open` / `v-model:open`  | `boolean`                      | 非受控                | 控制模态或停靠式日历状态。                     |
| `initialDate`            | `string`                       | 当前月份              | 初始显示其所在月份的日期；不会选择值。         |
| `minDate`, `maxDate`     | `string`                       | 无                    | 包含边界的可选日期范围。                       |
| `yearRange`              | `[number, number]`             | `[1900, 2100]`        | 年份菜单范围。                                 |
| `isDateSelectable`       | `(isoDate: string) => boolean` | 全部允许              | 返回 `false` 时禁用日期。                      |
| `locale`                 | `string`                       | Provider → 浏览器语言 | 日期顺序、标题、输入解析和日期朗读语言。       |
| `label`                  | `string`                       | 本地化 `Select date`  | 字段和对话框名称。                             |
| `supportingText`         | `string`                       | 无                    | 格式说明或用途提示，并与字段关联。             |
| `placeholder`            | `string`                       | 本地化示例日期        | 空值字段的占位提示。                           |
| `clearable`              | `boolean`                      | `false`               | 在日历中显示清除操作，并允许清空字段以清除值。 |

`calendarLabel`、`previousMonthLabel`、`nextMonthLabel`、`previousYearLabel`、`nextYearLabel`、`confirmLabel`、`saveLabel`、`cancelLabel`、`closeLabel` 和 `clearLabel` 覆盖无障碍名称和操作；参见[在应用中导入](#在应用中导入)中的标签覆盖。

### `DateRangePicker` 属性与模型

| 属性                             | 类型                           | 默认值                           | 说明                                           |
| -------------------------------- | ------------------------------ | -------------------------------- | ---------------------------------------------- |
| `modelValue` / `v-model`         | `DateRangeValue`               | `{ start: null, end: null }`     | 已提交的 ISO 范围。                            |
| `mode`                           | `DatePickerMode`               | `'auto'`                         | 呈现形态；`auto` 跟随 Material 窗口断点。      |
| `open` / `v-model:open`          | `boolean`                      | 非受控                           | 控制模态或停靠式日历状态。                     |
| `initialDate`                    | `string`                       | 当前月份                         | 初始显示其所在月份的日期；不会选择范围。       |
| `minDate`, `maxDate`             | `string`                       | 无                               | 包含边界的可选日期范围。                       |
| `yearRange`                      | `[number, number]`             | `[1900, 2100]`                   | 年份菜单范围。                                 |
| `isDateSelectable`               | `(isoDate: string) => boolean` | 全部允许                         | 返回 `false` 时禁用日期。                      |
| `locale`                         | `string`                       | Provider → 浏览器语言            | 日期顺序、标题、输入解析和日期朗读语言。       |
| `label`                          | `string`                       | 本地化 `Select date`             | 字段和对话框名称。                             |
| `startDateLabel`, `endDateLabel` | `string`                       | 本地化 `Start date` / `End date` | 范围两端的可见标签与无障碍名称。               |
| `supportingText`                 | `string`                       | 无                               | 格式说明或用途提示，并与两个端点关联。         |
| `placeholder`                    | `string`                       | 本地化示例日期                   | 空端点字段的占位提示。                         |
| `clearable`                      | `boolean`                      | `false`                          | 在日历中显示清除操作，并允许清空字段以清除值。 |

### 事件

| 事件                | `DatePicker` 载荷 | `DateRangePicker` 载荷 | 说明                            |
| ------------------- | ----------------- | ---------------------- | ------------------------------- |
| `update:modelValue` | `string \| null`  | `DateRangeValue`       | 供 `v-model` 使用的候选提交值。 |
| `update:open`       | `boolean`         | `boolean`              | 日历可见性发生变化。            |
| `change`            | `string \| null`  | `DateRangeValue`       | 已提交的值发生变化。            |
| `invalid`           | `string`          | `string`               | 提交前被拒绝的输入文本。        |

### 方法

通过任一组件上的模板 ref 访问。

| 成员      | 签名         | 说明                       |
| --------- | ------------ | -------------------------- |
| `open()`  | `() => void` | 通过正常切换路径打开日历。 |
| `close()` | `() => void` | 关闭并放弃模态草稿。       |
| `focus()` | `() => void` | 聚焦日历触发器。           |

## 样式

选择器没有公开的插槽 API。Material 定义日历、字段和对话框的几何；项目公开一个表面阴影钩子。将以下属性设置在组件根元素上，可自定义停靠式或模态表面。

| 属性                                      | 说明                         |
| ----------------------------------------- | ---------------------------- |
| `--yam3x-date-picker-container-elevation` | 停靠式或模态表面的阴影层级。 |

## Material 参考

[日期选择器概览](https://m3.material.io/components/date-pickers/overview) · [指南](https://m3.material.io/components/date-pickers/guidelines) · [规格](https://m3.material.io/components/date-pickers/specs) · [无障碍](https://m3.material.io/components/date-pickers/accessibility)
