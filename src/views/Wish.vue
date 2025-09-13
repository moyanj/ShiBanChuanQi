<script lang="ts" setup>
import { ElRow, ElMessage, ElDialog, ElScrollbar, ElTable, ElTableColumn, ElImage } from "element-plus";
import sbutton from "../components/sbutton.vue";
import svideo from "../components/svideo.vue";
import 'video.js/dist/video-js.css';

import { useSaveStore, useDataStore, APM } from "../js/store";
import { MersenneTwister, icons } from "../js/utils";
import { ThingList } from "../js/things";
import { characters } from "../js/character";
import { ref } from "vue";


const saveStore = useSaveStore();
const dataStore = useDataStore();
const player_conf = {
    //autoplay: true,
    muted: false,
    controls: false,
    //fullscreen: true
}

var player = ref();
var show_ani = ref(false);
var show_result = ref(false);
var show_skip = ref(false);
var result = ref([])
var count_XinHuo = ref(saveStore.things.get("XinHuo"));

const random = new MersenneTwister();
const wish_list = []
wish_list.push(...Object.keys(characters))

function f(x: number): number {
    const value = 0.0001 + (Math.exp(x / 35) / 175);
    const r = (value / 1); // 计算结果

    return r;
}

function run(n: number = 1) {

    const cost = 280 * n; // 十连抽消耗的星火
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
        player.value.player.off("ended")
        show_ani.value = false;
        show_skip.value = false;
        wish(n);
    })


}

function wish(n: number = 1) {

    const cost = 280 * n; // 十连抽消耗的星火

    saveStore.things.remove("XinHuo", cost);
    saveStore.wish_number += n; // 更新抽奖次数

    result.value = [];

    count_XinHuo.value = saveStore.things.get("XinHuo");


    for (let i = 1; i < n + 1; i++) {
        saveStore.n_wish++;
        saveStore.wish_number++; // 更新抽奖次数
        const n = random.random();
        if (n <= f(saveStore.n_wish)) {
            saveStore.n_wish = 0; // 重置连续抽奖次数
            const wish_item = random.random_choice(wish_list);

            if (saveStore.characters.is_in(wish_item)) {
                result.value.push({
                    n: i,
                    content: `${new characters[wish_item]().name}（已存在）`
                });

            } else {
                if (wish_item in characters) {
                    let c = new characters[wish_item]();
                    saveStore.characters.add(c);
                    result.value.push({
                        n: i,
                        content: c.name
                    });
                }

            }

        } else {
            result.value.push({
                n: i,
                content: "无"
            });
        }
    }
    show_result.value = true;
}

function skip() {
    let end = player.value.player.duration();
    player.value.player.currentTime(end)
}

</script>

<template>
    <div class="container">
        <sbutton id="skip" v-show="show_skip" @click="skip"><el-image :src="icons.skip" class="icon" /></sbutton>
        <el-row>
            <sbutton type="primary" @click="run(1)">点击抽卡</sbutton>
            <sbutton type="primary" @click="run(10)">点击抽卡(十连)</sbutton>
            <sbutton type="primary" @click="run(100)">点击抽卡(百连)</sbutton>
            <sbutton type="primary" @click="run(2500)" v-if='dataStore.is_dev'>点击抽卡(二千五百连)</sbutton>
        </el-row>

        <p>据上一次出货的抽数：{{ saveStore.n_wish }}</p>
        <p>总抽数：{{ saveStore.wish_number }}</p>
        <p>星火数量：{{ count_XinHuo }} 约{{ Math.floor(count_XinHuo / 280) }}抽</p>
        <p></p>

        <div id="captcha"></div>

        <!-- 抽卡动画 -->
        <svideo :options="player_conf" class="ani" :hidden="!show_ani" ref="player">
            <source src="/video/wish.mp4" type="video/mp4">
        </svideo>

        <el-dialog v-model="show_result" title="抽卡结果">
            <el-scrollbar height="40vh">
                <el-table :data="result" border>
                    <el-table-column prop="n" label="抽数" />
                    <el-table-column prop="content" label="内容" />
                </el-table>
            </el-scrollbar>
        </el-dialog>

    </div>
</template>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: url('../assets/bg/wish.jpg');
    background-size: cover;
    background-position: center;
    filter: blur(5px);
}

.ani {
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 1001;
    left: 0;
    top: 0;
}

.icon {
    width: 20px;
    height: 20px;
}

#skip {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1002;
}
</style>