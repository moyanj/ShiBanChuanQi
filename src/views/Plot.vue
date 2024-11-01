<script setup lang="ts">
import { ElCard } from 'element-plus';
import { useSaveStore, useDataStore } from '../js/store';
import { load as load_story , StoryManager} from '../js/plot';

const saveStore = useSaveStore();
const dataStore = useDataStore();
var story_manager: StoryManager = new StoryManager(load_story(saveStore.story_section));

</script>

<template>
    
</template>

<style scoped lang="scss">
</style>