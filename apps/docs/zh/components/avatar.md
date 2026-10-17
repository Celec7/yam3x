<script setup lang="ts">
import AvatarExample from '../../components/demos/AvatarExample.vue'
</script>

# Avatar

Avatar 使用图片、图标或姓名首字母标识人物或实体。它是视觉标记，不负责加载图片，也不充当交互控件。

Avatar 是项目扩展，使用共享的 Material 颜色、形状和排版 token，而非 Avatar 专属 token。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <AvatarExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/AvatarExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import Avatar from './components/yam3x/avatar/avatar.vue'
</script>

<template>
  <Avatar
    role="img"
    aria-label="陈晓"
    >陈</Avatar
  >
</template>
```

## API

| 属性                 | 类型         | 默认值  | 说明                                                                          |
| -------------------- | ------------ | ------- | ----------------------------------------------------------------------------- |
| 默认 slot            | `VNode`      | 空      | 可放置图片、文字首字母或图标；组件不自动补充内容。                            |
| `hidden`             | 原生布尔属性 | `false` | 隐藏头像。                                                                    |
| 其他原生及 ARIA 属性 | HTML 属性    | —       | 透传到根包装元素，例如 `aria-label`、`aria-hidden`、`role`、`id` 和 `class`。 |

## 行为与无障碍

纯图标头像需要设置 `role="img"` 和简洁的 `aria-label`。信息性照片应提供简短的 `alt` 文本。如果附近已有相同的人名信息，或头像仅作装饰，请使用 `alt=""`。首字母应保留为文本；旁边已有姓名时避免屏幕阅读器重复播报。

## 样式

以下项目扩展覆盖项可设置在 Avatar 根元素上。默认颜色使用配对的 System `primary-container` 与 `on-primary-container` 角色。尺寸、形状和排版默认值是项目选择；形状与排版引用共享 System token。

| 属性                         | 默认值                         | 说明                 |
| ---------------------------- | ------------------------------ | -------------------- |
| `--yam3x-avatar-size`        | `40px`                         | 正方形头像尺寸。     |
| `--yam3x-avatar-shape`       | System `corner-full`           | 内容裁剪形状。       |
| `--yam3x-avatar-color`       | System `primary-container`     | 首字母和图标背景色。 |
| `--yam3x-avatar-label-color` | System `on-primary-container`  | 首字母和图标前景色。 |
| `--yam3x-avatar-font-size`   | System `title-medium` 字号     | 首字母字号。         |
| `--yam3x-avatar-font-weight` | System `title-medium` 字重     | 首字母字重。         |
| `--yam3x-avatar-line-height` | System `title-medium` 行高     | 首字母行高。         |
| `--yam3x-avatar-tracking`    | System `title-medium` 字符间距 | 首字母字符间距。     |
