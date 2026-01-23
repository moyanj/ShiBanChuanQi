<script setup lang="ts">
import {
    ElScrollbar,
    ElImage,
    ElDialog,
    ElForm,
    ElFormItem,
    ElSlider,
    ElSelect,
    ElOption,
    ElTabs,
    ElTabPane,
    ElMessage
} from 'element-plus';
import { CharacterType, Character } from '../js/character';
import { useSaveStore } from '../js/stores';
import { get_character_by_dump, icons } from '../js/utils';
import { ref, watch, computed } from 'vue';
import SButton from '../components/sbutton.vue';
import { Relic, upgradeRelic, getRelicXP, getUpgradeCost, MAX_LEVEL } from '../js/relic';

const save = useSaveStore();

// Ref 定义
const showInfo = ref(false);
const showUpCharacter = ref(false);
const showIll = ref(false);
const activeTab = ref('stats'); // 新增：控制右侧面板标签页
const levelUpAmount = ref(0); // 经验值数量
const currentIllustration = ref(''); // 立绘路径
const showEquipRelicDialog = ref(false); // 控制装备道具对话框显示
const selectedRelicToEquip = ref<Relic | null>(null); // 选中的要装备的道具

// 强化相关
const showEnhanceDialog = ref(false);
const enhancingRelic = ref<Relic | null>(null);
const selectedFodders = ref<Relic[]>([]);
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
const availableRelics = computed(() => {
    return save.relics.getAll().filter(item => !item.equipped);
});

// 可作为强化素材的道具列表 (不包括自己、已装备的、锁定的(未实现))
const availableFodders = computed(() => {
    if (!enhancingRelic.value) return [];
    return save.relics.getAll().filter(item =>
        item.id !== enhancingRelic.value?.id &&
        !item.equipped
    ).sort((a, b) => (a.rarity || 0) - (b.rarity || 0)); // Sort by rarity ascending
});

const isFodderSelected = (item: Relic) => {
    return selectedFodders.value.some(f => f.id === item.id);
};

const toggleFodder = (item: Relic) => {
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
    if (!enhancingRelic.value) return null;

    const current = enhancingRelic.value;
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

const openEnhanceDialog = (item: Relic) => {
    enhancingRelic.value = item;
    selectedFodders.value = [];
    showEnhanceDialog.value = true;
};

const confirmEnhance = () => {
    if (!enhancingRelic.value || selectedFodders.value.length === 0) return;

    const success = upgradeRelic(enhancingRelic.value, selectedFodders.value);
    if (success) {
        // Remove fodders
        selectedFodders.value.forEach(f => save.relics.remove(f.id));

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
    if (nowCharacter.value) {
        // 检查当前选中的角色是否还在列表中
        const exists = characterList.value.find(c => c.inside_name === nowCharacter.value?.inside_name);
        if (exists) {
            // 如果存在，则不需要重置为第一个角色
            // 如果需要同步最新数据，可以根据需要重新 load，但通常 instance 已经在内部更新了
            return;
        }
    }
    // 只有在当前角色不存在或为空时，才重置为第一个
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

// 方法：处理点击升级按钮
const handleLevelUpClick = () => {
    if (!nowCharacter.value) return;
    if (nowCharacter.value.level >= Character.MAX_LEVEL) {
        ElMessage.warning('角色等级已达上限');
        return;
    }
    showUpCharacter.value = true;
};

// 方法：升级角色
const levelUp = () => {
    if (!nowCharacter.value) return;
    if (nowCharacter.value.level >= Character.MAX_LEVEL) {
        ElMessage.warning('角色等级已达上限');
        showUpCharacter.value = false;
        return;
    }

    // 计算实际需要的经验值，避免浪费
    const expToMax = nowCharacter.value.get_exp_to_max_level();
    const actualCost = Math.min(levelUpAmount.value, expToMax);

    // 如果实际消耗小于选择的（通常是因为达到了上限），更新选择值以反映真实消耗
    // 但为了用户体验，我们直接消耗实际值，并在 UI 上可能给予反馈
    // 扣除实际消耗
    save.things.remove("EXP", actualCost);
    nowCharacter.value.level_up(actualCost);
    // 使用类型断言解决类型不匹配问题
    save.characters.update(nowCharacter.value as Character);

    // 升级后如果满级了，关闭窗口
    if (nowCharacter.value.level >= Character.MAX_LEVEL) {
        showUpCharacter.value = false;
        ElMessage.success('角色已升至满级！');
    } else {
        ElMessage.success(`升级成功！消耗 ${actualCost} 经验`);
    }

    // 重置输入框（可选，或者设为0，或者设为剩余可升值）
    levelUpAmount.value = 0;
};

// 方法：装备道具
const equipRelic = () => {
    if (!nowCharacter.value || !selectedRelicToEquip.value) return;

    // 标记道具为已装备
    selectedRelicToEquip.value.equipped = true;
    save.relics.update(selectedRelicToEquip.value);

    // 将道具添加到角色的装备列表中
    nowCharacter.value.equipped_relics.push(selectedRelicToEquip.value);

    // 使用类型断言解决类型不匹配问题
    save.characters.update(nowCharacter.value as Character);
    showEquipRelicDialog.value = false;
    selectedRelicToEquip.value = null; // 重置选中道具
};

// 方法：卸下道具
const unequipRelic = (item: Relic) => {
    if (!nowCharacter.value) return;

    // 标记道具为未装备
    item.equipped = false;
    save.relics.update(item);

    const index = nowCharacter.value.equipped_relics.findIndex(i => i.id === item.id);
    if (index !== -1) {
        nowCharacter.value.equipped_relics.splice(index, 1);
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

const predictedLevelInfo = computed(() => {
    if (!nowCharacter.value) return { level: 0, xp: 0 };
    return nowCharacter.value.simulate_level_up(levelUpAmount.value);
});

const maxNeedExp = computed(() => {
    if (!nowCharacter.value) return 0;
    return nowCharacter.value.get_exp_to_max_level();
});

const sliderMax = computed(() => {
    const owned = save.things.get('EXP');
    const needed = maxNeedExp.value;
    return Math.min(owned, needed);
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
const formatRelicLabel = (item: Relic) => {
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

const getRelicIcon = (item: any) => {
    return item.icon || icons.empty;
};
</script>

<template>
    <div class="char-page">
        <!-- 背景装饰 -->
        <div class="bg-overlay"></div>

        <!-- 左侧角色列表 -->
        <div class="side-nav">
            <el-scrollbar>
                <div v-for="item in characterList" :key="item.inside_name" class="char-nav-item"
                    :class="{ 'active': isSelected(item) }" @click="changeCharacter(item)">
                    <div class="char-nav-inner">
                        <img :src="c2e[item.type]" class="elem-icon" />
                        <div class="char-nav-info">
                            <span class="char-name">{{ item.name }}</span>
                            <span class="char-lv">Lv.{{ item.level }}</span>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <!-- 中间展示区 -->
        <div class="main-display" v-if="nowCharacter">
            <div class="char-header">
                <div class="char-title">
                    <img :src="c2e[nowCharacter.type]" class="big-elem-icon" />
                    <div class="name-box">
                        <h1 class="display-name">{{ nowCharacter.name }}</h1>
                        <p class="display-desc">{{ nowCharacter.desc }}</p>
                    </div>
                </div>
                <div class="level-display">
                    <div class="lv-row">
                        <span class="lv-label">等级</span>
                        <span class="lv-value">{{ nowCharacter.level }}</span>
                        <span class="lv-max">/ {{ Character.MAX_LEVEL }}</span>
                    </div>
                    <div class="exp-container">
                        <div class="exp-bar-bg">
                            <div class="exp-bar-fill"
                                :style="{ width: (nowCharacter.xp / nowCharacter.level_xp(nowCharacter.level) * 100) + '%' }">
                            </div>
                        </div>
                    </div>
                    <SButton @click="handleLevelUpClick" class="up-btn">提升等级</SButton>
                </div>
            </div>

            <div class="portrait-container">
                <transition name="fade" mode="out-in">
                    <el-image :key="nowCharacter.inside_name" :src="currentIllustration" fit="contain"
                        class="main-portrait">
                        <template #error>
                            <div class="no-portrait">
                                <img :src="icons.empty" />
                                <span>立绘加载中...</span>
                            </div>
                        </template>
                    </el-image>
                </transition>
            </div>

            <div class="bottom-actions">
                <SButton @click="showIll = true" text>查看全身立绘</SButton>
            </div>
        </div>

        <!-- 右侧信息面板 -->
        <div class="info-panel" v-if="nowCharacter">
            <el-tabs v-model="activeTab" class="char-tabs">
                <el-tab-pane label="属性" name="stats">
                    <div class="stats-scroll">
                        <el-scrollbar>
                            <div class="stats-list">
                                <div class="stat-item">
                                    <span class="stat-label">生命值</span>
                                    <span class="stat-value">{{ Math.round(nowCharacter.max_hp) }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">攻击力</span>
                                    <span class="stat-value">{{ Math.round(nowCharacter.atk) }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">防御力</span>
                                    <span class="stat-value">{{ Math.round(nowCharacter.def_) }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">速度</span>
                                    <span class="stat-value">{{ Math.round(nowCharacter.speed) }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">好感度</span>
                                    <span class="stat-value">{{ Math.round(nowCharacter.favorability) }}</span>
                                </div>
                            </div>

                            <div class="more-info-btn">
                                <SButton @click="showInfo = true" style="width: 100%">详细面板</SButton>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="技能" name="skills">
                    <div class="skills-scroll">
                        <el-scrollbar>
                            <div class="skills-container">
                                <div class="skill-card">
                                    <div class="skill-head">
                                        <span class="skill-tag">普攻</span>
                                        <span class="skill-name">{{ nowCharacter.general_name }}</span>
                                    </div>
                                    <p class="skill-desc">{{ nowCharacter.general_desc }}</p>
                                </div>
                                <div class="skill-card">
                                    <div class="skill-head">
                                        <span class="skill-tag secondary">技能</span>
                                        <span class="skill-name">{{ nowCharacter.skill_name }}</span>
                                    </div>
                                    <p class="skill-desc">{{ nowCharacter.skill_desc }}</p>
                                </div>
                                <div class="skill-card">
                                    <div class="skill-head">
                                        <span class="skill-tag ultimate">爆发</span>
                                        <span class="skill-name">{{ nowCharacter.super_skill_name }}</span>
                                    </div>
                                    <p class="skill-desc">{{ nowCharacter.super_skill_desc }}</p>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="圣遗物" name="relics">
                    <div class="relic-scroll">
                        <el-scrollbar>
                            <div class="relic-grid">
                                <div v-for="item in nowCharacter.equipped_relics" :key="item.id" class="relic-item">
                                    <div class="relic-card-inner">
                                        <div class="relic-top">
                                            <div class="relic-icon-placeholder"
                                                :style="{ backgroundColor: getRarityColor(item.rarity) + '44', borderColor: getRarityColor(item.rarity) }">
                                                <img :src="getRelicIcon(item)" class="relic-icon" />
                                                <span class="relic-lv">+{{ item.level }}</span>
                                            </div>
                                            <div class="relic-main-info">
                                                <div class="relic-name" :style="{ color: getRarityColor(item.rarity) }">
                                                    {{
                                                        item.name }}</div>
                                                <div class="relic-main-stat" v-if="item.main_attribute">
                                                    {{ attributeTranslations[item.main_attribute.key] ||
                                                        item.main_attribute.key
                                                    }} +{{ item.main_attribute.value }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="relic-sub-stats">
                                            <div v-for="(v, k) in item.random_attributes" :key="k" class="sub-stat">
                                                {{ attributeTranslations[k] || k }}: +{{ v }}
                                            </div>
                                        </div>
                                        <div class="relic-btns">
                                            <SButton @click="openEnhanceDialog(item)" text size="small">强化</SButton>
                                            <SButton @click="unequipRelic(item)" text size="small">卸下</SButton>
                                        </div>
                                    </div>
                                </div>

                                <div class="add-relic-card" @click="showEquipRelicDialog = true"
                                    v-if="nowCharacter.equipped_relics.length < 6">
                                    <div class="add-inner">
                                        <span class="add-plus">+</span>
                                        <span class="add-text">装备圣遗物</span>
                                    </div>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>

        <div v-if="!nowCharacter" class="empty-state">
            <img :src="icons.empty" />
            <h2>尚未获得任何角色</h2>
        </div>

        <!-- 角色信息弹窗 -->
        <el-dialog v-model="showInfo" title="角色详细面板" width="400px" append-to-body>
            <el-scrollbar max-height="500px">
                <div class="detailed-stats" v-if="nowCharacter">
                    <div class="detail-item" v-for="(val, label) in {
                        '当前经验': Math.round(nowCharacter.xp),
                        '生命值上限': Math.round(nowCharacter.max_hp),
                        '攻击力': Math.round(nowCharacter.atk),
                        '防御力': Math.round(nowCharacter.def_),
                        '速度': Math.round(nowCharacter.speed),
                        '好感度': Math.round(nowCharacter.favorability)
                    }" :key="label">
                        <span class="d-label">{{ label }}</span>
                        <span class="d-value">{{ val }}</span>
                    </div>
                </div>
            </el-scrollbar>
        </el-dialog>

        <!-- 角色升级弹窗 -->
        <el-dialog v-model="showUpCharacter" title="角色升级" width="400px" append-to-body>
            <div class="upgrade-dialog-content">
                <div class="next-lv-info">
                    <span>距下一级所需经验: </span>
                    <span class="highlight">{{ levelUpExperience }}</span>
                </div>
                <div class="exp-stock">
                    <span>当前拥有 EXP: </span>
                    <span class="highlight">{{ save.things.get('EXP') }}</span>
                </div>
                <div class="predict-lv-info">
                    <span>预计等级: </span>
                    <span class="highlight">Lv.{{ nowCharacter?.level }} <span class="arrow">→</span> Lv.{{
                        predictedLevelInfo.level }}</span>
                </div>
                <div v-if="hasEnoughExperience" class="slider-box">
                    <el-slider v-model="levelUpAmount" :min="0" :max="sliderMax" show-input />
                </div>
                <div v-else class="no-exp">你目前没有经验值储备</div>
                <div class="dialog-actions">
                    <SButton @click="levelUp" :disabled="!hasEnoughExperience || levelUpAmount === 0"
                        style="width: 100%">确认升级
                    </SButton>
                </div>
            </div>
        </el-dialog>

        <!-- 角色立绘弹窗 -->
        <el-dialog v-model="showIll" title="角色立绘" fullscreen class="ill-dialog">
            <div class="full-ill-container">
                <el-image :src="currentIllustration" fit="contain" class="full-ill">
                    <template #error>
                        <h4 align="center">该角色暂无立绘</h4>
                    </template>
                </el-image>
                <div class="close-ill" @click="showIll = false">退出预览</div>
            </div>
        </el-dialog>

        <!-- 装备道具弹窗 -->
        <el-dialog v-model="showEquipRelicDialog" title="装备圣遗物" width="500px">
            <div class="equip-dialog-content">
                <el-form v-if="availableRelics.length > 0">
                    <el-form-item label="选择圣遗物">
                        <el-select v-model="selectedRelicToEquip" placeholder="请选择" value-key="id" style="width: 100%">
                            <el-option v-for="item in availableRelics" :key="item.id" :label="formatRelicLabel(item)"
                                :value="item" />
                        </el-select>
                    </el-form-item>
                    <div v-if="selectedRelicToEquip" class="equip-preview">
                        <div class="preview-title" :style="{ color: getRarityColor(selectedRelicToEquip.rarity) }">
                            {{ selectedRelicToEquip.name }} ({{ selectedRelicToEquip.rarity || 1 }}★)
                        </div>
                        <div class="preview-main" v-if="selectedRelicToEquip.main_attribute">
                            主属性: {{ attributeTranslations[selectedRelicToEquip.main_attribute.key] }} +{{
                                selectedRelicToEquip.main_attribute.value }}
                        </div>
                        <div class="preview-subs">
                            <div v-for="(v, k) in selectedRelicToEquip.random_attributes" :key="k">
                                {{ attributeTranslations[k] || k }}: +{{ v }}
                            </div>
                        </div>
                    </div>
                    <div class="dialog-actions" style="margin-top: 20px">
                        <SButton type="primary" @click="equipRelic" :disabled="!selectedRelicToEquip"
                            style="width: 100%">
                            确定装备
                        </SButton>
                    </div>
                </el-form>
                <div v-else class="empty-relics">背包中没有多余的圣遗物</div>
            </div>
        </el-dialog>

        <!-- 强化弹窗 -->
        <el-dialog v-model="showEnhanceDialog" title="圣遗物强化" width="800px">
            <div v-if="enhancingRelic" class="enhance-layout">
                <div class="enhance-left">
                    <h3>目标详情</h3>
                    <div class="target-card" :style="{ borderColor: getRarityColor(enhancingRelic.rarity) }">
                        <div class="target-name" :style="{ color: getRarityColor(enhancingRelic.rarity) }">
                            {{ enhancingRelic.name }} +{{ enhancingRelic.level }}
                        </div>
                        <div class="target-exp">
                            XP: {{ enhancingRelic.exp }} / {{ getUpgradeCost(enhancingRelic.rarity,
                                enhancingRelic.level)
                            }}
                        </div>
                        <div class="target-main" v-if="enhancingRelic.main_attribute">
                            {{ attributeTranslations[enhancingRelic.main_attribute.key] }} +{{
                                enhancingRelic.main_attribute.value
                            }}
                        </div>
                        <div class="target-subs">
                            <div v-for="(v, k) in enhancingRelic.random_attributes" :key="k">
                                {{ attributeTranslations[k] || k }}: +{{ v }}
                            </div>
                        </div>
                    </div>

                    <div v-if="enhanceResultPreview && enhanceResultPreview.level > enhancingRelic.level"
                        class="preview-success">
                        <h4>强化预览</h4>
                        <p>等级: {{ enhancingRelic.level }} → {{ enhanceResultPreview.level }}</p>
                        <p class="tip">主属性将显著提升</p>
                        <p v-if="enhanceResultPreview.level % 4 === 0 || Math.floor(enhanceResultPreview.level / 4) > Math.floor(enhancingRelic.level / 4)"
                            class="tip highlight">
                            将获得新的副词条提升
                        </p>
                    </div>
                </div>

                <div class="enhance-right">
                    <div class="fodder-header">
                        <h3>消耗素材</h3>
                        <span class="xp-gain">提供经验: {{ totalFodderXP }}</span>
                    </div>
                    <div class="fodder-list">
                        <el-scrollbar height="350px">
                            <div v-if="availableFodders.length === 0" class="no-fodder">暂无可用素材</div>
                            <div v-for="fodder in availableFodders" :key="fodder.id" @click="toggleFodder(fodder)"
                                class="fodder-item" :class="{ 'selected': isFodderSelected(fodder) }">
                                <div class="fodder-info">
                                    <span class="f-name" :style="{ color: getRarityColor(fodder.rarity) }">{{
                                        fodder.name
                                        }}</span>
                                    <span class="f-lv">+{{ fodder.level }}</span>
                                </div>
                                <span class="f-xp">{{ getRelicXP(fodder) }} XP</span>
                            </div>
                        </el-scrollbar>
                    </div>
                    <div class="enhance-footer">
                        <SButton type="primary" @click="confirmEnhance" :disabled="selectedFodders.length === 0"
                            style="width: 100%">开始强化</SButton>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
.char-page {
    position: relative;
    height: 100vh;
    width: 100vw;
    display: flex;
    background-color: #0c0c0e;
    color: #ececec;
    overflow: hidden;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 70% 30%, rgba(45, 55, 72, 0.4) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

/* Sidebar */
.side-nav {
    width: 200px;
    height: 100%;
    background: rgba(20, 20, 22, 0.8);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    z-index: 2;
    padding: 10px 0;
}

.char-nav-item {
    padding: 12px 15px;
    cursor: pointer;
    transition: all 0.3s;
    border-left: 4px solid transparent;
    margin-bottom: 4px;
}

.char-nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.char-nav-item.active {
    background: rgba(255, 255, 255, 0.1);
    border-left-color: #f7d358;
}

.char-nav-inner {
    display: flex;
    align-relics: center;
    gap: 12px;
}

.elem-icon {
    width: 24px;
    height: 24px;
}

.char-nav-info {
    display: flex;
    flex-direction: column;
}

.char-name {
    font-size: 1rem;
    font-weight: 500;
}

.char-lv {
    font-size: 0.75rem;
    color: #aaa;
}

/* Main Display */
.main-display {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 40px;
    z-index: 1;
}

.char-header {
    display: flex;
    justify-content: space-between;
    align-relics: flex-start;
}

.char-title {
    display: flex;
    align-relics: center;
    gap: 20px;
}

.big-elem-icon {
    width: 64px;
    height: 64px;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

.display-name {
    font-size: 3rem;
    margin: 0;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    letter-spacing: 2px;
}

.display-desc {
    margin: 5px 0 0;
    color: #ccc;
    font-size: 1rem;
    font-style: italic;
    opacity: 0.8;
}

.level-display {
    text-align: right;
    width: 250px;
}

.lv-row {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

.lv-label {
    color: #888;
    margin-right: 8px;
    font-size: 1rem;
}

.lv-value {
    font-weight: bold;
    color: #fff;
}

.lv-max {
    color: #666;
    font-size: 1rem;
}

.exp-container {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    margin-bottom: 15px;
    overflow: hidden;
}

.exp-bar-fill {
    height: 100%;
    background: #f7d358;
    box-shadow: 0 0 8px #f7d358;
    transition: width 0.5s ease;
}

.up-btn {
    width: 100%;
}

/* Portrait */
.portrait-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-relics: center;
    margin: 20px 0;
}

.main-portrait {
    height: 80vh;
    max-width: 100%;
    filter: drop-shadow(0 0 30px rgba(0, 0, 0, 0.8));
}

.no-portrait {
    display: flex;
    flex-direction: column;
    align-relics: center;
    opacity: 0.3;
}

.bottom-actions {
    display: flex;
    justify-content: center;
    padding-bottom: 20px;
}

/* Info Panel */
.info-panel {
    width: 380px;
    height: 100%;
    background: rgba(20, 20, 22, 0.7);
    backdrop-filter: blur(15px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 2;
}

.char-tabs :deep(.el-tabs__header) {
    margin: 0;
    padding: 20px 20px 0;
    background: rgba(0, 0, 0, 0.2);
}

.char-tabs :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
}

.char-tabs :deep(.el-tabs__active-bar) {
    background-color: #f7d358;
}

.char-tabs :deep(.el-tabs__item) {
    color: #888;
    font-size: 1.1rem;
}

.char-tabs :deep(.el-tabs__item.is-active) {
    color: #fff;
}

.stats-scroll,
.skills-scroll,
.relic-scroll {
    height: calc(100vh - 60px);
    padding: 20px;
}

/* Stats */
.stats-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 15px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-label {
    color: #aaa;
}

.stat-value {
    font-weight: bold;
    color: #fff;
    font-size: 1.1rem;
}

/* Skills */
.skills-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.skill-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
}

.skill-head {
    display: flex;
    align-relics: center;
    gap: 10px;
    margin-bottom: 10px;
}

.skill-tag {
    padding: 2px 8px;
    background: #4a5568;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #fff;
}

.skill-tag.secondary {
    background: #2c5282;
}

.skill-tag.ultimate {
    background: #742a2a;
    border: 1px solid #e53e3e;
}

.skill-name {
    font-weight: bold;
    font-size: 1.1rem;
}

.skill-desc {
    color: #bbb;
    font-size: 0.9rem;
    line-height: 1.6;
}

/* Relics */
.relic-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.relic-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.relic-card-inner {
    padding: 12px;
}

.relic-top {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
}

.relic-icon-placeholder {
    width: 48px;
    height: 48px;
    border: 2px solid;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-relics: center;
    position: relative;
    overflow: hidden;
}

.relic-icon {
    width: 80%;
    height: 80%;
    object-fit: contain;
}

.relic-lv {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #000;
    color: #fff;
    font-size: 0.65rem;
    padding: 1px 3px;
    border-radius: 2px;
}

.relic-main-info {
    flex: 1;
}

.relic-name {
    font-weight: bold;
    margin-bottom: 4px;
}

.relic-main-stat {
    color: #f6ad55;
    font-size: 0.9rem;
    font-weight: bold;
}

.relic-sub-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    font-size: 0.8rem;
    color: #999;
    margin-bottom: 10px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.relic-btns {
    display: flex;
    gap: 10px;
}

.add-relic-card {
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;
}

.add-relic-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
}

.add-inner {
    display: flex;
    flex-direction: column;
    align-relics: center;
    gap: 10px;
    color: #666;
}

.add-plus {
    font-size: 2rem;
    line-height: 1;
}

/* Empty State */
.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-relics: center;
    justify-content: center;
    opacity: 0.5;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Dialog Styles */
:deep(.el-dialog) {
    background: #1a1a1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

:deep(.el-dialog__title) {
    color: #fff;
}

:deep(.el-form-item__label) {
    color: #aaa;
}

.detailed-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.d-label {
    color: #888;
}

.d-value {
    color: #fff;
    font-weight: bold;
}

.upgrade-dialog-content {
    padding: 10px;
}

.highlight {
    color: #f7d358;
    font-weight: bold;
    margin-left: 5px;
}

.slider-box {
    margin: 30px 0;
}

.no-exp {
    text-align: center;
    color: #666;
    margin: 20px 0;
}

.predict-lv-info {
    margin-top: 10px;
    font-size: 1.1rem;
    color: #48bb78;
}

.arrow {
    margin: 0 5px;
    color: #aaa;
}

.ill-dialog :deep(.el-dialog__header) {
    display: none;
}

.ill-dialog :deep(.el-dialog__body) {
    padding: 0 !important;
    height: 100vh;
    background: #000;
}

.full-ill-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-relics: center;
}

.full-ill {
    width: 100%;
    height: 100%;
}

.close-ill {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    cursor: pointer;
    z-index: 10;
}

/* Enhance Dialog Styles */
.enhance-layout {
    display: flex;
    gap: 30px;
    color: #fff;
}

.enhance-left {
    flex: 1;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding-right: 30px;
}

.enhance-right {
    flex: 1.2;
}

.target-card {
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid;
    border-radius: 12px;
    padding: 20px;
    margin-top: 15px;
}

.target-name {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
}

.target-exp {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 15px;
}

.target-main {
    color: #f6ad55;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 15px;
}

.target-subs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #ccc;
}

.preview-success {
    margin-top: 25px;
    padding: 15px;
    background: rgba(72, 187, 120, 0.1);
    border-radius: 8px;
    border: 1px solid #48bb78;
}

.preview-success h4 {
    margin: 0 0 10px;
    color: #48bb78;
}

.tip {
    margin: 5px 0;
    font-size: 0.9rem;
}

.tip.highlight {
    color: #f7d358;
}

.fodder-header {
    display: flex;
    justify-content: space-between;
    align-relics: center;
    margin-bottom: 15px;
}

.xp-gain {
    color: #f7d358;
    font-weight: bold;
}

.fodder-item {
    display: flex;
    justify-content: space-between;
    align-relics: center;
    padding: 12px 15px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.fodder-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

.fodder-item.selected {
    background: rgba(66, 153, 225, 0.15);
    border-color: #4299e1;
}

.fodder-info {
    display: flex;
    flex-direction: column;
}

.f-name {
    font-weight: bold;
}

.f-lv {
    font-size: 0.8rem;
    color: #888;
}

.f-xp {
    font-weight: bold;
    color: #f7d358;
}

.enhance-footer {
    margin-top: 20px;
}
</style>
