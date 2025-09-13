<script setup lang="ts">
import { ref } from 'vue'
import { ElCol, ElRow, ElCard, ElAvatar, ElMessageBox, ElMessage, ElImage } from 'element-plus'
import sbutton from '../components/sbutton.vue';
import { useSaveStore, SaveStoreState, useDataStore } from '../js/store'
import { MersenneTwister, icons } from '../js/utils'

const save = useSaveStore();
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
                <el-col :span="5">
                    <el-avatar><img :src="save.user_avatar" id="avatar"></el-avatar> <!-- 头像 -->
                </el-col>
                <el-col :span="19">
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
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    /* Ensure background doesn't overflow */
}

.container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Placeholder background color. Replace with an image if available, e.g.: */
    /* background-image: url('../assets/bg/home.jpeg'); */
    background-color: #2c3e50;
    /* Dark blue-gray */
    background-size: cover;
    background-position: center;
    filter: blur(3px);
    /* Subtle blur for background */
    z-index: -1;
    /* Place behind content */
}

.container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    /* Dark overlay for readability */
    z-index: -1;
}

#title {
    margin: 20px;
    font-size: 100px;
    /* Slightly larger title */
    font-weight: 700;
    /* Bolder font weight */
    font-family: 'ZiHunJianQi';
    color: #e6ebff;
    /* Light color for contrast */
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.7);
    /* Text shadow for depth */
    letter-spacing: 5px;
    /* Add some letter spacing */
}

.start {
    margin-top: 30px;
    padding: 15px 40px;
    /* Larger padding for a bigger button */
    font-size: 28px;
    /* Larger font size */
    border-radius: 50px;
    /* More rounded button */
    background-color: #4CAF50;
    /* Green color */
    border: none;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
    /* Button shadow */
    transition: all 0.3s ease;
    color: white;
    font-weight: bold;
}

.start:hover {
    background-color: #45a049;
    /* Darker green on hover */
    transform: translateY(-3px);
    /* Lift effect on hover */
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.4);
}

.user-info {
    border-radius: 30px;
    /* More rounded corners */
    position: fixed;
    top: 20px;
    /* Adjusted position */
    left: 20px;
    /* Adjusted position */
    width: 220px;
    /* Slightly wider */
    height: 50px;
    /* Taller */
    --el-card-padding: 5px;
    /* Adjusted padding */
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;
    background-color: rgba(40, 40, 40, 0.7);
    /* Semi-transparent dark background */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
}

.user-info:hover {
    width: 250px;
    /* Expand on hover */
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

.toolbar {
    border-radius: 30px;
    /* More rounded corners */
    position: fixed;
    right: 20px;
    /* Adjusted position */
    top: 20px;
    /* Adjusted position */
    width: auto;
    /* Auto width to fit content */
    height: 50px;
    /* Taller */
    --el-card-padding: 5px 20px;
    /* Adjusted padding */
    background-color: rgba(40, 40, 40, 0.7);
    /* Semi-transparent dark background */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.toolbar .el-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.toolbar .el-col {
    display: flex;
    justify-content: center;
    align-items: center;
}

.toolbar .sbutton {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 10px;
    min-width: 60px;
    /* Ensure minimum width for buttons */
}

.toolbar .sbutton span {
    font-size: 12px;
    /* Smaller font for button text */
    margin-top: 3px;
    color: #e6ebff;
}

.el-avatar {
    vertical-align: middle;
    width: 40px;
    height: 40px;
    overflow: hidden;
    /* Ensure content inside is clipped */
}

.el-avatar #avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Cover the area without distortion */
}

.user-name {
    display: inline-block;
    vertical-align: middle;
    margin-left: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: width 0.3s;
    font-size: 18px;
    /* Larger font size */
    line-height: 40px;
    color: #e6ebff;
    font-weight: bold;
}

.icon {
    width: 28px;
    /* Larger icons */
    height: 28px;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
    /* Icon shadow */
}
</style>