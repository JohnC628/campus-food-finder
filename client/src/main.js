import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 👈 1. 引入剛剛寫好的 router 設定檔

const app = createApp(App)

app.use(router) // 👈 2. 關鍵在這裡！告訴 Vue 我們要使用路由功能

app.mount('#app')