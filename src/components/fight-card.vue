<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { Character } from '../js/character';

const props = defineProps({
    character: {
        type: Object as () => Character,
        required: true
    },
    is_active: {
        type: Boolean,
        default: false
    },
    atb_value: {
        type: Number,
        default: 0
    },
    is_enemy: {
        type: Boolean,
        default: false
    },
    is_selected: {
        type: Boolean,
        default: false
    },
    is_hit: { // 新增：被击中状态
        type: Boolean,
        default: false
    }
})

const hpPercentage = computed(() => {
    if (props.character.max_hp === 0) return '0%';
    return `${(props.character.hp / props.character.max_hp) * 100}%`;
});

const atbPercentage = computed(() => {
    return `${Math.min(props.atb_value, 100)}%`;
});

const cardClass = computed(() => {
    return {
        'fight-card': true,
        'is-active': props.is_active,
        'is-selected': props.is_selected,
        'is-dead': props.character.hp <= 0,
        'is-enemy': props.is_enemy,
        'is-hit': props.is_hit
    };
});
</script>

<template>
    <div :class="cardClass">
        <div class="portrait-box">
            <img :src="`illustrations/${character.inside_name}.jpg`" class="portrait-img" />
            <div class="active-indicator" v-if="is_active"></div>
            <div class="selected-indicator" v-if="is_selected"></div>
        </div>
        
        <div class="card-hud">
            <div class="name-box">
                <span class="name">{{ character.name }}</span>
            </div>
            
            <div class="bars-box">
                <!-- HP Bar -->
                <div class="bar-container hp">
                    <div class="bar-fill" :style="{ width: hpPercentage }"></div>
                    <span class="bar-text">{{ Math.round(character.hp) }}</span>
                </div>
                
                <!-- ATB Bar (Our characters only) -->
                <div class="bar-container atb" v-if="!is_enemy">
                    <div class="bar-fill" :style="{ width: atbPercentage }"></div>
                </div>
            </div>
            
            <!-- Buffs/Debuffs (Simplified) -->
            <div class="effects-row" v-if="character.active_effects.length > 0">
                <div v-for="effect in character.active_effects.slice(0, 4)" :key="effect.id" 
                     class="effect-icon" :class="effect.type">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fight-card {
    position: relative;
    width: 160px;
    height: 240px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
}

.is-dead {
    filter: grayscale(1) opacity(0.5);
    transition: all 1s ease;
}

.portrait-box {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    background: #1a1a1e;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
}

.portrait-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.is-active .portrait-box {
    border-color: #f7d358;
    box-shadow: 0 0 20px rgba(247, 211, 88, 0.3);
}

.is-active .portrait-img {
    transform: scale(1.05);
}

.is-hit {
    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
}

.is-selected .portrait-box {
    border-color: #ff4757;
    box-shadow: 0 0 20px rgba(255, 71, 87, 0.4);
}

.active-indicator {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border: 4px solid #f7d358;
    animation: pulse 2s infinite;
    pointer-events: none;
}

.selected-indicator {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255, 71, 87, 0.1);
    border: 4px solid #ff4757;
    pointer-events: none;
}

@keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

/* Card HUD */
.card-hud {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
    z-index: 2;
}

.name-box {
    margin-bottom: 8px;
}

.name {
    font-size: 14px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 2px 4px #000;
    letter-spacing: 1px;
}

.bars-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.bar-container {
    position: relative;
    width: 100%;
    height: 6px;
    background: rgba(0,0,0,0.5);
    border-radius: 3px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    transition: width 0.3s ease;
}

.hp .bar-fill {
    background: #48bb78;
    box-shadow: 0 0 8px rgba(72, 187, 120, 0.5);
}

.atb .bar-fill {
    background: #4299e1;
}

.is-enemy .hp .bar-fill {
    background: #f56c6c;
}

.bar-text {
    position: absolute;
    right: 0;
    top: -12px;
    font-size: 10px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 2px #000;
}

.effects-row {
    display: flex;
    gap: 4px;
    margin-top: 8px;
}

.effect-icon {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.effect-icon.buff { background: #48bb78; }
.effect-icon.debuff { background: #f56c6c; }
</style>
