import { Character, CharacterType, ActiveEffect } from "./character";

export enum SkillType {
    Damage = "伤害",
    Heal = "治疗",
    Buff = "增益",
    Debuff = "减益",
    PartyBuff = "队伍增益",
    PartyDebuff = "队伍减益",
}

export interface Skill {
    name: string;
    type: SkillType;
    value: number;
    targetScope: 'single' | 'all_allies' | 'all_enemies';
    attribute?: 'atk' | 'def_' | 'speed' | 'hp'; // For buffs/debuffs
    duration?: number; // For buffs/debuffs, in turns
    description: string;
}

interface ATB {
    [property: string]: number;
}

interface CharactersMap {
    [property: string]: Character;
}

export class BattleCharacters {
    characters: CharactersMap;
    atb: ATB;
    hp: number; // 队伍总血量

    constructor(characters: Character[]) {
        this.characters = {};
        this.atb = {};
        this.hp = 0;
        this.copy_chara(characters);
    }

    /*
    初始化我方和敌方角色对象
    */
    copy_chara(c: Character[]): void {
        this.hp = 0; // 重置总血量
        for (let i = 0; i < c.length; i++) {
            let obj = c[i];
            obj.env = this;
            this.characters[obj.inside_name] = obj;
            this.atb[obj.inside_name] = 0; // 初始化atb
            this.hp += obj.hp; // 累加总血量
        }
    }

    update_atb(tick: number) {
        // let total_hp_before = 0; // 这行代码并未被使用，可以移除
        for (let i in this.characters) {
            let c = this.characters[i];
            // total_hp_before += c.hp; // 这行代码并未被使用，可以移除
            if (c.hp > 0) { // 只有活着的角色才能增加行动值
                this.atb[c.inside_name] += c.speed * tick;
            }
        }
        // 由于update_atb用于计算行动值，而不是直接伤害，所以这里只需更新活着角色的ATB
        // 总血量的更新应该在take_damage方法中处理
    }

    reset_atb(character_name: string): void {
        if (this.atb[character_name] !== undefined) {
            this.atb[character_name] = 0;
        }
    }

    // 处理伤害
    take_damage(character_name: string, damage: number): number {
        let character = this.characters[character_name];
        
        if (character && character.hp > 0) {
            const modified_def = character.get_modified_stat('def_');
            const actual_damage = Math.max(0, damage - modified_def); // 伤害减去防御
            character.hp -= actual_damage;
            if (character.hp < 0) {
                character.hp = 0;
            }
            this.update_team_hp(); // 每次角色血量变化都更新队伍总血量
            return actual_damage;
        }
        return 0;
    }

    // 更新队伍总血量
    update_team_hp(): void {
        this.hp = 0;
        for (let i in this.characters) {
            this.hp += this.characters[i].hp;
        }
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
            return 0; // 目标不存在或已阵亡
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
                break;
            case SkillType.Buff:
            case SkillType.Debuff:
                if (skill.attribute && skill.duration !== undefined) {
                    const effect: ActiveEffect = {
                        type: skill.type === SkillType.Buff ? 'buff' : 'debuff',
                        attribute: skill.attribute,
                        value: skill.value,
                        duration: skill.duration,
                        source_skill_name: skill.name,
                    };
                    target_character.apply_effect(effect);
                    actual_value_dealt = skill.value; // Return the buff/debuff value
                }
                break;
            case SkillType.PartyBuff:
            case SkillType.PartyDebuff:
                // Party effects will be handled by iterating through characters in Battle class
                // For now, we'll just return the skill value
                actual_value_dealt = skill.value;
                break;
        }
        return actual_value_dealt;
    }
}

export class Battle {
    enemy: BattleCharacters;
    our: BattleCharacters;
    now_character: { type: 'enemy' | 'our', name: string } | null; // 当前行动的角色
    tick: number;
    battle_log: string[]; // 战斗日志
    ai_mode: boolean; // 新增：战斗是否处于AI模式

    constructor(enemy_characters: Character[], our_characters: Character[]) {
        this.enemy = new BattleCharacters(enemy_characters);
        this.our = new BattleCharacters(our_characters);
        this.tick = 0;
        this.now_character = null;
        this.battle_log = [];
        this.ai_mode = false; // 默认为手动模式

        this.log("战斗开始！");
    }

    // 记录战斗日志
    log(message: string) {
        this.battle_log.push(`[${this.tick}] ${message}`);
        if (this.battle_log.length > 10) { // 保持日志长度，只显示最新几条
            this.battle_log.shift();
        }
    }

    // 应用队伍增益/减益效果
    apply_party_effects(party_type: 'enemy' | 'our', skill: Skill, attacker_character: Character): void {
        const target_battle_characters = party_type === 'enemy' ? this.enemy : this.our;
        const characters_in_party = Object.values(target_battle_characters.characters);

        for (const chara of characters_in_party) {
            if (chara.hp > 0 && skill.attribute && skill.duration !== undefined) {
                const effect: ActiveEffect = {
                    type: skill.type === SkillType.PartyBuff ? 'buff' : 'debuff',
                    attribute: skill.attribute,
                    value: skill.value,
                    duration: skill.duration,
                    source_skill_name: skill.name,
                };
                chara.apply_effect(effect);
                this.log(`${attacker_character.name} 对 ${chara.name} 施加了队伍${effect.type === 'buff' ? '增益' : '减益'}效果 ${skill.name}。`);
            }
        }
    }

    // 获取当前行动的角色
    get_now_character(): { type: 'enemy' | 'our', character: Character } | null {
        let ready_characters: { type: 'enemy' | 'our', character: Character }[] = [];

        // 检查我方角色
        for (const name in this.our.atb) {
            const chara = this.our.characters[name];
            if (chara.hp > 0 && this.our.atb[name] >= 100) {
                ready_characters.push({ type: 'our', character: chara });
            }
        }

        // 检查敌方角色
        for (const name in this.enemy.atb) {
            const chara = this.enemy.characters[name];
            if (chara.hp > 0 && this.enemy.atb[name] >= 100) {
                ready_characters.push({ type: 'enemy', character: chara });
            }
        }

        // 如果有角色准备行动
        if (ready_characters.length > 0) {
            // 根据速度进行排序，速度越快越优先行动
            ready_characters.sort((a, b) => b.character.speed - a.character.speed);

            const active_character_info = ready_characters[0];
            this.now_character = {
                type: active_character_info.type,
                name: active_character_info.character.inside_name
            };
            return active_character_info;
        }

        return null;
    }

    // 更新所有角色的行动值
    update_atb_all(tick_amount: number = 1): void {
        this.tick += tick_amount * 10;
        this.enemy.update_atb(tick_amount);
        this.our.update_atb(tick_amount);
    }

    // 处理伤害
    // target_party: 'enemy' 或 'our'
    // target_character_name: 目标角色的内部名
    // skill: 技能对象
    // attacker_character: 攻击者角色 (用于属性克制等计算)
    execute_skill(target_party: 'enemy' | 'our', target_character_name: string, skill: Skill, attacker_character: Character): number {
        let target_battle_characters = target_party === 'enemy' ? this.enemy : this.our;
        let target_character = target_battle_characters.characters[target_character_name];

        if (!target_character || target_character.hp <= 0) {
            this.log(`无法对已阵亡或不存在的目标 ${target_character_name} 执行技能 ${skill.name}。`);
            return 0;
        }

        let final_skill_value = skill.value;

        // 计算属性克制/抵抗 (仅对伤害和治疗有效)
        if (skill.type === SkillType.Damage || skill.type === SkillType.Heal) {
            const attacker_type = attacker_character.type;
            const target_type = target_character.type;

            let bonus = attacker_character.attr_bonus[target_type]; // 攻击者对目标属性的加成
            if (bonus) {
                final_skill_value *= (1 + bonus);
            }

            // 简单的属性克制示例 (保持你的原有逻辑)
            if (attacker_type === CharacterType.Fire && target_type === CharacterType.Grass) {
                final_skill_value *= 1.2; // 火克草
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            } else if (attacker_type === CharacterType.Water && target_type === CharacterType.Fire) {
                final_skill_value *= 1.2; // 水克火
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            } else if (attacker_type === CharacterType.Grass && target_type === CharacterType.Water) {
                final_skill_value *= 1.2; // 草克水
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            } else if (attacker_type === CharacterType.Thunder && target_type === CharacterType.LiangZi) {
                final_skill_value *= 1.2; // 雷克量子
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            } else if (attacker_type === CharacterType.LiangZi && target_type === CharacterType.Physics) {
                final_skill_value *= 1.2; // 量子克物理
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            } else if (attacker_type === CharacterType.Physics && target_type === CharacterType.Nihility) {
                final_skill_value *= 1.2; // 物理克虚无
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            } else if (attacker_type === CharacterType.Nihility && target_type === CharacterType.Thunder) {
                final_skill_value *= 1.2; // 虚无克雷
                this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
            }
        }

        // 创建一个临时技能对象，包含最终计算后的value
        const executed_skill: Skill = { ...skill, value: final_skill_value };

        let actual_value_dealt = 0;

        // Handle multi-target skills
        if (executed_skill.targetScope === 'all_allies' || executed_skill.targetScope === 'all_enemies') {
            const target_characters_in_scope = executed_skill.targetScope === 'all_allies' ?
                (target_party === 'our' ? Object.values(this.our.characters) : Object.values(this.enemy.characters)) :
                (target_party === 'our' ? Object.values(this.enemy.characters) : Object.values(this.our.characters));

            for (const chara of target_characters_in_scope) {
                if (chara.hp > 0) { // Only apply to alive characters
                    actual_value_dealt += target_battle_characters.apply_effect(chara.inside_name, executed_skill, attacker_character);
                }
            }
        } else if (executed_skill.type === SkillType.PartyBuff || executed_skill.type === SkillType.PartyDebuff) {
            this.apply_party_effects(target_party, executed_skill, attacker_character);
            actual_value_dealt = executed_skill.value; // For logging purposes
        } else { // Single target
            actual_value_dealt = target_battle_characters.apply_effect(target_character_name, executed_skill, attacker_character);
        }


        if (skill.type === SkillType.Damage) {
            this.log(`${attacker_character.name} 对 ${target_character.name} 造成了 ${Math.round(actual_value_dealt)} 点伤害。`);
        } else if (skill.type === SkillType.Heal) {
            this.log(`${attacker_character.name} 治疗了 ${target_character.name} ${Math.round(actual_value_dealt)} 点生命。`);
        } else if (skill.type === SkillType.Buff) {
            this.log(`${attacker_character.name} 对 ${target_character.name} 施加了 ${skill.name} 增益效果。`);
        } else if (skill.type === SkillType.Debuff) {
            this.log(`${attacker_character.name} 对 ${target_character.name} 施加了 ${skill.name} 减益效果。`);
        } else if (skill.type === SkillType.PartyBuff) {
            this.log(`${attacker_character.name} 对 ${target_party === 'our' ? '我方' : '敌方'}全体施加了 ${skill.name} 队伍增益效果。`);
        } else if (skill.type === SkillType.PartyDebuff) {
            this.log(`${attacker_character.name} 对 ${target_party === 'our' ? '我方' : '敌方'}全体施加了 ${skill.name} 队伍减益效果。`);
        }


        if (target_character.hp <= 0 && (skill.type === SkillType.Damage || skill.type === SkillType.Heal)) { // Only log death for damage/heal
            this.log(`${target_character.name} 已阵亡！`);
        }

        return actual_value_dealt;
    }

    // 推进一个回合
    async next_turn(): Promise<boolean> {
        // 战斗结束判断 (放在最前面，防止不必要的计算)
        if (this.enemy.hp <= 0) {
            this.log("我方胜利！");
            return true;
        }
        if (this.our.hp <= 0) {
            this.log("我方战败！");
            return true;
        }

        let active_info = this.get_now_character();

        // 如果没有角色准备行动，推进ATB直到有角色可以行动
        while (!active_info) {
            this.update_atb_all(1);
            // 这里不再重复 this.tick += 10; 因为 update_atb_all 已经包含了
            active_info = this.get_now_character();

            // 防止无限循环的保护机制
            if (this.tick > 100000) { // 增加tick上限，避免卡死
                this.log("战斗异常，长时间无角色行动，强制结束。");
                return true;
            }
        }

        const { type: active_party_type, character: active_character } = active_info;


        // 更新当前行动角色的所有效果持续时间
        active_character.update_effects();

        // 如果是我方角色行动且处于手动模式，不执行AI逻辑，而是等待玩家操作
        // 注意：这里的 ai_mode 是从 fightStore 传递过来的
        if (active_party_type === 'our' && !this.ai_mode) {
            this.log(`[手动模式] 轮到 ${active_character.name} 行动，等待玩家操作。`);
            // ���置ATB在这里发生，但不会立即执行攻击，由玩家触发playerAttack
            return false; // 等待玩家操作，战斗未结束
        }

        // 统一重置当前行动角色的ATB (在AI模式或敌方行动时)
        if (active_party_type === 'our') {
            this.our.reset_atb(active_character.inside_name);
        } else {
            this.enemy.reset_atb(active_character.inside_name);
        }

        this.log(`轮到 ${active_character.name} 行动！`);

        // 敌方AI逻辑
        if (active_party_type === 'enemy') {
            const alive_our = this.our.get_alive_characters();
            if (alive_our.length === 0) {
                this.log("敌方胜利！");
                return true;
            }

            // 选择目标 - 默认随机选择一个我方活着的角色
            const target = alive_our[Math.floor(Math.random() * alive_our.length)];

            // 决定攻击类型 (可以更智能，这里是随机)
            const atk_choice = Math.random();
            let damage = 0;
            let skill_name = "";

            let skill_to_execute: Skill;
            if (atk_choice < 0.6) { // 60%概率普通攻击
                skill_to_execute = active_character.getGeneralSkill();
            }
            else if (atk_choice < 0.9) { // 30%概率使用技能
                skill_to_execute = active_character.getSkill();
            }
            else { // 10%概率使用大招
                skill_to_execute = active_character.getSuperSkill();
            }

            this.log(`[敌方]${active_character.name} 使用 ${skill_to_execute.name} 攻击 ${target.name}！`);
            this.execute_skill('our', target.inside_name, skill_to_execute, active_character);
        }
        // 我方AI逻辑 (当 active_party_type === 'our' 且 this.ai_mode 为 true时执行)
        else if (active_party_type === 'our' && this.ai_mode) {
            console.log("[AI模式]正在执行我方角色AI逻��:", active_character.name);
            const alive_enemy = this.enemy.get_alive_characters();
            if (alive_enemy.length === 0) {
                this.log("我方胜利！");
                return true;
            }

            // 更智能的目标选择 - 优先攻击克制属性或血量低的
            let target = alive_enemy[0]; // 默认第一个敌人
            let lowest_hp = target.hp; // 记录最低血量

            // 寻找最佳目标
            for (const enemy of alive_enemy) {
                // 优先攻击属性克制的敌人 (如果存在)
                if (active_character.attr_bonus[enemy.type] > 0) {
                    target = enemy;
                    break; // 找到克制目标，立即选择并退出
                }
                // 否则，选择血量最低的敌人
                if (enemy.hp < lowest_hp) {
                    lowest_hp = enemy.hp;
                    target = enemy;
                }
            }

            // 决定攻击类型
            const atk_choice = Math.random();
            let damage = 0;
            let skill_name = "";

            let skill_to_execute: Skill;
            if (atk_choice < 0.5) { // 50%概率普通攻击
                skill_to_execute = active_character.getGeneralSkill();
            }
            else if (atk_choice < 0.85) { // 35%概率使用技能
                skill_to_execute = active_character.getSkill();
            }
            else { // 15%概率使用大招
                skill_to_execute = active_character.getSuperSkill();
            }

            this.log(`[我方AI]${active_character.name} 使用 ${skill_to_execute.name} 攻击 ${target.name}！`);
            this.execute_skill('enemy', target.inside_name, skill_to_execute, active_character);
        }

        // 战斗未结束
        return false;
    }
}
