<template>
    <div>
        <video ref="videoPlayer" class="video-js vjs-fluid vjs-16-9">
            <slot></slot>
        </video>
    </div>
</template>

<script lang="ts">
import videojs from 'video.js';

export default {
    name: 'VideoPlayer',
    props: {
        options: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            player: null
        }
    },
    mounted() {
        this.player = videojs(this.$refs.videoPlayer, this.options, () => {
        });
    },
    beforeDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    }
}
</script>

<style scoped>
.video-js {
    width: 100%;
    height: 100%;
}
</style>