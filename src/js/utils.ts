import icon_left from "../assets/icon/left.svg";
import icon_character from "../assets/icon/character.svg";
import icon_info from "../assets/icon/info.svg";
import icon_backpack from "../assets/icon/backpack.svg";
import icon_setting from "../assets/icon/setting.svg";
import icon_door from "../assets/icon/door.svg";
import icon_wish from "../assets/icon/wish.svg";
import icon_down from "../assets/icon/down.svg";
import icon_skip from "../assets/icon/skip.svg";
import icon_online from "../assets/icon/online.svg";
import icon_menu from "../assets/icon/menu.svg";
import icon_sword from "../assets/icon/sword.svg";
import icon_empty from "../assets/icon/empty.svg";
import icon_element_fire from "../assets/icon/element-fire.png";
import icon_element_water from "../assets/icon/element-water.png";
import icon_element_thunder from "../assets/icon/element-thunder.png";
import icon_element_grass from "../assets/icon/element-grass.png";
import icon_element_physics from "../assets/icon/element-physics.png";
import icon_element_liangzi from "../assets/icon/element-liangzi.png";
import icon_element_nihility from "../assets/icon/element-nihility.png";

import { Howl } from "howler";
import { Character, characters } from "./character";
export const icons = {
    left: icon_left,
    character: icon_character,
    info: icon_info,
    backpack: icon_backpack,
    setting: icon_setting,
    door: icon_door,
    wish: icon_wish,
    down: icon_down,
    skip: icon_skip,
    online: icon_online,
    menu: icon_menu,
    sword: icon_sword,
    empty: icon_empty,
    element: {
        fire: icon_element_fire,
        water: icon_element_water,
        thunder: icon_element_thunder,
        grass: icon_element_grass,
        physics: icon_element_physics,
        liangzi: icon_element_liangzi,
        nihility: icon_element_nihility,
    },
};

export const audios: object = {
    background: "audio/background/main.mp3",
    click: "audio/click.mp3",
    // 主题曲1
    theme1: "audio/theme/HerosQuest.mp3",
    // 主题曲2
    theme2: "audio/theme/HerosQuest2.mp3",
};

interface UserAgentInfo {
    ie?: string;
    edge?: string;
    firefox?: string;
    opera?: string;
    chrome?: string;
    safari?: string;
}

export function getExplore(): string {
    const userAgentInfo: UserAgentInfo = {};
    const userAgent: string = navigator.userAgent.toLowerCase();
    let match: RegExpMatchArray | null;

    // Detect IE
    match = userAgent.match(/rv:([\d.]+)\) like gecko/);
    if (match) {
        userAgentInfo.ie = match[1];
    }

    // Detect Edge
    match = userAgent.match(/edg\/([\d.]+)/);
    if (match) {
        userAgentInfo.edge = match[1];
    }

    // Detect Firefox
    match = userAgent.match(/firefox\/([\d.]+)/);
    if (match) {
        userAgentInfo.firefox = match[1];
    }

    // Detect Opera
    match = userAgent.match(/(?:opera|opr)\/([\d.]+)/);
    if (match) {
        userAgentInfo.opera = match[1];
    }

    // Detect Chrome
    match = userAgent.match(/chrome\/([\d.]+)/);
    if (match) {
        userAgentInfo.chrome = match[1];
    }

    // Detect Safari
    match = userAgent.match(/version\/([\d.]+).*safari/);
    if (match) {
        userAgentInfo.safari = match[1];
    }

    // Determine the browser based on the detected version
    if (userAgentInfo.ie) {
        return `IE ${userAgentInfo.ie}`;
    }
    if (userAgentInfo.edge) {
        return `Edge ${userAgentInfo.edge}`;
    }
    if (userAgentInfo.firefox) {
        return `Firefox ${userAgentInfo.firefox}`;
    }
    if (userAgentInfo.chrome) {
        return `Chrome ${userAgentInfo.chrome}`;
    }
    if (userAgentInfo.opera) {
        return `Opera ${userAgentInfo.opera}`;
    }
    if (userAgentInfo.safari) {
        return `Safari ${userAgentInfo.safari}`;
    }

    return "Unknown Browser";
}

export class MersenneTwister {
    private index: number;
    private mt: number[];

    constructor(seed: number = -1) {
        if (seed < 0) {
            seed = new Date().getTime();
        }
        this.index = 624;
        this.mt = new Array(624);
        // this.mt[0] = seed >>> 0; // Ensure unsigned

        this.setSeed(seed);
    }

    // 提取随机数
    private extractNumber(): number {
        if (this.index >= 624) {
            this.twist();
        }

        let y = this.mt[this.index];
        y ^= y >>> 11;
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= y >>> 18;

        this.index++;
        return y >>> 0; // Ensure unsigned
    }

    // 返回 0 到 1 之间的随机数
    public random(): number {
        return this.extractNumber() / 0xffffffff;
    }

    // 返回指定数量的随机数
    public randomArray(count: number): number[] {
        const randomNumbers: number[] = [];
        for (let i = 0; i < count; i++) {
            randomNumbers.push(this.random());
        }
        return randomNumbers;
    }

    public randint(min: number, max: number): number {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    public randfloat(min: number, max: number): number {
        return min + this.random() * (max - min);
    }

    public random_choice(choices: any[]): any {
        return choices[this.randint(0, choices.length)];
    }

    // 扭曲操作
    private twist(): void {
        for (let i = 0; i < 624; i++) {
            const y =
                (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % 624] & 0x7fffffff);
            this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
            if (y % 2 !== 0) {
                this.mt[i] ^= 0x9908b0df;
            }
        }
        this.index = 0; // Reset index
    }

    // 设置新种子
    public setSeed(seed: number): void {
        this.index = 624;
        this.mt[0] = seed >>> 0; // Ensure unsigned

        for (let i = 1; i < 624; i++) {
            this.mt[i] =
                (1812433253 * (this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
        }
    }
}

interface AudioObj {
    [key: string]: Howl;
}

interface AddOptions {
    [key: string]: any;
}

export class AudioPlayer {
    objs: AudioObj;

    constructor() {
        this.objs = {};
    }

    /**
     * 添加一个新的音频对象。
     * @param name - 音频对象的名称。
     * @param src - 音频文件的路径。
     * @param other - 其他配置选项。
     * @returns 新创建的音频对象，如果名称已存在则返回 null。
     */
    public add(name: string, src: string, other?: AddOptions): Howl | null {
        if (name in this.objs) {
            return null;
        }
        const obj = new Howl({
            src: [src],
            ...other,
        });
        this.objs[name] = obj;
        return obj;
    }

    /**
     * 获取指定名称的音频对象。
     * @param name - 音频对象的名称。
     * @returns 音频对象，如果不存在则返回 null。
     */
    public get(name: string): Howl | null {
        if (name in this.objs) {
            return this.objs[name];
        }
        return null;
    }

    /**
     * 播放指定名称的音频。
     * @param name - 音频对象的名称。
     * @returns 如果播放成功返回 true，否则返回 false。
     */
    public play(name: string): boolean {
        const obj = this.get(name);
        if (obj) {
            obj.play();
            return true;
        }
        return false;
    }

    /**
     * 停止播放指定名称的音频。
     * @param name - 音频对象的名称。
     * @returns 如果停止成功返回 true，否则返回 false。
     */
    public stop(name: string): boolean {
        const obj = this.get(name);
        if (obj) {
            obj.stop();
            return true;
        }
        return false;
    }

    /**
     * 暂停播放指定名称的音频。
     * @param name - 音频对象的名称。
     * @returns 如果暂停成功返回 true，否则返回 false。
     */
    public pause(name: string): boolean {
        const obj = this.get(name);
        if (obj) {
            obj.pause();
            return true;
        }
        return false;
    }

    /**
     * 设置或获取指定名称的音频是否循环播放。
     * @param name - 音频对象的名称。
     * @param s - 是否循环播放。如果为 null，则返回当前的循环状态。
     * @returns 如果设置成功返回 true，如果获取成功返回当前的循环状态，否则返回 null。
     */
    public loop(name: string, s: boolean | null = null): boolean | null {
        const obj = this.get(name);
        if (obj) {
            if (s === null) {
                return obj.loop();
            } else {
                obj.loop(s);
                return true;
            }
        }
        return null;
    }

    /**
     * 设置指定名称的音频的音量。
     * @param name - 音频对象的名称。
     * @param volume - 音量值，范围从 0 到 1。
     * @returns 如果设置成功返回 true，否则返回 false。
     */
    public setVolume(name: string, volume: number): boolean {
        const obj = this.get(name);
        if (obj) {
            obj.volume(volume);
            return true;
        }
        return false;
    }

    /**
     * 获取指定名称的音频的当前播放时间。
     * @param name - 音频对象的名称。
     * @returns 当前播放时间，如果音频对象不存在则返回 null。
     */
    public getCurrentTime(name: string): number | null {
        const obj = this.get(name);
        if (obj) {
            return obj.seek();
        }
        return null;
    }

    /**
     * 设置指定名称的音频的当前播放时间。
     * @param name - 音频对象的名称。
     * @param time - 播放时间，单位为秒。
     * @returns 如果设置成功返回 true，否则返回 false。
     */
    public setCurrentTime(name: string, time: number): boolean {
        const obj = this.get(name);
        if (obj) {
            obj.seek(time);
            return true;
        }
        return false;
    }

    /**
     * 获取指定名称的音频的总时长。
     * @param name - 音频对象的名称。
     * @returns 总时长，如果音频对象不存在则返回 null。
     */
    public getDuration(name: string): number | null {
        const obj = this.get(name);
        if (obj) {
            return obj.duration();
        }
        return null;
    }

    /**
     * 删除指定名称的音频对象。
     * @param name - 音频对象的名称。
     * @returns 如果删除成功返回 true，否则返回 false。
     */
    public remove(name: string): boolean {
        if (name in this.objs) {
            this.objs[name].unload();
            delete this.objs[name];
            return true;
        }
        return false;
    }
    public stopAll() {
        for (const name in this.objs) {
            this.stop(name);
        }
    }
    public removeAll() {
        for (const name in this.objs) {
            this.remove(name);
        }
    }
}

export function isLandscape() {
    // 判断横竖屏
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;
    // alert(width+"宽高"+height)
    if (width > height) {
        return true;
    } else {
        return false;
    }
}

export class SaveServer {
    baseUrl: string;
    constructor() {
        this.baseUrl = "https://sbcq-server.onrender.com";
        // this.baseUrl = "http://127.0.0.1:5000"
    }

    public upload(
        user: string,
        pwd: string,
        data: any,
        gt: object
    ): Promise<any> {
        return this.request(
            "POST",
            "/upload",
            { user: user, pwd: pwd, data: data },
            gt
        );
    }

    public download(user: string, pwd: string): Promise<any> {
        return this.request("GET", `/download?user=${user}&pwd=${pwd}`);
    }

    public register(user: string, pwd: string, gt: object): Promise<any> {
        return this.request("POST", "/reg", { user: user, pwd: pwd }, gt);
    }

    public remove(user: string, pwd: string, gt: object): Promise<any> {
        return this.request("POST", "/remove", { user: user, pwd: pwd }, gt);
    }

    private request(
        type: string,
        eurl: string,
        data: any | null = null,
        gt: object = null
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const url = this.baseUrl + eurl;
            const xhr = new XMLHttpRequest();
            xhr.open(type, url, true); // Use async requests
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = () => {
                resolve(xhr);
            };

            xhr.onerror = () => {
                reject(new Error("Network error occurred"));
            };
            if (gt) {
                data.gt = gt;
            }

            xhr.send(JSON.stringify(data));
        });
    }
}

export function get_character_by_dump(dump: Character): Character | null {
    const CharacterConstructor = characters[dump.inside_name];
    const selected_our_character = new CharacterConstructor();
    selected_our_character.load(dump);
    return selected_our_character;
}
