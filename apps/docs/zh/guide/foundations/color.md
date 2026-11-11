# 颜色与主题

组件通过语义 CSS 变量读取颜色、形状、动效、状态层和触控尺寸。安装组件时，CLI 会把这些基础源码复制到目标应用。设计原则与官方规范入口见[基础总览](/zh/guide/foundations/)。颜色角色与动态配色参阅 Material 的[颜色规范](https://m3.material.io/styles/color/overview)。

## 动态颜色

<ThemeExample />

<<< ../../../components/demos/ThemeExample.vue

<script setup>
import ThemeExample from '../../../components/demos/ThemeExample.vue'
</script>

`generateTheme` 使用 Material Color Utilities（MCU）2025 配色规范，根据六位十六进制源颜色生成浅色和深色方案。支持 `expressive`、`vibrant`、`tonal-spot` 和 `neutral` 四种变体，以及标准/中/高对比度。默认源色为 `#6750a4`，项目默认变体为 `tonal-spot`。初始 CSS 颜色令牌也由同一套 MCU 配置生成；VitePress 只提供图片选择界面，不另行定义颜色方案。`applyTheme` 写入参考调色板和语义颜色角色，并可配置密度、动效和强焦点指示器。强焦点模式还会在指针焦点上显示共享焦点环，而不只限于 `:focus-visible`。默认动效方案为 `expressive`；需要较少过冲时可设置为 `standard`。

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

## 应用样式

基础样式表还提供语义化的颜色、排版、形状和间距 CSS 自定义属性，供应用自有 CSS 直接使用：

```css
.notice {
  padding: var(--md-sys-spacing-16);
  border-radius: var(--md-sys-shape-corner-large);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  font-family: Roboto, ui-sans-serif, system-ui, sans-serif;
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  font-weight: var(--md-sys-typescale-body-medium-font-weight);
}
```

调整 YAM3X 组件内部外观时，请使用组件页文档说明的 props 和 CSS 自定义属性。

项目不附带工具类。消费应用可以自行添加样式工具，包括 Tailwind，但 YAM3X 组件使用标准 CSS 和上述语义自定义属性。

## 相关基础

- [间距与密度](/zh/guide/foundations/spacing)：密度配置与应用布局间距。
- [手势与交互](/zh/guide/foundations/gestures)：指针能力标志。

## Material 参考

[颜色角色](https://m3.material.io/styles/color/roles) · [颜色系统](https://m3.material.io/styles/color/overview) · [动态颜色](https://m3.material.io/styles/color/dynamic-color/overview)
