<script setup lang="ts">
const props = defineProps({
    label: {
        type: String,
        required: true
    }
})
</script>

<template>
    <div class="item">
        <p class="title">{{ props.label }}</p>
        <slot></slot>
    </div>
</template>

<style scoped>
.item {
    margin-bottom: 25px;
    padding: 20px 25px;
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    box-sizing: border-box;
    transition: all 0.3s;
}

.item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
}

.title {
    font-size: 0.85rem;
    color: #f7d358;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1.5px;
    margin-bottom: 15px;
    border-left: 3px solid #f7d358;
    padding-left: 12px;
}
</style>