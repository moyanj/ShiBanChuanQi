import { useDataStore, useSaveStore, useFightStore } from "./stores";
import { ElMessageBox } from 'element-plus'
import { ThingList } from "./things";
import { generateRandomRelic } from "./relic";
import { characters } from "./character";

function cmd_handler(value) {
    value = value.value;
    const dataStore = useDataStore();
    const saveStore = useSaveStore();
    const fightStore = useFightStore();

    let cmds: Array<string> = value.split(" ");
    let cmd: string = cmds[0];
    // 根据命令执行对应操作
    switch (cmd) {
        case "help":
            const helpMsg = `
            可用命令：
            - add_item [数量] [稀有度]: 添加随机圣遗物 (例: add_item 1 5)
            - add_char [名称]: 添加角色 (例: add_char FanShiFu)
            - add_thing [物品ID] [数量]: 添加物品 (例: add_thing XinHuo 1000)
            - add_exp [数量]: 添加经验值
            - add_money [数量]: 添加星火
            - set_level [等级]: 设置当前队伍首位角色的等级
            - reset: 重置所有数据
            - exit: 退出
            `;
            alert(helpMsg);
            break;

        case "add_item":
            let item_count = 1;
            let item_rarity = undefined;
            if (cmds[1]) item_count = parseInt(cmds[1]);
            if (cmds[2]) item_rarity = parseInt(cmds[2]);

            for (let i = 0; i < item_count; i++) {
                saveStore.relics.add(generateRandomRelic(item_rarity));
            }
            alert(`已添加 ${item_count} 个圣遗物${item_rarity ? ` (${item_rarity}★)` : ''}`);
            break;

        case "add_char":
            const charName = cmds[1];
            if (!charName) {
                alert("请输入角色内部名 (如 FanShiFu)");
                break;
            }
            if (characters[charName]) {
                const newChar = new characters[charName]();
                saveStore.characters.add(newChar);
                alert(`已添加角色: ${charName}`);
            } else {
                alert(`角色 ${charName} 不存在`);
            }
            break;

        case "add_exp":
            const expAmt = parseInt(cmds[1]) || 1000;
            saveStore.things.add(new (ThingList["EXP"] as any)(), expAmt);
            alert(`已添加 ${expAmt} 经验值`);
            break;

        case "add_money":
            const moneyAmt = parseInt(cmds[1]) || 1000;
            saveStore.things.add(new (ThingList["XinHuo"] as any)(), moneyAmt);
            alert(`已添加 ${moneyAmt} 星火`);
            break;

        case "set_level":
            const newLevel = parseInt(cmds[1]);
            if (!newLevel || newLevel < 1) {
                alert("请输入有效等级");
                break;
            }
            // 获取当前队伍的第一个角色 (假设在 Bag 或 Character 页面可以看到的那个)
            const allChars = saveStore.characters.get_all();
            if (allChars.length > 0) {
                // 修改第一个角色
                const targetChar = allChars[0]; // 这里可能需要更精确的目标选择，但控制台简便为主
                targetChar.level = newLevel;
                // 重新计算属性
                targetChar.level_hp();
                targetChar.level_atk();
                targetChar.level_def();
                targetChar.hp = targetChar.max_hp; // 回满血
                saveStore.characters.update(targetChar);
                alert(`角色 ${targetChar.name} 等级已设置为 ${newLevel}`);
            } else {
                alert("没有可用的角色");
            }
            break;

        case "set_data":
            // 修改数据存储中的数据
            dataStore.$patch({
                [cmds[1]]: cmds[2]
            });
            break;

        case "get_data":
            alert(dataStore[cmds[1]]);
            break;

        case "set_save":
            saveStore.$patch({
                [cmds[1]]: cmds[2]
            });
            break;

        case "get_save":
            alert(saveStore[cmds[1]]);
            break;

        case "add_thing":
            let thing = ThingList[cmds[1]];
            if (thing == undefined) {
                alert("物品不存在");
                break;
            }
            let count: number = 1;
            if (cmds[2]) {
                count = parseInt(cmds[2]);
            }

            saveStore.things.add(new thing(), count);
            break;

        case "exit":
            dataStore.console_show = false;
            window.close();
            break;

        case "reset":
            dataStore.$reset()
            saveStore.$reset();
            fightStore.$reset();
            break;

        case "devtool":
            window.openDevTools();
            break;
        case "get_save_json":
            const jsonStr = JSON.stringify(saveStore.$state, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "save_state.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            break;
        case "load_save_json":
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/json";
            input.onchange = (e: any) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = JSON.parse(event.target?.result as string);
                        saveStore.$patch(json);
                        alert("存档加载成功");
                    }
                    catch (error) {
                        alert("存档加载失败");
                    }
                    input.value = "";
                    this.show();
                    this.hide();
                };
                reader.readAsText(file);
            };
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
            break;
        default:
            // 当命令未知时提示用户
            alert("未知命令");
    }
}

export function console_handler() {

    const dataStore = useDataStore();

    // 显示控制台
    if (!dataStore.console_show) {
        dataStore.console_show = true;
        ElMessageBox.prompt('请输入命令', '控制台', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        }).then(cmd_handler).finally(() => {
            // 隐藏控制台
            dataStore.console_show = false;
        });
    }

}