export enum ThingsID {
    MeiDuQi,
}
export var things = {
    [ThingsID.MeiDuQi]: {
        name: '美杜奇',
        desc: '梅杜莎是游戏里的一个角色，她拥有超能力，可以控制自己周围的物体。',
        // 内部名称
        id: "MeiDuQi",
    }   
}

export class Thing {
    id: ThingsID;
    name: string;
    desc: string;
    constructor(id: ThingsID) {
        this.id = id;
        this.name = things[id].name;
        this.desc = things[id].desc;
    }
}

export class ThingsManager {
    things: Object;
    constructor() {
        this.things = {};
    }
    add(thing: Thing) {
        if (this.things[thing.id] == undefined) {
            this.things[thing.id] = 0;
        }
        this.things[thing.id] += 1;
    }
    get(id: ThingsID) {
        return this.things[id];
    }
}

