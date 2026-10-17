<script setup lang="ts">
import { ref } from 'vue'
import InputChip from '@registry/components/chips/input-chip.vue'
import InputChipSet from '@registry/components/chips/input-chip-set.vue'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const names = ref(['Material', 'Vue'])
const compactNames = ref(['Material', 'Vue', 'Expressive'])
const verticalNames = ref(['Design', 'Research'])
const reviewNeeded = ref(false)
const actionOnlyClicks = ref(0)
</script>

<template>
  <div class="yam3x-demo yam3x-demo__row">
    <InputChip
      v-model:selected="reviewNeeded"
      :label="t('Review needed', '需要审核')"
    />
    <span class="yam3x-demo__status">
      {{ t('Standalone selected:', '独立芯片选中：') }}
      {{ reviewNeeded ? t('yes', '是') : t('no', '否') }}
    </span>
    <InputChip
      :label="t('Action only', '仅执行操作')"
      @click.prevent="actionOnlyClicks++"
    />
    <span class="yam3x-demo__status">
      {{ t('Action-only clicks:', '仅操作点击次数：') }} {{ actionOnlyClicks }}
    </span>
  </div>
  <div class="yam3x-demo">
    <InputChipSet
      v-model="names"
      :label="t('Participants', '参与者')"
      :placeholder="t('Add participants', '添加参与者')"
      reorderable
    />
    <p class="yam3x-demo__status">
      {{
        t(
          'Reorder chips by dragging or with Alt + arrow keys.',
          '可拖动芯片，或使用 Alt + 方向键重排。',
        )
      }}
    </p>
    <p class="yam3x-demo__status">
      {{ t('Current value:', '当前值：') }} {{ names.join(', ') || t('None', '无') }}
    </p>
    <InputChipSet
      v-model="compactNames"
      :label="t('Compact values', '紧凑值')"
      :placeholder="t('Add a value', '添加值')"
      :max-chips="2"
    />
    <InputChipSet
      v-model="verticalNames"
      :label="t('Vertical values', '纵向值')"
      :placeholder="t('Add a value', '添加值')"
      vertical
    />
  </div>
</template>
