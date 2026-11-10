<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Shape, shapeNames, type ShapeName } from '@registry/components/shape'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const first = ref<ShapeName>('sunny')
const second = ref<ShapeName>('heart')
const gallery = shapeNames
</script>

<template>
  <div class="shape-demo">
    <section class="shape-demo__basic">
      <Shape
        name="sunny"
        aria-hidden="true"
        data-testid="shape-basic"
      />
      <Shape
        name="pill"
        aria-hidden="true"
        class="shape-demo__media"
      >
        <img
          src="/avatar-example.svg"
          alt=""
        />
      </Shape>
      <Shape
        name="soft-burst"
        aria-hidden="true"
        class="shape-demo__tinted"
      />
      <p>{{ t('Default shape, media mask, and custom fill', '默认形状、媒体遮罩与自定义填充') }}</p>
    </section>

    <section class="shape-demo__controls">
      <label>
        {{ t('From shape', '起始形状') }}
        <Select
          v-model="first"
          :aria-label="t('From shape', '起始形状')"
        >
          <Option
            v-for="name in gallery"
            :key="name"
            :value="name"
            :label="name"
          />
        </Select>
      </label>
      <label>
        {{ t('To shape', '目标形状') }}
        <Select
          v-model="second"
          :aria-label="t('To shape', '目标形状')"
        >
          <Option
            v-for="name in gallery"
            :key="name"
            :value="name"
            :label="name"
          />
        </Select>
      </label>
      <Shape
        :name="first"
        aria-hidden="true"
        class="shape-demo__large"
        ><img
          src="/avatar-example.svg"
          alt=""
      /></Shape>
      <Shape
        :name="second"
        aria-hidden="true"
        class="shape-demo__large"
        ><img
          src="/avatar-example.svg"
          alt=""
      /></Shape>
    </section>

    <section
      class="shape-demo__gallery"
      :aria-label="t('35 Material decorative shapes', '35 种 Material 装饰形状')"
    >
      <h4 class="shape-demo__gallery-title">
        {{ t('All 35 names', '全部 35 个名称') }}
      </h4>
      <div
        v-for="name in gallery"
        :key="name"
        class="shape-demo__item"
      >
        <Shape
          :name="name"
          aria-hidden="true"
        />
        <code>{{ name }}</code>
      </div>
    </section>
  </div>
</template>

<style scoped>
.shape-demo {
  display: grid;
  gap: 28px;
}
.shape-demo__basic {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}
.shape-demo__basic p {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
}
.shape-demo__media {
  --yam3x-shape-size: 72px;
}
.shape-demo__tinted {
  --yam3x-shape-container-color: var(--md-sys-color-tertiary-container, #ffd8e4);
}
.shape-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 16px;
}
.shape-demo__controls label {
  display: grid;
  gap: 8px;
}
.shape-demo__large {
  width: 96px;
  --yam3x-shape-size: 96px;
  --yam3x-shape-container-color: var(--md-sys-color-tertiary-container, #ffd8e4);
}
.shape-demo__gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 18px 12px;
}
.shape-demo__gallery-title {
  grid-column: 1 / -1;
  margin: 0;
}
.shape-demo__item {
  display: grid;
  min-height: 92px;
  justify-items: center;
  align-content: start;
  gap: 8px;
}
.shape-demo__item code {
  max-width: 100%;
  overflow-wrap: anywhere;
  text-align: center;
  font-size: 12px;
}
</style>
