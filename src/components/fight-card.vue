<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { Character, ActiveEffect } from '../js/character';

const props = defineProps({
    character: {
        type: Object as () => Character, // 修改为 Character 类型
        required: true
    },
    is_active: { // 新增：是否是当前行动角色
        type: Boolean,
        default: false
    },
    atb_value: { // 新增：行动条数值
        type: Number,
        default: 0
    },
    is_enemy: { // 新增：是否是敌方角色
        type: Boolean,
        default: false
    },
    is_selected: { // 新增：是否被选中
        type: Boolean,
        default: false
    },
    active_effects: {
        type: Array as () => ActiveEffect[],
        default: () => []
    }
})

const backgroundStyle = computed(() => ({
    backgroundImage: `url(illustrations/${props.character.inside_name}.png)`
}))

const hpPercentage = computed(() => {
    if (props.character.max_hp === 0) return '0%';
    return `${(props.character.hp / props.character.max_hp) * 100}%`;
});

const atbPercentage = computed(() => {
    return `${props.atb_value}%`;
});

const cardClass = computed(() => {
    return {
        'fight-card': true,
        'active-character': props.is_active,
        'selected-target': props.is_selected,
        'dead-character': props.character.hp <= 0
    };
});
</script>

<template>
    <div :class="cardClass" :style="backgroundStyle">
        <div class="character-info">
            <div class="name-tag">{{ character.name }}</div>
            <div class="hp-bar-container">
                <div class="hp-bar" :style="{ width: hpPercentage }"></div>
                <div class="hp-text">{{ Math.round(character.hp) }} / {{ Math.round(character.max_hp) }}</div>
            </div>
            <div class="atb-bar-container" v-if="!is_enemy">
                <div class="atb-bar" :style="{ width: atbPercentage }"></div>
            </div>
            <div class="active-effects-container" v-if="active_effects.length > 0">
                <div v-for="effect in active_effects" :key="effect.source_skill_name + effect.attribute"
                    :class="['effect-item', effect.type]">
                    {{ effect.attribute.toUpperCase() }}: {{ effect.type === 'buff' ? '+' : '-' }}{{ effect.value }}
                    ({{ effect.duration }}T)
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fight-card {
    height: 240px;
    width: 180px;
    border: 3px solid green;
    background-size: cover;
    background-position: center;
    margin-right: 20px;
    transition-duration: 300ms;
    position: relative;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    /* 绿色光晕 */
}

.fight-card.dead-character {
    filter: grayscale(100%);
    opacity: 0.6;
    border-color: #555;
    box-shadow: none;
}

.fight-card:hover {
    transform: translateY(-5px);
    transition-duration: 300ms;
}

.fight-card.active-character {
    border-color: yellow;
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.8);
    transform: scale(1.05);
}

.fight-card.selected-target {
    border-color: red;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
    transform: scale(1.03);
}

.character-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 5px;
    box-sizing: border-box;
    color: white;
    font-size: 12px;
}

.name-tag {
    text-align: center;
    font-weight: bold;
    margin-bottom: 3px;
}

.hp-bar-container,
.atb-bar-container {
    width: 90%;
    height: 10px;
    background-color: #333;
    border-radius: 5px;
    margin: 3px auto;
    overflow: hidden;
    position: relative;
}

.hp-bar {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease-in-out;
}

.hp-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    line-height: 10px;
    font-size: 10px;
    color: white;
    text-shadow: 1px 1px 2px black;
}

.atb-bar {
    height: 100%;
    background-color: #2196F3;
    transition: width 0.3s ease-in-out;
}

.active-effects-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 3px;
    margin-top: 5px;
}

.effect-item {
    font-size: 9px;
    padding: 2px 5px;
    border-radius: 3px;
    color: white;
    white-space: nowrap;
}

.effect-item.buff {
    background-color: rgba(76, 175, 80, 0.8);
    /* Green for buffs */
}

.effect-item.debuff {
    background-color: rgba(244, 67, 54, 0.8);
    /* Red for debuffs */
}
</style>
