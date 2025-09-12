<script setup lang="ts">
import { ElCard, ElRow, ElCol, ElScrollbar, ElImage, ElDescriptions, ElDescriptionsItem, ElDialog, ElForm, ElFormItem, ElSlider } from 'element-plus';
import { CharacterType } from '../js/character';
import { useSaveStore } from '../js/store';
import { icons } from '../js/utils';
import { ref, watch, computed } from 'vue'; // 引入 computed
import sbutton from '../components/sbutton.vue'


const save = useSaveStore();
var show_info = ref(false);
var show_up_character = ref(false);
var show_ill = ref(false);
var n = ref(0);
var ill = ref();

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
    if (data.length > 0) {
        now_character.value = data[0];
    } else {
        now_character.value = null;
    }
});

const change_character = (content) => {
    now_character.value = content;
};

const level_up = () => {
    save.things.remove("EXP", n.value)
    now_character.value.level_up(n.value);
    save.characters.update(now_character.value)
}
watch(now_character, () => {
    if (now_character.value) { // 确保 now_character.value 不为空
        ill.value = `illustrations/${now_character.value.inside_name}.jpg`;
    }
});

// 计算属性，判断当前角色卡片是否被选中
const isSelected = (item) => {
    return now_character.value && now_character.value.inside_name === item.inside_name; // 假设每个角色都有一个唯一的id
};

</script>

<template>
    <el-row>
        <el-col :span="3">
            <el-scrollbar class="menu">
                <el-card class="item" v-for="item in data" :key="item.inside_name" @click="change_character(item)"
                    :class="{ 'selected': isSelected(item) }" v-if="data.length > 0">
                    <div class="item-content">
                        <el-image :src="c2e[item.type]" style="margin-right: 10px;" class="type"></el-image>
                        <h4 class="name" style="margin: 0;">{{ item.name }}</h4>
                    </div>
                </el-card>
                <div v-else class="container">
                    <img :src="icons.empty" style="width: 100px;height: auto;" />
                    你还没有角色
                </div>
            </el-scrollbar>

        </el-col>

        <el-col :span="21" class="content">
            <div class="verticalBar"></div>
            <el-descriptions v-if="now_character" border size="large" :column="4" width="100%">

                <el-descriptions-item label="名字">{{ now_character.name }}</el-descriptions-item>
                <el-descriptions-item label="属性">
                    <el-image :src="c2e[now_character.type]" class="type" />
                </el-descriptions-item>

                <el-descriptions-item label="等级">{{ now_character.level }}&nbsp;&nbsp;&nbsp;&nbsp;<sbutton
                        @click="show_up_character = true;">升级</sbutton></el-descriptions-item>
                <el-descriptions-item label="详细信息">
                    <sbutton class="show_info" @click="show_info = true">显示</sbutton>
                </el-descriptions-item>


                <el-descriptions-item label="介绍" :span="4">{{ now_character.desc }} <sbutton @click="show_ill = true">
                        查看立绘</sbutton></el-descriptions-item>
                <el-descriptions-item label="普攻" :span="4">{{ now_character.general_name }} {{
                    now_character.general_desc }}</el-descriptions-item>
                <el-descriptions-item label="技能" :span="4">{{ now_character.skill_name }} {{ now_character.skill_desc
                }}</el-descriptions-item>
                <el-descriptions-item label="爆发技" :span="4">{{ now_character.super_skill_name }} {{
                    now_character.super_skill_desc }}</el-descriptions-item>
            </el-descriptions>

            <div v-else class="container">
                <img :src="icons.empty" style="width: 200px;height: auto;" />
                <h1>你还没有角色</h1>
            </div>

        </el-col>
    </el-row>

    <el-dialog v-model="show_info" title="角色信息" width="50%">
        <el-scrollbar>
            <el-descriptions border :column="1" class="info">
                <el-descriptions-item label="经验">{{ Math.round(now_character.xp) }}</el-descriptions-item>
                <el-descriptions-item label="生命">{{ Math.round(now_character.hp) }} / {{
                    Math.round(now_character.max_hp) }}</el-descriptions-item>
                <el-descriptions-item label="攻击力">{{ Math.round(now_character.atk)
                }}</el-descriptions-item>
                <el-descriptions-item label="防御力">{{ Math.round(now_character.def_)
                }}</el-descriptions-item>
                <el-descriptions-item label="速度">{{ Math.round(now_character.speed)
                }}</el-descriptions-item>
                <el-descriptions-item label="好感度">{{ Math.round(now_character.favorability) }}</el-descriptions-item>
            </el-descriptions>
        </el-scrollbar>
    </el-dialog>

    <el-dialog v-model="show_up_character" title="角色升级">
        <el-form>
            <el-form-item label="据下一级所需的经验: ">
                <span>{{ Math.ceil(now_character.level_xp(now_character.level) - now_character.xp) }} </span>
            </el-form-item>
            <el-form-item label="数量：" v-if="save.things.get('EXP') > 0">
                <el-slider v-model="n" :min="1" :max="save.things.get('EXP')" show-input />
            </el-form-item>
            <el-form-item label="数量：" v-else>
                <span>你没有EXP</span>
            </el-form-item>
            <el-form-item v-if="save.things.get('EXP') > 0">
                <sbutton @click="level_up">升级</sbutton>
            </el-form-item>


        </el-form>
    </el-dialog>

    <el-dialog v-model="show_ill" title="角色立绘" top="5vh">
        <el-image :src="ill" fit="cover" class="ill">
            <template #error>
                <h4 align="center">该角色暂无立绘</h4>
            </template>
        </el-image>
    </el-dialog>

</template>

<style scoped>
.menu {
    height: 95vh;
    width: 100%;
}

.item {
    margin-right: 10px;
    background-color: #26272b;
    margin-bottom: 10px;
    /* 新增：添加过渡效果，使选中状态更平滑 */
    transition: border 0.3s ease-in-out;
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

.ill {
    width: auto;
    height: 75vh;
}

.selected {
    border: 2px solid whitesmoke;
    /* 调整边框颜色和粗细，使其更明显 */
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    /* 添加一些阴影效果 */
}
</style>
