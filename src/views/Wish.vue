<script lang="ts" setup>
    import { ElButton, ElRow } from "element-plus";
    import { useSaveStore } from "../js/store";
    import { wish_list } from "../js/character_info";
    //import { ThingList } from "../js/things";
    // import { characters } from "../js/character_info";

    const saveStore = useSaveStore();
    function f(x: number): number {
        let r = x * (Math.log(x) / 50) + 0.01;
        console.log("函数结果：", r);
        console.log("抽数", x);
        return r;
    }

    function wish() {
        saveStore.n_wish++;
        let n: number = Math.random();
        console.log("随机结果", n);
        if (n <= f(saveStore.n_wish)) {
            // 随机从wish_list里面拿
            let wish_item = wish_list[Math.floor(Math.random() * wish_list.length)];
            console.log(wish_item);
            alert(wish_item);
            saveStore.n_wish = 0;
            
        } else {
            console.log("未抽到");
            alert("未抽到");
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