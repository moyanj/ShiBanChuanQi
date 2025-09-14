import { defineStore } from 'pinia';
import { ThingsManager } from './things';
import { ItemManager} from './item';
import { CharacterManager, Character } from './character';
import { AudioPlayer } from './utils';
import { HistoryManager } from './lib/ai';
import { randomName } from './lib/name';
import { Battle } from './fight';

interface BuildInfoState {
    version: string;
    electron_version: string;
    time: string;
    platform: string;
    arch: string;
    timestamp: number;
}

// 定义 state 类型
export interface DataStoreState {
    page_type: string;
    is_electron: boolean;
    build_info: BuildInfoState | null;
    console_show: boolean;
    is_dev: boolean;
}

export interface SaveStoreState {
    user_name: string;
    user_avatar: string;
    things: ThingsManager; // 物品
    items: ItemManager; // 道具管理器
    n_wish: number;
    characters: CharacterManager;
    wish_number: number;
}


export interface ChatStoreState {
    d: HistoryManager
}

export interface FightStoreState {
    enemy: Character[];
    our: Character[];
    ai: boolean;
    battle_instance: Battle | null; // 战斗实例
    selected_our_character: Character | null; // 当前玩家选择的行动角色
    selected_target_character: { type: 'enemy' | 'our', character: Character } | null; // 当前玩家选择的目标角色
    selected_characters: Character[]; // 用户在战斗前选择的角色
}

export const useDataStore = defineStore('data', {
    state: (): DataStoreState => ({
        page_type: 'main',
        is_electron: false,
        build_info: null,
        console_show: false,
        is_dev: import.meta.env.MODE == "development"
    }),
});

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

export const useChatStore = defineStore("chat", {
    persist: true,
    state: (): ChatStoreState => ({
        d: new HistoryManager()
    }),
})


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

export const APM: AudioPlayer = new AudioPlayer();
