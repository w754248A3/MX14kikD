import { registerRoute } from 'workbox-routing'
import { CHANNEL_NAME, VIRTUAL_URL_PATH, type DATA, type VIRTUAL_URL_SEARCH } from "@/tools/streaming_decryption_player/type"

export function initSwInterceptor() {



    let currentFileData: DATA | null = null;


    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {

        const data: DATA = event.data;

        if (data && data.type === 'VIDEO_FILE_DATA') {
            
            currentFileData = data;

            channel.postMessage({
                type: "READY_TO_PLAY",
                virtualUrl: currentFileData.virtualUrl
            } as DATA);
        }
        else{
            log("error message from ui");
        }
    };

    const log = (mes: string) => {
        channel.postMessage({
            type: "LOG_MESSAGE",
            message: mes
        } as DATA);
    };




    // 3. 处理视频流请求
    async function handleVideoRequest(request: Request, currentFile: File, urlSearch:VIRTUAL_URL_SEARCH) {
        if (!currentFile) {
            log("File not selected");
            return new Response("File not selected", { status: 404 });
        }
        
        const url = new URL(request.url);

        const search = url.searchParams;

        if(search.get("t") !== urlSearch.t || search.get("id") !== urlSearch.id){
            log("search error");
            return new Response("search error", { status: 404 });
        }
        
        const filename = currentFile.name;
        const filetype = currentFile.type || "application/octet-stream";

        log(`[SW] filename${filename} filetype${filetype}`);

        const fileSize = currentFile.size;
        const rangeHeader = request.headers.get('Range');

        const headers = new Headers();

        // 解析 Range 头 (例如: bytes=0-1048575)
        // 视频播放器通常会分段请求，而不是一次请求所有
        let start = 0;
        let end = fileSize - 1;

        let status=200;

        if (rangeHeader) {
            
            const parts = rangeHeader.replace(/bytes=/, "").split("-");
            start = parseInt(parts[0] as string, 10);
            if (parts[1]) {
                end = parseInt(parts[1], 10);
            }

            status=206;
            headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            headers.set('Accept-Ranges','bytes');
        }
      

        // 计算 Content-Length
        const chunkSize = end - start + 1;

        // 4. 关键：切片读取原始文件
        // slice 是零拷贝的，性能很高
        const fileSlice = currentFile.slice(start, end + 1);

        // 5. 创建解密流 (位取反)
        const originalStream = fileSlice.stream();

        const decryptStream = new TransformStream({
            transform(chunk, controller) {
                // chunk 是 Uint8Array
                // 直接在内存中原地修改，速度极快
                for (let i = 0; i < chunk.length; i++) {
                    // 按位取反 (~x)。在 Uint8Array 中，~0 (0xFF) 是一样的效果
                    chunk[i] = ~chunk[i];
                }
                controller.enqueue(chunk);
            }
        });

        
        headers.set('Content-Length', chunkSize.toString());

        headers.set('Content-Type', filetype);

        if(urlSearch.d){
            headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
        
            headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            headers.set("Pragma", "no-cache");
            headers.set("Expires", "0");
        }


        
        // 浏览器会认为这是一个普通的网络视频流
        return new Response(originalStream.pipeThrough(decryptStream), {
            status: status,
            headers: headers
        });
    }








    // Intercept requests to the virtual path
    registerRoute(
        ({ url }) => {
            const b = currentFileData && currentFileData.virtualUrl && url.pathname.endsWith(VIRTUAL_URL_PATH);
           
            if(b){
                log(`[SW] sw run ${url.href}`);
            }
            return b;
        },
        ({ request}) => {

            if (currentFileData?.file) {
                return handleVideoRequest(request, currentFileData.file, currentFileData.virtualUrl);
            }
            else {

                log("[SW] file is null");

                return Promise.resolve(Response.error());
            }


        }
    )
}
