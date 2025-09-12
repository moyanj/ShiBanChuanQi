<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { ElImage, ElAvatar, ElScrollbar, ElMessage, ElDialog } from 'element-plus';
import { useDataStore, useSaveStore, useFightStore, APM } from '../js/store';
import { icons, MersenneTwister } from '../js/utils';
import sbutton from '../components/sbutton.vue';
import fightCard from '../components/fight-card.vue';
import card from '../components/card.vue'; // 用于选择角色界面 (虽然这里没用card组件，但保留了import)
import { Battle, Skill } from '../js/fight';
import { Character, CharacterType, characters } from '../js/character';
import { ThingList } from '../js/things';
// import cloneDeep from 'lodash-es'; // 未使用，可以移除

const data = useDataStore();
const save = useSaveStore();
const fightStore = useFightStore();
const random = new MersenneTwister();

var show_manager = ref(false);
var battle_interval: number | null = null; // 用于存储战斗循环的定时器
var battle_ended = ref(false);
var show_character_selection = ref(true); // 控制角色选择界面的显示
var available_characters = ref<Character[]>([]); // 可���选择的角色 (我方)
var errorMessage = ref(''); // 错误信息
var show_settlement_dialog = ref(false); // 控制结算界面的显示
var battle_result = ref("");
var battle_exp_reward = ref(0);
var battle_xinhuo_reward = ref(0);

const enemy_avatar = random.randint(1, 100);

// 当前行动角色，用于判断是否轮到我方玩家操作
const current_active_character = computed(() => fightStore.battle_instance?.get_now_character());

// 玩家选择的我方角色 (用于手动模式下，玩家点击我方角色后，准备选择技能)
const selected_our_character = computed(() => fightStore.selected_our_character);
// 玩家选择的目标角色 (用于手动模式下，玩家选择攻击目标)
const selected_target_character = computed(() => fightStore.selected_target_character);
const battle_log = computed(() => fightStore.battle_instance?.battle_log || []);

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
    if (show_manager.value) {
        show_manager.value = false;
    } else {
        show_manager.value = true;
    }
});

// 选择角色逻辑
const toggleCharacterSelection = (character: Character) => {
    const index = fightStore.selected_characters.findIndex(c => c.inside_name === character.inside_name);
    if (index > -1) {
        // 角色已选择，移除
        fightStore.selected_characters.splice(index, 1);
    } else {
        // 角色未选择，添加
        if (fightStore.selected_characters.length < 3) {
            fightStore.selected_characters.push(character);
        } else {
            ElMessage.warning("最多只能选择三个角色！");
        }
    }
};

// 检查角色是否被选中
const isCharacterSelected = (character: Character) => {
    return fightStore.selected_characters.some(c => c.inside_name === character.inside_name);
};


// 战斗开始逻辑
const startBattle = () => {
    // 确保有角色参与战斗
    if (fightStore.selected_characters.length !== 3) {
        ElMessage.error("请选择三名角色开始战斗！");
        return;
    }

    // 将用户选择的角色赋值给 fightStore.our
    fightStore.our = fightStore.selected_characters;
    show_character_selection.value = false; // 关闭角色选择界面

    // 确保所有角色都有初始血量和最大血量
    fightStore.our.forEach(c => {
        if (c.hp <= 0) c.hp = c.max_hp;
        if (c.max_hp <= 0) c.level_hp(); // 重新计算最大血量
    });

    // 在我方角色确定后，生成敌方角色
    generateEnemyCharacters(); // 调用生成敌方角色的函数

    fightStore.enemy.forEach(c => {
        if (c.hp <= 0) c.hp = c.max_hp;
        if (c.max_hp <= 0) c.level_hp(); // 重新计算最大血量
    });

    fightStore.battle_instance = new Battle(fightStore.enemy, fightStore.our);
    // !!! 关键修改点：将AI模式状态传递给战斗实例 !!!
    if (fightStore.battle_instance) {
        fightStore.battle_instance.ai_mode = fightStore.ai;
    }

    battle_ended.value = false;
    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;

    APM.stop("background_music"); // 停止主页背景音乐
    if (!("battle_music" in APM.objs)) {
        APM.add("battle_music", 'audio/background/battle.mp3', { loop: true, volume: 0.5 });
    }
    APM.play("battle_music");

    // 启动战斗循环
    battle_interval = setInterval(async () => {
        if (!fightStore.battle_instance) return;

        // 检查战斗是否已经结束，如果结束则停止循环
        if (fightStore.battle_instance.enemy.hp <= 0 || fightStore.battle_instance.our.hp <= 0) {
            endBattle();
            return; // 结束当前循环迭代
        }

        let activeCharacterInfo = fightStore.battle_instance.get_now_character();

        if (!activeCharacterInfo) {
            // 没有角色达到行动点，推进时间
            fightStore.battle_instance.update_atb_all(1);
        } else {
            // 有角色准备行动
            const { type: active_party_type, character: active_character } = activeCharacterInfo;
            console.log(`当前行动角色: ${active_character.name} (${active_party_type}), AI模式: ${fightStore.ai}`);

            // 如果轮到我方玩家角色行动，且处于手动模式
            if (active_party_type === 'our' && fightStore.ai === false) {
                // 如果当前没有选定角色，或者选定的不是当前行动角色，则更新选定角色
                if (!fightStore.selected_our_character || fightStore.selected_our_character.inside_name !== active_character.inside_name) {
                    fightStore.selected_our_character = active_character;
                    fightStore.selected_target_character = null; // 重置目标选择
                    fightStore.battle_instance.log(`轮到 ${active_character.name} 行动！请选择技能和目标。`);
                    console.log(`[手动] 等待玩家操作 ${active_character.name}`);
                }
                // 此时不推进回合，等待玩家操作。next_turn不会被调用。
            } else {
                // 轮到敌方角色行动，或者我方AI自动行动
                // 在fight.ts的next_turn中会根据this.ai_mode判断是否执行我方AI逻辑
                console.log(`[AI/敌方] 推进回合或我方AI自动行动`);
                const ended = await fightStore.battle_instance.next_turn();
                if (ended) {
                    endBattle();
                }
            }
        }
    }, 50) as unknown as number; // 每次主循环间隔50ms
};

const endBattle = () => {
    if (battle_interval) {
        clearInterval(battle_interval);
        battle_interval = null; // 清除定时器句柄
    }
    battle_ended.value = true;
    APM.stop("battle_music");
    APM.play("background_music"); // 恢复主页背景音乐

    let message = '';
    let exp_reward = 0;
    let xinhuo_reward = 0;

    if (fightStore.battle_instance?.enemy.hp <= 0) {
        message = "恭喜你，战斗胜利！";
        // 给予经验值奖励
        exp_reward = fightStore.enemy.reduce((sum, char) => sum + Math.round(char.level_xp(char.level) / 5), 0);
        save.things.add(new (ThingList["EXP"] as any)(), exp_reward);
        // 给予星火奖励
        xinhuo_reward = random.randint(175, 840);
        save.things.add(new (ThingList["XinHuo"] as any)(), xinhuo_reward);
        ElMessage.success(`${message} 获得 ${exp_reward} EXP, ${xinhuo_reward} 星火`);

        for (const char of fightStore.our) {
            char.favorability += 5;
        }

    } else if (fightStore.battle_instance?.our.hp <= 0) {
        message = "很遗憾，战斗失败！";
        ElMessage.error(message);
    } else {
        message = "战斗结束。";
        ElMessage.info(message);
    }
    for (const char of fightStore.our) {
        char.reset_status();
    }
    fightStore.battle_instance?.log(message);
    battle_result.value = fightStore.battle_instance?.enemy.hp <= 0 ? 'win' : 'lose';
    battle_exp_reward.value = exp_reward;
    battle_xinhuo_reward.value = xinhuo_reward;
    show_settlement_dialog.value = true; // 显示结算界面
};

// 玩家选择我方角色进行操作
const selectOurCharacter = (character: Character) => {
    // 只有当是该角色行动，���处于手动模式时才允许选择
    if (current_active_character.value?.type === 'our' && current_active_character.value.character.inside_name === character.inside_name && fightStore.ai === false) {
        fightStore.selected_our_character = character;
        fightStore.selected_target_character = null; // 重置目标选择
        fightStore.battle_instance?.log(`你选择了 ${character.name} 行动。请选择攻击目标和技能。`);
    } else {
        if (current_active_character.value?.character.inside_name !== character.inside_name) {
            ElMessage.warning("现在不是该角色行动。");
        } else if (fightStore.ai === true) {
            ElMessage.warning("当前为AI自动战斗模式，请切换为手动模式。");
        }
    }
};

// 玩家选择目标角色
const selectTargetCharacter = (target_party: 'enemy' | 'our', character: Character) => {
    // 只有在我方角色被选中，且处于手动模式时才允许选择目标
    if (fightStore.selected_our_character && fightStore.ai === false) {
        fightStore.selected_target_character = { type: target_party, character: character };
        fightStore.battle_instance?.log(`你选择了 ${character.name} 作为目标。`);
    } else if (!fightStore.selected_our_character) {
        ElMessage.warning("请先选择一个我方行动角色。");
    } else if (fightStore.ai === true) {
        ElMessage.warning("当前为AI自动战斗模式，请切换为手动模式。");
    }
};

// 玩家执行攻击
const playerAttack = async (attack_type: 'general' | 'skill' | 'super_skill') => {
    if (!fightStore.selected_our_character || !fightStore.selected_target_character) {
        ElMessage.error("请选择行动角色和目标。");
        return;
    }
    if (!fightStore.battle_instance) return;

    const attacker = fightStore.selected_our_character;
    const target = fightStore.selected_target_character.character;
    const target_party_type = fightStore.selected_target_character.type;

    // 再次确认当前行动角色是否是玩家选择的这个��色
    if (current_active_character.value?.type !== 'our' || current_active_character.value.character.inside_name !== attacker.inside_name) {
        ElMessage.error("现在不是该角色的行动回合。");
        // 清除玩家选择状态，等待正确回合
        fightStore.selected_our_character = null;
        fightStore.selected_target_character = null;
        return;
    }

    let skill_to_execute: Skill | null = null;
    switch (attack_type) {
        case 'general':
            skill_to_execute = attacker.getGeneralSkill();
            break;
        case 'skill':
            skill_to_execute = attacker.getSkill();
            break;
        case 'super_skill':
            skill_to_execute = attacker.getSuperSkill();
            break;
    }

    if (!skill_to_execute) {
        ElMessage.error("未能获取到技能信息。");
        return;
    }

    // 执行技能
    const dealt_value = fightStore.battle_instance.execute_skill(target_party_type, target.inside_name, skill_to_execute, attacker);

    // 重置当前行动角色的ATB，因为已经执行了操作
    fightStore.battle_instance.our.reset_atb(attacker.inside_name);

    // 清除选择状态
    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;

};

const toggleAI = () => {
    fightStore.ai = !fightStore.ai;
    if (fightStore.battle_instance) {
        fightStore.battle_instance.ai_mode = fightStore.ai; // 更新战斗实例的AI模式
        console.log("切换AI模式，战斗实例AI模式为:", fightStore.battle_instance.ai_mode);
    }

    if (fightStore.ai) {
        ElMessage.info("已切换为AI自动战斗");
        fightStore.selected_our_character = null;
        fightStore.selected_target_character = null;
    } else {
        ElMessage.info("已切换为手动战斗");
    }
};

/**
 * 生成略弱于我方角色的敌方角色
 * @param baseCharacter 我方角色作为模板
 * @returns 略弱的敌方角色实例
 */
const createWeakerEnemy = (baseCharacter: Character): Character => {
    const CharacterConstructor = characters[baseCharacter.inside_name];
    const weakerEnemy = new CharacterConstructor();
    weakerEnemy.load(baseCharacter.dump()); // 加载基础角色的数据，包括等级、XP、HP等
    weakerEnemy.level = Math.max(1, baseCharacter.level - random.randint(-3, 3)); // 等级降低1-3级，至少为1级
    weakerEnemy.level_hp();
    weakerEnemy.level_atk();
    weakerEnemy.level_def();
    weakerEnemy.hp = weakerEnemy.max_hp; // 确保满血状态
    weakerEnemy.name = `[敌]${baseCharacter.name}`; // 敌方角色名称标记
    return weakerEnemy;
};

/**
 * 随机生成敌方角色队伍
 */
const generateEnemyCharacters = () => {
    const ourCharacters = save.characters.get_all();
    if (ourCharacters.length === 0) {
        ElMessage.error("我方没有选择角色，无法生成敌方！");
        return;
    }

    fightStore.enemy = [];

    const numEnemies = 3;
    const availableEnemyTemplates = [...ourCharacters];

    for (let i = 0; i < numEnemies; i++) {
        if (availableEnemyTemplates.length === 0) {
            const allAvailableGameCharacters = save.characters.get_all();
            if (allAvailableGameCharacters.length > 0) {
                const randomIndex = random.randint(0, allAvailableGameCharacters.length - 1);
                const randomTemplate = allAvailableGameCharacters[randomIndex];
                fightStore.enemy.push(createWeakerEnemy(randomTemplate));
            } else {
                ElMessage.error("游戏中没有任何可用的角色来生成敌方！");
                break;
            }
        } else {
            const randomIndex = random.randint(0, availableEnemyTemplates.length - 1);
            const selectedTemplate = availableEnemyTemplates.splice(randomIndex, 1)[0];
            fightStore.enemy.push(createWeakerEnemy(selectedTemplate));
        }
    }

    ElMessage.info(`敌方队伍已生成：${fightStore.enemy.map(e => e.name).join(', ')}`);
};


// 在组件挂载时初始化可选角色 (我方)
onMounted(() => {
    available_characters.value = save.characters.get_all();

    if (available_characters.value.length === 0) {
        errorMessage.value = "你还没有任何角色！请去抽卡。";
        ElMessage.error(errorMessage.value);
        data.page_type = 'main';
        return;
    }

    show_character_selection.value = true;
});

// 在组件卸载时清除定时器
onUnmounted(() => {
    if (battle_interval) {
        clearInterval(battle_interval);
    }
    APM.stop("battle_music");
    APM.play("background_music");
    // 清空选择的角色，避免下次进入战斗时残留
    fightStore.selected_characters = [];
    fightStore.our = [];
    fightStore.enemy = [];
    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;
    fightStore.battle_instance = null;
});

// 模拟一个随机的敌人名称，可以根据实际情况替换
const enemy_name = computed(() => {
    if (fightStore.enemy.length > 0) {
        return fightStore.enemy.map(e => e.name).join(', ');
    }
    return '未知敌人';
});

// 计算ATB值，用于显示
const getCharacterAtb = (character: Character) => {
    if (fightStore.battle_instance) {
        return fightStore.battle_instance.our.atb[character.inside_name];
    }
    return 0;
}
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
                        <img :src="`illustrations/${char.inside_name}.png`" :alt="char.name"
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
                            <img :src="`illustrations/${char.inside_name}.png`" :alt="char.name"
                                class="character-card-image" />
                            <div class="character-card-info">
                                <img :src="c2e[char.type]" class="character-type-icon" />
                                <p class="character-name">{{ char.name }}</p>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
                <sbutton type="primary" size="large" @click="startBattle"
                    :disabled="fightStore.selected_characters.length !== 3">开始战斗</sbutton>
            </div>
        </div>

        <!-- 战斗界面 -->
        <div class="content fight-c" v-else>
            <sbutton @click="show_manager = true" class="menu">
                <el-image :src="icons.menu" style="width: 24px;height: 24px;" />
            </sbutton>
            <div class="toolbar">
                <div>
                    <el-avatar><img :src="`avatars/${enemy_avatar}.png`" id="avatar"></el-avatar>
                    <div class="team-hp">敌方HP: {{ Math.round(fightStore.battle_instance?.enemy.hp || 0) }}</div>
                </div>
                <div>
                    <el-avatar><img :src="save.user_avatar" id="avatar"></el-avatar>
                    <div class="team-hp">我方HP: {{ Math.round(fightStore.battle_instance?.our.hp || 0) }}</div>
                </div>
            </div>
            <div class="enemy">
                <div class="character-row">
                    <fightCard v-for="char in fightStore.battle_instance?.enemy.get_alive_characters()"
                        :key="char.inside_name" :character="char"
                        :is_active="current_active_character?.type === 'enemy' && current_active_character.character.inside_name === char.inside_name"
                        :is_enemy="true"
                        :is_selected="selected_target_character?.type === 'enemy' && selected_target_character.character.inside_name === char.inside_name"
                        :active_effects="char.active_effects" @click="selectTargetCharacter('enemy', char)"></fightCard>
                </div>
            </div>
            <div class="our">
                <div class="character-row">
                    <fightCard v-for="char in fightStore.battle_instance?.our.get_alive_characters()"
                        :key="char.inside_name" :character="char"
                        :is_active="current_active_character?.type === 'our' && current_active_character.character.inside_name === char.inside_name"
                        :atb_value="getCharacterAtb(char)" :is_enemy="false"
                        :is_selected="selected_our_character?.inside_name === char.inside_name"
                        :active_effects="char.active_effects" @click="selectOurCharacter(char)"></fightCard>
                </div>
                <!-- 玩家手动攻击按钮，仅在手动模式、有行动角色、有目标时显示 -->
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
                <h2>正在与{{ enemy_name }}战斗</h2>
                <h3 v-if="battle_ended">战斗已结束</h3>
                <h3 v-else>回合数: {{ fightStore.battle_instance?.tick / 10 }}</h3>
            </div>
        </div>

        <!-- 结算界面 -->
        <el-dialog v-model="show_settlement_dialog" title="战斗结算" width="500px" :close-on-click-modal="false"
            :close-on-press-escape="false" :show-close="false">
            <div class="settlement-content">
                <h2 v-if="battle_result === 'win'" style="color: #67c23a;">战斗胜利！</h2>
                <h2 v-else style="color: #f56c6c;">战斗失败！</h2>

                <div v-if="battle_result === 'win'" class="rewards-section">
                    <h3>奖励：</h3>
                    <p>经验值: {{ battle_exp_reward }}</p>
                    <p>星火: {{ battle_xinhuo_reward }}</p>
                </div>

                <sbutton type="primary" @click="data.page_type = 'main'">返回主页</sbutton>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
/* 保持所有样式不变，因为主要改动在逻辑层 */
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
</style>
