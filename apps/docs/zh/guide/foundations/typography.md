# 排版

按内容用途选择 Material 文字角色，并让语义标题层级与视觉字号保持独立。

## 建立清晰的排版层级

Material 字阶包含五种文字角色，每种有 large、medium、small 三种尺寸：

- Display：简短而重要的文字或数字。
- Headline：简短的高强调内容或主要内容区域标题。
- Title：中等强调的章节标题和次要区域标题。
- Body：较长的阅读内容。
- Label：控件标签、说明等简短实用文字。

按内容用途选择角色，不要只把它当成一组依次放大的字号。YAM3X Heading 映射 Display、Headline、Title 和 Label 角色；用 **level** 确定文档标题语义，并独立设置控制外观的 **variant**、**size** 和 **emphasized**。普通阅读文本应使用正常正文语义。参阅 [Heading](/zh/components/heading) 和 Material 的[排版应用指南](https://m3.material.io/styles/typography/applying-type)。

Material 定义了 15 种 baseline 和 15 种 emphasized 样式，但产品无需全部使用。默认使用 baseline。只有当选中状态、操作、标题或其他重要状态需要更突出时，才使用同角色、同尺寸的 emphasized 样式；Material 组件默认不使用 emphasized。参阅[字阶与 token](https://m3.material.io/styles/typography/type-scale-tokens)。

Web 文本的行高决定文字边界盒的高度，字体度量决定字形在盒内的位置。用 padding 设置该盒与相邻元素、容器边缘之间的空间，不要固定内容高度。若定义自有字阶，Material 建议 Display、Headline、Title 的行高约为字号的 1.2 倍，Body 和 Label 约为 1.5 倍；优先使用合适的 YAM3X 排版 token。参阅 [Applying type](https://m3.material.io/styles/typography/applying-type) 中的排版图示。

为本地化内容添加正确的 **lang**。YAM3X 会把常见语言标签映射到脚本高度类别来调整行高，默认使用 medium，也可在子树上通过 **data-md-language-height** 覆盖。较高脚本和翻译文本需要空间换行和增长；固定高度元素可能裁切或重叠。文字放大到 200% 时，保留默认间距关系并允许内容重排，不要等比例放大每个间隔。参阅[语言高度支持](https://m3.material.io/styles/typography/type-scale-tokens)和[间距应用指南](https://m3.material.io/styles/spacing/applying-spacing)。

表格和计时器等频繁变化的数字使用等宽数字，让数值保持对齐。参阅[确保可读性](https://m3.material.io/styles/typography/applying-type)。


## Material 参考

[排版应用](https://m3.material.io/styles/typography/applying-type) · [字阶与 token](https://m3.material.io/styles/typography/type-scale-tokens) · [间距](https://m3.material.io/styles/spacing/applying-spacing)
