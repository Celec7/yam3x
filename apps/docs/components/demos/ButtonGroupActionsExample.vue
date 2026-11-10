<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@registry/components/button'
import { ButtonGroup, ButtonGroupItem } from '@registry/components/button-group'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const lastAction = ref('')

function onActivate({ value }: { value: string }) {
  lastAction.value = value
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <ButtonGroup
      label="Document actions"
      @activate="onActivate"
    >
      <ButtonGroupItem
        value="save"
        label="Save"
      >
        <Button variant="filled">
          <template #icon><Icon name="save" /></template>
          {{ t('Save', '保存') }}
        </Button>
      </ButtonGroupItem>
      <ButtonGroupItem
        value="share"
        label="Share"
      >
        <Button variant="filled-tonal">
          <template #icon><Icon name="share" /></template>
          {{ t('Share', '共享') }}
        </Button>
      </ButtonGroupItem>
      <ButtonGroupItem
        value="archive"
        label="Archive"
      >
        <Button
          variant="outlined"
          disabled
        >
          <template #icon><Icon name="inbox" /></template>
          {{ t('Archive', '归档') }}
        </Button>
      </ButtonGroupItem>
    </ButtonGroup>
    <ButtonGroup
      label="Centered actions"
      justify="center"
      :gap="8"
      @activate="onActivate"
    >
      <ButtonGroupItem
        value="preview"
        label="Preview"
      >
        <Button variant="text">{{ t('Preview', '预览') }}</Button>
      </ButtonGroupItem>
      <ButtonGroupItem
        value="publish"
        label="Publish"
      >
        <Button variant="text">{{ t('Publish', '发布') }}</Button>
      </ButtonGroupItem>
    </ButtonGroup>
    <p class="yam3x-demo__status">
      {{ t('Last action:', '上次操作：') }} {{ lastAction || t('None', '无') }}
    </p>
  </div>
</template>
