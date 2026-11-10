<script setup lang="ts">
import AppBarBasicExample from '../../components/demos/AppBarBasicExample.vue'
import AppBarExample from '../../components/demos/AppBarExample.vue'
</script>

# App bars

App bar 用于标识当前页面并承载关键操作。`AppBar` 是 Material 3 Expressive 应用栏，提供四种布局：Search、Small，以及可收起为 Small 布局的 Medium 和 Large flexible。

页面标题只有一行且操作较少时使用 Small。标题本身就是主要层级线索、页面又能容纳更高页头时使用 Medium 或 Large flexible。搜索是页面首要任务时使用 Search。该组件设置 `role="banner"`；Small 与 flexible 布局会将标题渲染为一级标题。

## 示例

### 基础

Small 应用栏保持单行标题，并将页面操作放在逻辑末尾。此静态示例包含前置返回操作、页面标题和两个后置图标操作。

<div class="vp-raw yam3x-doc-demo-theme"><AppBarBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/AppBarBasicExample.vue{vue}

:::

### Search、Small 与 flexible 应用栏

演示默认显示 Search 应用栏。可切换类型、标题对齐、滚动行为和可用宽度，并开关副标题与从右到左方向，观察应用栏的响应。滚动带边框的内容区域，可体验固定显示、随滚动隐藏与显现，以及收起行为。搜索和操作按钮的状态会显示在预览下方。

<div class="vp-raw yam3x-doc-demo-theme"><AppBarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/AppBarExample.vue{vue}

:::

### Search 组合

Search 渲染的是按钮，不是文本框。激活后发出 `search` 事件，由页面打开 Search View。按钮保持 56 px 最小高度，并按前置与后置插槽之间的空间调整自身：紧凑布局中占满剩余宽度，中等布局中保持 312 px，宽布局中最多扩展到可用宽度的一半。

交互控件应放在 `search-trailing` 或 `trailing`。`search-leading` 位于按钮内部，属于装饰内容；在其中放置可聚焦控件会形成嵌套交互内容。

## 在应用中导入

完成[安装](/zh/guide/installation)后，从应用中导入复制后的组件。请使用 `./components/yam3x/` 之类的调用方路径；演示源码中的 `@registry` 路径仅用于文档站点。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AppBar } from './components/yam3x/app-bar'
import IconButton from './components/yam3x/icon-button/icon-button.vue'

const searchOpen = ref(false)
</script>

<template>
  <AppBar
    variant="medium-flexible"
    alignment="leading"
    @search="searchOpen = true"
  >
    <template #leading>
      <IconButton
        variant="standard"
        aria-label="返回"
      >
        ←
      </IconButton>
    </template>
    <template #title>收件箱</template>
    <template #subtitle>最近的邮件</template>
    <template #trailing>
      <IconButton
        variant="standard"
        aria-label="账户"
      >
        ●
      </IconButton>
    </template>
  </AppBar>

  <main>页面内容</main>
</template>
```

应用栏不保存搜索状态；搜索视图和尾部菜单由页面负责。省略 `scroll-target` 时跟随窗口；传入元素或元素 ID 时，其滚动区域应包含应用栏。

::: details 带尾部操作的 Search 应用栏

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { AppBar } from './components/yam3x/app-bar'
import { Menu, type MenuItem } from './components/yam3x/menu'

const searchOpen = ref(false)
const items: MenuItem[] = [
  { value: 'settings', label: '搜索设置' },
  { value: 'help', label: '搜索帮助' },
]
</script>

<template>
  <AppBar
    variant="search"
    search-label="搜索邮件"
    @search="searchOpen = true"
  >
    <template #trailing>
      <Menu
        :items="items"
        label="搜索选项"
      />
    </template>
  </AppBar>
</template>
```

:::

## 行为与无障碍

### 滚动行为

- 任意变体在滚动目标离开顶部后都会将应用栏容器切换为 `surface-container`；Search 还会将内部搜索容器切换为 `surface-container-highest`。
- `pinned` 保持应用栏位置；`enter-always` 向末尾滚动时隐藏，向回滚动时重新显现。
- `exit-until-collapsed` 在滚动开始后将 Medium 或 Large flexible 收起为 64 px 的 Small 高度，并在目标回到顶部时恢复。
- Search 与 Small 默认 `pinned`；flexible 默认 `exit-until-collapsed`。
- 应用栏位于全宽页面外壳的顶部，不提供底部放置；底部操作请使用 docked [Toolbar](/zh/components/toolbar)。
- 副标题只在插槽有内容时保留空间。移除副标题会缩短 flexible 应用栏，而不会留下空行。

### Search

- 内置 Search 图标是 Material Symbols 的描边 `search` 字形。按 [Icon 文档](/zh/components/icon)加载字体，或通过 `search-leading` 替换。
- 触发器暴露 `aria-haspopup="dialog"`，无障碍名称来自 `search-label` 或本地化的 `actions.search` 消息。
- 应用栏不会打开搜索视图、保存查询或恢复搜索焦点，这些状态由应用负责。

### 键盘与 RTL

- Tab 顺序保持文档顺序：前置控件、Search 触发器及其尾部控件，最后是页面操作。
- 每个仅图标操作都需要自己的无障碍名称；应用栏不会为插槽控件补充标签。
- 前置与后置插槽跟随书写方向。RTL 中前置插槽位于右侧、后置插槽位于左侧；Search 触发器保持起始到末尾的排布。
- Flexible 标题最多换行两行；Small 标题保持单行。

### 状态归属

搜索视图、尾部操作菜单和导航都由页面负责。应用栏只观察滚动，并根据解析后的滚动目标派生 `scrolled` 与 `collapsed`。目标暂时不存在时，应用栏保持初始状态，直到目标元素出现并触发组件更新。

## API

内置文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。显式 `locale` 和 `search-label` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                                                             | 类型 | 用途                                 |
| -------------------------------------------------------------------------------- | ---- | ------------------------------------ |
| `AppBar`                                                                         | 组件 | 页头及滚动行为。                     |
| `AppBarVariant`、`AppBarAlignment`、`AppBarScrollBehavior`、`AppBarScrollTarget` | 类型 | 四种布局、对齐与滚动目标的属性取值。 |

### 属性

| 属性             | 类型                                                           | 默认值                                                       | 用途                                                                    |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `variant`        | `'search' \| 'small' \| 'medium-flexible' \| 'large-flexible'` | `'small'`                                                    | 布局与标题层级。                                                        |
| `alignment`      | `'leading' \| 'centered'`                                      | `'leading'`                                                  | Small 与 flexible 标题靠起始边或居中。                                  |
| `scrollBehavior` | `'pinned' \| 'enter-always' \| 'exit-until-collapsed'`         | Flexible：`'exit-until-collapsed'`；Search/Small：`'pinned'` | 保持可见、按滚动方向隐藏和显现，或将 flexible 收起。                    |
| `scrollTarget`   | `string \| HTMLElement \| null`                                | `null`                                                       | 元素 ID（可带或不带 `#`）、元素；省略时跟随窗口。元素目标应包含应用栏。 |
| `searchLabel`    | `string`                                                       | 本地化 `Search`                                              | Search 触发器的无障碍名称。                                             |
| `locale`         | `string`                                                       | Provider，再回退 `en-US`                                     | 内置界面文案的语言。                                                    |

### 事件

| 事件     | 参数 | 用途                                        |
| -------- | ---- | ------------------------------------------- |
| `search` | —    | Search 触发器被激活；页面据此打开搜索视图。 |

### 插槽

| 插槽              | 作用域 | 用途                                                       |
| ----------------- | ------ | ---------------------------------------------------------- |
| `leading`         | —      | 逻辑起始边的导航控件或品牌标记。                           |
| `title`           | —      | 页面标题，渲染为一级标题。                                 |
| `subtitle`        | —      | 标题下的补充行；其内容会影响 flexible 高度。               |
| `logo`            | —      | 品牌图。Small 布局中替代标题位置，其他布局中位于标题之前。 |
| `trailing`        | —      | 逻辑末尾边的页面操作。                                     |
| `search-leading`  | —      | Search 触发器内部的装饰内容，可替代搜索图标。              |
| `search-trailing` | —      | Search 触发器旁、搜索行内的交互内容。                      |

### 方法

`AppBar` 不提供方法。通过模板 ref 可读取只读布尔值 `scrolled` 与 `collapsed`，它们表示当前由滚动派生的状态。

## 样式

应用栏在内部映射 Material 的颜色、文字和形状角色。项目公开少量 CSS 自定义属性，用于标题颜色、Small 高度和 Small 文字调整。请在组件根元素或祖先元素上设置。

::: details CSS 覆盖项

| 属性                                           | 默认值                      | 用途                                       |
| ---------------------------------------------- | --------------------------- | ------------------------------------------ |
| `--yam3x-app-bar-title-text-color`             | `--md-sys-color-on-surface` | 标题及应用栏前景色。                       |
| `--yam3x-app-bar-small-container-height`       | `64px`                      | Small 高度，也用于收起后的 flexible 高度。 |
| `--yam3x-app-bar-small-heading-padding-left`   | `calc(4px * density scale)` | Small 标题块的起始内边距。                 |
| `--yam3x-app-bar-small-title-text-font-size`   | `22px`                      | Small 标题字号。                           |
| `--yam3x-app-bar-small-subtitle-text-tracking` | `0.5px`                     | Small 副标题字距。                         |

:::

Flexible 标题应保持规范指定的文字样式。宽布局依据应用栏自身宽度而非视口宽度，决定 Search 插槽可占用的空间。

## Material 参考

[App bars 概览](https://m3.material.io/components/app-bars/overview) · [指南](https://m3.material.io/components/app-bars/guidelines) · [规格](https://m3.material.io/components/app-bars/specs) · [无障碍](https://m3.material.io/components/app-bars/accessibility)
