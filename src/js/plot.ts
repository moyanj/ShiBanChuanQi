import template from "lodash-es/template";
import { useDataStore,useSaveStore } from "./store";

// 剧情数据类
interface StoryData{
    role?: string; // 角色名
    content?: string | null; // 内容
    actions?: Array<StoryAction>;
}

interface StoryAction{
    type: string;
    args?: Array<string>;
}

export class Story{
    data: Array<StoryData|null> = [];
    raw: string;
    data_store = useDataStore();
    save_store = useSaveStore();

    constructor(text: string){
        this.raw = text;
        this.parser();    
    }
    public parser(){
        let lines = this.raw.split("\n");

        for(let line of lines){
            line = line.trim();
            if(line.length == 0) continue;
            if(line[0] == "#") continue;
            let line_list:Array<string> = line.split(" ");
            if (line_list[0] == "chat") {
                this.data.push(this.parser_chat(line_list));
            } else if (line_list[0] == "action") {
                this.data.push(this.parser_action(line_list));
            }
        }
    }
    private parser_chat(line: Array<string>): StoryData{
        let content_func = template(line.slice(2).join(" "), {
            interpolate: /{{([\s\S]+?)}}/g, // 语法：{{}}
            evaluate: /<%([\s\S]+?)%>/g, // 语法：<% %>
        });
        let content = content_func({
            "data": this.data_store,
            "save": this.save_store
        });
        return {
            content: content,
            role: line[1],
            actions: []
        }
    }

    private parser_action(line: Array<string>): StoryData{
        return {
            actions: [{
                type: line[1],
                args: line.slice(2)
            }]
        }
    }
}

