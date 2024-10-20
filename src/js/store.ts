import { defineStore } from 'pinia';

// 定义 state 类型
interface DataStoreState {
  page_type: string;
}

interface SaveStoreState {
  user_name: string;
  user_level: number;
  user_avatar: string;
}

export const useDataStore = defineStore('data_store', {
  persist: {
    type: 'storage',
  },
  state: (): DataStoreState => ({
    page_type: 'main',
  }),
});

export const useSaveStore = defineStore('save', {
  persist: {
    type: 'storage',
    name: 'save',
    encryption: true,
  },
  state: (): SaveStoreState => ({
    user_name: '玩家',
    user_level: 1,
    user_avatar: '',
  }),
});