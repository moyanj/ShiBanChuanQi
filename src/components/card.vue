<script setup lang="ts">
    import { defineProps, computed } from 'vue';

    const props = defineProps({
        character: {
            type: String,
            required: true
        }
    })

    const backgroundStyle = computed(() => ({
        backgroundImage: `url(illustrations/${props.character}.png)`
    }))
</script>

<template>
    <div class="fight-card" :style="backgroundStyle">
    </div>
</template>

<style lang="scss" scoped>
    .fight-card {
        height: 240px;
        width: 180px;
        border: 3px solid green;
        background-size: cover;
        background-position: center;
        margin-right: 20px;
        transition-duration: 300ms;
    }

    .fight-card:hover {
        transform: translateY(-5px);
        transition-duration: 300ms;
    }
</style>
