

declare global {
    export interface GeetestConfig {
        captchaId: string,
        product?: string,
        nativeButton?: object,
        rem?: number,
        language?: string,
        protocol?: string,
        timeout?: number,
        hideBar?: Array<string | null>,
        mask?: object,
        apiServers?: Array<string>,
        nextWidth?: string,
        riskType?: string,
        hideSuccess?: boolean,
        offlineCb?: Function,
        onError?: Function,
        userInfo?: string
    }

    export interface GeetestObj {
        appendTo(ele: string | HTMLElement): void;
        getValidate(): object;
        reset(): void;
        showCaptcha(): void;
        onReday(callback: Function): void;
        onSuccess(callback: Function): void;
        onNextReady(callback: Function): void;
        onFail(callback: (failObj: object) => any): void;
        onErrror(callback: (error: object) => any): void;
        onClose(callback: Function): void;
        destroy(): void;
    }

    interface Window {
        initGeetest4(userConfig: GeetestConfig, callback: (g: GeetestObj) => any): void;
    }
}

export { };