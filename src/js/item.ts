import { v4 as uuidv4 } from "uuid"; // 用于生成唯一ID
import { MersenneTwister } from "./utils";

const rng = new MersenneTwister(); // 初始化随机数生成器

export type AttributeType = "hp" | "atk" | "def_" | "speed";

export interface ItemAttribute {
    key: AttributeType;
    value: number;
}

export interface Item {
    // Item 独立于 Thing
    id: string; // 道具唯一ID
    name: string; // 道具名称
    inside_name: string; // 内部名
    rarity: number; // 稀有度 1-5
    main_attribute: ItemAttribute; // 主属性
    random_attributes: {
        // 副属性，最多四个
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
    
    // 1. 确定稀有度 (权重: 1*: 20%, 2*: 30%, 3*: 30%, 4*: 15%, 5*: 5%)
    const roll = rng.random();
    let rarity = 1;
    if (roll > 0.95) rarity = 5;
    else if (roll > 0.80) rarity = 4;
    else if (roll > 0.50) rarity = 3;
    else if (roll > 0.20) rarity = 2;
    
    // 2. 确定主属性
    const attributes: AttributeType[] = ["hp", "atk", "def_", "speed"];
    const mainAttrKey = rng.random_choice(attributes) as AttributeType;
    if (!mainAttrKey) {
        // Fallback in case of RNG issues
        return generateRandomItem();
    }
    
    // 主属性数值基于稀有度
    let mainAttrValue = 0;
    const multipliers = {
        hp: 50,    // 50 per rarity level approx
        atk: 10,   // 10 per rarity level approx
        def_: 10,
        speed: 2
    };
    
    // Base value + random variation
    const baseMult = multipliers[mainAttrKey];
    mainAttrValue = Math.floor(baseMult * rarity * rng.randfloat(0.8, 1.2));
    if (mainAttrKey === 'speed') mainAttrValue = Math.max(1, mainAttrValue); // ensure speed > 0

    const main_attribute: ItemAttribute = {
        key: mainAttrKey,
        value: mainAttrValue
    };

    // 3. 确定副属性
    // 数量: 1*: 0-1, 2*: 1-2, 3*: 2-3, 4*: 3, 5*: 3-4
    let minSubs = Math.max(0, rarity - 2);
    let maxSubs = Math.min(4, rarity);
    if (rarity === 5) { minSubs = 3; maxSubs = 4; }
    
    const numRandomAttributes = rng.randint(minSubs, maxSubs);

    const selectedAttributes: {
        hp?: number;
        atk?: number;
        def_?: number;
        speed?: number;
    } = {};

    // 副属性池 (排除主属性?) - 原神里主属性不会出现在副属性中，这里我们仿照
    const subPool = attributes.filter(a => a !== mainAttrKey);
    
    // 随机选择属性并赋值
    // 为了防止死循环（虽然池子够大），这里简单处理
    // Fisher-Yates shuffle simplified
    for (let i = subPool.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [subPool[i], subPool[j]] = [subPool[j], subPool[i]];
    }
    
    for (let i = 0; i < Math.min(numRandomAttributes, subPool.length); i++) {
        const attributeName = subPool[i];
        let value = 0;
        // 副属性数值大约是主属性的 20-40%
        switch (attributeName) {
            case "hp":
                value = rng.randint(10, 30) * rarity; 
                break;
            case "atk":
                value = rng.randint(2, 8) * rarity; 
                break;
            case "def_":
                value = rng.randint(2, 8) * rarity;
                break;
            case "speed":
                value = rng.randint(1, 3) * rarity; 
                break;
        }
        if (value > 0) {
            selectedAttributes[attributeName] = value;
        }
    }

    return {
        id: uuidv4(),
        name: randomName,
        inside_name: randomName.replace(/\s/g, ""), // 生成内部名
        rarity: rarity,
        main_attribute: main_attribute,
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
            // Migration for old items without main_attribute or rarity
            if (!item.main_attribute || !item.main_attribute.key || isNaN(item.main_attribute.value)) {
                 // Convert one random attribute to main, or generate one
                 const attrs = Object.keys(item.random_attributes || {}) as AttributeType[];
                 if (attrs.length > 0) {
                     const key = attrs[0];
                     const val = item.random_attributes[key]!;
                     item.main_attribute = { key: key, value: val || 100 };
                     delete item.random_attributes[key];
                 } else {
                     // No attributes? give generic
                     item.main_attribute = { key: 'hp', value: 100 };
                 }
            }
            if (!item.rarity) {
                item.rarity = 1;
            }
            this.add(item);
        });
    }
}
