<script setup lang="ts">
import { onMounted } from 'vue';
import { BattleEngine } from '../js/battle/battle';

let engine = new BattleEngine([], []);

onMounted(() => {
    engine.start();
    console.log("ok")
})
</script>

<template>
    <button @click="console.log('ok')">开始战斗</button>
</template>

<style scoped></style>
