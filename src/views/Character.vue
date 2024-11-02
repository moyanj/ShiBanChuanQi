<script setup lang="ts">
    import { ElCard, ElRow, ElCol, ElScrollbar, ElImage, ElDescriptions, ElDescriptionsItem } from 'element-plus';
    import { CharacterType } from '../js/character';
    import { useSaveStore } from '../js/store';
    import { icons } from '../js/utils';
    import { ref } from 'vue';
    import placeholder from "../assets/placeholder/p300x400.png"

    const save = useSaveStore();

    const c2e = {
        [CharacterType.Fire]: icons.element.fire,
        [CharacterType.Grass]: icons.element.grass,
        [CharacterType.LiangZi]: icons.element.liangzi,
        [CharacterType.Nihility]: icons.element.nihility,
        [CharacterType.Physics]: icons.element.physics,
        [CharacterType.Thunder]: icons.element.thunder,
        [CharacterType.Water]: icons.element.water,
    }

    var data = save.characters.characters;
    var now_character = ref(data[0]);

    const change_character = (content) => {
        now_character.value = content;
    };
</script>

<template>
    <el-row>
        <el-col :span="3">
            <el-scrollbar class="menu">
                <el-card class="item" v-for="item in data" @click="change_character(item)" v-if="data.length > 0">
                    <div class="item-content">
                        <el-image :src="c2e[item.type]" width="15px" height="15px"
                            style="margin-right: 10px;"></el-image>
                        <h3 class="name" style="margin: 0;">{{ item.name }}</h3>
                    </div>
                </el-card>
                <div v-else  class="container">
                    你还没有角色
                </div>
            </el-scrollbar>

        </el-col>

        <el-col :span="21" class="content">
            <div class="verticalBar"></div>
            <el-descriptions v-if="now_character" border size="large">
                
                
                
                <el-descriptions-item label="名字" width="100">{{ now_character.name }}</el-descriptions-item>

                <el-descriptions-item label="属性">
                    <el-image :src="c2e[now_character.type]" width="15px" height="15px" style="margin-right: 10px;" />
                </el-descriptions-item>

                <el-descriptions-item label="等级">{{ now_character.level }}</el-descriptions-item>

            </el-descriptions>
            <div v-else class="container">
                <h1>你还没有角色</h1>
            </div>

        </el-col>
    </el-row>

</template>

<style scoped lang="scss">
    .menu {
        height: 95vh;
        width: 100%;
    }

    .item {
        margin-right: 10px;
        background-color: #26272b;
        margin-bottom: 10px;

    }

    .verticalBar {
        width: 1px;
        height: 95vh;
        background: #a9a9a9;
        display: inline-block;
        margin-left: 5px;
        margin-right: calc(10px + 5px);
    }

    .item-content {
        display: flex;
        align-items: center;
    }

    .content {
        display: flex;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100%;
    }

    .el-descriptions {
        width: 100%;
    }

</style>