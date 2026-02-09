import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './styles/main.css'

// PWA
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New content available.')
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline.')
  },
})

// Log for debugging (and to use the variable)
console.log('PWA updater initialized', updateSW)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
