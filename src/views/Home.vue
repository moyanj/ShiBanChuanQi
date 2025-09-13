<script setup lang="ts">
import { ref } from 'vue'
import { ElCol, ElRow, ElCard, ElAvatar, ElMessageBox, ElMessage, ElImage } from 'element-plus'
import sbutton from '../components/sbutton.vue';
import { useSaveStore, SaveStoreState, useDataStore } from '../js/store'
import { MersenneTwister, icons } from '../js/utils'

const save: SaveStoreState = useSaveStore();
const data = useDataStore();
const random = new MersenneTwister();

if (save.user_avatar === "") {
    save.user_avatar = `avatars/${random.randint(1, 100)}.png`;
}

const onclick_start = () => {
    data.page_type = 'fight'
}
</script>

<template>
    <div class="container">
        <h1 id="title">十班全明星</h1>
        <br>
        <div>
            <sbutton type="primary" size="large" class="start" @click="onclick_start">开始战斗</sbutton>
        </div>
        <!-- 用户信息 -->
        <el-card class="user-info">
            <el-row>
                <el-col :span="4">
                    <el-avatar><img :src="save.user_avatar" id="avatar"></el-avatar> <!-- 头像 -->
                </el-col>
                <el-col :span="20">
                    <a class="user-name">{{ save.user_name }}</a>
                </el-col>
            </el-row>
        </el-card>

        <el-card class="toolbar">
            <el-row>
                <el-col :span="4">
                    <sbutton text @click="data.page_type = 'character'">
                        <el-image :src="icons.character" class="icon" />
                        <span>&nbsp;角色</span>
                    </sbutton>
                </el-col>

                <el-col :span="4">
                    <sbutton text @click="data.page_type = 'wish'">
                        <el-image :src="icons.wish" class="icon" />
                        <span>&nbsp;抽卡</span>
                    </sbutton>
                </el-col>
                <!--
                <el-col :span="4">
                    <sbutton text @click="data.page_type = 'MiJing'">
                        <el-image :src="icons.online" class="icon" />
                        <span>&nbsp;联机</span>
                    </sbutton>
                </el-col>-->
                <el-col :span="4">
                    <sbutton text @click="data.page_type = 'bag'">
                        <el-image :src="icons.backpack" class="icon" />
                        <span>&nbsp;背包</span>
                    </sbutton>
                </el-col>
                <el-col :span="4">
                    <sbutton text @click="data.page_type = 'setting'">
                        <el-image :src="icons.setting" class="icon" />
                        <span>&nbsp;设置</span>
                    </sbutton>
                </el-col>
                <el-col :span="4">
                    <sbutton text @click="data.page_type = 'about'">
                        <el-image :src="icons.info" class="icon" />
                        <span>&nbsp;关于</span>
                    </sbutton>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}

#title {
    margin: 20px;
    font-size: 96px;
    font-weight: 455;
    font-family: 'ZiHunJianQi';
}

.user-info {
    border-radius: 25px;
    position: fixed;
    top: 10px;
    left: 10px;
    width: 200px;
    height: 40px;
    --el-card-padding: 0px;
    transition: width 0.3s;
    overflow: hidden;
    cursor: pointer;
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
}

.el-avatar {
    vertical-align: middle;
    width: 40px;
    height: 40px;
}

.user-name {
    display: inline-block;
    vertical-align: middle;
    margin-left: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: visibility 0.3s;
    font-size: 15px;
    line-height: 40px;
}
</style>