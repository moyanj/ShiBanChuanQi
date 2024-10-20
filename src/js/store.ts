import { defineStore } from "pinia";

export const useDataStore = defineStore("data_store", {
    persist: {
        type: "storage",
        
    },
    state: () => {
        return {
            page_type: "main",
        }
    },
});

export const useSaveStore = defineStore("save", {
    persist: {
        type: "storage",
        name: "save",
        encryption: true,
    },
    state: () => {
        return {
            user_name: "玩家",
            user_level: 1,
        }
    }
})