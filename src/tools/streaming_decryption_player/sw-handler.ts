import { registerRoute } from 'workbox-routing'
import { CHANNEL_NAME, type DATA } from "@/tools/streaming_decryption_player/type"

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
    };

    const log = (mes: string) => {
        channel.postMessage({
            type: "LOG_MESSAGE",
            message: mes
        } as DATA);
    };




    // 3. 处理视频流请求
    async function handleVideoRequest(request: Request, currentFile: File) {
        if (!currentFile) {
            console.log("File not selected");
            return new Response("File not selected", { status: 404 });
        }
        const filename = currentFile.name;
        const filetype = currentFile.type || "video/mp4";

        log(`[SW] filename${filename} filetype${filetype}`);

        const fileSize = currentFile.size;
        const rangeHeader = request.headers.get('Range');

        // 解析 Range 头 (例如: bytes=0-1048575)
        // 视频播放器通常会分段请求，而不是一次请求所有
        let start = 0;
        let end = fileSize - 1;

        if (rangeHeader) {
            const parts = rangeHeader.replace(/bytes=/, "").split("-");
            start = parseInt(parts[0] as string, 10);
            if (parts[1]) {
                end = parseInt(parts[1], 10);
            }
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

        // 6. 返回 206 Partial Content
        // 浏览器会认为这是一个普通的网络视频流
        return new Response(originalStream.pipeThrough(decryptStream), {
            status: 206,
            headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize.toString(),
                'Content-Type': filetype,
                //'Content-Disposition': `attachment; filename="${filename}"`,
            }
        });
    }








    // Intercept requests to the virtual path
    registerRoute(
        ({ url }) => {
            const b = currentFileData && currentFileData.virtualUrl && url.href.endsWith(currentFileData.virtualUrl);
           
            if(b){
                log(`[SW] sw run ${url.href}`);
            }
            return b;
        },
        ({ request }) => {

            if (currentFileData?.file) {
                return handleVideoRequest(request, currentFileData.file);
            }
            else {

                log("[SW] file is null");

                return Promise.resolve(Response.error());
            }


        }
    )
}
