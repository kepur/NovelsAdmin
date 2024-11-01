import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
const app = createApp(App)

//引入自定义插件对象

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
