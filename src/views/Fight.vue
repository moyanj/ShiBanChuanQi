<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { ElImage, ElAvatar, ElScrollbar, ElMessage, ElDialog } from 'element-plus';
import { useDataStore, useSaveStore, useFightStore, APM } from '../js/store';
import { get_character_by_dump, icons, MersenneTwister } from '../js/utils';
import sbutton from '../components/sbutton.vue';
import fightCard from '../components/fight-card.vue';
import { Battle, Skill } from '../js/fight';
import { BattleService, BattleResult } from '../js/battle/service';
import { Character, CharacterType } from '../js/character';
import { Item } from '../js/item';

const data = useDataStore();
const save = useSaveStore();
const fightStore = useFightStore();
const random = new MersenneTwister();

const battleService = new BattleService(fightStore, save, data);

var show_manager = ref(false);
var battle_ended = ref(false);
var show_character_selection = ref(true);
var available_characters = ref<Character[]>([]);
var errorMessage = ref('');
var show_settlement_dialog = ref(false);
var battle_result = ref("");
var battle_exp_reward = ref(0);
var battle_xinhuo_reward = ref(0);
var dropped_items = ref<Item[]>([]);

const enemy_avatar = random.randint(1, 100);

// 从 store 中获取战斗实例
const battle = computed(() => fightStore.battle_instance);

// 当前行动角色，用于判断是否轮到我方玩家操作
const current_active_character = computed(() => battle.value?.get_now_character());

// 当前选中的技能类型
const selected_skill_type = computed(() => {
    if (!fightStore.selected_our_character) {
        return null;
    }

    // 返回当前选择的技能类型
    return current_selected_skill_type.value;
});

// 添加用于跟踪当前选择技能类型的响应式变量
var current_selected_skill_type = ref<null | 'general' | 'skill' | 'super_skill'>(null);

// 自动选择当前行动角色的函数
const autoSelectActiveCharacter = () => {
    if (fightStore.ai) return;

    const activeChar = current_active_character.value;
    if (activeChar && !fightStore.selected_our_character && activeChar.type === 'our') {
        // 如果当前行动角色是我方角色，自动选择它
        fightStore.selected_our_character = activeChar.character;
        fightStore.selected_target_character = null;

        // 自动选择第一个敌方角色作为目标
        const firstEnemy = battle.value?.enemy.get_alive_characters()[0];
        if (firstEnemy) {
            fightStore.selected_target_character = { type: 'enemy', character: firstEnemy };
            battle.value?.log(`你选择了 ${activeChar.character.name} 行动，并自动选择 ${firstEnemy.name} 作为目标。`);
        } else {
            battle.value?.log(`你选择了 ${activeChar.character.name} 行动。`);
        }
    }
};

// 监听当前行动角色的变化
watch(current_active_character, (newVal, oldVal) => {
    // 只有在手动模式下才自动选择
    if (!fightStore.ai && newVal && newVal.type === 'our') {
        autoSelectActiveCharacter();
    }
});

// 玩家选择的我方角色 (用于手动模式下，玩家点击我方角色后，准备选择技能)
const selected_our_character = computed(() => fightStore.selected_our_character);
// 玩家选择的目标角色 (用于手动模式下，玩家选择攻击目标)
const selected_target_character = computed(() => fightStore.selected_target_character);
const battle_log = computed(() => battle.value?.battle_log || []);

// 角色类型到元素图标的映射
const c2e = {
    [CharacterType.Fire]: icons.element.fire,
    [CharacterType.Grass]: icons.element.grass,
    [CharacterType.LiangZi]: icons.element.liangzi,
    [CharacterType.Nihility]: icons.element.nihility,
    [CharacterType.Physics]: icons.element.physics,
    [CharacterType.Thunder]: icons.element.thunder,
    [CharacterType.Water]: icons.element.water,
};

onKeyStroke("Escape", (e) => {
    e.preventDefault();
    show_manager.value = !show_manager.value;
});

// 选择角色逻辑
const toggleCharacterSelection = (character: any) => {
    // 使用类型断言解决类型不匹配问题
    const char = character as Character;
    const index = fightStore.selected_characters.findIndex(c => c.inside_name === char.inside_name);
    if (index > -1) {
        fightStore.selected_characters.splice(index, 1);
    } else {
        if (fightStore.selected_characters.length < 3) {
            fightStore.selected_characters.push(get_character_by_dump(char));
        } else {
            ElMessage.warning("最多只能选择三个角色！");
        }
    }
};

const isCharacterSelected = (character: any) => {
    // 使用类型断言解决类型不匹配问题
    const char = character as Character;
    return fightStore.selected_characters.some(c => c.inside_name === char.inside_name);
};


// 战斗开始逻辑
const startBattle = () => {
    battleService.onSettlement = (result: BattleResult) => {
        battle_ended.value = true;
        battle_result.value = result.win ? 'win' : 'lose';
        battle_exp_reward.value = result.exp;
        battle_xinhuo_reward.value = result.xinhuo;
        dropped_items.value = result.items;
        show_settlement_dialog.value = true;
    };

    show_character_selection.value = false;
    battle_ended.value = false;
    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;

    battleService.startBattle();
};

const toggleAI = () => {

    fightStore.ai = !fightStore.ai;
    if (battle.value) {
        battle.value.ai_mode = fightStore.ai;
    }
    ElMessage.info(`已切换为${fightStore.ai ? 'AI自动战斗' : '手动战斗'}`);
    if (fightStore.ai) {
        fightStore.selected_our_character = null;
        fightStore.selected_target_character = null;
    }
};


// 预判技能是否可以作用于指定目标
const canSkillTarget = (target_party: 'enemy' | 'our') => {
    // 如果没有选择技能类型，则默认可以作用于敌方，不能作用于己方
    if (!current_selected_skill_type.value) {
        return target_party === 'enemy';
    }

    // 获取当前行动角色
    const activeChar = fightStore.selected_our_character;
    if (!activeChar) return false;

    // 根据选中的技能类型判断
    switch (current_selected_skill_type.value) {
        case 'general':
        case 'skill':
        case 'super_skill':
            // 对于所有技能类型，获取对应的技能信息
            let skill: Skill;
            switch (current_selected_skill_type.value) {
                case 'general':
                    skill = activeChar.getGeneralSkill();
                    break;
                case 'skill':
                    skill = activeChar.getSkill();
                    break;
                case 'super_skill':
                    skill = activeChar.getSuperSkill();
                    break;
                default:
                    return target_party === 'enemy'; // 默认只能作用于敌方
            }

            // 根据技能的targetScope判断
            switch (skill.targetScope) {
                case 'single':
                    // 单体技能可以作用于任何单个目标（敌方或己方）
                    return true;
                case 'all_enemies':
                    // 全体敌方技能只能作用于敌方
                    return target_party === 'enemy';
                case 'all_allies':
                    // 全体己方技能只能作用于己方
                    return target_party === 'our';
                default:
                    return target_party === 'enemy'; // 默认只能作用于敌方
            }
        default:
            return target_party === 'enemy'; // 默认只能作用于敌方
    }
};

// 玩家选择我方角色进行操作
const selectOurCharacter = (character: Character) => {
    if (fightStore.ai) {
        ElMessage.warning("请先切换为手动模式。");
        return;
    }
    if (current_active_character.value?.type === 'our' && current_active_character.value.character.inside_name === character.inside_name) {
        fightStore.selected_our_character = character;
        fightStore.selected_target_character = null;
        battle.value?.log(`你选择了 ${character.name} 行动。请选择攻击目标和技能。`);
    } else {
        ElMessage.warning("现在不是该角色行动。");
    }
};

// 玩家选择目标角色
const selectTargetCharacter = (target_party: 'enemy' | 'our', character: Character) => {
    if (fightStore.ai) return;

    // 检查当前技能是否允许作用于目标方
    const canTarget = canSkillTarget(target_party);
    if (!canTarget) {
        const targetName = target_party === 'enemy' ? '敌方' : '己方';
        ElMessage.warning(`当前技能无法作用于${targetName}角色！`);
        return;
    }

    if (fightStore.selected_our_character) {
        fightStore.selected_target_character = { type: target_party, character: character };
        battle.value?.log(`你选择了 ${character.name} 作为目标。`);
    } else {
        ElMessage.warning("请先选择一个我方行动角色。");
    }
};

// 玩家执行攻击
const playerAttack = async (attack_type: 'general' | 'skill' | 'super_skill') => {
    // 记录当前选择的技能类型
    current_selected_skill_type.value = attack_type;

    if (!battle.value || !selected_our_character.value || !selected_target_character.value) {
        ElMessage.error("请选择行动角色和目标。");
        return;
    }

    const attacker = selected_our_character.value;
    const { type: target_party_type, character: target } = selected_target_character.value;

    if (current_active_character.value?.character.inside_name !== attacker.inside_name) {
        ElMessage.error("现在不是该角色的行动回合。");
        return;
    }

    let skill_to_execute: Skill | null = null;
    switch (attack_type) {
        case 'general': skill_to_execute = attacker.getGeneralSkill(); break;
        case 'skill': skill_to_execute = attacker.getSkill(); break;
        case 'super_skill': skill_to_execute = attacker.getSuperSkill(); break;
    }

    if (!skill_to_execute) return;

    // 使用类型断言解决类型不匹配问题
    const dealt_value = battle.value.execute_skill(
        target_party_type,
        target.inside_name,
        skill_to_execute,
        attacker as Character
    );

    // 如果技能因战技点不足而失败，execute_skill会返回0，此时不应结束回合
    if (skill_to_execute.cost > 0 && dealt_value === 0 && battle.value.battle_points < skill_to_execute.cost) {
        return; // 等待玩家重新选择
    }

    if (!("battle" in APM.objs)) {
        APM.add("battle", 'audio/fight.mp3');
    }
    APM.play("battle");

    battle.value.our.reset_atb(attacker.inside_name);

    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;
    current_selected_skill_type.value = null; // 重置技能类型

    // 手动操作后，立即检查一次战斗是否结束
    if (battle.value.enemy.hp <= 0 || battle.value.our.hp <= 0) {
        // 让 battleService 处理结算
        battleService.stopLoop();
        // 我们需要手动调用结算，或者让 next_turn 在下一次循环检测到。
        // 为了即时反馈，我们在这里手动触发一次 next_turn 检测。
        const isEnded = await battle.value.next_turn();
        if (isEnded) {
            // 注意：这里可能需要从 battleService 获取结果，或者让 battleService 提供一个触发结算的方法
            // 由于 startBattle 已经注册了 onSettlement，这里如果 next_turn 触发了逻辑，它会自动调用 handleSettlement
        }
    }
};

onMounted(() => {
    available_characters.value = save.characters.get_all();
    if (available_characters.value.length < 3) {
        errorMessage.value = "你的角色不足三名！请去抽卡。";
    }
});

onUnmounted(() => {
    battleService.stopLoop();
    APM.stop("battle_music");
    APM.play("background_music");
    // 重置store状态
    fightStore.$reset();
});
</script>

<template>
    <div>
        <!-- 角色选择界面 -->
        <div v-if="show_character_selection" class="character-selection-overlay">
            <div class="character-selection-panel">
                <h1>选择你的战斗队伍 ({{ fightStore.selected_characters.length }}/3)</h1>
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                <div class="selected-characters-preview">
                    <div v-for="char in fightStore.selected_characters" :key="char.inside_name"
                        class="selected-char-item">
                        <img :src="`illustrations/${char.inside_name}.jpg`" :alt="char.name"
                            class="selected-char-avatar" />
                        <p>{{ char.name }}</p>
                    </div>
                    <div v-for="i in (3 - fightStore.selected_characters.length)" :key="`empty-${i}`"
                        class="selected-char-item empty-slot">
                        <img :src="icons.empty" class="selected-char-avatar" />
                        <p>空位</p>
                    </div>
                </div>
                <el-scrollbar class="character-list">
                    <div class="available-characters-grid">
                        <div v-for="char in available_characters" :key="char.inside_name"
                            class="character-selection-card" :class="{ 'selected': isCharacterSelected(char) }"
                            @click="toggleCharacterSelection(char)">
                            <img :src="`illustrations/${char.inside_name}.jpg`" :alt="char.name"
                                class="character-card-image" />
                            <div class="character-card-info">
                                <img :src="c2e[char.type]" class="character-type-icon" />
                                <p class="character-name">{{ char.name }}</p>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
                <div class="selection-actions">
                    <sbutton type="default" size="large" @click="data.page_type = 'main'">返回</sbutton>
                    <sbutton type="primary" size="large" @click="startBattle"
                        :disabled="fightStore.selected_characters.length !== 3 || !!errorMessage">开始战斗</sbutton>
                </div>
            </div>
        </div>

        <!-- 战斗界面 -->
        <div class="content fight-c" v-else-if="battle">
            <sbutton @click="show_manager = true" class="menu">
                <el-image :src="icons.menu" style="width: 24px;height: 24px;" />
            </sbutton>
            <div class="toolbar">
                <div>
                    <el-avatar><img :src="`avatars/${enemy_avatar}.png`" id="avatar"></el-avatar>
                </div>
                <div>
                    <el-avatar><img :src="save.user_avatar" id="avatar"></el-avatar>
                    <div class="battle-points">战技点: {{ battle.battle_points }}/5</div>
                </div>
            </div>
            <div class="enemy">
                <div class="character-row">
                    <fightCard v-for="char in battle.enemy.get_alive_characters()" :key="char.inside_name"
                        :character="char"
                        :is_active="current_active_character?.type === 'enemy' && current_active_character.character.inside_name === char.inside_name"
                        :is_enemy="true"
                        :is_selected="selected_target_character?.type === 'enemy' && selected_target_character.character.inside_name === char.inside_name"
                        :active_effects="char.active_effects" @click="selectTargetCharacter('enemy', char)"></fightCard>
                </div>
            </div>
            <div class="our">
                <div class="character-row">
                    <fightCard v-for="char in battle.our.get_alive_characters()" :key="char.inside_name"
                        :character="char"
                        :is_active="current_active_character?.type === 'our' && current_active_character.character.inside_name === char.inside_name"
                        :atb_value="battle.our.atb[char.inside_name]" :is_enemy="false"
                        :is_selected="selected_our_character?.inside_name === char.inside_name || (selected_target_character?.type === 'our' && selected_target_character.character.inside_name === char.inside_name)"
                        :active_effects="char.active_effects"
                        @click="fightStore.selected_our_character ? selectTargetCharacter('our', char) : selectOurCharacter(char)">
                    </fightCard>
                </div>
                <!-- 玩家手动攻击按钮 -->
                <div class="atk"
                    v-if="!fightStore.ai && selected_our_character && current_active_character?.type === 'our' && current_active_character.character.inside_name === selected_our_character.inside_name && selected_target_character">
                    <div @click="playerAttack('general')">
                        <img :src="icons.sword" id="general" />
                        <p class="attack-name">{{ selected_our_character.general_name }}</p>
                    </div>
                    <div @click="playerAttack('skill')">
                        <img :src="icons.sword" id="skill-icon" />
                        <p class="attack-name">{{ selected_our_character.skill_name }}</p>
                    </div>
                    <div @click="playerAttack('super_skill')">
                        <img :src="icons.wish" id="super-skill-icon" />
                        <p class="attack-name">{{ selected_our_character.super_skill_name }}</p>
                    </div>
                </div>
            </div>

            <div class="battle-log">
                <el-scrollbar height="150px">
                    <p v-for="(log, index) in battle_log" :key="index">{{ log }}</p>
                </el-scrollbar>
            </div>
        </div>

        <div class="content" v-if="show_manager" style="z-index: 1003;backdrop-filter: blur(10px);">
            <div class="manager">
                <sbutton @click="show_manager = false" text small>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
                        <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </sbutton>
                <sbutton @click="data.page_type = 'main'">退出战斗</sbutton>
                <sbutton @click="toggleAI">{{ fightStore.ai ? '切换手动模式' : '切换AI模式' }}</sbutton>
                <br>
                <h3 v-if="battle_ended">战斗已结束</h3>
                <h3 v-else-if="battle">回合数: {{ Math.floor(battle.tick / 100) }}</h3>
            </div>
        </div>

        <!-- 结算界面 -->
        <el-dialog v-model="show_settlement_dialog" title="战斗结算" width="500px" :close-on-click-modal="false"
            :close-on-press-escape="false" :show-close="false">
            <div class="settlement-content" style="text-align: center;">
                <h2 v-if="battle_result === 'win'" style="color: #67c23a;">战斗胜利！</h2>
                <h2 v-else style="color: #f56c6c;">战斗失败！</h2>

                <div class="rewards-section">
                    <h3>获得奖励：</h3>
                    <p>经验值: {{ battle_exp_reward }}</p>
                    <p v-if="battle_result === 'win'">星火: {{ battle_xinhuo_reward }}</p>
                    <div v-if="battle_result === 'win' && dropped_items.length > 0">
                        <p>道具：</p>
                        <ul>
                            <li v-for="item in dropped_items" :key="item.id">{{ item.name }}</li>
                        </ul>
                    </div>
                </div>

                <sbutton type="primary" @click="data.page_type = 'main'" style="margin-top: 20px;">返回主页</sbutton>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
/* 样式与之前保持一致，此处省略以减少篇幅 */
.content {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
}

.back {
    display: none;
}

.menu {
    position: fixed;
    left: 15px;
    top: 15px;
    z-index: 1002;
}

.manager {
    margin: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.manager sbutton {
    margin-bottom: 10px;
}

.fight-c {
    background: no-repeat url('../assets/bg/fight.jpeg');
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.enemy,
.our {
    width: 100vw;
    height: 40vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
}

.enemy .character-row,
.our .character-row {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.toolbar {
    border-radius: 10px;
    position: fixed;
    top: calc(50vh - 150px / 2);
    width: 30px;
    height: 150px;
    background-color: #2a2a2a;
    margin-left: 10px;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.3);
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.toolbar div {
    height: 50%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.toolbar .el-avatar {
    width: 40px;
    height: 40px;
    margin-bottom: 5px;
}

.team-hp {
    font-size: 10px;
    color: white;
    text-align: center;
}

.battle-points {
    font-size: 10px;
    color: white;
    text-align: center;
    margin-top: 2px;
    /* Add a small margin for separation */
}

.atk {
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: auto;
    height: 70px;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 35px;
    padding: 0 15px;
}

.atk div {
    background-color: #4CAF50;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    position: relative;
    overflow: hidden;
}

.atk div:hover {
    transform: scale(1.1);
}

.atk div img {
    width: 60%;
    height: auto;
    filter: invert(1);
}

.atk div:nth-child(2) {
    background-color: #2196F3;
}

.atk div:nth-child(3) {
    background-color: #FFC107;
}

.attack-name {
    position: absolute;
    bottom: 0px;
    font-size: 10px;
    color: white;
    text-align: center;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: rgba(0, 0, 0, 0.5);
    padding-top: 2px;
}

#general,
#skill-icon,
#super-skill-icon {
    margin-top: -5px;
}

.battle-log {
    position: fixed;
    bottom: 25px;
    left: 25px;
    width: 300px;
    height: 150px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    padding: 10px;
    color: white;
    font-size: 12px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

.battle-log p {
    margin: 2px 0;
    line-height: 1.2;
}

.character-selection-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1004;
}

.character-selection-panel {
    background-color: #26272b;
    border-radius: 15px;
    padding: 30px;
    width: 80vw;
    max-width: 900px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.character-selection-panel h1 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #e6ebff;
}

.error-message {
    color: #ff4d4f;
    margin-bottom: 15px;
}

.selected-characters-preview {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    justify-content: center;
}

.selected-char-item {
    text-align: center;
    width: 120px;
}

.selected-char-avatar {
    width: 100px;
    height: 120px;
    object-fit: cover;
    border: 3px solid #4CAF50;
    border-radius: 5px;
}

.selected-char-item.empty-slot .selected-char-avatar {
    border: 3px dashed #555;
    opacity: 0.6;
}

.selected-char-item p {
    margin-top: 5px;
    font-size: 14px;
    color: #e6ebff;
}

.character-list {
    flex-grow: 1;
    width: 100%;
    margin-bottom: 20px;
}

.available-characters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    padding: 10px;
}

.character-selection-card {
    background-color: #333;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-align: center;
    position: relative;
    padding-bottom: 5px;
}

.character-selection-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
}

.character-selection-card.selected {
    border-color: #4CAF50;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
    transform: scale(1.03);
}

.character-card-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
}

.character-card-info {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
}

.character-type-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}

.character-name {
    font-size: 14px;
    font-weight: bold;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.selection-actions {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}
</style>
