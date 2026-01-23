import { createApp } from 'vue';
import { createPinia, Pinia } from 'pinia';

//import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './style/style.css';
import App from './App.vue';
import './js/lib/gt4';
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'


const app = createApp(App);
const p: Pinia = createPinia();


app.use(p);
app.use(ElementPlus, {
    locale: zhCn,
})
app.mount('#app');

console.log(`流萤天下第一！！！！`);