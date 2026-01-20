import { defineStore } from 'pinia';
import { Character } from '../character';
import { Battle } from '../fight';

export interface FightStoreState {
    enemy: Character[];
    our: Character[];
    ai: boolean;
    battle_instance: Battle | null; // 战斗实例
    selected_our_character: Character | null; // 当前玩家选择的行动角色
    selected_target_character: { type: 'enemy' | 'our', character: Character } | null; // 当前玩家选择的目标角色
    selected_characters: Character[]; // 用户在战斗前选择的角色
}

export const useFightStore = defineStore("fight", {
    state: (): FightStoreState => ({
        enemy: [],
        our: [],
        ai: false,
        battle_instance: null,
        selected_our_character: null,
        selected_target_character: null,
        selected_characters: [], // 初始化为空数组
    }),
});
