<script setup lang="ts">
import CatalogGroups from '../../components/CatalogGroups.vue'
import { getComponentCatalog } from '../../component-catalog'

const { materialComponentGroups } = getComponentCatalog('zh')
</script>

# 组件

这些 Vue 组件可以通过 CLI 复制到应用中。分类遵循 [Material Components 目录](https://m3.material.io/components)，只列出本项目已编写文档的条目。项目自定义配套模块见[项目拓展](/zh/extensions/)；使用源码前请先完成[安装与首次使用](/zh/guide/installation)。

<CatalogGroups :groups="materialComponentGroups" base-path="/zh" />

每个组件页面标题上方都会显示其注册表 slug，可将其传给 `add`。运行 `pnpm dlx @celec7/yam3x@latest list` 可查看当前 CLI 版本支持的所有 slug。初始化和源码导入示例见[安装与首次使用](/zh/guide/installation)。
