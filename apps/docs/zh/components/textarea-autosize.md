<script setup>
import TextareaAutosizeExample from '../../components/demos/TextareaAutosizeExample.vue'
</script>

# Textarea autosize

`vTextareaAutosize` 是让原生 `<textarea>` 随内容增高的项目可选指令。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><TextareaAutosizeExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TextareaAutosizeExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { vTextareaAutosize } from './components/yam3x/textarea-autosize'
</script>

<template>
  <label for="message">消息</label>
  <textarea
    id="message"
    v-textarea-autosize="{ minRows: 2, maxRows: 6 }"
    rows="2"
  />
</template>
```

## API

| 值        | 类型      | 默认值             | 说明                                                                                              |
| --------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------- |
| `minRows` | `number`  | textarea 的 `rows` | 内容少时保留的最小可见行数                                                                        |
| `maxRows` | `number`  | `0`（不限）        | 达到上限后在 textarea 内纵向滚动                                                                  |
| `enabled` | `boolean` | `true`             | 启用自动调整。设为 `false` 时，指令恢复原有内联 `height` 和 `overflow-y`；textarea 仍可编辑和提交 |

## 行为与无障碍

指令只改变 textarea 的高度。表单、焦点、选区和文本输入行为仍由原生控件处理。Material 的 Web 指引建议固定高度并在内部滚动；自动增高会推动字段下方内容移动，应在这种布局变化适合产品时使用。

## Material 参考

[Text fields 概览](https://m3.material.io/components/text-fields/overview) · [指南](https://m3.material.io/components/text-fields/guidelines) · [无障碍](https://m3.material.io/components/text-fields/accessibility)
