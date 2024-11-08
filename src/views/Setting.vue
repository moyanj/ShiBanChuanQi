<script setup lang="ts">
    import { ElScrollbar,ElMessageBox,ElMessage } from 'element-plus';
    import { useSaveStore, useDataStore } from '../js/store';
    import sbutton from '../components/sbutton.vue'
    import settingItem from '../components/setting-item.vue'

    function reset() {
        ElMessageBox.confirm("确定删除吗？", {
            type: "warning"
        }).then(() => {
            useSaveStore().$reset();
            useDataStore().$reset();
            ElMessage.success("删除成功")
        })
        
    }
</script>

<template>
    <h1 align="right">设置</h1>

    <el-scrollbar class="content">
        <settingItem label="云存档">
            <sbutton type="primary">上传数据</sbutton>
            <sbutton type="primary">加载数据</sbutton>
            <p style="font-size:11px;">由Sqlpub和Render提供支持</p>
        </settingItem>

        <settingItem label="危险操作">
            <sbutton type="danger" @click="reset">重置全部游戏数据</sbutton>
        </settingItem>

    </el-scrollbar>

</template>

<style scoped lang="scss">
    .content {
        height: 100vh;
        width: 100vw;
        padding-left: 10px;
        padding-right: 10px;
    }

</style>