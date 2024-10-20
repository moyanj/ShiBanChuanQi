<script setup lang="ts">
    import { ref } from 'vue'
    import { ElCol, ElRow, ElCard, ElAvatar, ElMessageBox, ElMessage, ElButton, ElImage } from 'element-plus'
    import { useSaveStore, SaveStoreState, useDataStore } from '../js/store'
    import { randomNum, icons } from '../js/utils'

    const save: SaveStoreState = useSaveStore()
    const data = useDataStore()
    const isHover = ref(false)

    if (save.user_avatar === "") {
        save.user_avatar = `avatars/${randomNum(1, 10)}.png`
    }

    function get_avatar() {
        save.user_avatar = `avatars/${randomNum(1, 10)}.png`
    }

    function change_name() {
        ElMessageBox.prompt('请输入新的用户名', '修改用户名', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: save.user_name,
        }).then(({ value }) => {
            if (!value) {
                ElMessageBox.alert('用户名不能为空', '提示', {})
                return
            }
            save.user_name = value
            ElMessage.success('修改成功')
        })
    }

    const handleMouseEnter = () => {
        isHover.value = true
    }

    const handleMouseLeave = () => {
        isHover.value = false
    }

    const onclick_start = () => {
        data.page_type = 'plot'
    }
</script>

<template>
    <div class="container">
        <h1 id="title">十班传奇</h1>
        <div>
            <el-button type="primary" size="large" class="start" @click="onclick_start">开始战斗</el-button> 
        </div>
        <!-- 用户信息 -->
        <el-card class="user-info" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <el-row>
                <el-col :span="4" @click="get_avatar">
                    <el-avatar :size="40"><img :src="save.user_avatar" id="avatar"></el-avatar> <!-- 头像 -->
                </el-col>
                <el-col :span="20">
                    <a v-show="isHover" class="user-name" @click="change_name">{{ save.user_name }}</a>
                </el-col>
            </el-row>
        </el-card>

        <el-card class="toolbar">
            <el-row>
                <el-col :span="4">
                    <el-button text @click="data.page_type = 'character'">
                        <el-image :src="icons.character" class="icon"/>
                        <span>&nbsp;角色</span>
                    </el-button>
                </el-col>

                <el-col :span="4">
                    <el-button text @click="data.page_type = 'wish'">
                        <el-image :src="icons.tachometer" class="icon"/>
                        <span>&nbsp;抽卡</span>
                    </el-button>
                </el-col>
                
                <el-col :span="4">
                    <el-button text @click="data.page_type = 'copy'">
                        <el-image :src="icons.door" class="icon"/>
                        <span>&nbsp;秘境</span>
                    </el-button>
                </el-col>
                <el-col :span="4">
                    <el-button text @click="data.page_type = 'bag'">
                        <el-image :src="icons.backpack" class="icon"/>
                        <span>&nbsp;背包</span>
                    </el-button>
                </el-col>
                <el-col :span="4">
                    <el-button text @click="data.page_type = 'setting'">
                        <el-image :src="icons.setting" class="icon"/>
                        <span>&nbsp;设置</span>
                    </el-button>
                </el-col>
                <el-col :span="4">
                    <el-button text @click="data.page_type = 'character'">
                        <el-image :src="icons.info" class="icon"/>
                        <span>&nbsp;关于</span>
                    </el-button>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<style lang="scss" scoped>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }

    #title {
        margin: 20px;
        font-size: 4rem;
    }

    .user-info {
        border-radius: 25px;
        position: fixed;
        top: 10px;
        left: 10px;
        width: 40px;
        height: 40px;
        --el-card-padding: 0px;
        transition: width 0.3s;
        overflow: hidden;
        cursor: pointer;
    }

    .user-info:hover {
        width: 200px;
    }

    .toolbar {
        border-radius: 25px;
        position: fixed;
        right: 10px;
        top: 10px;
        width: 35vw;
        height: 32px;
        --el-card-padding: 0px;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 25px;
        padding-right: 25px;

        .icon {
            width: 25px;
            height: 25px;
        }
    }
    .el-avatar {
        vertical-align: middle;
    }

    .user-name {
        display: inline-block;
        vertical-align: middle;
        margin-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        visibility: hidden;
        transition: visibility 0.3s;
    }

    .user-info:hover .user-name {
        visibility: visible;
    }
</style>