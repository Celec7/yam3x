<script setup lang="ts">
import FormExample from '../../components/demos/FormExample.vue'
</script>

# Form

`Form` 是项目拓展组件，协调原生验证、可选的验证适配器、提交与恢复。应用拥有数据和规则，输入组件拥有编辑与解析行为。`FormSection` 使用原生 fieldset 和 legend 对相关字段分组。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><FormExample /></div>

::: details 查看示例源码

<<< ../../components/demos/FormExample.vue{vue}

:::

## 在项目中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormSection, type FormContext } from './components/yam3x/form'
import { FormField } from './components/yam3x/form-field'
import { Button } from './components/yam3x/button'
const email = ref('')
async function save({ data, signal }: FormContext) {
  const response = await fetch('/api/settings', { method: 'POST', body: data, signal })
  if (!response.ok) return { status: 'error' as const, message: '设置保存失败，请重试。' }
  return { status: 'success' as const }
}
</script>

<template>
  <Form
    :submit="save"
    @reset="email = ''"
  >
    <template #instructions>标有 * 的字段为必填项。</template>
    <template #default="{ fieldErrors }">
      <FormSection title="联系方式">
        <FormField
          label="电子邮件"
          :error="fieldErrors.email"
        >
          <input
            v-model="email"
            name="email"
            type="email"
            required
          />
        </FormField>
      </FormSection>
    </template>
    <template #actions="{ pending }">
      <Button
        type="submit"
        :disabled="pending"
        >保存设置</Button
      >
      <Button
        type="reset"
        variant="text"
        >重置</Button
      >
    </template>
  </Form>
</template>
```

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

| Form 属性             | 默认值             | 用途                                                                                                          |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `submit`              | 必需               | `(context) => result` 或 Promise，仅在验证通过后调用。                                                        |
| `validate`            | 无                 | 可选的 `(context) => validation` 或 Promise，用于应用规则。                                                   |
| `locale`              | Provider → `en-US` | 内置英文或中文反馈；其他语言默认使用英文，可自行覆盖。                                                        |
| `summaryHeadingLevel` | `2`                | 错误摘要标题层级，1–6，需符合所在页面的结构。                                                                 |
| `messages`            | 英文或中文         | 覆盖 `summary`、`validating`、`submitting`、`success`、`failure`、`validationFailure`、`changed` 和 `field`。 |

`FormContext` 包含 `form`、`data` FormData 快照、原生 `submitter`（或 null）以及 AbortSignal。使用 `data` 读取此次尝试的提交值，不要稍后重新读取实时控件。带名称的提交按钮值会包含在内。`id` 等原生属性应用于表单根元素；提交由协调器处理，不会按 `action` URL 跳转。

`validate` 在通过时不返回内容，或返回 `{ fieldErrors?: Record<string, string>, message?: string }`。键名对应原生字段名称。`submit` 成功时不返回内容或返回 `{ status: 'success', message? }`；预期拒绝返回 `{ status: 'error', message, fieldErrors? }`。适配器消息由应用本地化。异常会显示通用恢复反馈，原始异常保留在诊断事件中，不直接显示在页面上。

事件：`invalid({ issues, message })` 报告验证失败或提交错误摘要，每项包含 `name`、`label` 和 `message`。`success(context)` 报告已接受的结果。`failure(detail)` 区分携带 `result` 和 `context` 的 `kind: 'rejected'`，与携带 `error`、`phase` 和可选 `context` 的 `kind: 'exception'`。阶段为 `preparation`、`validation` 或 `submission`；准备阶段可能尚未创建 context。`outdated({ context, phase, error? })` 报告被丢弃的结果。`reset(event)` 允许应用恢复模型快照，或调用 `preventDefault()` 取消原生重置。

默认插槽接收 `{ fieldErrors, pending, status }`。将适配器错误绑定到字段已有的错误展示，例如 `FormField.error` 或 `NumberField.error`。原生约束错误仍由各控件负责，文字使用浏览器语言；`messages` 只修改协调器文案。`#instructions` 位于摘要和字段之前；`#actions` 位于字段之后，接收 `{ pending, status }`。状态为 `idle`、`validating`、`submitting`、`error` 或 `success`。

组件 ref 暴露 `element`、`requestSubmit(submitter?)`、`reset()`、`invalidate()` 和 `focusField(name)`。程序化提交使用 `requestSubmit()`，让输入组件先提交编辑草稿。`focusField` 返回是否找到了可见的焦点目标。程序化修改模型且不触发编辑事件时调用 `invalidate()`；最终 DOM 值检查也会拒绝已变化的快照。

| FormSection 属性 | 默认值  | 用途                                          |
| ---------------- | ------- | --------------------------------------------- |
| `title`          | 必需    | 分组名称，以 Title Medium 的 legend 呈现。    |
| `description`    | 空      | 控件前的 Body Medium 说明，与 fieldset 关联。 |
| `disabled`       | `false` | 原生 fieldset 的禁用状态。                    |

`FormSection` 的默认插槽放置字段。根元素属性及已有的 `aria-describedby` 关联会保留。

## 行为与无障碍

错误通知与恢复请参考 [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)。

表单使用 `novalidate` 并主动检查原生约束，同时显示本地错误和可链接的错误摘要，避免出现互相竞争的浏览器验证气泡。首次提交前，Form 不报告未触碰的必填字段。输入组件在协调器读取快照前先提交编辑。摘要使用原生标签，并支持 Select 和 Number field 的焦点目标。隐藏、inert、禁用或折叠内容不会成为错误链接的焦点目标；不可访问的字段仅显示说明文字。

编辑会使适配器结果过期并清除其错误，下次提交时重新验证。已暴露的原生错误在修正后更新。提交失败时，如果焦点仍属于此表单，则聚焦摘要；不会从无关内容处抢回焦点。错误链接聚焦当前可用的目标。每个字段的本地错误保留在其已有展示中，不再添加第二套标签或错误。

等待中的工作具有可见状态和内部重复提交保护。将 `pending` 绑定到提交按钮以表达当前状态；组件不会禁用或清空输入值。编辑、重置或 `invalidate()` 会请求取消，旧结果不会覆盖当前字段反馈。即使请求了取消，保护仍保留到适配器结束。适配器应及时响应取消信号，并负责网络超时和幂等性。取消不代表服务端已回滚；过期的提交会显示提示，要求重试前先确认之前的结果。应用需要刷新已保存数据时，可处理 `outdated`。

原生重置恢复原生默认值，项目输入组件保留各自的重置契约。使用 `@reset` 恢复应用拥有的 Vue 模型，如示例所示。重置会清除表单反馈，不会虚构正在执行的服务端工作的回滚。加载不同记录时使用不同的 Vue `key`，以建立新的表单会话及输入重置基线。除非应用移除，隐藏字段保留其值；Form 不生成或拥有数据模型。

## 样式

表单继承背景。直接字段之间为 16 px，分组之间为 24 px。说明文字与操作组可换行，高度随字段内容增长。各输入组件保留自己的排版与几何关系。可通过根元素类名将相关短字段排为多列，同时保留 DOM 阅读和焦点顺序。

## Material 参考

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
