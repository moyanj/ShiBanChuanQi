<script setup lang="ts">
import { ref } from 'vue';
import { ElScrollbar, ElMessageBox, ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElLoading } from 'element-plus';
import { useSaveStore, useDataStore } from '../js/stores';
import { SaveServer, MersenneTwister } from '../js/utils';
import { randomName } from '../js/lib/name';
import sbutton from '../components/sbutton.vue'
import settingItem from '../components/setting-item.vue'

const saveStore = useSaveStore();
const random = new MersenneTwister()
var show_upload_data = ref(false);
var show_reg_data = ref(false);
var show_load_data = ref(false);
var password = ref('');
var username = ref('');

function reset() {
    ElMessageBox.confirm("确定删除吗？", {
        type: "warning"
    }).then(() => {
        saveStore.$reset();
        useDataStore().$reset();
        ElMessage.success("删除成功")
    })

}

function reg() {
    window.initGeetest4({
        product: "bind",
        captchaId: "6acf3658d1b41039662abc436d70e412"
    }, (captcha) => {
        captcha.showCaptcha();
        captcha.onSuccess(() => {
            let s = new SaveServer();
            console.log(captcha.getValidate())
            var loading = ElLoading.service();
            s.register(username.value, password.value, captcha.getValidate()).then((xhr: XMLHttpRequest) => {
                loading.close()
                if (xhr.status == 201) {
                    show_reg_data.value = false;
                    ElMessage.success("注册成功");
                } else if (xhr.status == 409) {
                    ElMessage.error("用户已存在");
                } else {
                    ElMessage.error("服务器错误");
                }
            }).finally(() => {
                captcha.destroy();
            })
        })
    })
}

function load() {
    window.initGeetest4({
        product: "bind",
        captchaId: "6acf3658d1b41039662abc436d70e412"
    }, (captcha) => {
        captcha.showCaptcha();
        captcha.onSuccess(() => {
            let s = new SaveServer();
            var loading = ElLoading.service();
            s.download(username.value, password.value).then((xhr: XMLHttpRequest) => {
                loading.close()
                if (xhr.status == 200) {
                    show_load_data.value = false;
                    let data = JSON.parse(xhr.responseText);
                    saveStore.$patch(JSON.parse(data.data))
                    ElMessage.success("加载成功");
                } else if (xhr.status == 401) {
                    ElMessage.error("用户名或密码错误");
                } else {
                    ElMessage.error("服务器错误");
                }
            }).finally(() => {
                captcha.destroy();
            })
        })
    })
}

function upload() {
    window.initGeetest4({
        product: "bind",
        captchaId: "6acf3658d1b41039662abc436d70e412"
    }, (captcha) => {
        captcha.showCaptcha();
        captcha.onSuccess(() => {

            let s = new SaveServer();
            var loading = ElLoading.service();
            s.upload(username.value, password.value, saveStore.$state, captcha.getValidate()).then((xhr: XMLHttpRequest) => {
                loading.close()
                if (xhr.status == 200) {
                    show_upload_data.value = false;
                    ElMessage.success("上传成功");
                } else if (xhr.status == 401) {
                    ElMessage.error("用户名或密码错误");
                } else {
                    ElMessage.error("服务器错误");
                }

            }).catch((e) => {
                console.log(e)
            }).finally(() => {
                captcha.destroy();
            })
        })
    })
}

function reset_username() {
    saveStore.user_name = randomName.getNickName();
    ElMessageBox.alert(`新用户名为：${saveStore.user_name}`)
}

function reset_avatar() {
    saveStore.user_avatar = `avatars/${random.randint(1, 100)}.png`;;
    ElMessage.success("修改完毕")
}
</script>

<template>
    <div class="page-container">
        <h1 align="right">设置</h1>

        <el-scrollbar class="content">
            <settingItem label="云存档">
                <h4>服务器正在维护</h4>
                <sbutton type="primary" @click="show_upload_data = true" disabled>上传数据</sbutton>
                <sbutton type="primary" @click="show_load_data = true" disabled>加载数据</sbutton>
                <sbutton type="primary" @click="show_reg_data = true" disabled>注册账户</sbutton>
                <p style="font-size:11px;">由Websockets强力驱动</p>
            </settingItem>

            <settingItem label="用户信息">
                <sbutton @click="reset_username">更换用户名</sbutton>
                <sbutton @click="reset_avatar">更换头像</sbutton>
            </settingItem>


            <settingItem label="危险操作">
                <sbutton type="danger" @click="reset">重置全部游戏数据</sbutton>
            </settingItem>

        </el-scrollbar>

        <el-dialog title="上传数据" v-model="show_upload_data">
            <el-form label-width="auto">
                <el-form-item label="用户名">
                    <el-input v-model="username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="password" placeholder="请输入密码" show-password type="password"></el-input>
                </el-form-item>
                <p>本地数据将会覆盖云端数据</p>
                <el-form-item>
                    <sbutton type="primary" @click="upload">上传</sbutton>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="注册账户" v-model="show_reg_data">
            <el-form label-width="auto">
                <el-form-item label="用户名">
                    <el-input v-model="username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="password" placeholder="请输入密码" show-password type="password"></el-input>
                </el-form-item>
                <el-form-item>
                    <sbutton type="primary" @click="reg">注册</sbutton>
                </el-form-item>
            </el-form>
        </el-dialog>

        <el-dialog title="加载数据" v-model="show_load_data">
            <el-form label-width="auto">
                <el-form-item label="用户名">
                    <el-input v-model="username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="password" placeholder="请输入密码" show-password type="password"></el-input>
                </el-form-item>
                <p>云端数据将会与本地数据合并</p>
                <el-form-item>

                    <sbutton type="primary" @click="load">加载</sbutton>
                </el-form-item>
            </el-form>

        </el-dialog>
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
    height: 100vh;
    box-sizing: border-box;
}

.content {
    height: 90vh;
    /* 留出标题空间 */
    width: 100%;
}
</style>
