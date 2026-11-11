<script setup lang="ts">
import NavigationRailBasicExample from '../../components/demos/NavigationRailBasicExample.vue'
import NavigationRailExample from '../../components/demos/NavigationRailExample.vue'
</script>

# Navigation rail

Navigation rail 沿窗口边缘呈现顶层目的地。`NavigationRail` 是 Material 3 Expressive 导航栏轨，可保持当前目的地可见，并支持 96 px 收起布局、展开布局和紧凑宽度下的模态展开。

应用能在窗口一侧保留纵向导航区域时，适合在中等及展开宽度使用 rail。Material 建议提供 3–7 个目的地，以及最多一个可选浮动操作按钮；这些是设计建议，不是运行时限制。紧凑宽度请改用 [navigation bar](/zh/components/navigation-bar)。使用 `auto` 模式时，rail 从 expanded 断点开始出现，中等宽度交给 navigation bar。

## 示例

### 基础

基础 rail 默认收起，标记当前目的地，在“动态”上显示徽章，禁用“归档”，并在 `fab` 插槽中放置一个小型操作按钮。`show-menu` 已关闭，因此 rail 保持收起布局。当前目的地即模型值；选择其他目的地会更新模型。

<div class="vp-raw yam3x-doc-demo-theme"><NavigationRailBasicExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NavigationRailBasicExample.vue{vue}

:::

### 展开、模态呈现与自适应布局

交互演示提供形态、呈现方式、目的地位置，以及带外部菜单触发器、收起时隐藏的布局。展开 rail 可显示次要目的地和扩展 FAB；切换到 `modal` 可检查焦点约束与遮罩关闭。事件日志按顺序报告选择事件。

<div class="vp-raw yam3x-doc-demo-theme"><NavigationRailExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NavigationRailExample.vue{vue}

:::

## 在应用中导入

完成[安装](/zh/guide/start/installation)后，从应用中导入复制后的组件。请使用 `./components/yam3x/` 之类的调用方路径；演示源码中的 `@registry` 路径仅用于文档站点。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail, type NavigationRailItem } from './components/yam3x/navigation-rail'
import { Icon } from './components/yam3x/icon'

const current = ref('home')
const items: NavigationRailItem[] = [
  { value: 'home', label: '首页', href: '/zh/' },
  {
    value: 'search',
    label: '搜索',
    href: '/zh/components/search',
    badge: 3,
    badgeLabel: '3 条新结果',
  },
  { value: 'saved', label: '收藏', href: '/zh/components/list' },
  { value: 'settings', label: '设置', href: '/zh/components/navigation-rail', secondary: true },
]
</script>

<template>
  <NavigationRail
    v-model="current"
    label="主导航"
    :items="items"
    divider
  >
    <template #icon="{ item }"><Icon :name="item.value" /></template>
    <template #selected-icon="{ item }"
      ><Icon
        :name="item.value"
        filled
    /></template>
  </NavigationRail>
</template>
```

`:items` 负责标签、链接、徽章和禁用状态；`v-model` 负责当前目的地。rail 渲染锚点，因此普通链接跳转、修饰键点击、`target`、`rel` 和 `download` 都保留原生行为。

::: details 展开、FAB 与外部触发器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail, type NavigationRailItem } from './components/yam3x/navigation-rail'
import { Button } from './components/yam3x/button'

const current = ref('home')
const expanded = ref<boolean | undefined>(undefined)
const items: NavigationRailItem[] = [
  { value: 'home', label: '首页', href: '/' },
  { value: 'settings', label: '设置', href: '/settings', secondary: true },
]
</script>

<template>
  <Button
    type="button"
    :aria-expanded="!!expanded"
    aria-controls="main-rail"
    @click="expanded = !expanded"
  >
    {{ expanded ? '关闭导航' : '打开导航' }}
  </Button>
  <NavigationRail
    id="main-rail"
    v-model="current"
    v-model:expanded="expanded"
    label="主导航"
    :items="items"
    presentation="modal"
    hide-when-collapsed
  >
    <template #fab="{ expanded: isExpanded }">
      <Button
        :aria-label="isExpanded ? '创建新内容' : '创建'"
        @click="create()"
      >
        创建
      </Button>
    </template>
  </NavigationRail>
</template>
```

:::

设置 `hide-when-collapsed` 后，rail 在外部触发器设置 `expanded` 前保持隐藏。触发器必须是带 `aria-expanded` 和 `aria-controls` 的无障碍控件；关闭模态 rail 后焦点返回该触发器。

## 行为与无障碍

### 选择与事件

- `mode` 决定 rail 以 `collapsed`、`expanded` 或 `auto` 形态启动。`auto` 使用 840 px 断点：低于断点收起，达到或超过断点展开。
- `v-model:expanded` 优先于 `mode`。未绑定该模型时，使用内置菜单会保存手动选择，此后断点变化不再自动展开或收起 rail。将绑定的模型设为 `undefined` 可把控制权交回 `mode`。
- 当前值缺失或已禁用时，会回退到首个可用目的地，并同步更新模型。
- `secondary` 目的地只在展开时出现，除非它正是当前目的地。
- 选择时依次发出可取消的 `beforeinput`、更新模型，然后发出 `input`、`change` 和 `navigate`。在 `beforeinput` 上调用 `preventDefault()` 可阻止更改。
- 在模态 rail 中点击目的地会关闭模态。

### 键盘与焦点

- 每个目的地都是链接和 Tab 停靠点，禁用或当前隐藏的目的地除外。上下方向键在可用目的地间移动并循环；Home 和 End 移到首尾。
- Space 激活聚焦的目的地。Enter 遵循原生链接行为。方向键导航会跳过禁用目的地。
- `disabled` 移除链接目标并设置 `aria-disabled`。`disabledInteractive` 让链接保持可聚焦，便于辅助技术读取，但仍阻止激活。
- `modal` 呈现中，面板是带标签的对话框，显示遮罩，锁定页面滚动，Tab 在面板内循环，Escape 或激活遮罩会关闭。焦点先移到菜单按钮、FAB、首个目的地，或没有可聚焦内容时的面板。

### 展开与模态呈现

- `presentation="standard"` 在布局内展开。`presentation="modal"` 在展开时增加遮罩和对话框语义。
- 展开宽度上限为 360 px。目的地超出较短的 rail 时，导航列表滚动，菜单按钮和 FAB 保持可用。
- 菜单按钮暴露 `aria-expanded` 并控制目的地区域。`menuLabel` 与 `closeLabel` 可覆盖内置名称。

### 响应式与 RTL

- `auto` 模式在低于 840 px 时隐藏 rail，而不是压缩它；该区间应提供 navigation bar，并避免同时渲染两个相同的导航地标。
- 默认尺寸下，收起 rail 为 96 px，展开 rail 为 220 px。目的地和 FAB 使用逻辑内边距，因此 RTL 会把 rail 镜像到另一侧，而不改变纵向方向键行为。
- 放大文字会增加目的地高度并让标签换行，不会裁切文字。

### 状态归属

当前目的地、外部展开状态、导航目标和紧凑宽度替代方案都由页面负责。rail 负责临时模态层、焦点约束和展开宽度。`mode` 是启动策略，不是第二份持久状态；绑定 `expanded` 时，由页面决定何时重置。

## API

内置文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。显式 `locale`、`menuLabel` 或 `closeLabel` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                       | 类型 | 用途                   |
| ------------------------------------------ | ---- | ---------------------- |
| `NavigationRail`                           | 组件 | 纵向顶层导航。         |
| `NavigationRailItem`、`NavigationRailMode` | 类型 | 目的地结构与形态取值。 |

### 属性与模型

| 属性与模型                      | 类型                                  | 默认值                       | 用途                               |
| ------------------------------- | ------------------------------------- | ---------------------------- | ---------------------------------- |
| `items`                         | `NavigationRailItem[]`                | 必填                         | 按显示顺序排列的目的地。           |
| `label`                         | `string`                              | 必填                         | 导航地标及模态对话框的无障碍名称。 |
| `modelValue` / `v-model`        | `string`                              | `''`                         | 当前目的地值。                     |
| `expanded` / `v-model:expanded` | `boolean \| undefined`                | `undefined`                  | 受控展开状态；优先于 `mode`。      |
| `mode`                          | `'collapsed' \| 'expanded' \| 'auto'` | `'collapsed'`                | 初始展开策略。                     |
| `presentation`                  | `'standard' \| 'modal'`               | `'standard'`                 | 布局内或模态展开。                 |
| `hideWhenCollapsed`             | `boolean`                             | `false`                      | 收起时隐藏 rail；需要外部触发器。  |
| `alignment`                     | `'top' \| 'center'`                   | `'top'`                      | 将目的地放在块轴起始或居中。       |
| `divider`                       | `boolean`                             | `false`                      | 在内容侧绘制分隔线。               |
| `showMenu`                      | `boolean`                             | `true`                       | 显示内置展开与收起按钮。           |
| `menuLabel`                     | `string`                              | 本地化 `Expand navigation`   | 收起状态下菜单按钮的无障碍名称。   |
| `closeLabel`                    | `string`                              | 本地化 `Collapse navigation` | 展开状态下菜单按钮的无障碍名称。   |
| `locale`                        | `string`                              | Provider，再回退 `en-US`     | 内置界面文案的语言。               |

### 条目结构

| 字段                        | 类型               | 用途                                         |
| --------------------------- | ------------------ | -------------------------------------------- |
| `value`                     | `string`           | 必填且唯一，供模型和事件使用。               |
| `label`                     | `string`           | 必填，可见且可访问的目的地文字。             |
| `href`                      | `string`           | 必填的链接目标。                             |
| `ariaLabel`                 | `string`           | 可见标签含糊时覆盖无障碍名称。               |
| `disabled`                  | `boolean`          | 阻止激活，并将链接移出 Tab 顺序。            |
| `disabledInteractive`       | `boolean`          | 让禁用目的地保持可聚焦，便于发现。           |
| `secondary`                 | `boolean`          | 只在展开时显示，除非它是当前目的地。         |
| `badge`                     | `string \| number` | 尾部徽章文字；超过四个字符会缩写。           |
| `badgeLabel`                | `string`           | 由 `aria-describedby` 引用的屏幕阅读器说明。 |
| `target`、`rel`、`download` | 原生锚点值         | 链接启用时转发给锚点。                       |

### 事件

| 事件          | 参数                 | 用途                                           |
| ------------- | -------------------- | ---------------------------------------------- |
| `beforeinput` | `(item, event)`      | 当前目的地更改前触发，可取消。                 |
| `input`       | `(item, event)`      | 模型已更改。                                   |
| `change`      | `(item, event)`      | 当前目的地更改完成。                           |
| `navigate`    | `(item, MouseEvent)` | 目的地被激活；使用客户端路由时可取消原生点击。 |

### 插槽

| 插槽            | 作用域               | 用途                                     |
| --------------- | -------------------- | ---------------------------------------- |
| `icon`          | `{ item, selected }` | 目的地图标；系列同时提供时使用描边版本。 |
| `selected-icon` | `{ item }`           | 替换当前目的地的图标，通常使用填充版本。 |
| `badge`         | `{ item, selected }` | 替换徽章内容。                           |
| `fab`           | `{ expanded }`       | 目的地上方的可选操作，例如扩展 FAB。     |
| `menu-icon`     | —                    | 替换收起状态的菜单图标。                 |
| `close-icon`    | —                    | 替换展开状态的关闭图标。                 |

### 方法

`NavigationRail` 不提供方法。通过 `v-model:expanded` 控制展开，通过 `v-model` 控制选择。

## 样式

rail 没有公开的项目 CSS 自定义属性。它在内部映射 Material 的颜色与文字角色：rail 使用 Surface Container，当前指示器使用 Secondary Container 与 On Secondary Container，未激活内容使用 On Surface Variant，徽章使用 Error 与 On Error。插槽中的图标和 FAB 内容需自行设置样式，rail 不会为其重新着色。

收起指示器为 56 × 32 px，展开后变为 56 px 高的行。状态层保持在指示器内部，徽章被限制在 rail 边缘。文字缩放会增加纵向空间，不会截断标签。

## Material 参考

[Navigation rail 概览](https://m3.material.io/components/navigation-rail/overview) · [指南](https://m3.material.io/components/navigation-rail/guidelines) · [规格](https://m3.material.io/components/navigation-rail/specs) · [无障碍](https://m3.material.io/components/navigation-rail/accessibility)
