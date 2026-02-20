<script setup lang="ts">
import { ref } from 'vue'


const progressCount=ref("");


const createProgressCount=(fileSize:number)=>{
  let count =0;
  const fileSizeStr = formatSize(fileSize);
  return new TransformStream({
    transform(chunk, controller) {
      
      const len = chunk.length;
      count+=len;
      const n = count/fileSize;
      progressCount.value = `${n.toFixed(2)}  ${fileSizeStr}`;

      controller.enqueue(chunk);
    }
  });
};


const onStart = async () => {


  if (!sourceFile.value || !desFile.value) {
    log(`请先选择文件`);
    return;
  }

  try {
    disabledButton.value=true;

    log(`正在处理中 (流式模式)...`);

    // 3. 创建流处理管道
    const writableStream = await desFile.value.createWritable();
    const file = await sourceFile.value.getFile();
    const readableStream = file.stream();

    // 4. 定义转换流 (TransformStream) 用于按位取反
    const inversionStream = new TransformStream({
      transform(chunk, controller) {
        // chunk 是一个 Uint8Array
        // 我们直接在原数组上操作以节省内存
        for (let i = 0; i < chunk.length; i++) {
          // 按位取反操作。
          // 在 JS 中，~x 会将其转换为 32 位有符号整数。
          // 但由于 chunk 是 Uint8Array，赋值回去时会自动截断为 8 位无符号整数。
          // 等同于 chunk[i] = chunk[i] ^ 0xFF;
          chunk[i] = ~chunk[i];
        }
        controller.enqueue(chunk);
      }
    });

    const p = createProgressCount(file.size);

    // 5. 管道连接: Read -> Invert -> Write
    await readableStream
      .pipeThrough(inversionStream)
      .pipeThrough(p)
      .pipeTo(writableStream);
    log(`成功！文件已保存。`);

  }
  catch (e: any) {

    log(e.message);
  }
  finally{
    disabledButton.value=false;
  }
};


// 辅助函数：格式化文件大小
function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


const logList = ref<string[]>([]);


const sourceFile = ref<FileSystemFileHandle | null>(null);

const desFile = ref<FileSystemFileHandle | null>(null);

const log = (s: string) => {

  logList.value.push(s);
};

const onSeleteDesFile = async () => {

  if (!('showSaveFilePicker' in window)) {


    log('<span class="error">错误：您的浏览器不支持 File System Access API。<br>请使用最新版的 Chrome、Edge 或 Opera 浏览器。</span>');

    return;
  }


  if (!sourceFile.value) {


    log("请先选择源文件");
    return;
  }

  try {

    // 2. 选择保存位置 (Output)
    // 建议的文件名：原文件名 + .obfuscated
    const saveHandle = await window.showSaveFilePicker({
      suggestedName: sourceFile.value.name + '.obfuscated',
      types: [{ description: 'Obfuscated File', accept: { '*/*': [] } }]
    });


    desFile.value = saveHandle;
  }
  catch (e: any) {
    log(e.message);
  }

};

const onSeleteSourceFile = async () => {



  // 检查浏览器是否支持 File System Access API
  if (!('showOpenFilePicker' in window)) {


    log('<span class="error">错误：您的浏览器不支持 File System Access API。<br>请使用最新版的 Chrome、Edge 或 Opera 浏览器。</span>');

    return;
  }


  try {

    // 1. 选择源文件 (Input)
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ description: 'All Files', accept: { '*/*': [] } }],
      multiple: false
    });

    sourceFile.value = fileHandle;

  }
  catch (e: any) {
    log(e.message);
  }
};

const getFileName =(f:FileSystemFileHandle|null)=>{
  if(f){

    return f.name;
  }
  else{
    return "selete file";
  }
}

const disabledButton =ref(false);

</script>

<template>
  <div class="root">
    <h1>文件混淆器 (按位取反)</h1>

    <div class="card">
      <p>选择一个文件，程序将流式读取并对所有字节进行按位取反，然后保存为新文件。</p>
      <p class="info">再次处理混淆后的文件即可还原。</p>
      <p>{{ getFileName(sourceFile) }}</p>
      <button @click="onSeleteSourceFile" :disabled="disabledButton">选择需要混淆的文件</button>
      <p>{{ getFileName(desFile) }}</p>
      <button @click="onSeleteDesFile" :disabled="disabledButton">选择保存的文件</button>
      <p>{{ progressCount }}</p>
      <button @click="onStart" :disabled="disabledButton">run</button>
      <div>
        <p v-for="s of logList">{{ s }}</p>
      </div>
    </div>
  </div>

</template>

<style scoped>
.root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  line-height: 1.6;
}

h1 {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

.card {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

#status {
  margin-top: 20px;
  font-weight: bold;
  color: #333;
  white-space: pre-wrap;
}

.error {
  color: #d9534f;
}

.success {
  color: #28a745;
}

.info {
  font-size: 0.9em;
  color: #666;
  margin-top: 10px;
}
</style>
