<script setup>
  // 导入页面组件
  import Home from './views/Home.vue';
  import Fight from './views/Fight.vue';
  import Plot from './views/Plot.vue';
  import About from './views/About.vue';
  import Setting from './views/Setting.vue';
  import Bag from './views/Bag.vue';
  import Character from './views/Character.vue';
  import Wish from './views/Wish.vue';
  import { icons } from './js/utils';
  import { ThingList } from './js/things';
  // 导入状态管理库
  import { useDataStore, useSaveStore } from './js/store';

  // 导入 Element Plus 的消息框组件
  import { ElMessageBox, ElButton, ElImage } from 'element-plus';

  // 初始化数据存储
  const dataStore = useDataStore();
  const saveStore = useSaveStore();

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
      if (import.meta.env.MODE == "development") {
        console.log(error);
      } else {
        ElMessageBox.alert("配置文件加载错误，请重新下载游戏", '错误', {
          confirmButtonText: '确定',
          type: 'error',
        }).then(()=> {
          window.close();
        });
      }

    });

  // 监听键盘
  document.onkeydown = function (e) {
    // 当按下 Alt+T 且控制台未显示时
    if (e.code == "KeyT" && e.altKey && !dataStore.console_show) {
      // 显示控制台
      dataStore.console_show = true;

      // 弹出消息框请求用户输入命令
      ElMessageBox.prompt('请输入命令', '控制台', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        // 解析命令
        let cmds = value.split(" ");
        let cmd = cmds[0];
        console.log(cmds);

        // 根据命令执行对应操作
        switch (cmd) {
          case "help":
            // 显示帮助信息
            break;
          case "set_data":
            // 修改数据存储中的数据
            dataStore.$patch({
              [cmds[1]]: cmds[2]
            });
            break;

          case "get_data":
            alert(dataStore[cmds[1]]);
            break;

          case "set_save":
            saveStore.$patch({
              [cmds[1]]: cmds[2]
            });
            break;

          case "get_save":
            alert(saveStore[cmds[1]]);
            break;

          case "add_thing":
            let thing = ThingList[cmds[1]];
            if (thing == undefined) {
              alert("物品不存在");
              break;
            }
            saveStore.things.add(new thing());
            break

          case "exit":
            dataStore.console_show = false;
            window.close();
            break;

          case "devtools":
            window.openDevTools()

          default:
            // 当命令未知时提示用户
            alert("未知命令");
        }

        // 隐藏控制台
        dataStore.console_show = false;
      })
        .catch(() => {
          // 用户取消输入时隐藏控制台
          dataStore.console_show = false;
        })
    }
  }
</script>

<template>

  <!-- 根据数据存储中的 page_type 显示不同页面 -->
  <Home v-if="dataStore.page_type == 'main'" />
  <div v-else>
    <el-button @click="dataStore.page_type = 'main'" class="back"><el-image :src="icons.left"
        style="width: 25px;height: 25px;" /></el-button>

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

      <el-button @click="dataStore.page_type = 'main'">返回</el-button>

    </div>
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
    z-index: 999;
  }

</style>