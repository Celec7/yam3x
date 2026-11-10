# 开始使用

选择与项目阶段匹配的路径。安装与维护是两条独立流程；设计决策位于“基础”。

## 新应用

1. [安装与首次使用](/zh/guide/start/installation)配置 CLI、复制基础文件并添加第一批组件。
2. [基础](/zh/guide/foundations/)在搭建页面前说明布局、排版、颜色、间距和交互。
3. [组件目录](/zh/components/)记录已实现的 API、示例和样式接口。

## 已有复制源码

- [更新已复制的源码](/zh/guide/maintain/updating)说明如何比较并合并新版 YAM3X，同时保留本地修改。
- 组件导入继续使用 `./components/yam3x/`；站点专用的 `@registry` 路径只用于示例源码。

## 消费项目中的 Agent

安装时，如果目标文件尚不存在，CLI 会把简短的设计指南入口复制到 `src/components/yam3x/AGENTS.md`。应用根目录的 `AGENTS.md` 保持独立；保留文件的行为见[安装与首次使用](/zh/guide/start/installation)。

## 参考

- [基础](/zh/guide/foundations/)：设计决策与 Material 官方链接。
- [组件](/zh/components/)：组件目录。
- [项目拓展](/zh/extensions/)：项目定义的组件与组合。
