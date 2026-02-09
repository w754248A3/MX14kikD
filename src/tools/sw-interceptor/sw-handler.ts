import { registerRoute } from 'workbox-routing'

export function initSwInterceptor() {
  const channel = new BroadcastChannel('sw-interceptor')
  let storedContent = 'Default content from Main Service Worker'

  // Listen for updates from the UI
  channel.onmessage = (event) => {
    if (event.data && event.data.type === 'SET_CONTENT') {
      storedContent = event.data.content
      console.log('[Main SW] Interceptor content updated:', storedContent)
      
      // Send confirmation back
      channel.postMessage({ type: 'CONFIRM', success: true })
    }
  }

  // Intercept requests to the virtual path
  registerRoute(
    ({ url }) => url.pathname.includes('/tools/sw-interceptor/api/data'),
    async () => {
      console.log('[Main SW] Intercepting virtual path request')
      return new Response(storedContent, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
  )

  console.log('[Main SW] Interceptor module initialized')
}
