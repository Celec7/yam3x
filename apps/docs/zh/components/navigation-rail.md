<script setup lang="ts">
import NavigationRailExample from '../../components/demos/NavigationRailExample.vue'
</script>

# Navigation rail

Navigation rail 沿窗口边缘呈现顶层目的地。其收起或展开形态应适应布局，并让当前目的地易于识别。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><NavigationRailExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NavigationRailExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationRail } from './components/yam3x/navigation-rail'
import Icon from './components/yam3x/icon/icon.vue'
const current = ref('home')
const items = [
  { value: 'home', label: '首页', href: '/', icon: 'home' },
  { value: 'search', label: '搜索', href: '/search', icon: 'search' },
  { value: 'saved', label: '收藏', href: '/saved', icon: 'bookmark' },
]
</script>

<template>
  <NavigationRail
    v-model="current"
    label="主导航"
    :items="items"
  >
    <template #icon="{ item }"><Icon :name="item.icon" /></template>
    <template #selected-icon="{ item }"
      ><Icon
        :name="item.icon"
        filled
    /></template>
  </NavigationRail>
</template>
```

## API

`items` 至少包含 `value`、`label` 和 `href`，可选 `ariaLabel`、`disabled`、`disabledInteractive`、`secondary`、`badge`、`badgeLabel` 和原生链接属性。Material 建议提供 3–7 个目的地，也允许一个可选 FAB；这是设计建议，不是运行时数量限制。`v-model` 指向当前目的地。`mode` 可为 `collapsed`、`expanded`、`auto`，并决定初始展开行为：`collapsed` 初始收起，`expanded` 初始展开，`auto` 在 960px 以下收起，在 960px 及以上展开。`v-model:expanded` 中提供的值优先于 `mode`。未绑定该模型时，使用内置菜单会保存手动选择；此后视口跨越断点不会再自动改变展开状态，但 `auto` 模式仍会在 960px 以下隐藏 rail。紧凑宽度应使用 Navigation Bar 接替。若绑定了该模型，将它设为 `undefined` 即可交回 `mode` 控制。`presentation` 可为 `standard` 或 `modal`；`alignment` 控制目的地靠上或居中。`divider` 在内容侧显示分隔线。`hideWhenCollapsed` 用于外部菜单控制的沉浸式布局，此时应用需要提供可访问的外部打开按钮。展开宽度上限为 360px。

`mode` 默认为 `collapsed`。`showMenu` 默认为 `true`；`menuLabel` 和 `closeLabel` 可覆盖内置展开、收起按钮的无障碍名称。

## 行为与无障碍

`#icon`、`#selected-icon` 和 `#badge` 负责目的地图标和徽章。若图标系列同时提供描边和填充版本，未选中项使用描边图标，选中项使用填充图标。`#menu-icon` 与 `#close-icon` 替换内置菜单图标；`#fab` 接收展开状态，适合在展开时显示扩展 FAB。为整组提供 `label`，为含糊的目的地名称提供 `ariaLabel`。方向键和 Tab 移动焦点，Space/Enter 激活。选择事件依次为可取消的 `beforeinput`、模型更新、`input`、`change` 和 `navigate`。

## Material 参考

[Navigation rail 概览](https://m3.material.io/components/navigation-rail/overview) · [指南](https://m3.material.io/components/navigation-rail/guidelines) · [规格](https://m3.material.io/components/navigation-rail/specs) · [无障碍](https://m3.material.io/components/navigation-rail/accessibility)
