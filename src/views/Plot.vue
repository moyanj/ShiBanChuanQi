<script setup lang="ts">
    import { ElCard, ElDivider } from 'element-plus';
    import sbutton from '../components/sbutton.vue';
    import { useSaveStore, useDataStore } from '../js/store';
    import { load as load_story, StoryManager } from '../js/plot';

    const saveStore = useSaveStore();
    const dataStore = useDataStore();
    var story_manager: StoryManager = new StoryManager(load_story(saveStore.story_section));
    console.log(story_manager.story.data);
    story_manager.set_current(saveStore.story_index)


</script>

<template>
    <el-card class="plot">
        <el-divider>{{ story_manager.current_data.value.role }}</el-divider>

        <p>{{ story_manager.current_data.value.content }}</p>
        <sbutton @click="story_manager.next()">n</sbutton>

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
        left: 10px;
        right: 10px;

        --el-card-padding: 15px;
        --el-card-border-radius: 25px;
        --el-bg-color: #1d1e1f;
    }

    .el-divider {
        margin: 0 10% 0 10%;
        width: 80%;
    }

</style>