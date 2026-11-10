<script setup lang="ts">
import { Icon } from '@registry/components/icon'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const sizes = [18, 24, 36, 48]
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack icon-basic">
    <div class="yam3x-demo__row">
      <Icon
        data-testid="icon-person"
        name="person"
        :aria-label="t('Person', '人员')"
      />
      <span class="icon-basic__note">{{
        t(
          'A label exposes an image name; without one the icon stays decorative.',
          '传入标签会暴露图像名称；未传入时图标保持装饰语义。',
        )
      }}</span>
    </div>
    <div class="yam3x-demo__row">
      <p class="icon-basic__assigned">
        <Icon
          data-testid="icon-decorative"
          name="person"
          aria-hidden="true"
        />
        {{ t('Assigned to Ana', '已分配给 Ana') }}
      </p>
    </div>
    <div class="yam3x-demo__row icon-basic__sizes">
      <Icon
        v-for="size in sizes"
        :key="size"
        name="person"
        aria-hidden="true"
        :style="{ '--yam3x-icon-size': `${size}px` }"
      />
    </div>
  </div>
</template>

<style scoped>
.icon-basic__note {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 14px;
}
.icon-basic__assigned {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.icon-basic__sizes {
  align-items: center;
  min-height: 56px;
  gap: 28px;
}
</style>
