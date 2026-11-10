<script setup lang="ts">
import AvatarExample from '../../components/demos/AvatarExample.vue'
</script>

# Avatar

`Avatar` 使用单张图片、图标或姓名首字母标识人物、团队或对象。当列表行、评论或资料摘要中需要紧凑的视觉标记来帮助读者识别实体时使用它。

Avatar 是项目扩展。Material 3 没有定义独立的 Avatar 组件或头像专属视觉规范。最接近的 Compose Material 3 组合是使用 `CircleShape` 的 `Box`，内部放置 Text、Icon 或 Image 子项；尺寸、形状、裁剪方式和内容回退都是项目决策。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><AvatarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/AvatarExample.vue{vue}

:::

这一行展示了默认的 40 px 圆形头像、48 px 纯图标头像、40 px 照片头像，以及带独立在线圆点的 56 px 圆角方形头像。姓名首字母保持为文本，图标和照片带自己的可访问名称，组件只负责裁剪 slot 内容。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { Avatar } from './components/yam3x/avatar'
</script>

<template>
  <Avatar
    role="img"
    aria-label="陈晓"
    >陈</Avatar
  >
</template>
```

Avatar 只渲染默认 slot，不自动补充内容。请提供图片、图标或姓名首字母，并为该内容选择合适的无障碍处理方式。`id`、`class`、`hidden`、`role` 和 `aria-label` 等原生属性会应用到根元素。

::: details 图片回退与在线状态

Avatar 不加载图片、不重试失败请求，也不自动选择回退内容。图片请求失败时请切换 slot 内容，并保持回退名称稳定。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Avatar } from './components/yam3x/avatar'

const failed = ref(false)
</script>

<template>
  <Avatar
    role="img"
    aria-label="陈晓"
  >
    <img
      v-if="!failed"
      src="/people/chen.jpg"
      alt=""
      @error="failed = true"
    />
    <template v-else>陈</template>
  </Avatar>
</template>
```

需要状态圆点或计数时，让头像保持被动，并把项目的 `Badge` 附加到同一个定位包装元素上。Avatar 没有内置的在线状态、徽标或交互 API。

:::

## 行为与无障碍

### 名称与替代文本

- 纯图标头像需要设置 `role="img"` 和简洁的 `aria-label`；图标本身保持装饰性。
- 信息性照片需要简洁的 `alt` 文本。如果附近已有姓名，或图片仅作装饰，请使用 `alt=""`。
- 姓名首字母保持为文本。旁边已显示同一姓名时，请隐藏头像或提供空替代文本，避免辅助技术重复播报身份。
- `role="img"` 会把后代内容当作一张图片。请把名称放在头像上，而不是嵌套图标上。

### 内容与裁剪

- 组件居中显示一个 slot 并裁剪其内容。图片以 `object-fit: cover` 填满区域；放不下的内容不会重新排版。
- Avatar 不会按尺寸调整文字、缩写姓名或自动生成首字母。请提供适合所选尺寸的内容。
- 原生 `hidden` 属性会把头像从布局和无障碍树中移除。其他可见性状态由应用控制。

### 尺寸、形状与对比度

- 尺寸、形状、前景色和背景色通过文档中的自定义属性设置。默认是 40 px 圆形表面，使用 Primary Container 与 On Primary Container。
- 强制颜色模式下，组件会绘制一像素 CanvasText 边界，确保背景被抑制时头像边缘仍然可见。
- Avatar 自身没有方向性布局。slot 内容遵循周围的书写方向。

## API

### 导出

| 导出     | 说明                                       |
| -------- | ------------------------------------------ |
| `Avatar` | 用于图片、图标或文本的带形状单 slot 表面。 |

### 属性与模型

Avatar 未定义任何属性或模型。请把原生 HTML 属性和 ARIA 属性传给根元素；`hidden` 用于隐藏头像。

### 事件

Avatar 不触发事件。需要可点击头像时，将其包装在 Button 或链接中，并让头像本身保持被动。

### 插槽

| 插槽      | 作用域 | 用途                                     |
| --------- | ------ | ---------------------------------------- |
| `default` | —      | 一张图片、一个图标或姓名首字母等短文本。 |

### 方法

Avatar 不暴露实例方法。

## 样式

Avatar 在根元素上暴露项目定义的自定义属性。颜色默认映射到配对的 Material Primary Container 和 On Primary Container 角色；尺寸、形状和排版默认值是项目选择，并引用共享 System token。

::: details 自定义属性

| 属性                         | 默认值                         | 说明                 |
| ---------------------------- | ------------------------------ | -------------------- |
| `--yam3x-avatar-size`        | `40px`                         | 正方形头像尺寸。     |
| `--yam3x-avatar-shape`       | System `corner-full`           | 内容裁剪形状。       |
| `--yam3x-avatar-color`       | System `primary-container`     | 首字母和图标背景色。 |
| `--yam3x-avatar-label-color` | System `on-primary-container`  | 首字母和图标前景色。 |
| `--yam3x-avatar-font-family` | System `title-medium` 字体族   | 首字母字体族。       |
| `--yam3x-avatar-font-size`   | System `title-medium` 字号     | 首字母字号。         |
| `--yam3x-avatar-font-weight` | System `title-medium` 字重     | 首字母字重。         |
| `--yam3x-avatar-line-height` | System `title-medium` 行高     | 首字母行高。         |
| `--yam3x-avatar-tracking`    | System `title-medium` 字符间距 | 首字母字符间距。     |

:::

## Material 参考

[颜色角色](https://m3.material.io/styles/color/roles) · [形状与圆角尺度](https://m3.material.io/styles/shape/corner-radius-scale) · [应用字体](https://m3.material.io/styles/typography/applying-type)
