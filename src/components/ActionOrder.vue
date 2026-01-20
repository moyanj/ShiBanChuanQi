<script setup lang="ts">
import { computed } from 'vue';
import { Character } from '../js/character';

const props = defineProps({
    order: {
        type: Array as () => { type: 'enemy' | 'our', character: Character, distance: number }[],
        required: true
    },
    current_active_name: {
        type: String,
        default: ''
    }
});

const displayOrder = computed(() => {
    // 只显示前 8 个行动者
    return props.order.slice(0, 8);
});
</script>

<template>
    <div class="action-order-container">
        <div v-for="(item, index) in displayOrder" :key="`${item.character.inside_name}-${index}`" 
             class="action-item" :class="[item.type, { 'active': item.character.inside_name === current_active_name && index === 0 }]">
            <div class="avatar-wrapper">
                <img :src="`illustrations/${item.character.inside_name}.jpg`" class="avatar" />
            </div>
            <div class="distance-tag" v-if="index > 0">{{ Math.round(item.distance) }}</div>
        </div>
    </div>
</template>

<style scoped>
.action-order-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    background: linear-gradient(to right, rgba(0,0,0,0.5), transparent);
    height: fit-content;
    width: 80px;
}

.action-item {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #ccc;
    transition: all 0.3s ease;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
}

.action-item.our {
    border-color: #4CAF50;
}

.action-item.enemy {
    border-color: #F44336;
}

.action-item.active {
    transform: scale(1.2);
    border-color: #FFD700;
    box-shadow: 0 0 10px #FFD700;
    z-index: 10;
}

.avatar-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.distance-tag {
    position: absolute;
    right: -25px;
    background: rgba(0,0,0,0.7);
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
}
</style>
