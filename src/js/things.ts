export class Thing {
    name: string;
    desc: string;
    // 内部名
    inside_name: string;
    constructor() {
        this.name = "测试物品";
        this.desc = "这是一个测试物品”";
        this.inside_name = "thing";
    }
}

export class ThingsManager {
    things: Object;
    constructor() {
        this.things = {};
    }
    add(thing: Thing, n: number = 1): void {
        let name: string = thing.inside_name;
        if (this.things[name] == undefined) {
            this.things[name] = 0;
        } else if (this.things[name] == null) {
            this.things[name] = 0;
        }
        this.things[name] += n;
    }
    get(id: string): number {
        if (this.things[id] == undefined) {
            this.things[id] = 0;
        } else if (this.things[id] == null) {
            this.things[id] = 0;
        }
        return this.things[id];
    }
    get_all():object {
        return this.things;
    }
    remove(id: string, n: number = 1):void {
        this.things[id] -= n;
    }
}

export class XinHuo extends Thing {
    constructor() {
        super();
        this.name = "星火";
        this.desc = "来自星星的一颗火星";
        this.inside_name = "XinHuo";
    }
}

export const ThingList:object = {
    "XinHuo": XinHuo
}


