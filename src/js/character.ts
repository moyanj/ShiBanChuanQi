import { Battle, BattleCharacters, Skill, SkillType } from "./fight";
import { Item } from "./tools";

interface CharacterData {
    level: number;
    xp: number;
    hp: number;
    atk: number;
    def: number;
    attr_bonus: AttrBonusType;
    favorability: number;
    active_effects: ActiveEffect[];
    equipped_items: Item[]; // 新增：已装备的道具
}

export interface ActiveEffect {
    type: 'buff' | 'debuff';
    attribute: 'atk' | 'def_' | 'speed' | 'hp';
    value: number;
    duration: number; // in turns
    source_skill_name: string;
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
    [property: string]: Character;
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

export class CharacterManager {
    characters: CharacterDatas;
    constructor() {
        this.characters = {};
    }

    add(character: Character): void {
        if (this.characters[character.inside_name]) {
            // 已经存在
            return;
        }
        this.characters[character.inside_name] = character;
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
        return this.characters[character_name];
    }

    get_all(): Array<Character> {
        let r: Array<Character> = [];
        for (let i in this.characters) {
            r.push(this.characters[i]);
        }
        return r;
    }
    update(c: Character) {
        if (!this.characters[c.inside_name]) {
            return null;
        }
        this.characters[c.inside_name] = c;
    }
}


export abstract class Character {
    name: string;
    inside_name: string;
    desc: string;
    is_our: boolean; // 新增：是否是我方角色

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
    max_hp: number; // 新增：最大血量
    atk: number;
    def_: number;
    speed: number;
    favorability: number; // 新增：好感度
    attr_bonus: AttrBonusType;
    env: BattleCharacters | null; // 角色所在的战斗环境
    active_effects: ActiveEffect[]; // 新增：当前生效的增益/减益效果
    equipped_items: Item[]; // 新增：装备的道具

    constructor() {
        this.name = "Test"; // 角色名
        this.inside_name = "Test";
        this.desc = "这是一个测试角色";
        this.is_our = false; // 默认为敌方角色

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
        this.max_hp = 100; // 初始最大血量
        this.atk = 10; // 攻击力
        this.def_ = 10; // 防御
        this.speed = 10; // 速度
        this.favorability = 0; // 初始好感度

        this.attr_bonus = {
            [CharacterType.Fire]: 0.0,
            [CharacterType.Grass]: 0.0,
            [CharacterType.LiangZi]: 0.0,
            [CharacterType.Nihility]: 0.0,
            [CharacterType.Physics]: 0.0,
            [CharacterType.Thunder]: 0.0,
            [CharacterType.Water]: 0.0
        }
        this.active_effects = []; // 初始化空数组
        this.equipped_items = []; // 初始化空数组

        this.level_hp();
        this.level_def();
        this.level_atk();
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

        if (this.env) { // 如果在战斗环境中，更新队伍总血量
            this.env.update_team_hp();
        }
    }

    level_xp(level: number): number {
        // 计算升级所需经验
        return 1 + Math.abs(102 * Math.pow(level, 1.28) + 114 * Math.log(level / 0.15)) + 350;
    }

    level_hp(): void {
        // 计算等级对应血量
        const new_max_hp = 460.45 * this.level + Math.pow(this.level, 1.863) + 650 + 13.4 * this.level;
        const hp_diff = new_max_hp - this.max_hp; // 最大血量增加量
        this.max_hp = new_max_hp;
        this.hp += hp_diff; // 当前血量也等比例增加，或直接设置为max_hp
    }

    level_def(): void {
        // 计算等级对应防御
        this.def_ = 1 + Math.abs(13.2 * Math.pow(this.level, 1.04) + 5.678 * this.level) + 55;
    }

    level_atk(): void {
        // 计算等级对应攻击力
        this.atk = 1 + Math.abs(15.2 * Math.pow(this.level, 1.18) + 11.4 * this.level) + 350;
    }

    skill(): number {
        // 计算技能伤害
        return this.atk * 1.5;
    }

    general(): number {
        // 计算一般攻击伤害
        return this.atk * 0.9;
    }

    super_skill(): number {
        return this.atk * 2;
    }

    dump(): CharacterData {
        return {
            level: this.level, // 等级
            xp: this.xp, // 经验
            hp: this.hp, // 血量
            atk: this.atk, // 攻击力
            def: this.def_, // 防御
            attr_bonus: this.attr_bonus, // 属性加成
            favorability: this.favorability, // 好感度
            active_effects: this.active_effects, // 活跃效果
            equipped_items: this.equipped_items
        }
    }

    load(data: CharacterData): Character {
        this.level = data.level;
        this.xp = data.xp;
        this.hp = data.hp;
        this.atk = data.atk;
        this.def_ = data.def;
        this.attr_bonus = data.attr_bonus;
        this.favorability = data.favorability; // 加载好感度
        this.active_effects = data.active_effects || []; // 加载活跃效果，如果不存在则为空数组
        this.level_hp();
        this.level_def();
        this.level_atk();
        return this;
    }

    reset_status() {
        this.level_hp();
        this.level_def();
        this.level_atk();
    }

    // 应用效果
    apply_effect(effect: ActiveEffect): void {
        this.active_effects.push(effect);
    }

    // 移除效果
    remove_effect(effect_name: string): void {
        this.active_effects = this.active_effects.filter(effect => effect.source_skill_name !== effect_name);
    }

    // 更新所有效果的持续时间
    update_effects(): void {
        this.active_effects = this.active_effects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
    }

    // 获取修改后的属性值
    get_modified_stat(stat: 'atk' | 'def_' | 'speed' | 'hp'): number {
        let value = this[stat];

        // 应用活跃效果
        for (const effect of this.active_effects) {
            if (effect.attribute === stat) {
                if (effect.type === 'buff') {
                    value += effect.value;
                } else {
                    value -= effect.value;
                }
            }
        }

        // 应用装备道具的随机属性
        for (const item of this.equipped_items) {
            if (item.random_attributes[stat] !== undefined) {
                value += item.random_attributes[stat]!;
            }
        }

        return Math.max(0, value); // 属性值不能低于0
    }

    // 获取普通攻击技能对象
    // 获取普通攻击技能对象
    getGeneralSkill(): Skill {
        return {
            name: this.general_name,
            type: SkillType.Damage,
            value: this.general(),
            cost: 0, // 普通攻击不消耗战技点
            targetScope: 'single',
            description: this.general_desc,
        };
    }

    // 获取技能对象
    getSkill(): Skill {
        return {
            name: this.skill_name,
            type: SkillType.Damage,
            value: this.skill(),
            cost: 1, // 技能消耗1点战技点
            targetScope: 'single',
            description: this.skill_desc,
        };
    }

    // 获取大招技能对象
    getSuperSkill(): Skill {
        return {
            name: this.super_skill_name,
            type: SkillType.Damage,
            value: this.super_skill(),
            cost: 3, // 大招消耗3点战技点
            targetScope: 'single',
            description: this.super_skill_desc,
        };
    }
}

export class Fairy extends Character {
    constructor() {
        super();
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
    general(): number {
        return this.atk * 0.9;
    }

    skill(): number {
        return this.atk * 2.5;
    }

    super_skill(): number {
        return this.atk * 5;
    }
}

export class FanShiFu extends Character {
    constructor() {
        super()
        this.name = "范师傅";
        this.inside_name = "FanShiFu";
        this.type = CharacterType.Thunder;

        this.desc = "人生殊梦一场，大梦归离而已";
        this.general_name = "控梦";
        this.general_desc = "造成自身攻击力90%的伤害";
        this.skill_name = "幻灭之境";
        this.skill_desc = "消耗自身20%的生命值，对敌方造成150%的伤害";
        this.super_skill_name = "恶咒归梦";
        this.super_skill_desc = "消耗自身75%生命，对敌方造成257%的伤害";
    }

    general(): number {
        return this.atk * 0.9;
    }

    skill(): number {
        // 消耗自身20%的生命值
        this.hp -= this.max_hp * 0.2;
        if (this.hp < 0) {
            this.hp = 0;
        }
        // 对敌方造成150%的伤害
        return this.atk * 1.5;
    }

    super_skill(): number {
        // 消耗自身75%生命
        this.hp -= this.max_hp * 0.75;
        if (this.hp < 0) {
            this.hp = 0;
        }
        // 对敌方造成257%的伤害
        return this.atk * 2.57;
    }
}

export class ShuiLiFang extends Character {
    constructor() {
        super()
        this.name = "水立方";
        this.inside_name = "ShuiLiFang";
        this.type = CharacterType.Water;

        this.desc = "海的那边是自由";
        this.general_name = "水之波动";
        this.general_desc = "造成自身30%生命值+30%攻击力的伤害";
        this.skill_name = "潮汐冲击";
        this.skill_desc = "造成自身20%生命值+70%攻击力的伤害";
        this.super_skill_name = "海神领域";
        this.super_skill_desc = "对敌方造成230%伤害，并为我方所有角色水属性攻击加成提高20%";
    }

    general(): number {
        return this.hp * 0.3 + this.atk * 0.3;
    }

    skill(): number {
        return this.hp * 0.2 + this.atk * 0.7;
    }

    super_skill(): number {
        // 大招除了造成伤害，还需要为我方所有角色水属性攻击加成提高20%
        if (this.env) {
            for (const chara_name in this.env.characters) {
                const chara = this.env.characters[chara_name];
                if (chara.is_our) { // 只对我方角色生效
                    chara.attr_bonus[CharacterType.Water] += 0.2;
                }
            }
        }
        return this.atk * 2.3;
    }
}
export class ChenGe extends Character {
    halo_count: number; // 新增：光环数量

    constructor() {
        super()
        this.name = "辰哥";
        this.inside_name = "ChenGe";
        this.type = CharacterType.Nihility;

        this.desc = '”做啊！继续做啊！“';
        
        this.general_name = "虚核"
        this.general_desc = "造成85%的伤害，并增加一个“光环”,最多12个光环"

        this.skill_name = "融核"
        this.skill_desc = "造成60%的伤害，并为我方全体增加3%乘以光环数量的攻击力，并消耗一个光环"

        this.super_skill_name = "超核"
        this.super_skill_desc = "消耗全部光环，造成190%的伤害，并为全队增加3%的攻击力"

        this.halo_count = 0; // 初始化光环数量
    }

    general(): number {
        // 造成85%的伤害
        const damage = this.atk * 0.85;
        // 增加一个“光环”,最多12个光环
        if (this.halo_count < 12) {
            this.halo_count++;
        }
        return damage;
    }

    skill(): number {
        // 造成60%的伤害
        const damage = this.atk * 0.6;
        // 为我方全体增加3%乘以光环数量的攻击力，并消耗一个光环
        if (this.env && this.halo_count > 0) {
            const atk_bonus_value = 0.03 * this.halo_count; // 3%乘以光环数量
            for (const chara_name in this.env.characters) {
                const chara = this.env.characters[chara_name];
                if (chara.is_our) { // 只对我方角色生效
                    chara.apply_effect({
                        type: 'buff',
                        attribute: 'atk',
                        value: chara.atk * atk_bonus_value,
                        duration: 1, // 持续1回合，或者根据实际需求调整
                        source_skill_name: this.skill_name
                    });
                }
            }
            this.halo_count--; // 消耗一个光环
        }
        return damage;
    }

    super_skill(): number {
        // 消耗全部光环
        this.halo_count = 0;
        // 造成190%的伤害
        const damage = this.atk * 1.9;
        // 为全队增加3%的攻击力
        if (this.env) {
            for (const chara_name in this.env.characters) {
                const chara = this.env.characters[chara_name];
                if (chara.is_our) { // 只对我方角色生效
                    chara.apply_effect({
                        type: 'buff',
                        attribute: 'atk',
                        value: chara.atk * 0.03, // 增加3%攻击力
                        duration: 1, // 持续1回合，或者根据实际需求调整
                        source_skill_name: this.super_skill_name
                    });
                }
            }
        }
        return damage;
    }
}

export class ZongTong extends Character {
    constructor() {
        super()
        this.name = "总统";
        this.inside_name = "ZongTong";
        this.type = CharacterType.Fire;

        this.desc = "惹我奥Nigger,c你不带套"

        this.super_skill_name = "采棉花了"
        this.super_skill_desc = "损失15%生命值，全体速度提高20%，自身防御力降低10%，持续三个回合"
    }

    super_skill(): number {
        // 1. 损失15%生命值
        this.hp -= this.max_hp * 0.15;
        if (this.hp < 0) {
            this.hp = 0;
        }

        // 2. 全体速度提高20%，持续三个回合
        if (this.env) {
            for (const chara_name in this.env.characters) {
                const chara = this.env.characters[chara_name];
                if (chara.is_our) { // 只对我方角色生效
                    chara.apply_effect({
                        type: 'buff',
                        attribute: 'speed',
                        value: chara.speed * 0.2, // 提高20%速度
                        duration: 3,
                        source_skill_name: this.super_skill_name
                    });
                }
            }
        }

        // 3. 自身防御力降低10%，持续三个回合
        this.apply_effect({
            type: 'debuff',
            attribute: 'def_',
            value: this.def_ * 0.1, // 降低10%防御
            duration: 3,
            source_skill_name: this.super_skill_name
        });

        // 大招不造成直接伤害，返回0
        return 0;
    }
}

export class HaoJing extends Character {
    constructor() {
        super()
        this.name = "昊京";
        this.inside_name = "HaoJing";
        this.type = CharacterType.Grass

        this.desc = "熊一般的男人"
    }
}

export class NiuYaoZi extends Character {
    constructor() {
        super()
        this.name = "牛尧资";
        this.inside_name = "NiuYaoZi";
        this.type = CharacterType.Water;

        this.desc = "52647"
    }
}

export class DongYin extends Character {
    firefly_count: number;

    constructor() {
        super()
        this.name = "东瀛";
        this.inside_name = "DongYin";
        this.type = CharacterType.LiangZi;

        this.general_name = "虚空震荡"
        this.general_desc = "对敌方全体共造成200%的伤害，由敌方全体平均分担，消耗自身3%生命值"

        this.skill_name = "萤火之光"
        this.skill_desc = "为己方指定单体恢复15%的生命值，若溢出则转化为萤火"

        this.super_skill_name = "飞萤扑火"
        this.super_skill_desc = "为全队恢复自身生命值上限20%的生命值。此后，在每个角色行动前，将恢复其自身生命值上限的10%，并消耗对应数量的萤火，此效果持续至萤火不足以支付消耗。"

        this.firefly_count = 0; // 初始化萤火数量
    }
}

export class FeiNiao extends Character {
    constructor() {
        super()
        this.name = "飞鸟";
        this.inside_name = "FeiNiao";
        this.type = CharacterType.Fire;
        this.desc = "The old man and sea."

        this.general_name = "铳击"
    }
}

export class ZhiLang extends Character {
    constructor() {
        super()
        this.name = "智郎";
        this.inside_name = "ZhiLang";
        this.type = CharacterType.Physics;
    }
}

export class ZhiYuan extends Character {
    constructor() {
        super()
        this.name = "致远";
        this.inside_name = "ZhiYuan";
        this.type = CharacterType.Physics;

        this.desc = "他曾深爱着的那颗星，不知为何，早已不在了";
    }
}

export class ZhaoLin extends Character {
    constructor() {
        super()
        this.name = "赵霖";
        this.inside_name = "ZhaoLin";
        this.type = CharacterType.Nihility;

        this.desc = "世上最后的小学生";
    }
}

export class JiMing extends Character {
    constructor() {
        super()
        this.name = "记铭";
        this.inside_name = "JiMing";
        this.type = CharacterType.Water;

        this.desc = "曾经那四光年的枪，却在今日变得毫无光泽"

        this.super_skill_name = "强吊冲击"
        this.super_skill_desc = "对敌方全体造成321%的伤害，随后1个回合，自身攻击力降低40%"
    }
}

export class XuanGe extends Character {
    constructor() {
        super()
        this.name = "宣哥";
        this.inside_name = "XuanGe";
        this.type = CharacterType.Thunder;
    }
}

export class LaoDeng extends Character {
    constructor() {
        super()
        this.name = "老登";
        this.inside_name = "LaoDeng";
        this.type = CharacterType.Grass;

        this.desc = '“不能再做了，再做，就要坏掉了！”'
    }
}

export class JiBo extends Character {
    constructor() {
        super()
        this.name = "计博";
        this.inside_name = "JiBo";
        this.type = CharacterType.LiangZi;
    }
}

export class DongCheDi extends Character {
    constructor() {
        super()
        this.name = "懂车帝";
        this.inside_name = "DongCheDi";
        this.type = CharacterType.Physics;
        this.desc = "开车与开车，互不干扰";
    }
}

export class Fan extends Character {
    constructor() {
        super()
        this.name = "凡";
        this.inside_name = "Fan";
        this.type = CharacterType.Physics;
        this.desc = "我要回家。我要回家！我要回家鹿管！我要回家卓艾！"
    }
}

export class LiXi extends Character {
    constructor() {
        super()
        this.name = "李熙";
        this.inside_name = "LiXi";
        this.type = CharacterType.Fire;
        this.desc = '“勇敢飞吧，她会永远在你左右”';
    }
}

export class DiaoMin extends Character {
    constructor() {
        super()
        this.name = "刁民";
        this.inside_name = "DiaoMin";
        this.type = CharacterType.Fire;
    }
}

export class ZouJieTou extends Character {
    constructor() {
        super()
        this.name = "邹杰偷";
        this.inside_name = "ZouJieTou";
        this.type = CharacterType.Grass;
    }
}

export class WuYu extends Character {
    constructor() {
        super()
        this.name = "乌鱼";
        this.inside_name = "WuYu";
        this.type = CharacterType.Thunder;

        this.general_name = "农夫山泉"
        this.general_desc = "对敌方单体造成自生生命值40%+自身攻击力20%的伤害"

        this.skill_name = "华润怡宝"
        this.skill_desc = "消耗15%的生命值，对己方生命值最低的回复45%攻击力的生命值"

        this.super_skill_name = "百岁山"
        this.super_skill_desc = "回复己方生命值最低的角色30%的生命值，并额外回复10%自身攻击力的"
    }

    general(): number {
        return this.hp * 0.4 + this.atk * 0.2;
    }

    skill(): number {
        // 消耗15%的生命值
        this.hp -= this.max_hp * 0.15;
        if (this.hp < 0) {
            this.hp = 0;
        }

        // 对己方生命值最低的回复45%攻击力的生命值
        if (this.env) {
            let lowest_hp_chara: Character | null = null;
            let min_hp = Infinity;

            for (const chara_name in this.env.characters) {
                const chara = this.env.characters[chara_name];
                if (chara.is_our && chara.hp < min_hp) {
                    min_hp = chara.hp;
                    lowest_hp_chara = chara;
                }
            }

            if (lowest_hp_chara) {
                lowest_hp_chara.hp += this.atk * 0.45;
                if (lowest_hp_chara.hp > lowest_hp_chara.max_hp) {
                    lowest_hp_chara.hp = lowest_hp_chara.max_hp;
                }
            }
        }
        return 0; // 技能不造成直接伤害
    }

    super_skill(): number {
        // 回复己方生命值最低的角色30%的生命值，并额外回复10%自身攻击力的生命值
        if (this.env) {
            let lowest_hp_chara: Character | null = null;
            let min_hp = Infinity;

            for (const chara_name in this.env.characters) {
                const chara = this.env.characters[chara_name];
                if (chara.is_our && chara.hp < min_hp) {
                    min_hp = chara.hp;
                    lowest_hp_chara = chara;
                }
            }

            if (lowest_hp_chara) {
                lowest_hp_chara.hp += lowest_hp_chara.max_hp * 0.3 + this.atk * 0.1;
                if (lowest_hp_chara.hp > lowest_hp_chara.max_hp) {
                    lowest_hp_chara.hp = lowest_hp_chara.max_hp;
                }
            }
        }
        return 0; // 大招不造成直接伤害
    }
}

export class Song extends Character {
    pine_nut_count: number; // 新增：松子数量

    constructor() {
        super()
        this.name = "松";
        this.inside_name = "Song";
        this.type = CharacterType.LiangZi;

        this.general_desc = "造成等同于自身生命值40%的伤害"

        this.skill_desc = "增加一颗松子，无视对方50%的防御力，造成85%攻击力的伤害"

        this.super_skill_desc = "在其之前增加一颗松子，造成100%攻击力的伤害，若攒至3颗，则消耗三颗松子，造成250%的伤害"

        this.pine_nut_count = 0; // 初始化松子数量
    }

    general(): number {
        // 造成等同于自身生命值40%的伤害
        return this.hp * 0.4;
    }

    skill(): number {
        // 增加一颗松子
        this.pine_nut_count++;
        // 无视对方50%的防御力，造成85%攻击力的伤害
        // 注意：这里只是计算伤害值，实际的防御力减免逻辑需要在战斗系统中处理
        return this.atk * 0.85;
    }

    super_skill(): number {
        // 在其之前增加一颗松子
        this.pine_nut_count++;

        if (this.pine_nut_count >= 3) {
            // 消耗三颗松子
            this.pine_nut_count -= 3;
            // 造成250%的伤害
            return this.atk * 2.5;
        } else {
            // 造成100%攻击力的伤害
            return this.atk * 1;
        }
    }
}

export class PeiBa extends Character {
    constructor() {
        super()
        this.name = "佩八";
        this.inside_name = "PeiBa";
        this.type = CharacterType.Fire;

        this.general_name = "啊？"

        this.skill_name = "就在看一会儿"

        this.super_skill_name = "我这有啥好说的"
    }


}

export class ChengXiang extends Character {
    constructor() {
        super()
        this.name = "丞相";
        this.inside_name = "ChengXiang";
        this.type = CharacterType.Nihility;
    }
}

export class YouDaYu extends Character {
    constructor() {
        super()
        this.name = "右大雨";
        this.inside_name = "YouDaYu";
        this.type = CharacterType.Water;
    }
}

export class XiaoQiao extends Character {
    constructor() {
        super()
        this.name = "小乔";
        this.inside_name = "ChengXiang";
        this.type = CharacterType.Thunder;
    }
}

export class PaoGe extends Character {
    constructor() {
        super()
        this.name = "炮哥";
        this.inside_name = "PaoGe";
        this.type = CharacterType.Fire;
    }
}

export class YQJ extends Character {
    constructor() {
        super()
        this.name = "YQJ";
        this.inside_name = "YQJ";
        this.type = CharacterType.Grass;
    }
}

export class NingNing extends Character {
    constructor() {
        super()
        this.name = "宁宁";
        this.inside_name = "NingNing";
        this.type = CharacterType.Nihility;
    }
}

export class XingXin extends Character {
    constructor() {
        super()
        this.name = "星鑫";
        this.inside_name = "XingXin";
        this.type = CharacterType.LiangZi;
    }
}

export class JiGao extends Character {
    constructor() {
        super()
        this.name = "积高";
        this.inside_name = "JiGao";
        this.type = CharacterType.Water;
    }
}

export class Xian extends Character {
    constructor() {
        super()
        this.name = "闲";
        this.inside_name = "Xian";
        this.type = CharacterType.Grass;
    }
}

export class Jin extends Character {
    constructor() {
        super()
        this.name = "锦";
        this.inside_name = "Jin";
        this.type = CharacterType.Water;
    }
}

export class WangYuan extends Character {
    constructor() {
        super()
        this.name = "王元";
        this.inside_name = "WangYuan";
        this.type = CharacterType.Nihility;
    }
}

export class RenJie extends Character {
    constructor() {
        super()
        this.name = "任杰";
        this.inside_name = "RenJie";
        this.type = CharacterType.Nihility;
    }
}

export class YanCui extends Character {
    constructor() {
        super()
        this.name = "颜粹";
        this.inside_name = "YanCui";
        this.type = CharacterType.Grass;
    }
}

export class NiuWenJin extends Character {
    constructor() {
        super()
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