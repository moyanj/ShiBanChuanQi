<template>
    <div class="app-root">
        <div class="ui-fixed-layer">
            <sbutton @click="dataStore.page_type = 'main'" class="back-btn" text
                v-show="dataStore.page_type != 'fight' && dataStore.page_type != 'main'">
                <img :src="icons.left" />
                <span>返回</span>
            </sbutton>

            <div @click="console_handler()" class="console-trigger"></div>
        </div>

        <Transition name="page-fade">
            <component :is="currentPageComponent" :key="dataStore.page_type" />
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import Home from './views/Home.vue';
import Fight from './views/Fight.vue';
import About from './views/About.vue';
import Setting from './views/Setting.vue';
import Bag from './views/Bag.vue';
import Character from './views/Character.vue';
import Wish from './views/Wish.vue';

import { icons, isLandscape } from './js/utils';
import { console_handler } from './js/key';
import { useDataStore, APM } from './js/stores';
import { ElMessageBox } from 'element-plus';
import { useMagicKeys } from '@vueuse/core';

const dataStore = useDataStore();

const currentPageComponent = computed(() => {
    switch (dataStore.page_type) {
        case 'main': return Home;
        case 'fight': return Fight;
        case 'about': return About;
        case 'setting': return Setting;
        case 'bag': return Bag;
        case 'character': return Character;
        case 'wish': return Wish;
        default: return null;
    }
});

if (isLandscape() === false) {
    ElMessageBox.alert("请切换至横屏，以获得更好的游戏体验", '警告', {
        confirmButtonText: '确定',
        type: 'warning',
        showClose: false,
    });
}

if (window.electron) {
    dataStore.is_electron = true;
} else {
    dataStore.is_electron = false;
}

fetch('build_info.json')
    .then(response => response.json())
    .then(data => {
        dataStore.build_info = data;
    })
    .catch(error => {
        if (!dataStore.is_dev) {
            ElMessageBox.alert("配置文件加载错误，请重新下载游戏", '错误', {
                confirmButtonText: '确定',
                type: 'error',
            }).then(() => {
                window.close();
            });
        }
    });

APM.add("background_music", 'audio/background/main.mp3', { loop: true });

if (!dataStore.is_dev) {
    APM.play("background_music");
}

const keys = useMagicKeys();
watch(keys["Alt+T"], console_handler);
watch(keys["Escape"], () => {
    if (dataStore.page_type !== 'main' && dataStore.page_type !== 'fight') {
        dataStore.page_type = 'main';
    }
});
</script>

<style>
/* 全局重置与基础样式 */
body,
html {
    margin: 0;
    padding: 0;
    background-color: #0c0c0e;
    color: #ececec;
    overflow: hidden;
    user-select: none;
}

.app-root {
    width: 100vw;
    height: 100vh;
    position: relative;
    background-color: #0c0c0e;
}

/* 固定 UI 层 */
.ui-fixed-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 2000;
}

.back-btn {
    position: absolute;
    top: 15px;
    left: 20px;
    pointer-events: auto;
    z-index: 1000;
}

.back-btn img {
    width: 16px;
    height: 16px;
    margin-right: 5px;
}

.console-trigger {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 30px;
    height: 30px;
    pointer-events: auto;
    cursor: default;
}

/* 页面切换动画 */
.page-fade-enter-active,
.page-fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-fade-enter-from {
    opacity: 0;
    transform: scale(1.05);
}

.page-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
