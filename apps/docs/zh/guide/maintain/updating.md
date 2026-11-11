# 更新已复制的源码

安装后的组件和基础文件由你的应用维护。再次运行 `pnpm dlx @celec7/yam3x@latest add` 会添加缺失文件并对齐依赖声明，但不会覆盖已经复制或修改过的文件，也不会自动合并上游更新。

检查并更新已安装组件的依赖声明：

```sh
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest sync
```

`status` 只报告缺失、过宽的声明和已安装版本，不写入文件。`sync` 会补齐运行时与开发依赖，并收窄允许安装未测试版本的声明；它不会删除依赖，也不会修改已复制的源码。

要采用此仓库的新版本：

1. 对比应用中的 `src/components/yam3x/`、`src/styles/yam3x-*.css` 和 `src/lib/yam3x/` 与仓库 `registry/` 下的对应源码。
2. 一起合并组件、共享辅助文件及设计基础中的相关改动，保留应用自己的修改。
3. 运行 `status` 和 `sync` 对齐依赖声明，并安装新增依赖。
4. 运行应用的类型检查与构建，在浏览器中试用受影响的交互。

开始添加新组件时，仍可按[安装与首次使用](/zh/guide/start/installation)执行 `add`。命令参数见仓库中的 `packages/cli/README.md`。
