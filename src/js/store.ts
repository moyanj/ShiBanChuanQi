import { defineStore } from 'pinia';

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