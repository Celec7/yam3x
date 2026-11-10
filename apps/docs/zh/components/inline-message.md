<script setup lang="ts">
import InlineMessageExample from '../../components/demos/InlineMessageExample.vue'
import InlineMessageCompactExample from '../../components/demos/InlineMessageCompactExample.vue'
</script>

# 行内消息

`InlineMessage` 在相关内容旁呈现持久反馈。用于应留在阅读流中的信息、警示或可恢复错误；临时反馈使用 Snackbar，需要打断当前任务并要求响应时使用 Dialog。

InlineMessage 是项目扩展。Material 3 Expressive 没有定义独立的行内消息组件；最接近的 Compose Material 3 组合是 `Surface` 或 `Card`，内部使用由 `Icon`、`Text` 和可选 `TextButton` 或 `IconButton` 操作组成的 `Row`。语气映射、标题角色和关闭行为是项目决策。

## 示例

### 语气、播报与关闭

<div class="vp-raw yam3x-doc-demo-theme"><InlineMessageExample /></div>

::: details 查看演示源码

<<< ../../components/demos/InlineMessageExample.vue{vue}

:::

演示组合了静态信息消息、带二级标题的警告，以及带重试操作和关闭控件的礼貌错误。重试会关闭错误并插入礼貌的成功消息。关闭错误会把焦点返回“显示保存错误”按钮，组件不会把底层保存问题标记为已解决。

### 紧凑消息与外观

<div class="vp-raw yam3x-doc-demo-theme"><InlineMessageCompactExample /></div>

::: details 查看演示源码

<<< ../../components/demos/InlineMessageCompactExample.vue{vue}

:::

消息可以省略标题、图标和操作。紧凑形式只保留正文，或将正文与文本操作组合；最后一条消息同时覆盖容器颜色、前景色和圆角形状。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { InlineMessage } from './components/yam3x/inline-message'
</script>

<template>
  <InlineMessage
    title="同步未完成"
    tone="error"
    announcement="polite"
  >
    更改仍然保存在本地。请检查网络连接，然后重试同步。
  </InlineMessage>
</template>
```

默认 slot 是消息正文。用 `#actions` 放置恢复按钮或链接，用 `#icon` 替换语气图标。`v-model:open` 控制可见性，默认 `true`；未绑定时组件自己维护打开状态。

::: details 带焦点目标的关闭

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { InlineMessage } from './components/yam3x/inline-message'
import { Button } from './components/yam3x/button'

const open = ref(true)
const trigger = ref<HTMLButtonElement | null>(null)
</script>

<template>
  <InlineMessage
    v-model:open="open"
    title="导出失败"
    tone="error"
    announcement="polite"
    dismissible
    dismiss-label="关闭导出错误"
    :dismiss-focus="() => trigger"
  >
    文件未创建。请重试导出。
  </InlineMessage>
  <Button
    ref="trigger"
    variant="outlined"
    @click="open = true"
  >
    显示导出错误
  </Button>
</template>
```

把焦点返回可重复失败任务的控件。相邻内容可能随消息一起移除时，请提供明确的焦点目标。

:::

## 行为与无障碍

### 语气与播报

- `tone="info"`、`success` 和 `warning` 使用 Surface Container 与 On Surface 内容。含义来自文本和可选图标，而不是单一色调。
- `tone="error"` 使用 Error Container 与 On Error Container。
- `announcement="off"` 不添加 live role。`polite` 使用 `status`，`assertive` 使用 `alert`；两者都设置 `aria-atomic="true"`。
- 语气与紧急程度相互独立。静态错误可以不播报，而非错误更新也可以播报。live role 对加载后插入或更新的消息可靠，对首次渲染就存在的内容不可靠。
- 默认语气图标是装饰性的，对辅助技术隐藏。含义必须由文本承载。

### 关闭与焦点

- `dismissible` 添加独立的 48 px IconButton，带 tooltip 和可访问名称。默认标签来自本地化的 `actions.dismissMessage`；`dismissLabel` 可覆盖。
- 关闭会把 `open` 设为 false 并触发 `dismiss`。它不会把底层问题标记为已解决。
- 如果关闭移除了焦点，焦点会移到 `dismissFocus()` 或包含元素。回退目标获得临时的程序化焦点，不进入 Tab 顺序。
- 如果应用代码已将焦点移到别处，组件会保留该焦点。关闭无关消息不会移动焦点。
- 没有超时，也不会在出现时移动焦点。

### 操作

- `#actions` 位于文本下方并会换行。用于恢复、重试或了解更多详情的链接。
- 启用的 Text Button 操作和关闭 IconButton 继承消息前景色。填充、色调、描边和高抬操作保留各自的 Button 颜色。
- 字段级错误保留在字段旁；行内消息可以汇总更大范围失败，但不替代本地校验。

### 内容与密度

- 消息随内容增长、换行，并继承区域宽度。它不添加页面级外边距。
- 没有单独的紧凑变体属性。省略标题、图标或操作即可缩短消息；共享密度间距控制内边距和间隙。
- 前置符号使用固定的 2 px 块方向偏移与首行对齐，该偏移不随密度缩放。

### RTL 与窄布局

- 文本、图标和操作遵循书写方向。区域变窄时，操作换行到文本下方。
- 无论方向如何，关闭目标都与其他操作保持独立。
- 长单词会换行而不撑宽页面，文本放大时消息保持阅读顺序。

### 状态归属

- `open` 是默认 `true` 的模型。应用需要显示、隐藏或替换消息时绑定它。
- 应用拥有条件及其解决状态、操作结果，以及重复更新的播报策略。

## API

内置界面文案继承 [LocaleProvider](/zh/components/localization) 的 `actions` 命名空间。`locale` 覆盖语言，默认使用 provider，再回退到 `en-US`；`dismissLabel` 覆盖关闭操作名称。

### 导出

| 导出            | 说明                               |
| --------------- | ---------------------------------- |
| `InlineMessage` | 带语气、操作和可选关闭的持久消息。 |

### 属性与模型

| 属性           | 默认值                   | 说明                                                                   |
| -------------- | ------------------------ | ---------------------------------------------------------------------- |
| `title`        | 空                       | 可选短标题，使用 Title Small。                                         |
| `headingLevel` | `3`                      | 可选标题的语义级别 1–6。请覆盖以匹配周围大纲。                         |
| `tone`         | `info`                   | `info`、`success`、`warning` 或 `error`。                              |
| `announcement` | `off`                    | `off` 无 live role；`polite` 使用 `status`；`assertive` 使用 `alert`。 |
| `icon`         | 语气图标                 | Material Symbol 名称，或 `false` 以省略。                              |
| `dismissible`  | `false`                  | 显示单独的关闭操作。                                                   |
| `dismissLabel` | 本地化默认值             | 关闭操作的可访问名称；请本地化。                                       |
| `dismissFocus` | 包含元素                 | 关闭聚焦内容后返回附近焦点目标的函数。                                 |
| `locale`       | Provider，再回退 `en-US` | 默认关闭标签的语言。                                                   |
| `open`         | `true`                   | 可见性模型；支持 `v-model:open`。                                      |

### 事件

| 事件      | 载荷 | 说明                                       |
| --------- | ---- | ------------------------------------------ |
| `dismiss` | —    | 关闭操作请求关闭。此时 `open` 已为 false。 |

### 插槽

| 插槽      | 用途                       |
| --------- | -------------------------- |
| `default` | 消息内容；实际使用中必填。 |
| `icon`    | 替换装饰性前置图标。       |
| `actions` | 消息下方的恢复或后续操作。 |

### 方法

InlineMessage 不暴露实例方法。通过 `v-model:open` 关闭。

## 样式

InlineMessage 暴露三个项目定义的自定义属性。请成对覆盖颜色以保持对比度。消息默认使用 Medium 圆角角色，并继承区域宽度。

| 属性                                     | 默认值                                    | 用途                     |
| ---------------------------------------- | ----------------------------------------- | ------------------------ |
| `--yam3x-inline-message-container-color` | Surface Container，错误时 Error Container | 容器填充色。             |
| `--yam3x-inline-message-content-color`   | On Surface，错误时 On Error Container     | 文本与继承操作的前景色。 |
| `--yam3x-inline-message-shape`           | System medium 圆角                        | 圆角半径。               |

## Material 参考

[应用字体](https://m3.material.io/styles/typography/applying-type) · [颜色角色](https://m3.material.io/styles/color/roles) · [WAI-ARIA alert 模式](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) · [Tooltip 指南](https://m3.material.io/components/tooltips/guidelines)
