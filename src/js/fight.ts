import { Character } from "./character";
import { cloneDeep } from "lodash-es";

interface ATB {
    [property: string]: number;
}

interface Characters {
    [property: string]: Character;
}

export class BattleCharacters {
    characters: Characters;
    atb: ATB;

    constructor(characters: Character[]) {
        this.copy_chara(characters)
    }

    /*
    初始化我方和敌方角色对象
    */
    copy_chara(c: Character[]): void {
        for (let i = 0; i < c.length; i++) {
            let obj = cloneDeep(c[i]);
            obj.env = this;
            this.characters[obj.inside_name] = obj
        }
    }

    update_atb(tick: number) {
        for (let i in this.characters) {
            let c = this.characters[i];
            this.atb[c.inside_name] = c.speed * tick;
        }
    }

    reset_atb(): void {
        for (let i in this.characters) {
            this.atb[this.characters[i].inside_name] = 0;
        }
    }
}

export class Battle {
    // 敌方
    enemy: BattleCharacters;
    // 我方
    our: BattleCharacters;
    // 当前角色
    now_character: Character;
    // Tick
    tick: number;

    constructor(enemy: Character[], our: Character[]) {
        this.enemy = new BattleCharacters(enemy);
        this.our = new BattleCharacters(our);
        this.tick = 0;
        this.enemy.reset_atb();
        this.our.reset_atb();
    }

    update_atb() {
        this.enemy.update_atb(this.tick);
        this.our.update_atb(this.tick)
    }

    get_now() {
        // 初始化 atb 为一个空对象
        let atb: ATB = {};

        // 合并敌方和我方的 atb 数据
        for (let i in this.enemy.atb) {
            atb["e_" + i] = this.enemy.atb[i];
        }
        for (let i in this.our.atb) {
            atb["o_" + i] = this.our.atb[i];
        }

        // 初始化 max 变量
        let max = null;

        // 使用 Object.values() 获取所有 atb 的值进行遍历
        for (let s of Object.values(atb)) {
            if (s >= 100) {
                max = s;
                break; // 找到第一个符合条件的元素就跳出循环
            }
        }

        // 返回最大值或 null（如果没有找到符合条件的值）
        return max;
    }

    trun() {}

}