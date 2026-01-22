import { Skill, SkillType } from "./battle/types";

export interface ConsumableItem {
    id: string;
    name: string;
    description: string;
    rarity: number;
    icon: string;
    effect: Skill;
}

export const ConsumableItems: { [key: string]: ConsumableItem } = {
    "HealPotionSmall": {
        id: "HealPotionSmall",
        name: "小型生命药剂",
        description: "恢复单体目标 500 点生命值",
        rarity: 3,
        icon: "items/heal_small.png",
        effect: {
            name: "小型治疗",
            type: SkillType.Heal,
            value: 500,
            cost: 0,
            targetScope: 'single',
            description: "恢复 500 点生命值"
        }
    },
    "HealPotionLarge": {
        id: "HealPotionLarge",
        name: "大型生命药剂",
        description: "恢复单体目标 2000 点生命值",
        rarity: 4,
        icon: "items/heal_large.png",
        effect: {
            name: "大型治疗",
            type: SkillType.Heal,
            value: 2000,
            cost: 0,
            targetScope: 'single',
            description: "恢复 2000 点生命值"
        }
    },
    "AtkBuffPotion": {
        id: "AtkBuffPotion",
        name: "力量药水",
        description: "提升单体目标 20% 攻击力，持续 2 回合",
        rarity: 4,
        icon: "items/atk_buff.png",
        effect: {
            name: "力量提升",
            type: SkillType.Buff,
            value: 0.2,
            cost: 0,
            targetScope: 'single',
            attribute: 'atk',
            duration: 2,
            description: "提升 20% 攻击力"
        }
    },
    "AllHealPotion": {
        id: "AllHealPotion",
        name: "全队复苏剂",
        description: "恢复我方全体 1000 点生命值",
        rarity: 5,
        icon: "items/all_heal.png",
        effect: {
            name: "全队恢复",
            type: SkillType.Heal,
            value: 1000,
            cost: 0,
            targetScope: 'all_allies',
            description: "全体恢复 1000 点生命值"
        }
    }
};
