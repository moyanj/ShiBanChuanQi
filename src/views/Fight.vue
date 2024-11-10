<script setup lang="ts">
    import { ref } from 'vue';
    import sbutton from '../components/sbutton.vue';

    var show_manager = ref(false);
</script>

<template>
    <div class="content" >
        <h1>战斗</h1>
        <p>开发中</p>
        <sbutton @click="show_manager=true">开启manager</sbutton>
    </div>

    <div class="manager content" v-if="show_manager" :class="{blur: show_manager}">
        <a>ssssssssssssssssssssssssssss</a>
        <sbutton @click="show_manager=false">关闭manager</sbutton>
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
    }

    .blur {
        backdrop-filter:blur(10px);
    }
</style>