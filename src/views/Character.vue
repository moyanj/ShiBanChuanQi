<script setup lang="ts">
    import { ElCard, ElRow, ElCol, ElScrollbar } from 'element-plus';
    
</script>

<template>
    <el-row>
        <el-col :span="3">
            <el-scrollbar style="" class="menu">
                <el-card class="item">1</el-card>
            </el-scrollbar>
        </el-col>
        <div class="verticalBar"></div>
        <el-col :span="21">
            <el-button type="primary">Primary</el-button>
        </el-col>
    </el-row>

</template>

<style scoped lang="scss">
    .menu {
        height: 100vh;
        width: 100%;
    }
    .verticalBar {
        width: 1px;
        height: 95vh;
        background: #a9a9a9;
        display: inline-block;
        margin-left: 5px;
        margin-right: 5px;
    }
    .item {
        margin-right: 10px;
        background-color: #26272b;
    }

</style>