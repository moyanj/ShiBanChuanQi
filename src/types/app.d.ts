
declare global {

    interface Window {
        openDevTools: Function;
        webkitAudioContext: object;
        mozAudioContext: object;
        msAudioContext: object;
        electron: {
            version: {
                electron: string;
                node: string;
                v8: string;
                chrome: string
            }; // 根据你的实际属性定义
            send: any;
            receive: any;
            argv: any;
            saveGame: (data: any) => Promise<{ success: boolean; error?: string }>;
            loadGame: () => Promise<{ success: boolean; data?: any; error?: string }>;
        };
    }
}

// 这行确保这个文件被视为一个模块
export { };
