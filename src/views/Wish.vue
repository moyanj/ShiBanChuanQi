<script lang="ts" setup>
    import { ElButton, ElRow, ElMessage } from "element-plus";
    import { useSaveStore } from "../js/store";
    import { MersenneTwister } from "../js/utils";
    import { ThingList } from "../js/things";
    import { characters } from "../js/character_info";

    const saveStore = useSaveStore();
    const random = new MersenneTwister();
    const wish_list = []
    wish_list.push(...Object.keys(characters))

    function f(x: number): number {
        const value = 0.0001 + (Math.exp(x / 25) / 100);
        const r = (value / 4); // 计算结果
        console.log("函数结果：", r);
        console.log("抽数", x);
        return r;
    }


    function wish(n:number = 1) {
        const cost = 180*n; // 十连抽消耗的星火
        if (saveStore.things.get("XinHuo") < cost) {
            ElMessage({
                message: "星火不足，无法抽奖",
                type: "error",
            });
            return;
        }

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
                results.push(null); // 没抽到任何物品
            }
        }
        console.log(results)
        // 处理结果
        results.forEach(item => {
            if (item) {
                
                if (item in characters) {
                    if (!saveStore.characters.is_in(item)) {
                        ElMessage({
                            message: `恭喜你，获得了${item}`,
                            type: "success",
                        });
                        saveStore.characters.add(new characters[item]());
                    } else {
                        ElMessage({
                            message: `恭喜你，获得了${item}，但是你已经拥有了，无法再次获得`,
                            type: "info",
                        });
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
                ElMessage({
                    message: "你什么也没抽到",
                    type: "info",
                    duration: 1500,
                });
            }
        });

        


    }

</script>

<template>
    <div class="container">
        <el-row>
            <el-button type="primary" @click="wish(1)">点击抽卡</el-button>
            <el-button type="primary" @click="wish(10)">点击抽卡(十连)</el-button>
        </el-row>

        <p>据上一次出货的抽数：{{ saveStore.n_wish }}</p>
        <p>总抽数：{{ saveStore.wish_number }}</p>

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
</style>