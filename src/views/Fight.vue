<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { ElScrollbar, ElMessage, ElDialog } from 'element-plus';
import { useDataStore, useSaveStore, useFightStore, APM } from '../js/stores';
import { icons, MersenneTwister } from '../js/utils';
import sbutton from '../components/sbutton.vue';
import fightCard from '../components/fight-card.vue';
import ActionOrder from '../components/ActionOrder.vue';
import { Skill, BattleEvent } from '../js/battle';
import { BattleService, BattleResult } from '../js/battle/service';
import { Character, c2e, get_character_by_dump } from '../js/character';
import { Relic } from '../js/relic';
import { ConsumableItems } from '../js/item';

const attributeTranslations: { [key: string]: string } = {
    atk: '攻击',
    def_: '防御',
    speed: '速度',
    hp: '生命',
};

const getRarityColor = (rarity: number = 1) => {
    switch (rarity) {
        case 5: return '#FFD700'; // Gold
        case 4: return '#9B59B6'; // Purple
        case 3: return '#409EFF'; // Blue
        case 2: return '#67C23A'; // Green
        default: return '#909399'; // Gray
    }
};

const data = useDataStore();
const save = useSaveStore();
const fightStore = useFightStore();
const random = new MersenneTwister();

const battleService = new BattleService(fightStore, save, data);

// 动画与特效状态
const hitCharacters = ref<Record<string, boolean>>({});
const damageNumbers = ref<{ id: number, val: number, type: 'damage' | 'heal', x: number, y: number, name: string }[]>([]);
const isScreenShaking = ref(false);
const flashingSkillName = ref("");
const flashingAttackerName = ref("");
let nextDamageId = 0;

const triggerHit = (charName: string) => {
    hitCharacters.value[charName] = true;
    setTimeout(() => {
        hitCharacters.value[charName] = false;
    }, 400);
};

const triggerScreenShake = () => {
    isScreenShaking.value = true;
    setTimeout(() => {
        isScreenShaking.value = false;
    }, 500);
};

const spawnDamageNumber = (name: string, val: number, type: 'damage' | 'heal', party: 'our' | 'enemy') => {
    const id = nextDamageId++;

    // 随机微调位置
    const x = (Math.random() - 0.5) * 40;
    const y = (Math.random() - 0.5) * 20;

    damageNumbers.value.push({
        id,
        val: Math.round(val),
        type,
        x,
        y,
        name
    });
    setTimeout(() => {
        damageNumbers.value = damageNumbers.value.filter(d => d.id !== id);
    }, 1000);
};

var show_manager = ref(false);
var battle_ended = ref(false);
var show_character_selection = ref(true);
var available_characters = ref<Character[]>([]);
var errorMessage = ref('');
var show_settlement_dialog = ref(false);
var battle_result = ref("");
var battle_exp_reward = ref(0);
var battle_xinhuo_reward = ref(0);
var dropped_relics = ref<Relic[]>([]);

const enemy_avatar = random.randint(1, 100);

// 从 store 中获取战斗实例
const battle = computed(() => fightStore.battle_instance);

// 当前行动角色，用于判断是否轮到我方玩家操作
const current_active_character = computed(() => battle.value?.get_now_character());

// 行动序列
const actionOrder = computed(() => {
    if (!battle.value) return [];
    return battle.value.get_action_order();
});

// 当前行动角色名
const current_active_name = computed(() => {
    return current_active_character.value?.character.inside_name || '';
});

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
    if (activeChar && activeChar.type === 'our') {
        // 只有当没有选择角色，或者选择的角色不是当前行动角色时，才进行自动选择
        if (!fightStore.selected_our_character || fightStore.selected_our_character.inside_name !== activeChar.character.inside_name) {
            fightStore.selected_our_character = activeChar.character;
            fightStore.selected_target_character = null;

            // 自动选择第一个敌方角色作为目标
            const firstEnemy = battle.value?.enemy.get_alive_characters()[0];
            if (firstEnemy) {
                fightStore.selected_target_character = { type: 'enemy', character: firstEnemy };
                battle.value?.log(`轮到 ${activeChar.character.name} 行动，已自动为你选择目标。`);
            } else {
                battle.value?.log(`轮到 ${activeChar.character.name} 行动。`);
            }
        }
    }
};

// 监听当前行动角色的变化
watch(current_active_character, (newVal) => {
    if (newVal && newVal.type === 'our') {
        autoSelectActiveCharacter();
    }
}, { deep: true, immediate: true });

// 监听 AI 模式切换，切换回手动时尝试自动选择
watch(() => fightStore.ai, (newAI) => {
    if (!newAI) {
        autoSelectActiveCharacter();
    }
});

// 玩家选择的我方角色 (用于手动模式下，玩家点击我方角色后，准备选择技能)
const selected_our_character = computed(() => fightStore.selected_our_character);
// 玩家选择的目标角色 (用于手动模式下，玩家选择攻击目标)
const selected_target_character = computed(() => fightStore.selected_target_character);
const battle_log = computed(() => battle.value?.battle_log || []);


onKeyStroke("Escape", (e) => {
    e.preventDefault();
    show_manager.value = !show_manager.value;
});

// 监听战斗实例，注册特效监听
watch(battle, (newBattle) => {
    if (newBattle) {
        newBattle.on(BattleEvent.AFTER_DAMAGE, (data: any) => {
            triggerHit(data.character_name);
            spawnDamageNumber(data.character_name, data.damage, 'damage', data.target_party);
            if (data.damage > 0) triggerScreenShake();
        });

        newBattle.on(BattleEvent.AFTER_HEAL, (data: any) => {
            spawnDamageNumber(data.character_name, data.amount, 'heal', data.target_party);
        });

        newBattle.on(BattleEvent.SKILL_EXECUTE, (data: any) => {
            if (!("battle" in APM.objs)) {
                APM.add("battle", 'audio/fight.mp3');
            }
            APM.play("battle");

            flashingSkillName.value = data.skill.name;
            flashingAttackerName.value = data.attacker.name;
            setTimeout(() => {
                if (flashingSkillName.value === data.skill.name) {
                    flashingSkillName.value = "";
                    flashingAttackerName.value = "";
                }
            }, 1500);
        });
        newBattle.on(BattleEvent.TURN_END, (data: any) => {
            console.log("TURN_END", data);
        })
    }
}, { immediate: true });

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


const backToMain = () => {
    APM.stopAll();
    data.page_type = 'main';
};
const startBattle = () => {
    battleService.onSettlement = (result: BattleResult) => {
        battle_ended.value = true;
        battle_result.value = result.win ? 'win' : 'lose';
        battle_exp_reward.value = result.exp;
        battle_xinhuo_reward.value = result.xinhuo;
        dropped_relics.value = result.relics;
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
    // 如果没有选择技能类型，则允许选择任何目标（可能是为了使用道具）
    if (!current_selected_skill_type.value) {
        return true;
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

const owned_items = computed(() => {
    return Object.entries(save.items)
        .filter(([id, count]) => (count as number) > 0)
        .map(([id, count]) => ({
            ...ConsumableItems[id],
            count: count as number
        }));
});

const show_item_selection = ref(false);

const playerUseItem = async (item: any) => {
    if (!battle.value || !selected_our_character.value || !selected_target_character.value) {
        ElMessage.error("请选择行动角色和目标。");
        return;
    }

    const attacker = selected_our_character.value;
    const { type: target_party_type, character: target } = selected_target_character.value;

    const dealt_value = battle.value.execute_item(
        target_party_type,
        target.inside_name,
        item,
        attacker as Character
    );

    // 道具使用不重置 ATB，视为不计入回合的自由动作
    // battle.value.our.reset_atb(attacker.inside_name);

    // 不重置已选择的角色，方便连续使用或后续执行技能
    // fightStore.selected_our_character = null;
    // fightStore.selected_target_character = null;
    show_item_selection.value = false;
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

    battle.value.our.reset_atb(attacker.inside_name);

    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;
    current_selected_skill_type.value = null; // 重置技能类型
};

onMounted(() => {
    available_characters.value = save.characters.get_all();
    if (available_characters.value.length < 3) {
        errorMessage.value = "你的角色不足三名！请去抽卡。";
    }
});

onUnmounted(() => {
    battleService.stopLoop();
    APM.stopAll();
    APM.play("background_music");
    // 重置store状态
    fightStore.$reset();
});

</script>

<template>
    <div>
        <!-- 角色选择界面 -->
        <div v-if="show_character_selection" class="char-selection-page">
            <div class="bg-overlay"></div>

            <sbutton @click="backToMain" class="back-btn-unified" text>
                <img :src="icons.left" />
                <span>返回</span>
            </sbutton>

            <div class="selection-header">
                <div class="header-content">
                    <h1>编制战斗队伍</h1>
                    <div class="team-limit">队伍配置: {{ fightStore.selected_characters.length }} / 3</div>
                </div>
                <div class="header-line"></div>
            </div>

            <div class="selection-main">
                <!-- 左侧：备选角色列表 -->
                <div class="available-pane">
                    <el-scrollbar>
                        <div class="char-grid">
                            <div v-for="char in available_characters" :key="char.inside_name" class="char-card"
                                :class="{ 'is-selected': isCharacterSelected(char) }"
                                @click="toggleCharacterSelection(char)">
                                <div class="char-img-box">
                                    <img :src="`illustrations/${char.inside_name}.jpg`" class="char-portrait" />
                                    <div class="select-badge" v-if="isCharacterSelected(char)">
                                        <span>已选中</span>
                                    </div>
                                </div>
                                <div class="char-info-bar">
                                    <img :src="c2e[char.type]" class="type-icon" />
                                    <span class="name">{{ char.name }}</span>
                                    <span class="lv">Lv.{{ char.level }}</span>
                                </div>
                            </div>
                        </div>
                    </el-scrollbar>
                </div>

                <!-- 右侧：当前队伍预览 -->
                <div class="team-preview-pane">
                    <div class="pane-title">当前出战序列</div>
                    <div class="team-slots">
                        <div v-for="i in 3" :key="i" class="team-slot">
                            <template v-if="fightStore.selected_characters[i - 1]">
                                <div class="slot-inner filled">
                                    <img
                                        :src="`illustrations/${fightStore.selected_characters[i - 1].inside_name}.jpg`" />
                                    <div class="slot-label">{{ fightStore.selected_characters[i - 1].name }}</div>
                                    <div class="slot-remove"
                                        @click="toggleCharacterSelection(fightStore.selected_characters[i - 1])">×</div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="slot-inner empty">
                                    <span class="plus">+</span>
                                    <span class="txt">待机位</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="selection-footer">
                        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
                        <div class="btn-group">
                            <sbutton type="primary" size="large" @click="startBattle"
                                :disabled="fightStore.selected_characters.length !== 3 || !!errorMessage"
                                style="width: 100%">
                                确认编制并开始战斗
                            </sbutton>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 战斗界面 -->
        <div class="battle-page" :class="{ 'screen-shake': isScreenShaking }" v-else-if="battle">
            <!-- 场景层 -->
            <div class="battle-scene">
                <div class="enemies-row">
                    <div v-for="char in battle.enemy.characters" :key="char.inside_name" class="card-container">
                        <fightCard :character="char"
                            :is_active="current_active_character?.type === 'enemy' && current_active_character.character.inside_name === char.inside_name"
                            :is_enemy="true" :is_hit="hitCharacters[char.inside_name]"
                            :is_selected="selected_target_character?.type === 'enemy' && selected_target_character.character.inside_name === char.inside_name"
                            @click="selectTargetCharacter('enemy', char)">
                        </fightCard>
                        <div class="damage-container">
                            <transition-group name="float-up">
                                <div v-for="d in damageNumbers.filter(n => n.name === char.inside_name)" :key="d.id"
                                    class="floating-number" :class="d.type"
                                    :style="{ left: `calc(50% + ${d.x}px)`, top: `calc(20% + ${d.y}px)` }">
                                    {{ d.type === 'heal' ? '+' : '-' }}{{ d.val }}
                                </div>
                            </transition-group>
                        </div>
                    </div>
                </div>

                <div class="allies-row">
                    <div v-for="char in battle.our.characters" :key="char.inside_name" class="card-container">
                        <fightCard :character="char"
                            :is_active="current_active_character?.type === 'our' && current_active_character.character.inside_name === char.inside_name"
                            :atb_value="battle.our.atb[char.inside_name]" :is_enemy="false"
                            :is_hit="hitCharacters[char.inside_name]"
                            :is_selected="selected_our_character?.inside_name === char.inside_name || (selected_target_character?.type === 'our' && selected_target_character.character.inside_name === char.inside_name)"
                            @click="fightStore.selected_our_character ? selectTargetCharacter('our', char) : selectOurCharacter(char)">
                        </fightCard>
                        <div class="damage-container">
                            <transition-group name="float-up">
                                <div v-for="d in damageNumbers.filter(n => n.name === char.inside_name)" :key="d.id"
                                    class="floating-number" :class="d.type"
                                    :style="{ left: `calc(50% + ${d.x}px)`, top: `calc(20% + ${d.y}px)` }">
                                    {{ d.type === 'heal' ? '+' : '-' }}{{ d.val }}
                                </div>
                            </transition-group>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 特效层 -->
            <div class="fx-layer">
                <!-- 技能大招特写名 -->
                <transition name="skill-flash">
                    <div v-if="flashingSkillName" class="skill-name-flash">
                        <div class="flash-bg"></div>
                        <div class="attacker-name-hint">{{ flashingAttackerName }} 正在施放</div>
                        <div class="flash-text">{{ flashingSkillName }}</div>
                    </div>
                </transition>
            </div>

            <!-- UI层 -->
            <div class="battle-hud">
                <!-- 顶部状态栏 -->
                <div class="top-hud">
                    <div class="battle-status">
                        <span class="turn-count">回合 {{ Math.floor(battle.tick / 100) }}</span>
                    </div>
                    <div class="top-btns">
                        <sbutton @click="toggleAI" text class="ai-btn" :class="{ 'ai-active': fightStore.ai }">
                            {{ fightStore.ai ? 'AUTO' : 'MANUAL' }}
                        </sbutton>
                        <sbutton @click="show_manager = true" text class="menu-trigger">
                            <img :src="icons.menu" style="color: white;" />
                        </sbutton>
                    </div>
                </div>

                <!-- 左侧行动序列 -->
                <div class="action-order-sidebar">
                    <ActionOrder :order="actionOrder" :current_active_name="current_active_name" />
                </div>

                <!-- 战斗日志 - 放置在左下角 -->
                <div class="log-overlay">
                    <el-scrollbar height="100px">
                        <div v-for="(log, index) in battle_log" :key="index" class="log-entry">
                            <span class="log-bullet">❯</span> {{ log }}
                        </div>
                    </el-scrollbar>
                </div>

                <!-- 底部操作区 -->
                <div class="bottom-controls">
                    <!-- 战技点展示 -->
                    <div class="bp-container">
                        <div class="bp-dots">
                            <div v-for="i in 5" :key="i" class="bp-dot"
                                :class="{ 'is-filled': i <= battle.battle_points }">
                            </div>
                        </div>
                        <span class="bp-val">{{ battle.battle_points }} / 5</span>
                    </div>

                    <!-- 圆形技能指令 -->
                    <div class="skill-buttons"
                        v-if="!fightStore.ai && current_active_character?.type === 'our' && current_active_character.character.inside_name === selected_our_character.inside_name">
                        <div class="skill-node" @click="playerAttack('general')">
                            <div class="node-circle">
                                <img :src="icons.sword" />
                            </div>
                            <span class="node-label">普攻</span>
                            <span class="node-cost bonus">+1</span>
                        </div>

                        <div class="skill-node"
                            :class="{ 'is-disabled': battle.battle_points < selected_our_character.getSkill().cost }"
                            @click="playerAttack('skill')">
                            <div class="node-circle skill">
                                <img :src="icons.sword" />
                            </div>
                            <span class="node-label">战技</span>
                            <span class="node-cost">-{{ selected_our_character.getSkill().cost }}</span>
                        </div>

                        <div class="skill-node ult" @click="playerAttack('super_skill')">
                            <div class="node-circle">
                                <img :src="icons.wish" class="super-skill-icon" />
                            </div>
                            <span class="node-label">爆发</span>
                        </div>

                        <div class="skill-node" @click="show_item_selection = true">
                            <div class="node-circle">
                                <img :src="icons.menu" class="item-icon" />
                            </div>
                            <span class="node-label">道具</span>
                        </div>
                    </div>
                </div>
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
                <sbutton @click="backToMain">退出战斗</sbutton>
                <sbutton @click="toggleAI">{{ fightStore.ai ? '切换手动模式' : '切换AI模式' }}</sbutton>
                <br>
                <h3 v-if="battle_ended">战斗已结束</h3>
                <h3 v-else-if="battle">回合数: {{ Math.floor(battle.tick / 100) }}</h3>
                <div class="debug-info" style="margin-top: 10px; font-size: 12px; color: #aaa;">
                    Battle Points: {{ battle?.battle_points }}
                </div>
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
                    <div v-if="battle_result === 'win' && dropped_relics.length > 0">
                        <p>圣遗物：</p>
                        <ul style="list-style: none; padding: 0;">
                            <li v-for="relic in dropped_relics" :key="relic.id" style="margin-bottom: 5px;">
                                <span :style="{ color: getRarityColor(relic.rarity) }">{{ relic.name }} ({{
                                    relic.rarity || 1 }}★)</span>
                                <span v-if="relic.main_attribute"
                                    style="font-size: 0.8em; color: #E6A23C; margin-left: 8px;">
                                    {{ attributeTranslations[relic.main_attribute.key] || relic.main_attribute.key }}
                                    +{{ relic.main_attribute.value }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <sbutton type="primary" @click="backToMain" style="margin-top: 20px;">返回主页</sbutton>
            </div>
        </el-dialog>

        <!-- 道具选择界面 -->
        <el-dialog v-model="show_item_selection" title="选择道具" width="600px">
            <div class="item-selection-list">
                <div v-if="owned_items.length === 0" class="empty-items">背包中没有可用的战斗道具</div>
                <div v-else class="item-grid">
                    <div v-for="item in owned_items" :key="item.id" class="item-card-mini" @click="playerUseItem(item)">
                        <div class="item-info">
                            <span class="item-name" :style="{ color: getRarityColor(item.rarity) }">{{ item.name
                            }}</span>
                            <span class="item-count">x{{ item.count }}</span>
                        </div>
                        <div class="item-desc">{{ item.description }}</div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
/* 全局页面样式 */
.char-selection-page,
.battle-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #0c0c0e;
    color: #ececec;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    overflow: hidden;
}

.bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(45, 55, 72, 0.4) 0%, transparent 80%);
    z-index: 0;
}

.back-btn-unified {
    position: absolute;
    top: 15px;
    left: 20px;
    z-index: 1000;
}

.back-btn-unified img {
    width: 16px;
    height: 16px;
    margin-right: 5px;
}

/* --- 角色选择界面 --- */
.selection-header {
    position: relative;
    z-index: 1;
    padding: 40px 60px 20px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 10px;
}

.selection-header h1 {
    font-size: 3rem;
    margin: 0;
    letter-spacing: 4px;
    font-weight: 900;
}

.team-limit {
    font-size: 1.2rem;
    color: #f7d358;
    font-weight: bold;
}

.header-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, #f7d358 0%, transparent 100%);
}

.selection-main {
    position: relative;
    z-index: 1;
    display: flex;
    height: calc(100vh - 160px);
    padding: 0 60px 40px;
    gap: 40px;
}

.available-pane {
    flex: 1;
    height: 100%;
}

.char-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding-bottom: 40px;
}

.char-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.char-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.3);
}

.char-card.is-selected {
    border-color: #f7d358;
    background: rgba(247, 211, 88, 0.1);
}

.char-img-box {
    position: relative;
    height: 240px;
    overflow: hidden;
}

.char-portrait {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.select-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #f7d358;
    color: #000;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 900;
    border-radius: 2px;
}

.char-info-bar {
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.5);
}

.type-icon {
    width: 20px;
    height: 20px;
}

.char-info-bar .name {
    flex: 1;
    font-weight: bold;
}

.char-info-bar .lv {
    color: #888;
    font-size: 0.9rem;
}

.team-preview-pane {
    width: 400px;
    background: rgba(20, 20, 22, 0.7);
    backdrop-filter: blur(15px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 30px;
    display: flex;
    flex-direction: column;
}

.pane-title {
    font-size: 0.85rem;
    color: #f7d358;
    font-weight: bold;
    letter-spacing: 2px;
    margin-bottom: 30px;
    text-transform: uppercase;
}

.team-slots {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.team-slot {
    height: 100px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    position: relative;
    margin-bottom: 5px;
}

.slot-inner.filled {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 10px;
    gap: 20px;
    border: 1px solid #f7d358;
    background: rgba(247, 211, 88, 0.05);
}

.slot-inner img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
}

.slot-label {
    font-size: 1.2rem;
    font-weight: 900;
}

.slot-remove {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 20px;
    color: #888;
    cursor: pointer;
}

.slot-remove:hover {
    color: #fff;
}

.slot-inner.empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #444;
}

.empty .plus {
    font-size: 2rem;
    line-height: 1;
}

.empty .txt {
    font-size: 0.8rem;
    letter-spacing: 2px;
}

.selection-footer {
    margin-top: 40px;
}

.error-msg {
    color: #ff4757;
    font-size: 0.9rem;
    margin-bottom: 20px;
    text-align: center;
}

.btn-group {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* --- 战斗界面样式 --- */
.battle-page {
    background: url('../assets/bg/fight.jpeg') no-repeat center center;
    background-size: cover;
}

.battle-scene {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
}

.enemies-row {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 8vh;
    transform: scale(0.9) translateY(-20px);
}

.allies-row {
    display: flex;
    justify-content: center;
    gap: 50px;
    transform: scale(1.1) translateY(20px);
}

.battle-hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    pointer-events: none;
}

.battle-hud>* {
    pointer-events: auto;
}

.top-hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 30px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.battle-status {
    font-size: 1.5rem;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.top-btns {
    display: flex;
    gap: 20px;
    align-items: center;
}

.ai-btn {
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 5px 15px;
    font-weight: 900;
    letter-spacing: 2px;
}

.ai-active {
    color: #f7d358;
    border-color: #f7d358;
    text-shadow: 0 0 8px #f7d358;
}

.menu-trigger {
    padding: 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.menu-trigger img {
    width: 24px;
    height: 24px;
}

.action-order-sidebar {
    position: absolute;
    top: 120px;
    left: 0;
}

.log-overlay {
    position: absolute;
    bottom: 40px;
    left: 40px;
    width: 300px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
    padding: 15px;
    border-radius: 4px;
    pointer-events: none;
}

.log-entry {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 6px;
    line-height: 1.4;
}

.log-bullet {
    color: #f7d358;
    margin-right: 8px;
}

.bottom-controls {
    position: absolute;
    bottom: 40px;
    right: 40px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 30px;
}

.bp-container {
    background: rgba(0, 0, 0, 0.6);
    padding: 10px 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.bp-dots {
    display: flex;
    gap: 8px;
}

.bp-dot {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    transform: rotate(45deg);
}

.bp-dot.is-filled {
    background: #f7d358;
    box-shadow: 0 0 10px #f7d358;
}

.bp-val {
    font-weight: 900;
    color: #fff;
    font-size: 1.2rem;
}

.skill-buttons {
    display: flex;
    gap: 20px;
    align-items: flex-end;
}

.skill-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.skill-node:hover {
    transform: scale(1.1);
}

.skill-node:active {
    transform: scale(0.95);
}

.skill-node.is-disabled {
    opacity: 0.4;
    filter: grayscale(1);
    cursor: not-allowed;
}

.node-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
}

.skill-node:hover .node-circle {
    background: rgba(255, 255, 255, 0.1);
    border-color: #fff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.node-circle.skill {
    width: 80px;
    height: 80px;
    border-color: rgba(66, 153, 225, 0.6);
}

.skill-node:hover .node-circle.skill {
    border-color: #4299e1;
    box-shadow: 0 0 20px rgba(66, 153, 225, 0.4);
}


.ult .node-circle {
    width: 90px;
    height: 90px;
    border-color: rgba(247, 211, 88, 0.6);
    background: linear-gradient(135deg, rgba(247, 211, 88, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.ult:hover .node-circle {
    border-color: #f7d358;
    box-shadow: 0 0 25px rgba(247, 211, 88, 0.4);
}

.node-circle img {
    width: 50%;
    height: 50%;

}

.node-label {
    font-size: 11px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 2px 4px #000;
}

.node-cost {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #1a1a1e;
    color: #aaa;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.node-cost.bonus {
    color: #48bb78;
}

/* Manager (Overlay menu) */
.manager {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 20px;
}

.manager .icon {
    width: 32px;
    height: 32px;
}

/* --- 战斗特效与动画 --- */
.screen-shake {
    animation: screen-shake 0.4s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes screen-shake {

    10%,
    90% {
        transform: translate3d(-2px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(4px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-8px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(8px, 0, 0);
    }
}

.fx-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 100;
}

.card-container {
    position: relative;
    display: flex;
    justify-content: center;
}

.damage-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.floating-number {
    position: absolute;
    font-size: 3rem;
    font-weight: 900;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8), 2px 2px 0 #000;
    pointer-events: none;
    z-index: 110;
}

.floating-number.damage {
    color: #ff4757;
}

.floating-number.heal {
    color: #2ed573;
}

.float-up-enter-active {
    animation: float-up-fade 1s ease-out forwards;
}

@keyframes float-up-fade {
    0% {
        transform: translate(-50%, 0) scale(0.5);
        opacity: 0;
    }

    20% {
        transform: translate(-50%, -20px) scale(1.2);
        opacity: 1;
    }

    100% {
        transform: translate(-50%, -60px) scale(1);
        opacity: 0;
    }
}

.skill-name-flash {
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 120;
}

.attacker-name-hint {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: bold;
    letter-spacing: 4px;
    margin-bottom: 5px;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 1;
}

.flash-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(247, 211, 88, 0.2) 50%, transparent 100%);
    transform: skewX(-20deg);
}

.flash-text {
    font-size: 4rem;
    font-weight: 900;
    color: #fff;
    letter-spacing: 10px;
    text-shadow: 0 0 20px #f7d358;
    font-style: italic;
    font-family: 'ZiHunJianQi', sans-serif;
}

.skill-flash-enter-active {
    animation: skill-name-pop 1.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
}

@keyframes skill-name-pop {
    0% {
        transform: scaleX(0);
        opacity: 0;
    }

    10% {
        transform: scaleX(1.2);
        opacity: 1;
    }

    20% {
        transform: scaleX(1);
        opacity: 1;
    }

    80% {
        transform: scaleX(1);
        opacity: 1;
    }

    100% {
        transform: translateX(100px);
        opacity: 0;
    }
}

.item-selection-list {
    padding: 20px;
}

.item-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.item-card-mini {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.item-card-mini:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #f7d358;
}

.item-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.item-name {
    font-weight: bold;
}

.item-count {
    color: #888;
}

.item-desc {
    font-size: 12px;
    color: #aaa;
}

.empty-items {
    text-align: center;
    color: #666;
    padding: 40px;
}

/* Responsive Styles */
@media (max-width: 1024px) {
    .selection-header {
        padding: 30px 40px 10px;
    }

    .selection-main {
        padding: 0 40px 30px;
        gap: 20px;
    }

    .team-preview-pane {
        width: 320px;
        padding: 20px;
    }
}


@media (max-width: 768px) {
    .char-selection-page {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .back-btn-unified {
        top: 15px;
        left: 15px;
    }

    .selection-header {
        padding: 60px 20px 10px;
    }

    .selection-header h1 {
        font-size: 2rem;
    }

    .team-limit {
        font-size: 1rem;
    }

    .selection-main {
        flex-direction: column;
        height: auto;
        padding: 0 20px 40px;
        padding-bottom: calc(40px + env(safe-area-inset-bottom));
    }

    .available-pane {
        height: 360px;
        flex: none;
    }

    .team-preview-pane {
        width: 100%;
        padding: 20px;
    }

    .team-slots {
        flex-direction: row;
        gap: 10px;
    }

    .team-slot {
        flex: 1;
        height: 120px;
        margin-bottom: 0;
    }

    .slot-inner.filled {
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        padding: 5px;
    }

    .slot-inner img {
        width: 45px;
        height: 45px;
    }

    .slot-label {
        font-size: 0.9rem;
        width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .slot-remove {
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        line-height: 18px;
        text-align: center;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
    }

    .selection-footer {
        margin-top: 20px;
    }
}

@media (max-height: 500px) and (orientation: landscape) {
    .char-selection-page {
        overflow: hidden;
    }

    .selection-header {
        padding: 10px 40px 5px;
    }

    .selection-header h1 {
        font-size: 1.5rem;
    }

    .team-limit {
        font-size: 0.9rem;
    }

    .selection-main {
        flex-direction: row;
        height: calc(100vh - 70px);
        padding: 0 40px 10px;
        gap: 20px;
        padding-bottom: 0;
    }

    .available-pane {
        flex: 1;
        height: 100%;
    }

    .team-preview-pane {
        width: 280px;
        padding: 15px;
    }

    .pane-title {
        margin-bottom: 10px;
        font-size: 0.8rem;
    }

    .team-slots {
        flex-direction: column;
        gap: 8px;
    }

    .team-slot {
        flex: none;
        height: 55px;
        margin-bottom: 0;
    }

    .slot-inner.filled {
        flex-direction: row;
        justify-content: flex-start;
        padding: 4px;
        gap: 10px;
    }

    .slot-inner img {
        width: 40px;
        height: 40px;
    }

    .slot-label {
        font-size: 0.9rem;
        width: auto;
        text-align: left;
        white-space: normal;
    }

    .slot-remove {
        top: 2px;
        right: 5px;
        font-size: 16px;
        background: transparent;
        width: auto;
        height: auto;
        line-height: normal;
    }

    .slot-inner.empty .plus {
        font-size: 1.2rem;
    }

    .slot-inner.empty .txt {
        font-size: 0.7rem;
    }

    .selection-footer {
        margin-top: 10px;
    }

    .btn-group sbutton {
        font-size: 0.9rem;
        padding: 8px 0;
    }

    .char-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 10px;
    }

    .char-img-box {
        height: 140px;
    }

    .char-info-bar {
        padding: 8px;
    }

    .char-info-bar .name {
        font-size: 0.85rem;
    }
}
</style>
