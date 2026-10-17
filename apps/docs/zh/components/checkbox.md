<script setup lang="ts">
import CheckboxExample from '../../components/demos/CheckboxExample.vue'
</script>

# Checkbox

Checkbox 允许用户独立选择一个或多个选项。选项可以并存时使用 checkbox；只能选择一项时使用 radio button。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <CheckboxExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/CheckboxExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, TriStateCheckbox } from './components/yam3x/checkbox'
import type { CheckboxState } from './components/yam3x/checkbox'

const updates = ref(false)
const topics = ref<CheckboxState>('indeterminate')
</script>

<template>
  <Checkbox
    v-model="updates"
    label="邮件更新"
    name="updates"
  />
  <TriStateCheckbox
    v-model="topics"
    label="所有主题"
  />
</template>
```

## API

| 组件 / 属性                       | 类型                                                             | 默认值        | 说明                                              |
| --------------------------------- | ---------------------------------------------------------------- | ------------- | ------------------------------------------------- |
| `Checkbox`                        |                                                                  |               | 用于普通的未选中或选中状态。                      |
| `TriStateCheckbox`                |                                                                  |               | 用于需要表达部分选中状态的控件。                  |
| `Checkbox` 的 `v-model`           | `boolean`                                                        | `false`       | 选中状态。                                        |
| `TriStateCheckbox` 的 `v-model`   | `CheckboxState`（`'unchecked' \| 'checked' \| 'indeterminate'`） | `'unchecked'` | 状态；激活混合状态的复选框后会变为选中。          |
| `label`                           | `string`                                                         | 必填          | 可见标签，也是复选框的可访问名称。                |
| `description`                     | `string`                                                         | —             | 补充说明，并与原生 input 关联。                   |
| `name`, `value`, `form`           | 原生表单属性                                                     | `value="on"`  | 控制表单关联与提交值；混合状态不会提交该值。      |
| `required`, `disabled`, `invalid` | `boolean`                                                        | `false`       | 必填校验、禁用和错误呈现状态。                    |
| `id`                              | `string`                                                         | —             | 原生 input 的 ID；可用 `label` 提供隐式关联标签。 |

两个组件都会触发 `click`、`input`、`change` 和 `invalid`。原生 `input`、`change`、`invalid` 事件从 checkbox input 转发。

## 行为与无障碍

两个组件均使用原生 checkbox input，由浏览器处理表单与键盘行为。激活混合状态的 `TriStateCheckbox` 会将其变为选中。使用 `@click.prevent` 可以取消激活。父子选项的联动由调用方负责。

## Material 参考

[Checkbox 概览](https://m3.material.io/components/checkbox/overview) · [指南](https://m3.material.io/components/checkbox/guidelines) · [规格](https://m3.material.io/components/checkbox/specs) · [无障碍](https://m3.material.io/components/checkbox/accessibility)
