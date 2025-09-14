import { emitter } from "./event";
import { Character } from "../character";
import { useBattleStore } from "../store";

const battleStore = useBattleStore();

export type TeamCharacter = {
    team: 'player' | 'enemy';
    character: Character;
};

export class BattleTeam {
    characters: Map<string, Character>;
    atbValues: Map<string, number>;
    teamType: 'player' | 'enemy';

    constructor(teamType: 'player' | 'enemy', initialCharacters: Character[] = []) {
        this.characters = new Map();
        this.atbValues = new Map();
        this.teamType = teamType;

        initialCharacters.forEach((character) => {
            this.add_character(character);
        });
    }

    add_character(character: Character): void {
        this.characters.set(character.inside_name, character);
        this.atbValues.set(character.inside_name, 0);
    }

    reset_atb(character_name: string): void {
        this.atbValues.set(character_name, 0);
    }

    update_atb(tick_amount: number = 1): void {
        this.characters.forEach((character, character_name) => {
            const current_atb = this.atbValues.get(character_name) || 0;
            const new_atb = current_atb + character.speed * tick_amount;
            this.atbValues.set(character_name, new_atb);
        });
    }

    get_alive_characters(): Character[] {
        return Array.from(this.characters.values()).filter((character) => character.hp > 0);
    }

    get_ready_character(): { character: Character; atb: number }[] {
        const ready: { character: Character; atb: number }[] = [];

        this.characters.forEach((char, id) => {
        const atb = this.atbValues.get(id) || 0;
        if (char.hp > 0 && atb >= 100) {
            ready.push({ character: char, atb });
        }
        });

        // 按速度排序（ATB高优先级高）
        return ready.sort((a, b) => b.atb - a.atb);
    }
}

export class BattleEngine {
    player: BattleTeam;
    enemy: BattleTeam;
    is_running: boolean;
    animationFrameId: null | number;
    tick: number;

    constructor(player: Character[],enemy: Character[]) {
        this.player = new BattleTeam('player', player);
        this.enemy = new BattleTeam('enemy', enemy);
        this.is_running = false;
        this.tick = 0;
    }

    public start(): void {
        this.is_running = true;

        emitter.emit("battle:start"); // 触发战斗开始事件

        this.loop();
    }

    loop(): void {
        if (!this.is_running) {
            this.stop();
            return;
        }
        // 有角色行动中时暂停处理
        if (battleStore.is_play_turn && battleStore.is_waiting_player) {
            emitter.emit("battle:need_player_action");
            this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
            return;
        }
        // 获取可行动角色
        const activeCharacter = this.getActiveCharacter();

        if (activeCharacter) {
            // 处理角色行动
            this.handleCharacterTurn(activeCharacter);
        } else {
            // 没有可行动角色时更新ATB
            this.updateAtb(1); // 固定增量为1
        }
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    public stop(): void {
        this.is_running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        emitter.emit("battle:stop");
    }

    handleCharacterTurn(character: TeamCharacter): void {
        emitter.emit("ui:active_character", character);

        if (character.team == "player") {
            battleStore.is_play_turn = true;
        }

        // 如果当前没有选定角色，或者选定的不是当前行动角色，则更新选定角色
        if (!battleStore.selected_character) {
            battleStore.is_waiting_player = false;
        }
    }

    getActiveCharacter(): TeamCharacter | null {
        const playerReady = this.player.get_ready_character();
        const enemyReady = this.enemy.get_ready_character();

        // 合并所有准备就绪的角色
        const allReady = [...playerReady, ...enemyReady];

        if (allReady.length === 0) return null;

        // 优化排序逻辑：先按ATB降序，ATB相同按速度降序
        allReady.sort((a, b) => {
            return b.atb - a.atb || b.character.speed - a.character.speed;
        });

        const active = allReady[0];
        const team = active.character.env.teamType;

        return {
            character: active.character,
            team: team
        };
    }

    updateAtb(tick_amount: number = 1): void {
        // 仅存活角色更新ATB
        this.player.get_alive_characters().forEach(char => {
            const current = this.player.atbValues.get(char.inside_name) || 0;
            this.player.atbValues.set(char.inside_name, current + char.speed * tick_amount);
        });

        this.enemy.get_alive_characters().forEach(char => {
            const current = this.enemy.atbValues.get(char.inside_name) || 0;
            this.enemy.atbValues.set(char.inside_name, current + char.speed * tick_amount);
        });

        this.tick += tick_amount;
    }
}