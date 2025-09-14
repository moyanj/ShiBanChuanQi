import { Character, CharacterType, ActiveEffect } from "./character";
import { useFightStore } from './store';
import { generateRandomItem } from './tools'; // 新增导入

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
    cost: number; // 新增：战技点消耗
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
    battle: Battle;

    constructor(characters: Character[], battle: Battle) {
        this.characters = {};
        this.atb = {};
        this.hp = 0;
        this.battle = battle;
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
        for (let i in this.characters) {
            let c = this.characters[i];
            if (c.hp > 0) { // 只有活着的角色才能增加行动值
                this.atb[c.inside_name] += c.speed * tick;
            }
        }
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
            const modified_def = character.def_;
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
                const modified_atk = attacker_character.atk;
                actual_value_dealt = this.take_damage(target_character_name, skill.value + modified_atk);
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

    onTurnStart() {
        Object.values(this.characters).forEach(character => {
            character.onTurnStart();
        });
    }

    onTurnEnd() {
        Object.values(this.characters).forEach(character => {
            character.onTurnEnd();
        });
    }
}

export class Battle {
    enemy: BattleCharacters;
    our: BattleCharacters;
    now_character: { type: 'enemy' | 'our', name: string } | null; // 当前行动的角色
    tick: number;
    battle_log: string[]; // 战斗日志
    ai_mode: boolean; // 新增：战斗是否处于AI模式
    battle_points: number; // 战技点
    fightStore: ReturnType<typeof useFightStore>; // 新增：Pinia fight store 实例

    constructor(enemy_characters: Character[], our_characters: Character[]) {
        this.enemy = new BattleCharacters(enemy_characters, this);
        this.our = new BattleCharacters(our_characters, this);
        this.tick = 0;
        this.now_character = null;
        this.battle_log = [];
        this.ai_mode = false; // 默认为手动模式
        this.battle_points = 5; // 初始化战技点为5
        this.fightStore = useFightStore(); // 初始化 fight store

        this.log("战斗开始！");
        this.check_team_synergy(); // 在战斗开始时检查队伍协同
    }

    // 记录战斗日志
    log(message: string) {
        this.battle_log.push(`[${Math.floor(this.tick / 100)}] ${message}`);
        if (this.battle_log.length > 20) { // 保持日志长度，只显示最新几条
            this.battle_log.shift();
        }
    }

    // 应用队伍增益/减益效果
    apply_party_effects(party_type: 'enemy' | 'our', skill: Skill, attacker_character: Character): void {
        const target_battle_characters = party_type === 'our' ? this.our : this.enemy;
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
        let ready_characters: { type: 'enemy' | 'our', character: Character, atb: number }[] = [];

        // 检查我方角色
        for (const name in this.our.atb) {
            const chara = this.our.characters[name];
            if (chara.hp > 0 && this.our.atb[name] >= 100) {
                ready_characters.push({ type: 'our', character: chara, atb: this.our.atb[name] });
            }
        }

        // 检查敌方角色
        for (const name in this.enemy.atb) {
            const chara = this.enemy.characters[name];
            if (chara.hp > 0 && this.enemy.atb[name] >= 100) {
                ready_characters.push({ type: 'enemy', character: chara, atb: this.enemy.atb[name] });
            }
        }

        // 如果有角色准备行动
        if (ready_characters.length > 0) {
            // 根据行动值排序，行动值越高越优先
            ready_characters.sort((a, b) => b.atb - a.atb);

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
    
    execute_skill(target_party: 'enemy' | 'our', target_character_name: string, skill: Skill, attacker_character: Character): number {
        // 战技点消耗逻辑 (必须在最前面)
        if (attacker_character.is_our && skill.cost > 0) {
            if (this.battle_points >= skill.cost) {
                this.battle_points -= skill.cost;
                this.log(`${attacker_character.name} 使用 ${skill.name} 消耗 ${skill.cost} 战技点，当前战技点：${this.battle_points}`);
            } else {
                this.log(`${attacker_character.name} 战技点不足，无法使用 ${skill.name}！`);
                return 0; // 战技点不足，技能无法执行
            }
        }

        const target_battle_characters = target_party === 'enemy' ? this.enemy : this.our;
        let main_target_character = target_battle_characters.characters[target_character_name];
        let total_value_dealt = 0;

        // 处理群体技能
        if (skill.targetScope === 'all_allies' || skill.targetScope === 'all_enemies') {
             const target_characters_in_scope = skill.targetScope === 'all_allies' ? this.our.get_alive_characters() : this.enemy.get_alive_characters();
             for (const chara of target_characters_in_scope) {
                const final_skill = this.calculate_final_skill(skill, attacker_character, chara);
                const value = target_battle_characters.apply_effect(chara.inside_name, final_skill, attacker_character);
                total_value_dealt += value;
                this.log_skill_effect(skill, attacker_character, chara, value);
             }
        } else { // 单体目标
            if (!main_target_character || main_target_character.hp <= 0) {
                 this.log(`无法对已阵亡或不存在的目标 ${target_character_name} 执行技能 ${skill.name}。`);
                 return 0;
            }
            const final_skill = this.calculate_final_skill(skill, attacker_character, main_target_character);
            total_value_dealt = target_battle_characters.apply_effect(target_character_name, final_skill, attacker_character);
            this.log_skill_effect(skill, attacker_character, main_target_character, total_value_dealt);
        }

        // 战技点回复逻辑
        if (attacker_character.is_our && skill.name === attacker_character.general_name) {
            this.battle_points = Math.min(5, this.battle_points + 1);
            this.log(`${attacker_character.name} 使用普通攻击，战技点回复1点，当前战技点：${this.battle_points}`);
        }

        return total_value_dealt;
    }

    private calculate_final_skill(skill: Skill, attacker: Character, target: Character): Skill {
        let final_skill_value = skill.value;
        if (skill.type === SkillType.Damage) {
            const bonus = attacker.attr_bonus[target.type] || 0;
            final_skill_value *= (1 + bonus);
            // 这里可以添加更多的克制逻辑
        }
        return { ...skill, value: final_skill_value };
    }

    private log_skill_effect(skill: Skill, attacker: Character, target: Character, value: number) {
        switch (skill.type) {
            case SkillType.Damage:
                this.log(`${attacker.name} 对 ${target.name} 造成了 ${Math.round(value)} 点伤害。`);
                if (target.hp <= 0) {
                    this.log(`${target.name} 已阵亡！`);
                }
                break;
            case SkillType.Heal:
                this.log(`${attacker.name} 治疗了 ${target.name} ${Math.round(value)} 点生命。`);
                break;
            case SkillType.Buff:
                this.log(`${attacker.name} 对 ${target.name} 施加了 ${skill.name} 增益效果。`);
                break;
            case SkillType.Debuff:
                this.log(`${attacker.name} 对 ${target.name} 施加了 ${skill.name} 减益效果。`);
                break;
        }
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
        if (active_party_type === 'our' && !this.ai_mode) {
             // ATB重置将由玩家操作后在Fight.vue中调用
            return false; // 等待玩家操作，战斗未结束
        }

        // AI模式或敌方行动时，统一重置当前行动角色的ATB
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
                return true; // 我方已无人，战斗结束
            }
            // 简单AI：随机选择目标和技能
            const target = alive_our[Math.floor(Math.random() * alive_our.length)];
            const skill_to_execute = Math.random() < 0.7 ? active_character.getGeneralSkill() : active_character.getSkill();
            this.log(`[敌方]${active_character.name} 使用 ${skill_to_execute.name}！`);
            this.execute_skill('our', target.inside_name, skill_to_execute, active_character);
        }
        // 我方AI逻辑
        else if (active_party_type === 'our' && this.ai_mode) {
            const alive_enemy = this.enemy.get_alive_characters();
            if (alive_enemy.length === 0) {
                return true; // 敌方已无人，战斗结束
            }
            // AI：优先攻击血量最低的
            let target = alive_enemy.sort((a, b) => a.hp - b.hp)[0];
            
            // 技能选择：战技点充足则用技能，否则普攻
            const skill_to_execute = (this.battle_points > 2 && Math.random() < 0.7) ? active_character.getSkill() : active_character.getGeneralSkill();

            this.log(`[我方AI]${active_character.name} 使用 ${skill_to_execute.name}！`);
            this.execute_skill('enemy', target.inside_name, skill_to_execute, active_character);
        }

        // 再次检查战斗是否结束
        if (this.enemy.hp <= 0 || this.our.hp <= 0) {
            return true;
        }

        return false;
    }

    // 新增方法：检查队伍协同效果
    check_team_synergy(): void {
        const our_characters_map = this.our.characters;
        const fanShiFu = our_characters_map["FanShiFu"];
        const zongTong = our_characters_map["ZongTong"];

        if (fanShiFu && zongTong) {
            // 如果范师傅和总统都在我方队伍中
            const speed_buff: ActiveEffect = {
                type: 'buff',
                attribute: 'speed',
                value: zongTong.speed * 0.25, // 总统速度提升25%
                duration: 9999, // 持续整个战斗
                source_skill_name: "范师傅-总统协同",
            };
            zongTong.apply_effect(speed_buff);
            this.log(`范师傅与总统触发协同效果：总统速度提升25%！`);
        }
    }
}
