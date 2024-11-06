<script lang="ts" setup>
    import { ElRow, ElMessage } from "element-plus";
    import sbutton from "../components/sbutton.vue";
    import svideo from "../components/svideo.vue";
    import 'video.js/dist/video-js.css';

    import { useSaveStore, useDataStore, APM } from "../js/store";
    import { MersenneTwister } from "../js/utils";
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
    var show_ani = ref(true)

    const random = new MersenneTwister();
    const wish_list = []
    wish_list.push(...Object.keys(characters))

    function f(x: number): number {
        const value = 0.0001 + (Math.exp(x / 35) / 175);
        const r = (value / 1); // 计算结果

        return r;
    }

    function run(n: number = 1) {

        const cost = 180 * n; // 十连抽消耗的星火
        if (saveStore.things.get("XinHuo") < cost) {
            ElMessage({
                message: "星火不足，无法抽奖",
                type: "error",
            });
            return;
        }

        show_ani.value = false;
        player.value.player.play();
        player.value.player.on("ended", () => {
            show_ani.value = true;
            wish(n);
        })
    }

    function wish(n: number = 1) {

        const cost = 180 * n; // 十连抽消耗的星火

        saveStore.things.remove("XinHuo", cost);
        saveStore.wish_number += n; // 更新抽奖次数

        let results = [];

        for (let i = 0; i < n; i++) {
            saveStore.n_wish++;
            saveStore.wish_number++; // 更新抽奖次数
            const n = random.random();
            if (n <= f(saveStore.n_wish)) {
                saveStore.n_wish = 0; // 重置连续抽奖次数
                const wish_item = random.random_choice(wish_list);
                results.push(wish_item);
            } else {
                results.push(null)
            }
        }

        // 处理结果
        results.forEach(item => {
            if (item) {
                if (item in characters) {

                    if (!saveStore.characters.is_in(item)) {
                        let c = new characters[item]();
                        ElMessage({
                            message: `恭喜你，获得了${c.name}`,
                            type: "success",
                        });
                        saveStore.characters.add(c);
                    } else {
                        let c = new characters[item]();
                        ElMessage({
                            message: `恭喜你，获得了${c.name}，但是你已经拥有了，无法再次获得`,
                            type: "info",
                        });
                        saveStore.things.add(new ThingList["XinHuo"](), 180)
                    }
                } else if (item in ThingList) {
                    ElMessage({
                        message: `恭喜你，获得了${item}`,
                        type: "success",
                    });
                    saveStore.things.add(new ThingList[item]());
                } else {
                    ElMessage({
                        message: `恭喜你，获得了${item}，但是这个物品不存在，无法获得`,
                        type: "warning",
                    });
                }
            } else {
                if (n == 1) {
                    ElMessage({
                        message: "你什么也没抽到",
                        type: "info",
                        duration: 1000,
                    });
                }

            }
        });
    }

</script>

<template>
    <div class="container">
        <el-row>
            <sbutton type="primary" @click="run(1)">点击抽卡</sbutton>
            <sbutton type="primary" @click="run(10)">点击抽卡(十连)</sbutton>
            <sbutton type="primary" @click="run(2500)" v-if='dataStore.is_dev'>点击抽卡(二千五百连)</sbutton>
        </el-row>

        <p>据上一次出货的抽数：{{ saveStore.n_wish }}</p>
        <p>总抽数：{{ saveStore.wish_number }}</p>
        <svideo :options="player_conf" class="ani" :hidden="show_ani" ref="player">
            <source src="/video/wish.mp4" type="video/mp4">
        </svideo>
    </div>
</template>

<style scoped lang="scss">
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
    }

    .ani {
        position: fixed;
        width: 100vw;
        height: 100vh;
        z-index: 11222;
        left: 0;
        top: 0;
    }
</style>