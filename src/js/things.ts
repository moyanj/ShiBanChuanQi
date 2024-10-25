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
    add(thing: Thing, n:number=1) {
        let name = Object.getPrototypeOf(thing).constructor.name;
        if (this.things[name] == undefined) {
            this.things[name] = 0;
        }
        this.things[name] += n;
    }
    get(id: string) {
        return this.things[id];
    }
    get_all() {
        return this.things;
    }
    remove(id: string, n:number=1) {
        console.log(n);
        this.things[id] -= n;
    }
}

export class MeiDuQi extends Thing {
    constructor() {
        super();
        this.name = "梅杜莎棋";
        this.desc = "梅杜莎棋，是梅杜莎的棋子，可以控制梅杜莎进行攻击、技能、爆发技等操作。";
    }
}

export const ThingList = {
    "MeiDuQi": MeiDuQi
}

