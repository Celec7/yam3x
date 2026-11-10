<script setup lang="ts">
import Card from '@registry/components/card/card.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack card-example">
    <Card variant="elevated">
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
    <Card variant="outlined">
      <template #header>
        <img
          src="/avatar-example.svg"
          alt=""
        />
      </template>
      <template #content>
        <strong>{{ t('Profile card', '个人资料卡片') }}</strong>
        <p>{{ t('Media sits flush with the card edge.', '媒体内容贴合卡片边缘。') }}</p>
      </template>
      <template #actions>
        <span>{{ t('Design', '设计') }}</span>
        <span>{{ t('Research', '研究') }}</span>
      </template>
      <template #footer>
        <small>{{ t('3 shared files', '3 个共享文件') }}</small>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card-example :deep(.yam3x-card__content p) {
  margin: 4px 0 0;
}
</style>
