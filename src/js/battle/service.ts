import { useFightStore, useSaveStore, useDataStore, APM } from '../stores';
import { Battle } from './engine';
import { battleController } from './controller';
import { Character, characters, get_character_by_dump } from '../character';
import { rng } from '../utils';
import { ElMessage } from 'element-plus';
import { ThingList } from '../things';
import { generateRandomRelic, Relic } from '../relic';

export interface BattleResult {
    win: boolean;
    exp: number;
    xinhuo: number;
    relics: Relic[];
}

export class BattleService {
    private interval: number | null = null;

    public onSettlement?: (result: BattleResult) => void;

    constructor(
        private fightStore = useFightStore(),
        private save = useSaveStore(),
        private data = useDataStore()
    ) { }

    async startBattle() {
        if (this.fightStore.selected_characters.length !== 3) {
            ElMessage.error("请选择三名角色开始战斗！");
            return;
        }

        // 初始化我方角色实例
        this.fightStore.our = this.fightStore.selected_characters.map(c => {
            const charInstance = get_character_by_dump(c);
            charInstance.hp = charInstance.max_hp;
            charInstance.is_our = true;
            charInstance.equipped_relics = [...c.equipped_relics];
            return charInstance;
        });

        // 生成敌方角色
        this.generateEnemyCharacters();

        // 创建战斗实例
        const battle = new Battle(
            this.fightStore.enemy as Character[],
            this.fightStore.our as Character[]
        );
        this.fightStore.battle_instance = battle;
        this.fightStore.battle_instance.ai_mode = this.fightStore.ai;
        battleController.init(battle);

        this.setupAudio();
        this.runLoop();
    }

    private setupAudio() {
        APM.stop("background_music");
        if (!("battle_music" in APM.objs)) {
            APM.add("battle_music", 'audio/background/battle.mp3', { loop: true, volume: 0.5 });
        }
        APM.play("battle_music");
    }

    private isProcessing = false;

    private runLoop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(async () => {
            if (this.isProcessing) return;
            const battle = this.fightStore.battle_instance;
            if (!battle) return;

            const nowChar = battle.get_now_character();
            const needsDelay = nowChar && (nowChar.type === 'enemy' || battle.ai_mode);

            this.isProcessing = true;

            if (needsDelay) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            const isEnded = await battle.next_turn();

            if (needsDelay && !isEnded) {
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            if (isEnded) {
                this.stopLoop();
                this.handleSettlement();
            }
            this.isProcessing = false;
        }, 100) as unknown as number;
    }

    stopLoop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private handleSettlement() {
        const battle = this.fightStore.battle_instance;
        if (!battle) return;

        APM.stop("battle_music");
        APM.play("background_music");

        const isWin = battle.enemy.hp <= 0;
        const result = {
            win: isWin,
            exp: 0,
            xinhuo: 0,
            relics: [] as Relic[]
        };

        if (isWin) {
            this.playAudio("battle_win", 'audio/battle_win.mp3');
            result.exp = this.fightStore.enemy.reduce((sum, char) => sum + Math.round(char.level_xp(char.level) / 5), 0);
            result.xinhuo = rng.randint(175, 840);

            // 下放奖励
            this.save.things.add(new (ThingList["EXP"] as any)(), result.exp);
            this.save.things.add(new (ThingList["XinHuo"] as any)(), result.xinhuo);
            this.fightStore.our.forEach(char => {
                const saveChar = this.save.characters.get(char.inside_name);
                if (saveChar) saveChar.favorability += 5;
            });

            // 掉落圣遗物
            const numRelics = rng.randint(1, 5);
            for (let i = 0; i < numRelics; i++) {
                const relic = generateRandomRelic();
                this.save.relics.add(relic);
                result.relics.push(relic);
            }
        } else {
            this.playAudio("battle_lose", 'audio/battle_lose.mp3');
            result.exp = this.fightStore.enemy.reduce((sum, char) => sum + Math.round(char.level_xp(char.level) / 7), 0);
            this.save.things.add(new (ThingList["EXP"] as any)(), result.exp);
        }

        // 重置状态
        this.fightStore.our.forEach(char => {
            get_character_by_dump(char).reset_status();
        });

        this.onSettlement?.(result);
    }

    private playAudio(id: string, path: string) {
        if (!(id in APM.objs)) {
            APM.add(id, path);
        }
        APM.play(id);
    }

    private generateEnemyCharacters() {
        const ourAvgLevel = this.fightStore.our.reduce((sum, char) => sum + char.level, 0) / this.fightStore.our.length;
        const allGameCharacters = Object.values(characters).map(C => new (C as any)());

        this.fightStore.enemy = [];
        for (let i = 0; i < 3; i++) {
            const template = allGameCharacters[rng.randint(0, allGameCharacters.length - 1)];
            const enemy = this.createWeakerEnemy(template);
            enemy.level = Math.max(1, Math.floor(ourAvgLevel) + rng.randint(-2, 1));
            enemy.level_hp();
            enemy.level_atk();
            enemy.level_def();
            enemy.hp = enemy.max_hp;
            this.fightStore.enemy.push(enemy);
        }
    }

    private createWeakerEnemy(baseCharacter: Character): Character {
        const weakerEnemy = get_character_by_dump(baseCharacter);
        weakerEnemy.level = Math.max(1, baseCharacter.level - rng.randint(-5, 3));
        weakerEnemy.level_hp();
        weakerEnemy.level_atk();
        weakerEnemy.level_def();
        weakerEnemy.hp = weakerEnemy.max_hp;
        weakerEnemy.name = `[敌]${baseCharacter.name}`;
        return weakerEnemy;
    }
}
