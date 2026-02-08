/**
 * Cloudflare Worker 透明传输脚本 (MITM 专用版)
 * 
 * 架构流程：
 * Browser (认为在访问 example.com) 
 * -> MITM 程序 (解密，注入 X-Upstream-Url Header) 
 * -> Worker (读取 Header，作为代理) 
 * -> Server (真实 example.com)
 * 
 * 关键特性：
 * 1. 禁用自动重定向：由浏览器处理 301/302，确保 URL 栏变化符合预期。
 * 2. 彻底的流式传输：支持视频流、大文件。
 * 3. 头部清洗：防止压缩冲突和指纹泄露。
 */

export interface Env {}

// 你的 MITM 程序注入的 Header key
const HEADER_UPSTREAM_URL = 'X-Upstream-Url';

// 请求头黑名单 (发给上游时删除)
const REQUEST_HEADERS_TO_REMOVE = [
  HEADER_UPSTREAM_URL,
  'host',                 // 必须重写
  // 'cf-connecting-ip',     // 隐藏真实来源是 Cloudflare
  // 'cf-ipcountry',
  // 'cf-ray',
  // 'cf-visitor',
  // 'x-forwarded-for',      // 抹除代理痕迹
  // 'x-forwarded-proto',
  // 'x-real-ip',
  // // 标准逐跳 Header
  // 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade',
  // [重要] 删除 Accept-Encoding，防止上游返回 Worker 无法直接透传的特殊压缩格式
  // 虽然 Cloudflare 会自动解压 gzip，但删除它可以减少不可预见的编码问题，让 Worker 也就是 Cloudflare 边缘节点决定怎么和上游协商
  // 'accept-encoding' // (可选：如果遇到乱码可以取消注释这行，强制上游返回明文)
];


const RESPONSE_HEADERS_TO_REMOVE:string[] = [
  //'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade',
  // [关键] 删除 Content-Encoding 和 Content-Length
  // Worker fetch 会自动解压 gzip/brotli，得到的是解压后的流。
  // 如果保留 Content-Encoding: gzip，浏览器收到解压后的流却按 gzip 解析，会报错。
  //'content-encoding', 
  //'content-length' 
];



const filterHeadersToNewHeaders = (oldHeaders :Headers, deleteList:string[])=>{

  const newHeaders = new Headers(oldHeaders);

  

  for (const h of deleteList) {
    
    newHeaders.delete(h);
  }

  return newHeaders;
};

export const onRequest: PagesFunction<Env> = async (context) =>  {
   
    const request = context.request;
    
    const tlsVersion = request.cf?.tlsVersion;
    const httpVersion = request.cf?.httpProtocol;

    // Allow only TLS versions 1.2 and 1.3
    if (tlsVersion !== "TLSv1.2" && tlsVersion !== "TLSv1.3") {
      return new Response("Please use TLS version 1.2 or higher.", {status: 403});
    }

    //console.log({tlsVersion, httpVersion});
   
   
    // 1. 读取目标 URL
    const upstreamUrlStr = request.headers.get(HEADER_UPSTREAM_URL);
   
    if (!upstreamUrlStr) 
    {
      return new Response('Missing Upstream URL', { status: 400 });
    }
      

    let upstreamUrl: URL;
    try {
      upstreamUrl = new URL(upstreamUrlStr);
    } catch (e) {
      return new Response('Invalid Upstream URL', { status: 400 });
    }

    // 2. 构造请求头
    const newRequestHeaders =  filterHeadersToNewHeaders(request.headers, REQUEST_HEADERS_TO_REMOVE);

    // 伪装 Host (核心)
    newRequestHeaders.set('Host', upstreamUrl.hostname);
  
    // 3. 构造请求
    const upstreamRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: newRequestHeaders,
      body: request.body,
      // [关键修改] manual: 不自动跟随重定向。
      // 如果上游返回 301/302，Worker 直接把这个响应透传给 MITM -> 浏览器。
      // 让浏览器自己去跳转，这样浏览器的地址栏和历史记录才是正确的。
      redirect: 'manual', 
      cf: {
        cacheTtl: 0,          // 彻底禁用 CF 边缘缓存
        cacheEverything: false,
      },
    });

    try {
      // 4. 发起流式请求
      const upstreamResponse = await fetch(upstreamRequest);

      // 5. 处理响应头
      const newResponsetHeaders =filterHeadersToNewHeaders(upstreamResponse.headers,RESPONSE_HEADERS_TO_REMOVE );
     
      // 6. 返回响应
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: newResponsetHeaders,
        cf: {
        cacheTtl: 0,          // 彻底禁用 CF 边缘缓存
        cacheEverything: false,
        },
      });

    } catch (err: any) {
      return new Response(`Proxy Error: ${err.message}`, { status: 502 });
    }
}