<script setup lang="ts">
import SnackbarExample from '../../components/demos/SnackbarExample.vue'
</script>

# Snackbar

Snackbar 为操作或流程提供简短、非阻断的反馈。提示内容应精炼；如包含可选操作，应清楚表达。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><SnackbarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SnackbarExample.vue{vue}

:::

## 在应用中导入

`App.vue`:

```vue
<script setup lang="ts">
import { SnackbarProvider } from './components/yam3x/snackbar'
import SaveButton from './SaveButton.vue'
</script>

<template>
  <SnackbarProvider><SaveButton /></SnackbarProvider>
</template>
```

`SaveButton.vue`:

```vue
<script setup lang="ts">
import { useSnackbar } from './components/yam3x/snackbar'

const snackbar = useSnackbar()
function save(): void {
  void snackbar.show({ message: '更改已保存' })
}
</script>

<template>
  <button
    type="button"
    @click="save"
  >
    保存
  </button>
</template>
```

## API

`SnackbarProvider` 的内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。可用 `locale` 覆盖语言，默认使用 provider，再回退到 `en-US`。单条通知的标签选项优先。

未提供单条通知的 `dismissLabel` 时，活动通知使用当前语言的默认关闭标签。显式 `dismissLabel`、消息和操作文案保留调用方提供的值；语言切换不重置计时、队列或正在执行的操作。

`SnackbarProvider` 为其后代提供单一 host。不同消息按请求顺序显示；`key` 相同的消息会更新已有通知。消息会完整显示并自然换行，不会截断；请保持文案简洁，以符合紧凑布局最多两行的建议。单行通知高度为 48px；双行通知在紧凑宽度下为 64px，在更宽的视口下为 68px。如果操作按钮会使消息可用宽度少于 120px，操作按钮会移到消息下方。`show()` 返回 Promise，操作完成解析为 `action`，关闭通知解析为 `dismissed`。通知不会夺取焦点；按 **Alt+G** 可聚焦当前通知的操作或关闭按钮，按 Escape 可关闭已聚焦的通知。

## 行为与无障碍

带操作的通知会一直显示到用户激活操作或关闭它。普通通知默认持续显示；只有在调用方确认相同信息也显示在页面内容中时，才能提供 4–10 秒的 `timeoutMs` 并设置 `inlineFeedback: true`。定时期间若页面隐藏，或用户悬停、聚焦通知，计时会暂停。

Host 接受 `alignment="center" | "start"`、`anchor` 和 `bottom-offset` 属性。将模板 ref 指向的 `HTMLElement` 传给 `anchor`，即可让通知显示在 FAB 或其他元素上方。Host 会保留 16px 间距；`bottom-offset` 可在锚点上方增加额外间距。锚点为空、已断开或隐藏时，Host 会回退到视口底部布局。不使用锚点时，可通过 `bottom-offset` 避开固定导航栏或 FAB。

## Material 参考

[Snackbar 概览](https://m3.material.io/components/snackbar/overview) · [指南](https://m3.material.io/components/snackbar/guidelines) · [规格](https://m3.material.io/components/snackbar/specs) · [无障碍](https://m3.material.io/components/snackbar/accessibility)
