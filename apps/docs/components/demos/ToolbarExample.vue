<script setup lang="ts">
import { computed, ref } from 'vue'
import { Checkbox } from '@registry/components/checkbox'
import { Select } from '@registry/components/select'
import { Option } from '@registry/components/option'
import { Toolbar } from '@registry/components/toolbar'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import { useDemoLocale } from './use-demo-locale'
import { Icon } from '@registry/components/icon'

const { t } = useDemoLocale()

const layout = ref<'floating' | 'docked'>('floating')
const variant = ref<'standard' | 'vibrant'>('standard')
const shape = ref<'auto' | 'rounded' | 'square'>('auto')
const elevation = ref<'auto' | 'on' | 'off'>('auto')
const vertical = ref(false)
const lastAction = ref('')
const standardActionColor = computed(() =>
  variant.value === 'vibrant'
    ? 'var(--md-sys-color-on-primary-container)'
    : 'var(--md-sys-color-primary)',
)
</script>

<template>
  <div class="yam3x-demo yam3x-demo__stack toolbar-demo">
    <div class="toolbar-demo__controls">
      <label
        >{{ t('Layout', '布局') }}
        <Select
          v-model="layout"
          :aria-label="t('Toolbar layout', '工具栏布局')"
        >
          <Option
            value="floating"
            :label="t('Floating', '浮动')"
          />
          <Option
            value="docked"
            :label="t('Docked', '停靠')"
          />
        </Select>
      </label>
      <label
        >{{ t('Color', '颜色') }}
        <Select
          v-model="variant"
          :aria-label="t('Toolbar color', '工具栏颜色')"
        >
          <Option
            value="standard"
            :label="t('Standard', '标准')"
          />
          <Option
            value="vibrant"
            :label="t('Vibrant', '鲜明')"
          />
        </Select>
      </label>
      <label
        >{{ t('Shape', '形状') }}
        <Select
          v-model="shape"
          :aria-label="t('Toolbar shape', '工具栏形状')"
        >
          <Option
            value="auto"
            :label="t('Auto', '自动')"
          />
          <Option
            value="rounded"
            :label="t('Rounded', '圆角')"
          />
          <Option
            value="square"
            :label="t('Square', '方角')"
          />
        </Select>
      </label>
      <label
        >{{ t('Elevation', '阴影') }}
        <Select
          v-model="elevation"
          :aria-label="t('Toolbar elevation', '工具栏阴影')"
        >
          <Option
            value="auto"
            :label="t('Auto', '自动')"
          />
          <Option
            value="on"
            :label="t('On', '显示')"
          />
          <Option
            value="off"
            :label="t('Off', '隐藏')"
          />
        </Select>
      </label>
      <Checkbox
        v-model="vertical"
        :label="t('Vertical', '纵向')"
        :disabled="layout === 'docked'"
      />
    </div>
    <div class="toolbar-demo__stage">
      <Toolbar
        data-testid="toolbar"
        :aria-label="t('Article actions', '文章操作')"
        :layout="layout"
        :variant="variant"
        :shape="shape === 'auto' ? undefined : shape"
        :elevated="elevation === 'auto' ? undefined : elevation === 'on'"
        :vertical="vertical"
      >
        <IconButton
          data-testid="toolbar-back"
          variant="standard"
          :style="{ color: standardActionColor }"
          :aria-label="t('Back', '返回')"
          @click="lastAction = t('Back', '返回')"
          ><Icon name="arrow_back"
        /></IconButton>
        <IconButton
          data-testid="toolbar-save"
          variant="standard"
          :style="{ color: standardActionColor }"
          :aria-label="t('Save', '保存')"
          @click="lastAction = t('Save', '保存')"
          ><Icon name="save"
        /></IconButton>
        <IconButton
          data-testid="toolbar-share"
          variant="filled"
          :aria-label="t('Share', '分享')"
          @click="lastAction = t('Share', '分享')"
          ><Icon name="share"
        /></IconButton>
      </Toolbar>
    </div>
    <output aria-live="polite">{{ lastAction }}</output>
  </div>
</template>

<style scoped>
.toolbar-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
.toolbar-demo__controls label {
  display: flex;
  gap: 8px;
  align-items: center;
}
.toolbar-demo__stage {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
}
.toolbar-demo__stage > * {
  flex-shrink: 0;
}
</style>
