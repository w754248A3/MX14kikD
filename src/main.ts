import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New content available. Call updateSW(true) to reload.')
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline.')
  },
  onRegistered(r) {
    console.log('[PWA] Service Worker registered')
    if (r) {
      console.log('[PWA] Registration scope:', r.scope)
    }
  },
  onRegisterError(error) {
    console.error('[PWA] Registration failed:', error)
  }
})

// Expose updateSW for debugging in console
if (import.meta.env.DEV) {
  // @ts-expect-error - debugging purpose
  window.updateSW = updateSW
}

createApp(App).mount('#app')
