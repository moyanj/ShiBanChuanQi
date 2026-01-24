<script setup lang="ts">
import { ElRow, ElCol, ElScrollbar } from 'element-plus'
import { useDataStore, DataStoreState } from '../js/stores';
import { getExplore } from '../js/utils';

const data: DataStoreState = useDataStore();
const electron = window.electron;

const zx_list = [
    // 核心开发工具与平台
    "Microsoft",                    // VSCode - 开发环境
    "Github",                       // 代码托管与协作平台

    // 主要技术框架与运行环境
    "VueJS团队",                    // 核心前端框架
    "Electron团队",                 // 桌面应用打包
    "Element Plus 团队",            // UI组件库

    // 部署与网络服务
    "Cloudflare Pages 团队",        // 前端部署平台

    // AI技术支持
    "Google AI Labs",               // 大模型技术基础
    "Qwen AI团队",                  // 代码辅助与解决方案
    "Stable Diffusion团队",         // AI图像生成
    "Suno AI",                      // AI音频生成

    // 设计资源与内容
    "北京北大方正电子有限公司",     // 字体版权
    "小米科技有限责任公司",         // 字体资源

    // 灵感与创意来源
    "上海米哈游科技有限公司",       // 游戏玩法与美术灵感

    // 开源生态支持
    "OpenCode团队",                 // 开源项目支持
    "Linux Torvalds及开源社区",      // 操作系统与开发环境

    // 特别致谢（人文与支持）
    "重庆市凤鸣山中学全体教职工人员以及学生" // 创作环境与支持
]


</script>

<template>
    <div class="about-page">
        <div class="bg-overlay"></div>

        <el-row class="full-height">
            <el-col :span="10" class="flex-center">
                <div class="brand-section">
                    <h1 id="title">十班全明星</h1>
                    <div class="brand-line"></div>
                    <div class="version-info">
                        <p v-if="data.build_info != null">Version: <strong>{{ data.build_info.version }}</strong></p>
                        <p v-if="data.is_electron">Electron: <strong>{{ electron.version.electron }}</strong></p>
                        <p v-if="data.is_electron">NodeJS: <strong>{{ electron.version.node }}</strong></p>
                        <p v-if="data.build_info != null">Build Time: <strong>{{ data.build_info.time }}</strong></p>
                        <p>Browser: <strong>{{ getExplore() }}</strong></p>
                    </div>
                </div>
            </el-col>

            <el-col :span="14">
                <el-scrollbar class="credits-scroll">
                    <div class="credits-container">
                        <section class="credit-group">
                            <h2>制作组名单</h2>
                            <div class="credit-card">
                                <p>莫颜：开发，策划，美术，编剧，测试</p>
                                <p>辰哥：策划，测试</p>
                                <p>太奶：策划，编剧</p>
                                <p>镐京：策划</p>
                                <div class="easter-egg">没错，全 tm 是我写的</div>
                            </div>
                        </section>

                        <section class="credit-group">
                            <h2>特别致谢</h2>
                            <div class="thanks-list">
                                <div v-for="item in zx_list" :key="item" class="thanks-item">{{ item }}</div>
                            </div>
                            <p class="thanks-footer">
                                （排名不分先后）<br>
                                我们在此衷心感谢每一位支持者，正是因为你们的帮助和鼓励，我们的项目才能不断向前推进。
                            </p>
                        </section>

                        <section class="credit-group">
                            <h2>项目历程</h2>
                            <div class="timeline">
                                <div class="time-item">
                                    <span class="date">2024.10.20</span>
                                    <span class="event">项目正式启动</span>
                                </div>
                                <div class="time-item gray">
                                    <span class="date">2024.11.23</span>
                                    <span class="event">由于学业压力，项目暂停开发</span>
                                </div>
                                <div class="time-item highlight">
                                    <span class="date">2025.09.10</span>
                                    <span class="event">技术提升，项目重启开发</span>
                                </div>
                            </div>
                        </section>

                        <div class="final-signature">十班全明星制作组</div>
                    </div>
                </el-scrollbar>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.about-page {
    position: relative;
    height: 100vh;
    width: 100vw;
    background-color: #0c0c0e;
    color: #ececec;
    overflow: hidden;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(45, 55, 72, 0.3) 0%, transparent 70%);
    pointer-events: none;
}

.full-height {
    height: 100%;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.brand-section {
    text-align: left;
    padding-left: 80px;
}

#title {
    font-size: 5rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: 5px;
    font-family: 'ZiHunJianQi', sans-serif;
    color: #fff;
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
}

.brand-line {
    width: 100px;
    height: 6px;
    background: #f7d358;
    margin: 20px 0 40px;
}

.version-info {
    font-size: 1rem;
    color: #888;
    line-height: 2;
}

.version-info strong {
    color: #ccc;
}

.credits-scroll {
    height: 100vh;
    padding: 60px 80px 100px 40px;
}

.credits-container {
    padding-bottom: 100px;
}

.credit-group {
    margin-bottom: 60px;
}

.credit-group h2 {
    font-size: 1.5rem;
    color: #f7d358;
    margin-bottom: 25px;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.credit-group h2::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(247, 211, 88, 0.3);
}

.credit-card {
    background: rgba(255, 255, 255, 0.03);
    padding: 25px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.credit-card p {
    margin: 10px 0;
    font-size: 1.1rem;
}

.easter-egg {
    margin-top: 30px;
    color: #444;
    font-size: 0.8rem;
    font-style: italic;
}

.thanks-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.thanks-item {
    font-size: 1rem;
    color: #ccc;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.02);
    border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.thanks-footer {
    margin-top: 30px;
    color: #666;
    line-height: 1.6;
    font-size: 0.9rem;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.time-item {
    display: flex;
    gap: 30px;
    align-items: center;
}

.time-item .date {
    font-weight: 900;
    color: #f7d358;
    width: 100px;
}

.time-item.gray {
    opacity: 0.5;
}

.time-item.highlight .date {
    color: #48bb78;
    text-shadow: 0 0 10px rgba(72, 187, 120, 0.3);
}

.final-signature {
    margin-top: 80px;
    text-align: right;
    font-style: italic;
    color: #f7d358;
    font-weight: bold;
}

@media screen and (max-height: 500px) and (orientation: landscape) {
    .credits-scroll {
        padding: 30px 40px 60px 20px;
    }

    .brand-section {
        padding-left: 40px;
    }

    #title {
        font-size: 2.5rem;
        letter-spacing: 2px;
    }

    .brand-line {
        margin: 10px 0 20px;
        height: 4px;
        width: 60px;
    }

    .version-info {
        font-size: 0.8rem;
        line-height: 1.6;
    }

    .credit-group {
        margin-bottom: 30px;
    }

    .credit-group h2 {
        font-size: 1.2rem;
        margin-bottom: 15px;
    }

    .credit-card {
        padding: 15px;
    }

    .credit-card p {
        font-size: 0.7rem;
        margin: 5px 0;
    }

    .easter-egg {
        font-size: 0.5rem;
    }

    .thanks-item {
        font-size: 0.8rem;
        padding: 5px 10px;
    }

    .thanks-footer {
        font-size: 0.7rem;
    }

    .time-item {
        gap: 15px;
    }

    .time-item .date {
        font-size: 0.9rem;
        width: 80px;
    }

    .final-signature {
        margin-top: 40px;
        font-size: 0.9rem;
    }
}
</style>