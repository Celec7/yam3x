<script setup lang="ts">
import IconExample from '../../components/demos/IconExample.vue'
</script>

# Icon

Icon 是呈现 Material Symbols 或项目注册 SVG 的项目组件。图标应辅助附近内容或可访问控件，不能代替控件名称。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <IconExample />
</div>

注册的 SVG 支持 outlined/filled 两条路径，并会在图标已挂载后注册时更新。收藏操作由外层原生按钮承载，图标保持装饰语义。

::: details 查看演示源码

<<< ../../components/demos/IconExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import Icon from './components/yam3x/icon/icon.vue'
</script>

<template>
  <button
    type="button"
    aria-label="打开设置"
  >
    <Icon name="settings" />
  </button>
</template>
```

## API

| 属性          | 类型                                            | 默认值     | 说明                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                        | `''`       | Material Symbols 名称，或 SVG 注册键。                                                                                                                                                                     |
| `variant`     | `outlined \| rounded \| sharp`                  | `outlined` | 字体样式或注册表键。                                                                                                                                                                                       |
| `filled`      | `boolean`                                       | `false`    | 设置填充轴；注册 SVG 时切换两条路径。                                                                                                                                                                      |
| `grade`       | `auto \| low \| medium \| high`                 | `auto`     | `auto` 在浅色模式下使用 GRAD `0`，深色模式下使用 `-25`；显式值分别对应 `-25`、`0`、`200`。最近的 `data-theme` 或 `.dark` 主题目标控制自动模式，否则跟随系统配色方案。可用 `--yam3x-icon-auto-grade` 覆盖。 |
| `weight`      | `100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700` | `400`      | 设置 `wght` 轴。对于标准 24px 图标，Material 建议使用 regular 400，最小字重为 200。                                                                                                                        |
| `opticalSize` | `number`                                        | `24`       | 设置 `opsz` 轴；对于常规 Material Symbols 用法，应根据实际图标尺寸从 20–48 范围内选择。                                                                                                                    |

`registerIcon(name, variant, { outlined, filled })` 为每条提供的路径接受 `{ viewBox, path }`。可在实例创建前或之后注册。路径和 viewBox 会在存入前验证；同名同 variant 的新条目会替换旧条目。

## 行为与无障碍

默认图标是装饰内容，会带 `role="img" aria-hidden="true"`。传入 `aria-label` 或 `aria-labelledby` 后会向辅助技术暴露图像名称。图标不接收键盘或指针操作；交互目标由父控件负责。

组件接受自定义轴值，不会在运行时截断或限制数值。Material 对标准 24px 图标的最小字重要求为 200。常见图标尺寸为 20、24、40 和 48px；`opsz` 轴支持 20–48。

## 样式

在图标或祖先元素上设置 `--yam3x-icon-size`，可调整字体大小与图标方框尺寸；默认值为 `24px`。`--yam3x-icon-auto-grade` 可覆盖自动 grade。

### 加载 Material Symbols 字体

字体由应用提供。可以使用 Google Fonts，也可以自托管；按需加载图标名称和所用轴，减小字体资源：

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=home,settings&display=block"
  rel="stylesheet"
/>
```

## Material 参考

[图标概览](https://m3.material.io/styles/icons/overview)
