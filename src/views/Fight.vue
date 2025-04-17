<script setup lang="ts">
import { ref } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { ElImage, ElAvatar } from 'element-plus';
import { useDataStore, useSaveStore } from '../js/store';
import { icons, MersenneTwister } from '../js/utils';
import sbutton from '../components/sbutton.vue';
import card from '../components/card.vue'

const data = useDataStore();
const save = useSaveStore();
const random = new MersenneTwister()

var show_manager = ref(false);

onKeyStroke("Escape", (e) => {
    e.preventDefault();
    if (show_manager.value) {
        show_manager.value = false;
    } else {
        show_manager.value = true;
    }

})

var emeny_name = "test"


</script>

<template>
    <div class="content fight-c">
        <sbutton @click="show_manager = true" class="menu">
            <el-image :src="icons.menu" style="width: 24px;height: 24px;" />
        </sbutton>
        <div class="toolbar">
            <div>
                <el-avatar><img :src="`avatars/${random.randint(1, 100)}.png`" id="avatar"></el-avatar>
            </div>
            <div>
                <el-avatar><img :src="save.user_avatar" id="avatar"></el-avatar>
            </div>
        </div>
        <div class="enemy">
            <div class="character">
                <card character="ShuiLiFang"></card>
                <card character="FanShiFu"></card>

            </div>
        </div>
        <div class="our">
            <div class="character">
                <card character="ShuiLiFang"></card>

            </div>
            <div class="atk">
                <div><img :src="icons.sword" id="general" /></div>
                <div id="skill">技能</div>
                <div id="super-skill">爆发技</div>
            </div>
        </div>
    </div>

    <div class="content" v-if="show_manager" style="z-index: 1003;backdrop-filter: blur(10px);">
        <div class="manager">
            <sbutton @click="show_manager = false" text small>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon">
                    <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18 6L6 18M6 6l12 12" />
                </svg>
            </sbutton>
            <sbutton @click="data.page_type = 'main'">退出战斗</sbutton>
            <br>
            <h2>正在与{{ emeny_name }}战斗</h2>
        </div>
    </div>

</template>

<style scoped>
.content {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
}

.back {
    display: none;
}

.menu {
    position: fixed;
    left: 15px;
    top: 15px;
    z-index: 1002;
}

.manager {
    margin: 15px;
}

.fight-c {
    background: no-repeat url('../assets/bg/fight.jpeg');
    background-size: cover;

    .enemy,
    .our {
        width: 100vw;
        height: 50vh;
        display: flex;
        justify-items: center;

        .character {
            margin: 0 auto;
            display: flex;
            margin-top: 35px;
        }
    }

}

.toolbar {
    border-radius: 10px 10px 10px 10px;
    position: fixed;
    top: calc(50vh - 150px / 2);
    width: 30px;
    height: 150px;
    background-color: #2a2a2a;
    margin-left: 10px;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.3);

    padding: 10px;

    div {
        height: 50%;
        width: 100%;

        .el-avatar {
            width: 30px;
            height: 30px;
        }
    }
}

.atk {
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 210px;
    height: 50px;
    display: flex;

    div {
        background-color: green;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-left: 10px;
        margin-right: 10px;
        line-height: 50px;
        text-align: center;

        img {
            width: 95%;
            height: auto;
        }
    }
}
</style>