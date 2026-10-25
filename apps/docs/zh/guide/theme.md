# 颜色与主题

组件通过语义 CSS 变量读取颜色、形状、动效、状态层和触控尺寸。安装组件时，CLI 会把这些基础源码复制到目标应用。设计原则与官方规范入口见[设计基础](/zh/guide/design)。颜色角色与动态配色参阅 Material 的[颜色规范](https://m3.material.io/styles/color/overview)。

## 动态颜色

<ThemeExample />

<<< ../../components/demos/ThemeExample.vue

<script setup>
import ThemeExample from '../../components/demos/ThemeExample.vue'
</script>

`generateTheme` 使用 Material Color Utilities（MCU）2025 配色规范，根据六位十六进制源颜色生成浅色和深色方案。支持 `expressive`、`vibrant`、`tonal-spot` 和 `neutral` 四种变体，以及标准/中/高对比度。默认源色为 `#6750a4`，项目默认变体为 `tonal-spot`。初始 CSS 颜色令牌也由同一套 MCU 配置生成；VitePress 只提供图片选择界面，不另行定义颜色方案。`applyTheme` 写入参考调色板和语义颜色角色，并可配置密度、动效和强焦点指示器。默认动效方案为 `expressive`；需要较少过冲时可设置为 `standard`。

`density` 接受 `0`、`-1` 或 `-2`。紧凑设置会把组件间距缩放至 87.5% 或 75%，并缩小已接入的容器尺寸。字号与 48px 最小交互目标保持不变。密度档位和缩放比例是项目决策。

主题演示可以将设置应用到组件页面中的交互演示。文档正文和站点导航继续使用文档站主题；在文档页面间导航时，组件演示主题会继续生效。回到本页点击“重置组件演示主题”即可清除设置。重新加载页面后，演示选择会重置。

```ts
import { createThemeController } from './lib/yam3x/theme/controller'

const theme = createThemeController(document.documentElement, {
  color: '#6750a4',
  variant: 'expressive',
  contrast: 'standard',
  mode: 'system',
  motion: 'expressive',
  density: 0,
  strongFocus: true,
})

// 应用外壳卸载时调用
theme.dispose()
```

`mode` 可设为 `light`、`dark` 或 `system`。控制器会跟随系统深浅色变化，并在有效配置变化时派发冒泡的 `change` 事件；后续可用 `update` 更新配置。

`getColorFromImage(img)` 可从已加载图片提取主题源色。主题指南会在浏览器本地读取用户选择的图片，不会上传图片。

## 主题预览图标

`theme-preview-icon.vue` 支持 `color`、`variant`、`scheme`（`auto`/`light`/`dark`）和可访问名称 `label`。可以通过以下 CSS 自定义预览：`--yam3x-theme-icon-size`、`--yam3x-theme-icon-shape`、`--yam3x-theme-icon-outline-color`、`--yam3x-theme-icon-outline-opacity`、`--yam3x-theme-icon-container-color`、`--yam3x-theme-icon-color`。

## 自定义令牌

默认令牌位于 `src/styles/yam3x-tokens.css`，共享基础交互样式位于 `src/styles/yam3x-base.css`。可以直接修改复制到应用中的文件。组件演示使用 registry 源码，而不是应用内副本。

## 应用布局间距

复制的基础样式表在默认密度下提供 4、8、12、16、20、24、28、32、40、48、56、64 CSS 像素的可复用间距变量。**--md-sys-spacing-16** 和 **--md-sys-spacing-24** 等名称是 YAM3X 的 Web 实现，并非 Material 官方 CSS token 名称。可将它们用于应用自有页面边距和布局间隔：

```css
.page-layout {
  display: grid;
  gap: var(--md-sys-spacing-24);
  padding-inline: var(--md-sys-spacing-16);
}
```

Tailwind v4 也提供对应别名。例如，默认密度下 **gap-yam3x-6** 对应 24px，**px-yam3x-4** 对应 16px。设置 density 后，这些变量和别名也会缩放，包括应用布局所用的间距。请检查应用实际密度下的页面边距和内容空间。设计原则参阅[间距概览](https://m3.material.io/styles/spacing/overview)、[间距 token](https://m3.material.io/styles/spacing/tokens)和[间距应用指南](https://m3.material.io/styles/spacing/applying-spacing)。
