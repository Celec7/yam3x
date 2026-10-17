<script setup lang="ts">
import ShapeExample from '../../components/demos/ShapeExample.vue'
</script>

# Shape

Shape 是用于呈现 Material Shape Library 装饰形状的项目组件。35 个名称对应形状库；CSS 裁切和变形属于项目扩展。应谨慎使用形状，且不要赋予未经定义的含义。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <ShapeExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/ShapeExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { Shape } from './components/yam3x/shape'
</script>

<template>
  <Shape
    name="sunny"
    aria-hidden="true"
  />
</template>
```

## API

| 属性             | 类型                | 默认值 | 说明                                                                                                      |
| ---------------- | ------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `name`           | `ShapeName \| null` | `null` | 35 个命名形状之一；设为 `null` 时不剪裁、不绘制容器背景。                                                 |
| 默认 slot        | `VNode`             | 空     | 被所选形状剪裁的内容。图片和视频填满正方形并默认 `object-fit: cover`。                                    |
| 原生及 ARIA 属性 | HTML 属性           | —      | 透传到根元素。组件本身是被动展示，不自动设置角色或隐藏语义；纯装饰实例由调用方设置 `aria-hidden="true"`。 |

`ShapeName` 和 `shapeNames` 从组件入口导出。

## 行为与无障碍

Shape 只负责展示，不自动设置角色或隐藏状态。装饰内容应设置 `aria-hidden="true"`；裁切内容传达信息时，应提供合适的文字替代。

## 样式

可在 Shape 根元素上设置以下项目扩展覆盖项。`--yam3x-shape-size` 默认为 `48px`；命名形状使用 System `primary` 作为填充色，形变使用 System `spring-slow-spatial`。Material 圆角 token 用于组件圆角，与装饰形状库无直接映射关系。

| 属性                            | 默认值                                               | 说明                   |
| ------------------------------- | ---------------------------------------------------- | ---------------------- |
| `--yam3x-shape-size`            | `48px`                                               | 正方形形状的尺寸。     |
| `--yam3x-shape-container-color` | System `primary`                                     | 裁切内容背后的填充色。 |
| `--yam3x-shape-transition`      | `clip-path var(--md-sys-motion-spring-slow-spatial)` | 形状变化时使用的过渡。 |

## Material 参考

[形状原则](https://m3.material.io/styles/shape/overview-principles) · [Shape morph](https://m3.material.io/styles/shape/shape-morph)
