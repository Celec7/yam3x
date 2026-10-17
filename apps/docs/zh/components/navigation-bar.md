<script setup lang="ts">
import NavigationBarExample from '../../components/demos/NavigationBarExample.vue'
</script>

# Navigation bar

Navigation bar 用于在紧凑布局中切换顶层目的地。应使用少量同级目的地，并确保每项的图标、标签和选中状态易于理解。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationBarExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/NavigationBarExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NavigationBar, NavigationBarItem } from './components/yam3x/navigation-bar'
import { Icon } from './components/yam3x/icon'

const current = ref('home')
</script>

<template>
  <NavigationBar
    v-model="current"
    label="主导航"
  >
    <NavigationBarItem
      value="home"
      label="首页"
      href="/"
    >
      <template #icon><Icon name="home" /></template>
    </NavigationBarItem>
    <NavigationBarItem
      value="saved"
      label="收藏"
      href="/saved"
    >
      <template #icon><Icon name="bookmark" /></template>
    </NavigationBarItem>
  </NavigationBar>
</template>
```

## API

| 属性                          | 类型                                   | 默认值   | 说明                                               |
| ----------------------------- | -------------------------------------- | -------- | -------------------------------------------------- |
| `label`                       | `string`                               | 必填     | navigation landmark 的可访问名称。                 |
| `modelValue`                  | `v-model: string`                      | `''`     | 当前目的地的 `value`。                             |
| `layout`                      | `'vertical' \| 'horizontal' \| 'auto'` | `'auto'` | 项目上下或左右排列；`auto` 在项目 600px 阈值切换。 |
| `NavigationBarItem.value`     | `string`                               | 必填     | 稳定唯一的目的地值。                               |
| `NavigationBarItem.label`     | `string`                               | 必填     | 可见目的地标签。                                   |
| `NavigationBarItem.href`      | `string`                               | 必填     | 原生目的地 URL。                                   |
| `NavigationBarItem.ariaLabel` | `string`                               | —        | 可见标签含义需要补充时使用的可访问名称。           |
| `disabled`                    | item 上的 `boolean`                    | `false`  | 禁止导航并移出顺序键盘焦点。                       |
| `disabledInteractive`         | item 上的 `boolean`                    | `false`  | 显示禁用语义但保留 Tab 焦点；不导航、不改变选择。  |
| `target` / `rel` / `download` | item 上的原生链接属性                  | —        | 启用链接时透传；禁用项不渲染这些属性。             |

在默认插槽中组合多个 `NavigationBarItem`。单项的 `#icon` 接收 `{ selected }`；可选的 `#selected-icon` 在选中时替代它；`#badge` 接收 `{ selected }`，用于在图标旁放置点状或计数徽标。根组件先发出 `navigate(destination, MouseEvent)`，再更新 `v-model`；在事件上调用 `preventDefault()` 会同时取消选择和原生导航。修饰键和鼠标中键保留原生链接行为，且不会改变当前选择。

## 行为与无障碍

键盘上 Enter 与 Space 都会激活链接，Space 不触发页面滚动。选中项使用加粗标签和填充图标/`#selected-icon`；文本在 2× 缩放下可换行且保持完整。

`auto` 在 600px 处将导航栏由垂直形态切换为水平形态。该断点是项目决策，并非 Material 官方断点。页面在 960px 及以上组合 Navigation rail 替代导航栏；两个组件不会自动互相切换。

## Material 参考

[Navigation bar 概览](https://m3.material.io/components/navigation-bar/overview) · [指南](https://m3.material.io/components/navigation-bar/guidelines) · [规格](https://m3.material.io/components/navigation-bar/specs) · [无障碍](https://m3.material.io/components/navigation-bar/accessibility)
