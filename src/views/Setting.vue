<script setup lang="ts">
    import { ref } from 'vue';
    import { ElScrollbar, ElMessageBox, ElMessage, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus';
    import { useSaveStore, useDataStore } from '../js/store';
    import { SaveServer } from '../js/utils';
    import sbutton from '../components/sbutton.vue'
    import settingItem from '../components/setting-item.vue'

    const saveStore = useSaveStore();
    var show_upload_data = ref(false);
    var show_reg_data = ref(false);
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
                s.register(username.value, password.value, captcha.getValidate()).then((xhr: XMLHttpRequest) => {
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

    function upload() {
        window.initGeetest4({
            product: "bind",
            captchaId: "6acf3658d1b41039662abc436d70e412"
        }, (captcha) => {
            captcha.showCaptcha();
            captcha.onSuccess(() => {

                let s = new SaveServer();
                console.log(captcha.getValidate())

                s.upload(username.value, password.value, saveStore.$state, captcha.getValidate()).then((xhr: XMLHttpRequest) => {
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
</script>

<template>
    <h1 align="right">设置</h1>

    <el-scrollbar class="content">
        <settingItem label="云存档">
            <sbutton type="primary" @click="show_upload_data = true">上传数据</sbutton>
            <sbutton type="primary">加载数据</sbutton>
            <sbutton type="primary" @click="show_reg_data = true">注册账户</sbutton>
            <p style="font-size:11px;">由Sqlpub和Render提供支持</p>
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

</template>

<style scoped lang="scss">
    .content {
        height: 100vh;
        width: 100vw;
        padding-left: 10px;
        padding-right: 10px;
    }

</style>