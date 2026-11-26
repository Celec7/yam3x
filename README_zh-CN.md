# YAM3X Vue

[English](README.md) | 简体中文

YAM3X 提供原生适配 Vue 的 Material 3 Expressive 组件，并以可编辑源码的形式交付。将组件添加到 Vue 应用后，可以根据产品需求修改其中的 `.vue`、`.ts` 和 `.css` 文件。

组件使用 Material 设计令牌和 Vue API。Switch、Dialog 和 BottomSheet 在内部使用 Ark UI 实现交互行为。

## 开始使用

在已有的 Vue/Vite 应用中，先初始化基础配置，再添加组件。应用需要包含 `src/main.ts` 或 `src/main.js`：

```sh
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest diff
pnpm dlx @celec7/yam3x@latest sync
```

CLI 会复制可编辑源码并声明依赖；复制后的组件无需额外的 Vite 插件或样式构建步骤。`init` 和 `add` 会写入 `yam3x.lock.json`，已有的 0.6.0 安装可以用 `adopt` 记录基线。`status` 报告依赖和源码漂移；`diff` 列出变化文件；`sync` 在不覆盖已复制源码的前提下更新依赖声明。完整步骤请参阅[安装指南](apps/docs/zh/guide/start/installation.md)。

## 文档

- [文档站点](https://yam3x.iscccc.cc/)
- [文档索引](docs/README.md)
- [项目术语表](docs/glossary.md)
- [组件交付流水线](docs/contributing/component-implementation.md)
- [Agent skill](skills/yam3x/SKILL.md)
- [安装和使用组件](apps/docs/zh/guide/start/installation.md)
- [基础](apps/docs/zh/guide/foundations/index.md)
- [项目组件设计指南](docs/specs/README.md)
- [颜色与主题](apps/docs/zh/guide/foundations/color.md)
- [更新已复制的源码](apps/docs/zh/guide/maintain/updating.md)
- [共享设计基础](docs/specs/foundations.md)
- [架构与源码归属](docs/architecture.md)
- [CLI 包参考](packages/cli/README.md)
- [更改日志](CHANGELOG.md)
- [CLI 发布流程](docs/contributing/releasing.md)

## 开发

运行 `pnpm dev` 可启动本地 VitePress 组件文档站点。[贡献指南](CONTRIBUTING.md)介绍了工作区检查；CLI 集成测试会在临时 Vue/Vite 应用中验证复制的源码。

## 参考资料

- [Material 3 Expressive 指南](https://m3.material.io/)
- [Jetpack Compose Material 3](https://developer.android.com/develop/ui/compose/designsystems/material3)
- [Android Views Material Components](https://github.com/material-components/material-components-android)
- [Material Web](https://github.com/material-components/material-web)
