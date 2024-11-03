import { ref, Ref } from "vue";

interface CharacterData {
    level: number;
    xp: number;
    hp: number;
    atk: number;
    def: number;
}

interface CharacterDatas {
    [property: string]: CharacterData;
}

export enum CharacterType  {
    Fire = "火", // 火
    Water = "水", // 水
    Thunder = "雷", // 雷
    Grass = "草", // 草
    LiangZi = "量子", // 量子
    Nihility = "虚无", // 虚无
    Physics = "物理", // 物理
}

export class FightEnv {
    // 敌方角色数组
    enemy_characters: Array<Character> = [];
    // 我方角色数组
    my_characters: Array<Character> = [];
    // 敌方角色当前角色
    now_character: Character;
    
    constructor(enemy: Array<Character>, my: Array<Character>) {
        this.enemy_characters = enemy;
        this.my_characters = my;
        this.now_character = this.get_now_character();
    }

    get_now_character() {
        var max:Character = this.my_characters[0]; // 默认为第一个

        // 找出我方和敌方中速度最快的
        for(let i = 0; i < this.enemy_characters.length + this.my_characters.length; i++) {
            if(i < this.my_characters.length) {
                if(this.my_characters[i].speed > max.speed) {
                    max = this.my_characters[i];
                }
            } else {
                if(this.enemy_characters[i - this.my_characters.length].speed > max.speed) {
                    max = this.enemy_characters[i - this.my_characters.length];
                }
            }
        }
        return max;
    }
}

export class CharacterManager {
    characters: CharacterDatas;
    constructor() {
        this.characters = {};
    }

    add(character: Character) {
        if (this.characters[character.inside_name]) {
            // 已经存在
            return;
        }
        this.characters[character.inside_name] = character.dump();
    }

    remove(character_name: string) {
        if (this.characters[character_name]) {
            delete this.characters[character_name];
            return true;
        }
        return false;
    }

    is_in(character_name: string) {
        console.log(this.characters);
        return this.characters[character_name] !== undefined;
    }

    get(character_name: string): Character | null {
        if (!this.characters[character_name]) {
            return null;
        }
        let character_class = characters[character_name];
        
        if (character_class === null) {
            return null;
        }
        let c = new character_class();
        return c.load(this.characters[character_name]);
    }

    get_all(): Array<Character> {
        let r = [];
        console.log(this.characters);
        for (let i in this.characters) {
            r.push(this.get(i));
        }
        return r;
    }
}


export class Character {
    name: string;
    inside_name: string;
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
        this.inside_name = "Test";
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

    dump(): CharacterData {
        return {
            level: this.level, // 等级
            xp: this.xp, // 经验
            hp: this.hp, // 血量
            atk: this.atk, // 攻击力
            def: this.def_, // 防御
        }
    }

    load(data: CharacterData): Character {
        this.level = data.level;
        this.xp = data.xp;
        this.hp = data.hp;
        this.atk = data.atk;
        this.def_ = data.def;

        return this;
    }
}

export class Fairy extends Character {
    constructor(env=null) {
        super(env);
        this.name = "Fairy";
        this.inside_name = "Fairy";
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
        this.name = "范师傅";
        this.inside_name = "FanShiFu";
        this.type = CharacterType.Thunder;
    }
}

export class ShuiLiFang extends Character {
    constructor(env=null) {
        super(env)
        this.name = "水立方";
        this.inside_name = "ShuiLiFang";
        this.type = CharacterType.Water;
    }
}
export class ChenGe extends Character {
    constructor(env=null) {
        super(env)
        this.name = "辰哥";
        this.inside_name = "ChenGe";
        this.type = CharacterType.Nihility;
    }
}

export class ZongTong extends Character {
    constructor(env=null) {
        super(env)
        this.name = "总统";
        this.inside_name = "ZongTong";
        this.type = CharacterType.Fire;
    }
}

export class HaoJing extends Character {
    constructor(env=null) {
        super(env)
        this.name = "昊京";
        this.inside_name = "HaoJing";
        this.type = CharacterType.Grass
    }
}

export class NiuYaoZi extends Character {
    constructor(env=null) {
        super(env)
        this.name = "牛尧资";
        this.inside_name = "NiuYaoZi";
        this.type = CharacterType.Water;
    }
}

export class DongYin extends Character {
    constructor(env=null) {
        super(env)
        this.name = "东瀛";
        this.inside_name = "DongYin";
        this.type = CharacterType.LiangZi;
    }
}

export class FeiNiao extends Character {
    constructor(env=null) {
        super(env)
        this.name = "飞鸟";
        this.inside_name = "FeiNiao";
        this.type = CharacterType.Fire;
    }
}

export class ZhiLang extends Character {
    constructor(env=null) {
        super(env)
        this.name = "智郎";
        this.inside_name = "ZhiLang";
        this.type = CharacterType.Physics;
    }
}

export class ZhiYuan extends Character {
    constructor(env=null) {
        super(env)
        this.name = "致远";
        this.inside_name = "ZhiYuan";
        this.type = CharacterType.Physics;
    }
}

export class ZhaoLin extends Character {
    constructor(env=null) {
        super(env)
        this.name = "赵霖";
        this.inside_name = "ZhaoLin";
        this.type = CharacterType.Nihility;
    }
}

export class JiMing extends Character {
    constructor(env=null) {
        super(env)
        this.name = "记铭";
        this.inside_name = "JiMing";
        this.type = CharacterType.Water;
    }
}

export class XuanGe extends Character {
    constructor(env=null) {
        super(env)
        this.name = "宣哥";
        this.inside_name = "XuanGe";
    }
}

export class LaoDeng extends Character {
    constructor(env=null) {
        super(env)
        this.name = "老登";
        this.inside_name = "LaoDeng";
        this.type = CharacterType.Grass;
    }
}

export class JiBo extends Character {
    constructor(env=null) {
        super(env)
        this.name = "计博";
        this.inside_name = "JiBo";
        this.type = CharacterType.LiangZi;
    }
}

export class DongCheDi extends Character {
    constructor(env=null) {
        super(env)
        this.name = "懂车帝";
        this.inside_name = "DongCheDi";
    }
}

export class Fan extends Character {
    constructor(env=null) {
        super(env)
        this.name = "凡";
        this.inside_name = "Fan";
        this.type = CharacterType.Physics;
        this.desc = "我要回家。我要回家！我要回家鹿管"
    }
}

export class LiXi extends Character {
    constructor(env=null) {
        super(env)
        this.name = "李熙";
        this.inside_name = "LiXi";
        this.type = CharacterType.Fire;
    }
}

export class DiaoMin extends Character {
    constructor(env=null) {
        super(env)
        this.name = "刁民";
        this.inside_name = "DiaoMin";
    }
}

export class ZouJieTou extends Character {
    constructor(env=null) {
        super(env)
        this.name = "邹杰偷";
        this.inside_name = "ZouJieTou";
    }
}

export class WuYu extends Character {
    constructor(env=null) {
        super(env)
        this.name = "乌鱼";
        this.inside_name = "WuYu";
    }
}

export class Song extends Character {
    constructor(env=null) {
        super(env)
        this.name = "松";
        this.inside_name = "Song";
        this.type = CharacterType.LiangZi;
    }
}

export class PeiBa extends Character {
    constructor(env=null) {
        super(env)
        this.name = "佩八";
        this.inside_name = "PeiBa";
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
    "DongYin":DongYin,
    "FeiNiao": FeiNiao,
    "ZhiLang": ZhiLang,
    "ZhaoLin": ZhaoLin,
    "ZhiYuan": ZhiYuan,
    "JiMing": JiMing,
    "XuanGe": XuanGe,
    "LaoDeng": LaoDeng,
    "JiBo": JiBo,
    "DongCheDi": DongCheDi,
    "Fan": Fan,
    "LiXi": LiXi,
    "DiaoMin": DiaoMin,
    "ZouJieTou": ZouJieTou,
    "WuYu": WuYu,
    "Song": Song,
    "PeiBa": PeiBa
}