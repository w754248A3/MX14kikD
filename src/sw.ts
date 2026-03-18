/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute} from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing'
import { initSwInterceptor } from '@/tools/sw-interceptor/sw-handler'
import { initSwInterceptor as init_streaming_decryption_player} from '@/tools/streaming_decryption_player/sw-handler'



declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches(); // 清理
precacheAndRoute(self.__WB_MANIFEST); // 缓存
clientsClaim(); // 接管

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log("SKIP_WAITING");
    self.skipWaiting();
  }
});
console.log("PWA RUN ");

// 拦截 /test 路径并返回 "hello world"
registerRoute(
  ({ url }) => url.pathname === '/test',
  async () => {
    return new Response('hello world', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
)

// Initialize Tool Interceptors
initSwInterceptor();


init_streaming_decryption_player();
