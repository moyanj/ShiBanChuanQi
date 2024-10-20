<script setup>
    import { useDataStore, useSaveStore } from '../js/store'
    import { ElRow, ElCol, ElCard, ElAvatar, ElMessage, ElMessageBox, ElHeader, ElMain } from 'element-plus'

    const dataStore = useDataStore()
    const save = useSaveStore()

    function onclick_start() {
        dataStore.page_type = 'plot';
    }
    function onclick_setting() {
        dataStore.page_type = 'setting';
    }
    function change_name() {
        ElMessageBox.prompt('请输入新的用户名', '修改用户名', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: save.user_name
        }).then(({ value }) => {

            if (!value) {
                ElMessageBox.alert('用户名不能为空', '提示', {});
                return;
            }
            save.user_name = value;
            ElMessage.success('修改成功');
        })
    }

</script>

<template>

        <!-- 用户信息 -->
        <el-row justify="start" :gutter="10">
            <el-col :span="24">
                <el-card class="user-info">
                    <el-row :gutter="10">
                        <el-col :span="6">
                            <el-avatar :size="35"></el-avatar> <!-- 头像 -->
                        </el-col>
                        <el-col :span="18">
                            <span class="user-name" @click="change_name">{{ save.user_name }}</span><br>
                            <span class="user-level">Lv.{{ save.user_level }}</span>
                        </el-col>
                    </el-row>

                </el-card>
            </el-col>
        </el-row>

        <!-- 菜单 -->
        <el-row justify="center" :gutter="10">
            <el-col :span="20">
                <el-card class="grid-content plot" @click="onclick_start">
                    <h2>开始游戏</h2>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card class="grid-content plot" @click="onclick_setting">
                    <h2 align="center">设置</h2>
                </el-card>
            </el-col>
        </el-row>

        <!-- 其他 -->
        <el-row justify="center" :gutter="10">
            <el-col :span="6">

                <el-row class="grid-content">
                    <el-col :span="24">
                        <el-card class="plot">
                            <h2 align="center">角色</h2>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-card class="plot">
                            <h2 align="center">抽卡</h2>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-card class=" plot">
                            <h2 align="center">退出</h2>
                        </el-card>
                    </el-col>
                </el-row>

            </el-col>

            <el-col :span="18">
                <el-card class="line2 plot">
                    <h2 align="center">副本</h2>
                </el-card>
            </el-col>

        </el-row>

</template>

<style scoped, lang="scss">
    @import "../style/color.scss";

    .plot {
        background-color: $color-5;
    }

    .user-info {
        border-radius: var(--el-border-radius-round);
        width: 15vw;

        .el-card__body {
            padding: 7px;
        }
    }

    .user-level {
        font-size: 1rem;
        color: #A3A6AD;
    }

    el-avatar {
        size: 1vw;
    }

</style>