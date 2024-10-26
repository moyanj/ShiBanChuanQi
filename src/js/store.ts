import { defineStore } from 'pinia';
import { ThingsManager } from './things';
import { CharacterManager } from './character';
import { AudioPlayer } from './utils';

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
  user_level: number;
  user_avatar: string;
  things: ThingsManager;
  n_wish: number;
  characters: CharacterManager;
  wish_number: number;
}

export const useDataStore = defineStore('data_store', {
  persist: true,
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
    user_name: '玩家',
    user_level: 1,
    user_avatar: 'avatars/1.png',
    things: new ThingsManager(),
    n_wish: 0,
    characters: new CharacterManager(),
    wish_number: 0,
  }),
});

export const audios = new AudioPlayer()