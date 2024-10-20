import icon_left from "../assets/icon/left.svg";
import icon_character from "../assets/icon/character.svg";
import icon_info from "../assets/icon/info.svg";
import icon_backpack from "../assets/icon/backpack.svg";
import icon_setting from "../assets/icon/setting.svg";
import icon_door from "../assets/icon/door.svg";
import icon_tachometer from "../assets/icon/tachometer.svg";

export const icons = {
    left: icon_left,
    character: icon_character,
    info: icon_info,
    backpack: icon_backpack,
    setting: icon_setting,
    door: icon_door,
    tachometer: icon_tachometer
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