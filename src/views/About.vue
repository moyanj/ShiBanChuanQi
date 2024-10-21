<script setup lang="ts">
    import { ElRow, ElCol } from 'element-plus'
    import { useDataStore, DataStoreState } from '../js/store';
    import { getExplore } from '../js/utils';
    const data: DataStoreState = useDataStore();
    

</script>

<template>
    <el-row>
        <el-col :span="12">
            <div class="grid-content container">
                <h1>十班传奇</h1>
                <br>
                <p v-if="data.is_electron">Electron版本：{{ data.build_info.electron_version }}</p>
                <p v-if="data.is_electron">编译时间：{{ data.build_info.time }}</p>
                <p> 浏览器版本：{{ getExplore() }}</p>

            </div>
        </el-col>
        <el-col :span="12">
            <div class="grid-content container">About</div>
        </el-col>
    </el-row>

</template>

<style lang="scss" scoped>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }
</style>