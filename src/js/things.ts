export class Thing {
    name: string;
    desc: string;
    inside_name: string;
    icon: string;
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

        this.add(new XinHuo(), 280000);
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
    get_all(): object {
        return this.things;
    }
    remove(id: string, n: number = 1): void {
        this.things[id] -= n;
        if (this.things[id] < 0) {
            this.things[id] = 0;
        }
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

export class EXP extends Thing {
    constructor() {
        super();
        this.name = "经验值";
        this.desc = "用于升级角色的经验值";
        this.inside_name = "EXP";
    }
}

export const ThingList: object = {
    "XinHuo": XinHuo,
    "EXP": EXP
}


