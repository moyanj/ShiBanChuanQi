import template from "lodash-es/template";
import { useDataStore, useSaveStore } from "./store";
import sha256 from "crypto-js/sha256"
import { ref } from "vue";
import type { Ref } from "vue";

// 剧情数据类
interface StoryData {
    role?: string; // 角色名
    content?: string | null; // 内容
    actions?: StoryAction;
}

interface StoryAction {
    func: Function;
    args?: Array<string>;
}

interface StoryMap {
    [key: string]: StoryData;
}

const actions = {
    "setbg": (env) => {
        console.log("setbg");
    },
    "playcg": (env) => {
        console.log("playcg");
    },
    "fight": (env) => {
        console.log("fight");
    }
}

export class Story {
    data: StoryMap = {};
    list: Array<string> = [];
    raw: string;
    data_store = useDataStore();
    save_store = useSaveStore();

    constructor(text: string) {
        this.raw = text;
        this.parser();
    }
    public parser() {
        let lines = this.raw.split("\n");
        let n = 1;
        for (let line of lines) {
            line = line.trim();
            if (line.length == 0) continue;
            if (line[0] == "#") continue;

            let line_list: Array<string> = line.split(" ");
            if (line_list[0] == "chat") {
                let ret = this.parser_chat(line_list);
                let id = sha256(line + n).toString().slice(0, 8);
                this.list.push(id);
                this.data[id] = ret;

            } else if (line_list[0] == "action") {
                let ret = this.parser_action(line_list);
                let id = sha256(line + n).toString().slice(0, 8);
                this.list.push(id);
                this.data[id] = ret;
            }
            n += 1;
        }
    }
    private parser_chat(line: Array<string>): StoryData {
        let content_func = template(line.slice(2).join(" "), {
            interpolate: /{{([\s\S]+?)}}/g, // 语法：{{}}
            evaluate: /<%([\s\S]+?)%>/g, // 语法：<% %>
        });
        let content = content_func({
            "data": this.data_store,
            "save": this.save_store,
            "story": this,
            "time": new Date(),
        });
        return {
            content: content,
            role: line[1],
        }
    }

    private parser_action(line: Array<string>): StoryData {
        let type = line[1];
        let args = line.slice(2);
        let func = actions[type];
        return {
            actions: {
                func: func,
                args: args
            }
        }
    }
}

export class StoryManager {

    story: Story;
    current_id: string;
    current_data: Ref<StoryData | null>;
    n: number;
    data_store = useDataStore();
    save_store = useSaveStore();


    constructor(story: Story) {
        this.story = story;
        this.current_data = ref(null);

        this.n = -1;
        // 获取第一条
        this.next()

    }

    next() {
        this.n += 1;
        this.current_id = this.story.list[this.n];
        this.save_store.story_index = this.current_id;
        this.current_data.value = this.story.data[this.current_id];
        return this.story.data[this.current_id];
    }

    get_current() {
        return this.story.data[this.current_id];
    }

    get_next() {
        return this.story.data[this.story.list[this.n + 1]];
    }

    set_current(id: string) {
        this.n = this.story.list.indexOf(id);
        this.current_id = id;
        this.save_store.story_index = this.current_id;
        this.current_data.value = this.story.data[id];
    }

    set_story(story: Story) {
        this.story = story;
        this.n = -1;
        this.next();
    }

}

export function load(name: string): Story {
    let save_store = useSaveStore();
    save_store.story_section = name;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "story/" + name + ".txt", false);
    xhr.overrideMimeType("text/plain; charset=utf-8");
    xhr.send();
    return new Story(xhr.responseText);
}

