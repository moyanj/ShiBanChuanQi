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
    return props.order.slice(0, 10);
});
</script>

<template>
    <div class="action-order-rail">
        <div v-for="(item, index) in displayOrder" :key="`${item.character.inside_name}-${index}`" 
             class="order-node" :class="[item.type, { 'is-active': index === 0 }]">
            <div class="node-body">
                <img :src="`illustrations/${item.character.inside_name}.jpg`" class="node-avatar" />
                <div class="node-border"></div>
            </div>
            <div class="distance-value" v-if="index > 0">{{ Math.round(item.distance) }}</div>
        </div>
    </div>
</template>

<style scoped>
.action-order-rail {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 30px 20px;
    background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 100%);
    height: fit-content;
    pointer-events: none;
}

.order-node {
    position: relative;
    width: 44px;
    height: 44px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.node-body {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    background: #222;
}

.node-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8);
}

.node-border {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border: 2px solid rgba(255,255,255,0.2);
}

.our .node-border { border-color: rgba(72, 187, 120, 0.6); }
.enemy .node-border { border-color: rgba(245, 108, 108, 0.6); }

.is-active {
    width: 54px;
    height: 54px;
    margin-left: 10px;
    z-index: 10;
}

.is-active .node-border {
    border-color: #f7d358;
    box-shadow: 0 0 15px rgba(247, 211, 88, 0.5);
    border-width: 3px;
}

.is-active .node-avatar {
    filter: brightness(1.1);
}

.distance-value {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 10px;
    font-size: 10px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 1px 3px #000;
    background: rgba(0,0,0,0.4);
    padding: 1px 4px;
    border-radius: 2px;
}
</style>
