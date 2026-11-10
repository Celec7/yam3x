<script setup lang="ts">
import DrawerContainerExample from '../../components/demos/DrawerContainerExample.vue'
</script>

# Drawer container

`DrawerContainer` 是项目布局拓展，不是独立的 Material 组件。Material 3 定义了 navigation drawer 与 side sheet，但没有通用的双侧抽屉容器。该组件组合 Material 表面与面板；Compose Material 3 的 `ModalNavigationDrawer` 与 `PermanentNavigationDrawer` 只作为布局参考。

可用它构建应用外壳：在主要内容两侧放置可选的起始面板和末尾面板。每个面板可选择 `overlay`、`push` 或 `side`，也可用 `auto` 根据容器宽度推导模式。若面板承载顶层目的地，请在起始面板中组合 [navigation drawer](/zh/components/navigation-drawer) 或展开的 [navigation rail](/zh/components/navigation-rail)。若承载上下文工具，请在面板中组合 [side sheet](/zh/components/side-sheet)。

## 示例

### 模式、两侧与自适应宽度

演示初始将两个面板都设为 `overlay`，并放在有边界的框架内。打开起始面板可检查对话框边界、焦点约束、遮罩和菜单按钮；从起始面板打开辅助面板可观察同一时间只有一个活动的模态边缘。将任一面板改为 `push` 或 `side`，调整框架宽度与断点，并切换方向以检查 RTL 镜像与拖动关闭。

<div class="vp-raw yam3x-doc-demo-theme"><DrawerContainerExample /></div>

::: details 查看演示源码

<<< ../../components/demos/DrawerContainerExample.vue{vue}

:::

### 导航与辅助面板

起始面板承载导航目的地，末尾面板承载当前页面的上下文工具。容器只负责放置这些区域，不负责目的地选择、页面路由或内容的内部结构。起始面板中应保留一个带名称的导航地标，模态面板内应提供可见的关闭控件。

## 在应用中使用

完成[安装](/zh/guide/installation)后，从应用中导入复制后的组件。请使用 `./components/yam3x/` 之类的调用方路径；演示源码中的 `@registry` 路径仅用于文档站点。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DrawerContainer } from './components/yam3x/drawer-container'

const open = ref(false)
</script>

<template>
  <DrawerContainer
    v-model:open="open"
    start-mode="overlay"
    start-label="主导航"
    start-divider
  >
    <template #start>
      <nav aria-label="主导航">
        <a href="/zh/">首页</a>
        <a href="/zh/components/list">收藏</a>
        <button
          type="button"
          data-yam3x-drawer-initial-focus
          @click="open = false"
        >
          关闭导航
        </button>
      </nav>
    </template>
    <template #start-toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        aria-label="打开导航"
        @click="toggle"
      >
        菜单
      </button>
    </template>
    <main>页面内容</main>
  </DrawerContainer>
</template>
```

`v-model:open` 与 `v-model:end-open` 负责面板可见性。组件会写入模型，并通过 `change` 事件报告边缘、新状态，以及用户是切换还是关闭了面板。

::: details 推挤与常驻辅助面板

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DrawerContainer } from './components/yam3x/drawer-container'

const endOpen = ref(true)
</script>

<template>
  <DrawerContainer
    start-mode="side"
    end-mode="push"
    v-model:end-open="endOpen"
    width="320px"
    end-label="属性"
    end-divider
  >
    <template #start>常驻导航</template>
    <template #end>属性控件</template>
    <template #end-toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        属性
      </button>
    </template>
    <main>页面内容</main>
  </DrawerContainer>
</template>
```

:::

`side` 面板常驻布局，不渲染切换插槽。`push` 面板推动主区域但保持其可交互，因此不应添加遮罩，也不应把它当作模态内容。

## 行为与无障碍

### 模式与自适应布局

- `overlay` 面板浮在内容上方并使用遮罩。`push` 面板占据自己的轨道并推动内容。`side` 面板始终保留在网格中。
- `auto` 依据实测容器而非视口解析：低于 `autoCompactBreakpoint` 使用 `overlay`，低于 `autoBreakpoint` 使用 `push`，否则使用 `side`。默认值为 600 px 与 840 px。
- 面板轨道会被限制，使两个布局内面板与主区域都至少保留 320 px。配置的 `width` 与 `maxWidth` 还会受该上限进一步压缩。
- 同一时间只打开一个非 `side` 面板。打开另一侧会关闭当前面板。
- 组件填满父元素。需要固定应用外壳时，请给父元素明确的块轴尺寸。

### 焦点与关闭

- 浮层暴露 `role="dialog"`、`aria-modal` 和面板标签。模态面板打开时，主区域变为 inert 并设置 `aria-hidden`。遮罩是带关闭名称的按钮，并阻止其后的滚轮与触摸滚动。
- 焦点先移到标记 `data-yam3x-drawer-initial-focus` 的元素，再移到首个可聚焦元素，最后回退到面板本身。Tab 在面板内循环。
- Escape 关闭活动的模态面板，激活遮罩也会关闭。向锚定边缘水平拖动超过 `min(96px, 面板宽度的 35%)` 时关闭；更小的拖动和指针取消会恢复打开位置。
- 关闭后焦点返回打开面板的切换控件；原触发器消失或隐藏时，返回组件自身的切换控件。
- `push` 与 `side` 面板不约束焦点，也不恢复焦点，仍属于正常 Tab 顺序。

### 动效与减少动态效果

正常动效使用共享的 default spatial 时长与缓动，回退值为 500 ms。网格轨道、面板变换、背景、阴影和遮罩透明度一起过渡。启用减少动态效果时，网格、面板和遮罩过渡全部移除，遮罩立即出现或消失，不保留 visibility 延迟。

### 响应式与 RTL

- 拖动按两像素步进跟随指针，并使用逻辑方向，因此 RTL 会镜像起止边缘和拖动方向。
- 模态面板裁切横向溢出并纵向滚动。内容应保持在面板宽度内，避免引入第二个横向滚动容器。
- 低于紧凑断点时，浮层面板使用全部可用宽度，直到配置的上限。

### 状态归属

打开状态、面板模式、导航选择、路由和面板内容都由应用负责。`auto` 由实测容器派生，不保存为独立状态。模态内容中应保留可见的关闭控件；遮罩名称不能替代它。

## API

内置文案可继承 [LocaleProvider](/zh/components/localization) 的 `actions` 配置。显式 `locale`、`startLabel`、`endLabel` 或 `closeLabel` 优先；未配置 provider 时默认使用 `en-US`。

### 导出

| 导出                                                     | 类型 | 用途                                       |
| -------------------------------------------------------- | ---- | ------------------------------------------ |
| `DrawerContainer`                                        | 组件 | 带可选双侧面板的布局。                     |
| `DrawerMode`、`DrawerPanelRole`、`DrawerToggleSlotProps` | 类型 | 模式取值、非模态面板角色和切换插槽作用域。 |

### 属性与模型

| 属性与模型                     | 类型                                      | 默认值                   | 用途                                              |
| ------------------------------ | ----------------------------------------- | ------------------------ | ------------------------------------------------- |
| `startMode`                    | `'overlay' \| 'push' \| 'side' \| 'auto'` | `'side'`                 | 起始面板的呈现模式。                              |
| `endMode`                      | `'overlay' \| 'push' \| 'side' \| 'auto'` | `'side'`                 | 末尾面板的呈现模式。                              |
| `open` / `v-model:open`        | `boolean`                                 | `false`                  | 模式可关闭时起始面板的可见性。                    |
| `endOpen` / `v-model:end-open` | `boolean`                                 | `false`                  | 模式可关闭时末尾面板的可见性。                    |
| `autoCompactBreakpoint`        | `number`                                  | `600`                    | 低于该容器宽度时 `auto` 解析为 `overlay`。        |
| `autoBreakpoint`               | `number`                                  | `840`                    | 低于该容器宽度时 `auto` 解析为 `push`。           |
| `width`                        | CSS 长度                                  | `'360px'`                | 首选面板宽度，受轨道上限约束。                    |
| `maxWidth`                     | CSS 长度                                  | `'360px'`                | 最大面板宽度，受轨道上限约束。                    |
| `startLabel`                   | `string`                                  | 本地化 `Start panel`     | 起始面板的无障碍名称。                            |
| `endLabel`                     | `string`                                  | 本地化 `End panel`       | 末尾面板的无障碍名称。                            |
| `startRole`                    | `'dialog' \| 'complementary'`             | —                        | 起始面板的非模态角色；模态模式始终使用 `dialog`。 |
| `endRole`                      | `'dialog' \| 'complementary'`             | —                        | 末尾面板的非模态角色；模态模式始终使用 `dialog`。 |
| `closeLabel`                   | `string`                                  | 本地化 `Close panel`     | 遮罩按钮的无障碍名称。                            |
| `startDivider`                 | `boolean`                                 | `false`                  | 在布局内起始面板与内容之间绘制分隔线。            |
| `endDivider`                   | `boolean`                                 | `false`                  | 在布局内末尾面板与内容之间绘制分隔线。            |
| `locale`                       | `string`                                  | Provider，再回退 `en-US` | 内置界面文案的语言。                              |

### 事件

| 事件     | 参数                                                                     | 用途                     |
| -------- | ------------------------------------------------------------------------ | ------------------------ |
| `change` | `(edge: 'start' \| 'end', open: boolean, reason: 'toggle' \| 'dismiss')` | 报告用户切换或关闭面板。 |

### 插槽

| 插槽           | 作用域                           | 用途                                          |
| -------------- | -------------------------------- | --------------------------------------------- |
| 默认插槽       | —                                | 主要内容区域。                                |
| `start`        | —                                | 起始面板内容。                                |
| `end`          | —                                | 末尾面板内容。                                |
| `start-toggle` | `{ expanded, controls, toggle }` | 可关闭起始面板的触发器；`side` 模式下不渲染。 |
| `end-toggle`   | `{ expanded, controls, toggle }` | 可关闭末尾面板的触发器；`side` 模式下不渲染。 |

将 `expanded` 与 `controls` 绑定到触发器的 ARIA 属性。`controls` 是面板 ID。

### 方法

`DrawerContainer` 不提供方法。通过 `v-model:open` 与 `v-model:end-open` 改变可见性，通过属性控制模式。

## 样式

容器将布局内面板映射为 System `surface`，浮层面板映射为 `surface-container-low`，分隔线映射为 `outline-variant`，遮罩使用共享的浮层遮罩透明度。组件公开以下项目自定义属性。浮层颜色与阴影覆盖项优先于通用面板覆盖项。

::: details CSS 覆盖项

| 属性                                     | 默认值                         | 用途                             |
| ---------------------------------------- | ------------------------------ | -------------------------------- |
| `--yam3x-drawer-container-width`         | `360px`                        | 面板宽度。                       |
| `--yam3x-drawer-container-max-width`     | `360px`                        | 最大面板宽度。                   |
| `--yam3x-drawer-container-color`         | System `surface`               | 布局内面板背景。                 |
| `--yam3x-drawer-container-elevation`     | System level 0                 | 布局内面板阴影。                 |
| `--yam3x-modal-drawer-container-color`   | System `surface-container-low` | 浮层面板背景。                   |
| `--yam3x-modal-drawer-elevation`         | System level 1                 | 浮层面板阴影。                   |
| `--yam3x-modal-drawer-start-shape`       | System `corner-large`          | 打开的末尾面板朝向起始侧的圆角。 |
| `--yam3x-modal-drawer-end-shape`         | System `corner-large`          | 打开的起始面板朝向末尾侧的圆角。 |
| `--yam3x-drawer-container-scrim-opacity` | 共享浮层遮罩透明度             | 遮罩透明度。                     |
| `--yam3x-drawer-divider-color`           | System `outline-variant`       | 常驻分隔线颜色。                 |
| `--yam3x-drawer-divider-thickness`       | `1px`                          | 常驻分隔线厚度。                 |

:::

请在组件根元素或祖先元素上设置这些属性。面板内容自行负责间距和文字样式。

## Material 参考

[Side sheets 概览](https://m3.material.io/components/side-sheets/overview) · [Side sheets 指南](https://m3.material.io/components/side-sheets/guidelines) · [Navigation drawer 指南](https://m3.material.io/components/navigation-drawer/guidelines)
