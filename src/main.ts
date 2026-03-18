import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

import './styles/main.css'

console.log("run 101");


window.onerror = function(message, source, lineno, colno, error) {


  console.log('js_runtime error', {
    type: 'js_runtime',
    message: message,
    stack: error?.stack,
    file: source,
    line: lineno,
    col: colno
  });

  return false; // 返回 false 让错误继续在控制台打印
}

window.addEventListener('unhandledrejection', (event) => {

    console.log("promise_unhandled",{
    type: 'promise_unhandled',
    reason: event.reason // 通常是一个 Error 对象
  } );

})



registerSW({
  immediate: true, // 立即注册，不等待 window.load
  onRegisterError(error) {
    // 【异常收集】在这里捕获注册失败
    console.log({
      type: 'PWA_REGISTRATION_ERROR',
      message: error.message
    });
  },
  onRegisteredSW(swUrl, registration) {
    console.log('SW 已注册:', swUrl, registration);
  }
});


const app = createApp(App);


app.config.errorHandler = (err, instance, info) => {
  // err: 错误对象
  // instance: 发生错误的组件实例
  // info: Vue 特有的错误信息，比如 "setup function", "render function"
  
  console.log('Vue Error:', err, instance, info);
  
}

app.use(createPinia());
app.use(router);
console.log("run mount font");
app.mount('#app');
console.log("run mount bofr");