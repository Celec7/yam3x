<script setup lang="ts">
import IconAxesExample from '../../components/demos/IconAxesExample.vue'
import IconBasicExample from '../../components/demos/IconBasicExample.vue'
import IconExample from '../../components/demos/IconExample.vue'
</script>

# Icon

图标是用于快速识别操作和类别的细小符号。`Icon` 是呈现 Material Symbols 连字和项目注册 SVG 的项目组件。

图标应辅助附近内容或位于可访问控件内，不能代替控件名称。应用无法加载图标字体时，请注册 SVG。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme">
  <IconBasicExample />
</div>

`name` 选择 Material Symbols 连字。未传入 `aria-label` 或 `aria-labelledby` 的图标保持装饰语义，名称由父元素承载。尺寸由 `--yam3x-icon-size` 控制，默认为 `24px`。

::: details 查看示例源码

<<< ../../components/demos/IconBasicExample.vue{vue}

:::

### 样式与填充轴

Material Symbols 是新的默认图标集，提供 outlined、rounded 和 sharp 三种样式。Material Symbols 具有四个可调的风格可变字体属性，称为轴。`variant` 选择样式族；`filled`、`grade`、`weight` 和 `opticalSize` 分别设置填充、等级、字重和光学尺寸轴。

<div class="vp-raw yam3x-doc-demo-theme">
  <IconAxesExample />
</div>

::: details 查看示例源码

<<< ../../components/demos/IconAxesExample.vue{vue}

:::

### 注册 SVG

<div class="vp-raw yam3x-doc-demo-theme">
  <IconExample />
</div>

注册的 SVG 支持 outlined/filled 两条路径，并会在图标已挂载后注册时更新。收藏操作由外层原生按钮承载，图标保持装饰语义。

::: details 查看示例源码

<<< ../../components/demos/IconExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；示例源码中的 `@registry` 是站点专用路径。

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

### 加载 Material Symbols 字体

`Icon` 不加载图标字体，由应用提供：可以使用 Google Fonts，也可以自托管。所用 variant 对应的字体族名称保持为 `Material Symbols Outlined`、`Material Symbols Rounded` 和 `Material Symbols Sharp`。按需加载图标名称和所用轴，减小字体资源：

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=home,settings&display=block"
  rel="stylesheet"
/>
```

缺少该字体时，未注册的 `name` 会呈现连字文本而不是图形。

::: details 高级：注册 SVG 图标

注册会用给定名称和 variant 替换字体连字。outlined 与 filled 两条路径都必需，且每条都需要由四个数字组成的 `viewBox` 和标准 SVG 路径命令。

```vue
<script setup lang="ts">
import Icon from './components/yam3x/icon/icon.vue'
import { registerIcon } from './components/yam3x/icon/icon-registry'

registerIcon('home', 'rounded', {
  outlined: {
    viewBox: '0 0 24 24',
    path: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  },
  filled: {
    viewBox: '0 0 24 24',
    path: 'm2 10 10-8 10 8v10a2 2 0 0 1-2 2h-5v-7H9v7H4a2 2 0 0 1-2-2Z',
  },
})
</script>

<template>
  <Icon
    name="home"
    variant="rounded"
    aria-label="首页"
  />
</template>
```

:::

## 行为与无障碍

- 图标默认是装饰内容，呈现 `role="img" aria-hidden="true"`。
- 传入 `aria-label` 或 `aria-labelledby` 会暴露图像名称，并去掉 `aria-hidden`。
- 图标不接收键盘或指针操作，也没有 `tabindex`；交互目标由父控件负责。默认情况下，24dp 图标的交互目标应为 48dp。
- 图标在没有标签时需谨慎使用。图标含义应始终明确，并对所有用户可访问。
- `weight` 接受 100 至 700；不支持的运行时值回退到 400。不要为标准尺寸（24dp）图标使用最细字重。该尺寸的最小字重应为 200。
- `grade` 的 `auto` 跟随最近的 `data-theme` 或 `.dark` 主题目标，否则跟随系统配色方案。为使图标的视觉尺寸一致，浅色背景上的深色图标默认 grade 为 0，深色背景上的浅色图标为 -25。
- `opticalSize` 的有限值会裁剪到 20–48 范围；非有限值回退到 24。光学尺寸范围为 20dp 至 48dp。
- 注册图标会通知已挂载实例，因此延迟注册和替换都能在不重新挂载的情况下更新已渲染路径。

## API

### 导出

| 导出             | 类型 | 用途                                            |
| ---------------- | ---- | ----------------------------------------------- |
| `Icon`           | 组件 | 渲染 Material Symbols 字形或已注册的 SVG。      |
| `registerIcon`   | 函数 | 按名称、变体与填充集注册自托管 SVG。            |
| `SvgIconInfo`    | 类型 | 一个填充集条目：`{ viewBox, path }`。           |
| `SvgIconFillSet` | 类型 | 一个注册图标的描边与填充路径。                  |
| `IconVariant`    | 类型 | `outlined`、`rounded` 或 `sharp`。              |
| `IconWeight`     | 类型 | Material Symbols 字重轴，从 100 到 700。        |
| `IconGrade`      | 类型 | 字重等级轴：`auto`、`low`、`medium` 或 `high`。 |

### 属性

| 属性             | 类型                                            | 默认值     | 说明                                                                                                                                                                     |
| ---------------- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`           | `string`                                        | `''`       | Material Symbols 名称，或 SVG 注册键。                                                                                                                                   |
| `variant`        | `outlined \| rounded \| sharp`                  | `outlined` | 字体样式族（不支持的运行时值回退为 `outlined`），或注册 SVG 的注册表键。                                                                                                 |
| `filled`         | `boolean`                                       | `false`    | 设置填充轴；注册 SVG 时在 outlined 与 filled 两条路径间切换。                                                                                                            |
| `grade`          | `auto \| low \| medium \| high`                 | `auto`     | `auto` 在浅色模式下使用 GRAD `0`，深色模式下使用 `-25`；显式值分别对应 `-25`、`0` 和 `200`。不支持的运行时值回退为 `auto`。可用 `--yam3x-icon-auto-grade` 覆盖自动模式。 |
| `weight`         | `100 \| 200 \| 300 \| 400 \| 500 \| 600 \| 700` | `400`      | 设置 `wght` 轴。不支持的运行时值回退到 `400`。                                                                                                                           |
| `opticalSize`    | `number`                                        | `24`       | 设置 `opsz` 轴。有限值会裁剪到 Material Symbols 的 20–48 范围；非有限值回退到 24。                                                                                       |
| `ariaLabel`      | `string`                                        | 未定义     | 可访问的图像名称，也可直接使用原生 `aria-label` 属性。                                                                                                                   |
| `ariaLabelledby` | `string`                                        | 未定义     | 可访问图像名称的 ID 引用。                                                                                                                                               |
| `ariaHidden`     | `'true' \| 'false'`                             | 自动       | 覆盖 `aria-hidden`。默认在没有可访问名称时隐藏图标。                                                                                                                     |

### 图标注册表

`registerIcon(name, variant, fillSet)` 在给定名称和 variant 下加入自托管 SVG。

| 参数      | 类型                                   | 用途                                                     |
| --------- | -------------------------------------- | -------------------------------------------------------- |
| `name`    | `string`                               | `name` 属性使用的查找键。                                |
| `variant` | `outlined \| rounded \| sharp`         | `variant` 属性使用的注册表键；其他值会抛出错误。         |
| `fillSet` | `{ outlined, filled }: SvgIconFillSet` | 每项为 `{ viewBox: string, path: string }`，两者都必需。 |

`viewBox` 和 `path` 会在存入前校验；数据无效时抛出错误并保留原有条目。可在实例创建前或之后注册：同名同 variant 的新条目会替换旧条目，并更新已挂载的实例。

## 样式

在图标或祖先元素上设置 `--yam3x-icon-size`，可调整字体大小与图标方框尺寸；默认值为 `24px`。`--yam3x-icon-auto-grade` 可覆盖自动 grade。注册 SVG 与字体图形共用同一尺寸变量，颜色跟随 `currentColor`。

## Material 参考

[Icons overview](https://m3.material.io/styles/icons/overview) · [Applying icons](https://m3.material.io/styles/icons/applying-icons) · [Designing icons](https://m3.material.io/styles/icons/designing-icons)
