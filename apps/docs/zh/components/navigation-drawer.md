<script setup lang="ts">
import NavigationDrawerExample from '../../components/demos/NavigationDrawerExample.vue'
</script>

# Navigation drawer

在 Material 3 Expressive 更新中，navigation drawer 已不再推荐。若已采用新版本，请使用 expanded navigation rail；它具备 navigation drawer 的大部分功能，并能更好地适配不同断点。

`NavigationDrawer` 用于支持已有的抽屉式页面。Navigation drawer 提供对应用内目的地的访问。它有两种变体：standard 与 modal。

## 示例

### 基础

此演示在窄容器中打开具名 modal 抽屉，将焦点移到第一个目的地，并在选择后关闭。控件可切换 `auto`、standard 与 modal 模式，并调整面板宽度；同一组合中还展示了 header、徽标和禁用目的地。

周围应用会更新页面标题，并将焦点移入新内容。

<div class="vp-raw yam3x-doc-demo-theme">
  <NavigationDrawerExample />
</div>

::: details 查看演示源码

<<< ../../components/demos/NavigationDrawerExample.vue{vue}

:::

## 在应用中使用

先按[安装指南](/zh/guide/start/installation)复制组件，再从应用中导入。使用 `./components/yam3x/` 等消费端路径；演示源码中的 `@registry` 是站点专用路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  NavigationDrawer,
  NavigationDrawerDivider,
  NavigationDrawerItem,
  NavigationDrawerSection,
} from './components/yam3x/navigation-drawer'

const open = ref(false)
const current = ref('inbox')
</script>

<template>
  <NavigationDrawer
    v-model:open="open"
    v-model:selected="current"
    mode="auto"
    label="主导航"
  >
    <template #toggle="{ expanded, controls, toggle }">
      <button
        type="button"
        :aria-expanded="expanded"
        :aria-controls="controls"
        @click="toggle"
      >
        菜单
      </button>
    </template>

    <NavigationDrawerSection label="邮件">
      <NavigationDrawerItem
        value="inbox"
        label="收件箱"
        href="/inbox"
      />
      <NavigationDrawerItem
        value="saved"
        label="已保存"
        href="/saved"
      />
    </NavigationDrawerSection>
    <NavigationDrawerDivider />
    <NavigationDrawerItem
      value="archive"
      label="归档"
      href="/archive"
    />

    <template #content>
      <main>当前页面内容</main>
    </template>
  </NavigationDrawer>
</template>
```

## 行为与无障碍

### 键盘

- Arrow Down 与 Arrow Up 在可见且启用的目的地之间移动；Home 与 End 跳到首尾。
- Typeahead 会在 700ms 内按目的地标签开头匹配。
- Enter 跟随目的地链接。Space 激活链接且不滚动页面。
- Arrow Right 展开分支；Arrow Left 折叠分支或将焦点移到父项。两者在 RTL 中方向互换。

### 焦点与关闭

- Modal 抽屉具有 dialog 语义，会锁定焦点，并在打开时将焦点置于第一个目的地。
- Modal 抽屉可通过 scrim、Escape、向锚定边缘滑动或选择目的地关闭；关闭后焦点返回打开它的元素。
- Standard 抽屉在选择目的地后保持展开，不具备 dialog 语义。
- 可选的 `close` 插槽可为 modal 抽屉增加面板内部的可见关闭控件。
- 应用路由以及新页面渲染后的焦点仍由应用负责。

### 响应式

- `mode="auto"` 会测量容器：低于 `standardBreakpoint` 时使用 modal，达到或超过时使用 standard。默认值为 840px；该阈值对应 compact/medium 与 expanded 布局的边界，属于项目决策。
- 首次测量前，`auto` 按 modal 处理。
- `width` 与 `maxWidth` 限制面板尺寸；面板不会覆盖整个视口。

### 状态所有权

- `v-model:selected` 为必填，并应与当前路由保持同步。
- `v-model:open` 控制可见状态。未绑定时，modal 模式默认关闭，standard 模式默认展开。
- `change` 报告用户触发的开合状态变化，并附带原因：`toggle`、`dismiss` 或 `select`。

## API

`NavigationDrawer` 的内置界面文案继承 [LocaleProvider](/zh/components/localization) 的 `actions` 命名空间。`locale` 覆盖 provider 语言，并回退到 `en-US`；现有标签属性优先于对应的共享默认文案。

### 导出

`NavigationDrawer`、`NavigationDrawerSection`、`NavigationDrawerDivider`、`NavigationDrawerItem`、`NavigationDrawerMode` 和 `NavigationDrawerChangeReason`。

### `NavigationDrawer`

| 属性                 | 类型                              | 默认值      | 说明                                                   |
| -------------------- | --------------------------------- | ----------- | ------------------------------------------------------ |
| `label`              | `string`                          | 必填        | 为 modal 面板命名，并默认作为导航地标名称。            |
| `navigationLabel`    | `string`                          | —           | 为导航地标设置不同于 modal 面板的名称。                |
| `mode`               | `'modal' \| 'standard' \| 'auto'` | `'auto'`    | 抽屉呈现方式；`auto` 跟随容器宽度。                    |
| `standardBreakpoint` | `number`                          | `840`       | `auto` 由 modal 切换为 standard 的容器宽度（像素）。   |
| `width`              | `string`                          | `'360px'`   | 面板宽度。                                             |
| `maxWidth`           | `string`                          | `'360px'`   | 面板最大宽度。                                         |
| `closeLabel`         | `string`                          | —           | 关闭控件的可访问名称；回退到 LocaleProvider 文案。     |
| `locale`             | `string`                          | Provider    | 覆盖 LocaleProvider 语言，再回退到 `en-US`。           |
| `selected`           | `string`（`v-model:selected`）    | 必填        | 当前目的地的 `value`。                                 |
| `open`               | `boolean`（`v-model:open`）       | `undefined` | 可见状态。未绑定时 modal 默认关闭，standard 默认展开。 |

### `NavigationDrawerSection`

| 属性    | 类型     | 默认值 | 说明                             |
| ------- | -------- | ------ | -------------------------------- |
| `label` | `string` | —      | 可见分组标签及分组的可访问名称。 |

### `NavigationDrawerItem`

| 属性       | 类型                        | 默认值  | 说明                                         |
| ---------- | --------------------------- | ------- | -------------------------------------------- |
| `value`    | `string`                    | 必填    | 稳定唯一的目的地或分支值。                   |
| `label`    | `string`                    | 必填    | 可见标签。                                   |
| `href`     | `string`                    | —       | 原生目的地 URL。叶目的地必填；分支禁止提供。 |
| `disabled` | `boolean`                   | `false` | 禁用该项及其嵌套项。                         |
| `target`   | `string`                    | —       | 叶目的地的原生链接目标。                     |
| `rel`      | `string`                    | —       | 叶目的地的原生链接关系。                     |
| `download` | `boolean \| string`         | —       | 叶目的地的原生下载属性。                     |
| `open`     | `boolean`（`v-model:open`） | `false` | 分支的展开状态。                             |

### `NavigationDrawerDivider`

没有属性、模型、事件或插槽。它在目的地之间渲染呈现性分隔线。

### 事件

#### `NavigationDrawer`

| 事件     | 载荷                                                            | 说明                       |
| -------- | --------------------------------------------------------------- | -------------------------- |
| `select` | `(value: string, href: string \| undefined, event: MouseEvent)` | 目的地已被激活。           |
| `change` | `(open: boolean, reason: 'toggle' \| 'dismiss' \| 'select')`    | 开合状态因用户操作而变化。 |

#### `NavigationDrawerItem`

| 事件      | 载荷                             | 说明               |
| --------- | -------------------------------- | ------------------ |
| `toggle`  | `(open: boolean, value: string)` | 分支已展开或折叠。 |
| `opening` | `(value: string)`                | 分支开始展开。     |
| `opened`  | `(value: string)`                | 分支完成展开。     |
| `closing` | `(value: string)`                | 分支开始折叠。     |
| `closed`  | `(value: string)`                | 分支完成折叠。     |

### 插槽

#### `NavigationDrawer`

| 插槽      | 属性                                                                       | 说明                                                          |
| --------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `default` | —                                                                          | `NavigationDrawerSection`、`NavigationDrawerDivider` 和项目。 |
| `content` | —                                                                          | 抽屉旁边或后方的页面区域。                                    |
| `header`  | —                                                                          | 导航列表上方的可选面板标题。                                  |
| `close`   | `{ closeLabel: string, close: () => void }`                                | modal 抽屉内部的可选可见关闭控件。                            |
| `toggle`  | `{ expanded: boolean, controls: string, toggle: (event?: Event) => void }` | 外部开合控件；放在 app bar 或布局中。                         |

#### `NavigationDrawerSection`

| 插槽      | 属性 | 说明                 |
| --------- | ---- | -------------------- |
| `default` | —    | 分组内的项目。       |
| `label`   | —    | 替代可见的分组标签。 |

#### `NavigationDrawerItem`

| 插槽            | 属性                | 说明                                     |
| --------------- | ------------------- | ---------------------------------------- |
| `default`       | —                   | 分支的嵌套项目。                         |
| `label`         | —                   | 替代可见的项目标签。                     |
| `icon`          | —                   | 前置图标。                               |
| `selected-icon` | —                   | 目的地选中时显示的图标；请使用填充图标。 |
| `toggle-icon`   | `{ open: boolean }` | 分支展开图标；默认为 `expand_more`。     |
| `badge`         | —                   | 标签旁的徽标。                           |

### 方法

| 方法         | 说明                 |
| ------------ | -------------------- |
| `expand()`   | 展开所有已注册分支。 |
| `collapse()` | 折叠所有已注册分支。 |
| `id`         | 暴露的导航地标 ID。  |

## 样式

`width` 与 `maxWidth` 控制面板尺寸。抽屉框架还会读取 `--yam3x-drawer-container-width` 和 `--yam3x-drawer-container-max-width`；仅在布局需要统一覆盖多个抽屉时，才在祖先元素上设置它们。组件没有其他公开样式钩子；颜色、形状和排版遵循 System token。

## Material 参考

[Navigation drawer 概览](https://m3.material.io/components/navigation-drawer/overview) · [指南](https://m3.material.io/components/navigation-drawer/guidelines) · [规格](https://m3.material.io/components/navigation-drawer/specs) · [无障碍](https://m3.material.io/components/navigation-drawer/accessibility)
