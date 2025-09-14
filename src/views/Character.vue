<script setup lang="ts">
import {
    ElCard,
    ElRow,
    ElCol,
    ElScrollbar,
    ElImage,
    ElDescriptions,
    ElDescriptionsItem,
    ElDialog,
    ElForm,
    ElFormItem,
    ElSlider,
    ElSelect,
    ElOption
} from 'element-plus';
import { CharacterType, Character } from '../js/character';
import { useSaveStore } from '../js/store';
import { get_character_by_dump, icons } from '../js/utils';
import { ref, watch, computed } from 'vue';
import SButton from '../components/sbutton.vue';
import { Item } from '../js/item';

const save = useSaveStore();

// Ref 定义
const showInfo = ref(false);
const showUpCharacter = ref(false);
const showIll = ref(false);
const levelUpAmount = ref(0); // 经验值数量
const currentIllustration = ref(''); // 立绘路径
const showEquipItemDialog = ref(false); // 控制装备道具对话框显示
const selectedItemToEquip = ref<Item | null>(null); // 选中的要装备的道具

// 将类型定义明确
const c2e: { [key in CharacterType]: string } = {
    [CharacterType.Fire]: icons.element.fire,
    [CharacterType.Grass]: icons.element.grass,
    [CharacterType.LiangZi]: icons.element.liangzi,
    [CharacterType.Nihility]: icons.element.nihility,
    [CharacterType.Physics]: icons.element.physics,
    [CharacterType.Thunder]: icons.element.thunder,
    [CharacterType.Water]: icons.element.water,
};

// 使用计算属性来处理角色列表
const characterList = computed(() => {
    const list = save.characters.get_all().reverse();
    return list;
});

// 当前角色
const nowCharacter = ref<Character | null>(characterList.value.length > 0 ? get_character_by_dump(characterList.value[0]) : null);

// 可供装备的道具列表
const availableItems = computed(() => {
    return save.items.getAll();
});

// 监听角色列表变化
watch(characterList, () => {
    nowCharacter.value = characterList.value.length > 0 ? get_character_by_dump(characterList.value[0]) : null;
});

// 监听当前角色变化，更新立绘
watch(nowCharacter, (newCharacter) => {
    if (newCharacter) {
        currentIllustration.value = `illustrations/${newCharacter.inside_name}.jpg`;
    }
});

// 方法：改变当前角色
const changeCharacter = (characterData: any) => {
    const selectedCharacter = get_character_by_dump(characterData);
    if (selectedCharacter) {
        nowCharacter.value = selectedCharacter;
    }
};

// 方法：升级角色
const levelUp = () => {
    if (!nowCharacter.value) return;
    save.things.remove("EXP", levelUpAmount.value);
    nowCharacter.value.level_up(levelUpAmount.value);
    // 使用类型断言解决类型不匹配问题
    save.characters.update(nowCharacter.value as Character);
};

// 方法：装备道具
const equipItem = () => {
    if (!nowCharacter.value || !selectedItemToEquip.value) return;

    nowCharacter.value.equipped_items.push(selectedItemToEquip.value);
    save.items.remove(selectedItemToEquip.value.id);
    // 使用类型断言解决类型不匹配问题
    save.characters.update(nowCharacter.value as Character);
    showEquipItemDialog.value = false;
    selectedItemToEquip.value = null; // 重置选中道具
};

// 方法：卸下道具
const unequipItem = (item: Item) => {
    if (!nowCharacter.value) return;

    const index = nowCharacter.value.equipped_items.findIndex(i => i.id === item.id);
    if (index !== -1) {
        nowCharacter.value.equipped_items.splice(index, 1);
        save.items.add(item);
        // 使用类型断言解决类型不匹配问题
        save.characters.update(nowCharacter.value as Character);
    }
};

// 计算属性：判断当前角色卡片是否被选中
const isSelected = (item: any) => {
    return nowCharacter.value && nowCharacter.value.inside_name === item.inside_name;
};

// 计算属性：获取升级所需经验
const levelUpExperience = computed(() => {
    if (!nowCharacter.value) return 0;
    return Math.ceil(nowCharacter.value.level_xp(nowCharacter.value.level) - nowCharacter.value.xp);
});

// 计算属性：判断是否有足够的经验值
const hasEnoughExperience = computed(() => {
    return save.things.get('EXP') > 0;
});

// 属性名称中文翻译映射
const attributeTranslations: { [key: string]: string } = {
    atk: '攻击力',
    def_: '防御力',
    speed: '速度',
    hp: '生命值',
};

// 格式化道具标签，使其在选择时显示属性
const formatItemLabel = (item: Item) => {
    const attributes = Object.entries(item.random_attributes)
        .map(([key, value]) => {
            const translatedKey = attributeTranslations[key] || key; // 获取中文翻译，如果没有则使用原英文名
            return `${translatedKey}: ${value > 0 ? '+' : ''}${value}`;
        })
        .join(', ');
    return `${item.name} (${attributes})`;
};
</script>

<template>
    <el-row>
        <el-col :span="3">
            <el-scrollbar class="menu">
                <el-card v-for="item in characterList" :key="item.inside_name" class="item"
                    :class="{ 'selected': isSelected(item) }" @click="changeCharacter(item)"
                    v-if="characterList.length > 0">
                    <div class="item-content">
                        <el-image :src="c2e[item.type]" style="margin-right: 10px;" class="type"></el-image>
                        <h4 class="name" style="margin: 0;">{{ item.name }}</h4>
                    </div>
                </el-card>
                <div v-else class="container">
                    <img :src="icons.empty" style="width: 100px;height: auto;" alt="没有角色" />
                    你还没有角色
                </div>
            </el-scrollbar>
        </el-col>

        <el-col :span="21" class="content">
            <div class="verticalBar"></div>
            <el-descriptions v-if="nowCharacter" border size="large" :column="4" width="100%">
                <el-descriptions-item label="名字">{{ nowCharacter.name }}</el-descriptions-item>
                <el-descriptions-item label="属性">
                    <el-image :src="c2e[nowCharacter.type]" class="type" />
                </el-descriptions-item>
                <el-descriptions-item label="等级">
                    {{ nowCharacter.level }}&nbsp;&nbsp;&nbsp;&nbsp;
                    <SButton @click="showUpCharacter = true">升级</SButton>
                </el-descriptions-item>
                <el-descriptions-item label="详细信息">
                    <SButton class="show_info" @click="showInfo = true">显示</SButton>
                </el-descriptions-item>
                <el-descriptions-item label="攻击力">{{ Math.round(nowCharacter.atk)
                    }}</el-descriptions-item>
                <el-descriptions-item label="防御力">{{ Math.round(nowCharacter.def_)
                    }}</el-descriptions-item>
                <el-descriptions-item label="速度">{{ Math.round(nowCharacter.speed)
                    }}</el-descriptions-item>
                <el-descriptions-item label="好感度">{{ Math.round(nowCharacter.favorability) }}</el-descriptions-item>
                <el-descriptions-item label="介绍" :span="4">
                    {{ nowCharacter.desc }}
                    <SButton @click="showIll = true">查看立绘</SButton>
                </el-descriptions-item>
                <el-descriptions-item label="普攻" :span="4">
                    {{ nowCharacter.general_name }} {{ nowCharacter.general_desc }}
                </el-descriptions-item>
                <el-descriptions-item label="技能" :span="4">
                    {{ nowCharacter.skill_name }} {{ nowCharacter.skill_desc }}
                </el-descriptions-item>
                <el-descriptions-item label="爆发技" :span="4">
                    {{ nowCharacter.super_skill_name }} {{ nowCharacter.super_skill_desc }}
                </el-descriptions-item>
                <el-descriptions-item label="已装备道具" :span="4">
                    <div v-if="nowCharacter.equipped_items.length > 0">
                        <div v-for="item in nowCharacter.equipped_items" :key="item.id">
                            {{ item.name }}
                            <span v-for="(value, key) in item.random_attributes" :key="key">
                                {{ attributeTranslations[key] || key }}: {{ value > 0 ? '+' : '' }}{{ value }}<br>
                            </span>
                            <SButton @click="unequipItem(item)" text>卸下</SButton>
                        </div>
                    </div>
                    <div v-else>
                        暂无装备道具
                    </div>
                    <SButton @click="showEquipItemDialog = true">装备道具</SButton>
                </el-descriptions-item>
            </el-descriptions>
            <div v-else class="container">
                <img :src="icons.empty" style="width: 200px;height: auto;" alt="没有角色" />
                <h1>你还没有角色</h1>
            </div>
        </el-col>
    </el-row>

    <!-- 角色信息弹窗 -->
    <el-dialog v-model="showInfo" title="角色信息" width="50%">
        <el-scrollbar>
            <el-descriptions border :column="1" class="info" v-if="nowCharacter">
                <el-descriptions-item label="经验">{{ Math.round(nowCharacter.xp) }}</el-descriptions-item>
                <el-descriptions-item label="生命">{{ Math.round(nowCharacter.max_hp) }}
                </el-descriptions-item>
                <el-descriptions-item label="攻击力">{{ Math.round(nowCharacter.atk)
                }}</el-descriptions-item>
                <el-descriptions-item label="防御力">{{ Math.round(nowCharacter.def_)
                }}</el-descriptions-item>
                <el-descriptions-item label="速度">{{ Math.round(nowCharacter.speed)
                    }}</el-descriptions-item>
                <el-descriptions-item label="好感度">{{ Math.round(nowCharacter.favorability) }}</el-descriptions-item>
            </el-descriptions>
        </el-scrollbar>
    </el-dialog>

    <!-- 角色升级弹窗 -->
    <el-dialog v-model="showUpCharacter" title="角色升级">
        <el-form>
            <el-form-item label="据下一级所需的经验: ">
                <span>{{ levelUpExperience }} </span>
            </el-form-item>
            <el-form-item label="数量：" v-if="hasEnoughExperience">
                <el-slider v-model="levelUpAmount" :min="1" :max="save.things.get('EXP')" show-input />
            </el-form-item>
            <el-form-item label="数量：" v-else>
                <span>你没有EXP</span>
            </el-form-item>
            <el-form-item>
                <SButton @click="levelUp" :disabled="!hasEnoughExperience || levelUpAmount === 0">升级</SButton>
            </el-form-item>
        </el-form>
    </el-dialog>

    <!-- 角色立绘弹窗 -->
    <el-dialog v-model="showIll" title="角色立绘" top="5vh">
        <el-image :src="currentIllustration" fit="cover" class="ill">
            <template #error>
                <h4 align="center">该角色暂无立绘</h4>
            </template>
        </el-image>
    </el-dialog>

    <!-- 装备道具弹窗 -->
    <el-dialog v-model="showEquipItemDialog" title="装备道具">
        <el-form v-if="availableItems.length > 0">
            <el-form-item label="选择道具：">
                <el-select v-model="selectedItemToEquip" placeholder="请选择要装备的道具" value-key="id">
                    <el-option v-for="item in availableItems" :key="item.id" :label="formatItemLabel(item)"
                        :value="item" />
                </el-select>
            </el-form-item>
            <div v-if="selectedItemToEquip">
                <el-form-item label="道具属性：">
                    <span v-for="(value, key) in selectedItemToEquip.random_attributes" :key="key">
                        {{ attributeTranslations[key] || key }}: {{ value > 0 ? '+' : '' }}{{ value }}<br>
                    </span>
                </el-form-item>
            </div>
            <el-form-item>
                <SButton type="primary" @click="equipItem" :disabled="!selectedItemToEquip">确定装备</SButton>
            </el-form-item>
        </el-form>
        <div v-else>
            <p>背包中没有可用的道具。</p>
        </div>
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
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>
