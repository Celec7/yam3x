<script setup lang="ts">
import FormExample from '../../components/demos/FormExample.vue'
import FormRulesExample from '../../components/demos/FormRulesExample.vue'
</script>

# Form

`Form` 是项目拓展组件，协调原生验证、可选的验证适配器、提交与恢复。应用拥有数据和规则，输入组件拥有编辑与解析行为。`FormSection` 使用原生 fieldset 和 legend 对相关字段分组。

## 示例

### 基础

<div class="vp-raw yam3x-doc-demo-theme"><FormExample /></div>

::: details 查看示例源码

<<< ../../components/demos/FormExample.vue{vue}

:::

演示在同一个已挂载表单上并列三个具名场景：

- **校验与成功提交** —— 必填字段为空时提交，可查看摘要与字段内错误；补全后保存。
- **过期提交** —— 暂缓服务端响应，修改某个值后放行响应；结果属于旧值，会被丢弃。
- **重置与重新加载** —— 重置恢复当前记录；加载另一条记录会建立新的表单会话及重置基线。

### 已注册字段与规则

<div class="vp-raw yam3x-doc-demo-theme"><FormRulesExample /></div>

::: details 查看示例源码

<<< ../../components/demos/FormRulesExample.vue{vue}

<<< ../../components/demos/RegisteredAliasField.vue{vue}

:::

注册定义可声明约束规则、自定义规则函数和应用持有的取值函数，无需修改输入控件。演示还会在不提交的情况下检查嵌套路径范围。

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

`Form` 将 `id` 等原生属性应用于表单根元素，并自行处理提交，不会按 `action` URL 跳转。将适配器错误绑定到字段已有的错误展示，例如 `FormField.error` 或 `NumberField.error`；原生约束错误仍由各控件负责，文字使用浏览器语言，而 `messages` 只修改协调器文案。

## 行为与无障碍

错误通知与恢复请参考 [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)。

### 校验与错误

- 表单使用 `novalidate` 并主动检查原生约束，同时显示本地错误和可链接的错误摘要，避免出现互相竞争的浏览器验证气泡。
- 首次提交前，Form 不报告未触碰的必填字段。输入组件在协调器读取快照前先提交编辑。
- 每次校验依次执行原生约束、注册规则及应用适配器；前一阶段失败时，不执行后续阶段。
- 编辑会使适配器结果过期并清除其错误，下次提交时重新验证。已暴露的原生错误在修正后更新。
- 每个字段的本地错误保留在其已有展示中，不再添加第二套标签或错误。

### 提交与取消

- 仅在验证通过后调用 `submit`。等待中的工作具有可见状态和内部重复提交保护。
- 将 `pending` 绑定到提交按钮以表达当前状态；组件不会禁用或清空输入值。
- 编辑、重置或 `invalidate()` 会请求取消，旧结果不会覆盖当前字段反馈。即使请求了取消，保护仍保留到适配器结束。
- 适配器应及时响应取消信号，并负责网络超时和幂等性。取消不代表服务端已回滚；过期的提交会显示提示，要求重试前先确认之前的结果。
- 提交失败时，如果焦点仍属于此表单，则聚焦摘要；不会从无关内容处抢回焦点。错误链接聚焦当前可用的目标。
- 隐藏、inert、禁用或折叠内容不会成为错误链接的焦点目标；不可访问的字段仅显示说明文字。摘要使用原生标签，并支持 Select 和 Number field 的焦点目标。

### 重置与会话

- 原生重置恢复原生默认值；项目输入组件保留各自的重置契约。使用 `@reset` 恢复应用拥有的 Vue 模型，如示例所示。
- 重置会清除表单反馈，不会虚构正在执行的服务端工作的回滚。
- 加载不同记录时使用不同的 Vue `key`，以建立新的表单会话及输入重置基线。
- 除非应用移除，隐藏字段保留其值；Form 不生成或拥有数据模型。

### 状态归属

`Form` 拥有校验、提交与反馈生命周期。它不读写嵌套模型：已注册字段通过取值函数读取值，或在未提供时读取 `FormData`。此次尝试的快照位于 `FormContext.data`。

## API

内置界面文案可继承 [LocaleProvider](/zh/components/localization) 的共享配置。显式 `locale` 和 `messages` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                     | 类型 | 用途                                                 |
| ---------------------------------------- | ---- | ---------------------------------------------------- |
| `Form`                                   | 组件 | 校验、提交与恢复协调器。                             |
| `FormSection`                            | 组件 | 用 fieldset 与 legend 组织相关字段。                 |
| `useFormField`                           | 函数 | 在后代组件 setup 中注册字段定义。                    |
| `formFieldName`                          | 函数 | 字段路径的默认点连接原生名称。                       |
| `formValidationFromIssues`               | 函数 | 适配 `{ path, message }` 形式的 schema 库问题。      |
| `FormContext`                            | 类型 | 传给 `submit`、验证器与规则的提交上下文。            |
| `FormValidator`                          | 类型 | 普通校验函数。                                       |
| `FormValidationAdapter`                  | 类型 | 含 `validate` 与可选局部 `validateFields` 的适配器。 |
| `FormValidationCheck`                    | 类型 | 程序化局部校验的结果。                               |
| `FormFieldDefinition`                    | 类型 | 已注册字段的路径、名称、标签、取值函数与规则。       |
| `FormFieldPath`                          | 类型 | 原生名称字面量或元组路径。                           |
| `FormRule`、`FormRuleContext`            | 类型 | 约束规则结构及自定义规则收到的上下文。               |
| `FormValidation`                         | 类型 | 验证器返回的 `{ fieldErrors?, message? }`。          |
| `FormSubmitResult`                       | 类型 | `submit` 返回的已接受或预期拒绝结果。                |
| `FormIssue`                              | 类型 | 错误摘要中的 `{ name, label, message }` 项。         |
| `FormMessages`                           | 类型 | 可覆盖的协调器文案。                                 |
| `FormFailure`、`FormPhase`、`FormStatus` | 类型 | 失败详情、失败阶段与可见状态值。                     |

### 属性

| 属性                  | 类型                                                  | 默认值             | 用途                                                                                                          |
| --------------------- | ----------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `submit`              | `(context) => FormSubmitResult \| void \| Promise<…>` | 必需               | 仅在验证通过后调用。                                                                                          |
| `validate`            | `FormValidator \| FormValidationAdapter`              | 无                 | 在原生约束与已注册规则之后执行。                                                                              |
| `fields`              | `readonly FormFieldDefinition[]`                      | `[]`               | 声明式规则与应用持有值的取值函数。                                                                            |
| `locale`              | `string`                                              | Provider → `en-US` | 内置英文或中文反馈；其他语言默认使用英文，可自行覆盖。                                                        |
| `summaryHeadingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                          | `2`                | 错误摘要标题层级，需符合所在页面的结构。                                                                      |
| `messages`            | `Partial<FormMessages>`                               | 英文或中文         | 覆盖 `summary`、`validating`、`submitting`、`success`、`failure`、`validationFailure`、`changed` 和 `field`。 |

### 事件

| 事件       | 载荷                         | 用途                                                                                                                |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `invalid`  | `{ issues, message }`        | 验证失败或提交错误摘要，每项包含 `name`、`label` 和 `message`。                                                     |
| `success`  | `FormContext`                | 已接受的结果。                                                                                                      |
| `failure`  | `FormFailure`                | 携带 `result` 与 `context` 的 `kind: 'rejected'`，或携带 `error`、`phase` 与可选 `context` 的 `kind: 'exception'`。 |
| `outdated` | `{ context, phase, error? }` | 被丢弃的结果。应用需要刷新已保存数据时可处理它。                                                                    |
| `reset`    | `Event`                      | 允许应用恢复模型快照，或调用 `preventDefault()` 取消原生重置。                                                      |

阶段为 `preparation`、`validation` 或 `submission`；准备阶段可能尚未创建 context。异常会显示通用恢复反馈，原始异常保留在诊断事件中，不直接显示在页面上。

### 插槽

| 插槽           | 作用域                             | 用途                                                                             |
| -------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| default        | `{ fieldErrors, pending, status }` | 表单内容；`status` 为 `idle`、`validating`、`submitting`、`error` 或 `success`。 |
| `instructions` | —                                  | 位于摘要与字段之前的说明文字。                                                   |
| `actions`      | `{ pending, status }`              | 位于字段之后的操作控件。                                                         |

### 方法

| 成员                        | 用途                                                 |
| --------------------------- | ---------------------------------------------------- |
| `element`                   | 根 `HTMLFormElement`。                               |
| `requestSubmit(submitter?)` | 程序化提交；输入组件会先提交编辑草稿。               |
| `reset()`                   | 原生重置。                                           |
| `invalidate()`              | 对其他不触发编辑事件的程序化模型修改，使旧操作失效。 |
| `focusField(path)`          | 聚焦字段的错误目标；返回是否找到了可见的焦点目标。   |
| `registerField(definition)` | 命令式注册；返回幂等的清理函数。                     |
| `validateFields(paths?)`    | 校验整个表单或指定路径；返回 `FormValidationCheck`。 |

最终 DOM 值检查也会拒绝已变化的快照。

### FormSection

| 属性          | 类型      | 默认值  | 用途                                          |
| ------------- | --------- | ------- | --------------------------------------------- |
| `title`       | `string`  | 必需    | 分组名称，以 Title Medium 的 legend 呈现。    |
| `description` | `string`  | 空      | 控件前的 Body Medium 说明，与 fieldset 关联。 |
| `disabled`    | `boolean` | `false` | 原生 fieldset 的禁用状态。                    |

`FormSection` 的默认插槽放置字段。根元素属性及已有的 `aria-describedby` 关联会保留。

### 契约

`FormContext` 包含 `form`、`data` FormData 快照、原生 `submitter`（或 null）以及 AbortSignal。局部校验还会提供请求的 `paths`；完整提交不包含此属性。使用 `data` 读取此次尝试的提交值，不要稍后重新读取实时控件；带名称的提交按钮值会包含在内。

`validate` 在通过时不返回内容，或返回 `{ fieldErrors?: Record<string, string>, message?: string }`，键名对应原生字段名称。`submit` 成功时不返回内容或返回 `{ status: 'success', message? }`；预期拒绝返回 `{ status: 'error', message, fieldErrors? }`。适配器消息由应用本地化。

### 字段注册与规则

`FormFieldDefinition` 包含 `path`，以及可选的原生 `name`、摘要 `label`、`value: () => unknown` 和 `rules`。

- 字符串是原生名称字面量；`['contacts', 0, 'email']` 等元组路径保留嵌套属性与索引身份。
- 默认原生名称以点连接元组片段；可用 `name` 消除冲突或适配已有控件。注册路径与原生名称必须唯一。
- Form 不读写嵌套模型；使用应用值时请提供取值函数。未提供时，规则读取 FormData 的单值、重复值数组，或缺失时的 undefined；数值规则不会转换原生字符串。
- 通过 `fields` 传入定义，或在后代组件 setup 中调用 `useFormField(definitionOrGetter)`。hook 向最近的 Form 注册，并随 Vue 作用域清理。
- 命令式 `registerField(definitionOrGetter)` 返回幂等的清理函数。取消注册会移除规则及过期反馈，应用值仍保留；它不会移除原生控件，也不暂停控件的原生约束。

约束规则包含非空的应用本地化 `message`，以及任意 `required`、`minLength`、`maxLength`、`min`、`max` 或 `pattern: RegExp`：

- `required` 检查空值、空字符串及空数组；空白字符、零与 false 均视为已提供的值。
- 可选空值跳过其他约束。长度适用于字符串与数组；数值边界要求有限数值。
- 规则按顺序执行，每个字段遇到首个失败后停止。

自定义 `{ validate(value, context) }` 同步或异步返回非空错误字符串，或不返回内容。`FormRuleContext` 增加 `name`、`path` 和 `getValue(path)`，读取本次校验开始时捕获的注册值。值按引用捕获；响应式编辑会取消校验。请监听 `signal` 取消，并避免在校验中写入模型。

规则错误通过已有插槽 `fieldErrors` 提供，应绑定到控件已有的错误展示。注册的响应式值与规则变化会使待完成操作失效；非响应式外部变化仍需调用 `invalidate()`。

### 辅助函数

- `formFieldName(path)` 返回默认的点连接原生名称。
- `formValidationFromIssues(issues, fields?)` 适配 `{ path, message }` 形式的 schema 库问题，每字段保留首条消息，并应用注册的名称别名。空元组路径提供表单级消息。此函数不依赖 schema 库；schema 解析与翻译由应用负责。

::: details 不提交的校验

`validateFields()` 检查整个表单。`validateFields(['email'])` 检查原生名称字面量，也包括未注册的原生控件；`validateFields([['profile']])` 检查以该前缀开头的已注册元组路径。片段按原值比较，数值 `0` 与字符串 `'0'` 不相同。只替换所选名称的反馈，其他错误与表单级消息保留。忽略局部适配器返回的范围外错误及消息。校验不会提交、聚焦摘要或发出成功事件；需要导航时显式调用 `focusField(path)`。

结果为 `{ status, issues, message }`，其中 `status: 'valid' | 'invalid' | 'busy' | 'outdated'`。有效性仅描述请求范围，即使其他字段仍有错误。Busy 表示其他校验或提交正占用表单；outdated 表示快照或注册已改变。异常发出 `failure` 并显示通用恢复反馈。所有校验共享提交锁及取消规则，不会暴露请求范围外未触碰字段的原生错误。

`FormValidationAdapter` 提供 `validate(context)` 和可选 `validateFields(context, paths)`。局部校验优先使用后者；否则执行完整适配器，仅保留范围内错误。局部校验检查当前原生约束状态及已注册模型值，不强制输入草稿提交；提交前需要完成解析时，使用 `requestSubmit()`。

:::

## 样式

表单继承背景。直接字段之间为 16 px，分组之间为 24 px。说明文字与操作组可换行，高度随字段内容增长。各输入组件保留自己的排版与几何关系。可通过根元素类名将相关短字段排为多列，同时保留 DOM 阅读和焦点顺序。

## Material 参考

[Text fields guidelines](https://m3.material.io/components/text-fields/guidelines) · [Adaptive design](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
