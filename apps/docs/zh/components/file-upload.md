<script setup lang="ts">
import FileUploadExample from '../../components/demos/FileUploadExample.vue'
</script>

# File upload

`FileUpload` 是项目拓展组件，用于选择文件、查看队列及恢复独立传输。按钮、列表层级与进度展示参考 Material 3 Expressive；Material 并未定义独立的上传组件。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><FileUploadExample /></div>

::: details 查看示例源码

<<< ../../components/demos/FileUploadExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { FileUpload, type FileUploadAdapter } from './components/yam3x/file-upload'

const upload: FileUploadAdapter = async ({ file, signal }) => {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/attachments', { method: 'POST', body, signal })
  if (!response.ok) return { status: 'error', message: '文件未被接受，请先确认结果再重试。' }
  return { status: 'success', value: await response.json() }
}
</script>

<template>
  <FileUpload
    label="附件"
    description="选择补充文件。"
    accept=".pdf,image/png"
    :max-files="3"
    :max-file-size="5 * 1024 * 1024"
    :upload="upload"
  />
</template>
```

这段 Fetch 示例没有测量已上传字节，因此使用不定进度。采用上传进度 API 的适配器可调用 `reportProgress(loaded, total)` 报告实测值。传输结束、服务端仍在处理时调用 `reportProcessing()`。仅在附件被接受后返回成功，不要将字节数达到总量视为完成。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

| 属性          | 默认值             | 用途                                                                    |
| ------------- | ------------------ | ----------------------------------------------------------------------- |
| `label`       | 必需               | 可见的 fieldset legend，使用 Title Medium。                             |
| `description` | 空                 | 常驻说明，与选择操作关联。                                              |
| `accept`      | 空                 | 逗号分隔的扩展名、MIME 类型或 MIME 通配符。                             |
| `multiple`    | `true`             | 允许队列接受多个条目。                                                  |
| `maxFiles`    | 无限制             | 非拒绝条目的最大数量，包括已完成和已取消的条目。                        |
| `maxFileSize` | 无限制             | 单个文件的最大字节数。零只允许空文件。                                  |
| `upload`      | 无                 | `FileUploadAdapter`；只选择文件时可省略。                               |
| `autoUpload`  | `false`            | 有适配器时自动安排已接受的条目。                                        |
| `concurrency` | `3`                | 尚未结束的适配器尝试数量上限；有限值向下取整，最小为一。                |
| `droppable`   | `true`             | 除原生选择器外提供拖放区域。                                            |
| `disabled`    | `false`            | 禁用文件操作与调度；已开始的尝试继续执行。                              |
| `locale`      | Provider → `en-US` | 数字格式与内置中英文文案；其他语言默认使用英文，可自行覆盖。            |
| `messages`    | 内置文案           | 部分 `FileUploadMessages`，包括操作名称、约束、拒绝原因和队列摘要函数。 |

添加条目时检查限制。有限的数量和大小上限向下取整，最小为零。设置 `:multiple="false"` 时最多接受一个条目；在移除现有条目前再次选择文件会报告拒绝。被拒绝条目不占用接受容量。重复选择相同文件会创建独立条目。选择器过滤与客户端检查仅为便利机制；接收服务仍须自行校验文件内容和限制。

`FileUploadAdapter` 接收 `{ id, file, attempt, signal, reportProgress, reportProcessing }`，返回 `{ status: 'success', value? }` 或 `{ status: 'error', message }` 的 Promise。队列内的 `id` 在重试间保持稳定，`attempt` 从一开始。网络超时、持久请求标识、幂等性和存储清理由应用适配器负责。本地 ID 不是全局幂等键。拒绝消息由应用提供，并应说明恢复方式。意外异常显示通用的服务端核对提示；原始详情保留在 `failure` 事件中。

`change(items)` 事件提供新的队列快照，包括进度变化。每项包含 `id`、`file`、`status`、`attempt`、`loaded`，以及可选的 `total`、`error` 和成功后的 `result`。请将快照视为只读。状态包括 `queued`、`waiting`、`uploading`、`processing`、`completed`、`failed`、`rejected`、`canceling` 和 `canceled`。`queued` 等待开始操作；`waiting` 已安排并等待传输空位。已知总量时使用确定进度；省略总量或总量非正时保持不定进度。进入服务端处理后会忽略后续字节进度报告。

`failure({ item, error? })` 报告该次尝试的预期失败响应或意外异常。`outdated({ item, result?, error? })` 报告取消或移除后被丢弃的适配器结果；`item` 标识此次尝试的文件与次数，不代表队列上传成功。应用需要核对远端附件时可处理此事件。

`#preview="{ item }"` 插槽替换装饰性文件图标。保留可见文件名，为有信息意义的预览图提供恰当的替代文本。移除预览时释放由应用创建的 object URL。

组件 ref 暴露只读 `items`、`add(files)`（返回新增队列 ID）、`choose()`、`start(id?)`、`retry(id)`、`cancel(id)`、`remove(id)` 和 `clear()`。`start()` 安排所有准备好的条目。被拒绝文件须在修正原因后移除并重新选择。重试清除旧进度和错误并建立新尝试。界面禁用时，应用仍可程序化取消、移除和清空，以完成清理。

## 行为与无障碍

通过有明确名称的 Button 调用原生文件选择器。拖放区域不是包含嵌套控件的交互控件；选择和拖放执行相同约束。每个文件保留名称、大小、状态及独立命名的操作。一个文件失败不会移除其他成功文件。窄屏和放大字号时，条目及操作换行；文件名隔离文字方向。

队列摘要使用礼貌 live region，依据状态数量变化，而非百分比变化播报。各进度条以文件命名，仅为独立活动任务显示。移除包含焦点的条目后，焦点返回剩余条目的操作或选择按钮；不会移动无关焦点。

取消会请求 abort，并显示 `canceling` 直至适配器结束。此期间保留并发空位，即使对应条目已被移除。适配器应及时响应取消。迟到结果不能恢复已移除条目，也不能将已取消条目标记为完成。前一次尝试结束后才能重试；旧进度回调不能影响新尝试。取消不代表远端副本已删除。移除或清空已开始的条目后，保留可见提示，要求重试前核对已存储的附件；清空队列不会抹去这种不确定性。

### 表单集成

队列拥有 File 对象。选择器不带名称，且每次选择后清空，以便再次选择相同文件；其原生 FileList 不代表队列。对于只选择文件的表单，省略 `upload`，保存 `change` 快照，在提交回调中将 `status === 'queued'` 的条目追加到表单 FormData。根据应用规则，使用 Form 验证适配器报告缺失或被拒绝的附件。在 `@reset` 中调用上传组件 ref 的 `clear()`，或为新记录会话更换 Vue `key`。移除队列条目不会删除服务端附件。

## 样式

可选拖放区域使用 Surface Container Low、Outline Variant 和 Medium 圆角。文件名使用 Body Large，说明内容使用 Body Small，数值使用等宽数字。拖放区域内边距为 24 px，区域间距为 16 px，相关说明间距为 8 px。条目最小高度为 56 px，并随内容增长。按钮保留各自的点击目标，条目继承所在表面。

## Material 参考

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines)
