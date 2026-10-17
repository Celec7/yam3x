<script setup lang="ts">
import DialogExample from '../../components/demos/DialogExample.vue'
</script>

# Dialogs

Dialog 会中断当前流程，以呈现重要内容或待处理决定。仅在任务需要集中注意力时使用，并为标题和操作提供清晰名称。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme">
  <DialogExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/DialogExample.vue{vue}

:::

## 在应用中导入

先按[安装指南](/zh/guide/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from './components/yam3x/dialog'

const open = ref(false)
</script>

<template>
  <button
    type="button"
    @click="open = true"
  >
    查看草稿
  </button>
  <Dialog
    v-model:open="open"
    title="查看草稿？"
    description="继续查看此草稿。"
  >
    <template #actions>
      <button
        type="button"
        @click="open = false"
      >
        取消
      </button>
      <button
        type="button"
        @click="open = false"
      >
        继续
      </button>
    </template>
  </Dialog>
</template>
```

## API

| 属性                    | 类型                           | 默认值  | 说明                                                                                |
| ----------------------- | ------------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `open`                  | `v-model:open: boolean`        | `false` | 控制显示状态。                                                                      |
| `returnValue`           | `v-model:return-value: string` | `''`    | 记录完成、取消或关闭操作的结果；也可通过组件 ref 的 `close(value)` 关闭并写入结果。 |
| `title`                 | `string`                       | 必填    | 对话框标题和可访问名称。                                                            |
| `description`           | `string`                       | —       | 可选说明，并与对话框关联。                                                          |
| `showCloseButton`       | `boolean`                      | `false` | 显示项目提供的关闭按钮；与 Escape 和点击外部关闭互相独立。                          |
| `dismissOnEscape`       | `boolean`                      | `true`  | 是否允许按 Escape 关闭对话框。                                                      |
| `dismissOnClickOutside` | `boolean`                      | `true`  | 是否允许点击对话框外部关闭。                                                        |
| `closeLabel`            | `string`                       | `Close` | 关闭按钮的可访问名称。                                                              |

## 行为与无障碍

默认插槽用于补充对话框内容。可通过 `#title` 和 `#close-icon` 自定义标题与关闭图标；可选 `#icon` 和 `#divider` 插槽对应 basic dialog 结构，`#actions` 最多放置两个操作，并使用文本按钮。两个操作时，先放取消操作，再放确认操作，使确认按钮位于尾端；单个操作用于确认或致谢。提供 `#icon` 时，图标、标题和辅助说明居中对齐；不提供图标时，标题和说明起始对齐。生命周期事件包括 `opening`、`opened`、`cancel`、`closing` 和 `closed`；对 `opening`、`cancel` 或 `closing` 调用 `preventDefault()` 可取消对应状态转换。对话框固定使用 `alertdialog` 角色，打开时会约束焦点并阻止背景滚动，关闭后焦点返回触发控件。默认允许通过 Escape 或点击外部关闭，可分别控制这两种方式。标题应简短并说明需要作出的决定；操作按钮应使用清晰的动词标签。

项目实现将对话框高度限制在 560px，并进一步受视口高度限制。Material 规定动态高度，但未指定桌面端最大高度。

## Material 参考

[Dialogs 概览](https://m3.material.io/components/dialogs/overview) · [指南](https://m3.material.io/components/dialogs/guidelines) · [规格](https://m3.material.io/components/dialogs/specs) · [无障碍](https://m3.material.io/components/dialogs/accessibility)
