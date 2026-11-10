<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Form,
  FormSection,
  type FormContext,
  type FormSubmitResult,
  type FormValidation,
} from '@registry/components/form'
import { FormField } from '@registry/components/form-field'
import { NumberField } from '@registry/components/number-field'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { useDemoLocale } from './use-demo-locale'

const { locale, t } = useDemoLocale()
const fieldLocale = computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US'))
const email = ref('')
const seats = ref<number | null>(1)
const language = ref<string | string[] | null>(null)
const record = ref(1)
let initial = { email: '', seats: 1, language: null as string | null }
const hold = ref(false)
const showContact = ref(true)
const requests = ref(0)
const response = ref<((result: FormSubmitResult) => void) | null>(null)
const latestRequest = ref('')
const successes = ref(0)
const outdated = ref(0)
function validate(context: FormContext): FormValidation {
  const errors: Record<string, string> = {}
  if (String(context.data.get('email')).endsWith('@blocked.test'))
    errors.email = t('Use another email domain.', '请使用其他邮箱域名。')
  if (Number(context.data.get('seats')) > 5)
    errors.seats = t('This workspace supports up to 5 seats.', '此工作区最多支持 5 个席位。')
  return { fieldErrors: errors }
}
function save(context: FormContext): FormSubmitResult | Promise<FormSubmitResult> {
  requests.value++
  latestRequest.value = JSON.stringify(Object.fromEntries(context.data))
  if (!hold.value) return { status: 'success' }
  // The response controls model a server that may finish after a cancellation request.
  return new Promise((resolve) => {
    response.value = resolve
  })
}
function onSuccess() {
  successes.value++
}
function onOutdated() {
  outdated.value++
}
function onComplete() {
  response.value?.({ status: 'success' })
  response.value = null
}
function onReject() {
  response.value?.({
    status: 'error',
    message: t(
      'Settings could not be saved. Your edits are still available; try again.',
      '设置保存失败。你的编辑仍然保留，请重试。',
    ),
  })
  response.value = null
}
function onReset() {
  email.value = initial.email
  seats.value = initial.seats
  language.value = initial.language
}
function onLoad() {
  initial = { email: 'team@example.com', seats: 3, language: 'en' }
  onReset()
  record.value++
}
</script>

<template>
  <div
    class="form-demo"
    data-testid="form-example"
  >
    <section class="form-demo__scenarios">
      <div class="form-demo__scenario">
        <p class="form-demo__caption">{{ t('Validation and success', '校验与成功提交') }}</p>
        <p class="form-demo__note">
          {{
            t(
              'Submit with an empty field to see the summary and the local error, then complete the required fields.',
              '在字段为空时提交，可查看摘要与字段内错误，然后补全必填项。',
            )
          }}
        </p>
        <Checkbox
          v-model="showContact"
          :label="t('Show contact fields', '显示联系方式字段')"
        />
      </div>
      <div class="form-demo__scenario">
        <p class="form-demo__caption">{{ t('Stale submission', '过期提交') }}</p>
        <p class="form-demo__note">
          {{
            t(
              'Hold the server response, edit a value, then release the reply to see it discarded.',
              '暂缓服务端响应，修改某个值，再放行响应即可看到它被丢弃。',
            )
          }}
        </p>
        <Checkbox
          v-model="hold"
          :label="t('Hold server response', '暂缓服务端响应')"
        />
      </div>
      <div class="form-demo__scenario">
        <p class="form-demo__caption">{{ t('Reset and reload', '重置与重新加载') }}</p>
        <p class="form-demo__note">
          {{
            t(
              'Reset restores the mounted record; loading another record starts a new form session.',
              '重置会恢复当前记录；加载另一条记录会建立新的表单会话。',
            )
          }}
        </p>
        <Button
          variant="outlined"
          :disabled="Boolean(response)"
          @click="onLoad"
          >{{ t('Load another record', '加载另一条记录') }}</Button
        >
      </div>
    </section>
    <Form
      id="settings-form"
      :key="record"
      :submit="save"
      :validate="validate"
      :locale="fieldLocale"
      :summary-heading-level="3"
      @success="onSuccess"
      @outdated="onOutdated"
      @reset="onReset"
    >
      <template #instructions>{{
        t(
          'Fields marked * are required. This workspace supports at most 5 seats.',
          '标有 * 的字段为必填项。此工作区最多支持 5 个席位。',
        )
      }}</template>
      <template #default="{ fieldErrors }">
        <FormSection
          v-show="showContact"
          :title="t('Contact', '联系方式')"
          :description="
            t('We will send workspace updates to this address.', '工作区更新将发送到此邮箱。')
          "
        >
          <FormField
            :label="t('Email', '电子邮件')"
            :error="fieldErrors.email"
            width="100%"
            ><input
              v-model="email"
              type="email"
              name="email"
              required
              autocomplete="email"
          /></FormField>
          <FormField
            :label="t('Language', '语言')"
            :error="fieldErrors.language"
            width="100%"
          >
            <Select
              v-model="language"
              name="language"
              required
            >
              <Option
                value="en"
                :label="t('English', '英语')"
              />
              <Option
                value="zh"
                :label="t('Chinese', '中文')"
              />
            </Select>
          </FormField>
        </FormSection>
        <FormSection :title="t('Workspace', '工作区')">
          <NumberField
            v-model="seats"
            :label="t('Seats', '席位数')"
            name="seats"
            :locale="fieldLocale"
            :min="1"
            :max="10"
            required
            :error="fieldErrors.seats || false"
            width="100%"
          />
        </FormSection>
      </template>
      <template #actions="{ pending }">
        <Button
          type="submit"
          name="intent"
          value="save"
          :disabled="pending"
          >{{ t('Save settings', '保存设置') }}</Button
        >
        <Button
          type="reset"
          variant="text"
          >{{ t('Reset settings', '重置设置') }}</Button
        >
      </template>
    </Form>
    <div
      v-if="response"
      class="form-demo__response"
    >
      <p>
        {{
          t(
            'You can keep editing while waiting. Finish this response to see whether it still belongs to the current values.',
            '等待时可以继续编辑。完成响应后，可观察它是否仍属于当前输入。',
          )
        }}
      </p>
      <div class="form-demo__response-actions">
        <Button @click="onComplete">{{ t('Return success', '返回成功') }}</Button
        ><Button
          variant="outlined"
          @click="onReject"
          >{{ t('Return failure', '返回失败') }}</Button
        >
      </div>
    </div>
    <dl
      class="form-demo__log"
      :aria-label="t('Scenario log', '场景记录')"
    >
      <div>
        <dt>{{ t('Submissions sent', '已发送提交') }}</dt>
        <dd data-testid="form-requests">{{ requests }}</dd>
      </div>
      <div>
        <dt>{{ t('Accepted submissions', '已接受提交') }}</dt>
        <dd data-testid="form-successes">{{ successes }}</dd>
      </div>
      <div>
        <dt>{{ t('Stale replies discarded', '已丢弃过期响应') }}</dt>
        <dd data-testid="form-outdated">{{ outdated }}</dd>
      </div>
      <div>
        <dt>{{ t('Latest request snapshot', '最近一次请求快照') }}</dt>
        <dd>
          <code data-testid="form-request">{{ latestRequest || '—' }}</code>
        </dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.form-demo {
  display: grid;
  gap: 24px;
}
.form-demo__scenarios {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 24px;
}
.form-demo__scenario {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-inline-size: 0;
}
.form-demo__caption {
  margin: 0;
  font-weight: 500;
}
.form-demo__note,
.form-demo__response p {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  overflow-wrap: anywhere;
}
.form-demo__response {
  display: grid;
  gap: 16px;
}
.form-demo__response-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.form-demo__log {
  display: grid;
  gap: 8px;
  margin: 0;
  overflow-wrap: anywhere;
}
.form-demo__log div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.form-demo__log dt {
  color: var(--md-sys-color-on-surface-variant);
}
.form-demo__log dd {
  margin: 0;
}
</style>
