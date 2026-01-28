/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

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
