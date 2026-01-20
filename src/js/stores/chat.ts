import { defineStore } from 'pinia';
import { HistoryManager } from '../lib/ai';

export interface ChatStoreState {
    d: HistoryManager
}

export const useChatStore = defineStore("chat", {
    persist: true,
    state: (): ChatStoreState => ({
        d: new HistoryManager()
    }),
})
