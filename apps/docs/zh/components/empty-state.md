<script setup lang="ts">
import EmptyStateExample from '../../components/demos/EmptyStateExample.vue'
import EmptyStateIllustrationExample from '../../components/demos/EmptyStateIllustrationExample.vue'
</script>

# 空状态

`EmptyState` 说明集合或结果区域为何没有内容，并提供有用的下一步。用于新建的空集合或没有匹配结果的情况；加载、请求失败和已完成任务需要各自的反馈。

EmptyState 是项目扩展。Compose 没有 EmptyState 原语；最接近的组合是包含可选 Icon 或 Image、Text 和 Button 的 `Column`。排版角色、间距和表面处理是基于共享 Material 基础的项目决策。

## 示例

### 新建、无匹配与页面上下文

<div class="vp-raw yam3x-doc-demo-theme"><EmptyStateExample /></div>

::: details 查看演示源码

<<< ../../components/demos/EmptyStateExample.vue{vue}

:::

演示保持周围区域和搜索控件可用。创建文档会用结果消息替换嵌入状态，清除搜索会移除无匹配状态，页面级表单使用更大的 Headline Small 与 Body Large 角色。图标插图保持装饰性。

### 插图与操作层级

<div class="vp-raw yam3x-doc-demo-theme"><EmptyStateIllustrationExample /></div>

::: details 查看演示源码

<<< ../../components/demos/EmptyStateIllustrationExample.vue{vue}

:::

自定义插图重复了消息内容，因此对辅助技术隐藏。填充操作表示主要下一步，文本操作提供次要路径，紧凑形式只保留标题和说明。区域变窄时按钮会换行。

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { EmptyState } from './components/yam3x/empty-state'
import { Button } from './components/yam3x/button'
</script>

<template>
  <EmptyState
    title="没有匹配的文档"
    align="start"
    :heading-level="2"
  >
    请尝试其他关键词，或清除搜索以查看所有文档。
    <template #actions><Button variant="outlined">清除搜索</Button></template>
  </EmptyState>
</template>
```

`title` 必填。使用 `description` 或默认 slot 提供补充说明；slot 会替换 `description`。设置 `headingLevel` 以匹配周围大纲，并把区域标题、筛选器和导航保留在空状态之外。

::: details 自定义插图与信息性图片

```vue
<template>
  <EmptyState
    title="没有已归档项目"
    description="已归档项目会保留三十天。"
  >
    <template #illustration>
      <img
        src="/illustrations/archive.svg"
        alt="一个空的档案盒"
      />
    </template>
  </EmptyState>
</template>
```

`#illustration` slot 替换图标区域。装饰性插图请设置 `alt=""` 或 `aria-hidden="true"`；信息性插图需要有意义替代文本。颜色钩子只对使用 currentColor 的插图生效。

:::

## 行为与无障碍

### 内容层级

- 标题是语义标题，级别由 `headingLevel` 决定，默认 3。`context="page"` 使用 Headline Small 与 Body Large；`embedded` 使用 Title Medium 与 Body Medium。
- 说明使用 On Surface Variant，空间允许时文本块保持约 40 个字符宽。
- `align="start"` 遵循书写方向。短小的独立消息默认居中。
- 组件不添加卡片背景、不获取记录，也不创建内容。它只占据受影响的区域，不接管无关内容。

### 操作与焦点

- `#actions` 放置下一步操作。最重要的路径使用一个填充操作，替代路径使用文本或描边操作。
- 操作会换行并保留完整标签。外观变化和移除不会自动移动焦点。
- 应用负责操作结果，以及空状态被替换后的焦点去向。

### 插图语义

- 内置 `icon` 是装饰性的，对辅助技术隐藏。除了文本之外没有额外含义。
- `#illustration` slot 接受任意内容。装饰性插图请标记为装饰性，信息性图片请提供文本替代。
- 插图颜色默认为 On Surface Variant；需要不同角色时覆盖提供的钩子。

### 空集合与无匹配

- 明确说明集合尚无项目，还是当前查询没有匹配。
- 新集合提供创建操作，无匹配时提供查询或筛选变更。
- 请求失败必须保留错误和恢复操作，不能声称集合为空。
- 包含结果区域时，可由该区域自己的状态区播报一次用户发起的结果；空状态本身不是 live region。

### 窄区域与放大文本

- 区域随内容增长；操作和文本会换行，不产生水平溢出。
- 表格可以保留表头，让空消息跨列显示。
- RTL 中起始对齐和操作顺序遵循书写方向。

## API

### 导出

| 导出         | 说明                         |
| ------------ | ---------------------------- |
| `EmptyState` | 空内容区域的说明与可选操作。 |

### 属性与模型

| 属性           | 默认值     | 说明                                                                                  |
| -------------- | ---------- | ------------------------------------------------------------------------------------- |
| `title`        | 必填       | 空区域的简短说明。                                                                    |
| `description`  | 空         | 补充说明；提供默认 slot 时被替换。                                                    |
| `context`      | `embedded` | `embedded` 使用 Title Medium / Body Medium；`page` 使用 Headline Small / Body Large。 |
| `align`        | `center`   | `center` 或遵循方向的 `start`。                                                       |
| `icon`         | 无         | 可选装饰性 Material Symbol，以 48 px 显示。                                           |
| `headingLevel` | `3`        | 语义标题级别 1–6。请覆盖以匹配周围大纲。                                              |

原生特性（包括 `class`、`style`、`id` 和 `hidden`）会应用到根元素。

### 事件

EmptyState 不触发事件。通过 `#actions` 中的控件处理操作。

### 插槽

| 插槽           | 用途                                   |
| -------------- | -------------------------------------- |
| `default`      | 补充内容；存在时替换 `description`。   |
| `illustration` | 用图片、SVG 或自定义插图替换图标区域。 |
| `actions`      | 主要和次要下一步操作，放置在文本下方。 |

### 方法

EmptyState 不暴露实例方法。

## 样式

EmptyState 暴露一个项目定义的自定义属性。排版、间距和前景色使用共享 Material 角色：区域 24 px 内边距，主要部分之间 16 px，标题与说明之间 8 px。

| 属性                                     | 默认值                      | 用途                            |
| ---------------------------------------- | --------------------------- | ------------------------------- |
| `--yam3x-empty-state-illustration-color` | System `on-surface-variant` | currentColor 插图艺术的前景色。 |

使用 `class` 或 `style` 设置包含区域的尺寸；让其高度跟随内容。内置图标默认使用 48 px。

## Material 参考

[应用字体](https://m3.material.io/styles/typography/applying-type) · [形状原则](https://m3.material.io/styles/shape/overview-principles) · [按钮指南](https://m3.material.io/components/buttons/guidelines) · [自适应设计](https://m3.material.io/foundations/layout/layout-overview/adaptive-design)
