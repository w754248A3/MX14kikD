/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'
import { initSwInterceptor } from '@/tools/sw-interceptor/sw-handler'

declare let self: ServiceWorkerGlobalScope

// 自动跳过等待，让新 Service Worker 立即激活
self.skipWaiting()
// 让新 Service Worker 立即接管页面
clientsClaim()

// 清理过期缓存
cleanupOutdatedCaches()

// 预缓存由 Vite 构建生成的资源
precacheAndRoute(self.__WB_MANIFEST)

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
initSwInterceptor()
