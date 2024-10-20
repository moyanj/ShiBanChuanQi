import { defineStore } from 'pinia';

// 定义 state 类型
interface DataStoreState {
  page_type: string;
  is_electron: boolean;
  build_info: Array<any> | null;
}

export interface SaveStoreState {
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
    is_electron: false,
    build_info: null,
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