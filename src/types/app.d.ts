// global.d.ts
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
        
        // 其他 electron 属性可以在这里添加
      };
    }
  }

  // 这行确保这个文件被视为一个模块
  export {};
  