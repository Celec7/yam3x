# 安装与首次使用

YAM3X 通过 CLI 将 Vue 源码组件复制到你的应用。目标项目需要 Vue、Vite、Tailwind CSS v4，并提供 `package.json` 与 `src/main.ts` 或 `src/main.js`。

```sh
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
```

在目标应用根目录运行以上命令。`init` 会复制共享基础文件、声明依赖，并在应用入口导入 `yam3x.css`。`add` 会复制组件源码并声明组件所需依赖。如果尚未配置 Tailwind Vite 插件，请在现有 Vite 配置中添加：

```ts
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [vue(), tailwindcss()] })
```

生成的 `yam3x.css` 会在运行时从 Google Fonts 加载 Roboto 和三种 Material Symbols 字体。若应用需要离线运行或采用严格的内容安全策略，请自行托管字体并替换该导入，同时保留 `Roboto`、`Material Symbols Outlined`、`Material Symbols Rounded` 和 `Material Symbols Sharp` 这些字体族名称。

假设下面的文件是目标项目的 `src/App.vue`，从复制后的源码导入：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Button from './components/yam3x/button/button.vue'
import Switch from './components/yam3x/switch/switch.vue'

const enabled = ref(false)
</script>

<template>
  <Button>Save</Button>
  <Switch
    v-model="enabled"
    label="Notifications"
  />
</template>
```

运行目标项目的构建，确认 Vite 插件和依赖均已就绪。组件页面的演示源码使用站点专用的 `@registry` 路径；复制示例时应改用目标项目内的 `./components/yam3x/` 路径。

`--no-install` 只更新项目文件和依赖声明，不运行包管理器。使用 `--cwd <project>` 可以指定其他目标目录。CLI 会保留目标应用中已经存在的文件；再次执行 `add` 不会覆盖之前复制或修改过的源码。后续版本的合并方法见[更新已复制的源码](/zh/guide/updating)。
