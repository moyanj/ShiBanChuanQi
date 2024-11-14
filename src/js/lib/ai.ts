enum Role {
    user = "user",
    ai = "assistant"
}
export interface ChatHistory {
    role: Role | string;
    content: string
}

const keys = {  // base64 *2
    "n": 2,
    "baidu_id": "ZUZacGNEVlpUV3RPVkhsUk9HMXhXSGRGWkZWVU1taFo=",
    "baidu_secret": "VlZaNlZucHpVR0ZOVGxGT2RGSXdiVEp4YjBRd01XZE5WbWR1Y0VrMlkyMD0=",
    "cf_id": 'TURSaVpEUTBZV05rTlRZeU9UZzJNVGxqTWpFek5Ea3paalZqTTJFd1pEYz0=',
    "cf_token": 'UW5SR2NqUmpOMUpPVXpoUE0wTkZibmRGUVd4NlpUVk5kRzFFWlVOUVJXdEVTbkJ0V0dwU1dBPT0='
}

const decode = (type) => {
    let decoded = keys[type];
    for (let i = 0; i < keys["n"]; i++) {
        decoded = atob(decoded)
    }
    return decoded
}

export class HistoryManager {}

export class Qianfan {
    private token: string;
    constructor() {}

    private async getAccessToken() {
        if (this.token) {
            return;
        }
        const url = `https://proxy.moyanjdc.top/qianfan/oauth/2.0/token?grant_type=client_credentials&client_id=${decode("baidu_id")}&client_secret=${decode("baidu_secret")}`;

        let response = await fetch(url, { method: 'POST' })
        let data = await response.json()
        this.token = data.access_token
    }

    async chat(history: ChatHistory[], prompt: string = "你是一个人") {
        await this.getAccessToken()
        const url = `https://proxy.moyanjdc.top/qianfan/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie_speed?access_token=${this.token}`;
        const body = JSON.stringify({
            system: prompt,
            messages: history
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
        
        const data = await response.json();
        return data.result
    }


}


