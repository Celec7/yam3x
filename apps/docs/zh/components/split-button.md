<script setup lang="ts">
import SplitButtonExample from '../../components/demos/SplitButtonExample.vue'
import SplitButtonCompositionExample from '../../components/demos/SplitButtonCompositionExample.vue'
import SplitButtonPopupExample from '../../components/demos/SplitButtonPopupExample.vue'
</script>

# Split buttons

Split button 将主要操作与相关选项菜单并列呈现。直接操作和菜单触发器都应易于理解且可独立操作。

## 交互示例

### Split button

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonExample.vue{vue}

:::

### SplitButtonLayout 组合示例

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonCompositionExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonCompositionExample.vue{vue}

:::

### 自定义弹层

展开按钮需要打开菜单以外的内容时，可使用 `#popup` 插槽。

<div class="vp-raw yam3x-doc-demo-theme"><SplitButtonPopupExample /></div>

::: details 查看演示源码

<<< ../../components/demos/SplitButtonPopupExample.vue{vue}

:::

## 在应用中导入

```vue
<script setup lang="ts">
import { SplitButton, type MenuItem } from './components/yam3x/split-button'

const items: MenuItem[] = [
  { value: 'save', label: '保存' },
  { value: 'copy', label: '另存副本' },
]

function save(): void {
  console.log('已保存')
}
</script>

<template>
  <SplitButton
    label="保存"
    :items="items"
    @click="save"
    menu-label="保存选项"
  />
</template>
```

## 组合两个按钮

需要直接控制两个按钮或弹层时，使用组合式 API。`SplitButtonLayout` 提供共同的 variant、size、shape 和间距；通过 `#leading` 与 `#trailing` 插槽分别组合两个控件。间距默认采用 Material 的 2px，也可通过 `spacing` 属性覆盖。`SplitButtonTrailingButton` 使用 `v-model:checked` 暴露展开状态。布局本身不管理菜单状态或内容。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, type MenuItem } from './components/yam3x/menu'
import {
  SplitButtonLayout,
  SplitButtonLeadingButton,
  SplitButtonTrailingButton,
} from './components/yam3x/split-button'

const open = ref(false)
const items: MenuItem[] = [{ value: 'copy', label: '保存副本' }]
function save(): void {
  console.log('已保存')
}
</script>

<template>
  <SplitButtonLayout
    aria-label="保存操作"
    spacing="4px"
  >
    <template #leading>
      <SplitButtonLeadingButton @click="save">保存</SplitButtonLeadingButton>
    </template>
    <template #trailing>
      <Menu
        v-model:open="open"
        :items="items"
        label="保存选项"
      >
        <template #trigger="{ triggerProps }">
          <SplitButtonTrailingButton
            v-bind="triggerProps"
            v-model:checked="open"
            aria-label="更多保存选项"
          />
        </template>
      </Menu>
    </template>
  </SplitButtonLayout>
</template>
```

## API

`label` 或默认插槽提供简短的主要操作文字；图标使用 `#icon`。主操作可透传原生按钮属性、表单属性或 `href`。`@click` 只响应主操作。仅用默认插槽提供文字时，若要生成与操作相关的展开按钮名称，请同时设置 `menu-button-label`；图标按钮主操作可用 `aria-label`。

菜单通过 `items` 使用现有 Menu 的键盘、焦点、定位和关闭行为。`v-model:open` 控制菜单状态；`@beforetoggle`、`@toggle`、`@beforeselect` 与 `@select` 会转发 Menu 事件。`menu-label` 为菜单命名，`menu-button-label` 可覆盖展开按钮的无障碍名称。`#menu-icon` 可自定义各菜单项的前置图标。菜单在视口允许时与展开按钮的 inline-start 对齐，并保留 4px 间距。

需要打开卡片等其他内容时，使用 `#popup`，它接收 `{ anchor, open, close, popupId }`。插槽渲染在与展开按钮对应的定位容器中，因此绝对定位的弹层可用 `inset-block-start: calc(100% + 4px); inset-inline-start: 0` 展开到按钮下方。插槽内容自行决定最终位置、语义和交互；使用 `popupId` 连接 `aria-controls`，并可用 `popupRole` 指明弹层类型。菜单优先使用内置 `items`；自定义弹层若声明 `role="menu"`，必须实现菜单焦点、键盘导航和关闭行为。Square 分体按钮形状是项目扩展，不属于官方配置。主按钮与展开按钮可通过 `primary-disabled`、`menu-disabled` 单独禁用，`disabled` 会同时禁用二者。

## 行为与无障碍

将 `size` 绑定到应用的断点或强调层级，在大窗口选用更大尺寸，或在有限空间内用较小尺寸。Split button 可以单独使用，也可以与普通 Button 和 IconButton 放在同一操作区。布局会在 RTL 中镜像，Tab 顺序仍是主操作后展开按钮。

## Material 参考

[Split buttons 概览](https://m3.material.io/components/split-button/overview) · [指南](https://m3.material.io/components/split-button/guidelines) · [规格](https://m3.material.io/components/split-button/specs) · [无障碍](https://m3.material.io/components/split-button/accessibility)
