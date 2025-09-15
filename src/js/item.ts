import { v4 as uuidv4 } from "uuid"; // 用于生成唯一ID
import { MersenneTwister } from "./utils";

const rng = new MersenneTwister(); // 初始化随机数生成器

export interface Item {
    // Item 独立于 Thing
    id: string; // 道具唯一ID
    name: string; // 道具名称
    inside_name: string; // 内部名
    random_attributes: {
        // 随机属性，最多三个
        hp?: number;
        atk?: number;
        def_?: number;
        speed?: number;
    };
    equipped?: boolean; // 是否已被装备的标记
}

/**
 * 生成一个随机道具
 * @returns {Item} 生成的道具
 */
export function generateRandomItem(): Item {
    const itemNames = [
        "DSM王朝的记忆",
        "繁星最后的余光",
        "日记中的言语",
        "纸上的异世界",
        "破空的镜子一角",
        "古战场对世界的哀鸣",
        "望风的笼中鸟",
        "继承者的遗产",
        "刚翻开的夏书",
        "宇宙般永恒的孤独",
        "仿若无人之地",
        "坠入亚特兰蒂斯",
        "捕风的异乡人",
        "无尽冬日的温暖",
        "被风所打的记忆",
        "梦境中的花园",
        "流浪者的归宿",
        "星辰大海的邀约",
        "遗忘之地的呼唤",
        "穿越次元的信使",
        "时光尽头的誓言",
    ];

    const randomName = rng.random_choice(itemNames); // 随机选择一个名字

    const attributes = ["hp", "atk", "def_", "speed"];
    const selectedAttributes: {
        hp?: number;
        atk?: number;
        def_?: number;
        speed?: number;
    } = {};
    const numRandomAttributes = rng.randint(1, 3); // 1到3个随机属性
    console.log(numRandomAttributes);
    // 随机选择属性并赋值
    for (let i = 0; i < numRandomAttributes; i++) {
        const attributeName = rng.random_choice(attributes);
        // 避免重复选择同一个属性
        if (
            selectedAttributes[attributeName] === undefined
        ) {
            let value = 0;
            switch (attributeName) {
                case "hp":
                    value = rng.randint(1, 150); // -10 到 +10
                    break;
                case "atk":
                    value = rng.randint(10, 35); // -5 到 +5
                    break;
                case "def_":
                    value = rng.randint(10, 35);
                    break;
                case "speed":
                    value = rng.randint(5, 15); // -2 到 +2
                    break;
            }
            if (value !== 0) {
                selectedAttributes[attributeName as keyof typeof selectedAttributes] =
                    value;
            }
        }
    }
    console.log(selectedAttributes)
    return {
        id: uuidv4(),
        name: randomName,
        inside_name: randomName.replace(/\s/g, ""), // 生成内部名
        random_attributes: selectedAttributes,
        equipped: false, // 默认未装备
    };
}

export class ItemManager {
    private items: { [id: string]: Item } = {};

    constructor() {
        this.items = {};
    }

    /**
     * 添加一个道具到管理器
     * @param item 要添加的道具
     */
    add(item: Item) {
        this.items[item.id] = item;
    }

    /**
     * 根据ID获取道具
     * @param id 道具的唯一ID
     * @returns 对应的道具，如果不存在则返回 undefined
     */
    get(id: string): Item | undefined {
        return this.items[id];
    }

    /**
     * 获取所有道具
     * @returns 包含所有道具的数组
     */
    getAll(): Item[] {
        return Object.values(this.items);
    }

    /**
     * 根据ID删除道具
     * @param id 要删除道具的唯一ID
     * @returns 如果删除成功则返回 true，否则返回 false
     */
    remove(id: string): boolean {
        if (this.items[id]) {
            delete this.items[id];
            return true;
        }
        return false;
    }

    /**
     * 更新道具信息
     * @param item 要更新的道具
     */
    update(item: Item): void {
        this.items[item.id] = item;
    }

    /**
     * 清空所有道具
     */
    clear() {
        this.items = {};
    }

    /**
     * 序列化道具管理器的数据
     * @returns 包含所有道具的数组
     */
    dump(): Item[] {
        return this.getAll();
    }

    /**
     * 从序列化数据中加载道具管理器
     * @param data 序列化的道具数组
     */
    load(data: Item[]) {
        this.clear();
        data.forEach((item) => {
            this.add(item);
        });
    }
}
