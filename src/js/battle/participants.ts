import { Character, ActiveEffect } from "../characters/base";
import { Skill, SkillType, ATB, IBattle, BattleEvent } from "./types";

interface CharactersMap {
    [property: string]: Character;
}

export class BattleCharacters {
    characters: CharactersMap;
    atb: ATB;
    hp: number;
    appliedSynergies: Set<string>;
    env: IBattle | null = null;

    constructor(characters: Character[]) {
        this.characters = {};
        this.atb = {};
        this.hp = 0;
        this.appliedSynergies = new Set();
        this.copy_chara(characters);
    }

    /*
    初始化我方和敌方角色对象
    */
    copy_chara(c: Character[]): void {
        this.hp = 0; // 重置总血量
        for (let i = 0; i < c.length; i++) {
            let obj = c[i];
            this.characters[obj.inside_name] = obj;
            this.atb[obj.inside_name] = 0; // 初始化atb
            this.hp += obj.hp; // 累加总血量
        }
    }

    // 注册战斗环境
    register_env(obj: IBattle) {
        this.env = obj;
        for (let i in this.characters) {
            this.characters[i].env = obj;
        }
    }

    // 更新所有角色的行动值
    update_atb(tick: number) {
        for (let i in this.characters) {
            let c = this.characters[i];
            if (c.hp > 0) { // 只有活着的角色才能增加行动值
                this.atb[c.inside_name] += c.speed * tick;
            }
        }
    }

    // 重置指定角色的行动值
    reset_atb(character_name: string): void {
        if (this.atb[character_name] !== undefined) {
            this.atb[character_name] = 0;
        }
    }

    // 处理伤害
    take_damage(character_name: string, damage: number): number {
        let character = this.characters[character_name];
        if (character && character.hp > 0) {
            const modified_def = character.def_;
            const actual_damage = Math.max(0, damage - modified_def); // 伤害减去防御
            const old_hp = character.hp;
            character.hp -= actual_damage;
            if (character.hp < 0) {
                character.hp = 0;
            }
            this.update_team_hp(); // 每次角色血量变化都更新队伍总血量

            // 检查角色是否刚死亡（血量从非0降到0）
            if (old_hp > 0 && character.hp <= 0) {
                character.onCharacterDeath();
                if (this.env) {
                    this.env.emit(BattleEvent.CHARACTER_DEATH, character);
                }
            }

            if (this.env) {
                this.env.emit(BattleEvent.AFTER_DAMAGE, { 
                    character_name, 
                    damage: actual_damage,
                    target_party: this === this.env.enemy ? 'enemy' : 'our'
                });
            }

            return actual_damage;
        }
        return 0;
    }

    // 更新队伍总血量
    update_team_hp(): void {
        this.hp = Object.values(this.characters).reduce((sum, char) => sum + char.hp, 0);
    }

    // 获取活着的角色列表
    get_alive_characters(): Character[] {
        return Object.values(this.characters).filter(c => c.hp > 0);
    }

    // 获取随机一个活着的角色
    get_random_alive_character(): Character | null {
        const alive = this.get_alive_characters();
        if (alive.length > 0) {
            return alive[Math.floor(Math.random() * alive.length)];
        }
        return null;
    }

    // 应用技能效果
    apply_effect(target_character_name: string, skill: Skill, attacker_character: Character): number {
        let target_character = this.characters[target_character_name];

        if (!target_character || target_character.hp <= 0) {
            // 如果是群体技能，目标死亡是正常情况，无需返回0
            if (skill.targetScope !== 'all_allies' && skill.targetScope !== 'all_enemies') {
                return 0; // 单体目标不存在或已阵亡
            }
            return 0;
        }

        let actual_value_dealt = 0;

        switch (skill.type) {
            case SkillType.Damage:
                actual_value_dealt = this.take_damage(target_character_name, skill.value);
                break;
            case SkillType.Heal:
                actual_value_dealt = Math.min(skill.value, target_character.max_hp - target_character.hp);
                target_character.hp += actual_value_dealt;
                this.update_team_hp();
                if (this.env) {
                    this.env.emit(BattleEvent.AFTER_HEAL, {
                        character_name: target_character_name,
                        amount: actual_value_dealt,
                        target_party: this === this.env.enemy ? 'enemy' : 'our'
                    });
                }
                break;
            case SkillType.Buff:
            case SkillType.Debuff:
                if (skill.attribute && skill.duration !== undefined) {
                    const effect: ActiveEffect = {
                        id: `skill_${skill.name}`,
                        name: skill.name,
                        type: skill.type === SkillType.Buff ? 'buff' : 'debuff',
                        attribute: skill.attribute,
                        value: skill.value,
                        duration: skill.duration,
                        source_skill_name: skill.name,
                    };
                    target_character.apply_effect(effect);
                    actual_value_dealt = skill.value;
                }
                break;

            case SkillType.PartyBuff:
            case SkillType.PartyDebuff:
                actual_value_dealt = skill.value;
                break;
        }
        return actual_value_dealt;
    }

    // 回合开始钩子
    onTurnStart() {
        Object.values(this.characters).forEach(character => {
            character.onTurnStart();
        });
    }

    // 回合结束钩子
    onTurnEnd() {
        Object.values(this.characters).forEach(character => {
            character.onTurnEnd();
        });
    }

    onCharacterAction() {
        Object.values(this.characters).forEach(character => {
            character.onCharacterAction();
        });
    }

    onAfterCharacterAction() {
        Object.values(this.characters).forEach(character => {
            character.onAfterCharacterAction();
        });
    }

    onCharacterDeath() {
        Object.values(this.characters).forEach(character => {
            character.onCharacterDeath();
        });
    }
}
