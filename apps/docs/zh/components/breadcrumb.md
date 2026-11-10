<script setup lang="ts">
import BreadcrumbExample from '../../components/demos/BreadcrumbExample.vue'
import BreadcrumbOverflowExample from '../../components/demos/BreadcrumbOverflowExample.vue'
</script>

# 面包屑导航

面包屑导航以可导航路径显示当前页面及其父级位置。链接保留浏览器原生行为，路由仍由应用负责。

面包屑导航是项目扩展。Material 3 没有定义专门的面包屑组件或视觉规范；最接近的 Compose Material 3 组合是由文本按钮和图标按钮组成的 `Row`。Web 语义遵循 [WAI-ARIA 面包屑模式](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)。颜色、排版、形状、焦点和间距是共享 Material 角色的项目映射。

## 示例

### 路径与项目状态

<div class="vp-raw yam3x-doc-demo-theme"><BreadcrumbExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BreadcrumbExample.vue{vue}

:::

第一条路径把每个祖先保留为链接，并标记最后一项为当前页面。第二条路径展示纯图标首页链接、禁用目标、非链接当前页和文本分隔符。复选框在水平滚动与换行之间切换。

### 溢出与 RTL

<div class="vp-raw yam3x-doc-demo-theme"><BreadcrumbOverflowExample /></div>

::: details 查看演示源码

<<< ../../components/demos/BreadcrumbOverflowExample.vue{vue}

:::

长路径会限制在框架内：不换行时路径水平滚动；换行时扩展为多行。面包屑没有折叠菜单，因此请保持层级有意义，或在应用层缩短标签。方向控件会镜像分隔符和滚动方向。

## 在应用中使用

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { Breadcrumb, type BreadcrumbItemData } from './components/yam3x/breadcrumb'

const items: BreadcrumbItemData[] = [
  { label: '首页', href: '/' },
  { label: '产品', href: '/products' },
  { label: '详情' },
]
</script>

<template>
  <Breadcrumb
    :items="items"
    aria-label="页面路径"
  />
</template>
```

默认把最后一项作为当前页面。当前页面不在末尾时设置 `currentIndex`；不需要标记当前项时设为 `-1`。即使 slot 替换了可见内容，也请保留 `label` 作为可访问名称。

::: details 图标、分隔符与纯图标项目

```vue
<template>
  <Breadcrumb
    :items="[
      { label: '首页', href: '/', iconOnly: true },
      { label: '资料库', href: '/library' },
      { label: '报告' },
    ]"
    aria-label="资料库路径"
  >
    <template #icon="{ index }">
      <Icon
        v-if="index === 0"
        name="home"
      />
    </template>
    <template #separator>/</template>
  </Breadcrumb>
</template>
```

`iconOnly` 隐藏可见标签，同时保留 `label` 作为可访问名称。通过 slot 插入的分隔符仍然是装饰性的，不会被播报。

:::

## 行为与无障碍

### 导航语义

- 组件渲染带名称的 `nav` 和有序列表。每个项目是列表项，分隔符是装饰性的。
- 有 `href` 且未 `disabled` 的项目是原生链接。将 `ariaLabelledby` 指向可见标题可复用其名称；它的优先级高于 `ariaLabel`。
- 当前项目带有 `aria-current="page"`。当前链接保留 `href` 和指针光标；没有 `href` 的当前项渲染为文本。
- 禁用项目不渲染链接，并暴露 `aria-disabled="true"`。它不可聚焦。
- `target`、`rel` 和 `download` 仅在提供 `href` 时转发。除非应用接管，导航保持原生行为。

### 键盘与焦点

- 链接保留浏览器的 Tab、Enter、上下文菜单、复制链接和修饰键行为。
- 悬停、焦点和按下共用一个状态层。焦点使用 3 px Secondary 外圈与 2 px 外部偏移。
- 纯图标项目保留完整尺寸的焦点目标和可访问名称。

### 窄布局

- 未启用 `wrap` 时，路径列表在组件内部水平滚动，页面本身不应被撑宽。
- 启用 `wrap` 后，项目移动到新行，列表停止滚动。标签可能被省略，因此请保持无障碍名称完整。
- 组件没有自动折叠或“更多”菜单。如果路径必须适配固定宽度，请在应用中保留重要祖先并缩短可见标签。

### RTL 与当前页

- 分隔符图标在从右到左布局中旋转，前/后滚动方向遵循书写方向。
- 当前项无论是否为链接都使用 On Surface；链接祖先使用 Primary，非链接祖先使用 On Surface Variant。
- 禁用项使用按文档透明度混合的 On Surface，并移除指针光标。

## API

### 导出

| 导出                 | 说明                             |
| -------------------- | -------------------------------- |
| `Breadcrumb`         | 带名称、使用原生链接的导航路径。 |
| `BreadcrumbItemData` | 标签、目标与状态的项目结构。     |

### 属性与模型

内置导航文案继承 [LocaleProvider](/zh/components/localization) 的 `actions.breadcrumb` 标签。`ariaLabel` 覆盖它，`ariaLabelledby` 的优先级高于两者。

| 属性             | 默认值                   | 说明                                               |
| ---------------- | ------------------------ | -------------------------------------------------- |
| `items`          | `[]`                     | 按层级顺序排列的项目。                             |
| `currentIndex`   | 最后一项                 | 从零开始的当前项索引。超出范围时不标记任何当前项。 |
| `ariaLabel`      | 本地化 `Breadcrumb`      | 导航地标的可访问名称。                             |
| `ariaLabelledby` | 未定义                   | 可见标签或标题的 ID；优先于 `ariaLabel`。          |
| `wrap`           | `false`                  | 让项目换行，而不是水平滚动路径。                   |
| `locale`         | Provider，再回退 `en-US` | 默认导航标签的语言。                               |

`BreadcrumbItemData`：

| 字段       | 类型                | 用途                                              |
| ---------- | ------------------- | ------------------------------------------------- |
| `label`    | `string`            | 可见文本与可访问名称；必填。                      |
| `href`     | `string`            | 目标地址。仅在存在且未禁用时渲染为链接。          |
| `target`   | `string`            | 原生链接目标，随 `href` 转发。                    |
| `rel`      | `string`            | 原生链接关系，随 `href` 转发。                    |
| `download` | `string \| boolean` | 原生下载属性，随 `href` 转发。                    |
| `disabled` | `boolean`           | 渲染为禁用的静态文本并移除链接行为。              |
| `iconOnly` | `boolean`           | 视觉上隐藏标签，同时保留 `label` 作为可访问名称。 |

### 事件

面包屑导航不触发事件。请使用原生链接导航，或在组件外层处理路由导航。

### 插槽

| 插槽        | 作用域                     | 用途                     |
| ----------- | -------------------------- | ------------------------ |
| `item`      | `{ item, index, current }` | 替换可见标签内容。       |
| `icon`      | `{ item, index, current }` | 添加装饰性前置图标。     |
| `separator` | `{ index }`                | 替换默认的尖括号分隔符。 |

### 方法

面包屑导航不暴露实例方法。

## 样式

面包屑导航在根元素上暴露项目定义的自定义属性。标签排版映射到 System Label Large 角色，颜色、密度和状态层透明度默认使用共享 System token。

::: details 自定义属性

| 区域             | 支持属性                                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 项目布局         | `--yam3x-breadcrumb-item-container-height`、`--yam3x-breadcrumb-item-shape`、`--yam3x-breadcrumb-item-label-padding-inline`、`--yam3x-breadcrumb-item-icon-padding-inline`、`--yam3x-breadcrumb-item-icon-label-space` |
| 标签排版         | `--yam3x-breadcrumb-item-label-font-size`、`--yam3x-breadcrumb-item-label-font-weight`、`--yam3x-breadcrumb-item-label-line-height`、`--yam3x-breadcrumb-item-label-tracking`                                          |
| 图标与分隔符尺寸 | `--yam3x-breadcrumb-item-icon-size`、`--yam3x-breadcrumb-separator-icon-size`                                                                                                                                          |
| 颜色与禁用状态   | `--yam3x-breadcrumb-item-label-color`、`--yam3x-breadcrumb-item-icon-color`、`--yam3x-breadcrumb-item-last-color`、`--yam3x-breadcrumb-item-disabled-color`、`--yam3x-breadcrumb-item-disabled-opacity`                |
| 状态层颜色       | `--yam3x-breadcrumb-item-label-state-layer-color`、`--yam3x-breadcrumb-item-icon-state-layer-color`                                                                                                                    |

:::

视觉胶囊默认高 40 px，交互目标至少 48 px。`--yam3x-breadcrumb-item-container-height` 改变胶囊高度；交互目标通过 `--md-sys-touch-target-size` 保持最小值。

## Material 参考

[WAI-ARIA 面包屑模式](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) · [应用字体](https://m3.material.io/styles/typography/applying-type) · [颜色系统](https://m3.material.io/styles/color/the-color-system)
