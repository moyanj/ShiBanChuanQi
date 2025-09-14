<script lang="ts" setup>
import { watch, ref } from 'vue';
import { ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElSlider, ElTabs, ElTabPane } from 'element-plus';
import sbutton from '../components/sbutton.vue';
import { useSaveStore } from '../js/store';
import { ThingList } from '../js/things';
import { Item } from '../js/item';

const save = useSaveStore();
console.log(save);
var deleteDialog_show = ref(false);
var delete_args = ref({
    n: 1,
    arg: null
});
var activeTab = ref('things'); // 默认激活物品标签页

function update_data() {
    let data = [];
    const things = save.things.get_all();
    for (let id in things) {

        let thing = ThingList[id];
        if (!thing) {
            continue;
        }
        thing = new thing();
        let count = save.things.get(id);
        if (count == 0) {
            continue;
        }
        data.push({
            id: id,
            name: thing.name,
            desc: thing.desc,
            count: count,
        });

    }
    return data;
}

function update_items_data() {
    let data: Item[] = [];
    const items = save.items.getAll();
    items.forEach(item => {
        data.push(item);
    });
    return data;
}

function remove(data) {
    console.log(data.n);
    let id = data.arg.row.id;

    if (id) {
        save.things.remove(id, data.n);
    }
    data.n = 1;
    deleteDialog_show.value = false;
}

// 转换为el-table的格式
const table_data = ref(update_data());
const items_table_data = ref(update_items_data());

watch(save.things, () => {
    table_data.value = update_data();
});

watch(save.items, () => {
    items_table_data.value = update_items_data();
});

// 属性名称中文翻译映射
const attributeTranslations: { [key: string]: string } = {
    atk: '攻击力',
    def_: '防御力',
    speed: '速度',
    hp: '生命值',
};

</script>

<template>
    <h1 align="right">背包</h1>
    <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="物品" name="things">
            <el-table :data="table_data" class="table" empty-text="暂无物品">
                <el-table-column prop="name" label="物品名"></el-table-column>
                <el-table-column prop="desc" label="描述"></el-table-column>
                <el-table-column prop="count" label="数量"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <sbutton @click="delete_args.arg = scope; deleteDialog_show = true" text> 删除</sbutton>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="道具" name="items">
            <el-table :data="items_table_data" class="table" empty-text="暂无道具">
                <el-table-column prop="name" label="道具名"></el-table-column>
                <el-table-column label="属性">
                    <template #default="scope">
                        <span v-for="(value, key) in scope.row.random_attributes" :key="key">
                            {{ attributeTranslations[key] || key }}: {{ value > 0 ? '+' : '' }}{{ value }}<br>
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="deleteDialog_show" title="删除物品">
        <el-form>
            <el-form-item label="数量：">
                <el-slider v-model="delete_args.n" :min="1" :max="delete_args.arg.row.count" show-input />
            </el-form-item>
            <el-form-item>
                <sbutton type="primary" @click="remove(delete_args)">确定</sbutton>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<style scoped>
body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;

}
</style>