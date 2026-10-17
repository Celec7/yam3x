import DefaultTheme from 'vitepress/theme'
import '@registry/foundations/styles/base.css'
import './custom.css'
import Layout from './Layout.vue'

export default { ...DefaultTheme, Layout }
