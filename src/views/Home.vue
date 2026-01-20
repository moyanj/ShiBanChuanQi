<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSaveStore, useDataStore } from '../js/store';
import { icons } from '../js/utils';
import { ElImage, ElAvatar, ElMessage } from 'element-plus';
import sbutton from '../components/sbutton.vue';
import placeholderImg from '../assets/placeholder/p300x400.png';

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
                        <img :src="typeMap[currentCharacter.type]" class="char-type-icon" v-if="currentCharacter.type && typeMap[currentCharacter.type]" />
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
                        <img src="/things/XinHuo.png" class="res-icon" />
                        <span class="res-value">{{ xinhuo }}</span>
                        <div class="res-add">+</div>
                    </div>
                </div>
            </div>

            <!-- 左侧功能区 -->
            <div class="left-bar">
                <div class="left-btn" @click="navigate('setting')">
                    <img :src="icons.setting" />
                    <span>设置</span>
                </div>
                <div class="left-btn" @click="navigate('about')">
                    <img :src="icons.info" />
                    <span>关于</span>
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
/* 全局字体 */
.dashboard {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    font-family: 'ZiHunJianQi', 'MiSans', sans-serif;
    user-select: none;
    background-color: #1a1a1a;
    /* 更深邃的背景色 */
}

/* 背景层 */
.bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* 使用 assets/bg/home.jpeg */
    background: url('../assets/bg/home.jpeg') no-repeat center center;
    background-size: cover;
    z-index: 0;
    /* 压暗并轻微模糊，突出前景插画 */
    filter: brightness(0.6) blur(2px);
}

/* 看板娘层 */
.kanban-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    /* 提高层级，确保在背景之上 */
    pointer-events: none;

    display: flex;
    align-items: center;
    justify-content: center;
}

.kanban-wrapper {
    position: relative;
    pointer-events: auto;
    /* 移除之前的 opacity 动画依赖，直接显示 */
    animation: fadeIn 0.5s ease-out forwards;
    opacity: 0;
    margin-right: 15vw;
    /* 让其在视觉上偏左，为右侧按钮留出空间 */
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

/* 插画相框效果 */
.kanban-img {
    height: 65vh;
    width: auto;
    display: block;
    /* 确保块级显示 */
    object-fit: cover;
    border-radius: 8px;
    border: 3px solid rgba(255, 255, 255, 0.9);
    box-shadow:
        0 8px 25px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(0, 0, 0, 0.3);

    cursor: pointer;
    background-color: #222;
    /* 图片未加载时的占位色 */
}

.kanban-img:hover {
    transform: scale(1.02);
    box-shadow:
        0 12px 35px rgba(0, 0, 0, 0.7),
        0 0 15px rgba(255, 255, 255, 0.3);
}

.kanban-img:active {
    transform: scale(0.98);
}

/* 角色信息 Banner */
.char-banner {
    position: absolute;
    bottom: 20px;
    left: -40px;
    /* 悬出左侧一点，增加设计感 */
    width: 280px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    border-left: 4px solid #FDD835;
    /* 金色左边框 */
    padding: 15px 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    pointer-events: auto;

    /* 切角设计 (右下角) */
    clip-path: polygon(0 0,
            100% 0,
            100% 85%,
            92% 100%,
            0 100%);
}

.char-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
}

.char-name {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    letter-spacing: 1px;
    font-family: 'MiSans', sans-serif; /* 强制使用全局字体 */
}

.char-type-icon {
    width: 28px;
    height: 28px;
    margin-left: 8px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.char-desc-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.5), transparent);
    margin-bottom: 8px;
}

.char-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
    line-height: 1.4;
}

/* UI 层 */
.ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
    /* 让点击穿透空白区域 */
}

/* 通用 UI 元素可点击 */
.ui-layer>* {
    pointer-events: auto;
}

/* 顶部栏 */
.top-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    box-sizing: border-box;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
}

.player-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.avatar-container {
    position: relative;
}

.avatar-border {
    border: 2px solid #fff;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.level-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: #FFC107;
    color: #000;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    border: 1px solid #fff;
}

.player-details {
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.player-name {
    font-size: 20px;
    font-weight: bold;
}

.player-uid {
    font-size: 12px;
    opacity: 0.8;
}

/* 资源栏 */
.resources {
    display: flex;
    gap: 20px;
}

.res-item {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    border-radius: 20px;
    padding: 5px 15px 5px 5px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.res-icon {
    width: 24px;
    height: 24px;
}

.res-value {
    color: #fff;
    font-weight: bold;
    font-size: 16px;
}

.res-add {
    width: 16px;
    height: 16px;
    background: #fff;
    color: #000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    margin-left: 5px;
    cursor: pointer;
}

/* 左侧栏 */
.left-bar {
    position: absolute;
    left: 40px;
    bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.left-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.left-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.left-btn img {
    width: 20px;
    height: 20px;
    margin-bottom: 2px;
}

.left-btn span {
    font-size: 10px;
    color: #fff;
}

/* 右侧核心区 */
.right-zone {
    position: absolute;
    right: 40px;
    bottom: 40px;
    display: flex;
    align-items: flex-end;
    gap: 30px;
}

/* 垂直菜单 */
.menu-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
    /* 对齐出击按钮中心偏上 */
}

.menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    cursor: pointer;
    transition: transform 0.2s;
}

.menu-item:hover {
    transform: translateX(-10px);
}

.menu-item span {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.menu-icon-bg {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(60, 60, 60, 0.9));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.1);
    transform: skew(-10deg);
}

.menu-icon-bg img {
    width: 32px;
    height: 32px;
    transform: skew(10deg);
    /* 反向倾斜图标 */
}

/* 出击按钮 */
.start-btn-container {
    width: 220px;
    height: 220px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
}

.start-btn-container:hover {
    transform: scale(1.05);
}

.start-btn-container:active {
    transform: scale(0.95);
}

.start-btn {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #FDD835, #F57F17);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba(253, 216, 53, 0.4);
    position: relative;
    overflow: hidden;
    border: 4px solid rgba(255, 255, 255, 0.8);
}

.start-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    transform: rotate(-5deg);
}

.start-text {
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
    letter-spacing: 2px;
}

.start-sub {
    font-size: 16px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 4px;
}

.start-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 60%);
    animation: rotate 10s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* 底部装饰 */
.bottom-deco {
    position: absolute;
    bottom: 20px;
    left: 120px;
    right: 300px;
    height: 30px;
    /* 装饰性线条 */
    background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-preview {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 15px;
    border-radius: 15px;
}

.channel {
    color: #64B5F6;
    margin-right: 5px;
}
</style>
