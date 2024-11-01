<script setup lang="ts">
import { useFps } from '@vueuse/core';

const fps = useFps();
</script>

<template>
    <div align="center">
        <h1>战斗</h1>
        <p>开发中{{  fps  }}</p>
    </div>
</template>

<style scoped lang="scss">
</style>