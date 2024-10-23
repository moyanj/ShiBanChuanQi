<script lang="ts" setup>
    import { watch, ref } from 'vue';
    import { ElTable, ElCard, ElTableColumn } from 'element-plus';
    import { useSaveStore, SaveStoreState } from '../js/store';
    import { ThingList } from '../js/things';
    const save: SaveStoreState = useSaveStore();

    function update_data() {
        let data = [];
        const things = save.things.get_all();
        for (let id in things) {

            let thing = ThingList[id];
            thing = new thing();
            data.push({
                name: thing.name,
                desc: thing.desc,
                count: save.things.get(id),
            });

        }
        console.log(data);
        return data;
    }

    // 转换为el-table的格式
    const table_data = ref(update_data());


</script>

<template>
    <el-table :data="table_data" max-width="800px" class="table">
        <el-table-column prop="name" label="物品名" width="100px"></el-table-column>
        <el-table-column prop="desc" label="描述"></el-table-column>
        <el-table-column prop="count" label="数量"></el-table-column>
    </el-table>
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