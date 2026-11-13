<script setup lang="ts">
import DialogExample from '../../components/demos/DialogExample.vue'
import DialogVariantsExample from '../../components/demos/DialogVariantsExample.vue'
import DialogFormExample from '../../components/demos/DialogFormExample.vue'
</script>

# Dialog

`Dialog` 是 Material 3 Expressive basic dialog 的项目实现，用模态表面呈现需要决定或确认的信息。组件始终为模态，使用 `alertdialog` 角色，不提供非模态或全屏变体。

当任务必须中断当前流程时使用对话框；内容可以在页面旁持续打开时，优先使用 [Side sheet](/zh/components/side-sheet) 或 [Navigation drawer](/zh/components/navigation-drawer)。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><DialogExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DialogExample.vue{vue}

:::

基础对话框需要 `title` 和至少一种关闭方式。`description` 添加辅助文本，`#divider` 分隔主体，`#actions` 放置决定按钮。示例通过 `close(value)` 关闭，使接受的结果保持可观察，事件日志显示生命周期顺序。

### 变体

<div class="vp-raw yam3x-doc-demo-theme"><DialogVariantsExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DialogVariantsExample.vue{vue}

:::

图标对话框添加 `#icon` 和项目关闭按钮。紧急提醒关闭 `dismissOnEscape`，但允许点击外部关闭；检查对话框则相反。两种关闭路径彼此独立。

### 组合

<div class="vp-raw yam3x-doc-demo-theme"><DialogFormExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DialogFormExample.vue{vue}

:::

默认插槽承载对话框内容。这里使用 [Form field](/zh/components/form-field) 和 [Select](/zh/components/select) 选择安装来源，同时对话框将焦点保持在模态表面内。从对话框内容打开的弹层显示在对话框之上。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from './components/yam3x/button'
import { Dialog } from './components/yam3x/dialog'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">查看草稿</Button>
  <Dialog
    v-model:open="open"
    title="查看草稿？"
    description="继续查看此草稿。"
  >
    <template #actions>
      <Button
        variant="text"
        @click="open = false"
      >
        取消
      </Button>
      <Button
        variant="text"
        @click="open = false"
      >
        继续
      </Button>
    </template>
  </Dialog>
</template>
```

::: details 返回值、图标与表单内容

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button } from './components/yam3x/button'
import { Dialog } from './components/yam3x/dialog'
import { Icon } from './components/yam3x/icon'

const open = ref(false)
const returnValue = ref('')
const dialog = ref<InstanceType<typeof Dialog> | null>(null)
</script>

<template>
  <Dialog
    v-model:open="open"
    v-model:return-value="returnValue"
    title="删除工作区？"
    description="之后仍可撤销此操作。"
    show-close-button
    close-label="关闭删除对话框"
  >
    <template #icon><Icon name="warning" /></template>
    <p>归档后仍可在管理面板中恢复工作区。</p>
    <template #actions>
      <Button
        variant="text"
        @click="dialog?.close('cancelled')"
      >
        取消
      </Button>
      <Button
        variant="text"
        @click="dialog?.close('deleted')"
      >
        删除
      </Button>
    </template>
  </Dialog>
</template>
```

`close(value)` 与用户关闭经过相同的取消检查，并将接受的值写入 `returnValue`。

:::

## 行为与无障碍

### 焦点与关闭

- 打开对话框会将焦点移入表面并约束在其中。关闭后焦点返回打开对话框的元素。
- 默认允许通过 Escape 和外部指针输入关闭；`dismissOnEscape` 和 `dismissOnClickOutside` 分别控制两条路径。
- `showCloseButton` 渲染独立的 48 px 关闭目标。它不受两个关闭属性影响，使用本地化的 `close` 操作名称，除非 `closeLabel` 覆盖。
- 必须提供可见的关闭控件：通常是 `actions` 插槽中的操作按钮，或关闭按钮。Escape 和点击外部是额外路径，不能替代可见控件。开发环境下，如果对话框打开时既没有关闭按钮也没有操作控件，会输出警告。
- 表面是由标题命名的 `alertdialog`，并由 `description` 描述。对话框打开时背景内容不能滚动。
- 减少动态效果时移除空间移动，但保留可见的打开状态；强制颜色下保留对话框边界与焦点环。

### 表单

对话框内容保留原生表单行为。对话框不会创建表单、提交值或添加字段。将表单放入默认插槽；其控件、验证、重置和提交仍正常工作。需要提交的对话框操作应使用表单自身的提交控件，或调用应用的提交处理函数。

### 层叠与嵌套对话框

- 新打开的对话框会预留比先前对话框更高的浮层，因此在上层打开的对话框保持置顶，较低表面的弹层会关闭。
- 每个打开的对话框都是独立的模态表面：它会约束焦点、锁定页面滚动，并在关闭时恢复焦点。任务结束时请关闭外层对话框，不要让无活动的对话框停留在另一个对话框之后。
- 从对话框内容打开的弹层（例如 Select 面板）位于其所属对话框之上。

### 响应式与 RTL

- 表面宽度至少 280 px、最多 560 px，并受视口和 24 px 内边距限制。在任何宽度下都居中于视口。
- 高度上限为 560 px，并进一步受视口限制。主体滚动，而标题和操作保持可见。
- 窄宽度下关闭目标仍位于对话框边界内。文字可换行，操作会换行而不是溢出。
- 对话框遵循文档书写方向；标题对齐、操作顺序和关闭目标位置在 RTL 中镜像。
- 提供图标时，图标、标题和辅助说明居中；没有图标时，标题和说明起始对齐。

### 状态归属

绑定时，`open` 和 `returnValue` 是由应用拥有的模型。组件不保存第二份显示或结果状态。通常使用 `v-model` 同时绑定值和更新处理器，以观察并控制对话框。被取消的 `cancel` 或 `closing` 事件保持对话框打开；直接更改 `open` 会被视为已接受状态。

## API

内置界面文案可继承共享的 [LocaleProvider](/zh/components/localization) 配置。显式 `locale` 和 `closeLabel` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出     | 说明                           |
| -------- | ------------------------------ |
| `Dialog` | 模态表面、焦点行为和生命周期。 |

### 属性与模型

| 属性与模型              | 类型                           | 默认值             | 用途                           |
| ----------------------- | ------------------------------ | ------------------ | ------------------------------ |
| `open`                  | `v-model:open: boolean`        | `false`            | 控制显示状态。                 |
| `returnValue`           | `v-model:return-value: string` | `''`               | 由 `close(value)` 写入的结果。 |
| `title`                 | `string`                       | 必填               | 可见标题和对话框无障碍名称。   |
| `description`           | `string`                       | 未定义             | 与对话框关联的辅助文本。       |
| `showCloseButton`       | `boolean`                      | `false`            | 显示独立的项目关闭目标。       |
| `dismissOnEscape`       | `boolean`                      | `true`             | 允许 Escape 关闭对话框。       |
| `dismissOnClickOutside` | `boolean`                      | `true`             | 允许外部指针输入关闭对话框。   |
| `closeLabel`            | `string`                       | 本地化「关闭」     | 关闭目标的无障碍名称。         |
| `locale`                | `string`                       | Provider → `en-US` | 内置界面文案语言。             |

### 事件

| 事件      | 载荷    | 用途                                                               |
| --------- | ------- | ------------------------------------------------------------------ |
| `opening` | `Event` | 在对话框打开前触发。直接更改 `open` 模型时只作为通知。             |
| `opened`  | `Event` | 打开过渡和焦点放置后触发。                                         |
| `cancel`  | `Event` | 可取消，在 Escape 关闭前触发。调用 `preventDefault()` 可保持打开。 |
| `closing` | `Event` | 可取消，在对话框关闭前触发。调用 `preventDefault()` 可保持打开。   |
| `closed`  | `Event` | 关闭过渡和焦点返回后触发。                                         |

直接更改 `open` 模型会以通知方式触发 `opening` 或 `closing`，随后触发 `opened` 或 `closed`。关闭路径和 `close()` 触发可取消的 `closing`；被阻止的关闭不会触发 `closed`。

### 插槽

| 插槽         | 用途                                         |
| ------------ | -------------------------------------------- |
| `default`    | 对话框主体内容；为空时省略。                 |
| `title`      | 替换标题内容，同时保留标题元素。             |
| `icon`       | 添加辅助图标媒体，并居中标题内容。           |
| `close-icon` | 替换项目关闭目标内的图标。                   |
| `divider`    | 在主体和操作之间添加分隔线，例如 `Divider`。 |
| `actions`    | 放置最多两个文本操作；确认操作放在最后。     |

### 方法

通过模板 ref 访问。

| 方法            | 返回     | 用途                                                        |
| --------------- | -------- | ----------------------------------------------------------- |
| `close(value?)` | `void`   | 关闭对话框，将 `value` 写入 `returnValue`，并遵守取消检查。 |
| `returnValue`   | `string` | 暴露的模型值；优先使用 `v-model:return-value`。             |

## 样式

`Dialog` 不定义公开的 `--yam3x-*` 样式属性。颜色、形状、高度和字体来自 Material 系统角色；宽度、内边距和桌面端高度上限是项目测量值。

::: details 系统角色与测量几何

- 表面：`surface-container-high`；文本：`on-surface`；辅助文本：`on-surface-variant`；焦点与关闭环：`secondary`；分隔线：`outline`；背景遮罩：`scrim`。
- 形状：`corner-extra-large`；高度：level 3；标题：Headline Small；辅助文本：Body Medium；主体：Body Large。
- 项目关闭目标为 48 px，图标 24 px，状态层 40 px，焦点环为内缩 3 px 的 `secondary`。
- 视口内边距、标题间距、主体间距、操作间距和操作内边距使用 density spacing 比例。示例和 API 描述最终几何，而不是单独的对话框覆盖项。
- 减少动态效果时移除淡入和空间过渡；强制颜色下添加 `CanvasText` 对话框边框和 `Highlight` 焦点环。

:::

## Material 参考

[Dialogs 概览](https://m3.material.io/components/dialogs/overview) · [指南](https://m3.material.io/components/dialogs/guidelines) · [规格](https://m3.material.io/components/dialogs/specs) · [无障碍](https://m3.material.io/components/dialogs/accessibility)
