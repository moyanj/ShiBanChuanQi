import { useDataStore, useSaveStore } from "./store";
import { ElMessageBox } from 'element-plus'
import { ThingList } from "./things";
import { SaveServer } from "./utils";

function cmd_handler(value) {
    value = value.value;
    const dataStore = useDataStore();
    const saveStore = useSaveStore();

    let cmds:Array<string> = value.split(" ");
    let cmd:string = cmds[0];
    // 根据命令执行对应操作
    switch (cmd) {
        case "help":
            // 显示帮助信息
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
            break;

        case "devtool":
            window.openDevTools();
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