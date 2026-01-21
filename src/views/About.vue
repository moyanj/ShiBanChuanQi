<script setup lang="ts">
import { ElRow, ElCol, ElScrollbar, ElCard } from 'element-plus'
import { useDataStore, DataStoreState } from '../js/stores';
import { getExplore } from '../js/utils';

const data: DataStoreState = useDataStore();
const electron = window.electron;

const zx_list = [
    "Microsoft",
    "Qwen AI团队",
    "VueJS团队",
    "Github",
    "Suno AI",
    "Google AI Labs",
    "Stable Diffusion团队",
    "OpenCode团队",
    "Electron团队",
    "北京北大方正电子有限公司",
    "小米科技有限责任公司",
    "上海米哈游科技有限公司",
    "重庆市凤鸣山中学全体教职工人员以及学生"
]


</script>

<template>
    <div class="page-container">
        <el-row>
            <el-col :span="12">
            <div class="grid-content container">
                <h1 id="title">十班全明星</h1>
                <br>
                <p v-if="data.build_info != null">版本：{{ data.build_info.version }}</p>
                <p v-if="data.is_electron">Electron版本：{{ electron.version.electron }}</p>
                <p v-if="data.is_electron">NodeJS版本：{{ electron.version.node }}</p>
                <p v-if="data.build_info != null">编译时间：{{ data.build_info.time }}</p>
                <p> 浏览器版本：{{ getExplore() }}</p>

            </div>
        </el-col>

        <el-col :span="12">
            <div class="grid-content container">

                <h2>制作组名单</h2>
                <el-card style=" width: 100%;">
                    <el-scrollbar style="height: 25vh;">
                        <p>莫颜：开发，策划，美术，编剧，测试</p>
                        <p>辰哥：策划，测试</p>
                        <p>太奶：策划，编剧</p>
                        <p>镐京：策划</p>
                        <br v-for="i in 100">
                        <p>没错，全tm是我写的</p>
                    </el-scrollbar>
                </el-card>


                <h2>致谢名单</h2>

                <el-card class="zx">
                    <el-scrollbar style="height: 25vh;">
                        <li v-for="item in zx_list"><span>{{ item }}</span></li>
                        <p>（排名不分先后）<br>我们在此衷心感谢每一位支持者，正是因为你们的帮助和鼓励，我们的项目才能不断向前推进。在这个过程中，您们的信任与支持是我们不断进步的动力。</p>

                        <br></br>
                        <h3 style="margin-top: 15px;">项目历程</h3>
                        <p>2024年10月20日 - 项目正式启动</p>
                        <p>2024年11月23日 - 由于学业压力，项目暂停开发</p>
                        <p>2025年09月10日 - 技术提升，项目重启开发</p>

                        <p style="text-align: right; margin-top: 15px;">十班全明星制作组</p>
                    </el-scrollbar>
                </el-card>

            </div>
        </el-col>
    </el-row>
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
    height: 100vh;
    box-sizing: border-box;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}

#title {
    margin: 20px;
    font-size: 90px;
    font-weight: 455;
    font-family: 'ZiHunJianQi'
}

#cg {
    width: 64vw;
    height: 36vh;
}

.zx {
    margin-bottom: 15px;
    width: 100%;
}

li {
    font-size: 12.8px;
}
</style>