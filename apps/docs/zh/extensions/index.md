<script setup lang="ts">
import CatalogGroups from '../../components/CatalogGroups.vue'
import { getComponentCatalog } from '../../component-catalog'

const { extensionGroups } = getComponentCatalog('zh')
</script>

# 项目拓展

这里集中列出 yam3x 为 Vue 使用场景提供的配套模块和扩展能力。它们可以补充 Material 组件的组合方式，但不一定对应 Material 官方目录中的独立组件。

<CatalogGroups :groups="extensionGroups" base-path="/zh" />

使用这些模块前，请先完成[安装与首次使用](/zh/guide/installation)。各页面的 API 以当前 Vue 源码为准。
