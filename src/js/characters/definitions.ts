import { Character, CharacterType } from "./base";
import { Skill, SkillType } from "../battle";

export class Fairy extends Character {
    constructor() {
        super();
        this.name = "Fairy";
        this.inside_name = "Fairy";
        this.desc = "Ⅲ型总序式集成泛用人工智能";

        this.general_name = "嘴贱";
        this.general_desc = "造成100%的伤害";

        this.skill_name = "双倍耗电";
        this.skill_desc = "造成220%的伤害";

        this.super_skill_name = "三倍耗电";
        this.super_skill_desc = "造成450%的伤害";

        this.type = CharacterType.LiangZi;
    }
    general(): number {
        return this.atk * 1.0;
    }

    skill(): number {
        return this.atk * 2.2;
    }

    super_skill(): number {
        return this.atk * 4.5;
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
        this.general_desc = "造成自身攻击力100%的伤害";
        this.skill_name = "幻灭之境";
        this.skill_desc = "消耗自身20%的生命值，对敌方造成200%的伤害";
        this.super_skill_name = "恶咒归梦";
        this.super_skill_desc = "消耗自身75%生命，对敌方造成350%的伤害";
    }

    general(): number {
        return this.atk * 1.0;
    }

    skill(): number {
        this.hp -= this.max_hp * 0.2;
        if (this.hp < 0) {
            this.hp = 0;
        }
        return this.atk * 2.0;
    }

    super_skill(): number {
        this.hp -= this.max_hp * 0.75;
        if (this.hp < 0) {
            this.hp = 0;
        }
        return this.atk * 3.5;
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
        this.general_desc = "造成自身10%生命值+50%攻击力的伤害";
        this.skill_name = "潮汐冲击";
        this.skill_desc = "造成自身15%生命值+120%攻击力的伤害";
        this.super_skill_name = "海神领域";
        this.super_skill_desc = "对敌方造成320%伤害，并为我方所有角色水属性攻击加成提高20%";
    }

    general(): number {
        return this.hp * 0.1 + this.atk * 0.5;
    }

    skill(): number {
        return this.hp * 0.15 + this.atk * 1.2;
    }

    super_skill(): number {
        // 大招除了造成伤害，还需要为我方所有角色水属性攻击加成提高20%
        if (this.env) {
            for (const chara_name in this.env.our.characters) {
                const chara = this.env.our.characters[chara_name];
                if (chara.is_our) { // 只对我方角色生效
                    chara.attr_bonus[CharacterType.Water] += 0.2;
                }
            }
        }
        return this.atk * 3.2;
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
        this.general_desc = "造成100%的伤害，并增加一个“光环”,最多12个光环"

        this.skill_name = "融核"
        this.skill_desc = "造成120%的伤害，并为我方全体增加3%乘以光环数量的攻击力，并消耗一个光环"

        this.super_skill_name = "超核"
        this.super_skill_desc = "消耗全部光环，造成380%的伤害，并为全队增加3%的攻击力"

        this.halo_count = 0; // 初始化光环数量
    }

    general(): number {
        const damage = this.atk * 1.0;
        if (this.halo_count < 12) {
            this.halo_count++;
        }
        return damage;
    }

    skill(): number {
        const damage = this.atk * 1.2;
        if (this.env && this.halo_count > 0) {
            const atk_bonus_value = 0.03 * this.halo_count;
            for (const chara_name in this.env.our.characters) {
                const chara = this.env.our.characters[chara_name];
                if (chara.is_our) {
                    chara.apply_effect({
                        id: `skill_${this.skill_name}_${chara.inside_name}`,
                        name: this.skill_name,
                        type: 'buff',
                        attribute: 'atk',
                        value: chara.atk * atk_bonus_value,
                        duration: 1,
                        source_skill_name: this.skill_name
                    });
                }
            }
            this.halo_count--;
        }
        return damage;
    }

    super_skill(): number {
        this.halo_count = 0;
        const damage = this.atk * 3.8;
        if (this.env) {
            for (const chara_name in this.env.our.characters) {
                const chara = this.env.our.characters[chara_name];
                if (chara.is_our) {
                    chara.apply_effect({
                        id: `superskill_${this.super_skill_name}_${chara.inside_name}`,
                        name: this.super_skill_name,
                        type: 'buff',
                        attribute: 'atk',
                        value: chara.atk * 0.03,
                        duration: 1,
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
            for (const chara_name in this.env.our.characters) {
                const chara = this.env.our.characters[chara_name];
                if (chara.is_our) { // 只对我方角色生效
                    chara.apply_effect({
                        id: `superskill_${this.super_skill_name}_${chara.inside_name}`,
                        name: this.super_skill_name,
                        type: 'buff',
                        attribute: 'speed',
                        value: chara.speed * 0.2,
                        duration: 3,
                        source_skill_name: this.super_skill_name
                    });
                }
            }
        }

        // 3. 自身防御力降低10%，持续三个回合
        this.apply_effect({
            id: `superskill_debuff_${this.super_skill_name}`,
            name: this.super_skill_name,
            type: 'debuff',
            attribute: 'def_',
            value: this.def_ * 0.1,
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
        this.general_desc = "对敌方单体造成自身生命值10%+自身攻击力60%的伤害"

        this.skill_name = "华润怡宝"
        this.skill_desc = "消耗15%的生命值，对己方生命值最低的回复45%攻击力的生命值"

        this.super_skill_name = "百岁山"
        this.super_skill_desc = "回复己方生命值最低的角色30%的生命值，并额外回复10%自身攻击力的生命值"
    }

    general(): number {
        return this.hp * 0.1 + this.atk * 0.6;
    }

    skill(): number {
        this.hp -= this.max_hp * 0.15;
        if (this.hp < 0) {
            this.hp = 0;
        }

        if (this.env) {
            let lowest_hp_chara: Character | null = null;
            let min_hp = Infinity;

            for (const chara_name in this.env.our.characters) {
                const chara = this.env.our.characters[chara_name];
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
        return 0;
    }

    super_skill(): number {
        if (this.env) {
            let lowest_hp_chara: Character | null = null;
            let min_hp = Infinity;

            for (const chara_name in this.env.our.characters) {
                const chara = this.env.our.characters[chara_name];
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
        return 0;
    }

    // 重写技能对象方法，使其技能可以作用于己方
    getSkill(): Skill {
        return {
            name: this.skill_name,
            type: SkillType.Heal,
            value: this.skill(), // 这个值实际上不会被直接使用，因为治疗量在skill()方法中已经计算
            cost: 1,
            targetScope: 'all_allies', // 作用于所有己方角色
            description: this.skill_desc,
        };
    }

    getSuperSkill(): Skill {
        return {
            name: this.super_skill_name,
            type: SkillType.Heal,
            value: this.super_skill(), // 这个值实际上不会被直接使用，因为治疗量在super_skill()方法中已经计算
            cost: 3,
            targetScope: 'all_allies', // 作用于所有己方角色
            description: this.super_skill_desc,
        };
    }
}

export class Song extends Character {
    pine_nut_count: number; // 新增：松子数量

    constructor() {
        super()
        this.name = "松";
        this.inside_name = "Song";
        this.type = CharacterType.LiangZi;

        this.general_desc = "造成自身生命值12%+40%攻击力的伤害"

        this.skill_desc = "增加一颗松子，无视对方50%的防御力，造成180%攻击力的伤害"

        this.super_skill_desc = "增加一颗松子，造成250%攻击力的伤害，若攒至3颗，则消耗三颗松子，造成500%的伤害"

        this.pine_nut_count = 0; // 初始化松子数量
    }

    general(): number {
        return this.hp * 0.12 + this.atk * 0.4;
    }

    skill(): number {
        this.pine_nut_count++;
        return this.atk * 1.8;
    }

    super_skill(): number {
        this.pine_nut_count++;

        if (this.pine_nut_count >= 3) {
            this.pine_nut_count -= 3;
            return this.atk * 5.0;
        } else {
            return this.atk * 2.5;
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
        this.inside_name = "XiaoQiao";
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
