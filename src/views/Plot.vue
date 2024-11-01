<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { ElCard } from 'element-plus';
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
    <el-card>
        <span>{{ story_manager.current_data.value.role }}</span>
        <p>{{ story_manager.current_data.value.content }}</p>
        <sbutton @click="story_manager.next()">n</sbutton>

    </el-card>
</template>

<style scoped lang="scss"></style>