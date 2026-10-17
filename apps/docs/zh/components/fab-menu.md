<script setup lang="ts">
import FabMenuExample from '../../components/demos/FabMenuExample.vue'
import FabMenuCompositionExample from '../../components/demos/FabMenuCompositionExample.vue'
</script>

# FAB menu

FAB menu 将 floating action button 展开为一组相关操作。组内操作应服务于同一任务，并为触发器和每个项目提供清晰名称。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><FabMenuExample /></div>

::: details 查看演示源码

<<< ../../components/demos/FabMenuExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { FabMenu, type FabMenuItem } from './components/yam3x/fab-menu'

const actions: FabMenuItem[] = [
  { value: 'camera', label: '拍摄照片' },
  { value: 'upload', label: '上传文件' },
]
</script>

<template>
  <FabMenu
    :items="actions"
    label="创建操作"
    trigger-label="创建"
  />
</template>
```

## 组合菜单

需要直接控制触发器或操作内容时，使用组合 API。`FloatingActionButtonMenu` 管理展开状态、浮层定位、焦点和键盘导航。通过 `#trigger` 提供触发器并绑定 `triggerProps`，再把 `FloatingActionButtonMenuItem` 放入默认插槽。与 `ToggleFloatingActionButton` 组合后，可获得加号到关闭图标的标准过渡；其他自定义触发器需要在激活时调用 `toggle`。

<div class="vp-raw yam3x-doc-demo-theme"><FabMenuCompositionExample /></div>

::: details 查看组合演示源码

<<< ../../components/demos/FabMenuCompositionExample.vue{vue}

:::

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ToggleFloatingActionButton } from './components/yam3x/fab'
import { FloatingActionButtonMenu, FloatingActionButtonMenuItem } from './components/yam3x/fab-menu'

const expanded = ref(false)
</script>

<template>
  <FloatingActionButtonMenu
    v-model:expanded="expanded"
    label="创建操作"
  >
    <template #trigger="{ triggerProps }">
      <ToggleFloatingActionButton
        v-bind="triggerProps"
        v-model:checked="expanded"
        aria-label="创建"
      />
    </template>
    <FloatingActionButtonMenuItem
      value="camera"
      label="拍摄照片"
    />
    <FloatingActionButtonMenuItem
      value="upload"
      label="上传文件"
    />
  </FloatingActionButtonMenu>
</template>
```

## API

`FloatingActionButtonMenu` 使用 `v-model:expanded` 控制展开状态，接受 `label`、`variant`（`primary`、`secondary`、`tertiary`）、`presentation`（`pill-stack`、`web-menu`）、`horizontal-alignment`（`start`、`center`、`end`）和 `disabled`。`#trigger` 插槽接收 `expanded`、`toggle`、`setExpanded` 和 `triggerProps`；将 `triggerProps` 绑定到触发器上，以提供菜单语义和键盘行为。`triggerProps` 不包含点击处理：`ToggleFloatingActionButton` 可通过 `v-model:checked` 与菜单共用状态，其他触发器需要在激活时调用 `toggle`。触发器的颜色 variant 应与菜单的 `variant` 匹配。`FloatingActionButtonMenuItem` 接受 `value`、`label`、`disabled`、`selected` 和原生链接属性，提供默认插槽和 `#icon` 插槽。作为项目扩展，`selected` 由调用者控制，仅在 `web-menu` 中显示 baseline Menu 选中外观；它不会改变激活或关闭行为。项目会发出 `click`；启用的项目激活后，菜单会发出 `select` 并关闭。FAB menu 的 `disabled` 操作是项目扩展：它们保持可见、无法激活、会被键盘导航跳过，并在两种 API 中使用相同的弱化容器与内容样式。Material 的 FAB menu API 未定义禁用操作。胶囊堆叠样式默认在触发器上方展开；只有上方不足以容纳 2 项操作且下方仍有空间时才改为向下展开，正好容纳 2 项时仍向上，并会随页面滚动重新判断位置。

`ToggleFloatingActionButton` 接受 `v-model:checked`、`size`（`small`、`default`、`medium`、`large`）、`variant`（`primary`、`secondary`、`tertiary`）和 `disabled`。默认尺寸为 56px，medium 和 large 分别为 80px 和 96px。small 仍可使用，但 Material 3 Expressive 不推荐使用。它的 `#icon` 插槽接收 `checked` 和动画 `progress`。

`FabMenu` 保留为基于 `items` 数据的便利封装，接受 `variant`、`trigger-size`、`horizontal-alignment` 和 `presentation`。`presentation`（`pill-stack` 或 `web-menu`）以及默认胶囊堆叠样式均为项目决策；布局不会按视口自动切换。项目扩展支持在 `FabMenuItem` 上设置 `selected: true`，以在 `web-menu` 中显示 baseline Menu 选中外观；这不会改变激活或关闭行为。操作列表会在可用高度内滚动，不会遮挡触发器。`beforeselect` 是可取消的项目事件。Material 规定菜单包含 2–6 项操作，并提供 primary、secondary、tertiary 三组颜色；Extended FAB 尺寸不适用于菜单。

## 行为与无障碍

打开后焦点保留在触发器；Arrow Down/Up 可进入并移动操作项，Home/End 跳到首尾可用项，Escape 关闭并恢复焦点，Tab 关闭并继续页面顺序。

`horizontal-alignment="start"` 和 `"center"` 是项目定位选项；默认 `end` 遵循尾侧对齐。弹出层会传送到 `body`。展开期间，弹出层会从最近的 `[data-theme]` 祖先读取 System token，并同步该主题目标的更新。可在菜单根元素上设置公开的 FAB menu CSS 自定义属性来调整弹出层和菜单项。

## Material 参考

[FAB menu 概览](https://m3.material.io/components/fab-menu/overview) · [指南](https://m3.material.io/components/fab-menu/guidelines) · [规格](https://m3.material.io/components/fab-menu/specs) · [无障碍](https://m3.material.io/components/fab-menu/accessibility)
