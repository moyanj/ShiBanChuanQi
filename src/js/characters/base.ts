import { IBattle, Skill, SkillType, BattleEvent, BattleEventHandler } from "../battle/types";
import { Relic } from "../relic";
import { icons } from "../utils";

export interface CharacterData {
    level: number;
    xp: number;
    base_hp: number;
    base_atk: number;
    base_def: number;
    attr_bonus: AttrBonusType;
    favorability: number;
    active_effects: ActiveEffect[];
    equipped_relics: Relic[];
}

export interface ActiveEffect {
    id: string;
    name: string;
    type: 'buff' | 'debuff';
    attribute?: 'atk' | 'def_' | 'speed' | 'hp';
    value?: number;
    duration: number;
    stacks?: number;
    maxStacks?: number;
    source_skill_name: string;

    onTick?: (target: Character, battle: IBattle) => void;
    onApply?: (target: Character, battle: IBattle) => void;
    onRemove?: (target: Character, battle: IBattle) => void;
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

// 将类型定义明确
export const c2e: { [key in CharacterType]: string } = {
    [CharacterType.Fire]: icons.element.fire,
    [CharacterType.Grass]: icons.element.grass,
    [CharacterType.LiangZi]: icons.element.liangzi,
    [CharacterType.Nihility]: icons.element.nihility,
    [CharacterType.Physics]: icons.element.physics,
    [CharacterType.Thunder]: icons.element.thunder,
    [CharacterType.Water]: icons.element.water,
};

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

    static readonly MAX_LEVEL = 100;

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
    private _env: IBattle | null = null;
    get env(): IBattle | null { return this._env; }
    set env(value: IBattle | null) {
        if (this._env) {
            this.unregister_battle_events();
        }
        this._env = value;
        if (this._env) {
            this.register_battle_events();
        }
    }

    private event_handlers: Map<BattleEvent, BattleEventHandler<any>> = new Map();

    private register_battle_events() {
        if (!this._env) return;

        const events_to_listen = [
            { event: BattleEvent.TURN_START, method: this.onTurnStart },
            { event: BattleEvent.TURN_END, method: this.onTurnEnd },
            { event: BattleEvent.BEFORE_ACTION, method: this.onCharacterAction },
            { event: BattleEvent.AFTER_ACTION, method: this.onAfterCharacterAction },
            { event: BattleEvent.CHARACTER_DEATH, method: this.onCharacterDeath }
        ];

        events_to_listen.forEach(({ event, method }) => {
            const handler: BattleEventHandler<any> = (data: any) => method.call(this, data);
            this._env?.on(event, handler);
            this.event_handlers.set(event, handler);
        });
    }

    private unregister_battle_events() {
        if (!this._env) return;
        this.event_handlers.forEach((handler, event) => {
            this._env?.off(event, handler);
        });
        this.event_handlers.clear();
    }
    active_effects: ActiveEffect[];
    equipped_relics: Relic[];

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
        this.equipped_relics = [];

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
        for (const item of this.equipped_relics) {
            value += item.random_attributes?.['hp'] ?? 0;
            if (item.main_attribute?.key === 'hp') {
                value += item.main_attribute.value;
            }
        }
        return Math.max(0, value);
    }

    get atk(): number {
        let value = this.base_atk;
        for (const effect of this.active_effects) {
            if (effect.attribute === 'atk') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_relics) {
            value += item.random_attributes['atk'] ?? 0;
            if (item.main_attribute?.key === 'atk') {
                value += item.main_attribute.value;
            }
        }
        const selfBonus = this.attr_bonus[this.type] || 0;
        value *= (1 + selfBonus);
        return Math.max(0, value);
    }

    get def_(): number {
        let value = this.base_def_;
        for (const effect of this.active_effects) {
            if (effect.attribute === 'def_') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_relics) {
            value += item.random_attributes['def_'] ?? 0;
            if (item.main_attribute?.key === 'def_') {
                value += item.main_attribute.value;
            }
        }
        return Math.max(0, value);
    }

    get speed(): number {
        let value = this.base_speed;
        for (const effect of this.active_effects) {
            if (effect.attribute === 'speed') {
                value += (effect.type === 'buff' ? effect.value : -effect.value);
            }
        }
        for (const item of this.equipped_relics) {
            value += item.random_attributes['speed'] ?? 0;
            if (item.main_attribute?.key === 'speed') {
                value += item.main_attribute.value;
            }
        }
        return Math.max(0, value);
    }

    level_up(exp: number) {
        this.xp += exp;
        while (this.xp >= this.level_xp(this.level)) {
            if (this.level >= Character.MAX_LEVEL) {
                this.xp = 0;
                break;
            }
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

    get_exp_to_max_level(): number {
        if (this.level >= Character.MAX_LEVEL) return 0;
        let total = Math.max(0, this.level_xp(this.level) - this.xp);
        for (let l = this.level + 1; l < Character.MAX_LEVEL; l++) {
            total += this.level_xp(l);
        }
        return Math.ceil(total);
    }

    simulate_level_up(added_exp: number): { level: number, xp: number } {
        let current_level = this.level;
        let current_xp = this.xp + added_exp;

        while (current_xp >= this.level_xp(current_level)) {
            if (current_level >= Character.MAX_LEVEL) {
                current_xp = 0;
                break;
            }
            current_xp -= this.level_xp(current_level);
            current_level += 1;
        }

        if (current_level >= Character.MAX_LEVEL) {
            current_level = Character.MAX_LEVEL;
            current_xp = 0;
        }

        return { level: current_level, xp: current_xp };
    }

    level_hp(): void {
        const base = 500;
        const growth = base + 120 * this.level + 15 * Math.pow(this.level, 1.25);
        this.base_hp = growth;
        this.hp = growth;
    }

    level_def(): void {
        const base = 50;
        const growth = base + 15 * this.level + 2 * Math.pow(this.level, 1.1);
        this.base_def_ = growth;
    }

    level_atk(): void {
        const base = 100;
        const growth = base + 25 * this.level + 4 * Math.pow(this.level, 1.15);
        this.base_atk = growth;
    }

    skill(): number {
        return this.atk * 2.0;
    }

    general(): number {
        return this.atk * 1.0;
    }

    super_skill(): number {
        return this.atk * 4.0;
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
            equipped_relics: this.equipped_relics
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
        this.equipped_relics = data.equipped_relics || (data as any).equipped_items || [];
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
        const existing = this.active_effects.find(e => e.id === effect.id);
        if (existing) {
            if (existing.maxStacks && existing.stacks) {
                existing.stacks = Math.min(existing.maxStacks, existing.stacks + (effect.stacks || 1));
            }
            existing.duration = Math.max(existing.duration, effect.duration);
            return;
        }

        if (effect.stacks === undefined) effect.stacks = 1;
        this.active_effects.push(effect);
        if (this.env) {
            effect.onApply?.(this, this.env);
        }
    }

    remove_effect(effect_id: string): void {
        const index = this.active_effects.findIndex(e => e.id === effect_id);
        if (index !== -1) {
            const effect = this.active_effects[index];
            if (this.env) {
                effect.onRemove?.(this, this.env);
            }
            this.active_effects.splice(index, 1);
        }
    }

    update_effects(): void {
        this.active_effects = this.active_effects.filter(effect => {
            if (this.env) {
                effect.onTick?.(this, this.env);
            }
            effect.duration--;
            if (effect.duration <= 0) {
                if (this.env) {
                    effect.onRemove?.(this, this.env);
                }
                return false;
            }
            return true;
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

    onTurnStart(data?: any): void { }
    onTurnEnd(data?: any): void { }
    onAfterCharacterAction(data?: any): void { }
    onCharacterAction(data?: any): void { }
    onCharacterDeath(data?: any): void { }
    onWillBeingAttack(skill: Skill): Skill {
        return skill;
    }
    onAfterBeingAttacked(): void { }
}
