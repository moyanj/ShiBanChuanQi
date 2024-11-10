<script setup lang="ts">
    import { ref } from 'vue';
    import { useDataStore, useSaveStore } from '../js/store';
    import sbutton from '../components/sbutton.vue';

    const data = useDataStore();
    const save = useSaveStore();

    var show_manager = ref(false);
</script>

<template>
    <div class="content">
        <h1>战斗</h1>
        <p>开发中</p>
        <sbutton @click="show_manager = true">开启manager</sbutton>
    </div>

    <div class="manager content" v-if="show_manager">
        <sbutton @click="show_manager = false">关闭manager</sbutton>
        <sbutton @click="data.page_type = 'main'">返回</sbutton>
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

    .manager {
        z-index: 10001;
        backdrop-filter: blur(10px);
    }

</style>