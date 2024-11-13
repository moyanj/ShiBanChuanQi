interface CharacterData {
    level: number;
    xp: number;
    hp: number;
    atk: number;
    def: number;
    attr_bonus: AttrBonusType;
}

interface AttrBonusType {
    [CharacterType.Fire]: number;
    [CharacterType.Grass]: number;
    [CharacterType.LiangZi]: number;
    [CharacterType.Nihility]: number;
    [CharacterType.Physics]: number;
    [CharacterType.Thunder]: number;
    [CharacterType.Water]: number;
}

interface CharacterDatas {
    [property: string]: CharacterData;
}

export enum CharacterType {
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

    get_now_character(): Character {
        var max: Character = this.my_characters[0]; // 默认为第一个

        // 找出我方和敌方中速度最快的
        for (let i = 0; i < this.enemy_characters.length + this.my_characters.length; i++) {
            if (i < this.my_characters.length) {
                if (this.my_characters[i].speed > max.speed) {
                    max = this.my_characters[i];
                }
            } else {
                if (this.enemy_characters[i - this.my_characters.length].speed > max.speed) {
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

    add(character: Character): null {
        if (this.characters[character.inside_name]) {
            // 已经存在
            return;
        }
        this.characters[character.inside_name] = character.dump();
    }

    remove(character_name: string): boolean {
        if (this.characters[character_name]) {
            delete this.characters[character_name];
            return true;
        }
        return false;
    }

    is_in(character_name: string): boolean {
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
        let c: Character = new character_class();
        return c.load(this.characters[character_name]);
    }

    get_all(): Array<Character> {
        let r: Array<Character> = [];
        for (let i in this.characters) {
            r.push(this.get(i));
        }
        return r;
    }
    update(c: Character) {
        if (!this.characters[c.inside_name]) {
            return null;
        }
        this.characters[c.inside_name] = c.dump();
    }
}


export abstract class Character {
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
    attr_bonus: AttrBonusType;
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

        this.attr_bonus = {
            [CharacterType.Fire]: 0.0,
            [CharacterType.Grass]: 0.0,
            [CharacterType.LiangZi]: 0.0,
            [CharacterType.Nihility]: 0.0,
            [CharacterType.Physics]: 0.0,
            [CharacterType.Thunder]: 0.0,
            [CharacterType.Water]: 0.0
        }

        this.env = env;
    }

    level_up(exp: number) {
        this.xp += exp;

        while (this.xp >= this.level_xp(this.level)) {
            this.xp -= this.level_xp(this.level);
            this.level += 1;
        }
        this.level_hp();
        this.level_def();
        this.level_atk();
    }

    level_xp(level): number {
        // 计算升级所需经验
        return 1 + Math.abs(102 * Math.pow(level, 1.28) + 114 * Math.log(level / 0.15)) + 350;
    }

    level_hp(): void {
        // 计算等级对应血量
        this.hp = 32.45 * this.level + Math.pow(this.level / 4, 2.863) + 650;
    }

    level_def(): void {
        // 计算等级对应防御
        this.def_ = 5 + 2 * Math.pow(this.level, 1.1);
    }

    level_atk(): void {
        // 计算等级对应攻击力
        this.atk = 1 + Math.abs(15.2 * Math.pow(this.level, 1.18) + 11.4 * this.level) + 350;

    }

    skill(other = 1): number {
        // 计算技能伤害
        return this.atk * 1.5 * other;
    }

    general(other: number = 1): number {
        // 计算一般攻击伤害
        return this.atk * 0.9 * other;
    }

    super_skill(other: number = 1): number {
        return this.atk * 2 * other;
    }

    dump(): CharacterData {
        return {
            level: this.level, // 等级
            xp: this.xp, // 经验
            hp: this.hp, // 血量
            atk: this.atk, // 攻击力
            def: this.def_, // 防御
            attr_bonus: this.attr_bonus // 属性加成
        }
    }

    load(data: CharacterData): Character {
        this.level = data.level;
        this.xp = data.xp;
        this.hp = data.hp;
        this.atk = data.atk;
        this.def_ = data.def;
        this.attr_bonus = data.attr_bonus;
        return this;
    }
}

export class Fairy extends Character {
    constructor(env = null) {
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
    general(other: number = 1): number {
        return this.atk * 0.9 * other;
    }

    skill(other: number = 1): number {
        return this.atk * 2.5 * other;
    }

    super_skill(other: number = 1): number {
        return this.atk * 5 * other;
    }
}

export class FanShiFu extends Character {
    constructor(env = null) {
        super(env)
        this.name = "范师傅";
        this.inside_name = "FanShiFu";
        this.type = CharacterType.Thunder;

        this.desc = "人生殊梦一场，大梦归离而已";

    }
}

export class ShuiLiFang extends Character {
    constructor(env = null) {
        super(env)
        this.name = "水立方";
        this.inside_name = "ShuiLiFang";
        this.type = CharacterType.Water;

        this.desc = "海的那边是自由"
    }
}
export class ChenGe extends Character {
    constructor(env = null) {
        super(env)
        this.name = "辰哥";
        this.inside_name = "ChenGe";
        this.type = CharacterType.Nihility;

        this.desc = '”做啊！继续做啊！“';
    }
}

export class ZongTong extends Character {
    constructor(env = null) {
        super(env)
        this.name = "总统";
        this.inside_name = "ZongTong";
        this.type = CharacterType.Fire;
    }
}

export class HaoJing extends Character {
    constructor(env = null) {
        super(env)
        this.name = "昊京";
        this.inside_name = "HaoJing";
        this.type = CharacterType.Grass
    }
}

export class NiuYaoZi extends Character {
    constructor(env = null) {
        super(env)
        this.name = "牛尧资";
        this.inside_name = "NiuYaoZi";
        this.type = CharacterType.Water;
    }
}

export class DongYin extends Character {
    constructor(env = null) {
        super(env)
        this.name = "东瀛";
        this.inside_name = "DongYin";
        this.type = CharacterType.LiangZi;
    }
}

export class FeiNiao extends Character {
    constructor(env = null) {
        super(env)
        this.name = "飞鸟";
        this.inside_name = "FeiNiao";
        this.type = CharacterType.Fire;
    }
}

export class ZhiLang extends Character {
    constructor(env = null) {
        super(env)
        this.name = "智郎";
        this.inside_name = "ZhiLang";
        this.type = CharacterType.Physics;
    }
}

export class ZhiYuan extends Character {
    constructor(env = null) {
        super(env)
        this.name = "致远";
        this.inside_name = "ZhiYuan";
        this.type = CharacterType.Physics;

        this.desc = "他曾深爱着的那颗星，不知为何，早已不在了";
    }
}

export class ZhaoLin extends Character {
    constructor(env = null) {
        super(env)
        this.name = "赵霖";
        this.inside_name = "ZhaoLin";
        this.type = CharacterType.Nihility;

        this.desc = "世上最后的小学生";
    }
}

export class JiMing extends Character {
    constructor(env = null) {
        super(env)
        this.name = "记铭";
        this.inside_name = "JiMing";
        this.type = CharacterType.Water;

        this.desc = "曾经那四光年的枪，却在今日变得毫无光泽"
    }
}

export class XuanGe extends Character {
    constructor(env = null) {
        super(env)
        this.name = "宣哥";
        this.inside_name = "XuanGe";
        this.type = CharacterType.Thunder;
    }
}

export class LaoDeng extends Character {
    constructor(env = null) {
        super(env)
        this.name = "老登";
        this.inside_name = "LaoDeng";
        this.type = CharacterType.Grass;

        this.desc = '“不能再做了，再做，就要坏掉了！”'
    }
}

export class JiBo extends Character {
    constructor(env = null) {
        super(env)
        this.name = "计博";
        this.inside_name = "JiBo";
        this.type = CharacterType.LiangZi;
    }
}

export class DongCheDi extends Character {
    constructor(env = null) {
        super(env)
        this.name = "懂车帝";
        this.inside_name = "DongCheDi";
        this.type = CharacterType.Physics;
        this.desc = "开车与开车，互不干扰";
    }
}

export class Fan extends Character {
    constructor(env = null) {
        super(env)
        this.name = "凡";
        this.inside_name = "Fan";
        this.type = CharacterType.Physics;
        this.desc = "我要回家。我要回家！我要回家鹿管！我要回家卓艾！"
    }
}

export class LiXi extends Character {
    constructor(env = null) {
        super(env)
        this.name = "李熙";
        this.inside_name = "LiXi";
        this.type = CharacterType.Fire;
        this.desc = '“勇敢飞吧，她会永远在你左右”';
    }
}

export class DiaoMin extends Character {
    constructor(env = null) {
        super(env)
        this.name = "刁民";
        this.inside_name = "DiaoMin";
        this.type = CharacterType.Fire;
    }
}

export class ZouJieTou extends Character {
    constructor(env = null) {
        super(env)
        this.name = "邹杰偷";
        this.inside_name = "ZouJieTou";
        this.type = CharacterType.Grass;
    }
}

export class WuYu extends Character {
    constructor(env = null) {
        super(env)
        this.name = "乌鱼";
        this.inside_name = "WuYu";
        this.type = CharacterType.Thunder;
    }
}

export class Song extends Character {
    constructor(env = null) {
        super(env)
        this.name = "松";
        this.inside_name = "Song";
        this.type = CharacterType.LiangZi;
    }
}

export class PeiBa extends Character {
    constructor(env = null) {
        super(env)
        this.name = "佩八";
        this.inside_name = "PeiBa";
        this.type = CharacterType.Fire;
    }
}

export class ChengXiang extends Character {
    constructor(env = null) {
        super(env)
        this.name = "丞相";
        this.inside_name = "ChengXiang";
        this.type = CharacterType.Nihility;
    }
}

export class YouDaYu extends Character {
    constructor(env = null) {
        super(env)
        this.name = "右大雨";
        this.inside_name = "YouDaYu";
        this.type = CharacterType.Water;
    }
}

export class XiaoQiao extends Character {
    constructor(env = null) {
        super(env)
        this.name = "小乔";
        this.inside_name = "ChengXiang";
        this.type = CharacterType.Thunder;
    }
}

export class PaoGe extends Character {
    constructor(env = null) {
        super(env)
        this.name = "炮哥";
        this.inside_name = "PaoGe";
        this.type = CharacterType.Fire;
    }
}

export class YQJ extends Character {
    constructor(env = null) {
        super(env)
        this.name = "YQJ";
        this.inside_name = "YQJ";
        this.type = CharacterType.Grass;
    }
}

export class NingNing extends Character {
    constructor(env = null) {
        super(env)
        this.name = "宁宁";
        this.inside_name = "NingNing";
        this.type = CharacterType.Nihility;
    }
}

export class XingXin extends Character {
    constructor(env = null) {
        super(env)
        this.name = "星鑫";
        this.inside_name = "XingXin";
        this.type = CharacterType.LiangZi;
    }
}

export class JiGao extends Character {
    constructor(env = null) {
        super(env)
        this.name = "积高";
        this.inside_name = "JiGao";
        this.type = CharacterType.Water;
    }
}

export class Xian extends Character {
    constructor(env = null) {
        super(env)
        this.name = "闲";
        this.inside_name = "Xian";
        this.type = CharacterType.Grass;
    }
}

export class Jin extends Character {
    constructor(env = null) {
        super(env)
        this.name = "锦";
        this.inside_name = "Jin";
        this.type = CharacterType.Water;
    }
}

export class WangYuan extends Character {
    constructor(env = null) {
        super(env)
        this.name = "王元";
        this.inside_name = "WangYuan";
        this.type = CharacterType.Nihility;
    }
}

export class RenJie extends Character {
    constructor(env = null) {
        super(env)
        this.name = "任杰";
        this.inside_name = "RenJie";
        this.type = CharacterType.Nihility;
    }
}

export class YanCui extends Character {
    constructor(env = null) {
        super(env)
        this.name = "颜粹";
        this.inside_name = "YanCui";
        this.type = CharacterType.Grass;
    }
}

export class NiuWenJin extends Character {
    constructor(env = null) {
        super(env)
        this.name = "牛文静";
        this.inside_name = "NiuWenJin";
        this.type = CharacterType.Thunder;
        this.desc = "不听该被遭哦！"
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
    "DongYin": DongYin,
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
    "PeiBa": PeiBa,
    "ChengXiang": ChengXiang,
    "YouDaYu": YouDaYu,
    "XiaoQiao": XiaoQiao,
    "PaoGe": PaoGe,
    "YQJ": YQJ,
    "NingNing": NingNing,
    "XingXin": XingXin,
    "JiGao": JiGao,
    "Xian": Xian,
    "Jin": Jin,
    "WangYuan": WangYuan,
    "RenJie": RenJie,
    "YanCui": YanCui,
    "NiuWenJin": NiuWenJin
}