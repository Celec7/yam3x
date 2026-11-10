<script setup lang="ts">
import { Button } from '@registry/components/button'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
</script>

<template>
  <div
    class="yam3x-demo yam3x-demo__row"
    data-testid="button-variants"
  >
    <Button variant="filled">{{ t('Save', '保存') }}</Button>
    <Button variant="filled-tonal">{{ t('Later', '稍后') }}</Button>
    <Button variant="elevated">{{ t('View', '查看') }}</Button>
    <Button variant="outlined">{{ t('Cancel', '取消') }}</Button>
    <Button variant="text">{{ t('Learn more', '了解更多') }}</Button>
  </div>
</template>
