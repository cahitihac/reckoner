import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { i18n } from './i18n/index.js'
import { inject } from '@vercel/analytics'

inject()

createApp(App).use(i18n).mount('#app')
