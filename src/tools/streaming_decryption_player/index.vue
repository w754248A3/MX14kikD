<script setup lang="ts">
import { ref } from 'vue'
import { CHANNEL_NAME, type DATA } from "@/tools/streaming_decryption_player/type"


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




const channel = new BroadcastChannel(CHANNEL_NAME);

channel.onmessage = (event) => {
    const msg: DATA = event.data;
    if (msg.type === 'READY_TO_PLAY') {
        log(`收到 READY_TO_PLAY 消息，开始播放视频`);
        playVideo(msg.virtualUrl);
    }
    else if (msg.type === 'LOG_MESSAGE') {
        log(`收到SW消息: ${msg.message}`);
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

const getVedioFileData = (file: File): DATA => {

    const virtualUrl = `/streaming_decryption_player/virtual-video.mp4?t=${Date.now()}&id=${getIncrementingID()}`;

    return {
        type: "VIDEO_FILE_DATA",

        file: file,
        virtualUrl: virtualUrl
    } as DATA;

};

// --- 2. 播放逻辑 ---

const onFileEleChange = async (e: any) => {




    const file: File = e.target?.files[0];
    if (!file) {
        return;
    }
   
    log(`已选择播放文件: ${file.name}`);


    channel.postMessage(getVedioFileData(file));


};

const playVideo = (virtualUrl: string) => {

    video_virtualUrl.value = virtualUrl;

};



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
            <span>-------------------------</span>
           
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
