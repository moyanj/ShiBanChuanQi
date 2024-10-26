import { Character } from "./character_info";

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

export class CharacterManager {
    characters: Array<Character>;
    constructor() {
        this.characters = []
    }

    add(character: Character) {
        var name = Object.getPrototypeOf(character).constructor.name;
        // 判断是否重复
        for (let i = 0; i < this.characters.length; i++) {
            let now_name = this.characters[i].inside_name;
            
            console.log(name, )
            if (name == now_name) {
                return
            }
        }
        this.characters.push(character)
    }

    remove(character_name: string) {
        
        for (let i = 0; i < this.characters.length; i++) {
            if (this.characters[i].inside_name == character_name) {
                this.characters.splice(i, 1)
                return
            }
        }
    }

    is_in(character_name: string) {
        for (let i = 0; i < this.characters.length; i++) {

            if (this.characters[i].inside_name == character_name) {
                return true
            }
        }
        return false
    }
}
var a = {"user_name":"玩家","user_level":1,"user_avatar":"avatars/8.png","things":{"things":{"XinHuo":179863560}},"n_wish":6,"characters":{"characters":[]},"wish_number":1390}

