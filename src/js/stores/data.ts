import { defineStore } from 'pinia';

interface BuildInfoState {
    version: string;
    electron_version: string;
    time: string;
    platform: string;
    arch: string;
    timestamp: number;
}

export interface DataStoreState {
    page_type: string;
    is_electron: boolean;
    build_info: BuildInfoState | null;
    console_show: boolean;
    is_dev: boolean;
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
