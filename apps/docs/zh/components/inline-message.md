<script setup lang="ts">
import InlineMessageExample from '../../components/demos/InlineMessageExample.vue'
</script>

# Inline message

`InlineMessage` 是项目拓展组件，在相关内容旁持续显示反馈。临时反馈使用 Snackbar；必须打断当前任务并要求回应时使用 Dialog。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><InlineMessageExample /></div>

::: details 查看示例源码

<<< ../../components/demos/InlineMessageExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { InlineMessage } from './components/yam3x/inline-message'
</script>

<template>
  <InlineMessage
    title="更改尚未保存"
    tone="error"
    announcement="polite"
  >
    你的编辑仍然保留。请检查网络连接，然后重试保存。
  </InlineMessage>
</template>
```

## API

| 属性           | 默认值            | 用途                                                                         |
| -------------- | ----------------- | ---------------------------------------------------------------------------- |
| `title`        | 空                | 可选的简短标题，使用 Title Small。                                           |
| `tone`         | `info`            | `info`、`success`、`warning` 或 `error`。                                    |
| `announcement` | `off`             | `off` 不使用实时区域角色；`polite` 使用 `status`；`assertive` 使用 `alert`。 |
| `icon`         | 对应语气的图标    | Material Symbol 名称；`false` 表示隐藏。                                     |
| `dismissible`  | `false`           | 显示独立的关闭操作。                                                         |
| `dismissLabel` | `Dismiss message` | 关闭操作的无障碍名称，需按语言设置。                                         |
| `dismissFocus` | 父容器            | 函数，返回关闭含焦点内容后应聚焦的附近元素。                                 |

`v-model:open` 控制可见性，默认 `true`。未绑定时由组件管理。关闭操作请求隐藏后触发 `dismiss()`。关闭提示不表示其背后的问题已解决。

必需的默认插槽提供消息正文。`#icon` 替换装饰图标；`#actions` 放置按钮或链接。操作位于正文下方并可换行；操作区内可用的文字按钮继承消息前景色。`class`、`style`、`id` 等属性应用于消息根元素。

## 行为与无障碍

紧急公告请参考 [WAI alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)。

组件不会自动超时消失，也不会在出现时自动聚焦。视觉语气与公告紧急程度相互独立：静态错误可以不公告，非错误的动态更新也可以公告。请根据事件选择公告方式，避免为常规进度反复公告。实时区域角色用于动态插入或更新的消息；辅助技术不一定会公告首次页面加载时就存在的消息。

当关闭移除了当前焦点所在的内容，焦点返回 `dismissFocus()` 指定的元素；未指定时返回父容器。作为后备目标的容器会临时允许程序化聚焦，但不进入 Tab 顺序。如果应用已经将焦点移到其他位置，组件保留该焦点。关闭无关提示不移动焦点。如果消息和父容器可能一起移除，请明确指定附近的恢复目标。

信息、成功和提醒使用 Surface Container / On Surface，含义通过文字和图标表达。错误使用 Error Container / On Error Container。图标是装饰性的，正文必须解释消息含义。字段级错误仍应保留在对应字段旁。

## 样式

支持覆盖 `--yam3x-inline-message-container-color`、`--yam3x-inline-message-content-color` 和 `--yam3x-inline-message-shape`。请同时覆盖配对的前景与背景色以保持对比度。消息随内容增高，宽度跟随所在区域。

## Material 参考

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Color roles](https://m3.material.io/styles/color/roles) · [Tooltips guidelines](https://m3.material.io/components/tooltips/guidelines)
