import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import '@/assets/index.scss'
import '@/../packages/assets/fonts/iconfont.css'
import FastCrudUI from '@/../packages/index.js'
import http from "@/http";

const app = createApp(App)
app.use(ElementPlus, {
    // element-plus 配置项
    locale: zhCn
})
app.use(FastCrudUI, {
    $http: http,
    // fast-crud配置项
})
// 注册element-plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')
