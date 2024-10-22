<script setup lang="ts">
    import { ElRow, ElCol, ElScrollbar, ElCard } from 'element-plus'
    import { useDataStore, DataStoreState } from '../js/store';
    import { getExplore } from '../js/utils';
    const data: DataStoreState = useDataStore();


</script>

<template>
    <el-row>
        <el-col :span="12">
            <div class="grid-content container">
                <h1>十班传奇</h1>
                <br>
                <p v-if="data.build_info != null">版本：{{ data.build_info.version }}</p>
                <p v-if="data.is_electron">Electron版本：{{ data.build_info.electron_version }}</p>

                <p  v-if="data.build_info != null">编译时间：{{ data.build_info.time }}</p>
                <p> 浏览器版本：{{ getExplore() }}</p>

            </div>
        </el-col>
        <el-col :span="12">
            <div class="grid-content container">

                <h2>制作组名单</h2>
                <el-scrollbar style="height: 45vh; width: 100%;">
                    <el-card>
                        <p>莫颜：开发，策划，美术，UI</p>
                        <p>辰哥：开发，策划</p>
                        <p>太奶：策划</p>
                        <p>镐京：策划</p>
                        <p>范鸡：美术</p>
                    </el-card>
                </el-scrollbar>
                <h2>致谢</h2>
                <el-scrollbar style="height: 45vh; width: 100%;">
                    <el-card>
                        <p>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;感谢由小米科技有限公司提供的MiSans字体。感谢由北京字节跳动科技有限公司，上海米哈游科技有限公司，Google Inc.，Leonid Tsvetkov提供的图标。感谢微软科技，VueJS团队，Github，北京阿里云计算科技提供的技术支持。<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;最后，感谢重庆市凤鸣山中学全体师生，特别感谢重庆市风鸣山中学初2023级10班。
                        </p>
                    </el-card>
                </el-scrollbar>
            </div>
        </el-col>
    </el-row>

</template>

<style lang="scss" scoped>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }
</style>