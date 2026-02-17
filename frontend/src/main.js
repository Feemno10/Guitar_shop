import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ถ้ามีไฟล์ css กลาง
import './style.css'

createApp(App)
  .use(router)
  .mount('#app')
