<script setup lang="ts">
import { ref } from 'vue'
import { ElCol, ElRow, ElCard, ElAvatar, ElMessageBox, ElMessage } from "element-plus"
import { useSaveStore } from "../js/store"
import { randomNum } from "../js/utils"

const save = useSaveStore()
const isHover = ref(false)

if (save.user_avatar == "") {
    save.user_avatar = "/avatars/" + randomNum(1,10) + ".png"
}

function get_avatar() {
   save.user_avatar = "/avatars/" + randomNum(1,10) + ".png"
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
    return;
}

// 鼠标悬停和离开事件处理
const handleMouseEnter = () => {
    isHover.value = true
}

const handleMouseLeave = () => {
    isHover.value = false
}
</script>

<template>
    <!-- 用户信息 -->
    <el-card class="user-info"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
        <el-row>
            <el-col :span="4" @click="get_avatar">
                <el-avatar :size="40"><img v-bind:src="save.user_avatar" id="avatar" ></el-avatar> <!-- 头像 -->
            </el-col>
            <el-col :span="20">
                <a v-show="isHover" class="user-name" @click="change_name">{{ save.user_name }}</a>
            </el-col>
        </el-row>
    </el-card>

    <h1>十班传奇</h1>
</template>

<style lang="scss" scoped>
.user-info {
    border-radius: 25px;
    // 固定屏幕左上角
    position: fixed;
    top: 10px;
    left: 10px;
    width: 40px;
    height: 40px;
    --el-card-padding: 0px;
    transition: width 0.3s;
    overflow: hidden; /* 防止内容溢出 */
    cursor: pointer; /* 显示为可点击状态 */
}

.user-info:hover {
    width: 200px; /* 根据实际需要调整宽度 */
}

.el-avatar {
    vertical-align: middle;
}

.user-name {
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
    white-space: nowrap; /* 防止文本换行 */
    overflow: hidden;
    text-overflow: ellipsis; /* 超出部分显示省略号 */
    visibility: hidden; /* 默认不可见 */
    transition: visibility 0.3s;
}

.user-info:hover .user-name {
    visibility: visible; /* 悬停时可见 */
}
</style>