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

export interface IBattle {
    enemy: any;
    our: any;
    battle_log: string[];
    battle_points: number;
    log(message: string): void;
    onCharacterAction(): void;
    onAfterCharacterAction(): void;
}
