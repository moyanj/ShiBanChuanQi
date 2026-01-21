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
import { useSaveStore } from '../js/stores';
import { get_character_by_dump, icons } from '../js/utils';
import { ref, watch, computed } from 'vue';
import SButton from '../components/sbutton.vue';
import { Item, upgradeRelic, getRelicXP, getUpgradeCost, MAX_LEVEL } from '../js/item';

const save = useSaveStore();

// Ref 定义
const showInfo = ref(false);
const showUpCharacter = ref(false);
const showIll = ref(false);
const levelUpAmount = ref(0); // 经验值数量
const currentIllustration = ref(''); // 立绘路径
const showEquipItemDialog = ref(false); // 控制装备道具对话框显示
const selectedItemToEquip = ref<Item | null>(null); // 选中的要装备的道具

// 强化相关
const showEnhanceDialog = ref(false);
const enhancingItem = ref<Item | null>(null);
const selectedFodders = ref<Item[]>([]);
const enhancePreviewXP = ref(0); // 预览增加的经验

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
    return save.items.getAll().filter(item => !item.equipped);
});

// 可作为强化素材的道具列表 (不包括自己、已装备的、锁定的(未实现))
const availableFodders = computed(() => {
    if (!enhancingItem.value) return [];
    return save.items.getAll().filter(item => 
        item.id !== enhancingItem.value?.id && 
        !item.equipped
    ).sort((a, b) => (a.rarity || 0) - (b.rarity || 0)); // Sort by rarity ascending
});

const isFodderSelected = (item: Item) => {
    return selectedFodders.value.some(f => f.id === item.id);
};

const toggleFodder = (item: Item) => {
    const idx = selectedFodders.value.findIndex(f => f.id === item.id);
    if (idx >= 0) {
        selectedFodders.value.splice(idx, 1);
    } else {
        selectedFodders.value.push(item);
    }
};

const totalFodderXP = computed(() => {
    return selectedFodders.value.reduce((sum, item) => sum + getRelicXP(item), 0);
});

const enhanceResultPreview = computed(() => {
    if (!enhancingItem.value) return null;
    
    const current = enhancingItem.value;
    const addedXP = totalFodderXP.value;
    
    // Simulate level up
    let simulatedLevel = current.level;
    let simulatedExp = current.exp + addedXP;
    let cost = getUpgradeCost(current.rarity, simulatedLevel);
    
    while (simulatedExp >= cost && simulatedLevel < MAX_LEVEL) {
        simulatedExp -= cost;
        simulatedLevel++;
        cost = getUpgradeCost(current.rarity, simulatedLevel);
    }
    
    return {
        level: simulatedLevel,
        exp: simulatedExp,
        nextLevelCost: cost
    };
});

const openEnhanceDialog = (item: Item) => {
    enhancingItem.value = item;
    selectedFodders.value = [];
    showEnhanceDialog.value = true;
};

const confirmEnhance = () => {
    if (!enhancingItem.value || selectedFodders.value.length === 0) return;
    
    const success = upgradeRelic(enhancingItem.value, selectedFodders.value);
    if (success) {
        // Remove fodders
        selectedFodders.value.forEach(f => save.items.remove(f.id));
        
        // Force update character stats
        if (nowCharacter.value) {
            save.characters.update(nowCharacter.value as Character);
        }
        
        // Reset selection
        selectedFodders.value = [];
    }
};

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

    // 标记道具为已装备
    selectedItemToEquip.value.equipped = true;
    save.items.update(selectedItemToEquip.value);

    // 将道具添加到角色的装备列表中
    nowCharacter.value.equipped_items.push(selectedItemToEquip.value);

    // 使用类型断言解决类型不匹配问题
    save.characters.update(nowCharacter.value as Character);
    showEquipItemDialog.value = false;
    selectedItemToEquip.value = null; // 重置选中道具
};

// 方法：卸下道具
const unequipItem = (item: Item) => {
    if (!nowCharacter.value) return;

    // 标记道具为未装备
    item.equipped = false;
    save.items.update(item);

    const index = nowCharacter.value.equipped_items.findIndex(i => i.id === item.id);
    if (index !== -1) {
        nowCharacter.value.equipped_items.splice(index, 1);
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
    const rarityStr = item.rarity ? `${item.rarity}★` : '';
    const levelStr = `+${item.level}`;
    let mainStr = "";
    if (item.main_attribute) {
        const k = item.main_attribute.key;
        const v = item.main_attribute.value;
        mainStr = `[主:${attributeTranslations[k] || k}+${v}] `;
    }

    const attributes = Object.entries(item.random_attributes)
        .map(([key, value]) => {
            const translatedKey = attributeTranslations[key] || key; // 获取中文翻译，如果没有则使用原英文名
            return `${translatedKey}: ${value > 0 ? '+' : ''}${value}`;
        })
        .join(', ');
    return `${rarityStr} ${item.name} ${levelStr} ${mainStr}(${attributes})`;
};

const getRarityColor = (rarity: number = 1) => {
    switch (rarity) {
        case 5: return '#FFD700'; // Gold
        case 4: return '#9B59B6'; // Purple
        case 3: return '#409EFF'; // Blue
        case 2: return '#67C23A'; // Green
        default: return '#909399'; // Gray
    }
};
</script>

<template>
    <div class="page-container">
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
                    <el-descriptions-item label="已装备圣遗物" :span="4">
                        <div v-if="nowCharacter.equipped_items.length > 0">
                            <div v-for="item in nowCharacter.equipped_items" :key="item.id"
                                style="margin-bottom: 10px; border-bottom: 1px solid #555; padding-bottom: 5px;">
                                <span :style="{ color: getRarityColor(item.rarity) }"
                                    style="font-weight: bold; font-size: 1.1em;">
                                    {{ item.name }} <span style="font-size: 0.8em">({{ item.rarity || 1 }}★)</span>
                                </span>
                                <div v-if="item.main_attribute"
                                    style="color: #E6A23C; font-weight: bold; margin: 3px 0;">
                                    主属性: {{ attributeTranslations[item.main_attribute.key] || item.main_attribute.key }}
                                    +{{ item.main_attribute.value }}
                                </div>
                                <div
                                    style="font-size: 0.9em; color: #ddd; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                                    <span v-for="(value, key) in item.random_attributes" :key="key">
                                        {{ attributeTranslations[key] || key }}: +{{ value }}
                                    </span>
                                </div>
                                <SButton @click="unequipItem(item)" text style="margin-top: 5px;">卸下</SButton>
                                <SButton @click="openEnhanceDialog(item)" text style="margin-top: 5px; margin-left: 10px;">强化</SButton>
                            </div>
                        </div>
                        <div v-else>
                            暂无装备圣遗物
                        </div>
                        <SButton @click="showEquipItemDialog = true">装备圣遗物</SButton>
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
        <el-dialog v-model="showEquipItemDialog" title="装备圣遗物">
            <el-form v-if="availableItems.length > 0">
                <el-form-item label="选择圣遗物：">
                    <el-select v-model="selectedItemToEquip" placeholder="请选择要装备的圣遗物" value-key="id">
                        <el-option v-for="item in availableItems" :key="item.id" :label="formatItemLabel(item)"
                            :value="item" />
                    </el-select>
                </el-form-item>
                <div v-if="selectedItemToEquip">
                    <el-form-item label="详细属性：">
                        <div style="width: 100%; line-height: 1.5;">
                            <div :style="{ color: getRarityColor(selectedItemToEquip.rarity) }"
                                style="font-weight: bold;">
                                稀有度: {{ selectedItemToEquip.rarity || 1 }}★
                            </div>
                            <div v-if="selectedItemToEquip.main_attribute" style="color: #E6A23C; font-weight: bold;">
                                主: {{ attributeTranslations[selectedItemToEquip.main_attribute.key] }} +{{
                                selectedItemToEquip.main_attribute.value }}
                            </div>
                            <div v-for="(value, key) in selectedItemToEquip.random_attributes" :key="key">
                                {{ attributeTranslations[key] || key }}: +{{ value }}
                            </div>
                        </div>
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

        <!-- 强化弹窗 -->
        <el-dialog v-model="showEnhanceDialog" title="圣遗物强化" width="70%">
            <div v-if="enhancingItem" style="display: flex; gap: 20px;">
                <!-- 左侧：目标圣遗物信息 -->
                <div style="flex: 1; border-right: 1px solid #555; padding-right: 20px;">
                    <h3>当前属性</h3>
                    <p :style="{ color: getRarityColor(enhancingItem.rarity) }">
                        {{ enhancingItem.name }} ({{ enhancingItem.rarity }}★) +{{ enhancingItem.level }}
                    </p>
                    <p>经验: {{ enhancingItem.exp }} / {{ getUpgradeCost(enhancingItem.rarity, enhancingItem.level) }}</p>
                    
                    <div v-if="enhancingItem.main_attribute" style="color: #E6A23C; font-weight: bold; margin: 10px 0;">
                        主属性: {{ attributeTranslations[enhancingItem.main_attribute.key] }} +{{ enhancingItem.main_attribute.value }}
                    </div>
                    
                    <div v-for="(value, key) in enhancingItem.random_attributes" :key="key">
                         {{ attributeTranslations[key] || key }}: +{{ value }}
                    </div>

                    <div v-if="enhanceResultPreview && enhanceResultPreview.level > enhancingItem.level" style="margin-top: 20px; color: #67C23A;">
                        <h3>预览结果</h3>
                        <p>等级: {{ enhancingItem.level }} -> {{ enhanceResultPreview.level }}</p>
                        <p>主属性将会提升</p>
                        <p v-if="enhanceResultPreview.level % 4 === 0 || Math.floor(enhanceResultPreview.level/4) > Math.floor(enhancingItem.level/4)">
                            将会解锁或升级副词条
                        </p>
                    </div>
                </div>

                <!-- 右侧：素材选择 -->
                <div style="flex: 1;">
                    <h3>选择素材 (提供经验: {{ totalFodderXP }})</h3>
                    <el-scrollbar height="300px">
                        <div v-if="availableFodders.length === 0">没有可用的强化素材</div>
                        <div v-for="fodder in availableFodders" :key="fodder.id" 
                             @click="toggleFodder(fodder)"
                             :class="{ 'selected-fodder': isFodderSelected(fodder) }"
                             style="cursor: pointer; padding: 5px; margin-bottom: 5px; border: 1px solid transparent; display: flex; justify-content: space-between;">
                            <span :style="{ color: getRarityColor(fodder.rarity) }">
                                {{ fodder.name }} (+{{ fodder.level }})
                            </span>
                            <span>{{ getRelicXP(fodder) }} XP</span>
                        </div>
                    </el-scrollbar>
                    <div style="margin-top: 20px; text-align: right;">
                         <SButton type="primary" @click="confirmEnhance" :disabled="selectedFodders.length === 0">确认强化</SButton>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
.selected-fodder {
    background-color: rgba(64, 158, 255, 0.2);
    border-color: #409EFF !important;
}

.page-container {
    padding: 20px;
    height: 100vh;
    box-sizing: border-box;
}

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
