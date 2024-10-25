import icon_left from "../assets/icon/left.svg";
import icon_character from "../assets/icon/character.svg";
import icon_info from "../assets/icon/info.svg";
import icon_backpack from "../assets/icon/backpack.svg";
import icon_setting from "../assets/icon/setting.svg";
import icon_door from "../assets/icon/door.svg";
import icon_wish from "../assets/icon/wish.png";
import icon_element_fire from "../assets/icon/element-fire.png";
import icon_element_water from "../assets/icon/element-water.png";
import icon_element_thunder from "../assets/icon/element-thunder.png";
import icon_element_grass from "../assets/icon/element-grass.png";
import icon_element_physics from "../assets/icon/element-physics.png";
import icon_element_liangzi from "../assets/icon/element-liangzi.png";
import icon_element_nihility from "../assets/icon/element-nihility.png";

export const icons = {
    left: icon_left,
    character: icon_character,
    info: icon_info,
    backpack: icon_backpack,
    setting: icon_setting,
    door: icon_door,
    wish: icon_wish,
    element: {
        fire: icon_element_fire,
        water: icon_element_water,
        thunder: icon_element_thunder,
        grass: icon_element_grass,
        physics: icon_element_physics,
        liangzi: icon_element_liangzi,
        nihility: icon_element_nihility
    }
}

export function randomNum(minNum: number, maxNum?: number): number {
    // 检查 minNum 是否为正数
    if (minNum < 0) {
        throw new Error('minNum must be a non-negative number');
    }

    // 如果只传入一个参数，生成从 1 到 minNum 的随机数
    if (maxNum === undefined) {
        return Math.floor(Math.random() * minNum) + 1;
    }

    // 检查 maxNum 是否大于 minNum
    if (maxNum < minNum) {
        throw new Error('maxNum must be greater than or equal to minNum');
    }

    // 生成从 minNum 到 maxNum 的随机数
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

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

    return 'Unknown';
}

export class MersenneTwister {
    private index: number;
    private mt: number[];

    constructor(seed: number=-1) {
        if (seed < 0) {
            seed = new Date().getTime();
        }
        this.index = 624;
        this.mt = new Array(624);
        this.mt[0] = seed >>> 0; // Ensure unsigned

        for (let i = 1; i < 624; i++) {
            this.mt[i] = (1812433253 * (this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
        }
    }

    // 提取随机数
    private extractNumber(): number {
        if (this.index >= 624) {
            this.twist();
        }

        let y = this.mt[this.index];
        y ^= (y >>> 11);
        y ^= (y << 7) & 0x9D2C5680;
        y ^= (y << 15) & 0xEFC60000;
        y ^= (y >>> 18);

        this.index++;
        return y >>> 0; // Ensure unsigned
    }

    // 返回 0 到 1 之间的随机数
    public random(): number {
        return this.extractNumber() / 0xFFFFFFFF;
    }

    // 返回指定数量的随机数
    public randomArray(count: number): number[] {
        const randomNumbers: number[] = [];
        for (let i = 0; i < count; i++) {
            randomNumbers.push(this.random());
        }
        return randomNumbers;
    }

    // 扭曲操作
    private twist(): void {
        for (let i = 0; i < 624; i++) {
            const y = (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % 624] & 0x7FFFFFFF);
            this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
            if (y % 2 !== 0) {
                this.mt[i] ^= 0x9908B0DF;
            }
        }
        this.index = 0; // Reset index
    }

    // 设置新种子
    public setSeed(seed: number): void {
        this.index = 624;
        this.mt[0] = seed >>> 0; // Ensure unsigned

        for (let i = 1; i < 624; i++) {
            this.mt[i] = (1812433253 * (this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
        }
    }
}