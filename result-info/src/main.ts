import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'normalize.css'
import 'element-plus/dist/index.css'
import './assets/font/font-awesome.css'
import './index.css'
import Router from './router';

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn
});
app.use(Router);
app.mount('#app');

