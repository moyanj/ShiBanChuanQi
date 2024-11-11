<script setup lang="ts">
    import { ref } from 'vue';
    import { onKeyStroke } from '@vueuse/core';
    import { ElImage } from 'element-plus';
    import { useDataStore, useSaveStore } from '../js/store';
    import { icons } from '../js/utils';
    import sbutton from '../components/sbutton.vue';

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
    <div class="content">
        <sbutton @click="show_manager = true" class="menu">
            <el-image :src="icons.menu" style="width: 24px;height: 24px;" />
        </sbutton>

        <div class="enemy"></div>
        <div class="our"></div>
    </div>
    <transition name="manager">
        <div class="content" v-if="show_manager" style="z-index: 1003;backdrop-filter: blur(3px);">
            <div class="manager">
                <sbutton @click="show_manager = false" text>
                    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24">
                        <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </sbutton>
            </div>
        </div>
    </transition>
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

    .manager-enter-active,
    .manager-leave-active {
        transition: opacity 0.3s ease;
    }

    .manager-enter-from,
    .manager-leave-to {
        opacity: 0;
    }

    .enemy {
        width: 100vw;
        height: 50vh;
        background-color: red;
    }

    .our {
        width: 100vw;
        height: 50vh;
        background-color: green;
    }
</style>