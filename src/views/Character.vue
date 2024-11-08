<script setup lang="ts">
    import { ElCard, ElRow, ElCol, ElScrollbar, ElImage, ElDescriptions, ElDescriptionsItem, ElDialog, ElForm, ElFormItem, ElSlider } from 'element-plus';
    import { CharacterType } from '../js/character';
    import { useSaveStore } from '../js/store';
    import { icons } from '../js/utils';
    import { ref, watch } from 'vue';
    import sbutton from '../components/sbutton.vue'

    const save = useSaveStore();
    var show_info = ref(false);
    var show_up_character = ref(false);
    var n = ref(0);

    const c2e = {
        [CharacterType.Fire]: icons.element.fire,
        [CharacterType.Grass]: icons.element.grass,
        [CharacterType.LiangZi]: icons.element.liangzi,
        [CharacterType.Nihility]: icons.element.nihility,
        [CharacterType.Physics]: icons.element.physics,
        [CharacterType.Thunder]: icons.element.thunder,
        [CharacterType.Water]: icons.element.water,
    }

    var data = save.characters.get_all();
    data.reverse();

    var now_character = ref(data[0]);

    watch(save.characters.characters, () => {

        data = save.characters.get_all();
        data.reverse();
    });

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
                        <el-image :src="c2e[item.type]"
                            style="margin-right: 10px;" class="type"></el-image>
                        <h3 class="name" style="margin: 0;">{{ item.name }}</h3>
                    </div>
                </el-card>
                <div v-else class="container">
                    你还没有角色
                </div>
            </el-scrollbar>

        </el-col>

        <el-col :span="21" class="content">
            <div class="verticalBar"></div>
            <el-descriptions v-if="now_character" border size="large" :column="4">

                <el-descriptions-item label="名字">{{ now_character.name }}</el-descriptions-item>
                <el-descriptions-item label="属性">
                    <el-image :src="c2e[now_character.type]" class="type"/>
                </el-descriptions-item>

                <el-descriptions-item label="等级">{{ now_character.level }}&nbsp;&nbsp;&nbsp;&nbsp;<sbutton
                        @click="show_up_character = true;">升级</sbutton></el-descriptions-item>
                <el-descriptions-item label="详细信息">
                    <sbutton class="show_info" @click="show_info = true">显示</sbutton>
                </el-descriptions-item>


                <el-descriptions-item label="介绍" :span="4">{{ now_character.desc }}</el-descriptions-item>

            </el-descriptions>

            <div v-else class="container">
                <h1>你还没有角色</h1>
            </div>

        </el-col>
    </el-row>

    <el-dialog v-model="show_info" title="角色信息" width="50%">
        <el-scrollbar>
            <el-descriptions border :column="1" class="info">
                <el-descriptions-item label="经验">{{ now_character.xp }}</el-descriptions-item>
                <el-descriptions-item label="生命">{{ now_character.hp }}</el-descriptions-item>
                <el-descriptions-item label="攻击力">{{ now_character.atk }}</el-descriptions-item>
                <el-descriptions-item label="防御力">{{ now_character.def_ }}</el-descriptions-item>
                <el-descriptions-item label="速度">{{ now_character.speed }}</el-descriptions-item>
            </el-descriptions>
        </el-scrollbar>
    </el-dialog>

    <el-dialog v-model="show_up_character" title="角色升级">
        <el-form>
            <el-form-item label="据下一级所需的经验: ">
                <span>{{ Math.ceil(now_character.level_xp()) - now_character.xp }} </span>
            </el-form-item>
            <el-form-item label="数量：" v-if="save.things.get('EXP') > 0">
                <el-slider v-model="n" :min="1" :max="save.things.get('EXP')" show-input />
            </el-form-item>

            
        </el-form>


    </el-dialog>

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

    .show_info {
        width: 100%;
        height: 100%;
    }

    .el-popper {
        color: #000;
    }

    .type {
        width: 25px;
        height: 25px;
        margin-right: 10px;
    }

</style>