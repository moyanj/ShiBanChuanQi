<script setup lang="ts">
  // 导入页面组件
  import Home from './views/Home.vue';
  import Fight from './views/Fight.vue';
  import Plot from './views/Plot.vue';
  import About from './views/About.vue';
  import Setting from './views/Setting.vue';
  import Bag from './views/Bag.vue';
  import Character from './views/Character.vue';
  import Wish from './views/Wish.vue';


  import sbutton from './components/sbutton.vue';
  import { icons, isLandscape } from './js/utils';
  import { console_handler } from './js/key';
  import { useDataStore, APM } from './js/store';

  // 导入 Element Plus 的消息框组件
  import { ElMessageBox, ElImage } from 'element-plus';

  import { KeepAlive, watch } from 'vue';
  import { useMagicKeys } from '@vueuse/core';

  // 初始化数据存储
  const dataStore = useDataStore();

  if (isLandscape() === false) {
    ElMessageBox.alert("请切换至横屏，以获得更好的体验", '警告', {
      confirmButtonText: '确定',
      type: 'warning',
      showClose: false,

    })
  }

  fetch('build_info.json')
    .then(response => response.json())
    .then(data => {
      if (data.type == "electron") {
        dataStore.is_electron = true;
      } else {
        dataStore.is_electron = false;
      }

      // 将数据存储到数据存储中
      dataStore.build_info = data;
    })
    .catch(error => {
      if (dataStore.is_dev) {
        console.log(error);
      } else {
        ElMessageBox.alert("配置文件加载错误，请重新下载游戏", '错误', {
          confirmButtonText: '确定',
          type: 'error',
        }).then(() => {
          window.close();
        }).catch(() => {
          window.close();
        });
      }

    });

  APM.add("background_music", 'audio/background/main.mp3', { loop: true });
  if (!dataStore.is_dev) {
    APM.play("background_music");
  }


  if (!dataStore.is_electron) {
    if (!dataStore.is_dev) {
      ElMessageBox.alert("当前为网页版，推荐使用electron版游戏体验更佳", '警告', {
        confirmButtonText: '确定',
        type: 'warning',
      })
    }
  }
  const keys = useMagicKeys();

  watch(keys["Alt+T"], console_handler)


</script>

<template>
  <!-- 根据数据存储中的 page_type 显示不同页面 -->
  <Home v-if="dataStore.page_type == 'main'" />
  <div v-else>
    <sbutton @click="dataStore.page_type = 'main'" class="back"><el-image :src="icons.left"
        style="width: 25px;height: 25px;" /></sbutton>
    <keep-alive :max="7">
      <Plot v-if="dataStore.page_type == 'plot'" />
      <Fight v-else-if="dataStore.page_type == 'fight'" />
      <About v-else-if="dataStore.page_type == 'about'" />
      <Setting v-else-if="dataStore.page_type == 'setting'" />
      <Bag v-else-if="dataStore.page_type == 'bag'" />
      <Character v-else-if="dataStore.page_type == 'character'" />
      <Wish v-else-if="dataStore.page_type == 'wish'" />


      <div v-else align="center">
        <!-- 设置404变量 -->

        <h1>666, 隐藏界面被你玩出来了</h1>

        <sbutton @click="dataStore.page_type = 'main'">返回</sbutton>

      </div>
    </keep-alive>
  </div>
  <!-- 404 -->


</template>

<style lang="scss" scoped>
  .back {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 30px;
    height: 30px;
    z-index: 1145;
  }

</style>