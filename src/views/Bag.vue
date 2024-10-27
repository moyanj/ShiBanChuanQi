<script lang="ts" setup>
    import { watch, ref } from 'vue';
    import { ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElSlider } from 'element-plus';
    import sbutton from '../components/sbutton.vue';
    import { useSaveStore, SaveStoreState } from '../js/store';
    import { ThingList } from '../js/things';

    const save: SaveStoreState = useSaveStore();
    var deleteDialog_show = ref(false);
    var delete_args = ref({
        n: 1,
        max: 1,
        arg: null
    });

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

    function remove(data) {
        console.log(data.n);
        let id = data.arg.row.id;

        if (id) {
            save.things.remove(id, data.n);
        }
        data.n = 1;
        deleteDialog_show.value = false
    }

    // 转换为el-table的格式
    const table_data = ref(update_data());
    
    watch(save.things, () => {
        table_data.value = update_data();
    });

</script>

<template>
    <el-table :data="table_data" max-width="800px" class="table" empty-text="暂无物品">
        <el-table-column prop="name" label="物品名" width="100px"></el-table-column>
        <el-table-column prop="desc" label="描述"></el-table-column>
        <el-table-column prop="count" label="数量"></el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <sbutton @click="delete_args.arg = scope;deleteDialog_show = true" text> 删除</sbutton>
            </template>
        </el-table-column>
    </el-table>

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

<style scoped lang="scss">
    body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;

    }

    .table {
        margin-top: 10vh;
    }


</style>