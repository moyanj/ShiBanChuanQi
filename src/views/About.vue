<script setup lang="ts">
    import { ref } from 'vue';
    import { ElRow, ElCol, ElScrollbar, ElCard, ElDialog } from 'element-plus'
    import { useDataStore, DataStoreState } from '../js/store';
    import { getExplore } from '../js/utils';
    import svideo from '../components/svideo.vue';
    import 'video.js/dist/video-js.css';

    const data: DataStoreState = useDataStore();
    const electron = window.electron;

    const player = {
        autoplay: false,
        controls: true,
        muted: false,
        fluid: true
    }
    const show_cg = ref(false);
    function play() {
        show_cg.value = true;
    }

</script>

<template>
    <el-row>
        <el-col :span="12">
            <div class="grid-content container">
                <h1 id="title">十班传奇</h1>
                <br>
                <p v-if="data.build_info != null">版本：{{ data.build_info.version }}</p>
                <p v-if="data.is_electron">Electron版本：{{ data.build_info.electron_version }}</p>
                <p v-if="data.is_electron">NodeJS版本：{{ electron.version.node }}</p>
                <p v-if="data.build_info != null">编译时间：{{ data.build_info.time }}</p>
                <p> 浏览器版本：{{ getExplore() }}</p>

            </div>
        </el-col>

        <el-col :span="12">
            <div class="grid-content container">

                <h2>制作组名单</h2>
                <el-scrollbar style="height: 45vh; width: 100%;">
                    <el-card>
                        <p><span @click="play()">莫颜</span>：开发，策划，美术，UI</p>
                        <p>辰哥：策划</p>
                        <p>太奶：策划</p>
                        <p>镐京：策划</p>
                    </el-card>
                </el-scrollbar>

                <h2>致谢名单</h2>
                <el-scrollbar style="height: 45vh; width: 100%;">
                    <el-card>
                        <p>小米科技有限公司，北京北大方正电子有限公司，北京字节跳动科技有限公司，上海米哈游科技有限公司，Google Inc.，Leonid
                            Tsvetkov，微软科技，VueJS团队，Github，北京阿里云计算科技，Suno AI， Stable
                            Diffusion团队，Electron团队，重庆市凤鸣山中学全体师生。（排名不分先后）
                        </p>
                    </el-card>
                </el-scrollbar>
            </div>
        </el-col>
    </el-row>

    <el-dialog v-model="show_cg" destroy-on-close>
        <svideo :options="player">
            <source src="/video/firefly.mp4" type="video/mp4">
        </svideo>
    </el-dialog>

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
        font-size: 4rem;
        font-family: 'SuXinShi';
    }

    #cg {
        width: 64vw;
        height: 36vh;
    }

    
</style>