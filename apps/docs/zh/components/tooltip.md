<script setup lang="ts">
import TooltipExample from '../../components/demos/TooltipExample.vue'
</script>

# Tooltips

Tooltip 为控件提供简短标签或补充说明。不要重复可见文字，也不要将关键信息只放在 tooltip 中。

## 交互示例

<div class="vp-raw yam3x-doc-demo-theme"><TooltipExample /></div>

::: details 查看演示源码

<<< ../../components/demos/TooltipExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { Tooltip } from './components/yam3x/tooltip'
</script>

<template>
  <button
    id="help"
    aria-label="帮助"
  >
    ?
  </button>
  <Tooltip for="help">显示帮助说明</Tooltip>
</template>
```

## API

`Tooltip` 和 `RichTooltip` 都需要 `for`，用于指向已有控件的 ID。两者支持 `id`、`position`、`showDelay`（默认 `0`）、`hideDelay`（默认 `1500`）、`offset`、`disabled`、`touchGestures`、`v-model:open`，并暴露 `show()` / `hide()` 方法；还会发出 `beforetoggle` 和 `toggle` 事件。`Tooltip` 接受 `above`、`below`、`before`、`after`；`RichTooltip` 还接受 `below-after` 等角落位置。

`RichTooltip` 另有 `persistent`（默认 `false`）和 `ariaLabel`，以及默认正文、`#subhead`、`#actions` 插槽。`RichTooltipAction` 包裹操作，支持 `disableRestoreFocus`（默认 `false`）。这些控制项和持久显示行为属于项目 API。

## 行为与无障碍

`Tooltip` 与 `RichTooltip` 使用 `for` 关联已有控件的 `id`。默认通过悬停或键盘可见焦点触发；`v-model:open`、`show()` 和 `hide()` 可由应用控制显隐。两类提示都默认在目标离开后保留 1.5 秒。按 Esc 关闭提示；一次只显示一个。

`Tooltip` 的默认位置在控件上方。`position` 可设为 `above`、`below`、`before` 或 `after`；贴近可见控件时默认留 4px，贴近文本基线时留 8px。空间不足时会翻转或避开视口边缘，并按 8px 增量修正位置。位于页眉中的目标默认显示在下方。

`RichTooltip` 支持默认正文、可选 `#subhead` 和 `#actions`。子标题应简短；操作不超过两个文字按钮，按正文起始边对齐，并尽量并排。默认位置在桌面精细指针设备上居中显示于下方，在触屏优先设备上对齐目标的尾侧并显示于下方，也可以用 `position` 显式指定。带操作的临时富提示也会在悬停、键盘可见焦点或触屏长按时显示；提示打开时，点击触发控件可将其固定，方便继续操作。焦点可沿页面顺序进入提示中的链接和按钮，不会被困在浮层内。动作按钮内嵌 `RichTooltipAction`，执行后关闭并把焦点还给触发控件；设置 `disable-restore-focus` 可关闭焦点恢复。无子标题但包含交互内容时，请用 `aria-label` 为提示命名。

`persistent` 用于新功能说明这类持续提示：可由点击或 `v-model:open` 打开，点按或聚焦其他页面控件后关闭。不要在图标按钮上使用持久富提示。普通提示默认短暂显示。

## 样式

Tooltip 样式通过组件自有 token 映射 Material 角色与文字样式。以下属性是支持的消费者覆盖项；可将它们设置在 tooltip 组件或其主题作用域内的祖先元素上。

| 属性                                         | 作用对象       | 默认值                      |
| -------------------------------------------- | -------------- | --------------------------- |
| `--yam3x-tooltip-container-color`            | 普通提示容器   | System `inverse-surface`    |
| `--yam3x-tooltip-supporting-text-color`      | 普通提示正文   | System `inverse-on-surface` |
| `--yam3x-tooltip-shape`                      | 普通提示容器   | System `corner-extra-small` |
| `--yam3x-tooltip-max-width`                  | 普通提示容器   | 200px，受视口宽度限制       |
| `--yam3x-rich-tooltip-container-color`       | 富提示容器     | System `surface-container`  |
| `--yam3x-rich-tooltip-supporting-text-color` | 富提示正文     | System `on-surface-variant` |
| `--yam3x-rich-tooltip-subhead-color`         | 富提示子标题   | System `on-surface-variant` |
| `--yam3x-rich-tooltip-shape`                 | 富提示容器     | System `corner-medium`      |
| `--yam3x-rich-tooltip-elevation`             | 富提示容器阴影 | System elevation level 3    |
| `--yam3x-rich-tooltip-max-width`             | 富提示容器     | 320px，受视口宽度限制       |

这些是项目扩展点，不是 Material token 名称。普通提示的文字与几何尺寸、富提示的文字与间距，以及动效，都通过组件映射使用 System token。普通提示内容超过视口安全高度时可以滚动查看，不会被裁切。

## Material 参考

[Tooltips 概览](https://m3.material.io/components/tooltips/overview) · [指南](https://m3.material.io/components/tooltips/guidelines) · [规格](https://m3.material.io/components/tooltips/specs) · [无障碍](https://m3.material.io/components/tooltips/accessibility)
