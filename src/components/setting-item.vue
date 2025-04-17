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
    margin-bottom: 20px;
    padding: 7px 15px 10px 15px;
    width: 95vw;
    border: 1px solid #58585B;
    border-radius: 5px;
    box-shadow: rgba(106, 98, 90, 0.1) 0px 8px 5px;
}

.title {
    font-size: 18px;
}
</style>