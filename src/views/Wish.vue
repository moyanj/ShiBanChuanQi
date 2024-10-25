<script lang="ts" setup>
    import { ElButton, ElRow } from "element-plus";
    import { useSaveStore } from "../js/store";
    import { wish_list } from "../js/character_info";
    import { MersenneTwister } from "../js/utils";
    //import { ThingList } from "../js/things";
    // import { characters } from "../js/character_info";

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
        saveStore.n_wish++;

        let n: number = random.random();
        console.log("随机结果", n);
        if (n <= f(saveStore.n_wish)) {
            // 随机从wish_list里面拿
            let wish_item = random.random_choice(wish_list);
            console.log(wish_item);
            alert(wish_item);
            saveStore.n_wish = 0;

        } else {
            console.log("未抽到");
            // alert("未抽到");
        }
    }

</script>

<template>
    <div class="container">
        <el-row>
            <el-button type="primary" @click="wish">点击抽卡</el-button>
        </el-row>
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