<script setup lang="ts">
import { ref } from 'vue'
import { EmptyState } from '@registry/components/empty-state'
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const chosen = ref('')
</script>

<template>
  <div
    class="yam3x-demo empty-state-illustration-demo"
    data-testid="empty-state-illustration"
  >
    <section :aria-label="t('Team invitations', '团队邀请')">
      <EmptyState
        class="empty-state-illustration-demo__state"
        :title="t('No teammates yet', '还没有团队成员')"
        :description="
          t(
            'Invite people who should share this workspace. They will appear here after accepting.',
            '邀请需要共享此工作区的人。接受邀请后，他们会显示在这里。',
          )
        "
      >
        <template #illustration>
          <svg
            class="empty-state-illustration-demo__art"
            viewBox="0 0 160 96"
            aria-hidden="true"
            focusable="false"
          >
            <rect
              x="8"
              y="20"
              width="144"
              height="64"
              rx="20"
              fill="currentColor"
              opacity="0.12"
            />
            <circle
              cx="56"
              cy="48"
              r="16"
              fill="currentColor"
              opacity="0.4"
            />
            <circle
              cx="104"
              cy="48"
              r="16"
              fill="currentColor"
              opacity="0.7"
            />
            <path
              d="M32 84c3-12 11-18 24-18s21 6 24 18"
              fill="currentColor"
              opacity="0.4"
            />
            <path
              d="M80 84c3-12 11-18 24-18s21 6 24 18"
              fill="currentColor"
              opacity="0.7"
            />
          </svg>
        </template>
        <template #actions>
          <Button @click="chosen = t('Invite teammate', '邀请成员')">{{
            t('Invite teammate', '邀请成员')
          }}</Button>
          <Button
            variant="text"
            @click="chosen = t('Copy invite link', '复制邀请链接')"
            >{{ t('Copy invite link', '复制邀请链接') }}</Button
          >
        </template>
      </EmptyState>
    </section>
    <section :aria-label="t('Saved views', '已保存视图')">
      <EmptyState
        :title="t('No saved views', '没有已保存视图')"
        :heading-level="4"
      >
        {{
          t(
            'Save a filter or layout to reuse it later. This compact form keeps only the title and description.',
            '保存筛选条件或布局以便以后复用。此紧凑形式只保留标题和说明。',
          )
        }}
      </EmptyState>
    </section>
    <p
      v-if="chosen"
      class="empty-state-illustration-demo__result"
    >
      {{ t('Selected action:', '已选择操作：') }} {{ chosen }}
    </p>
  </div>
</template>

<style scoped>
.empty-state-illustration-demo {
  display: grid;
  gap: 24px;
}
.empty-state-illustration-demo__state {
  --yam3x-empty-state-illustration-color: var(--md-sys-color-primary);
}
.empty-state-illustration-demo__art {
  width: 160px;
  max-inline-size: 100%;
  height: auto;
}
.empty-state-illustration-demo__result {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
</style>
