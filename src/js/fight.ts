import { Character, CharacterType } from "./character";

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
            const actual_damage = Math.max(0, damage - character.def_); // 伤害减去防御
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
    // damage_value: 伤害值
    // attacker_character: 攻击者角色 (用于属性克制等计算)
    take_damage(target_party: 'enemy' | 'our', target_character_name: string, damage_value: number, attacker_character: Character): number {
        let target_battle_characters = target_party === 'enemy' ? this.enemy : this.our;
        let target_character = target_battle_characters.characters[target_character_name];

        if (!target_character || target_character.hp <= 0) {
            this.log(`无法对已阵亡或不存在的目标 ${target_character_name} 造成伤害。`);
            return 0;
        }

        let final_damage = damage_value;

        // 计算属性克制/抵抗
        const attacker_type = attacker_character.type;
        const target_type = target_character.type;

        let bonus = attacker_character.attr_bonus[target_type]; // 攻击者对目标属性的加成
        if (bonus) {
            final_damage *= (1 + bonus);
        }

        // 简单的属性克制示例 (保持你的原有逻辑)
        if (attacker_type === CharacterType.Fire && target_type === CharacterType.Grass) {
            final_damage *= 1.2; // 火克草
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        } else if (attacker_type === CharacterType.Water && target_type === CharacterType.Fire) {
            final_damage *= 1.2; // 水克火
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        } else if (attacker_type === CharacterType.Grass && target_type === CharacterType.Water) {
            final_damage *= 1.2; // 草克水
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        } else if (attacker_type === CharacterType.Thunder && target_type === CharacterType.LiangZi) {
            final_damage *= 1.2; // 雷克量子
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        } else if (attacker_type === CharacterType.LiangZi && target_type === CharacterType.Physics) {
            final_damage *= 1.2; // 量子克物理
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        } else if (attacker_type === CharacterType.Physics && target_type === CharacterType.Nihility) {
            final_damage *= 1.2; // 物理克虚无
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        } else if (attacker_type === CharacterType.Nihility && target_type === CharacterType.Thunder) {
            final_damage *= 1.2; // 虚无克雷
            this.log(`${attacker_character.name} 对 ${target_character.name} - 属性克制！`);
        }

        const actual_damage_dealt = target_battle_characters.take_damage(target_character_name, final_damage);
        this.log(`${attacker_character.name} 对 ${target_character.name} 造成了 ${Math.round(actual_damage_dealt)} 点伤害。`);

        if (target_character.hp <= 0) {
            this.log(`${target_character.name} 已阵亡！`);
        }

        return actual_damage_dealt;
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

            if (atk_choice < 0.6) { // 60%概率普通攻击
                damage = active_character.general();
                skill_name = active_character.general_name;
            }
            else if (atk_choice < 0.9) { // 30%概率使用技能
                damage = active_character.skill();
                skill_name = active_character.skill_name;
            }
            else { // 10%概率使用大招
                damage = active_character.super_skill();
                skill_name = active_character.super_skill_name;
            }

            this.log(`[敌方]${active_character.name} 使用 ${skill_name} 攻击 ${target.name}！`);
            this.take_damage('our', target.inside_name, damage, active_character);
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

            if (atk_choice < 0.5) { // 50%概率普通攻击
                damage = active_character.general();
                skill_name = active_character.general_name;
            }
            else if (atk_choice < 0.85) { // 35%概率使用技能
                damage = active_character.skill();
                skill_name = active_character.skill_name;
            }
            else { // 15%概率使用大招
                damage = active_character.super_skill();
                skill_name = active_character.super_skill_name;
            }

            this.log(`[我方AI]${active_character.name} 使用 ${skill_name} 攻击 ${target.name}！`);
            this.take_damage('enemy', target.inside_name, damage, active_character);
        }

        // 战斗未结束
        return false;
    }
}
