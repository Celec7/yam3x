<script setup lang="ts">
import NavigationDrawerExample from '../../components/demos/NavigationDrawerExample.vue'
</script>

# Navigation drawer

Navigation drawer 是旧版模式，Material 已不建议用于新设计；新的 Expressive 导航应采用 Navigation rail。此组件用于支持已有的抽屉页面。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><NavigationDrawerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/NavigationDrawerExample.vue{vue}

:::

## 在应用中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerItem,
  NavigationDrawerSection,
} from './components/yam3x/navigation-drawer'

const open = ref(false)
const current = ref('inbox')
</script>

<template>
  <NavigationDrawer
    v-model:open="open"
    v-model:selected="current"
    mode="auto"
    label="主导航"
  >
    <template #close="{ close, closeLabel }">
      <button
        type="button"
        :aria-label="closeLabel"
        @click="close"
      >
        关闭
      </button>
    </template>
    <template #toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        菜单
      </button>
    </template>

    <NavigationDrawerSection label="邮件">
      <NavigationDrawerItem
        value="inbox"
        label="收件箱"
        href="/inbox"
      />
      <NavigationDrawerItem
        value="saved"
        label="已保存"
        href="/saved"
      />
    </NavigationDrawerSection>
    <NavigationDrawerDivider />
    <NavigationDrawerItem
      value="folders"
      label="文件夹"
    >
      <NavigationDrawerItem
        value="archive"
        label="归档"
        href="/archive"
      />
    </NavigationDrawerItem>

    <template #content>
      <main>当前页面内容</main>
    </template>
  </NavigationDrawer>
</template>
```

## API

该组件的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

`NavigationDrawer` 负责导航地标、目的地选中状态、层级和抽屉呈现。`mode` 可设为 `modal`、`standard` 或 `auto`；auto 模式按容器宽度响应，并在 `standardBreakpoint` 处切换，默认值为 840px。该项目断点对应 compact/medium 与 expanded 布局的常见边界。`v-model:open` 控制可见状态；未绑定时，modal 默认关闭，standard 默认展开。`v-model:selected` 必需，并应与应用当前路由同步。

`close` 插槽是可选的，可用于在抽屉内部放置可见关闭控件。省略时，modal 抽屉仍可通过 scrim、Escape、向锚定边缘滑动或选择目的地关闭。`toggle` 插槽接收 `{ expanded, controls, toggle }`，可将开关放在周围的 app bar 或布局中。`label` 为 modal 面板命名，并默认作为导航地标名称；若需分别命名，可设置 `navigationLabel`。`content` 插槽承载页面区域。

在默认插槽中组合 `NavigationDrawerSection`、`NavigationDrawerDivider` 和 `NavigationDrawerItem`。Section 可带标题。叶目的地必须提供 `href` 并渲染为原生链接。含有子目的地的 Item 是 disclosure 按钮，不能同时提供 `href`。Item 支持 `value`、`label`、`disabled` 和原生链接属性；图标、选中图标和徽标使用 `icon`、`selected-icon`、`badge` 插槽。分支的 `open` model 控制展开状态。

## 行为与无障碍

选择目的地时发出 `select(value, href, event)`。Modal 抽屉会在选择后关闭；standard 抽屉保持展开。`change(open, reason)` 报告用户触发的开合状态变化。Modal 抽屉具有 dialog 语义并锁定焦点；打开时焦点进入第一个目的地，也可通过 scrim、Escape、向锚定边缘滑动或选择目的地关闭。若提供 `close` 插槽，还会在抽屉内部呈现关闭控件。键盘用户可使用 Tab、方向键、Home/End、typeahead 和 Enter/Space。路由导航以及新页面渲染后的焦点由应用负责。

## Material 参考

[Navigation drawer 概览](https://m3.material.io/components/navigation-drawer/overview) · [指南](https://m3.material.io/components/navigation-drawer/guidelines) · [规格](https://m3.material.io/components/navigation-drawer/specs) · [无障碍](https://m3.material.io/components/navigation-drawer/accessibility)
