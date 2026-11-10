<script setup lang="ts">
import { ref } from 'vue'
import NavigationBar from '@registry/components/navigation-bar/navigation-bar.vue'
import NavigationBarItem from '@registry/components/navigation-bar/navigation-bar-item.vue'
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const current = ref('home')
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <NavigationBar
      v-model="current"
      :label="t('Destination states', '目的地状态')"
    >
      <NavigationBarItem
        value="home"
        :label="t('Home', '首页')"
        href="#navigation-bar-states"
      >
        <template #icon="{ selected }">
          <Icon
            name="home"
            :filled="selected"
          />
        </template>
      </NavigationBarItem>
      <NavigationBarItem
        value="saved"
        :label="t('Saved', '已保存')"
        href="#navigation-bar-states"
      >
        <template #icon="{ selected }">
          <Icon
            name="bookmark"
            :filled="selected"
          />
        </template>
      </NavigationBarItem>
      <NavigationBarItem
        value="preview"
        :label="t('Preview', '预览')"
        href="#navigation-bar-states"
        disabled-interactive
        data-testid="navigation-bar-disabled-interactive-item"
      >
        <template #icon="{ selected }">
          <Icon
            name="visibility"
            :filled="selected"
          />
        </template>
      </NavigationBarItem>
      <NavigationBarItem
        value="offline"
        :label="t('Offline', '离线')"
        href="#navigation-bar-states"
        disabled
        data-testid="navigation-bar-disabled-item"
      >
        <template #icon>
          <Icon name="cloud_off" />
        </template>
      </NavigationBarItem>
    </NavigationBar>
    <p
      class="yam3x-demo__status"
      data-testid="navigation-bar-state-selection"
    >
      {{ t('Current destination:', '当前目的地：') }} {{ current }}
    </p>
    <p class="yam3x-demo__status">
      {{
        t(
          'Preview keeps Tab focus but cannot navigate. Offline is removed from sequential focus.',
          '预览项保留 Tab 焦点但无法导航；离线项已移出顺序焦点。',
        )
      }}
    </p>
  </div>
</template>
