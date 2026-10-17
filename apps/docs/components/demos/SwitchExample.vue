<script setup lang="ts">
import { ref } from 'vue'
import Switch from '@registry/components/switch/switch.vue'
import Icon from '@registry/components/icon/icon.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const notifications = ref(true)
const location = ref(false)
const sync = ref(true)
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack">
    <Switch
      v-model="notifications"
      :label="t('Notifications', '通知')"
      :description="t('Receive important updates', '接收重要更新')"
    />
    <Switch
      v-model="location"
      :label="t('Location services', '位置服务')"
      icons="both"
    />
    <Switch
      v-model="sync"
      :label="t('Sync across devices', '跨设备同步')"
      icons="both"
    >
      <template #thumb-content="{ checked }">
        <Icon
          :name="checked ? 'check' : 'close'"
          :data-demo-state="checked ? 'checked' : 'unchecked'"
          class="yam3x-switch__icon"
        />
      </template>
    </Switch>
    <Switch
      disabled
      icons="both"
      :label="t('Unavailable setting', '不可用的设置')"
    />
    <p class="yam3x-demo__status">
      {{ t('Notifications:', '通知：') }} {{ notifications ? t('On', '开启') : t('Off', '关闭') }};
      {{ t('Location:', '位置：') }} {{ location ? t('On', '开启') : t('Off', '关闭') }};
      {{ t('Sync:', '同步：') }} {{ sync ? t('On', '开启') : t('Off', '关闭') }}
    </p>
  </div>
</template>
