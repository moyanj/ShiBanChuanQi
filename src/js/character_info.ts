import { CharacterType, FightEnv } from "./character";

export class Character {
    name: string;
    desc: string;

    general_name: string;
    skill_name: string;
    super_skill_name: string;

    general_desc: string;
    skill_desc: string;
    super_skill_desc: string;

    level: number;
    type: CharacterType;
    xp: number;
    hp: number;
    atk: number;
    def_: number;
    speed: number;
    env: FightEnv | null;

    constructor(env: FightEnv | null = null) {
        this.name = "Test"; // 角色名
        this.desc = "这是一个测试角色";

        this.skill_name = "技能";
        this.general_name = "普通攻击";
        this.super_skill_name = "爆发技";
        

        this.skill_desc = "这是一个测试技能";
        this.general_desc = "这是一个普通攻击";
        this.super_skill_desc = "这是一个爆发技";

        this.level = 1; // 等级
        this.type = CharacterType.Water; // 角色类型
        this.xp = 0; // 经验
        this.hp = 100; // 血量
        this.atk = 10; // 攻击力
        this.def_ = 10; // 防御
        this.speed = 100; // 速度
        this.env = env;
    }

    level_xp() {
        // 计算升级所需经验
        return 100 * Math.pow(this.level, 2.5) + 150 * this.level * Math.log(this.level + 1);
    }

    level_hp() {
        // 计算等级对应血量
        this.hp = 55 * this.level + 100 + 20 * Math.pow(this.level, 1.6);
    }

    level_def() {
        // 计算等级对应防御
        this.def_ = 5 + 2 * Math.pow(this.level, 1.1);
    }

    level_atk() {
        // 计算等级对应攻击力
        if (this.level <= 15) {
            this.atk = 10 + 5 * this.level + 2 * Math.pow(this.level, 1.3);
        } else {
            this.atk = 30 + 10 * this.level + 5 * Math.pow(this.level, 1.1);
        }
    }

    skill(other=1) {
        // 计算技能伤害
        return this.atk * 1.5 * other;
    }

    general(other=1) {
        // 计算一般攻击伤害
        return this.atk * 0.9 * other;
    }

    super_skill(other=1) {
        return this.atk * 2 * other;
    }
}

export class Fairy extends Character {
    constructor(env=null) {
        super(env);
        this.name = "Fairy";
        this.desc = "Ⅲ型总序式集成泛用人工智能";

        this.general_name = "嘴贱";
        this.general_desc = "造成90%的伤害";

        this.skill_name = "双倍耗电";
        this.skill_desc = "造成250%的伤害";

        this.super_skill_name = "三倍耗电";
        this.super_skill_desc = "造成500%的伤害";

        this.type = CharacterType.LiangZi;
    }
    general(other=1) {
        return this.atk * 0.9 * other;
    }

    skill(other=1) {
        return this.atk * 2.5 * other;
    }

    super_skill(other=1) {
        return this.atk * 5 * other;
    }
}

export class FanShiFu extends Character {
    constructor(env=null) {
        super(env)
        this.name = "范师傅"
    }
}

export class ShuiLiFang extends Character {
    constructor(env=null) {
        super(env)
        this.name = "水立方"
    }
}
export class ChenGe extends Character {
    constructor(env=null) {
        super(env)
        this.name = "辰哥"
    }
}

export class ZongTong extends Character {
    constructor(env=null) {
        super(env)
        this.name = "总统"
    }
}

export class HaoJing extends Character {
    constructor(env=null) {
        super(env)
        this.name = "昊京"
    }
}

export class XiaoNiao extends Character {
    constructor(env=null) {
        super(env)
        this.name = "小鸟"
    }
}

export class NiuYaoZi extends Character {
    constructor(env=null) {
        super(env)
        this.name = "牛尧资"
    }
}

export class DongYin extends Character {
    constructor(env=null) {
        super(env)
        this.name = "东银"
    }
}

export var characters = {
    "Fairy": Fairy,
    "FanShiFu": FanShiFu,
    "ShuiLiFang": ShuiLiFang,
    "ZongTong": ZongTong,
    "ChenGe": ChenGe,
    "HaoJing": HaoJing,
    "NiuYaoZi": NiuYaoZi,
    "DongYin":DongYin
}