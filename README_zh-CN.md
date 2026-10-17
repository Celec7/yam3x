# YAM3X Vue

[English](README.md) | 简体中文

YAM3X 提供原生适配 Vue 的 Material 3 Expressive 组件，并以可编辑源码的形式交付。将组件添加到 Vue 应用后，可以根据产品需求修改其中的 `.vue`、`.ts` 和 `.css` 文件。

组件使用 Material 设计令牌和 Vue API。Switch 和 Dialog 在内部使用 Ark UI 实现交互行为。

## 开始使用

在已有的 Vue/Vite 应用中，先初始化基础配置，再添加组件。应用需要包含 `src/main.ts` 或 `src/main.js`：

```sh
pnpm dlx @celec7/yam3x@latest init
pnpm dlx @celec7/yam3x@latest add button switch dialog
```

CLI 会复制可编辑源码并声明依赖。如果应用尚未配置，请将 `@tailwindcss/vite` 添加到 Vite 插件中；CLI 不会修改 Vite 配置。完整步骤请参阅[安装指南](apps/docs/zh/guide/installation.md)。

## 文档

- [文档站点](https://yam3x.iscccc.cc/)
- [文档索引](docs/README.md)
- [安装和使用组件](apps/docs/zh/guide/installation.md)
- [设计基础](apps/docs/zh/guide/design.md)
- [项目组件设计指南](docs/specs/README.md)
- [主题与动态颜色](apps/docs/zh/guide/theme.md)
- [更新已复制的源码](apps/docs/zh/guide/updating.md)
- [共享设计基础](docs/specs/foundations.md)
- [架构与源码归属](docs/architecture.md)
- [CLI 包参考](packages/cli/README.md)
- [CLI 发布流程](docs/releasing.md)

## 开发

运行 `pnpm dev` 可启动本地 VitePress 组件文档站点。[贡献指南](CONTRIBUTING.md)介绍了工作区检查；CLI 集成测试会在临时 Vue/Vite 应用中验证复制的源码。

## 参考资料

- [Material 3 Expressive 指南](https://m3.material.io/)
- [matraic/m3e](https://github.com/matraic/m3e)
