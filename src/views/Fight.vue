<script setup lang="ts">
    import { useFps } from '@vueuse/core';

    const fps = useFps();
</script>

<template>
    <div class="content">
        <h1>战斗</h1>
        <p>开发中{{ fps }}</p>
    </div>
</template>

<style scoped lang="scss">
    .content {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: beige;
    }
    
    .back {
        display: none;
    }
</style>