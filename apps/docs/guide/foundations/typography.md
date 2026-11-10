# Typography

Use Material type roles for content purpose, and keep semantic heading levels independent from visual scale.

## Build a readable type hierarchy

Material's type scale has five roles, each with large, medium, and small sizes:

- Display: short, important text or numerals.
- Headline: short, high-emphasis text or primary content regions.
- Title: medium-emphasis section and secondary-region headings.
- Body: longer reading passages.
- Label: short, utilitarian text such as control labels and captions.

Choose a role for its content purpose, not just because it is the next size in a ladder. YAM3X Heading maps Display, Headline, Title, and Label roles; use its **level** for document heading semantics independently of **variant**, **size**, and **emphasized** appearance. Use normal text semantics for Body copy. See [Heading](/components/heading) and Material's guidance on [applying type](https://m3.material.io/styles/typography/applying-type).

Material defines 15 baseline and 15 emphasized styles, but a product need not use all of them. Use baseline styles by default. Choose the emphasized counterpart of the same role and size when selection, an action, a headline, or another important state needs added emphasis; Material components do not use emphasized styles by default. See [type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens).

For Web text, line-height sets the height of the text bounding box; font metrics place the glyphs inside it. Use padding to provide space between that box, neighboring elements, and container edges. Avoid fixed content heights. If defining a custom type style, Material recommends a line-height near 1.2 times the type size for Display, Headline, and Title, and around 1.5 times for Body and Label. Prefer YAM3X type tokens where they fit. See the typesetting figures in [Applying type](https://m3.material.io/styles/typography/applying-type).

Add the correct **lang** to localized content. YAM3X maps common language tags to script-height categories for line-height, defaults to medium, and lets a subtree override the category with **data-md-language-height**. Taller scripts and translated text need room to wrap and grow; fixed-height elements can clip or overlap them. When text scales to 200%, preserve the default spacing relationships and let the content reflow instead of multiplying every gap. See [language height support](https://m3.material.io/styles/typography/type-scale-tokens) and [applying spacing](https://m3.material.io/styles/spacing/applying-spacing).

Use tabular figures for tables and numbers that change often, such as timers, so values stay aligned. See [Ensuring readability](https://m3.material.io/styles/typography/applying-type).


## Material references

[Applying type](https://m3.material.io/styles/typography/applying-type) · [Type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens) · [Spacing](https://m3.material.io/styles/spacing/applying-spacing)
