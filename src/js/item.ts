import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一ID

export interface Item { // Item 独立于 Thing
    id: string; // 道具唯一ID
    name: string; // 道具名称
    inside_name: string; // 内部名
    random_attributes: { // 随机属性，最多三个
        hp?: number;
        atk?: number;
        def_?: number;
        speed?: number;
    };
}

/**
 * 生成一个随机道具
 * @returns {Item} 生成的道具
 */
export function generateRandomItem(): Item {
    const itemNames = ["神秘护符", "古老戒指", "能量水晶", "坚韧护甲", "锋利之刃"];

    const randomName = itemNames[Math.floor(Math.random() * itemNames.length)];

    const attributes = ['hp', 'atk', 'def_', 'speed'];
    const selectedAttributes: { hp?: number; atk?: number; def_?: number; speed?: number; } = {};
    const numRandomAttributes = Math.floor(Math.random() * 3) + 1; // 1到3个随机属性

    // 随机选择属性并赋值
    for (let i = 0; i < numRandomAttributes; i++) {
        const randomIndex = Math.floor(Math.random() * attributes.length);
        const attributeName = attributes[randomIndex];
        // 避免重复选择同一个属性
        if (selectedAttributes[attributeName as keyof typeof selectedAttributes] === undefined) {
            let value = 0;
            switch (attributeName) {
                case 'hp':
                    value = Math.floor(Math.random() * 20) - 10; // -10 到 +10
                    break;
                case 'atk':
                    value = Math.floor(Math.random() * 10) - 5; // -5 到 +5
                    break;
                case 'def_':
                    value = Math.floor(Math.random() * 10) - 5;
                    break;
                case 'speed':
                    value = Math.floor(Math.random() * 4) - 2; // -2 到 +2
                    break;
            }
            if (value !== 0) {
                selectedAttributes[attributeName as keyof typeof selectedAttributes] = value;
            }
        }
    }

    return {
        id: uuidv4(),
        name: randomName,
        inside_name: randomName.replace(/\s/g, ''), // 生成内部名
        random_attributes: selectedAttributes,
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
        data.forEach(item => {
            this.add(item);
        });
    }
}