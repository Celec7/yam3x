import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { getComponentCatalog, type ComponentGroup } from '../component-catalog'

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
        guide: 'Guides',
        design: 'Design guidance',
        components: 'Components',
        extensions: 'Extensions',
        catalog: 'Component catalog',
        allComponents: 'All components',
        extensionCatalog: 'Extension catalog',
        start: 'Overview',
        installation: 'Installation and first use',
        updating: 'Updating copied source',
        colors: 'Color and theming',
        gestures: 'Gestures and interaction',
      }
    : {
        guide: '使用指南',
        design: '设计指南',
        components: '组件',
        extensions: '项目拓展',
        catalog: '组件目录',
        allComponents: '全部组件',
        extensionCatalog: '拓展目录',
        start: '总览',
        installation: '安装与首次使用',
        updating: '更新已复制的源码',
        colors: '颜色与主题',
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
  const guideSidebar = [
    {
      text: labels.guide,
      items: [
        { text: labels.start, link: `${prefix}/guide/` },
        { text: labels.installation, link: `${prefix}/guide/installation` },
        { text: labels.updating, link: `${prefix}/guide/updating` },
      ],
    },
  ]
  const designSidebar = [
    {
      text: labels.design,
      items: [
        { text: labels.start, link: `${prefix}/guide/design` },
        { text: labels.colors, link: `${prefix}/guide/theme` },
        { text: labels.gestures, link: `${prefix}/guide/gestures` },
      ],
    },
  ]
  const designPageSidebars = Object.fromEntries(
    ['design', 'theme', 'gestures'].map((page) => [`${prefix}/guide/${page}`, designSidebar]),
  )

  return {
    langMenuLabel: english ? 'Change language' : '切换语言',
    socialLinks: [],
    nav: [
      { text: labels.guide, link: `${prefix}/guide/` },
      { text: labels.design, link: `${prefix}/guide/design` },
      { text: labels.components, link: `${prefix}/components/` },
      { text: labels.extensions, link: `${prefix}/extensions/` },
    ],
    sidebar: {
      ...componentPageSidebars,
      ...extensionPageSidebars,
      [`${prefix}/components/`]: componentSidebar,
      [`${prefix}/extensions/`]: extensionSidebar,
      [`${prefix}/guide/`]: guideSidebar,
      ...designPageSidebars,
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
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add,architecture,arrow_back,arrow_drop_down,arrow_forward,block,bookmark,bookmarks,calendar_month,chat_bubble,check,check_box,check_box_outline_blank,check_circle,chevron_left,chevron_right,close,create_new_folder,dashboard,description,dialpad,download,draft,edit,error,expand_more,favorite,favorite_border,format_bold,format_italic,format_underlined,grid_view,history,home,inbox,info,link,map,menu,menu_open,more_horiz,music_note,person,photo_camera,photo_library,push_pin,radio_button_checked,radio_button_unchecked,remove,save,schedule,search,search_off,settings,share,star,upload_file,video_library,view_list,warning,widgets&display=block',
      },
    ],
  ],
  cleanUrls: true,
  vite: {
    plugins: [tailwindcss()],
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
