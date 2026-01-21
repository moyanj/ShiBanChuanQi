<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSaveStore, useDataStore } from '../js/stores';
import { icons } from '../js/utils';
import { ElImage, ElAvatar, ElMessage } from 'element-plus';
import sbutton from '../components/sbutton.vue';
import placeholderImg from '../assets/placeholder/p300x400.png';
import XinHuo from '../assets/things/XinHuo.png';

const save = useSaveStore();
const data = useDataStore();

// 看板娘逻辑
const currentCharacter = ref<any>(null);
const characterImg = ref('');
const showCharacter = ref(false);

const initKanban = () => {
    // 获取玩家拥有的所有角色
    const myChars = save.characters.get_all();
    console.log("My Characters:", myChars);

    if (myChars.length > 0) {
        // 随机选一个
        const randomChar = myChars[Math.floor(Math.random() * myChars.length)];
        currentCharacter.value = randomChar;
        // 修正路径：确保 illustrations 目录在 public 下，引用时无需 public 前缀
        // 但要注意 inside_name 是否正确匹配文件名
        characterImg.value = `illustrations/${randomChar.inside_name}.jpg`;
        console.log("Selected Char:", randomChar.inside_name, "Img Path:", characterImg.value);
    } else {
        // Fallback: 如果没有角色（比如新号），默认显示 FanShiFu (范师傅)
        // 假设 public/illustrations/FanShiFu.jpg 存在
        currentCharacter.value = { name: '范师傅', desc: '点击开始你的旅程', inside_name: 'FanShiFu' };
        characterImg.value = placeholderImg; // 直接使用占位图
        console.log("Fallback Char: FanShiFu", "Img Path:", characterImg.value);
    }

    // 简单的淡入动画
    setTimeout(() => {
        showCharacter.value = true;
    }, 100);
};

const onKanbanClick = () => {
    if (currentCharacter.value) {
        // 这里可以播放语音或显示气泡
        const greetings = [
            "准备好出发了吗？",
            "今天天气不错。",
            "战斗随时可能开始。",
            "休息一下吧。",
            `${save.user_name}，有什么指示？`
        ];
        const text = greetings[Math.floor(Math.random() * greetings.length)];
        ElMessage({
            message: text,
            type: 'info',
            duration: 2000,
            customClass: 'kanban-message'
        });
    }
};

const handleImgError = () => {
    // 统一使用 p300x400 占位图
    if (characterImg.value !== placeholderImg) {
        console.warn(`Failed to load ${characterImg.value}, using placeholder.`);
        characterImg.value = placeholderImg;
    }
};

// 资源数据
const xinhuo = computed(() => save.things.get('XinHuo'));

// 属性图标映射
const typeMap: Record<string, string> = {
    "火": icons.element.fire,
    "水": icons.element.water,
    "雷": icons.element.thunder,
    "草": icons.element.grass,
    "物理": icons.element.physics,
    "量子": icons.element.liangzi,
    "虚无": icons.element.nihility
};

onMounted(() => {
    initKanban();
});

const navigate = (page: string) => {
    data.page_type = page;
};
</script>

<template>
    <div class="dashboard">
        <!-- 背景层 -->
        <div class="bg-layer"></div>

        <!-- 看板娘层 -->
        <div class="kanban-layer" :class="{ 'fade-in': showCharacter }">
            <div class="kanban-wrapper">
                <img :src="characterImg" class="kanban-img" @click="onKanbanClick" @error="handleImgError"
                    alt="Kanban" />

                <!-- 角色信息 Banner -->
                <div class="char-banner" v-if="currentCharacter">
                    <div class="char-header">
                        <span class="char-name">{{ currentCharacter.name }}</span>
                        <img :src="typeMap[currentCharacter.type]" class="char-type-icon"
                            v-if="currentCharacter.type && typeMap[currentCharacter.type]" />
                    </div>
                    <div class="char-desc-line"></div>
                    <div class="char-desc">{{ currentCharacter.desc || '暂无介绍' }}</div>
                </div>
            </div>
        </div>

        <!-- UI 层 -->
        <div class="ui-layer">

            <!-- 顶部栏：玩家信息 + 资源 -->
            <div class="top-bar">
                <div class="player-info">
                    <div class="avatar-container">
                        <el-avatar :src="save.user_avatar" :size="50" class="avatar-border"></el-avatar>
                        <div class="level-badge">Lv.{{ Math.floor(save.n_wish / 10) + 1 }}</div>
                    </div>
                    <div class="player-details">
                        <div class="player-name">{{ save.user_name }}</div>
                        <div class="player-uid">UID: {{ 1000000 + Math.floor(Math.random() * 9999) }}</div>
                    </div>
                </div>

                <div class="resources">
                    <div class="res-item">
                        <img :src="XinHuo" class="res-icon" />
                        <span class="res-value">{{ xinhuo }}</span>
                        <div class="res-add">+</div>
                    </div>
                </div>
            </div>

            <!-- 左侧功能区 -->
            <div class="left-bar">
                <div class="left-btn" @click="navigate('setting')">
                    <img :src="icons.setting" />
                </div>
                <div class="left-btn" @click="navigate('about')">
                    <img :src="icons.info" />
                </div>
            </div>

            <!-- 右侧核心功能区 -->
            <div class="right-zone">
                <!-- 次要功能菜单 (垂直排列) -->
                <div class="menu-list">
                    <div class="menu-item" @click="navigate('character')">
                        <div class="menu-icon-bg">
                            <img :src="icons.character" />
                        </div>
                        <span>角色</span>
                    </div>

                    <div class="menu-item" @click="navigate('bag')">
                        <div class="menu-icon-bg">
                            <img :src="icons.backpack" />
                        </div>
                        <span>背包</span>
                    </div>

                    <div class="menu-item" @click="navigate('wish')">
                        <div class="menu-icon-bg">
                            <img :src="icons.wish" />
                        </div>
                        <span>补给</span>
                    </div>
                </div>

                <!-- 出击按钮 -->
                <div class="start-btn-container" @click="navigate('fight')">
                    <div class="start-btn">
                        <div class="start-inner">
                            <span class="start-text">出击</span>
                            <span class="start-sub">BATTLE</span>
                        </div>
                        <div class="start-glow"></div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
<style scoped>
/* 全局样式 */
.dashboard {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    font-family: "PingFang SC", "Microsoft YaHei", "MiSans", sans-serif;
    user-select: none;
    background-color: #0c0c0e;
}

/* 背景层 */
.bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: radial-gradient(circle at 30% 50%, rgba(45, 55, 72, 0.4) 0%, transparent 70%);
    filter: brightness(0.8);
}

/* 看板娘层 */
.kanban-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 20vw;
}

.kanban-wrapper {
    position: relative;
    pointer-events: auto;
    animation: slideInLeft 0.8s ease-out forwards;
    opacity: 0;
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 插画展示 - 移除白框，改为呼吸投影 */
.kanban-img {
    height: 85vh;
    width: auto;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 0 30px rgba(0, 0, 0, 0.8));
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.kanban-img:hover {
    transform: scale(1.03) translateY(-10px);
}

/* 角色信息 Banner - 扁平化透明设计 */
.char-banner {
    position: absolute;
    bottom: 10vh;
    left: 50%;
    width: 350px;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
    border-left: 4px solid #f7d358;
    padding: 20px 30px;
    pointer-events: auto;
    backdrop-filter: blur(5px);
}

.char-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 8px;
}

.char-name {
    font-size: 36px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(247, 211, 88, 0.3);
}

.char-type-icon {
    width: 32px;
    height: 32px;
}

.char-desc-line {
    width: 60px;
    height: 2px;
    background: #f7d358;
    margin-bottom: 12px;
}

.char-desc {
    font-size: 16px;
    color: #ccc;
    line-height: 1.5;
}

/* 顶部栏 - 玩家状态 */
.top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 30px 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
    box-sizing: border-box;
}

.player-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.avatar-container {
    position: relative;
    cursor: pointer;
}

.avatar-border {
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 15px rgba(247, 211, 88, 0.2);
    transition: all 0.3s;
}

.avatar-container:hover .avatar-border {
    border-color: #f7d358;
    transform: scale(1.05);
}

.level-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: #f7d358;
    color: #000;
    font-size: 12px;
    font-weight: 900;
    padding: 2px 8px;
    border-radius: 4px;
    border: 2px solid #000;
}

.player-name {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
}

.player-uid {
    font-size: 14px;
    color: #888;
    letter-spacing: 1px;
}

/* 资源组 */
.resources {
    display: flex;
    gap: 25px;
}

.res-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 5px 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    backdrop-filter: blur(10px);
}

.res-icon {
    width: 24px;
    height: 24px;
}

.res-value {
    color: #f7d358;
    font-weight: 900;
    font-size: 18px;
}

.res-add {
    color: #fff;
    cursor: pointer;
    font-weight: bold;
    opacity: 0.5;
    transition: opacity 0.3s;
}

.res-add:hover {
    opacity: 1;
}

/* 左侧辅助菜单 */
.left-bar {
    position: absolute;
    left: 40px;
    bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 10;
}

.left-btn {
    width: 54px;
    height: 54px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
}

.left-btn:hover {
    background: rgba(247, 211, 88, 0.1);
    border-color: #f7d358;
    transform: translateY(-5px);
}

.left-btn img {
    width: 24px;
    height: 24px;
    filter: brightness(0.9);
}

/* 右侧主菜单区 */
.right-zone {
    position: absolute;
    right: 60px;
    bottom: 60px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 40px;
    z-index: 10;
}

.menu-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px 25px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
    border-right: 3px solid transparent;
    cursor: pointer;
    transition: all 0.3s;
}

.menu-item:hover {
    background: linear-gradient(90deg, rgba(247, 211, 88, 0.1) 0%, rgba(247, 211, 88, 0) 100%);
    border-right-color: #f7d358;
    transform: translateX(-10px);
}

.menu-item span {
    color: #fff;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 2px;
}

.menu-icon-bg {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.menu-icon-bg img {
    width: 32px;
    height: 32px;
}

/* 出击按钮 - 戏剧化设计 */
.start-btn-container {
    width: 280px;
    height: 100px;
    cursor: pointer;
}

.start-btn {
    width: 100%;
    height: 100%;
    background: #f7d358;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
    transition: all 0.3s;
}

.start-btn:hover {
    background: #fff;
    transform: skew(-2deg) scale(1.05);
}

.start-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
}

.start-text {
    font-size: 32px;
    font-weight: 900;
    color: #000;
}

.start-sub {
    font-size: 12px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.6);
    letter-spacing: 3px;
    margin-top: -5px;
}

.start-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: sweep 3s infinite;
}

@keyframes sweep {
    0% {
        left: -100%;
    }

    50% {
        left: 100%;
    }

    100% {
        left: 100%;
    }
}
</style>
