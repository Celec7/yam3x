<script setup lang="ts">
import CheckboxBasicExample from '../../components/demos/CheckboxBasicExample.vue'
import CheckboxExample from '../../components/demos/CheckboxExample.vue'
import CheckboxGroupExample from '../../components/demos/CheckboxGroupExample.vue'
</script>

# Checkbox

Checkbox 让用户从列表中选择一个或多个项目，或开启、关闭某个项目。选项可以并存时使用它；从一组可见选项中只选一项时使用[单选按钮](/zh/components/radio-group)，对立即生效的设置使用[开关](/zh/components/switch)。

两个导出控件都是 Material 组件。`TriStateCheckbox` 增加混合状态的呈现；父子选项的联动由应用负责。

## 示例

### 基础

每个 checkbox 拥有独立的布尔值。用 `v-model` 绑定接受值，并设置 `name` 让控件进入原生表单数据。

<div class="vp-raw yam3x-doc-demo-theme"><CheckboxBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CheckboxBasicExample.vue{vue}

:::

### 状态与表单参与

第一组是真实表单：`required` 会阻止空值提交，`value` 提供提交的字符串，重置按钮恢复 checkbox 挂载时的状态。混合状态示例显示横线标记，激活后会变为选中。最后一个示例同时使用 `disabled` 和 `invalid`。

<div class="vp-raw yam3x-doc-demo-theme"><CheckboxExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CheckboxExample.vue{vue}

:::

`invalid` 只应用错误呈现和 `aria-invalid`；原生校验由 `required` 提供。禁用的 checkbox 仍保留错误呈现。

### 父子选择

父级状态由可用子项推导：全部未选为未选中，部分选中为混合，全部选中为选中。激活父级会选择或清除所有可用子项。不可用的子项处于禁用状态，且永远不会被提交。

<div class="vp-raw yam3x-doc-demo-theme"><CheckboxGroupExample /></div>

::: details 查看演示源码

<<< ../../components/demos/CheckboxGroupExample.vue{vue}

:::

这种联动属于应用代码。一个 checkbox 只表示一个值，不管理同级控件。

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, TriStateCheckbox, type CheckboxState } from './components/yam3x/checkbox'

const updates = ref(false)
const topics = ref<CheckboxState>('indeterminate')
</script>

<template>
  <Checkbox
    v-model="updates"
    label="邮件更新"
    name="updates"
    value="yes"
  />
  <TriStateCheckbox
    v-model="topics"
    label="所有主题"
  />
</template>
```

`label` 为必填项，同时作为控件的可访问名称。`description` 添加补充说明，并与原生 input 关联。

::: details 表单属性与取消激活

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from './components/yam3x/checkbox'

const accepted = ref(false)

function askForConsent(event: MouseEvent): void {
  if (!window.confirm('此选择需要确认。')) event.preventDefault()
}
</script>

<template>
  <form @submit.prevent>
    <Checkbox
      v-model="accepted"
      label="接受使用条款"
      name="terms"
      value="accepted"
      required
    />
    <Checkbox
      label="由策略锁定"
      :model-value="true"
      disabled
      invalid
      @click="askForConsent"
    />
    <button type="reset">重置表单</button>
  </form>
</template>
```

阻止转发的 `click` 会同时取消状态变化和原生点击。原生重置会恢复每个 checkbox 挂载时提供的状态。

:::

## 行为与无障碍

### 状态与激活

- 选中状态保存在原生 input 上，因此平台负责 Space 激活、焦点和表单提交。
- `TriStateCheckbox` 还会暴露 `indeterminate`。激活选中以外的任何状态都会变为选中。
- 处于混合状态时 input 的 `name` 被省略，因此该状态不提交值。
- `invalid` 添加错误颜色呈现和 `aria-invalid="true"`，但不会让控件校验失败。
- 点击或轻触标签和控件都会激活 checkbox。按下标签时反馈会转发到 48px 目标区域。
- 两个导出都没有只读模式。禁用的 checkbox 会阻止更改，但也会从表单数据中移除其值。

### 键盘与焦点

- Tab 将焦点移到原生 input；Space 切换状态。
- 焦点在目标区域内绘制 3px 的 `secondary` 圆环。悬停和按下状态使用 40px 状态层。
- `@click.prevent` 会取消激活，同时仍先转发 `click` 事件。

### 表单

- 选中的 checkbox 以 `name` 提交其 `value`。未选中、混合和禁用状态不提交任何值。
- 原生 `required` 在约束校验时报告缺失值；`form` 可将 checkbox 关联到子树之外的表单。
- 原生重置恢复每个 checkbox 挂载时的状态，包括混合状态。

### 状态归属

`v-model` 拥有接受的选择。组件从不写入同级值，因此选择所有者负责推导父级状态并将父级变化应用到子项。保持模型不变即可拒绝提议的更改。

## API

### 导出

| 导出               | 类型 | 用途                                            |
| ------------------ | ---- | ----------------------------------------------- |
| `Checkbox`         | 组件 | 普通的选中与未选中选择。                        |
| `TriStateCheckbox` | 组件 | 可报告混合状态的选择。                          |
| `CheckboxState`    | 类型 | `'unchecked' \| 'checked' \| 'indeterminate'`。 |

### `Checkbox` 属性与模型

| 属性 / 模型   | 类型      | 默认值  | 说明                                   |
| ------------- | --------- | ------- | -------------------------------------- |
| `v-model`     | `boolean` | `false` | 接受的选中状态。                       |
| `label`       | `string`  | 必填    | 可见标签与可访问名称。                 |
| `description` | `string`  | —       | 与原生 input 关联的补充说明。          |
| `id`          | `string`  | —       | 原生 input 的 ID；包裹标签也提供名称。 |
| `name`        | `string`  | —       | 原生表单字段名。                       |
| `value`       | `string`  | `'on'`  | 选中时提交的值。                       |
| `form`        | `string`  | —       | 按 ID 关联到表单。                     |
| `required`    | `boolean` | `false` | 原生校验要求选中。                     |
| `disabled`    | `boolean` | `false` | 禁止激活，且不参与表单提交。           |
| `invalid`     | `boolean` | `false` | 错误颜色呈现与 `aria-invalid`。        |

### `TriStateCheckbox` 属性与模型

| 属性 / 模型   | 类型            | 默认值        | 说明                             |
| ------------- | --------------- | ------------- | -------------------------------- |
| `v-model`     | `CheckboxState` | `'unchecked'` | 接受状态，包括混合状态。         |
| `label`       | `string`        | 必填          | 可见标签与可访问名称。           |
| `description` | `string`        | —             | 与原生 input 关联的补充说明。    |
| `id`          | `string`        | —             | 原生 input 的 ID。               |
| `name`        | `string`        | —             | 原生表单字段名；混合状态下省略。 |
| `value`       | `string`        | `'on'`        | 选中时提交的值。                 |
| `form`        | `string`        | —             | 按 ID 关联到表单。               |
| `required`    | `boolean`       | `false`       | 原生校验要求选中。               |
| `disabled`    | `boolean`       | `false`       | 禁止激活，且不参与表单提交。     |
| `invalid`     | `boolean`       | `false`       | 错误颜色呈现与 `aria-invalid`。  |

### 事件

| 事件      | 载荷         | 说明                               |
| --------- | ------------ | ---------------------------------- |
| `click`   | `MouseEvent` | 状态更新前从原生 input 转发。      |
| `input`   | `Event`      | 激活后转发的原生 input 事件。      |
| `change`  | `Event`      | 转发的原生 change 事件。           |
| `invalid` | `Event`      | 从 input 转发的原生 invalid 事件。 |

### 插槽

两个组件都没有声明插槽；可见文字由 `label` 和 `description` 渲染。

### 方法

两个组件都不暴露实例方法。父子联动属于应用代码。

## 样式

没有公开的组件级 CSS 自定义属性。组件使用共享 System token，请在主题根节点设置 `--md-sys-color-*`、字阶、动效和密度 token。

方框为 18px，圆角 2px，启用描边 2px，状态层 40px，目标区域 48px。选中容器与图标使用 `primary` 和 `on-primary`；描边使用 `on-surface-variant`；错误状态使用 `error` 角色。标签使用 Body Large，补充说明使用 Body Medium。可以调整周围密度，但不要将 48px 目标区域缩小到文档记录的最小值以下。

## Material 参考

[Checkbox 概览](https://m3.material.io/components/checkbox/overview) · [指南](https://m3.material.io/components/checkbox/guidelines) · [规格](https://m3.material.io/components/checkbox/specs) · [无障碍](https://m3.material.io/components/checkbox/accessibility)
