<script setup lang="ts">
    import { ElCard, ElRow, ElCol, ElScrollbar, ElImage } from 'element-plus';
    import { CharacterType } from '../js/character';
    import { useSaveStore } from '../js/store';
    import { icons } from '../js/utils';

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

    const data = save.characters.characters;
</script>

<template>
    <el-row>
        <el-col :span="3">
            <el-scrollbar style="" class="menu">
                <el-card class="item" v-for="item in data">
                    <el-image :src="c2e[item.type]" width="15px" height="15px"></el-image>
                    <span class="name">{{item.name}}</span>
                </el-card>
            </el-scrollbar>
        </el-col>
        <div class="verticalBar"></div>
        <el-col :span="21">
            <el-button type="primary">Primary</el-button>
        </el-col>
    </el-row>

</template>

<style scoped lang="scss">
    .menu {
        height: 100vh;
        width: 100%;
    }

    .verticalBar {
        width: 1px;
        height: 95vh;
        background: #a9a9a9;
        display: inline-block;
        margin-left: 5px;
        margin-right: 5px;
    }

    .item {
        margin-right: 10px;
        background-color: #26272b;
        margin-bottom: 10px;
    }

</style>