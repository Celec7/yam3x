<script setup lang="ts">
import { ref } from 'vue'
import NavigationBar from '@registry/components/navigation-bar/navigation-bar.vue'
import NavigationBarItem from '@registry/components/navigation-bar/navigation-bar-item.vue'
import { Icon } from '@registry/components/icon'
import Switch from '@registry/components/switch/switch.vue'
import type { NavigationBarDestination } from '@registry/components/navigation-bar/navigation-bar.types'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()
const current = ref('overview')
const allowNavigation = ref(false)
const status = ref('')

function onNavigate(destination: NavigationBarDestination, event: MouseEvent) {
  if (!allowNavigation.value) {
    event.preventDefault()
    status.value = t(
      `Cancelled navigation to ${destination.label}`,
      `已取消前往${destination.label}的导航`,
    )
    return
  }
  status.value = t(
    `Navigation allowed to ${destination.label}`,
    `已允许前往${destination.label}的导航`,
  )
}
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <NavigationBar
      v-model="current"
      :label="t('Cancellable navigation', '可取消导航')"
      @navigate="onNavigate"
    >
      <NavigationBarItem
        value="overview"
        :label="t('Overview', '概览')"
        href="#navigation-bar-navigate"
      >
        <template #icon="{ selected }">
          <Icon
            name="dashboard"
            :filled="selected"
          />
        </template>
      </NavigationBarItem>
      <NavigationBarItem
        value="components"
        :label="t('Components', '组件')"
        href="#navigation-bar-navigate"
      >
        <template #icon="{ selected }">
          <Icon
            name="widgets"
            :filled="selected"
          />
        </template>
      </NavigationBarItem>
      <NavigationBarItem
        value="foundations"
        :label="t('Design foundations', '设计基础')"
        href="#navigation-bar-navigate"
      >
        <template #icon="{ selected }">
          <Icon
            name="architecture"
            :filled="selected"
          />
        </template>
      </NavigationBarItem>
    </NavigationBar>
    <Switch
      v-model="allowNavigation"
      :label="t('Allow navigation', '允许导航')"
      :description="
        t(
          'Turn off to cancel the selection and the native link navigation.',
          '关闭后会取消选择和原生链接导航。',
        )
      "
      data-testid="navigation-bar-allow-navigation"
    />
    <p
      class="yam3x-demo__status"
      data-testid="navigation-bar-navigate-status"
    >
      {{
        status ||
        t('Activate a destination to see the navigate event.', '激活目的地以查看 navigate 事件。')
      }}
    </p>
    <p
      class="yam3x-demo__status"
      data-testid="navigation-bar-navigate-selection"
    >
      {{ t('Current destination:', '当前目的地：') }} {{ current }}
    </p>
  </div>
</template>
