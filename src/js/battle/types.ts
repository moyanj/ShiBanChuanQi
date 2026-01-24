import { Character } from "../character";
export { Character };

export enum SkillType {
    Damage = "伤害",
    Heal = "治疗",
    Buff = "增益",
    Debuff = "减益",
    PartyBuff = "队伍增益",
    PartyDebuff = "队伍减益",
}

export interface Skill {
    name: string; // 技能名称
    type: SkillType;  // 技能类型
    value: number; // 技能数值（伤害量、治疗量、增益/减益值等）
    cost: number; // 战技点消耗
    targetScope: 'single' | 'all_allies' | 'all_enemies';  // 目标范围
    attribute?: 'atk' | 'def_' | 'speed' | 'hp'; // 修改的属性，仅对 Buff/Debuff 有效
    duration?: number; // 持续回合数，仅对 Buff/Debuff 有效
    description: string;  // 技能描述
}

export interface ATB {
    [property: string]: number;
}

export enum BattleEvent {
    BATTLE_START = "BATTLE_START",
    TURN_START = "TURN_START",
    TURN_END = "TURN_END",
    BEFORE_ACTION = "BEFORE_ACTION",
    AFTER_ACTION = "AFTER_ACTION",
    BEFORE_DAMAGE = "BEFORE_DAMAGE",
    AFTER_DAMAGE = "AFTER_DAMAGE",
    BEFORE_HEAL = "BEFORE_HEAL",
    AFTER_HEAL = "AFTER_HEAL",
    CHARACTER_DEATH = "CHARACTER_DEATH",
    SKILL_EXECUTE = "SKILL_EXECUTE",
}

export interface BattleEventData {
    [BattleEvent.BATTLE_START]: IBattle;
    [BattleEvent.TURN_START]: Character;
    [BattleEvent.TURN_END]: Character;
    [BattleEvent.BEFORE_ACTION]: Character;
    [BattleEvent.AFTER_ACTION]: Character;
    [BattleEvent.BEFORE_DAMAGE]: Character;
    [BattleEvent.AFTER_DAMAGE]: {
        character_name: string;
        damage: number;
        target_party: 'our' | 'enemy';
    };
    [BattleEvent.BEFORE_HEAL]: Character;
    [BattleEvent.AFTER_HEAL]: {
        character_name: string;
        amount: number;
        target_party: 'our' | 'enemy';
    };
    [BattleEvent.CHARACTER_DEATH]: Character;
    [BattleEvent.SKILL_EXECUTE]: {
        attacker: Character;
        skill: Skill;
        target_party: 'enemy' | 'our';
        target_character_name: string;
    };
}

export type BattleEventHandler<T extends BattleEvent> = (data: BattleEventData[T]) => void;

export interface IBattle {
    enemy: any;
    our: any;
    battle_log: string[];
    battle_points: number;
    log(message: string): void;
    onCharacterAction(): void;
    onAfterCharacterAction(): void;
    get_action_order(): any[];

    on<T extends BattleEvent>(event: T, handler: BattleEventHandler<T>): void;
    off<T extends BattleEvent>(event: T, handler: BattleEventHandler<T>): void;
    emit<T extends BattleEvent>(event: T, data: BattleEventData[T]): void;
}
