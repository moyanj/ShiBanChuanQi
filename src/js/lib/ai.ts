enum Role {
    user = "user",
    ai = "assistant"
}
export interface ChatHistory {
    role: Role | string;
    content: string
}

interface Metadata {
    type: string,
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

export class HistoryManager {
    rooms: Record<string, ChatHistory[]>;
    room_type: Record<string, string>;

    constructor() {
        this.rooms = {};
        this.room_type = {}; // 初始化 room_type
    }

    // 创建房间
    create_room(name: string, type: string = "man"): boolean {
        if (name in this.rooms) {
            return false; // 房间已存在，返回 false
        }
        this.rooms[name] = [];
        this.room_type[name] = type;
        return true; // 房间创建成功，返回 true
    }

    // 删除房间
    del_room(name: string): boolean {
        if (!(name in this.rooms)) {
            return false; // 房间不存在，返回 false
        }
        delete this.rooms[name]; // 删除房间
        delete this.room_type[name]; // 删除房间类型
        return true; // 房间删除成功，返回 true
    }

    // 添加消息
    add_msg(room: string, content: ChatHistory): boolean {
        if (room in this.rooms) {
            this.rooms[room].push(content);
            return true; // 消息添加成功，返回 true
        }
        return false; // 房间不存在，返回 false
    }

    // 获取房间历史
    get_history(room: string): ChatHistory[] | null {
        if (room in this.rooms) {
            return this.rooms[room]; // 返回房间历史
        }
        return null; // 房间不存在，返回 null
    }

    // 获取房间类型
    get_room_type(room: string): string | null {
        if (room in this.room_type) {
            return this.room_type[room]; // 返回房间类型
        }
        return null; // 房间不存在，返回 null
    }
}


export class Qianfan {
    private token: string;
    constructor() { }

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


