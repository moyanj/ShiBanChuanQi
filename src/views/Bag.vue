<script lang="ts" setup>
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import { ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElSlider, ElTabs, ElTabPane, ElScrollbar, ElPagination } from 'element-plus';
import sbutton from '../components/sbutton.vue';
import { useSaveStore } from '../js/stores';
import { ThingList } from '../js/things';
import { Item } from '../js/item';
import { useMagicKeys } from '@vueuse/core';
import { icons } from '../js/utils';

const save = useSaveStore();
console.log(save);
var deleteDialog_show = ref(false);
var delete_args = ref({
    n: 1,
    arg: null
});
var activeTab = ref('things'); // 默认激活物品标签页

// Pagination state
const currentPage = ref(1);
const pageSize = ref(20);

const keys = useMagicKeys();

watch(keys["ArrowLeft"], () => {
    if (activeTab.value === 'items') {
        activeTab.value = 'things';
    }
});

watch(keys["ArrowRight"], () => {
    if (activeTab.value === 'things') {
        activeTab.value = 'items';
    }
});

function update_data() {
    let data = [];
    const things = save.things.get_all();
    for (let id in things) {

        let thing = ThingList[id];
        if (!thing) {
            continue;
        }
        thing = new thing();
        let count = save.things.get(id);
        if (count == 0) {
            continue;
        }
        data.push({
            id: id,
            name: thing.name,
            desc: thing.desc,
            count: count,
        });

    }
    return data;
}

// Optimization: Cache the full list of items
// Ideally, save.items should notify us of specific changes, but here we just optimize the read.
// We use a shallowRef or just a regular ref for the full list if it's huge, 
// but since we paginate, we only render a slice.
const allItems = ref<Item[]>([]);

function update_items_data() {
    // Only fetch getAll() when necessary or on mount
    const items = save.items.getAll();
    allItems.value = items;
}

// Call once on mount
onMounted(() => {
    update_items_data();
});

function remove(data) {
    console.log(data.n);
    let id = data.arg.row.id;

    if (id) {
        save.things.remove(id, data.n);
    }
    data.n = 1;
    deleteDialog_show.value = false;
}

// 转换为el-table的格式
const table_data = ref(update_data());

// Watch for changes in store but debounce or throttle if needed for huge lists.
// Here we just update the local cache.
watch(save.things, () => {
    table_data.value = update_data();
});

watch(save.items, () => {
    update_items_data();
});

// Computed property for paginated items
const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return allItems.value.slice(start, end);
});

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    currentPage.value = 1; // Reset to page 1
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val;
}


// 属性名称中文翻译映射
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

</script>

<template>
    <div class="page-container">
        <h1 align="right">背包</h1>
        <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="物品" name="things">
                <el-table :data="table_data" class="table" empty-text="暂无物品">
                    <el-table-column prop="name" label="物品名"></el-table-column>
                    <el-table-column prop="desc" label="描述"></el-table-column>
                    <el-table-column prop="count" label="数量"></el-table-column>
                    <el-table-column label="操作">
                        <template #default="scope">
                            <sbutton @click="delete_args.arg = scope; deleteDialog_show = true" text> 删除</sbutton>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="圣遗物" name="items">
                <div class="table-container">
                    <el-table :data="paginatedItems" class="table" empty-text="暂无圣遗物" height="100%">
                        <el-table-column label="名称" width="180">
                            <template #default="scope">
                                <span :style="{ color: getRarityColor(scope.row.rarity) }">
                                    {{ scope.row.name }} <span v-if="scope.row.level > 0">+{{ scope.row.level }}</span>
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="稀有度" prop="rarity" width="80" sortable>
                            <template #default="scope">
                                {{ scope.row.rarity || 1 }}★
                            </template>
                        </el-table-column>
                        <el-table-column label="主属性" width="120">
                            <template #default="scope">
                                <div v-if="scope.row.main_attribute" style="color: #E6A23C">
                                    {{ attributeTranslations[scope.row.main_attribute.key] || scope.row.main_attribute.key
                                    }}
                                    +{{ scope.row.main_attribute.value }}
                                </div>
                                <div v-else style="color: gray">无</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="副属性">
                            <template #default="scope">
                                <span v-for="(value, key) in scope.row.random_attributes" :key="key"
                                    style="margin-right: 10px; display: inline-block;">
                                    {{ attributeTranslations[key] || key }}: +{{ value }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="80">
                            <template #default="scope">
                                <span :style="{ color: scope.row.equipped ? 'green' : 'gray' }">
                                    {{ scope.row.equipped ? '已装备' : '未装备' }}
                                </span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="pagination-wrapper">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :page-sizes="[20, 50, 100, 200]"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="allItems.length"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </div>
            </el-tab-pane>
        </el-tabs>

        <el-dialog v-model="deleteDialog_show" title="删除物品">
            <el-form>
                <el-form-item label="数量：">
                    <el-slider v-model="delete_args.n" :min="1" :max="delete_args.arg.row.count" show-input />
                </el-form-item>
                <el-form-item>
                    <sbutton type="primary" @click="remove(delete_args)">确定</sbutton>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<style scoped>
.page-container {
    padding: 20px;
    height: 100vh;
    box-sizing: border-box;
}

body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;

}

.table {
    height: 100%;
}

.table-container {
    height: calc(100vh - 210px); /* 留出分页空间 */
}

.pagination-wrapper {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
    background-color: #26272b;
    padding: 5px;
    border-radius: 4px;
}
</style>