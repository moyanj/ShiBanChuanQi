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
    <div class="setting-page">
        <!-- 背景装饰 -->
        <div class="bg-overlay"></div>

        <div class="content-header">
            <h1>设置</h1>
            <div class="header-line"></div>
        </div>

        <div class="main-content">
            <el-scrollbar>
                <div class="setting-list">
                    <settingItem label="云存档">
                        <div class="maintenance-msg">
                            <div class="m-icon">⚠️</div>
                            <div class="m-text">服务器正在维护中，部分功能暂时不可用</div>
                        </div>
                        <div class="btn-group">
                            <sbutton type="primary" @click="show_upload_data = true" disabled>上传数据</sbutton>
                            <sbutton type="primary" @click="show_load_data = true" disabled>加载数据</sbutton>
                            <sbutton type="primary" @click="show_reg_data = true" disabled>注册账户</sbutton>
                        </div>
                        <p class="powered-by">Powered by Websockets & Geetest</p>
                    </settingItem>

                    <settingItem label="用户信息">
                        <div class="user-info-actions">
                            <div class="current-user">当前用户: <strong>{{ saveStore.user_name }}</strong></div>
                            <div class="btn-group">
                                <sbutton @click="reset_username">随机更换名称</sbutton>
                                <sbutton @click="reset_avatar">随机更换头像</sbutton>
                            </div>
                        </div>
                    </settingItem>

                    <settingItem label="危险区域">
                        <div class="danger-zone">
                            <p class="danger-desc">重置数据将永久清除本地进度、角色及圣遗物，此操作不可撤销。</p>
                            <sbutton type="danger" @click="reset">立即重置全部游戏数据</sbutton>
                        </div>
                    </settingItem>
                </div>
            </el-scrollbar>
        </div>

        <!-- 弹窗部分保持逻辑，更新样式由全局 Element Plus 样式覆盖 -->
        <el-dialog title="上传数据" v-model="show_upload_data" width="400px">
            <!-- ... -->
        </el-dialog>
        <!-- ... 其余 Dialog 保持逻辑 ... -->
    </div>
</template>

<style scoped>
.setting-page {
    position: relative;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    background-color: #0c0c0e;
    color: #ececec;
    overflow: hidden;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    padding: 40px 60px;
    box-sizing: border-box;
}

.bg-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at 70% 30%, rgba(45, 55, 72, 0.2) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

.content-header {
    position: relative;
    z-index: 1;
}

.content-header h1 {
    font-size: 3rem;
    margin: 0 0 10px;
    letter-spacing: 4px;
}

.header-line {
    width: 80px;
    height: 4px;
    background: #f7d358;
    margin-bottom: 40px;
}

.main-content {
    flex: 1;
    position: relative;
    z-index: 1;
    max-width: 1000px;
}

.setting-list {
    padding-right: 20px;
    padding-bottom: 100px;
}

.btn-group {
    display: flex;
    gap: 15px;
    margin: 15px 0;
}

.maintenance-msg {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(246, 173, 85, 0.1);
    border: 1px solid rgba(246, 173, 85, 0.3);
    padding: 12px 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    color: #f6ad55;
}

.powered-by {
    font-size: 0.75rem;
    color: #555;
    margin-top: 10px;
}

.current-user {
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.danger-desc {
    color: #888;
    font-size: 0.9rem;
    margin-bottom: 20px;
}

:deep(.el-dialog) {
    background: #1a1a1e;
    border: 1px solid rgba(255,255,255,0.1);
}
</style>
