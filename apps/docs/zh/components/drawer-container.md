<script setup lang="ts">
import DrawerContainerExample from '../../components/demos/DrawerContainerExample.vue'
</script>

# Drawer container

`DrawerContainer` 是用于逻辑起始侧和末尾侧面板的项目布局拓展，并非独立的 Material 组件。各面板可选 `overlay`、`push` 或 `side`；`auto` 根据容器宽度切换模式。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><DrawerContainerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DrawerContainerExample.vue{vue}

:::

## 在应用中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DrawerContainer } from './components/yam3x/drawer-container'

const open = ref(false)
</script>

<template>
  <DrawerContainer
    v-model:open="open"
    start-mode="overlay"
    start-label="主导航"
  >
    <template #start>
      <nav aria-label="主导航"><a href="/">首页</a></nav>
    </template>
    <template #start-toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        菜单
      </button>
    </template>
    <main>页面内容</main>
  </DrawerContainer>
</template>
```

## API

| 属性或 model                              | 可选值                            | 默认值                     | 说明                                   |
| ----------------------------------------- | --------------------------------- | -------------------------- | -------------------------------------- |
| `startMode`、`endMode`                    | `overlay \| push \| side \| auto` | `side`                     | 各逻辑侧面板的呈现模式。               |
| `autoCompactBreakpoint`、`autoBreakpoint` | `number`                          | `600`、`840`               | `auto` 模式的容器宽度断点。            |
| `width`、`maxWidth`                       | CSS 长度                          | `360px`                    | 面板宽度和最大宽度。                   |
| `v-model:open`、`v-model:endOpen`         | `boolean`                         | `false`                    | 可关闭的起始侧和末尾侧面板的打开状态。 |
| `startLabel`、`endLabel`                  | `string`                          | `Start panel`、`End panel` | 面板的无障碍名称。                     |
| `startRole`、`endRole`                    | `dialog \| complementary`         | —                          | 非模态面板的可选角色。                 |
| `closeLabel`                              | `string`                          | `Close panel`              | 遮罩操作的名称。                       |
| `startDivider`、`endDivider`              | `boolean`                         | `false`                    | 在布局内面板和内容之间添加分隔线。     |

`#start` 和 `#end` 承载侧面板；默认插槽承载主要内容。`#start-toggle` 和 `#end-toggle` 在 `overlay` 与 `push` 模式下收到 `{ expanded, controls, toggle }`。将 `expanded` 和 `controls` 绑定到切换控件的 ARIA 属性。用户切换或关闭面板时，`change` 事件报告 `(edge, open, reason)`。

## 行为与无障碍

默认情况下，`auto` 在低于 600px 时使用 `overlay`，从 600px 到 840px 以下使用 `push`，达到 840px 时使用 `side`。`side` 面板常驻布局，不渲染切换插槽；`push` 面板推动主要内容，并保持其可交互。

`overlay` 面板使用遮罩和 `dialog` 语义，约束焦点，可通过 Escape、激活遮罩或向锚定边缘拖动关闭。模态面板内容应提供可见关闭控件。面板裁剪横向溢出并允许纵向滚动。内容插槽负责导航选择及其键盘行为。

## 样式

在根元素上设置以下项目自定义属性。浮层专属的颜色和 elevation 覆盖项优先于通用面板覆盖项。

| 区域           | 支持的属性                                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 面板尺寸       | `--yam3x-drawer-container-width`、`--yam3x-drawer-container-max-width`                                                                                                                   |
| 通用面板外观   | `--yam3x-drawer-container-color`、`--yam3x-drawer-container-elevation`                                                                                                                   |
| 浮层外观       | `--yam3x-modal-drawer-container-color`、`--yam3x-modal-drawer-elevation`、`--yam3x-modal-drawer-start-shape`、`--yam3x-modal-drawer-end-shape`、`--yam3x-drawer-container-scrim-opacity` |
| 固定面板分隔线 | `--yam3x-drawer-divider-color`、`--yam3x-drawer-divider-thickness`                                                                                                                       |

## Material 参考

[Side sheets 概览](https://m3.material.io/components/side-sheets/overview)
