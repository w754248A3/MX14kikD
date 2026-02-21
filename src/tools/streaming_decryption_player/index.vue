<script setup lang="ts">
import { ref } from 'vue'
import { CHANNEL_NAME, VIRTUAL_URL_PATH, type DATA, type VIRTUAL_URL_SEARCH } from "@/tools/streaming_decryption_player/type"


const video_virtualUrl = ref<string>("");

const log_vs = ref<string[]>([]);
const log = (msg: string) => {
    log_vs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
};
const sw_is_ok = ref<boolean>(false);

if (!('serviceWorker' in navigator)) {


    log('Service Worker not supported');


}
else {

    if (!navigator.serviceWorker.controller) {

        log('Main Service Worker not ready. Please refresh.');


    }
    else {

        sw_is_ok.value = true;
    }
}

const createUrl = (urlSearch:VIRTUAL_URL_SEARCH)=>{

    return `${VIRTUAL_URL_PATH}?t=${urlSearch.t}&id=${urlSearch.id}&d=${urlSearch.d}`;
};


const channel = new BroadcastChannel(CHANNEL_NAME);

channel.onmessage = (event) => {
    const msg: DATA = event.data;
    if (msg.type === 'READY_TO_PLAY') {

        if(msg.virtualUrl.d){
            log(`收到 READY_TO_DOWNLOAD 消息，开始download视频`);
            triggerVirtualDownload(createUrl(msg.virtualUrl));
        }
        else{
            log(`收到 READY_TO_PLAY 消息，开始播放视频`);
            playVideo(createUrl(msg.virtualUrl));
        }

        
    }
    else if (msg.type === 'LOG_MESSAGE') {
        log(`收到SW消息: ${msg.message}`);
    }
    else{
        log("error mesage from sw");
    }
};




const on_Error = (e: Event, message: string) => {
    log(`错误:${message} ${JSON.stringify(e)}`);
};
const getIncrementingID = (() => {
    const array = new Uint32Array(10);
    window.crypto.getRandomValues(array);

    let id = array[0] as number;

    return function () {
        return id++;
    }

})();

const getVedioFileData = (file: File, isDownload:boolean): DATA => {

    return {
        type: "VIDEO_FILE_DATA",

        file: file,
        virtualUrl: {t:Date.now().toString(), id:getIncrementingID().toString(), d:isDownload}
    } as DATA;

};

// --- 2. 播放逻辑 ---

const onFileEleChange = async (e: any) => {




    const file: File = e.target?.files[0];
    if (!file) {
        return;
    }
   
    log(`已选择播放文件: ${file.name}`);


    channel.postMessage(getVedioFileData(file, false));


};

const onDownloadFileChange= async (e: any) => {




    const file: File = e.target?.files[0];
    if (!file) {
        return;
    }
   
    log(`已选择download文件: ${file.name}`);


    channel.postMessage(getVedioFileData(file, true));


};

const playVideo = (virtualUrl: string) => {

    video_virtualUrl.value = virtualUrl;

};

const triggerVirtualDownload = (url:string)=> {
    const timeout = 5000;
  // 1. 创建 iframe
  const iframe = document.createElement('iframe');
  
  // 2. 隐藏 iframe (使用绝对定位移出屏幕，比 display: none 更安全，兼容某些老旧浏览器)
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';

  // 3. 将 iframe 挂载到 body (脱离 Vue 组件的生命周期控制)
  document.body.appendChild(iframe);

  // 4. 触发请求
  // 注意：赋值 src 后，浏览器会立刻发起对该 URL 的 GET 请求
  iframe.src = url;

  // 5. 垃圾回收清理
  // 因为响应头是 Content-Disposition: attachment，浏览器不会触发 iframe 的 onload 事件
  // 所以我们只能用一个合理的定时器来清理 DOM。5秒足够浏览器底层接管流式下载了。
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
      // 释放 iframe 的 src 内存
      iframe.src = 'about:blank';
    }
  }, timeout);
}

</script>

<template>

    <div class="root" @error="(e) => on_Error(e, 'root error')">

        <h1>Web 视频流式解密 (Android 兼容)</h1>
        <div class="log">
            <div v-for="v of log_vs">{{ v }}</div>
        </div>


        <div v-if="sw_is_ok" class="box" style="background-color: #e0f9e0;">
            <h2>▶️ 播放加密文件</h2>
            <p>选择按位取反的混淆文件，浏览器将边解密边播放。</p>
            <input type="file" @change="onFileEleChange">
            <span>-----left play or right download----</span>
            <input type="file" @change="onDownloadFileChange">
            <video v-if="video_virtualUrl !== ''" :src="video_virtualUrl" controls playsinline autoplay
                @error="(e) => on_Error(e, 'video error')"></video>
        </div>

    </div>

</template>

<style scoped>
.root {
    font-family: sans-serif;
    max-width: 800px;
    margin: 20px auto;
    padding: 0 10px;
}

.box {
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

h2 {
    margin-top: 0;
}

video {
    width: 100%;
    background: #000;
    margin-top: 10px;
}

button {
    padding: 8px 16px;
    cursor: pointer;
}

.log {
    background: #f0f0f0;
    padding: 10px;
    font-size: 12px;
    height: 300px;
    overflow-y: scroll;
}
</style>
