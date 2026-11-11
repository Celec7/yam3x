import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildRegistry } from '../../../scripts/generate-registry.mjs'
import { getComponentCatalog, type ComponentGroup } from '../component-catalog'

const registryComponentsModule = 'virtual:yam3x-components'
const registryComponentsId = `\0${registryComponentsModule}`

function registryComponentsPlugin() {
  return {
    name: 'yam3x-registry-components',
    resolveId(id: string) {
      if (id === registryComponentsModule) return registryComponentsId
    },
    async load(id: string) {
      if (id !== registryComponentsId) return
      const { components } = await buildRegistry()
      return `export default ${JSON.stringify(Object.keys(components).sort())}`
    },
  }
}

function catalogSidebar(groups: ComponentGroup[], prefix = '') {
  return groups.map((group) => ({
    text: group.title,
    collapsed: false,
    items: group.items.map((item) => ({
      text: item.title,
      link: `${prefix}/components/${item.path}`,
    })),
  }))
}

function localeThemeConfig(prefix: '' | '/zh', english = false) {
  const labels = english
    ? {
        start: 'Start',
        startOverview: 'Start here',
        maintain: 'Maintain',
        foundations: 'Foundations',
        foundationsOverview: 'Foundations overview',
        layout: 'Layout and adaptive structure',
        typography: 'Typography',
        components: 'Components',
        extensions: 'Extensions',
        catalog: 'Component catalog',
        allComponents: 'All components',
        extensionCatalog: 'Extension catalog',
        installation: 'Installation and first use',
        updating: 'Updating copied source',
        colors: 'Color and theming',
        spacing: 'Spacing and density',
        gestures: 'Gestures and interaction',
      }
    : {
        start: '开始',
        startOverview: '开始使用',
        maintain: '维护',
        foundations: '基础',
        foundationsOverview: '基础总览',
        layout: '布局与自适应结构',
        typography: '排版',
        components: '组件',
        extensions: '项目拓展',
        catalog: '组件目录',
        allComponents: '全部组件',
        extensionCatalog: '拓展目录',
        installation: '安装与首次使用',
        updating: '更新已复制的源码',
        colors: '颜色与主题',
        spacing: '间距与密度',
        gestures: '手势与交互',
      }
  const catalog = getComponentCatalog(english ? 'en' : 'zh')
  const componentGroups = catalogSidebar(catalog.materialComponentGroups, prefix)
  const extGroups = catalogSidebar(catalog.extensionGroups, prefix)
  const componentSidebar = [
    {
      text: labels.catalog,
      items: [{ text: labels.allComponents, link: `${prefix}/components/` }],
    },
    ...componentGroups,
  ]
  const componentPageSidebars = Object.fromEntries(
    catalog.materialComponentGroups.flatMap((group) =>
      group.items.map((item) => [
        `${prefix}/components/${item.path.split('#')[0]}`,
        componentSidebar,
      ]),
    ),
  )
  const extensionSidebar = [
    {
      text: labels.extensions,
      items: [{ text: labels.extensionCatalog, link: `${prefix}/extensions/` }],
    },
    ...extGroups,
  ]
  const extensionPageSidebars = Object.fromEntries(
    catalog.extensionGroups.flatMap((group) =>
      group.items.map((item) => [`${prefix}/components/${item.path}`, extensionSidebar]),
    ),
  )
  const startSidebar = [
    {
      text: labels.start,
      items: [
        { text: labels.startOverview, link: `${prefix}/guide/start/` },
        { text: labels.installation, link: `${prefix}/guide/start/installation` },
      ],
    },
    {
      text: labels.maintain,
      items: [{ text: labels.updating, link: `${prefix}/guide/maintain/updating` }],
    },
  ]
  const foundationsSidebar = [
    {
      text: labels.foundations,
      items: [
        { text: labels.foundationsOverview, link: `${prefix}/guide/foundations/` },
        { text: labels.layout, link: `${prefix}/guide/foundations/layout` },
        { text: labels.typography, link: `${prefix}/guide/foundations/typography` },
        { text: labels.colors, link: `${prefix}/guide/foundations/color` },
        { text: labels.spacing, link: `${prefix}/guide/foundations/spacing` },
        { text: labels.gestures, link: `${prefix}/guide/foundations/gestures` },
      ],
    },
  ]
  const startPageSidebars = Object.fromEntries(
    [
      `${prefix}/guide/`,
      `${prefix}/guide/start/`,
      `${prefix}/guide/start/installation`,
      `${prefix}/guide/installation`,
      `${prefix}/guide/updating`,
      `${prefix}/guide/maintain/updating`,
    ].map((page) => [page, startSidebar]),
  )
  const foundationsPageSidebars = Object.fromEntries(
    [
      `${prefix}/guide/design`,
      `${prefix}/guide/theme`,
      `${prefix}/guide/gestures`,
      `${prefix}/guide/foundations/`,
      `${prefix}/guide/foundations/index`,
      `${prefix}/guide/foundations/layout`,
      `${prefix}/guide/foundations/typography`,
      `${prefix}/guide/foundations/color`,
      `${prefix}/guide/foundations/spacing`,
      `${prefix}/guide/foundations/gestures`,
    ].map((page) => [page, foundationsSidebar]),
  )

  return {
    langMenuLabel: english ? 'Change language' : '切换语言',
    socialLinks: [],
    nav: [
      { text: labels.start, link: `${prefix}/guide/start/` },
      { text: labels.foundations, link: `${prefix}/guide/foundations/` },
      { text: labels.components, link: `${prefix}/components/` },
      { text: labels.extensions, link: `${prefix}/extensions/` },
    ],
    sidebar: {
      ...componentPageSidebars,
      ...extensionPageSidebars,
      [`${prefix}/components/`]: componentSidebar,
      [`${prefix}/extensions/`]: extensionSidebar,
      ...startPageSidebars,
      ...foundationsPageSidebars,
    },
  }
}

export default defineConfig({
  base: '/',
  title: 'YAM3X Vue',
  description: 'Material 3 Expressive components for Vue',
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description: 'Material 3 Expressive components for Vue',
      themeConfig: localeThemeConfig('', true),
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: '面向 Vue 的 Material 3 Expressive 组件',
      themeConfig: localeThemeConfig('/zh'),
    },
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add,architecture,arrow_back,arrow_drop_down,arrow_forward,block,bookmark,bookmarks,calendar_month,chat_bubble,check,check_box,check_box_outline_blank,check_circle,chevron_left,chevron_right,close,create_new_folder,dashboard,description,dialpad,download,draft,edit,error,expand_more,favorite,favorite_border,format_bold,format_italic,format_underlined,grid_view,history,home,inbox,info,keyboard,link,map,menu,menu_open,more_horiz,music_note,person,photo_camera,photo_library,push_pin,radio_button_checked,radio_button_unchecked,remove,save,schedule,search,search_off,settings,share,star,upload_file,video_library,view_list,warning,widgets&display=block',
      },
    ],
  ],
  cleanUrls: true,
  vite: {
    plugins: [registryComponentsPlugin()],
    ssr: {
      noExternal: ['@material/material-color-utilities'],
    },
    resolve: {
      alias: {
        '@registry': fileURLToPath(new URL('../../../registry', import.meta.url)),
      },
    },
  },
})
