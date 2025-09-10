<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { ElImage, ElAvatar, ElScrollbar, ElMessage } from 'element-plus';
import { useDataStore, useSaveStore, useFightStore, APM } from '../js/store';
import { icons, MersenneTwister } from '../js/utils';
import sbutton from '../components/sbutton.vue';
import card from '../components/fight-card.vue';
import { Battle } from '../js/fight';
import { Character } from '../js/character';
import { ThingList } from '../js/things';

const data = useDataStore();
const save = useSaveStore();
const fightStore = useFightStore();
const random = new MersenneTwister();

var show_manager = ref(false);
var battle_interval: number | null = null; // 用于存储战斗循环的定时器
var battle_ended = ref(false);

const current_active_character = computed(() => fightStore.battle_instance?.now_character);
const selected_our_character = computed(() => fightStore.selected_our_character);
const selected_target_character = computed(() => fightStore.selected_target_character);
const battle_log = computed(() => fightStore.battle_instance?.battle_log || []);


onKeyStroke("Escape", (e) => {
    e.preventDefault();
    if (show_manager.value) {
        show_manager.value = false;
    } else {
        show_manager.value = true;
    }
});

// 战斗开始逻辑
const startBattle = () => {
    // 确保有角色参与战斗
    if (fightStore.our.length === 0) {
        ElMessage.error("我方没有角色，无法开始战斗！");
        data.page_type = 'main';
        return;
    }
    if (fightStore.enemy.length === 0) {
        ElMessage.error("敌方没有角色，无法开始战斗！");
        data.page_type = 'main';
        return;
    }

    // 确保所有角色都有初始血量和最大血量
    fightStore.our.forEach(c => {
        if (c.hp <= 0) c.hp = c.max_hp;
        if (c.max_hp <= 0) c.level_hp(); // 重新计算最大血量
    });
    fightStore.enemy.forEach(c => {
        if (c.hp <= 0) c.hp = c.max_hp;
        if (c.max_hp <= 0) c.level_hp(); // 重新计算最大血量
    });

    fightStore.battle_instance = new Battle(fightStore.enemy, fightStore.our);
    battle_ended.value = false;
    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;

    APM.stop("background_music"); // 停止主页背景音乐
    if (!("battle_music" in APM.objs)) {
        APM.add("battle_music", 'audio/background/battle.mp3', { loop: true, volume: 0.5 });
    }
    APM.play("battle_music");

    battle_interval = setInterval(async () => {
        if (!fightStore.battle_instance) return;

        // 如果当前没有角色行动，则推进时间
        if (!fightStore.battle_instance.get_now_character()) {
            fightStore.battle_instance.update_atb_all(10); // 每次更新10点行动值
        } else {
            // 如果轮到我方角色行动，等待玩家操作
            if (current_active_character.value?.type === 'our' && fightStore.ai === false) {
                // 等待玩家选择技能和目标
                if (fightStore.selected_our_character && fightStore.selected_target_character) {
                    // 玩家已选择角色和目标，执行攻击
                    await playerAction();
                }
                return; // 等待玩家操作
            } else if (current_active_character.value?.type === 'our' && fightStore.ai === true) {
                // 我方AI自动行动
                await fightStore.battle_instance.next_turn();
            }
            else {
                // 轮到敌方角色行动，或者我方AI自动行动
                const ended = await fightStore.battle_instance.next_turn();
                if (ended) {
                    endBattle();
                }
            }
        }

        // 检查战斗是否结束
        if (fightStore.battle_instance.enemy.hp <= 0 || fightStore.battle_instance.our.hp <= 0) {
            endBattle();
        }
    }, 100) as unknown as number; // 每次主循环间隔100ms
};

const endBattle = () => {
    if (battle_interval) {
        clearInterval(battle_interval);
    }
    battle_ended.value = true;
    APM.stop("battle_music");
    APM.play("background_music"); // 恢复主页背景音乐

    let message = '';
    if (fightStore.battle_instance?.enemy.hp <= 0) {
        message = "恭喜你，战斗胜利！";
        // 给予经验值奖励
        const exp_reward = fightStore.enemy.reduce((sum, char) => sum + Math.round(char.level_xp(char.level) / 5), 0);
        save.things.add(new (ThingList["EXP"] as any)(), exp_reward);
        ElMessage.success(`${message} 获得 ${exp_reward} EXP`);

    } else if (fightStore.battle_instance?.our.hp <= 0) {
        message = "很遗憾，战斗失败！";
        ElMessage.error(message);
    } else {
        message = "战斗结束。";
        ElMessage.info(message);
    }
    fightStore.battle_instance?.log(message);
    // 可选：显示结算界面
};

// 玩家选择我方角色进行操作
const selectOurCharacter = (character: Character) => {
    if (current_active_character.value?.type === 'our' && current_active_character.value.name === character.inside_name) {
        fightStore.selected_our_character = character;
        fightStore.selected_target_character = null; // 重置目标选择
        fightStore.battle_instance?.log(`你选择了 ${character.name} 行动。`);
    } else {
        ElMessage.warning("现在不是该角色行动，或者你未开启手动模式。");
    }
};

// 玩家选择目标角色
const selectTargetCharacter = (target_party: 'enemy' | 'our', character: Character) => {
    if (fightStore.selected_our_character) {
        fightStore.selected_target_character = { type: target_party, character: character };
        fightStore.battle_instance?.log(`你选择了 ${character.name} 作为目标。`);
    } else {
        ElMessage.warning("请先选择一个我方行动角色。");
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

    let damage = 0;
    let attack_name = "";

    switch (attack_type) {
        case 'general':
            damage = attacker.general();
            attack_name = attacker.general_name;
            break;
        case 'skill':
            damage = attacker.skill();
            attack_name = attacker.skill_name;
            break;
        case 'super_skill':
            damage = attacker.super_skill();
            attack_name = attacker.super_skill_name;
            break;
    }

    fightStore.battle_instance.log(`${attacker.name} 使用 ${attack_name} 攻击 ${target.name}！`);
    const dealt_damage = fightStore.battle_instance.take_damage(target_party_type, target.inside_name, damage, attacker);
    // 清除选择状态
    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;

    // 战斗结束判断
    if (fightStore.battle_instance.enemy.hp <= 0 || fightStore.battle_instance.our.hp <= 0) {
        endBattle();
    } else {
        // 推进一回合，让下一个角色行动
        const ended = await fightStore.battle_instance.next_turn();
        if (ended) {
            endBattle();
        }
    }
};

const playerAction = async () => {
    // 玩家已选择行动角色和目标，执行攻击
    if (!fightStore.selected_our_character || !fightStore.selected_target_character) {
        return;
    }

    // 这里可以加入一个简单的AI，让玩家控制的角色自动选择一个普通攻击
    // 更复杂的AI需要专门的模块
    const attacker = fightStore.selected_our_character;
    const target = fightStore.selected_target_character.character;
    const target_party_type = fightStore.selected_target_character.type;

    const damage = attacker.general();
    const attack_name = attacker.general_name;

    fightStore.battle_instance?.log(`${attacker.name} 使用 ${attack_name} 攻击 ${target.name}！`);
    fightStore.battle_instance?.take_damage(target_party_type, target.inside_name, damage, attacker);

    fightStore.selected_our_character = null;
    fightStore.selected_target_character = null;

    // 检查战斗是否结束
    if (fightStore.battle_instance?.enemy.hp <= 0 || fightStore.battle_instance?.our.hp <= 0) {
        endBattle();
    } else {
        // 推进一回合
        const ended = await fightStore.battle_instance?.next_turn();
        if (ended) {
            endBattle();
        }
    }
};

const toggleAI = () => {
    fightStore.ai = !fightStore.ai;
    if (fightStore.ai) {
        ElMessage.info("已切换为AI自动战斗");
        fightStore.selected_our_character = null;
        fightStore.selected_target_character = null;
    } else {
        ElMessage.info("已切换为手动战斗");
    }
};

// 在组件挂载时开始战斗
onMounted(() => {
    // 示例：初始化敌我双方角色
    const our_chars = save.characters.get_all();
    if (our_chars.length === 0) {
        // 如果玩家没有角色，可以给一个默认角色或者提示
        const default_char = save.characters.get('Fairy');
        if (default_char) {
            fightStore.our = [default_char];
        } else {
            ElMessage.error("你还没有任何角色！请去抽卡。");
            data.page_type = 'main';
            return;
        }
    } else {
        fightStore.our = our_chars;
    }

    // 示例敌人
    const enemy_char1 = save.characters.get('FanShiFu');
    const enemy_char2 = save.characters.get('ShuiLiFang');
    const enemy_char3 = save.characters.get('ZongTong');

    fightStore.enemy = [];
    if (enemy_char1) fightStore.enemy.push(enemy_char1);
    if (enemy_char2) fightStore.enemy.push(enemy_char2);
    if (enemy_char3) fightStore.enemy.push(enemy_char3);

    // 确保所有角色在战斗开始时是满血
    fightStore.our.forEach(c => {
        c.level_hp(); // 重新计算最大血量
        c.hp = c.max_hp;
    });
    fightStore.enemy.forEach(c => {
        c.level_hp(); // 重新计算最大血量
        c.hp = c.max_hp;
    });

    startBattle();
});

// 在组件卸载时清除定时器
onUnmounted(() => {
    if (battle_interval) {
        clearInterval(battle_interval);
    }
    APM.stop("battle_music");
    APM.play("background_music");
});

// 模拟一个随机的敌人名称，可以根据实际情况替换
const enemy_name = computed(() => {
    if (fightStore.enemy.length > 0) {
        return fightStore.enemy.map(e => e.name).join(', ');
    }
    return '未知敌人';
});

const getCharacterHp = (character: Character) => {
    return character.hp;
}

const getCharacterMaxHp = (character: Character) => {
    return character.max_hp;
}

const getCharacterAtb = (character: Character) => {
    if (fightStore.battle_instance) {
        return fightStore.battle_instance.our.atb[character.inside_name];
    }
    return 0;
}

const getEnemyAtb = (character: Character) => {
    if (fightStore.battle_instance) {
        return fightStore.battle_instance.enemy.atb[character.inside_name];
    }
    return 0;
}
</script>

<template>
    <div class="content fight-c">
        <sbutton @click="show_manager = true" class="menu">
            <el-image :src="icons.menu" style="width: 24px;height: 24px;" />
        </sbutton>
        <div class="toolbar">
            <div>
                <el-avatar><img :src="`avatars/${random.randint(1, 100)}.png`" id="avatar"></el-avatar>
                <div class="team-hp">敌方HP: {{ Math.round(fightStore.battle_instance?.enemy.hp || 0) }}</div>
            </div>
            <div>
                <el-avatar><img :src="save.user_avatar" id="avatar"></el-avatar>
                <div class="team-hp">我方HP: {{ Math.round(fightStore.battle_instance?.our.hp || 0) }}</div>
            </div>
        </div>
        <div class="enemy">
            <div class="character-row">
                <card v-for="char in fightStore.battle_instance?.enemy.get_alive_characters()" :key="char.inside_name"
                    :character="char"
                    :is_active="current_active_character?.type === 'enemy' && current_active_character.name === char.inside_name"
                    :is_enemy="true"
                    :is_selected="selected_target_character?.type === 'enemy' && selected_target_character.character.inside_name === char.inside_name"
                    @click="selectTargetCharacter('enemy', char)"></card>
            </div>
        </div>
        <div class="our">
            <div class="character-row">
                <card v-for="char in fightStore.battle_instance?.our.get_alive_characters()" :key="char.inside_name"
                    :character="char"
                    :is_active="current_active_character?.type === 'our' && current_active_character.name === char.inside_name"
                    :atb_value="getCharacterAtb(char)" :is_enemy="false"
                    :is_selected="selected_our_character?.inside_name === char.inside_name"
                    @click="selectOurCharacter(char)"></card>
            </div>
            <div class="atk"
                v-if="!fightStore.ai && selected_our_character && current_active_character?.type === 'our' && current_active_character.name === selected_our_character.inside_name">
                <div @click="playerAttack('general')">
                    <img :src="icons.sword" id="general" />
                    <p class="attack-name">{{ selected_our_character.general_name }}</p>
                </div>
                <div @click="playerAttack('skill')">
                    <img :src="icons.tachometer" id="skill-icon" /> <!-- 假设 tachometer 作为技能图标 -->
                    <p class="attack-name">{{ selected_our_character.skill_name }}</p>
                </div>
                <div @click="playerAttack('super_skill')">
                    <img :src="icons.wish" id="super-skill-icon" /> <!-- 假设 wish 作为爆发技图标 -->
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
                    <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18 6L6 18M6 6l12 12" />
                </svg>
            </sbutton>
            <sbutton @click="data.page_type = 'main'">退出战斗</sbutton>
            <sbutton @click="toggleAI">{{ fightStore.ai ? '切换手动模式' : '切换AI模式' }}</sbutton>
            <br>
            <h2>正在与{{ enemy_name }}战斗</h2>
            <h3 v-if="battle_ended">战斗已结束</h3>
            <h3 v-else>回合数: {{ fightStore.battle_instance?.tick }}</h3>
        </div>
    </div>
</template>

<style scoped>
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
    /* 调整高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    /* 垂直居中 */
    padding: 10px 0;
}

.enemy .character-row,
.our .character-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    /* 增加卡片间距 */
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
    /* 调整头像大小 */
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
    /* 自动调整宽度 */
    height: 70px;
    /* 调整高度 */
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 35px;
    padding: 0 15px;
}

.atk div {
    background-color: #4CAF50;
    /* 默认绿色 */
    width: 60px;
    /* 调整按钮大小 */
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
    /* 确保文字不溢出 */
}

.atk div:hover {
    transform: scale(1.1);
}

.atk div img {
    width: 60%;
    /* 调整图标大小 */
    height: auto;
    filter: invert(1);
    /* 使图标变为白色 */
}

.atk div:nth-child(2) {
    background-color: #2196F3;
    /* 技能蓝色 */
}

.atk div:nth-child(3) {
    background-color: #FFC107;
    /* 爆发技黄色 */
}

.attack-name {
    position: absolute;
    bottom: 0px;
    /* 调整文字位置 */
    font-size: 10px;
    color: white;
    text-align: center;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: rgba(0, 0, 0, 0.5);
    /* 文字背景 */
    padding-top: 2px;
}

#general,
#skill-icon,
#super-skill-icon {
    margin-top: -5px;
    /* 向上微调图标位置 */
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
</style>
