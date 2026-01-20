import { IBattle, Skill, SkillType } from "./battle/types";
import { BattleCharacters } from "./battle/participants";

export * from './character/base';
import { Character } from './character/base';

export type TeamSynergy = {
    id: string;
    condition: (characters: BattleCharacters) => boolean;
    effect: (characters: IBattle) => void;
}

export const teamSynergyConfig: TeamSynergy[] = [
    {
        id: 'FANSHIFU_ZONGTONG',
        condition: (chars: BattleCharacters) =>
            chars.characters["FanShiFu"] !== undefined &&
            chars.characters["ZongTong"] !== undefined,
        effect: (battleChars: IBattle) => {
            const zongTong = (battleChars.our as BattleCharacters).characters["ZongTong"];
            if (zongTong) {
                const speedBuff = {
                    id: 'synergy_fanshifu_zongtong',
                    name: '范师傅-总统协同',
                    type: 'buff' as const,
                    attribute: 'speed' as const,
                    value: zongTong.speed * 0.25,
                    duration: 9999,
                    source_skill_name: '范师傅-总统协同'
                };
                zongTong.apply_effect(speedBuff);
                battleChars.log(`范师傅与总统触发协同效果：总统速度提升25%！`);
            }
        }
    }
];

export class CharacterManager {
    characters: { [property: string]: Character };
    constructor() {
        this.characters = {};
    }

    add(character: Character): void {
        if (this.characters[character.inside_name]) {
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
        return this.characters[character_name] || null;
    }

    get_all(): Array<Character> {
        return Object.values(this.characters);
    }
    update(c: Character) {
        if (!this.characters[c.inside_name]) {
            return null;
        }
        this.characters[c.inside_name] = c;
    }
}

export { characters } from './characters';
