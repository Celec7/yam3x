<script setup lang="ts">
import SideSheetExample from '../../components/demos/SideSheetExample.vue'
</script>

# Side sheets

Side sheet 在主内容旁呈现辅助内容。Standard sheet 保留主区域可用；modal sheet 覆盖主区域，并在关闭前管理交互。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><SideSheetExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SideSheetExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SideSheet } from './components/yam3x/side-sheet'

const open = ref(false)
</script>

<template>
  <SideSheet
    v-model:open="open"
    label="设置"
    mode="adaptive"
  >
    <template #toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        设置
      </button>
    </template>
    <main>主要内容</main>
    <template #headline>设置</template>
    <template #sheet>辅助内容</template>
    <template #actions
      ><button
        type="button"
        @click="open = false"
      >
        完成
      </button></template
    >
  </SideSheet>
</template>
```

## API

`mode` 可设为 `modal`、`standard` 或 `adaptive`。`modal` 模式在主要内容上方显示 scrim、约束焦点，并暴露 `aria-modal="true"`。`standard` 模式会重新布局主要内容，同时保持其可交互；容器需要足够宽，才能为两侧区域保留可用空间。`adaptive` 模式根据组件容器宽度，在 `adaptiveBreakpoint`（默认为 600px）处切换上述呈现方式。响应式布局建议使用 `adaptive`；若在断点以下强制使用 `standard`，可能导致侧边面板空间不足。面板锚定在逻辑行末，因此在 RTL 布局中会移到左侧。

## 行为与无障碍

必填的 `label` 为 side sheet 对话框命名；未提供 `#headline` 时也会作为标题文本。两种呈现方式都暴露一个 dialog 语义边界；只有 modal 模式设置 `aria-modal="true"` 并约束焦点。组件始终在 sheet 内显示关闭图标按钮；`closeLabel` 用于设置其无障碍名称。Scrim 和 Escape 是补充关闭方式，不能替代此控件。可选的 `#back` 和 `#actions` 插槽用于自定义返回入口和操作区。`#sheet` 内容可独立纵向滚动；默认插槽承载主要内容。可选的 `#toggle` 插槽会收到 `{ expanded, controls, toggle }`，用于渲染可访问的打开控件。用户切换、激活 scrim 或按 Escape 关闭时，`change` 事件会报告新状态和原因。

默认宽度和最大宽度均为 400px。设置 `width` 和 `maxWidth` 可覆盖这些值。`adaptiveBreakpoint` 决定 `modal` 与 `standard` 呈现方式之间的切换断点。

## Material 参考

[Side sheets 概览](https://m3.material.io/components/side-sheets/overview) · [指南](https://m3.material.io/components/side-sheets/guidelines) · [规格](https://m3.material.io/components/side-sheets/specs) · [无障碍](https://m3.material.io/components/side-sheets/accessibility)
