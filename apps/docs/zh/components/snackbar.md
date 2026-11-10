<script setup lang="ts">
import SnackbarExample from '../../components/demos/SnackbarExample.vue'
import SnackbarLifetimeExample from '../../components/demos/SnackbarLifetimeExample.vue'
</script>

# Snackbar

Snackbar 在屏幕底部显示应用流程的简短更新。它可以自动消失，也可以保留到用户执行操作为止。Snackbar 用于非阻断状态；需要用户作出决定时使用 [Dialog](/zh/components/dialog)。

## 示例

### 反馈与 host 定位

演示包含普通、长文本、带操作、可定时、连续和同 key 更新的通知。对齐方式、底部避让和锚点控件会改变单一 host 放置通知的位置。可定时消息设置了 `inlineFeedback: true`；只有当相同信息也显示在页面内容中时才使用超时。

<div class="vp-raw yam3x-doc-demo-theme"><SnackbarExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SnackbarExample.vue{vue}

:::

### 生命周期与键盘快捷键

Provider 可以使用自定义快捷键。此演示使用 Alt+Shift+S 聚焦当前通知的操作或关闭按钮，并展示没有关闭按钮、也没有计时器的通知。

<div class="vp-raw yam3x-doc-demo-theme"><SnackbarLifetimeExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SnackbarLifetimeExample.vue{vue}

:::

## 在应用中使用

`App.vue`：

```vue
<script setup lang="ts">
import { SnackbarProvider } from './components/yam3x/snackbar'
import SaveButton from './SaveButton.vue'
</script>

<template>
  <SnackbarProvider><SaveButton /></SnackbarProvider>
</template>
```

`SaveButton.vue`：

```vue
<script setup lang="ts">
import { useSnackbar } from './components/yam3x/snackbar'

const snackbar = useSnackbar()

async function save(): Promise<void> {
  const result = await snackbar.show({
    message: '更改已保存',
    actionLabel: '撤销',
    onAction: () => restoreChanges(),
  })
  if (result === 'action') refresh()
}

function discard(): void {
  snackbar.dismiss()
}
</script>

<template>
  <button
    type="button"
    @click="save"
  >
    保存
  </button>
  <button
    type="button"
    @click="discard"
  >
    关闭
  </button>
</template>
```

::: details Host 配置

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SnackbarProvider } from './components/yam3x/snackbar'

const anchor = ref<HTMLElement | null>(null)
</script>

<template>
  <SnackbarProvider
    alignment="start"
    :anchor="anchor"
    :bottom-offset="24"
    shortcut="Alt+Shift+S"
  >
    <button
      ref="anchor"
      type="button"
    >
      锚点控件
    </button>
  </SnackbarProvider>
</template>
```

不使用锚点时，可通过 `bottom-offset` 避开固定导航栏或 FAB。

:::

## 行为与无障碍

### 计时与持续

- 带操作的通知会一直显示到用户激活操作或关闭它。普通通知默认持续显示。
- 仅在 `inlineFeedback: true` 时设置 `timeoutMs`。数值会被限制在 4–10 秒。
- 页面隐藏，或用户悬停、聚焦通知时，计时会暂停。
- 带操作或没有超时的通知，`dismissible` 默认 `true`。可定时的 inline feedback 通知默认 `false`；可显式覆盖。
- 消息按请求顺序显示。`key` 相同的消息会更新已有通知，而不是再排入一条。

### 定位与锚点

- `SnackbarProvider` 为其后代提供单一 host。Host 接受 `alignment="center" | "start"` 和 `bottom-offset`。
- 将模板 ref 指向的 `HTMLElement` 传给 `anchor`，即可让通知显示在 FAB 或其他元素上方。Host 会保留 16px 间距；`bottom-offset` 可在锚点上方增加额外间距。
- 锚点为空、已断开或隐藏时，Host 会回退到视口底部布局。
- Host 与已聚焦的页面控件重叠时，也会移到该控件上方。
- 消息会完整显示并自然换行，不会截断。单行通知高度为 48px；双行通知在紧凑宽度下为 64px，在更宽的视口下为 68px。如果操作按钮会使消息可用宽度少于 120px，操作按钮会移到消息下方。

### 焦点与键盘

- 通知不会夺取焦点。按 provider 的快捷键（默认 Alt+G）可聚焦当前通知的操作或关闭按钮。
- 按 Escape 可关闭已聚焦的通知。设置 `shortcut: null` 可禁用快捷键。
- 通知关闭后，焦点返回快捷键移动焦点前所在的控件。
- 通知以 `status` 区域播报，并设置 `aria-live="polite"` 与 `aria-atomic="true"`。

## API

### 导出

| 导出                                | 说明                                       |
| ----------------------------------- | ------------------------------------------ |
| `SnackbarProvider`                  | 后代通知的 host 与队列。                   |
| `useSnackbar`                       | 返回 provider 的 `show` 与 `dismiss` API。 |
| `SnackbarOptions`、`SnackbarResult` | 消息和结果的类型导出。                     |

### `SnackbarProvider` 属性

| 属性           | 类型                  | 默认值                     | 说明                                       |
| -------------- | --------------------- | -------------------------- | ------------------------------------------ |
| `alignment`    | `'center' \| 'start'` | `'center'`                 | Host 的水平对齐方式。                      |
| `anchor`       | `HTMLElement \| null` | —                          | 将 host 放在此元素上方，并保留 16px 间距。 |
| `bottomOffset` | `number`              | `0`                        | 在视口底部或锚点上方增加的额外空间。       |
| `shortcut`     | `string \| null`      | `'Alt+G'`                  | 聚焦当前通知操作或关闭按钮的键盘快捷键。   |
| `locale`       | `string`              | Provider，再回退到 `en-US` | 覆盖默认关闭标签的语言。                   |

Provider 渲染默认插槽和一个 host。内置文案继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置；单条通知的选项优先。

### `SnackbarProvider` 插槽

| 插槽      | 属性 | 说明                                        |
| --------- | ---- | ------------------------------------------- |
| `default` | —    | 后代组件可调用 `useSnackbar()` 的应用内容。 |

### `useSnackbar()` 方法

| 方法            | 返回                      | 说明                                                                  |
| --------------- | ------------------------- | --------------------------------------------------------------------- |
| `show(options)` | `Promise<SnackbarResult>` | 将通知加入队列。操作完成时解析为 `action`，关闭时解析为 `dismissed`。 |
| `dismiss()`     | `void`                    | 以 `dismissed` 关闭当前通知。                                         |

没有 `SnackbarProvider` 祖先时，`useSnackbar()` 会抛出错误。

### `SnackbarOptions`

| 字段             | 类型                          | 默认值                                                     | 说明                                                             |
| ---------------- | ----------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `message`        | `string`                      | 必填                                                       | 通知文本。空消息会抛出错误。                                     |
| `actionLabel`    | `string`                      | —                                                          | 添加尾部操作。带操作的通知会保留到操作执行或关闭。               |
| `onAction`       | `() => void \| Promise<void>` | —                                                          | 操作激活时执行。其 rejection 会使 `show()` 返回的 Promise 失败。 |
| `dismissible`    | `boolean`                     | 带操作或没有超时时 `true`；定时 inline feedback 为 `false` | 是否显示关闭按钮。                                               |
| `dismissLabel`   | `string`                      | 本地化 `Dismiss notification`                              | 关闭按钮的可访问名称。                                           |
| `timeoutMs`      | `number`                      | —                                                          | 自动关闭延迟，限制在 4000–10000ms。需要 `inlineFeedback: true`。 |
| `inlineFeedback` | `boolean`                     | `false`                                                    | 确认相同信息也显示在页面内容中。与 `timeoutMs` 一起必填。        |
| `key`            | `string`                      | —                                                          | 替换相同 key 的已有通知，而不是排入新通知。                      |

未提供单条通知的 `dismissLabel` 时，关闭按钮使用当前语言的默认标签。显式 `dismissLabel`、消息和操作文案保留调用方提供的值；语言切换不重置计时、队列或正在执行的操作。

### `SnackbarResult`

`SnackbarResult` 为 `'action' | 'dismissed'`。

## 样式

Snackbar 不提供公开的 CSS 覆盖钩子。颜色角色、形状、排版、高度和响应式几何映射 Material system token，间距跟随 System density scale。使用 provider 属性和通知选项调整定位、计时和内容。

## Material 参考

[Snackbar 概览](https://m3.material.io/components/snackbar/overview) · [指南](https://m3.material.io/components/snackbar/guidelines) · [规格](https://m3.material.io/components/snackbar/specs) · [无障碍](https://m3.material.io/components/snackbar/accessibility)
