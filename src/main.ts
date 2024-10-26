import { createApp } from 'vue';
import { createPinia, Pinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './style/style.scss';
import App from './App.vue';

const app = createApp(App);
const p: Pinia = createPinia();

p.use(createPersistedState())

app.use(p)
app.mount('#app');


console.log(`流萤天下第一！！！！`)