import icon_left from "../assets/icon/left.svg";
import icon_character from "../assets/icon/character.svg";
import icon_info from "../assets/icon/info.svg";
import icon_backpack from "../assets/icon/backpack.svg";
import icon_setting from "../assets/icon/setting.svg";
import icon_door from "../assets/icon/door.svg";
import icon_tachometer from "../assets/icon/tachometer.svg";
import icon_element_fire from "../assets/icon/element-fire.png";
import icon_element_water from "../assets/icon/element-water.png";
import icon_element_thunder from "../assets/icon/element-thunder.png";
import icon_element_grass from "../assets/icon/element-grass.png";
import icon_element_physics from "../assets/icon/element-physics.png";
import icon_element_liangzi from "../assets/icon/element-liangzi.png";
import icon_element_nihility from "../assets/icon/element-nihility.png";

export const icons = {
    left: icon_left,
    character: icon_character,
    info: icon_info,
    backpack: icon_backpack,
    setting: icon_setting,
    door: icon_door,
    tachometer: icon_tachometer,
    element: {
        fire: icon_element_fire,
        water: icon_element_water,
        thunder: icon_element_thunder,
        grass: icon_element_grass,
        physics: icon_element_physics,
        liangzi: icon_element_liangzi,
        nihility: icon_element_nihility
    }
}

export function randomNum(minNum: number, maxNum?: number): number {
    // 检查 minNum 是否为正数
    if (minNum < 0) {
        throw new Error('minNum must be a non-negative number');
    }

    // 如果只传入一个参数，生成从 1 到 minNum 的随机数
    if (maxNum === undefined) {
        return Math.floor(Math.random() * minNum) + 1;
    }

    // 检查 maxNum 是否大于 minNum
    if (maxNum < minNum) {
        throw new Error('maxNum must be greater than or equal to minNum');
    }

    // 生成从 minNum 到 maxNum 的随机数
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}