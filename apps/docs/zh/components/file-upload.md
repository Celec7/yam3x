<script setup lang="ts">
import FileUploadExample from '../../components/demos/FileUploadExample.vue'
import FileUploadFormExample from '../../components/demos/FileUploadFormExample.vue'
</script>

# 文件上传

`FileUpload` 是项目拓展组件，用于选择文件、查看队列并恢复独立传输。它组合了具名选择按钮、可选拖放区域、单文件状态和摘要 live region。

Material 3 Expressive 定义了组件内部使用的 Button、List 与进度展示；队列约定、限制策略、适配器 API 和文件列表组合属于项目决定。最接近的 Compose Material 3 组合是用于拖放区域的 OutlinedCard/Surface、用于选择的 Button、ListItem 风格的行、用于可测量任务的 LinearProgressIndicator，以及 Compose Foundation 的拖放。

当一个提交包含多个文件、某个传输失败不应丢失整个队列，或进度、重试与取消需要保持可见时使用它。表单中的单个原生文件输入可能已足够；当队列本身需要可观察时，`FileUpload` 更有价值。

## 示例

### 基础与传输

<div class="vp-raw yam3x-doc-demo-theme"><FileUploadExample /></div>

字段可立即使用；控件可禁用文件操作并移除拖放区域。`accept`、`max-files` 和 `max-file-size` 描述可接受的条目，每个活动传输展示进度、服务端处理、完成、拒绝和移除。失败文件可以重试，而已完成文件会保留，完成数量与传输状态分开报告。

::: details 查看示例源码

<<< ../../components/demos/FileUploadExample.vue{vue}

:::

### 表单提交

<div class="vp-raw yam3x-doc-demo-theme"><FileUploadFormExample /></div>

展开区块会挂载 `:multiple="false"` 且不传 `upload` 的仅选择字段。表单在提交时把排队条目追加到 `FormData`，重置则通过组件引用清空队列。已有文件排队时再选择文件会报告数量限制，而不是替换现有条目。

::: details 查看示例源码

<<< ../../components/demos/FileUploadFormExample.vue{vue}

:::

## 在应用中使用

完成[安装](/zh/guide/installation)后，从应用中导入复制后的组件：

```vue
<script setup lang="ts">
import { FileUpload, type FileUploadAdapter } from './components/yam3x/file-upload'

const upload: FileUploadAdapter = async ({ file, signal }) => {
  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/attachments', { method: 'POST', body, signal })
  if (!response.ok)
    return {
      status: 'error',
      message: '文件未被接受。请先确认结果再重试。',
    }
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

这个 Fetch 示例没有测量已上传字节，因此使用不定进度。采用上传进度 API 的适配器可用实测值调用 `reportProgress(loaded, total)`。传输结束而服务端仍在处理时调用 `reportProcessing()`。仅在附件被接受后返回成功，而不是在字节计数达到总量时返回成功。

::: details 仅选择的队列

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { FileUpload, type FileUploadItem } from './components/yam3x/file-upload'

const items = shallowRef<Array<Readonly<FileUploadItem>>>([])
const field = ref<InstanceType<typeof FileUpload> | null>(null)

function submit(event: SubmitEvent): void {
  const form = event.currentTarget as HTMLFormElement
  const body = new FormData(form)
  for (const item of items.value)
    if (item.status === 'queued') body.append('attachments', item.file, item.file.name)
  // 使用 fetch 发送 body，然后为下一条记录清空队列。
  field.value?.clear()
}
</script>

<template>
  <form @submit.prevent="submit">
    <FileUpload
      ref="field"
      label="附件"
      multiple
      @change="items = $event"
    />
  </form>
</template>
```

:::

::: details 适配器结果与进度

```ts
import type { FileUploadAdapter } from './components/yam3x/file-upload'

const upload: FileUploadAdapter = async ({ file, signal, reportProgress, reportProcessing }) => {
  const body = new FormData()
  body.append('file', file)
  const request = new XMLHttpRequest()
  request.open('POST', '/api/attachments')
  request.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) reportProgress(event.loaded, event.total)
  })
  reportProcessing()
  signal.addEventListener('abort', () => request.abort(), { once: true })
  // 仅在服务接受附件后返回成功。
  return { status: 'success' }
}
```

:::

## 行为与无障碍

### 选择与限制

选择通过具名 Button 背后的原生文件输入完成。该输入对辅助技术隐藏，并在每次选择后清空，因此可以再次选择同一文件。拖放与选择执行相同约束。

- 添加条目时检查限制。有限的 `maxFiles` 和 `maxFileSize` 值会向下取整，最小为零。
- `multiple: false` 最多接受一个条目。已有条目被移除前再次选择文件会报告数量拒绝；被拒绝的条目不占用容量。
- 重复选择相同文件会创建独立条目。
- 选择器过滤与客户端检查仅为便利机制。接收服务必须自行校验内容、类型、大小与数量。
- `droppable: false` 时不渲染拖放区域及其说明。页面其他位置的拖放不会被捕获。

### 传输与取消

- `queued` 等待开始操作。`waiting` 已排在活动尝试之后。`uploading` 与 `processing` 为活动状态；`completed`、`failed`、`rejected`、`canceling` 与 `canceled` 为已结束或正在结束。
- `concurrency` 限制尚未结束的适配器尝试。有限值向下取整并至少为一。
- 有适配器时，`autoUpload` 会在条目到达时安排传输。否则保留选择按钮，并显示 “上传待处理文件”队列操作。
- 已知总量时使用确定进度；省略总量或总量非正时保持不定进度。进入服务端处理后的进度报告会被忽略。
- 取消活动尝试会请求 abort，并显示 `canceling` 直至适配器结束；排队或等待中的条目会立即变为 `canceled`。即使行已被移除，活动尝试的并发空位在此期间仍保留。
- 迟到结果不能恢复已移除的行，也不能完成已取消条目。前一次尝试结束后才能重试；旧进度回调不能影响新尝试。
- 取消不代表远端副本已删除。移除或清空已开始的条目会保留可见提示，要求在重试前核对已存储附件。

### 焦点与播报

- 队列摘要使用礼貌 live region，依据状态数量而非百分比播报。各进度条以文件命名，仅为独立活动任务显示。
- 每行保留文件名、大小、状态及独立命名的操作。一个文件失败时，成功文件仍保留。
- 移除包含焦点的行后，焦点返回剩余行操作或选择按钮；无关焦点不被移动。
- 窄屏与放大字号时，行和操作换行。文件名隔离文字方向。
- 拖放区域不是包含嵌套控件的交互控件。静止与拖入状态各自只显示一条边界；拖入时使用 primary 焦点边界替换虚线，而不是叠加第二条边界。

### 表单

队列拥有其 File 对象。选择器不带名称，其原生 FileList 不代表队列。对于仅选择文件的表单，省略 `upload`，保留 `change` 快照，并在提交回调中把 `status === 'queued'` 的条目追加到表单 `FormData`。按应用规则使用 Form 验证适配器报告缺失或被拒绝的附件。在 `@reset` 中调用上传组件引用的 `clear()`，或为新记录会话更换组件的 Vue `key`。

移除队列条目永远不会删除服务端附件。网络超时、持久请求标识、幂等性与存储清理由应用负责。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                  | 类型 | 用途                                              |
| --------------------- | ---- | ------------------------------------------------- |
| `FileUpload`          | 组件 | 选择表面、队列与传输调度。                        |
| `FileUploadAdapter`   | 类型 | 执行单次尝试的异步函数。                          |
| `FileUploadContext`   | 类型 | 包含文件、尝试次数、信号和进度回调的适配器参数。  |
| `FileUploadResult`    | 类型 | 适配器返回的成功值或错误消息。                    |
| `FileUploadItem`      | 类型 | 不可变的队列快照条目。                            |
| `FileUploadStatus`    | 类型 | 队列状态联合类型。                                |
| `FileUploadCounts`    | 类型 | 传给摘要消息的状态计数。                          |
| `FileUploadMessages`  | 类型 | 内置界面文案覆盖。                                |
| `FileUploadRejection` | 类型 | 客户端拒绝原因：`'type'`、`'size'` 或 `'count'`。 |

### 属性

| 属性          | 类型                          | 默认值             | 说明                                                   |
| ------------- | ----------------------------- | ------------------ | ------------------------------------------------------ |
| `label`       | `string`                      | 必填               | 可见的 fieldset legend 与可访问组名。                  |
| `description` | `string`                      | `''`               | 与选择操作关联的常驻说明。                             |
| `accept`      | `string`                      | `''`               | 逗号分隔的扩展名、MIME 类型或 MIME 通配符。            |
| `multiple`    | `boolean`                     | `true`             | 允许队列接受多个条目。                                 |
| `maxFiles`    | `number`                      | 无限制             | 非拒绝条目的最大数量，包括已完成和已取消的条目。       |
| `maxFileSize` | `number`                      | 无限制             | 单个文件的最大字节数。零只允许空文件。                 |
| `upload`      | `FileUploadAdapter`           | 无                 | 执行单次传输尝试；仅选择文件时可省略。                 |
| `autoUpload`  | `boolean`                     | `false`            | 有适配器时自动安排已接受的条目。                       |
| `concurrency` | `number`                      | `3`                | 尚未结束的适配器尝试数量上限。                         |
| `droppable`   | `boolean`                     | `true`             | 除原生选择器外提供拖放区域。                           |
| `disabled`    | `boolean`                     | `false`            | 禁用文件操作与调度；已开始的尝试继续执行。             |
| `locale`      | `string`                      | Provider → `en-US` | 数字格式与内置文案。其他语言默认使用英文，可自行覆盖。 |
| `messages`    | `Partial<FileUploadMessages>` | 内置文案           | 操作名称、约束、拒绝原因和摘要文案。                   |

### 事件

| 事件       | 载荷                         | 说明                                                 |
| ---------- | ---------------------------- | ---------------------------------------------------- |
| `change`   | `Readonly<FileUploadItem>[]` | 新的队列快照，包括进度变化。请视为只读。             |
| `failure`  | `{ item, error? }`           | 该次尝试的预期失败响应或意外异常。                   |
| `outdated` | `{ item, result?, error? }`  | 取消或移除后被丢弃的适配器结果；不代表队列成功完成。 |

### 插槽

| 插槽      | 参数       | 说明                                                                           |
| --------- | ---------- | ------------------------------------------------------------------------------ |
| `preview` | `{ item }` | 替换装饰性文件图标。预览可保持装饰性，或为有信息意义的图片提供恰当的替代文本。 |

### 方法

通过模板引用访问这些成员。

| 成员         | 签名                          | 说明                                     |
| ------------ | ----------------------------- | ---------------------------------------- |
| `items`      | `Readonly<FileUploadItem>[]`  | 只读队列快照。                           |
| `add(files)` | `(files: File[]) => string[]` | 添加文件并返回新的队列 ID。              |
| `choose()`   | `() => void`                  | 打开原生文件选择器。                     |
| `start(id?)` | `(id?: string) => void`       | 启动一个准备好的条目；省略时启动全部。   |
| `retry(id)`  | `(id: string) => void`        | 清除旧进度和错误，然后开始新尝试。       |
| `cancel(id)` | `(id: string) => void`        | 中止活动尝试，或将排队条目标记为已取消。 |
| `remove(id)` | `(id: string) => void`        | 从队列移除条目。                         |
| `clear()`    | `() => void`                  | 移除队列中的全部条目。                   |

::: details 适配器类型与队列条目形状

```ts
interface FileUploadContext {
  id: string
  file: File
  attempt: number
  signal: AbortSignal
  reportProgress: (loaded: number, total?: number) => void
  reportProcessing: () => void
}

type FileUploadResult =
  { status: 'success'; value?: unknown } | { status: 'error'; message: string }

type FileUploadAdapter = (context: FileUploadContext) => Promise<FileUploadResult>

type FileUploadStatus =
  | 'queued'
  | 'waiting'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'
  | 'canceling'
  | 'canceled'

interface FileUploadItem {
  id: string
  file: File
  status: FileUploadStatus
  attempt: number
  loaded: number
  total?: number
  error?: string
  result?: unknown
}
```

队列内的 `id` 在重试间保持稳定，`attempt` 从一开始。它不是全局幂等键。拒绝消息由应用提供，并应说明恢复方式。意外异常显示通用的服务端核对提示；原始详情保留在 `failure` 事件中。

:::

## 样式

`FileUpload` 不暴露公共 CSS 自定义属性。其结构、字号、间距和颜色映射到 Material System 角色，由主题提供这些值。可在宿主元素上设置局部样式，或使用 `preview` 插槽提供文件专属内容。

::: details 采用的 System 角色与尺寸

| 部分     | 处理                                                            |
| -------- | --------------------------------------------------------------- |
| 拖放表面 | Surface Container Low、Outline Variant、虚线边界、Medium 圆角。 |
| 拖入     | Primary 焦点边界替换虚线。                                      |
| 禁用表面 | 12% on-surface 边界与 38% 辅助文本。                            |
| 标题     | Title Medium。                                                  |
| 文件名   | Body Large，并隔离文字方向。                                    |
| 辅助文本 | Body Small；数值使用等宽数字。                                  |
| 行       | 最小 56px 块尺寸，随内容增长。                                  |
| 间距     | 拖放内边距 24px，区域间距 16px，相关说明间距 8px。              |

:::

## Material 参考

[Lists guidelines](https://m3.material.io/components/lists/guidelines) · [Progress indicators guidelines](https://m3.material.io/components/progress-indicators/guidelines) · [Buttons guidelines](https://m3.material.io/components/buttons/guidelines)
