<script setup lang="ts">
    import { ElCard, ElDivider, ElImage } from 'element-plus';
    import sbutton from '../components/sbutton.vue';
    import { useSaveStore, useDataStore } from '../js/store';
    import { load as load_story, StoryManager } from '../js/plot';
    import { icons } from '../js/utils'

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
        <br>
        <div align="center">
            <sbutton @click="story_manager.next()" text><el-image :src="icons.down" /></sbutton>
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
        width: 70%;
    }

</style>