import mitt from 'mitt';
import { TeamCharacter } from './battle';

export type Events = {
    "battle:start";
    "battle:stop": "win" | "lose";
    "battle:need_player_action";
    "ui:active_character": TeamCharacter;
};

export const emitter = mitt<Events>();
