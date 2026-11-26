# 更新已复制的源码

`add` 复制到应用中的源码归应用所有。CLI 会添加缺失文件并对齐依赖声明，但不会覆盖已修改文件，也不会自动合并上游源码。

支持 Agent Skills 的 agent 可以通过 `npx skills add Celec7/yam3x@yam3x-upgrade` 安装升级流程。skill 负责合并判断；本页负责命令和状态。

## 记录 0.6.0 基线

使用当前 CLI 安装会生成 `yam3x.lock.json`。lock 记录每个已复制文件的上游版本和内容 hash。请将它和复制的源码一起提交。

早于 lock 的应用可以记录现有 0.6.0 安装，且不会修改源码：

```sh
pnpm dlx @celec7/yam3x@latest adopt
pnpm dlx @celec7/yam3x@latest adopt --dry-run
```

`adopt` 支持 0.6.0 基线。需要明确版本时使用 `--from 0.6.0`。它拒绝覆盖已有的 lock。早于 0.6.0 的安装需要先手工升级到 0.6.0；后续版本在安装源码时会写入 lock。

## 检查源码漂移

```sh
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest diff
pnpm dlx @celec7/yam3x@latest diff --json
pnpm dlx @celec7/yam3x@latest diff --component button
```

`status` 报告依赖声明和源码摘要。`diff` 列出内容或上游源码与 lock 不一致的文件。两者都不会写入源码。

| 状态            | 含义                           | 动作                           |
| --------------- | ------------------------------ | ------------------------------ |
| `current`       | 本地、基线和上游内容均未变化   | 无                             |
| `converged`     | 本地内容已与当前上游内容一致   | 无                             |
| `upstream-only` | 本地文件等于基线；上游已变化   | 合并上游改动                   |
| `local-only`    | 本地内容已变化；上游仍等于基线 | 保留本地修改                   |
| `conflict`      | 本地和上游都发生了变化         | 合并双方意图并复查行为         |
| `missing`       | lock 记录了该文件，但本地缺失  | 恢复文件，或确认删除是有意为之 |
| `untracked`     | 文件存在，但没有 lock 记录     | 确认上游来源后再纳入           |
| `added`         | 上游提供该文件，但本地缺失     | 已安装组件需要时复制           |
| `removed`       | 上游已不再提供该受跟踪源码文件 | 检查导入和本地修改后再删除     |

`status` 在依赖问题、`conflict` 和 `missing` 存在时返回非零状态。`diff` 在任何非 `current` 或 `converged` 状态存在时返回非零状态。

## 应用 clean 改动

`upgrade` 默认只规划源码合并，不写入文件。`--apply-clean` 仅复制 `upstream-only` 文件，并推进这些文件的 lock 基线：

```sh
pnpm dlx @celec7/yam3x@latest upgrade
pnpm dlx @celec7/yam3x@latest upgrade --apply-clean
pnpm dlx @celec7/yam3x@latest upgrade --apply-clean --dry-run
pnpm dlx @celec7/yam3x@latest upgrade --json
```

CLI 不会覆盖 `local-only`、`conflict`、`missing`、`untracked`、`added` 或 `removed` 文件。升级进行中会写入 `.yam3x/upgrade-journal.json`；不要提交该 journal。

手工合并 `conflict` 后，记录解决结果并推进其基线：

```sh
pnpm dlx @celec7/yam3x@latest upgrade --resolve src/components/yam3x/button/button.vue
pnpm dlx @celec7/yam3x@latest upgrade --finalize
```

`--resolve` 接受 `conflict` 或 `converged` 目标。只要 journal 或任何 `upstream-only`、`conflict`、`missing`、`untracked`、`added`、`removed` 状态仍存在，`--finalize` 就不会完成。`local-only` 文件可以有意保留。

## 合并源码

1. 从干净的应用工作区开始，并保持 lock 已提交。
2. 运行 `diff`，检查每个 `upstream-only` 和 `conflict` 文件。
3. 对 `upstream-only` 文件运行 `upgrade --apply-clean`；需要上下文时也可以手工合并。
4. 按双方意图合并 `conflict` 文件。有意保留 `local-only` 修改，并记录差异原因。
5. 用 `upgrade --resolve` 记录冲突解决，所有决定完成后运行 `upgrade --finalize`。
6. 将 `missing`、`untracked` 和 `removed` 视为需要决定的事项，而不是清理命令。

`add` 仍是安装命令：它补齐缺失文件，但不会推进已有 lock 的基线。

## 对齐依赖

源码合并完成后：

```sh
pnpm dlx @celec7/yam3x@latest status
pnpm dlx @celec7/yam3x@latest sync
```

`sync` 会补齐运行时与开发依赖，并收窄允许安装未测试版本的声明。它不会删除依赖，也不会修改已复制的源码。

## 验证

运行应用的类型检查与构建，然后在浏览器中试用受影响的交互。涉及相应改动时，检查紧凑与展开布局、键盘顺序、焦点返回、200% 文本、RTL、强制颜色和减少动效。

开始添加新组件时，按[安装与首次使用](/zh/guide/start/installation)执行 `add`。命令参数见 CLI 包参考。

源码更新所遵循的排版、间距、形状和动效指南见[基础](/zh/guide/foundations/)。
