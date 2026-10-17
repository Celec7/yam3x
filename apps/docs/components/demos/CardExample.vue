<script setup lang="ts">
import { ref } from 'vue'
import Card from '@registry/components/card/card.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const opened = ref(0)
const blocked = ref(0)
const passiveClicks = ref(0)
const submitted = ref('')

function submitCard(event: SubmitEvent) {
  const submitter = event.submitter as HTMLButtonElement | null
  submitted.value = submitter ? `${submitter.name}=${submitter.value}` : ''
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <Card
      variant="elevated"
      @click="passiveClicks++"
    >
      <template #content>
        <strong>{{ t('Today’s plan', '今日计划') }}</strong>
        <p>{{ t('Continue reading the chapter you last saved.', '继续阅读上次保存的章节。') }}</p>
      </template>
    </Card>
    <Card variant="filled">
      {{
        t('Default text content uses the 16px card inset.', '默认文本内容使用 16px 卡片内边距。')
      }}
    </Card>
    <p>
      <Card
        variant="outlined"
        orientation="horizontal"
        inline
      >
        <template #header
          ><strong>{{ t('Cover', '封面') }}</strong></template
        >
        <template #content>
          <strong>{{ t('Horizontal card', '横向卡片') }}</strong>
          <p>{{ t('Structured slots use 16px spacing.', '结构化 slot 使用 16px 间距。') }}</p>
        </template>
        <template #actions
          ><span>{{ t('Open', '打开') }}</span></template
        >
        <template #footer
          ><small>{{ t('Updated today', '今天更新') }}</small></template
        >
      </Card>
    </p>
    <Card
      variant="outlined"
      interactive
      :aria-label="t('Open reading plan', '打开阅读计划')"
      @click="opened++"
    >
      <template #content>
        <strong>{{ t('Reading plan', '阅读计划') }}</strong>
        <p>{{ t('Select this card to open details.', '选择此卡片可打开详细信息。') }}</p>
      </template>
    </Card>
    <Card
      variant="filled"
      interactive
      disabled-interactive
      :aria-label="t('Processing', '正在处理')"
      @click="blocked++"
    >
      <template #content>
        <strong>{{ t('Processing', '正在处理') }}</strong>
        <p>
          {{ t('It keeps keyboard focus but does not activate.', '保留键盘焦点，但不会激活。') }}
        </p>
      </template>
    </Card>
    <Card
      href="/components/"
      disabled-interactive
      :aria-label="t('Unavailable card link', '暂不可用的卡片链接')"
    >
      {{ t('Unavailable link destination', '暂不可用的链接目标') }}
    </Card>
    <form
      class="yam3x-demo__card-form"
      @submit.prevent="submitCard"
    >
      <Card
        interactive
        type="submit"
        name="intent"
        value="open"
        :aria-label="t('Submit card form', '提交卡片表单')"
      >
        <template #content>{{
          t('Submitting this card sends intent=open.', '提交此卡片会发送 intent=open。')
        }}</template>
      </Card>
    </form>
    <form
      class="yam3x-demo__card-form"
      @submit.prevent
    >
      <label
        >{{ t('Reset test', '重置测试') }}
        <input
          :aria-label="t('Reset test content', '重置测试内容')"
          :value="t('Default value', '默认值')"
      /></label>
      <Card
        interactive
        type="reset"
        :aria-label="t('Reset card form', '重置卡片表单')"
      >
        <template #content>{{
          t('Restore the initial values of form fields.', '恢复表单字段的初始值。')
        }}</template>
      </Card>
    </form>
    <p class="yam3x-demo__status">{{ t('Card opened', '卡片已打开') }} {{ opened }}</p>
    <p class="yam3x-demo__status">
      {{ t('Disabled card activations', '禁用卡片激活') }} {{ blocked }}
    </p>
    <p class="yam3x-demo__status">
      {{ t('Passive card activations', '被动卡片激活') }} {{ passiveClicks }}
    </p>
    <p
      class="yam3x-demo__status"
      aria-live="polite"
    >
      {{ t('Form submission value:', '表单提交值：') }} {{ submitted || t('None', '无') }}
    </p>
  </div>
</template>
