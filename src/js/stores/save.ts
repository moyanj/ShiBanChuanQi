import { defineStore } from 'pinia';
import { ThingsManager } from '../things';
import { ItemManager } from '../item';
import { CharacterManager } from '../character';
import { randomName } from '../lib/name';
import { useChatStore } from './chat';
import { SaveService } from '../SaveService';

export interface SaveStoreState {
    user_name: string;
    user_avatar: string;
    things: ThingsManager; // 物品
    items: ItemManager; // 道具管理器
    n_wish: number;
    characters: CharacterManager;
    wish_number: number;
}

let saveTimeout: any = null;

export const useSaveStore = defineStore('save', {
    state: (): SaveStoreState => ({
        user_name: randomName.getNickName(), // 玩家名字
        user_avatar: 'avatars/1.png', // 玩家头像
        things: new ThingsManager(), // 物品
        items: new ItemManager(), // 道具管理器
        n_wish: 0, // 自上次出货以来抽卡次数
        characters: new CharacterManager(), // 角色
        wish_number: 0, // 抽卡次数
    }),
    actions: {
        requestAutoSave() {
            if (saveTimeout) clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.save();
            }, 1000);
        },
        async save() {
            const chatStore = useChatStore();
            const data = {
                save: {
                    user_name: this.user_name,
                    user_avatar: this.user_avatar,
                    things: this.things.dump(),
                    items: this.items.dump(),
                    n_wish: this.n_wish,
                    characters: this.characters.dump(),
                    wish_number: this.wish_number,
                },
                chat: chatStore.d.dump()
            };
            return await SaveService.save(data);
        },
        async load() {
            const pkg = await SaveService.load();
            if (pkg && pkg.data) {
                const chatStore = useChatStore();
                const data = pkg.data;

                if (data.save) {
                    this.user_name = data.save.user_name || this.user_name;
                    this.user_avatar = data.save.user_avatar || this.user_avatar;
                    this.n_wish = data.save.n_wish || 0;
                    this.wish_number = data.save.wish_number || 0;

                    if (data.save.things) {
                        this.things.load(data.save.things);
                    }
                    if (data.save.items) {
                        this.items.load(data.save.items);
                    }
                    if (data.save.characters) {
                        this.characters.load(data.save.characters);
                    }
                }

                if (data.chat) {
                    chatStore.d.load(data.chat);
                }
                return true;
            }
            return false;
        }
    }
});
