export type CatalogLocale = 'en' | 'zh'

export interface ComponentEntry {
  title: string
  path: string
  summary: string
}

export interface ComponentGroup {
  title: string
  description?: string
  items: ComponentEntry[]
}

type LocalizedText = Record<CatalogLocale, string>

interface CatalogItem {
  path: string
  title: string
  summary: LocalizedText
}

interface CatalogSection {
  title: string | LocalizedText
  description?: LocalizedText
  items: CatalogItem[]
}

// Keep this order aligned with the Material Components catalog; omit entries without a project page.
const materialComponents: CatalogSection[] = [
  {
    title: 'Buttons',
    items: [
      {
        path: 'button-group',
        title: 'Button groups',
        summary: { en: 'Organize related actions or choices.', zh: '组织一组相关操作或选项。' },
      },
      {
        path: 'button',
        title: 'Buttons',
        summary: { en: 'Trigger common interface actions.', zh: '执行常见操作。' },
      },
      {
        path: 'extended-fab',
        title: 'Extended FABs',
        summary: {
          en: 'Pair a primary action with a short text label.',
          zh: '以带文字标签的 FAB 承载主要操作。',
        },
      },
      {
        path: 'fab-menu',
        title: 'FAB menu',
        summary: { en: 'Expand a FAB to reveal related actions.', zh: '从 FAB 展开一组相关操作。' },
      },
      {
        path: 'fab',
        title: 'Floating action buttons (FABs)',
        summary: {
          en: 'Emphasize the primary action on a screen.',
          zh: '突出当前页面的主要操作。',
        },
      },
      {
        path: 'icon-button',
        title: 'Icon buttons',
        summary: { en: 'Trigger actions represented by icons.', zh: '执行由图标表示的操作。' },
      },
      {
        path: 'segmented-button',
        title: 'Segmented buttons',
        summary: {
          en: 'Choose an option or switch between views.',
          zh: '在连续分段中选择选项或切换视图。',
        },
      },
      {
        path: 'split-button',
        title: 'Split buttons',
        summary: {
          en: 'Run a primary action or open related choices.',
          zh: '执行主要操作，或打开相关操作菜单。',
        },
      },
    ],
  },
  {
    title: 'Date & time pickers',
    items: [
      {
        path: 'date-picker',
        title: 'Date pickers',
        summary: { en: 'Choose a date or date range.', zh: '选择日期或日期范围。' },
      },
      {
        path: 'time-picker',
        title: 'Time pickers',
        summary: { en: 'Choose a time with a dial or keyboard.', zh: '通过表盘或键盘选择时间。' },
      },
    ],
  },
  {
    title: 'Loading & progress',
    items: [
      {
        path: 'loading-indicator',
        title: 'Loading indicator',
        summary: { en: 'Show a short wait with unknown progress.', zh: '表示进度未知的短时等待。' },
      },
      {
        path: 'progress-indicator',
        title: 'Progress indicators',
        summary: { en: 'Show known progress or ongoing work.', zh: '显示已知进度或持续处理状态。' },
      },
    ],
  },
  {
    title: 'Navigation',
    items: [
      {
        path: 'navigation-bar',
        title: 'Navigation bar',
        summary: { en: 'Switch between top-level destinations.', zh: '在顶层目的地之间切换。' },
      },
      {
        path: 'navigation-drawer',
        title: 'Navigation drawer',
        summary: {
          en: 'Navigate existing screens with a modal or standard drawer.',
          zh: '在现有页面中使用 modal 或 standard 抽屉切换目的地。',
        },
      },
      {
        path: 'navigation-rail',
        title: 'Navigation rail',
        summary: {
          en: 'Navigate across medium and wider layouts.',
          zh: '在中宽及更宽布局中切换顶层目的地。',
        },
      },
    ],
  },
  {
    title: 'Sheets',
    items: [
      {
        path: 'bottom-sheet',
        title: 'Bottom sheets',
        summary: {
          en: 'Show supporting content from the bottom edge.',
          zh: '从屏幕底部显示次级内容。',
        },
      },
      {
        path: 'side-sheet',
        title: 'Side sheets',
        summary: {
          en: 'Present a supporting panel beside main content.',
          zh: '在主内容旁呈现标准或模态辅助面板。',
        },
      },
    ],
  },
  {
    title: 'All other components',
    items: [
      {
        path: 'app-bar',
        title: 'App bars',
        summary: {
          en: 'Show the page title, navigation, and key actions.',
          zh: '呈现页面标题、导航和关键操作。',
        },
      },
      {
        path: 'badge',
        title: 'Badges',
        summary: {
          en: 'Indicate unread content, a count, or a status.',
          zh: '提示未读内容、数量或状态。',
        },
      },
      {
        path: 'card',
        title: 'Cards',
        summary: {
          en: 'Group related content and actions.',
          zh: '将相关信息与操作组合为内容单元。',
        },
      },
      {
        path: 'carousel',
        title: 'Carousel',
        summary: {
          en: 'Browse a horizontal sequence of content.',
          zh: '滚动浏览并列展示的一组内容。',
        },
      },
      {
        path: 'checkbox',
        title: 'Checkbox',
        summary: { en: 'Select multiple values in a set.', zh: '在一组选项中选择多个值。' },
      },
      {
        path: 'chips',
        title: 'Chips',
        summary: {
          en: 'Enter information, filter, select, or trigger actions.',
          zh: '输入信息、筛选内容、选择或触发操作。',
        },
      },
      {
        path: 'dialog',
        title: 'Dialogs',
        summary: {
          en: 'Present content that needs the user’s attention.',
          zh: '呈现需要用户关注或处理的内容。',
        },
      },
      {
        path: 'divider',
        title: 'Divider',
        summary: {
          en: 'Group content in a list or container.',
          zh: '分隔列表或其他容器中的内容。',
        },
      },
      {
        path: 'list',
        title: 'Lists',
        summary: {
          en: 'Present content and actions in a continuous list.',
          zh: '以连续列表展示内容和操作。',
        },
      },
      {
        path: 'menu',
        title: 'Menus',
        summary: { en: 'Show choices on a temporary surface.', zh: '在临时菜单表面显示可选项。' },
      },
      {
        path: 'radio-group',
        title: 'Radio button',
        summary: { en: 'Choose one value from a set.', zh: '在一组选项中选择一个值。' },
      },
      {
        path: 'search',
        title: 'Search',
        summary: {
          en: 'Enter a query and browse suggestions or results.',
          zh: '输入查询并浏览建议与结果。',
        },
      },
      {
        path: 'slider',
        title: 'Sliders',
        summary: { en: 'Choose a value from a range.', zh: '从一段数值范围中选择值。' },
      },
      {
        path: 'snackbar',
        title: 'Snackbar',
        summary: {
          en: 'Give non-blocking feedback about an action or status.',
          zh: '提供非阻断的操作结果或状态反馈。',
        },
      },
      {
        path: 'switch',
        title: 'Switch',
        summary: {
          en: 'Toggle a setting that takes effect immediately.',
          zh: '切换立即生效的设置。',
        },
      },
      {
        path: 'tabs',
        title: 'Tabs',
        summary: { en: 'Switch between related content views.', zh: '在相关内容视图之间切换。' },
      },
      {
        path: 'text-fields',
        title: 'Text fields',
        summary: {
          en: 'Wrap native text inputs in filled or outlined fields.',
          zh: '以 filled 或 outlined 容器承载原生文本输入控件。',
        },
      },
      {
        path: 'toolbar',
        title: 'Toolbars',
        summary: {
          en: 'Group frequently used actions for the current page.',
          zh: '组织当前页面常用的操作。',
        },
      },
      {
        path: 'tooltip',
        title: 'Tooltips',
        summary: {
          en: 'Add a short label or supporting explanation.',
          zh: '为控件提供简短标签或补充说明。',
        },
      },
    ],
  },
]

const extensions: CatalogSection[] = [
  {
    title: { en: 'Input and form helpers', zh: '输入与表单配套' },
    items: [
      {
        path: 'autocomplete',
        title: 'Autocomplete',
        summary: {
          en: 'Type text and choose a matching suggestion.',
          zh: '输入文本并从匹配建议中选择。',
        },
      },
      {
        path: 'form-field',
        title: 'Form field',
        summary: {
          en: 'Add a label, field container, and supporting or error text.',
          zh: '为输入控件提供标签、容器及说明或错误信息。',
        },
      },
      {
        path: 'number-field',
        title: 'Number field',
        summary: {
          en: 'Edit localized numeric values with optional step controls.',
          zh: '编辑本地化数值，并提供可选步进操作。',
        },
      },
      {
        path: 'option',
        title: 'Option',
        summary: {
          en: 'Compose list options, panels, and groups.',
          zh: '组合列表选项、选项面板和分组。',
        },
      },
      {
        path: 'select',
        title: 'Select',
        summary: {
          en: 'Choose one or more values from a popup.',
          zh: '从弹出选项中选择一个或多个值。',
        },
      },
      {
        path: 'calendar',
        title: 'Calendar',
        summary: {
          en: 'Embed a calendar for date and range selection.',
          zh: '嵌入日历网格，支持日期和范围选择。',
        },
      },
      {
        path: 'date-input',
        title: 'Date input',
        summary: {
          en: 'Edit a localized date or time with the keyboard.',
          zh: '使用键盘编辑本地化日期、时间或日期时间。',
        },
      },
      {
        path: 'textarea-autosize',
        title: 'Textarea autosize',
        summary: {
          en: 'Resize a native textarea to fit its content.',
          zh: '让原生多行文本框按内容调整高度。',
        },
      },
    ],
  },
  {
    title: { en: 'Navigation and layout helpers', zh: '导航与布局配套' },
    items: [
      {
        path: 'breadcrumb',
        title: 'Breadcrumb',
        summary: {
          en: 'Show the current page and its parent locations.',
          zh: '显示当前位置及其父级页面路径。',
        },
      },
      {
        path: 'drawer-container',
        title: 'Drawer container',
        summary: {
          en: 'Compose a responsive side panel and main content.',
          zh: '组合自适应侧面板与主要内容。',
        },
      },
      {
        path: 'split-pane',
        title: 'Split pane',
        summary: {
          en: 'Show main and supporting content side by side.',
          zh: '并排显示主内容和辅助内容，并调整两侧比例。',
        },
      },
    ],
  },
  {
    title: { en: 'Display and graphics helpers', zh: '展示与图形配套' },
    items: [
      {
        path: 'avatar',
        title: 'Avatar',
        summary: {
          en: 'Show a person or entity as an image, icon, or text.',
          zh: '呈现图片、图标或文字身份标识。',
        },
      },
      {
        path: 'heading',
        title: 'Heading',
        summary: {
          en: 'Create a text hierarchy for pages and sections.',
          zh: '建立页面和内容区块的文字层级。',
        },
      },
      {
        path: 'icon',
        title: 'Icon',
        summary: {
          en: 'Render Material Symbols or registered SVG icons.',
          zh: '呈现 Material Symbols 或已注册的 SVG 图标。',
        },
      },
      {
        path: 'shape',
        title: 'Shape',
        summary: {
          en: 'Emphasize visual content with geometric shapes.',
          zh: '以几何形状补充或强调视觉内容。',
        },
      },
    ],
  },
]

function localize(groups: readonly CatalogSection[], locale: CatalogLocale): ComponentGroup[] {
  return groups.map((group) => ({
    title: typeof group.title === 'string' ? group.title : group.title[locale],
    ...(group.description ? { description: group.description[locale] } : {}),
    items: group.items.map((item) => ({
      path: item.path,
      title: item.title,
      summary: item.summary[locale],
    })),
  }))
}

export function getComponentCatalog(locale: CatalogLocale) {
  return {
    materialComponentGroups: localize(materialComponents, locale),
    extensionGroups: localize(extensions, locale),
  }
}
