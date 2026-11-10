<script setup lang="ts">
import { ref } from 'vue'
import { FormField } from '@registry/components/form-field'
import { Option, OptionGroup } from '@registry/components/option'
import { Button } from '@registry/components/button'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const language = ref('typescript')
const filters = ref<string[]>(['stable'])
const requiredValue = ref<string | null>(null)
const releaseStatus = ref('')
const selectionEvents = ref<string[]>([])
const demoForm = ref<HTMLFormElement | null>(null)
const plan = ref<string | string[] | null>('team')
const hideIndicators = ref(false)
const plans = [
  { value: 'starter', label: t('Starter', '入门') },
  { value: 'team', label: t('Team', '团队') },
  { value: 'enterprise', label: t('Enterprise', '企业'), disabled: true },
]

function planLabel(value: string | string[] | null) {
  if (typeof value !== 'string') return t('Choose a plan', '请选择套餐')
  return plans.find((item) => item.value === value)?.label ?? value
}

function record(event: string) {
  selectionEvents.value = [...selectionEvents.value.slice(-5), event]
}

function submitRelease() {
  const valid = demoForm.value?.checkValidity() ?? false
  releaseStatus.value = valid
    ? t('Release status submitted.', '已提交发布状态。')
    : t('Choose a release status before submitting.', '提交前请选择发布状态。')
}
</script>

<template>
  <section
    class="select-demo"
    data-testid="select-example"
  >
    <form
      id="select-demo-form"
      ref="demoForm"
      @submit.prevent="submitRelease"
    >
      <section class="select-demo__scenario">
        <p class="select-demo__caption">{{ t('Single selection', '单选') }}</p>
        <FormField
          :label="t('Default language', '默认语言')"
          :hint="
            t('Choose the project’s primary programming language.', '选择项目的主要开发语言。')
          "
        >
          <Select
            v-model="language"
            name="language"
            required
            @open="record('open')"
            @close="record('close')"
            @change="(detail) => record(`change:${detail.value}`)"
          >
            <OptionGroup :label="t('Frontend', '前端')">
              <Option
                value="typescript"
                label="TypeScript"
              />
              <Option
                value="javascript"
                label="JavaScript"
              />
            </OptionGroup>
            <OptionGroup :label="t('Other', '其他')">
              <Option
                value="python"
                label="Python"
              />
              <Option
                value="rust"
                label="Rust"
              />
              <Option
                value="disabled"
                :label="t('Unavailable', '暂不可用')"
                disabled
              />
            </OptionGroup>
          </Select>
        </FormField>
      </section>

      <section class="select-demo__scenario">
        <p class="select-demo__caption">{{ t('Multiple selection', '多选') }}</p>
        <FormField
          :label="t('Release channels', '发布渠道')"
          :hint="t('You can select multiple channels.', '可以同时选择多个渠道。')"
        >
          <Select
            v-model="filters"
            name="channels"
            multiple
          >
            <Option
              value="stable"
              :label="t('Stable', '稳定版')"
            />
            <Option
              value="beta"
              :label="t('Beta', '测试版')"
            />
            <Option
              value="nightly"
              :label="t('Nightly', '每日构建版')"
            />
          </Select>
        </FormField>
      </section>

      <section
        class="select-demo__scenario"
        data-testid="select-required"
      >
        <p class="select-demo__caption">{{ t('Required selection with submit', '必选与提交') }}</p>
        <FormField
          id="required-select"
          :label="t('Required release status', '必选发布状态')"
        >
          <Select
            v-model="requiredValue"
            name="release-status"
            required
          >
            <Option
              value="draft"
              :label="t('Draft', '草稿')"
            />
            <Option
              value="published"
              :label="t('Published', '已发布')"
            />
          </Select>
        </FormField>
        <Button type="submit">{{ t('Submit release', '提交发布状态') }}</Button>
        <p
          class="select-demo__status"
          aria-live="polite"
        >
          {{ releaseStatus }}
        </p>
      </section>
    </form>

    <section class="select-demo__scenario">
      <p class="select-demo__caption">
        {{ t('Associated with an external form', '关联外部表单') }}
      </p>
      <FormField :label="t('External form', '外置表单')">
        <Select
          model-value="external"
          name="external-choice"
          form="external-select-form"
        >
          <Option
            value="external"
            :label="t('Externally associated value', '外部关联值')"
          />
        </Select>
      </FormField>
      <form id="external-select-form"></form>
    </section>

    <section class="select-demo__scenario">
      <p class="select-demo__caption">{{ t('Empty catalog', '空目录') }}</p>
      <FormField :label="t('No options', '暂无选项')">
        <Select>
          <template #no-data>{{ t('No options available', '暂无可选项') }}</template>
        </Select>
      </FormField>
    </section>

    <section class="select-demo__scenario">
      <p class="select-demo__caption">
        {{ t('Custom trigger and option content', '自定义触发器与选项内容') }}
      </p>
      <FormField :label="t('Plan', '套餐')">
        <Select
          v-model="plan"
          :options="plans"
          :hide-selection-indicator="hideIndicators"
        >
          <template #value="{ value }">
            <strong>{{ planLabel(value) }}</strong>
          </template>
          <template #arrow>
            <span aria-hidden="true">▾</span>
          </template>
        </Select>
      </FormField>
      <Checkbox
        v-model="hideIndicators"
        :label="t('Hide selection indicators', '隐藏选中指示器')"
      />
    </section>

    <section class="select-demo__scenario">
      <p class="select-demo__caption">{{ t('Disabled', '已禁用') }}</p>
      <FormField :label="t('Disabled', '已禁用')">
        <Select
          model-value="locked"
          disabled
        >
          <Option
            value="locked"
            :label="t('Locked', '已锁定')"
          />
        </Select>
      </FormField>
    </section>

    <output aria-live="polite"
      >{{ t('Single:', '单选：') }} {{ language }} · {{ t('Multiple:', '多选：') }}
      {{ filters.join(', ') || t('None', '无') }} · {{ t('Required:', '必选项：') }}
      {{ requiredValue || t('None', '无') }} · {{ t('Events:', '事件：') }}
      {{ selectionEvents.join(' → ') || t('None', '无') }}</output
    >
  </section>
</template>

<style scoped>
.select-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
}
.select-demo form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  inline-size: 100%;
}
.select-demo__scenario {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  min-inline-size: 0;
}
.select-demo__caption {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
}
.select-demo :deep(.yam3x-form-field) {
  inline-size: min(100%, 320px);
}
.select-demo__status {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
.select-demo output {
  flex-basis: 100%;
  overflow-wrap: anywhere;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
