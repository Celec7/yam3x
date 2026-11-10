<script setup>
import CalendarExample from '../../components/demos/CalendarExample.vue'
import CalendarRangeExample from '../../components/demos/CalendarRangeExample.vue'
import CalendarRestrictedExample from '../../components/demos/CalendarRestrictedExample.vue'
import CalendarRtlExample from '../../components/demos/CalendarRtlExample.vue'
</script>

# 日历

`Calendar` 是一个项目拓展，将日期选择器的日历作为嵌入式控件公开。它支持选择单个日期和范围，但不自带对话框、触发器或文本框。

最接近的 Compose Material 3 组合是 `DatePicker` 的日历表面；将该表面直接放在页面区域或弹出层中属于项目决策。当外层布局负责呈现时使用 `Calendar`。当字段、模态对话框或手动输入是任务的一部分时，使用[日期选择器](/zh/components/date-picker)。

## 示例

### 基础

基础日历选择单个日期，并将以 `15` 结尾的日期标记为特殊日期，但不禁用它们。周期控件可打开 18 年视图，选择年份后继续月份选择。值行报告所选 ISO 日期。

<div class="vp-raw yam3x-doc-demo-theme"><CalendarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CalendarExample.vue{vue}

:::

### 范围

范围选择分别保存开始和结束日期。第一次激活开始一个范围，第二次完成它，之后的激活会开始新范围。若第二个日期早于开始日期，则从该日期重新开始范围。

<div class="vp-raw yam3x-doc-demo-theme"><CalendarRangeExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CalendarRangeExample.vue{vue}

:::

### 受限日期

`min-date` 和 `max-date` 限定可选范围，`is-date-selectable` 禁用单个日期。示例还将 15 日标记为特殊日期，这会改变样式但不影响可用性。超出范围的导航会被禁用。

<div class="vp-raw yam3x-doc-demo-theme"><CalendarRestrictedExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CalendarRestrictedExample.vue{vue}

:::

### 从右向左

方向切换按钮通过 `dir` 属性镜像日历。日期值和键盘推进保持时间顺序，而水平方向键行为反转。

<div class="vp-raw yam3x-doc-demo-theme"><CalendarRtlExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CalendarRtlExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/installation)后，从应用中导入复制后的组件。使用 `./components/yam3x/` 之类的使用者路径；演示源码中的 `@registry` 路径仅用于本站。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from './components/yam3x/calendar'

const selected = ref<string | null>(null)
</script>

<template>
  <Calendar
    v-model="selected"
    label="发布日期"
  />
</template>
```

值是 ISO 日期（`YYYY-MM-DD`）或 `null`。范围选择时，配合 `selection="range"` 绑定 `v-model:range-start` 和 `v-model:range-end`。

::: details 范围、初始视图和可用性

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Calendar } from './components/yam3x/calendar'

const start = ref<string | null>(null)
const end = ref<string | null>(null)
</script>

<template>
  <Calendar
    v-model:range-start="start"
    v-model:range-end="end"
    selection="range"
    label="预订日期"
    start-at="2026-10-01"
    start-view="month"
    min-date="2026-10-01"
    max-date="2026-12-31"
    :is-date-selectable="(date) => date !== '2026-10-15'"
    :is-special-date="(date) => date.endsWith('-01')"
  />
</template>
```

`start-at` 只选择显示月份，不会选择日期。`start-view` 可打开月份、年份或 18 年视图。

:::

::: details 自定义标题

```vue
<Calendar v-model="selected">
  <template #header="{ periodLabel, canPrevious, canNext, previous, next, toggle }">
    <div class="calendar-header">
      <button
        type="button"
        @click="toggle"
      >
        {{ periodLabel }}
      </button>
      <button
        type="button"
        :disabled="!canPrevious"
        @click="previous"
      >
        上一周期
      </button>
      <button
        type="button"
        :disabled="!canNext"
        @click="next"
      >
        下一周期
      </button>
    </div>
  </template>
</Calendar>
```

`header` 插槽替换周期标题和导航。`view`、`periodLabel`、`canPrevious`、`canNext`、`previous`、`next` 和 `toggle` 描述当前周期。

:::

## 行为与无障碍

### 周期与视图

- 月份视图显示一个 7 列网格，使用窄星期标签和完整本地化星期名称。可见月份之外的日期保持完全不透明。
- 周期标题在月份视图中打开 18 年视图，其他视图则返回月份视图。月份选项和 18 年列表使用三列；18 年视图可按 18 年翻页。
- 选择年份后继续选择月份。`start-view` 选择初始视图，但不改变已选值。

### 选择与范围

- 单选在所选网格单元上公开 `aria-selected`。今天使用 `aria-current="date"`。
- 范围选择标记开始、结束和中间日期。完成的范围会在下次激活时重新开始；早于开始日期的第二个端点会从该日期重新开始。
- 同一天的范围只显示一个端点指示，不显示尾部范围条。

### 可用性与特殊日期

- `minDate`、`maxDate` 和 `isDateSelectable` 会禁用不可用日期，并阻止导航到没有可选日期的月份或年份。
- `isSpecialDate` 只改变视觉处理并添加特殊日期描述；不会禁用日期。
- `specialDateLabel`、`rangeStartLabel`、`rangeEndLabel` 和 `inRangeLabel` 提供这些状态的朗读描述。

### 键盘与焦点

- 方向键在日期之间移动，并遵循渲染出的网格行。Home 和 End 移到当月第一天或最后一天。
- Page Up 和 Page Down 切换月份；Shift+Page Up 和 Shift+Page Down，或 Alt+Page Up 和 Alt+Page Down，切换年份。
- Shift+M 打开月份选择，Shift+Y 打开年份选择。Enter 或 Space 选择聚焦的日期。
- 同一时间只有一个日期处于 Tab 顺序中。日期指示器使用 2px on-surface 焦点环。

### 响应式与从右向左

- 独立表面保持 360px 宽度、28px 形状和 48px 日期目标。宽度不足时横向滚动，而不是缩小目标。
- 方向来自外层 `dir`。在从右向左布局中，网格和导航镜像，而日期值保持时间顺序。
- 减少动态效果偏好会移除视图过渡；强制颜色模式会保持焦点环和选择状态可见。

### 状态归属

`v-model`、`v-model:range-start` 和 `v-model:range-end` 拥有被接受的选择。可见月份、活动视图和聚焦日期由组件内部管理。`startAt` 和 `startView` 是初始提示；后续模型更新会重新定位可见月份。语言切换会保留聚焦日期和可见周期。

## API

内置文案及日期格式可继承 [LocaleProvider](/zh/components/localization)；显式 `locale` 和各标签属性优先。未配置 provider 时，客户端保留浏览器语言默认值，服务端使用 `en-US`。使用 SSR 时显式提供相同语言。

### 导出

| 导出       | 说明                       |
| ---------- | -------------------------- |
| `Calendar` | 嵌入式的单日期或范围网格。 |

### 属性与模型

| 属性                                                                                                                         | 类型                                | 默认值                | 说明                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `modelValue` / `v-model`                                                                                                     | `string \| null`                    | `null`                | 单选模式下选择的 ISO 日期。                                                              |
| `selection`                                                                                                                  | `'single' \| 'range'`               | `'single'`            | 单日期或范围选择。                                                                       |
| `rangeStart`, `rangeEnd`                                                                                                     | `string \| null`                    | `null`                | `selection="range"` 的范围端点；使用 `v-model:range-start` 和 `v-model:range-end` 绑定。 |
| `startAt`                                                                                                                    | `string \| null`                    | 已选日期或今天        | 初始显示月份；不会选择日期。                                                             |
| `startView`                                                                                                                  | `'month' \| 'year' \| 'multi-year'` | `'month'`             | 初始周期视图。                                                                           |
| `minDate`, `maxDate`                                                                                                         | `string \| null`                    | `null`                | 包含边界的可选日期范围。                                                                 |
| `isDateSelectable`                                                                                                           | `(date: string) => boolean`         | 全部允许              | 返回 `false` 时禁用日期。                                                                |
| `isSpecialDate`                                                                                                              | `(date: string) => boolean`         | 无                    | 以特殊样式显示日期，不改变可用性。                                                       |
| `locale`                                                                                                                     | `string`                            | Provider → 浏览器语言 | 日期格式、星期名称、周起始日和日期朗读。                                                 |
| `label`                                                                                                                      | `string`                            | 本地化 `Calendar`     | 日历区域的无障碍名称。                                                                   |
| `specialDateLabel`                                                                                                           | `string`                            | 本地化 `Special date` | 特殊日期的朗读描述。                                                                     |
| `rangeStartLabel`, `rangeEndLabel`, `inRangeLabel`                                                                           | `string`                            | 本地化默认值          | 范围状态的朗读描述。                                                                     |
| `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`, `nextYearLabel`, `previousMultiYearLabel`, `nextMultiYearLabel` | `string`                            | 本地化默认值          | 周期导航按钮的无障碍名称。                                                               |

### 事件

| 事件                | 载荷                                                                             | 说明                 |
| ------------------- | -------------------------------------------------------------------------------- | -------------------- |
| `update:modelValue` | `string \| null`                                                                 | 候选的单日期值。     |
| `update:rangeStart` | `string \| null`                                                                 | 候选的范围开始日期。 |
| `update:rangeEnd`   | `string \| null`                                                                 | 候选的范围结束日期。 |
| `change`            | `{ date: string \| null, rangeStart: string \| null, rangeEnd: string \| null }` | 激活后的当前选择。   |

### 插槽

| 插槽     | 属性                                                                  | 说明                 |
| -------- | --------------------------------------------------------------------- | -------------------- |
| `header` | `{ view, periodLabel, canPrevious, canNext, previous, next, toggle }` | 替换周期标题和导航。 |

### 方法

通过模板 ref 访问。

| 成员                    | 签名                | 说明                                         |
| ----------------------- | ------------------- | -------------------------------------------- |
| `periodLabel`           | `string`（getter）  | 当前周期标题。                               |
| `canMovePreviousPeriod` | `boolean`（getter） | 是否可向前导航。                             |
| `canMoveNextPeriod`     | `boolean`（getter） | 是否可向后导航。                             |
| `movePreviousPeriod()`  | `() => void`        | 移到上一月、上一年或上一个 18 年页面。       |
| `moveNextPeriod()`      | `() => void`        | 移到下一月、下一年或下一个 18 年页面。       |
| `togglePeriod()`        | `() => void`        | 从月份视图打开 18 年视图，否则返回月份视图。 |
| `resetActiveView()`     | `() => void`        | 返回初始 `startView`。                       |
| `updateTodayDate()`     | `() => void`        | 刷新内部今天值。                             |
| `focusActiveCell()`     | `() => void`        | 聚焦活动日期单元。                           |

## 样式

日历公开用于容器、标签、状态和动态效果的项目自定义属性。默认值使用 Date picker 颜色角色，以及共享排版和运动 System token。星期标签使用窄 Date picker 格式；日期焦点是内嵌日期指示器上的 2px on-surface 环。

::: details CSS 覆盖

| 区域                 | 支持的属性                                                                                                                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 容器                 | `--yam3x-calendar-container-color`、`--yam3x-calendar-container-shape`、`--yam3x-calendar-padding`                                                                                                                                                                                                                          |
| 周期和星期标签       | `--yam3x-calendar-period-button-text-color`、`--yam3x-calendar-weekday-color`、`--yam3x-calendar-weekday-font-size`、`--yam3x-calendar-weekday-font-weight`、`--yam3x-calendar-weekday-line-height`、`--yam3x-calendar-weekday-tracking`                                                                                    |
| 日期标签             | `--yam3x-calendar-date-font-size`、`--yam3x-calendar-date-font-weight`、`--yam3x-calendar-date-line-height`、`--yam3x-calendar-date-tracking`、`--yam3x-calendar-item-color`、`--yam3x-calendar-item-font-size`、`--yam3x-calendar-item-font-weight`、`--yam3x-calendar-item-line-height`、`--yam3x-calendar-item-tracking` |
| 选中和今天状态       | `--yam3x-calendar-item-selected-color`、`--yam3x-calendar-item-selected-container-color`、`--yam3x-calendar-item-selected-hover-color`、`--yam3x-calendar-item-current-outline-color`、`--yam3x-calendar-item-current-outline-thickness`、`--yam3x-calendar-date-current-outline-thickness`                                 |
| 特殊、范围和禁用状态 | `--yam3x-calendar-item-special-color`、`--yam3x-calendar-item-special-container-color`、`--yam3x-calendar-item-special-hover-color`、`--yam3x-calendar-range-color`、`--yam3x-calendar-range-container-color`、`--yam3x-calendar-item-disabled-color`、`--yam3x-calendar-item-disabled-color-opacity`                       |
| 动态效果             | `--yam3x-calendar-slide-animation-duration`                                                                                                                                                                                                                                                                                 |

:::

## Material 参考

[日期选择器概览](https://m3.material.io/components/date-pickers/overview) · [指南](https://m3.material.io/components/date-pickers/guidelines) · [规格](https://m3.material.io/components/date-pickers/specs) · [无障碍](https://m3.material.io/components/date-pickers/accessibility)
