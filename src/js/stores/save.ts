import { defineStore } from 'pinia';
import { ThingsManager } from '../things';
import { ItemManager } from '../item';
import { CharacterManager } from '../character';
import { randomName } from '../lib/name';

export interface SaveStoreState {
    user_name: string;
    user_avatar: string;
    things: ThingsManager; // 物品
    items: ItemManager; // 道具管理器
    n_wish: number;
    characters: CharacterManager;
    wish_number: number;
}

export const useSaveStore = defineStore('save', {
    persist: true,
    state: (): SaveStoreState => ({
        user_name: randomName.getNickName(), // 玩家名字
        user_avatar: 'avatars/1.png', // 玩家头像
        things: new ThingsManager(), // 物品
        items: new ItemManager(), // 道具管理器
        n_wish: 0, // 自上次出货以来抽卡次数
        characters: new CharacterManager(), // 角色
        wish_number: 0, // 抽卡次数
    }),
});
