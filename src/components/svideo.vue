<template>
    <div>
        <video ref="videoPlayer" class="video-js vjs-fluid vjs-16-9">
            <slot></slot>
        </video>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import videojs from 'video.js';

type VideoPlayerInstance = ReturnType<typeof videojs>;
type VideoPlayerOptions = Record<string, unknown>;

export default defineComponent({
    name: 'VideoPlayer',
    props: {
        options: {
            type: Object as PropType<VideoPlayerOptions>,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            player: null as VideoPlayerInstance | null
        };
    },
    mounted() {
        const videoElement = this.$refs.videoPlayer;
        if (!(videoElement instanceof Element)) {
            return;
        }

        this.player = videojs(videoElement, this.options, () => {
            return undefined;
        });
    },
    beforeUnmount() {
        this.player?.dispose();
        this.player = null;
    }
});
</script>

<style scoped>
.video-js {
    width: 100%;
    height: 100%;
}
</style>
