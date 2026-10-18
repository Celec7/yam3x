<script setup lang="ts">
import AppBarExample from '../../components/demos/AppBarExample.vue'
</script>

# App bars

App bar 用于标识当前页面并承载关键操作。应根据页面层级和用户在此处需要执行的操作选择布局。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><AppBarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/AppBarExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { AppBar } from './components/yam3x/app-bar'
</script>

<template>
  <AppBar
    variant="medium-flexible"
    scroll-behavior="exit-until-collapsed"
  >
    <template #leading
      ><button
        type="button"
        aria-label="返回"
      >
        ←
      </button></template
    >
    <template #title>页面标题</template>
    <template #subtitle>补充说明</template>
    <template #trailing
      ><button
        type="button"
        aria-label="保存"
      >
        保存
      </button></template
    >
  </AppBar>
</template>
```

## API

该组件 的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

| 属性              | 默认值（自动）                                   | 说明                                                                                                                                  |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`         | `small`                                          | `search`、`small`、`medium-flexible` 或 `large-flexible`。                                                                            |
| `alignment`       | `leading`                                        | Flexible 与 Small 标题靠起始边或居中。                                                                                                |
| `scroll-behavior` | Flexible：`exit-until-collapsed`；其他：`pinned` | `pinned` 固定显示；`enter-always` 下滚时隐藏、上滚时显现；`exit-until-collapsed` 将 Flexible 收起为 Small，并保持到滚动目标回到顶部。 |
| `scroll-target`   | `window`                                         | 可传元素 ID（可带 `#`）或元素。元素目标应包含 App bar；滚动会改变填色。                                                               |
| `search-label`    | `Search`                                         | Search 文字及按钮的无障碍名称；需包含 “Search”。                                                                                      |

插槽：`leading` 放导航按钮或品牌标记；`title` 与 `subtitle` 放页面文字；`logo` 放品牌图；`trailing` 放页面操作；Search 另有 `search-leading` 与 `search-trailing`。Search 激活时发出 `search` 事件，页面负责打开 Search View。`search-leading` 是按钮内的装饰槽；交互按钮应放在 `search-trailing` 或 `trailing` 中。

内置 Search 图标使用 Material Symbols 的 outlined `search` 字形。请按 [Icon 文档](./icon.md)加载字体，也可以通过 `search-leading` 提供自定义图标。

Search 插槽会根据 App bar 其他内容所占空间调整宽度。Search 按钮发出事件；页面负责呈现 Search View。

尾部操作及其溢出行为由调用方提供。页面需要操作菜单时，可在 `trailing` 插槽中组合 `Menu` 或 `Toolbar`。

## 行为与无障碍

每个操作都应有说明用途的无障碍名称。App bar 保留 DOM 顺序的 Tab 导航。

## 样式

App bar 会在内部映射主题角色和组件尺寸。以下 CSS 属性是项目扩展点，默认值仍遵循 Material 映射。Flexible 标题应保持规范指定的文字样式。

| CSS 属性                                       | 默认值                      | 用途                                            |
| ---------------------------------------------- | --------------------------- | ----------------------------------------------- |
| `--yam3x-app-bar-title-text-color`             | `--md-sys-color-on-surface` | 覆盖标题及 App bar 前景色。                     |
| `--yam3x-app-bar-small-container-height`       | `64px`                      | 覆盖 Small 高度，也影响收起后的 Flexible 高度。 |
| `--yam3x-app-bar-small-heading-padding-left`   | `calc(4px * density scale)` | 覆盖 Small 标题的起始内边距。                   |
| `--yam3x-app-bar-small-title-text-font-size`   | `22px`                      | 覆盖 Small 标题字号。                           |
| `--yam3x-app-bar-small-subtitle-text-tracking` | `0.5px`                     | 覆盖 Small 副标题字距。                         |

## Material 参考

[App bars 概览](https://m3.material.io/components/app-bars/overview) · [指南](https://m3.material.io/components/app-bars/guidelines) · [规格](https://m3.material.io/components/app-bars/specs) · [无障碍](https://m3.material.io/components/app-bars/accessibility)
