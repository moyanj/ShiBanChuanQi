import { ref } from 'vue';
import { Battle } from './engine';
import { BattleEvent, Skill, Character, BattleEventData } from './types';
import { ConsumableItem } from '../item';
import { APM } from '../stores';

export class BattleController {
    public battle = ref<Battle | null>(null);
    
    // UI 状态 (响应式)
    public damageNumbers = ref<{ id: number, val: number, type: 'damage' | 'heal', x: number, y: number, name: string }[]>([]);
    public flashingSkillName = ref("");
    public flashingAttackerName = ref("");
    public isScreenShaking = ref(false);
    public hitCharacters = ref<Record<string, boolean>>({});

    constructor() {}

    /**
     * 初始化控制器，绑定战斗实例并注册事件监听
     */
    public init(battleInstance: Battle) {
        this.battle.value = battleInstance;
        this.registerEvents();
    }

    private registerEvents() {
        const b = this.battle.value;
        if (!b) return;

        b.on(BattleEvent.AFTER_DAMAGE, (data) => {
            this.triggerHit(data.character_name);
            this.spawnDamageNumber(data.character_name, data.damage, 'damage', data.target_party);
            if (data.damage > 0) this.triggerScreenShake();
        });

        b.on(BattleEvent.AFTER_HEAL, (data) => {
            this.spawnDamageNumber(data.character_name, data.amount, 'heal', data.target_party);
        });

        b.on(BattleEvent.SKILL_EXECUTE, (data) => {
            APM.play("battle_action");
            this.showSkillFlash(data.skill.name, data.attacker.name);
        });
    }

    private triggerHit(charName: string) {
        this.hitCharacters.value[charName] = true;
        setTimeout(() => {
            this.hitCharacters.value[charName] = false;
        }, 400);
    }

    private spawnDamageNumber(name: string, val: number, type: 'damage' | 'heal', party: 'our' | 'enemy') {
        const id = Date.now() + Math.random();
        // 这里的坐标逻辑可以根据需要调整，目前简单模拟 Fight.vue 中的行为
        const x = (Math.random() - 0.5) * 40; 
        const y = -60 - (Math.random() * 20);
        
        this.damageNumbers.value.push({ id, val: Math.round(val), type, x, y, name });
        setTimeout(() => {
            this.damageNumbers.value = this.damageNumbers.value.filter(d => d.id !== id);
        }, 1000);
    }

    private triggerScreenShake() {
        this.isScreenShaking.value = true;
        setTimeout(() => {
            this.isScreenShaking.value = false;
        }, 400);
    }

    private showSkillFlash(skillName: string, attackerName: string) {
        this.flashingSkillName.value = skillName;
        this.flashingAttackerName.value = attackerName;
        setTimeout(() => {
            if (this.flashingSkillName.value === skillName) {
                this.flashingSkillName.value = "";
                this.flashingAttackerName.value = "";
            }
        }, 1500);
    }

    // --- 代理引擎方法 ---

    public executeSkill(targetParty: 'enemy' | 'our', targetName: string, skill: Skill, attacker: Character) {
        return this.battle.value?.execute_skill(targetParty, targetName, skill, attacker);
    }

    public executeItem(targetParty: 'enemy' | 'our', targetName: string, item: ConsumableItem, attacker: Character) {
        return this.battle.value?.execute_item(targetParty, targetName, item, attacker);
    }

    public getActionOrder() {
        return this.battle.value?.get_action_order() || [];
    }

    public getNowCharacter() {
        return this.battle.value?.get_now_character() || null;
    }

    public getAliveEnemies() {
        return this.battle.value?.enemy.get_alive_characters() || [];
    }

    public log(message: string) {
        this.battle.value?.log(message);
    }

    public resetATB(party: 'enemy' | 'our', characterName: string) {
        if (party === 'our') {
            this.battle.value?.our.reset_atb(characterName);
        } else {
            this.battle.value?.enemy.reset_atb(characterName);
        }
    }
}

// 导出单例用于全局访问，或者在 Store 中初始化
export const battleController = new BattleController();
