import { createApp, getCurrentInstance } from 'vue'
import './style/index.scss'
import './style/theme.scss'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css';
import 'animate.css';
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { router } from './router'
import { store } from './store'



const app = createApp(App)
app.use(ElementPlus, {locale: zhCn})
app.use(router)
app.use(store)
app.mount('#app')

// 屏蔽 Vue 警告
app.config.warnHandler = () => null
