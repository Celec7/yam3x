<script setup lang="ts">
import MenuExample from '../../components/demos/MenuExample.vue'
</script>

# Menus

Menu 从某个控件临时呈现相关选项或操作。菜单应与触发器保持关联；需要持续可见的操作应采用其他模式。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><MenuExample /></div>

::: details 查看演示源码

<<< ../../components/demos/MenuExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { Menu, type MenuItem } from './components/yam3x/menu'
const items: MenuItem[] = [
  { value: 'open', label: '打开' },
  { value: 'favorite', label: '收藏', type: 'checkbox' },
  { value: 'more', label: '更多', items: [{ value: 'share', label: '共享' }] },
]
</script>

<template>
  <Menu
    :items="items"
    label="文件操作"
  />
</template>
```

## API

该组件的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

`items` 是必填的 `MenuItem[]`；每项需有唯一的 `value`。`label` 为菜单命名，默认 `'Options'`；`triggerLabel` 为内置触发器命名，默认 `'Open menu'`。`variant` 默认为 `'standard'`，也可设为 `'vibrant'`；`dense` 默认为 `false`。`positionX` 默认为 `'after'`，也可设为 `'before'`；`positionY` 默认为 `'below'`，也可设为 `'above'`。

使用 `#trigger` 接收 `{ open, toggle, triggerProps }` 并自定义触发器；`#icon` 与 `#trailing-icon` 接收菜单项数据。`variant="vibrant"` 使用 tertiary 色系；`position-x` 可设为 `before` 或 `after`，`position-y` 可设为 `above` 或 `below`，浮层会在窗口边缘自动翻转和移动，进入与退出过渡会从靠近触发控件的一侧展开或收起。`show(anchor)`、`hide()`、`toggle(anchor)` 可用于上下文菜单或 split-button。

## 行为与无障碍

菜单发出可取消的 `beforetoggle` 和 `beforeselect`，以及 `toggle`、`select` 事件；可在前置事件上调用 `preventDefault()` 阻止开合或选择。

`v-model:open` 控制显示状态；`v-model:checked` 保存独立复选项的值；`v-model:selected` 以单选组名称为键，保存每组已选值。菜单打开后首项获得焦点，方向键移动焦点，Home/End 跳到首尾，字符键按标签检索。禁用项仍可获得焦点。Escape 与外部点击关闭；checkbox 保持打开，radio 与操作项选择后关闭。

使用 `{ value: 'divider-1', type: 'divider' }` 或 `{ value: 'gap-1', type: 'gap' }` 分组；每项都需要唯一的 `value`。项目定义的 gap 将分组显示为独立表面；菜单滚动时，gap 会转为分隔线。Web 下拉菜单优先使用 divider。

菜单项的 `leadingIcon` 与 `trailingIcon` 可在图标插槽按项条件渲染时保留对应的 20px 空间。未提供图标插槽时，普通菜单项不会留下空图标槽。

## 样式

支持的 CSS 覆盖项为 `--yam3x-menu-container-min-width`、`--yam3x-menu-container-max-height`、`--yam3x-menu-container-padding-block`、`--yam3x-menu-container-shape`、`--yam3x-menu-active-container-shape`、`--yam3x-menu-inactive-container-shape`、`--yam3x-menu-item-container-height`、`--yam3x-menu-item-icon-label-space`、`--yam3x-menu-item-shape`、`--yam3x-menu-item-focus-ring-shape` 和 `--yam3x-menu-item-label-text-font-size`。在 `Menu` 根元素上设置这些属性。`variant="vibrant"` 使用自身的颜色映射。

## Material 参考

[Menus 概览](https://m3.material.io/components/menus/overview) · [指南](https://m3.material.io/components/menus/guidelines) · [规格](https://m3.material.io/components/menus/specs) · [无障碍](https://m3.material.io/components/menus/accessibility)
