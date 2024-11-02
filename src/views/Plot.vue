<script setup lang="ts">
    import { ElCard, ElDivider, ElImage,ElButton } from 'element-plus';
    import { useSaveStore, useDataStore } from '../js/store';
    import { load as load_story, StoryManager } from '../js/plot';
    import { icons } from '../js/utils'

    const saveStore = useSaveStore();
    
    var story_manager: StoryManager = new StoryManager(load_story(saveStore.story_section),saveStore.story_index);
    

</script>

<template>
    <h1 v-if="story_manager.current_data.value == null"></h1>
    <el-card class="plot" v-else @click="story_manager.next()">
        <el-divider>{{ story_manager.current_data.value.role }}</el-divider> <!-- 角色名 -->

        <p v-html="story_manager.current_data.value.content"></p> <!-- 内容 -->
        <br>
        <div align="center">
            <el-button @click="story_manager.next()" text size="small" class="next"><el-image :src="icons.down" /></el-button>
        </div>

    </el-card>
</template>

<style scoped lang="scss">
    body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .plot {
        height: 20vh;
        // 固定至底部
        position: fixed;
        bottom: 15px;
        left: 15%;
        right: 15%;
        width: 70%;

        --el-card-padding: 15px;
        --el-card-border-radius: 25px;
        --el-bg-color: #1d1e1f;
    }

    .el-divider {
        margin: 0 15% 0 15%;
        width: calc(100% - 30%);
    }

    .next {
        position: absolute;
        bottom: 10px;
    }

</style>