<script setup lang="ts">
    import { ref } from 'vue';
    import { onKeyStroke } from '@vueuse/core';
    import { ElImage } from 'element-plus';
    import { useDataStore, useSaveStore } from '../js/store';
    import { icons } from '../js/utils';
    import sbutton from '../components/sbutton.vue';
    import { ChatCompletion } from "@baiducloud/qianfan";

    const data = useDataStore();
    const save = useSaveStore();

    var show_manager = ref(false);

    onKeyStroke("Escape", (e) => {
        e.preventDefault();
        if (show_manager.value) {
            show_manager.value = false;
        } else {
            show_manager.value = true;
        }

    })


</script>

<template>
    <div class="content fight-c">
        <sbutton @click="show_manager = true" class="menu">
            <el-image :src="icons.menu" style="width: 24px;height: 24px;" />
        </sbutton>
        <div class="toolbar"></div>
        <div class="enemy"></div>
        <div class="our"></div>
    </div>

    <div class="content" v-if="show_manager" style="z-index: 1003;backdrop-filter: blur(10px);">
        <div class="manager">
            <sbutton @click="show_manager = false" text>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
                    <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18 6L6 18M6 6l12 12" />
                </svg>
            </sbutton>
            <sbutton @click="data.page_type = 'main'">exit</sbutton>
        </div>
    </div>

</template>

<style scoped lang="scss">
    .content {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
    }

    .back {
        display: none;
    }

    .menu {
        position: fixed;
        left: 15px;
        top: 15px;
        z-index: 1002;
    }

    .manager {
        margin: 15px;
    }

    .enemy {
        width: 100vw;
        height: 50vh;
    }

    .our {
        width: 100vw;
        height: 50vh;
    }

    .fight-c {
        background: no-repeat url('../assets/bg/fight.jpeg');
        background-size: cover;
    }

    .toolbar {
        border-radius: 10px 10px 10px 10px;
        position: fixed;
        top: calc(50vh - 150px / 2);
        width: 50px;
        height: 150px;
        background-color: #2a2a2a;
        margin-left: 10px;
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.3);
    }
</style>