import { Character } from "./character_info";

export enum CharacterType  {
    Fire, // 火
    Water, // 水
    Thunder, // 雷
    Grass, // 草
    LiangZi, // 量子
    Nihility, // 虚无
    Physics // 物理
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
        this.now_character = this.get_now_character()
    }

    get_now_character() {
        var max:Character = this.my_characters[0] // 默认为第一个

        // 找出我方和敌方中速度最快的
        for(let i = 0; i < this.enemy_characters.length + this.my_characters.length; i++) {
            if(i < this.my_characters.length) {
                if(this.my_characters[i].speed > max.speed) {
                    max = this.my_characters[i]
                }
            } else {
                if(this.enemy_characters[i - this.my_characters.length].speed > max.speed) {
                    max = this.enemy_characters[i - this.my_characters.length]
                }
            }
        }
        return max
    }
}