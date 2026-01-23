<script lang="ts" setup>
import { ElRow, ElMessage, ElScrollbar, ElImage } from "element-plus";
import sbutton from "../components/sbutton.vue";
import svideo from "../components/svideo.vue";
import 'video.js/dist/video-js.css';

import { useSaveStore, useDataStore } from "../js/stores";
import { MersenneTwister, icons } from "../js/utils";
import icon_xinhuo from "../assets/things/XinHuo.png";
import { characters, CharacterType } from "../js/character";
import { ConsumableItems } from "../js/item";
import { ref, computed } from "vue";
import wish_bg from "../assets/bg/wish.jpg";

const saveStore = useSaveStore();
const dataStore = useDataStore();

const player_conf = {
    muted: false,
    controls: false,
};

const player = ref();
const show_ani = ref(false);
const show_result = ref(false);
const show_skip = ref(false);
const result = ref<any[]>([]);
const count_XinHuo = ref(saveStore.things.get("XinHuo"));

const random = new MersenneTwister();
const wish_list = Object.keys(characters);

const c2e: { [key in CharacterType]: string } = {
    [CharacterType.Fire]: icons.element.fire,
    [CharacterType.Grass]: icons.element.grass,
    [CharacterType.LiangZi]: icons.element.liangzi,
    [CharacterType.Nihility]: icons.element.nihility,
    [CharacterType.Physics]: icons.element.physics,
    [CharacterType.Thunder]: icons.element.thunder,
    [CharacterType.Water]: icons.element.water,
};

function f(x: number): number {
    const H = Math.min(0.0001 + (Math.exp(x / 35) / 175), 1);
    const B = 0.0003 * Math.max(Math.sin(Math.PI * x / 5 - x / 2), 0);
    const P = Math.min(H + B, 1);
    return P;
}

function run(n: number = 1) {
    const cost = 280 * n;
    if (saveStore.things.get("XinHuo") < cost) {
        ElMessage({
            message: "星火不足，无法抽奖",
            type: "error",
        });
        return;
    }

    show_ani.value = true;
    player.value.player.play();
    show_skip.value = true;
    player.value.player.on("ended", () => {
        player.value.player.off("ended");
        show_ani.value = false;
        show_skip.value = false;
        wish(n);
    });
}

function wish(n: number = 1) {
    const cost = 280 * n;
    saveStore.things.remove("XinHuo", cost);
    // saveStore.wish_number += n; // Avoid double increment if handled inside loop

    result.value = [];
    count_XinHuo.value = saveStore.things.get("XinHuo");

    for (let i = 1; i <= n; i++) {
        saveStore.n_wish++;
        saveStore.wish_number++; // increment total pulls
        const randVal = random.random();
        const p5base = f(saveStore.n_wish);

        // 如果 randVal 在 [0, p5base] 范围内，触发 5 星奖励（角色或道具）
        if (randVal <= p5base) {
            saveStore.n_wish = 0;
            // 角色占 75%，道具占 25%
            if (random.random() <= 0.75) {
                const wish_item_key = random.random_choice(wish_list);
                const isNew = !saveStore.characters.is_in(wish_item_key);
                const charObj = new characters[wish_item_key]();
                if (isNew) {
                    saveStore.characters.add(charObj);
                }
                result.value.push({
                    type: 'character',
                    character: charObj,
                    isNew: isNew,
                    rarity: 5
                });
            } else {
                const fiveStarItems = Object.values(ConsumableItems).filter(item => item.rarity === 5);
                const item = random.random_choice(fiveStarItems);
                saveStore.items[item.id] = (saveStore.items[item.id] || 0) + 1;
                result.value.push({
                    type: 'item',
                    item: item,
                    rarity: 5
                });
            }
        } else if (randVal <= p5base + 0.07) {
            // 4-star Item (概率 7%)
            const fourStarItems = Object.values(ConsumableItems).filter(item => item.rarity === 4);
            const item = random.random_choice(fourStarItems);
            saveStore.items[item.id] = (saveStore.items[item.id] || 0) + 1;
            result.value.push({
                type: 'item',
                item: item,
                rarity: 4
            });
        } else if (randVal <= p5base + 0.07 + 0.15) {
            // 3-star Item (概率 15%)
            const threeStarItems = Object.values(ConsumableItems).filter(item => item.rarity === 3);
            const item = random.random_choice(threeStarItems);
            saveStore.items[item.id] = (saveStore.items[item.id] || 0) + 1;
            result.value.push({
                type: 'item',
                item: item,
                rarity: 3
            });
        } else {
            // 无奖励（或可以作为普通 3 星掉落处理）
            result.value.push({
                type: 'item',
                item: { name: '无名词条', rarity: 3 },
                rarity: 3
            });
        }
    }
    show_result.value = true;
}

function skip() {
    let end = player.value.player.duration();
    player.value.player.currentTime(end);
}

function closeResult() {
    show_result.value = false;
}

const getIllustration = (char: any) => {
    return `illustrations/${char.inside_name}.jpg`;
};

const getAvatar = (char: any) => {
    // Basic fallback if needed, but we'll mostly use illustrations
    return icons.character;
};

</script>

<template>
    <div class="wish-container" :style="{ backgroundImage: `url(${wish_bg})` }">

        <!-- Header: Currency and Stats -->
        <div class="wish-header">
            <div class="currency-display">
                <div class="currency-item">
                    <img :src="icon_xinhuo" class="currency-icon" />
                    <div class="currency-info">
                        <span class="currency-value">{{ count_XinHuo }}</span>
                        <span class="currency-label">星火</span>
                    </div>
                </div>
            </div>
            <div class="wish-stats">
                <div class="stat-item">
                    <span class="label">总祈愿次数</span>
                    <span class="value">{{ saveStore.wish_number }}</span>
                </div>
                <div class="stat-item">
                    <span class="label">保底进度</span>
                    <span class="value">{{ saveStore.n_wish }}</span>
                </div>
            </div>
        </div>

        <!-- Main Banner Content -->
        <div class="wish-main">
            <div class="banner-box">
                <h1 class="banner-title">星火祈愿</h1>
                <p class="banner-subtitle">在此寻获命运中的伙伴</p>
                <div class="banner-decorative">
                    <div class="line"></div>
                    <div class="diamond">✦</div>
                    <div class="line"></div>
                </div>
            </div>
        </div>

        <!-- Footer: Action Buttons -->
        <div class="wish-footer">
            <div class="btn-group">
                <button class="draw-button single" @click="run(1)">
                    <span class="text">祈愿一次</span>
                    <span class="cost">
                        <img :src="icon_xinhuo" />
                        280
                    </span>
                </button>
                <button class="draw-button multi" @click="run(10)">
                    <span class="text">祈愿十次</span>
                    <span class="cost">
                        <img :src="icon_xinhuo" />
                        2800
                    </span>
                </button>
            </div>

            <div class="dev-actions" v-if="dataStore.is_dev">
                <sbutton type="primary" size="small" @click="run(100)">百连祈愿 (DEV)</sbutton>
                <sbutton type="primary" size="small" @click="run(2500)">超级祈愿 (DEV)</sbutton>
            </div>
        </div>

        <!-- Animation Video Layer -->
        <div class="ani-layer" v-show="show_ani">
            <svideo :options="player_conf" class="ani-video" ref="player">
                <source src="/video/wish.mp4" type="video/mp4">
            </svideo>
            <button class="skip-btn" v-show="show_skip" @click="skip">
                <el-image :src="icons.skip" class="skip-icon" />
                <span>跳过动画</span>
            </button>
        </div>

        <!-- Result Overlay -->
        <Transition name="fade-scale">
            <div v-if="show_result" class="result-overlay" @click.self="closeResult">
                <div class="result-container">
                    <div class="result-header">
                        <h2>祈愿结果</h2>
                        <div class="decor-line"></div>
                    </div>

                    <el-scrollbar max-height="75vh" class="result-scroll">
                        <div class="result-grid" :class="{ 'single-item': result.length === 1 }">
                            <div v-for="(item, index) in result" :key="index" class="result-card"
                                :class="['rarity-' + item.rarity]" :style="{ '--delay': index * 0.05 + 's' }">

                                <template v-if="item.type === 'character'">
                                    <div class="card-inner">
                                        <div class="char-ill-wrap">
                                            <el-image :src="getIllustration(item.character)" fit="cover"
                                                class="char-ill">
                                                <template #error>
                                                    <div class="ill-placeholder">
                                                        <el-image :src="c2e[item.character.type]" class="bg-element" />
                                                        <span>{{ item.character.name }}</span>
                                                    </div>
                                                </template>
                                            </el-image>
                                        </div>
                                        <div class="char-meta">
                                            <el-image :src="c2e[item.character.type]" class="element-icon" />
                                            <span class="name">{{ item.character.name }}</span>
                                        </div>
                                        <div v-if="item.isNew" class="new-tag">NEW</div>
                                        <div class="rarity-stars">{{ '★'.repeat(item.rarity) }}</div>
                                    </div>
                                </template>
                                <template v-else-if="item.type === 'item'">
                                    <div class="card-inner item-card">
                                        <div class="item-icon-wrap">
                                            <div class="item-icon">✦</div>
                                            <!-- <el-image :src="item.item.icon" class="item-icon-img" /> -->
                                        </div>
                                        <div class="char-meta">
                                            <span class="name">{{ item.item.name }}</span>
                                        </div>
                                        <div class="rarity-stars">{{ '★'.repeat(item.rarity) }}</div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </el-scrollbar>

                    <div class="result-footer">
                        <button class="close-button" @click="closeResult">点击空白处关闭</button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.wish-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    color: white;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    background-size: cover;
    background-position: center;
}

/* Header */
.wish-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 30px 50px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    box-sizing: border-box;
    pointer-events: none;
}

.currency-display {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 50px;
    padding: 5px 25px 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: auto;
}

.currency-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.currency-icon {
    width: 40px;
    height: 40px;
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
}

.currency-info {
    display: flex;
    flex-direction: column;
}

.currency-value {
    font-size: 20px;
    font-weight: bold;
    color: #ffd700;
}

.currency-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
}

.wish-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: right;
}

.stat-item {
    background: rgba(0, 0, 0, 0.3);
    padding: 5px 15px;
    border-radius: 4px;
    border-right: 4px solid #409EFF;
}

.stat-item .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-right: 15px;
}

.stat-item .value {
    font-weight: bold;
    color: #fff;
}

/* Main Content */
.wish-main {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.banner-box {
    text-align: center;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.banner-title {
    font-size: 80px;
    margin: 0;
    letter-spacing: 10px;
    background: linear-gradient(to bottom, #fff, #a5c7ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.banner-subtitle {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.8);
    margin: 10px 0 30px;
}

.banner-decorative {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

.banner-decorative .line {
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, transparent, #fff, transparent);
}

.banner-decorative .diamond {
    color: #fff;
    font-size: 24px;
}

/* Footer */
.wish-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 50px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
}

.btn-group {
    display: flex;
    gap: 40px;
}

.draw-button {
    width: 280px;
    height: 70px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.draw-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%) skewX(-15deg);
    transition: transform 0.5s;
}

.draw-button:hover::before {
    transform: translateX(100%) skewX(-15deg);
}

.draw-button:active {
    transform: scale(0.95);
}

.draw-button.single {
    background: #f5f5f5;
    color: #4a4a4a;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.draw-button.single .text {
    color: #333;
}

.draw-button.single .cost {
    color: #666;
}

.draw-button.multi {
    background: #ffd700;
    color: #4a3400;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.draw-button.multi .text {
    color: #4a3400;
}

.draw-button.multi .cost {
    color: #6b4c00;
}

.draw-button .text {
    font-size: 18px;
    font-weight: bold;
}

.draw-button .cost {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    margin-top: 2px;
    opacity: 0.8;
}

.draw-button .cost img {
    width: 18px;
    height: 18px;
}

.dev-actions {
    display: flex;
    gap: 15px;
}

/* Video Animation Layer */
.ani-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background: black;
}

.ani-video {
    width: 100%;
    height: 100%;
}

.skip-btn {
    position: absolute;
    top: 30px;
    right: 50px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    padding: 8px 20px;
    border-radius: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background 0.3s;
    z-index: 1001;
}

.skip-btn:hover {
    background: rgba(0, 0, 0, 0.8);
}

.skip-icon {
    width: 20px;
    height: 20px;
}

/* Result Overlay */
.result-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.result-container {
    width: 90%;
    max-width: 1400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.result-header h2 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #ffd700;
    letter-spacing: 5px;
}

.decor-line {
    height: 2px;
    background: linear-gradient(to right, transparent, #ffd700, transparent);
    margin-bottom: 40px;
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 25px;
    padding: 20px;
}

.result-grid.single-item {
    grid-template-columns: 1fr;
    max-width: 300px;
    margin: 0 auto;
}

/* Result Card */
.result-card {
    position: relative;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    opacity: 0;
    transform: translateY(30px);
    animation: cardAppear 0.5s ease forwards;
    animation-delay: var(--delay);
}

@keyframes cardAppear {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.char-ill-wrap {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.char-ill {
    width: 100%;
    height: 100%;
    transition: transform 0.5s;
}

.result-card:hover .char-ill {
    transform: scale(1.1);
}

.ill-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    color: #fff;
    font-size: 24px;
}

.bg-element {
    width: 120px;
    height: 120px;
    opacity: 0.1;
    position: absolute;
}

.char-meta {
    padding: 15px;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    gap: 10px;
}

.element-icon {
    width: 24px;
    height: 24px;
}

.char-meta .name {
    font-size: 18px;
    font-weight: bold;
}

.new-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    background: #ff4757;
    padding: 2px 10px;
    font-size: 12px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
}

.rarity-stars {
    padding: 5px;
    color: #ffd700;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.4);
}

.trash {
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #2f3542, #1e272e);
}

.trash-icon {
    font-size: 60px;
    color: rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;
}

.trash-name {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.5);
}

/* Rarity specific card styling */
.rarity-5 {
    border: 2px solid rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.rarity-5 .char-meta {
    background: linear-gradient(to top, rgba(255, 215, 0, 0.3), rgba(0, 0, 0, 0.8));
}

.result-footer {
    margin-bottom: 20px;
}

.close-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 12px 40px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
    letter-spacing: 1px;
}

.close-button:hover {
    color: #fff;
    border-color: #fff;
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.5s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(1.1);
}

@media screen and (max-width: 1200px) {
    .result-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media screen and (max-width: 900px) {
    .result-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .banner-title {
        font-size: 60px;
    }
}

@media screen and (max-width: 600px) {
    .result-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .btn-group {
        flex-direction: column;
        gap: 15px;
    }
}
</style>