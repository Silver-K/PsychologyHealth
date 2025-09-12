import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'normalize.css'
import 'element-plus/dist/index.css'
import './assets/font/font-index.css'
import './index.css'
import Router from './router';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';

const app = createApp(App)
app.use(ElementPlus, {
  locale: zhCn
});
app.use(Particles, {
  init: async engine => {
    await loadSlim(engine);
  }
});
app.use(Router);
app.mount('#app');

