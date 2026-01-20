import { IBattle, Skill, SkillType } from "../battle/types";
import { Item } from "../item";

export interface CharacterData {
    level: number;
    xp: number;
    base_hp: number;
    base_atk: number;
    base_def: number;
    attr_bonus: AttrBonusType;
    favorability: number;
    active_effects: ActiveEffect[];
    equipped_items: Item[];
}

export interface ActiveEffect {
    type: 'buff' | 'debuff';
    attribute: 'atk' | 'def_' | 'speed' | 'hp';
    value: number;
    duration: number;
    source_skill_name: string;
}

export interface AttrBonusType {
    [CharacterType.Fire]: number;
    [CharacterType.Grass]: number;
    [CharacterType.LiangZi]: number;
    [CharacterType.Nihility]: number;
    [CharacterType.Physics]: number;
    [CharacterType.Thunder]: number;
    [CharacterType.Water]: number;
}

export enum CharacterType {
    Fire = "火",
    Water = "水",
    Thunder = "雷",
    Grass = "草",
    LiangZi = "量子",
    Nihility = "虚无",
    Physics = "物理",
}

export abstract class Character {
    name: string;
    inside_name: string;
    desc: string;
    is_our: boolean;

    general_name: string;
    skill_name: string;
    super_skill_name: string;

    general_desc: string;
    skill_desc: string;
    super_skill_desc: string;

    level: number;
    type: CharacterType;
    xp: number;
    base_hp: number;
    _current_hp: number;
    base_atk: number;
    base_def_: number;
    base_speed: number;
    favorability: number;
    attr_bonus: AttrBonusType;
    env: IBattle | null;
    active_effects: ActiveEffect[];
    equipped_items: Item[];

    constructor() {
        this.name = "Test";
        this.inside_name = "Test";
        this.desc = "这是一个测试角色";
        this.is_our = false;
        this.env = null;

        this.skill_name = "技能";
        this.general_name = "普通攻击";
        this.super_skill_name = "爆发技";

        this.skill_desc = "这是一个测试技能";
        this.general_desc = "这是一个普通攻击";
        this.super_skill_desc = "这是一个爆发技";

        this.level = 1;
        this.type = CharacterType.Water;
        this.xp = 0;
        this.base_hp = 100;
        this._current_hp = 100;
        this.base_atk = 10;
        this.base_def_ = 10;
        this.base_speed = 10;
        this.favorability = 0;

        this.attr_bonus = {
            [CharacterType.Fire]: 0.0,
            [CharacterType.Grass]: 0.0,
            [CharacterType.LiangZi]: 0.0,
            [CharacterType.Nihility]: 0.0,
            [CharacterType.Physics]: 0.0,
            [CharacterType.Thunder]: 0.0,
            [CharacterType.Water]: 0.0
        }
        this.active_effects = [];
        this.equipped_items = [];

        this.level_hp();
        this.level_def();
        this.level_atk();
    }

    get hp(): number {
        return Math.min(Math.max(this._current_hp, 0), this.max_hp);
    }
    set hp(value: number) {
        this._current_hp = Math.max(0, Math.min(value, this.max_hp));
    }
    get max_hp(): number {
        let value = this.base_hp;
        for (const effect of this.active_effects) {
            if (effect.attribute === 'hp') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_items) {
            value += item.random_attributes?.['hp'] ?? 0;
        }
        return Math.max(0, value);
    }

    get atk(): number {
        let value = this.base_atk * (1 + this.level * 0.1);
        for (const effect of this.active_effects) {
            if (effect.attribute === 'atk') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_items) {
            value += item.random_attributes['atk'] ?? 0;
        }
        const selfBonus = this.attr_bonus[this.type] || 0;
        value *= (1 + selfBonus);
        return Math.max(0, value);
    }

    get def_(): number {
        let value = this.base_def_ * (1 + this.level * 0.1);
        for (const effect of this.active_effects) {
            if (effect.attribute === 'def_') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_items) {
            value += item.random_attributes['def_'] ?? 0;
        }
        return Math.max(0, value);
    }

    get speed(): number {
        let value = this.base_speed * (1 + this.level * 0.1);
        for (const effect of this.active_effects) {
            if (effect.attribute === 'speed') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_items) {
            value += item.random_attributes['speed'] ?? 0;
        }
        return Math.max(0, value);
    }

    level_up(exp: number) {
        this.xp += exp;
        while (this.xp >= this.level_xp(this.level)) {
            this.xp -= this.level_xp(this.level);
            this.level += 1;
        }
        this.level_hp();
        this.level_def();
        this.level_atk();
        if (this.env) {
            this.env.our.update_team_hp();
        }
    }

    level_xp(level: number): number {
        return 1 + Math.abs(102 * Math.pow(level, 1.28) + 114 * Math.log(level / 0.15)) + 350;
    }

    level_hp(): void {
        const base = 500;
        const growth = base * this.level + 20 * Math.pow(this.level, 1.5);
        this.base_hp = growth;
        this.hp = growth;
    }

    level_def(): void {
        const base = 50;
        const growth = base + 10 * this.level + 2 * Math.pow(this.level, 1.05);
        this.base_def_ = growth;
    }

    level_atk(): void {
        const base = 100;
        const growth = base + 25 * this.level + 5 * Math.pow(this.level, 1.1);
        this.base_atk = growth;
    }

    skill(): number {
        return this.atk * 1.5;
    }

    general(): number {
        return this.atk * 0.9;
    }

    super_skill(): number {
        return this.atk * 2;
    }

    dump(): CharacterData {
        return {
            level: this.level,
            xp: this.xp,
            base_hp: this.base_hp,
            base_atk: this.base_atk,
            base_def: this.base_def_,
            attr_bonus: this.attr_bonus,
            favorability: this.favorability,
            active_effects: this.active_effects,
            equipped_items: this.equipped_items
        }
    }

    load(data: CharacterData): Character {
        this.level = data.level;
        this.xp = data.xp;
        this.base_hp = data.base_hp;
        this._current_hp = data.base_hp;
        this.base_atk = data.base_atk;
        this.base_def_ = data.base_def;
        this.attr_bonus = data.attr_bonus;
        this.favorability = data.favorability;
        this.active_effects = data.active_effects || [];
        this.equipped_items = data.equipped_items || [];
        this.level_hp();
        this.level_def();
        this.level_atk();
        return this;
    }

    reset_status() {
        this.level_hp();
        this.level_def();
        this.level_atk();
    }

    apply_effect(effect: ActiveEffect): void {
        this.active_effects.push(effect);
    }

    remove_effect(effect_name: string): void {
        this.active_effects = this.active_effects.filter(effect => effect.source_skill_name !== effect_name);
    }

    update_effects(): void {
        this.active_effects = this.active_effects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
    }

    getGeneralSkill(): Skill {
        return {
            name: this.general_name,
            type: SkillType.Damage,
            value: this.general(),
            cost: 0,
            targetScope: 'single',
            description: this.general_desc,
        };
    }

    getSkill(): Skill {
        return {
            name: this.skill_name,
            type: SkillType.Damage,
            value: this.skill(),
            cost: 1,
            targetScope: 'single',
            description: this.skill_desc,
        };
    }

    getSuperSkill(): Skill {
        return {
            name: this.super_skill_name,
            type: SkillType.Damage,
            value: this.super_skill(),
            cost: 3,
            targetScope: 'single',
            description: this.super_skill_desc,
        };
    }

    onTurnStart(): void { }
    onTurnEnd(): void { }
    onAfterCharacterAction(): void { }
    onCharacterAction(): void { }
    onCharacterDeath(): void { }
    onWillBeingAttack(skill: Skill): Skill {
        return skill;
    }
    onAfterBeingAttacked(): void { }
}
