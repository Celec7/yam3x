<script setup lang="ts">
import { ref } from 'vue'
import IconButton from '@registry/components/icon-button/icon-button.vue'
import IconToggleButton from '@registry/components/icon-button/icon-toggle-button.vue'
import { Icon } from '@registry/components/icon'
import { Tooltip } from '@registry/components/tooltip'
import { useDemoLocale } from './use-demo-locale'

const { t } = useDemoLocale()

const favorite = ref(false)
const pinned = ref(false)
const iconButtonSizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const
const iconButtonWidths = ['narrow', 'default', 'wide'] as const
</script>

<template>
  <div class="yam3x-demo yam3x-demo__row">
    <IconButton
      id="icon-button-search"
      :aria-label="t('Search', '搜索')"
      variant="standard"
    >
      <Icon
        name="search"
        filled
      />
    </IconButton>
    <Tooltip for="icon-button-search">{{ t('Search', '搜索') }}</Tooltip>
    <IconToggleButton
      id="icon-button-favorite"
      v-model:checked="favorite"
      :aria-label="t('Favorite', '收藏')"
      variant="tonal"
    >
      <Icon name="favorite" />
      <template #selected-icon>
        <Icon
          name="favorite"
          filled
        />
      </template>
    </IconToggleButton>
    <Tooltip for="icon-button-favorite">{{ t('Favorite', '收藏') }}</Tooltip>
    <IconToggleButton
      id="icon-button-filled-toggle"
      v-model:checked="pinned"
      variant="filled"
      :aria-label="t('Pin item', '固定项目')"
    >
      <Icon name="push_pin" />
      <template #selected-icon>
        <Icon
          name="push_pin"
          filled
        />
      </template>
    </IconToggleButton>
    <Tooltip for="icon-button-filled-toggle">{{ t('Pin item', '固定项目') }}</Tooltip>
    <IconButton
      id="icon-button-details"
      variant="outlined"
      :aria-label="t('View details', '查看详情')"
    >
      <Icon
        name="info"
        filled
      />
    </IconButton>
    <Tooltip for="icon-button-details">{{ t('View details', '查看详情') }}</Tooltip>
    <IconButton
      id="icon-button-more"
      variant="filled"
      :aria-label="t('More options', '更多选项')"
    >
      <Icon
        name="more_horiz"
        filled
      />
    </IconButton>
    <Tooltip for="icon-button-more">{{ t('More options', '更多选项') }}</Tooltip>
    <IconButton
      id="icon-button-disabled-interactive"
      disabled-interactive
      :aria-label="t('Sign in to add to favorites', '收藏需要登录')"
    >
      <Icon
        name="favorite"
        filled
      />
    </IconButton>
    <Tooltip for="icon-button-disabled-interactive">{{
      t('Sign in to add to favorites', '收藏需要登录')
    }}</Tooltip>
    <span class="yam3x-demo__status">{{
      favorite ? t('Added to favorites', '已收藏') : t('Not favorited', '未收藏')
    }}</span>
  </div>
  <div class="yam3x-demo">
    <div
      v-for="size in iconButtonSizes"
      :key="size"
      class="yam3x-demo__row"
    >
      <span>{{ size }}</span>
      <IconButton
        v-for="width in iconButtonWidths"
        :id="`icon-button-${size}-${width}`"
        :key="width"
        :size="size"
        :width="width"
        :aria-label="t(`Add item, ${size} ${width}`, `添加项目，${size} ${width}`)"
      >
        <Icon
          name="add"
          filled
        />
      </IconButton>
      <Tooltip
        v-for="width in iconButtonWidths"
        :key="`tooltip-${width}`"
        :for="`icon-button-${size}-${width}`"
        >{{ t(`Add item, ${size} ${width}`, `添加项目，${size} ${width}`) }}</Tooltip
      >
    </div>
  </div>
</template>
