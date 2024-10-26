export class Thing {
    name: string;
    desc: string;
    constructor() {
        this.name = "测试物品";
        this.desc = "这是一个测试物品”";
    }
}

export class ThingsManager {
    things: Object;
    constructor() {
        this.things = {};
    }
    add(thing: Thing, n: number = 1) {
        let name = Object.getPrototypeOf(thing).constructor.name;
        if (this.things[name] == undefined) {
            this.things[name] = 0;
        } else if (this.things[name] == null) {
            this.things[name] = 0;
        }
        this.things[name] += n;
    }
    get(id: string) {
        if (this.things[id] == undefined) {
            this.things[id] = 0;
        } else if (this.things[id] == null) {
            this.things[id] = 0;
        }
        return this.things[id];
    }
    get_all() {
        return this.things;
    }
    remove(id: string, n: number = 1) {
        this.things[id] -= n;
    }
}

export class XinHuo extends Thing {
    constructor() {
        super();
        this.name = "星火";
        this.desc = "来自星星的一颗火星";
    }
}

export const ThingList = {
    "XinHuo": XinHuo
}


