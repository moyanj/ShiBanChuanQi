<script lang="ts" setup>
import { watch, ref, onMounted, computed } from 'vue';
import { ElDialog, ElForm, ElFormItem, ElSlider, ElTabs, ElTabPane, ElScrollbar, ElImage } from 'element-plus';
import sbutton from '../components/sbutton.vue';
import { useSaveStore } from '../js/stores';
import { ThingList } from '../js/things';
import { Relic, itemNames } from '../js/relic';
import { ConsumableItem, ConsumableItems } from '../js/item';
import { useMagicKeys } from '@vueuse/core';
import { icons } from '../js/utils';
import icon_xinhuo from '../assets/things/XinHuo.png';
import icon_exp from '../assets/things/EXP.png';

const save = useSaveStore();

const materialIcons: Record<string, string> = {
    'XinHuo': icon_xinhuo,
    'EXP': icon_exp,
};

const getItemIcon = (item: any) => {
    console.log(item);
    if (item.isThing) {
        return materialIcons[item.id] || icons.empty;
    } else if (item.inside_name) {
        if (itemNames.includes(item.inside_name)) {
            return `/relic/${item.inside_name}.png`;
        }
    }
    return item.icon || icons.empty;
};

const deleteDialog_show = ref(false);
const delete_args = ref({
    n: 1,
    arg: null
});
const activeTab = ref('things'); // 默认激活物品标签页
const selectedItem = ref<any>(null); // 当前选中的物品、圣遗物或道具

const keys = useMagicKeys();

watch(keys["ArrowLeft"], () => {
    if (activeTab.value === 'items') {
        activeTab.value = 'relics';
    } else if (activeTab.value === 'relics') {
        activeTab.value = 'things';
    }
});

watch(keys["ArrowRight"], () => {
    if (activeTab.value === 'things') {
        activeTab.value = 'relics';
    } else if (activeTab.value === 'relics') {
        activeTab.value = 'items';
    }
});

function get_things_data() {
    let data: any[] = [];
    const things = save.things.get_all();
    for (let id in things) {
        let thingClass = ThingList[id];
        if (!thingClass) continue;
        let thing = new thingClass();
        let count = save.things.get(id);
        if (count === 0) continue;
        data.push({
            id: id,
            name: thing.name,
            desc: thing.desc,
            count: count,
            isThing: true
        });
    }
    return data;
}

const allRelics = ref<Relic[]>([]);
const allItems = ref<{ item: ConsumableItem, count: number }[]>([]);
const thingsData = ref(get_things_data());

function update_items_data() {
    allRelics.value = save.relics.getAll();
    allItems.value = Object.entries(save.items)
        .filter(([id, count]) => (count as number) > 0)
        .map(([id, count]) => ({
            item: ConsumableItems[id],
            count: count as number
        }));
}

onMounted(() => {
    update_items_data();
    if (thingsData.value.length > 0) {
        selectedItem.value = thingsData.value[0];
    }
});

watch(save.things, () => {
    thingsData.value = get_things_data();
});

watch(save.relics, () => {
    update_items_data();
});

watch(save.items, () => {
    update_items_data();
});

// 处理物品选中
const selectItem = (item: any) => {
    selectedItem.value = item;
};

// 监听标签页切换，重置选中项
watch(activeTab, (newTab) => {
    if (newTab === 'things') {
        selectedItem.value = thingsData.value[0] || null;
    } else if (newTab === 'relics') {
        selectedItem.value = allRelics.value[0] || null;
    } else {
        selectedItem.value = allItems.value[0] || null;
    }
});

function remove() {
    if (!delete_args.value.arg) return;
    const id = delete_args.value.arg.id;
    if (id) {
        save.things.remove(id, delete_args.value.n);
    }
    delete_args.value.n = 1;
    deleteDialog_show.value = false;
}

const attributeTranslations: { [key: string]: string } = {
    atk: '攻击力',
    def_: '防御力',
    speed: '速度',
    hp: '生命值',
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

const isSelected = (item: any) => {
    const id = item.id || item.item?.id;
    const selectedId = selectedItem.value?.id || selectedItem.value?.item?.id;
    return selectedId && selectedId === id;
};

</script>

<template>
    <div class="bag-page">
        <!-- 背景装饰 -->
        <div class="bg-overlay"></div>

        <!-- 侧边导航 -->
        <div class="side-nav">
            <div class="side-title">资源库</div>
            <div class="nav-group">
                <div class="nav-item" :class="{ 'active': activeTab === 'things' }" @click="activeTab = 'things'">
                    <span>基础材料</span>
                </div>
                <div class="nav-item" :class="{ 'active': activeTab === 'relics' }" @click="activeTab = 'relics'">
                    <span>圣遗物箱</span>
                </div>
                <div class="nav-item" :class="{ 'active': activeTab === 'items' }" @click="activeTab = 'items'">
                    <span>战斗道具</span>
                </div>
            </div>
        </div>

        <!-- 主展示区：网格列表 -->
        <div class="main-content">
            <div class="content-header">
                <h1>{{ activeTab === 'things' ? '材料' : (activeTab === 'relics' ? '圣遗物' : '道具') }}</h1>
                <div class="header-line"></div>
            </div>

            <el-scrollbar class="grid-scroll">
                <div class="item-grid">
                    <template v-if="activeTab === 'things'">
                        <div v-for="item in thingsData" :key="item.id" class="grid-item material"
                            :class="{ 'selected': isSelected(item) }" @click="selectItem(item)">
                            <div class="item-icon-box">
                                <img :src="getItemIcon(item)" class="grid-icon" />
                                <span class="item-count">{{ item.count }}</span>
                            </div>
                            <div class="item-name">{{ item.name }}</div>
                        </div>
                        <div v-if="thingsData.length === 0" class="empty-hint">
                            <img :src="icons.empty" />
                            <p>暂时没有材料</p>
                        </div>
                    </template>

                    <template v-else-if="activeTab === 'relics'">
                        <div v-for="item in allRelics" :key="item.id" class="grid-item relic"
                            :class="{ 'selected': isSelected(item) }" @click="selectItem(item)">
                            <div class="item-icon-box"
                                :style="{ borderColor: getRarityColor(item.rarity), backgroundColor: getRarityColor(item.rarity) + '22' }">
                                <img :src="getItemIcon(item)" class="grid-icon" />
                                <span class="relic-lv">+{{ item.level }}</span>
                            </div>
                            <div class="item-name" :style="{ color: getRarityColor(item.rarity) }">{{ item.name }}</div>
                        </div>
                        <div v-if="allRelics.length === 0" class="empty-hint">
                            <img :src="icons.empty" />
                            <p>暂时没有圣遗物</p>
                        </div>
                    </template>

                    <template v-else>
                        <div v-for="itemEntry in allItems" :key="itemEntry.item.id" class="grid-item item"
                            :class="{ 'selected': isSelected(itemEntry.item) }" @click="selectItem(itemEntry)">
                            <div class="item-icon-box"
                                :style="{ borderColor: getRarityColor(itemEntry.item.rarity), backgroundColor: getRarityColor(itemEntry.item.rarity) + '22' }">
                                <div class="grid-icon">✦</div>
                                <span class="item-count">x{{ itemEntry.count }}</span>
                            </div>
                            <div class="item-name" :style="{ color: getRarityColor(itemEntry.item.rarity) }">{{
                                itemEntry.item.name }}</div>
                        </div>
                        <div v-if="allItems.length === 0" class="empty-hint">
                            <img :src="icons.empty" />
                            <p>暂时没有道具</p>
                        </div>
                    </template>
                </div>
            </el-scrollbar>
        </div>

        <!-- 右侧详情面板 -->
        <div class="detail-panel" v-if="selectedItem">
            <el-scrollbar>
                <div class="detail-inner">
                    <div class="detail-header">
                        <div class="detail-icon-large" :style="{
                            borderColor: selectedItem.isThing ? '#aaa' : getRarityColor(selectedItem.rarity),
                            backgroundColor: selectedItem.isThing ? 'rgba(255,255,255,0.05)' : getRarityColor(selectedItem.rarity) + '22'
                        }">
                            <img :src="getItemIcon(selectedItem)" class="large-icon" />
                        </div>
                        <h2
                            :style="{ color: selectedItem.isThing ? '#fff' : getRarityColor(selectedItem.rarity || selectedItem.item?.rarity) }">
                            {{ selectedItem.name || selectedItem.item?.name }}
                        </h2>
                        <div v-if="activeTab === 'relics'" class="detail-rarity">
                            {{ selectedItem.rarity }}★ 圣遗物
                        </div>
                        <div v-else-if="activeTab === 'items'" class="detail-rarity">
                            {{ selectedItem.item?.rarity }}★ 道具
                        </div>
                        <div v-else class="detail-rarity">材料</div>
                    </div>

                    <div class="detail-body">
                        <div class="section-title">描述</div>
                        <p class="detail-desc">{{ selectedItem.desc || selectedItem.item?.description }}</p>

                        <template v-if="activeTab === 'relics'">
                            <div class="section-title">主属性</div>
                            <div class="main-stat" v-if="selectedItem.main_attribute">
                                <span class="stat-key">{{ attributeTranslations[selectedItem.main_attribute.key] ||
                                    selectedItem.main_attribute.key }}</span>
                                <span class="stat-value">+{{ selectedItem.main_attribute.value }}</span>
                            </div>

                            <div class="section-title">副属性</div>
                            <div class="sub-stats">
                                <div v-for="(v, k) in selectedItem.random_attributes" :key="k" class="sub-stat-item">
                                    <span class="stat-key">{{ attributeTranslations[k] || k }}</span>
                                    <span class="stat-value">+{{ v }}</span>
                                </div>
                            </div>

                            <div class="equip-status" :class="{ 'is-equipped': selectedItem.equipped }">
                                {{ selectedItem.equipped ? '已装备' : '未装备' }}
                            </div>
                        </template>

                        <template v-else-if="activeTab === 'items'">
                            <div class="section-title">持有数量</div>
                            <div class="count-display">{{ selectedItem.count }}</div>
                        </template>

                        <template v-else>
                            <div class="section-title">持有数量</div>
                            <div class="count-display">{{ selectedItem.count }}</div>
                        </template>
                    </div>

                    <div class="detail-footer">
                        <sbutton v-if="selectedItem.isThing" :disabled="selectedItem.count <= 0"
                            @click="delete_args.arg = selectedItem; deleteDialog_show = true" style="width: 100%">丢弃物品
                        </sbutton>
                        <p v-else-if="activeTab === 'relics'" class="footer-tip">圣遗物管理请前往角色界面</p>
                        <p v-else class="footer-tip">道具可在战斗中使用</p>
                    </div>
                </div>
            </el-scrollbar>
        </div>

        <!-- 删除对话框 -->
        <el-dialog v-model="deleteDialog_show" title="丢弃物品" width="400px" append-to-body>
            <div class="dialog-content">
                <p>确定要丢弃 <strong>{{ delete_args.arg?.name }}</strong> 吗？</p>
                <div class="slider-box" v-if="delete_args.arg">
                    <div class="slider-label">数量：{{ delete_args.n }}</div>
                    <el-slider v-model="delete_args.n" :min="1" :max="delete_args.arg.count" />
                </div>
                <div class="dialog-footer">
                    <sbutton @click="deleteDialog_show = false">取消</sbutton>
                    <sbutton type="primary" @click="remove">确定丢弃</sbutton>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
.bag-page {
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
    background: radial-gradient(circle at 30% 30%, rgba(45, 55, 72, 0.3) 0%, transparent 70%);
    pointer-events: none;
}

/* Sidebar */
.side-nav {
    width: 200px;
    height: 100%;
    background: rgba(20, 20, 22, 0.8);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    z-index: 2;
    padding: 30px 0;
}

.side-title {
    padding: 0 25px;
    font-size: 1.2rem;
    font-weight: bold;
    color: #f7d358;
    margin-bottom: 30px;
    letter-spacing: 2px;
}

.nav-item {
    padding: 15px 25px;
    cursor: pointer;
    transition: all 0.3s;
    border-left: 4px solid transparent;
    color: #888;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
}

.nav-item.active {
    background: rgba(255, 255, 255, 0.1);
    border-left-color: #f7d358;
    color: #fff;
    font-weight: bold;
}

/* Main Content */
.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 40px;
    z-index: 1;
}

.content-header h1 {
    font-size: 2.5rem;
    margin: 0 0 10px;
}

.header-line {
    width: 60px;
    height: 4px;
    background: #f7d358;
    margin-bottom: 30px;
}

.grid-scroll {
    flex: 1;
}

.item-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
    padding-bottom: 40px;
}

.grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
    padding: 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.grid-item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
}

.grid-item.selected {
    background: rgba(247, 211, 88, 0.15);
    border-color: #f7d358;
}

.item-icon-box {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-bottom: 10px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.grid-icon {
    width: 80%;
    height: 80%;
    object-fit: contain;
}

.item-count {
    position: absolute;
    bottom: 5px;
    right: 8px;
    font-size: 0.8rem;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.relic-lv {
    position: absolute;
    top: 5px;
    left: 8px;
    font-size: 0.7rem;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    padding: 1px 4px;
    border-radius: 4px;
}

.item-name {
    font-size: 0.85rem;
    text-align: center;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Empty State */
.empty-hint {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    opacity: 0.3;
}

.empty-hint img {
    width: 120px;
    margin-bottom: 20px;
}

/* Detail Panel */
.detail-panel {
    width: 380px;
    height: 100%;
    background: rgba(20, 20, 22, 0.8);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 2;
}

.detail-inner {
    padding: 40px 30px;
}

.detail-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
}

.detail-icon-large {
    width: 120px;
    height: 120px;
    border: 3px solid;
    border-radius: 20px;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.large-icon {
    width: 70%;
    height: 70%;
    object-fit: contain;
}

.detail-header h2 {
    font-size: 1.8rem;
    margin: 0 0 10px;
    text-align: center;
}

.detail-rarity {
    font-size: 0.9rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.section-title {
    font-size: 0.8rem;
    color: #f7d358;
    text-transform: uppercase;
    margin-bottom: 12px;
    font-weight: bold;
    letter-spacing: 1px;
    border-left: 3px solid #f7d358;
    padding-left: 10px;
}

.detail-desc {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #ccc;
    background: rgba(255, 255, 255, 0.03);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 30px;
}

.main-stat,
.sub-stat-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 15px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    margin-bottom: 10px;
}

.main-stat {
    border: 1px solid rgba(246, 173, 85, 0.3);
}

.stat-key {
    color: #aaa;
}

.stat-value {
    font-weight: bold;
    color: #fff;
}

.sub-stats {
    margin-bottom: 30px;
}

.equip-status {
    text-align: center;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    color: #666;
}

.equip-status.is-equipped {
    background: rgba(72, 187, 120, 0.1);
    color: #48bb78;
    font-weight: bold;
}

.count-display {
    font-size: 2rem;
    font-weight: bold;
    color: #fff;
    margin-bottom: 30px;
}

.detail-footer {
    margin-top: 50px;
}

.footer-tip {
    text-align: center;
    color: #666;
    font-size: 0.85rem;
    font-style: italic;
}

/* Dialog */
:deep(.el-dialog) {
    background: #1a1a1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

:deep(.el-dialog__title) {
    color: #fff;
}

.dialog-content {
    padding: 10px;
}

.slider-box {
    margin: 30px 0;
}

.slider-label {
    margin-bottom: 15px;
    color: #aaa;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
}
</style>