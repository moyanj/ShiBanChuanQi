<script lang="ts" setup>
    import { ElButton, ElRow, ElMessage } from "element-plus";
    import { useSaveStore } from "../js/store";
    import { wish_list } from "../js/character_info";
    import { MersenneTwister } from "../js/utils";
    import { ThingList } from "../js/things";
    import { characters } from "../js/character_info";

    const saveStore = useSaveStore();
    const random = new MersenneTwister();

    function f(x: number): number {
        const value = 0.0001 + (Math.exp(x / 25) / 100);
        const r = (value / 4); // 计算结果
        console.log("函数结果：", r);
        console.log("抽数", x);
        return r;
    }


    function wish() {
        if (saveStore.things.get("XinHuo") < 180) {
            ElMessage({
                message: "星火不足，无法抽奖",
                type: "error",
            });
            return;
        }
        saveStore.things.remove("XinHuo", 180);

        saveStore.n_wish++;
        saveStore.wish_number++;

        let n: number = random.random();
        console.log("随机结果", n);
        if (n <= f(saveStore.n_wish)) {
            // 随机从wish_list里面拿
            let wish_item = random.random_choice(wish_list);
            console.log(wish_item);
            if (wish_item in characters) {
                if (!saveStore.characters.is_in(wish_item)) {
                    ElMessage({
                        message: "恭喜你，获得了" + wish_item,
                        type: "success",
                    });
                    saveStore.characters.add(new characters[wish_item]());
                } else {
                    ElMessage({
                        message: "恭喜你，获得了" + wish_item + "，但是你已经拥有了，无法再次获得",
                        type: "success",
                    });
                }
            } else if (wish_item in ThingList) {
                ElMessage({
                    message: "恭喜你，获得了" + wish_item,
                    type: "success",
                });
                saveStore.things.add(new ThingList[wish_item]());
            } else {

                ElMessage({
                    message: "恭喜你，获得了" + wish_item + "，但是这个物品不存在，无法获得",
                    type: "success",
                });
            }
            saveStore.n_wish = 0;

        } else {
            console.log("未抽到");
            ElMessage({
                message: "你什么也没抽到",
                type: "success",
                duration: 1500,
            });
        }
    }

</script>

<template>
    <div class="container">
        <el-row>
            <el-button type="primary" @click="wish">点击抽卡</el-button>
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