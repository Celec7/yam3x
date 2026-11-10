<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { Switch } from '@registry/components/switch'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const initial = { announcements: false, beta: true }
const announcements = ref(initial.announcements)
const beta = ref(initial.beta)
const submitted = ref('')
const message = ref('')

function submit(form: HTMLFormElement | null): void {
  if (!form) return
  const data = new FormData(form)
  submitted.value = [
    `${t('Announcements', '公告')}: ${data.get('announcements') ?? t('Off', '关闭')}`,
    `${t('Beta features', '测试功能')}: ${data.get('beta') ?? t('Off', '关闭')}`,
  ].join(' · ')
  message.value = ''
}

function onInvalid(): void {
  message.value = t(
    'Enable announcements before submitting this form.',
    '提交此表单前请先开启公告。',
  )
}

function reset(): void {
  announcements.value = initial.announcements
  beta.value = initial.beta
  submitted.value = ''
  message.value = ''
}
</script>

<template>
  <section
    data-testid="switch-form"
    class="yam3x-demo yam3x-demo__stack switch-form-demo"
  >
    <form
      id="switch-form-example"
      class="switch-form-demo__form"
      @submit.prevent="submit($event.currentTarget as HTMLFormElement)"
      @reset.prevent="reset"
      @invalid.capture="onInvalid"
    >
      <Switch
        v-model="announcements"
        name="announcements"
        required
        :label="t('Product announcements', '产品公告')"
        :description="t('Required before this form can be submitted', '提交此表单前必须开启')"
      />
      <Switch
        v-model="beta"
        name="beta"
        :label="t('Beta features', '测试功能')"
        :description="t('Takes effect immediately for this account', '对此账户立即生效')"
      />
      <div class="switch-form-demo__actions">
        <Button type="submit">{{ t('Submit', '提交') }}</Button>
        <Button
          variant="text"
          type="reset"
          >{{ t('Reset', '重置') }}</Button
        >
      </div>
      <p
        v-if="message"
        class="switch-form-demo__message"
        role="alert"
      >
        {{ message }}
      </p>
      <output
        v-if="submitted"
        data-testid="switch-form-submitted"
        aria-live="polite"
        >{{ t('Submitted:', '已提交：') }} {{ submitted }}</output
      >
    </form>
    <fieldset
      class="switch-form-demo__fieldset"
      disabled
    >
      <legend>{{ t('Disabled by a fieldset', '由 fieldset 禁用') }}</legend>
      <Switch
        :model-value="true"
        :label="t('Managed by the account owner', '由账户所有者管理')"
        :description="t('This setting cannot be changed here', '无法在此更改此设置')"
      />
    </fieldset>
  </section>
</template>

<style scoped>
.switch-form-demo__form,
.switch-form-demo__fieldset {
  display: grid;
  gap: 16px;
  justify-items: start;
}
.switch-form-demo__fieldset {
  margin: 0;
  padding-block-start: 16px;
  border: 0;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}
.switch-form-demo__fieldset legend {
  padding: 0;
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-label-large);
}
.switch-form-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.switch-form-demo__message {
  margin: 0;
  color: var(--md-sys-color-error);
  font: var(--md-sys-typescale-body-medium);
}
.switch-form-demo output {
  font: var(--md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
