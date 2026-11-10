# 间距与密度

Material 间距是一套有归属关系的共享刻度，不是所有位置通用的固定间隔。密度会改变组件间距，但不会缩小文字或最小交互目标。

## 按归属使用间距

Material 间距以 8 dp 为基础，并提供推荐值；它不要求所有位置使用同一种间距。若推荐值不适合重复使用的模式，Material 允许产品按一致的比例扩展间距刻度。参阅[间距概览](https://m3.material.io/styles/spacing/overview)、[间距 token](https://m3.material.io/styles/spacing/tokens)和[间距应用指南](https://m3.material.io/styles/spacing/applying-spacing)。

组件内部使用父容器的 padding 和 gap 来组织内容；Material 建议优先使用这两种方式，而不是在子元素上设置 margin。组件自己的内部间距遵循对应设计指南。页面层面由应用外壳组织窗格、页面边距和留白，再用 padding 和 gap 组织各窗格中的内容。使用逻辑方向属性，让 leading/trailing 随文字方向切换。

下文的“应用布局间距”列出已安装的 YAM3X 变量及其密度行为。

## 应用布局间距

复制的基础样式表在默认密度下提供 4、8、12、16、20、24、28、32、40、48、56、64 CSS 像素的可复用间距变量。**--md-sys-spacing-16** 和 **--md-sys-spacing-24** 等名称是 YAM3X 的 Web 实现，并非 Material 官方 CSS token 名称。可将它们用于应用自有页面边距和布局间隔：

```css
.page-layout {
  display: grid;
  gap: var(--md-sys-spacing-24);
  padding-inline: var(--md-sys-spacing-16);
}
```

这些变量会随 YAM3X 的 density 设置缩放，包括应用布局所用的值。请检查应用实际密度下的页面边距和内容空间。设计原则参阅[间距概览](https://m3.material.io/styles/spacing/overview)、[间距 token](https://m3.material.io/styles/spacing/tokens)和[间距应用指南](https://m3.material.io/styles/spacing/applying-spacing)。


## 密度

`density` 接受 `0`、`-1` 或 `-2`。紧凑设置会把组件间距缩放至 87.5% 或 75%，并缩小已接入的容器尺寸。字号与 48px 最小交互目标保持不变。密度档位和缩放比例是项目决策。

## Material 参考

[间距概览](https://m3.material.io/styles/spacing/overview) · [间距 token](https://m3.material.io/styles/spacing/tokens) · [间距应用](https://m3.material.io/styles/spacing/applying-spacing)
