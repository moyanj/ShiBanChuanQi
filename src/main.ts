import { createApp } from 'vue'
import { createPinia, Pinia } from 'pinia'
import { createPlugin } from 'vue3-persist-storages'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style/style.scss'
import App from './App.vue'

const app = createApp(App);
const p: Pinia = createPinia();

p.use(createPlugin({
    name: 'data',
    prefix: 'scq',
}))

app.use(p)
app.mount('#app');