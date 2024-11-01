<template>
    <el-button @click="playSound" :type="type" :icon="icon" :disabled="disabled" :text="text" :size="size">
      <slot></slot>
    </el-button>
  </template>
  
  <script setup>
  import { ElButton } from 'element-plus';
  import { APM } from '../js/store';
  
  const props = defineProps({
    type: {
      type: String,
    },
    icon: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    text: {
      type: Boolean,
      default: false,
    },
    size: {
        type: String,
        default: 'default',
    }
  });
  APM.add("click_sound", 'audio/click.mp3')
  const playSound = () => {
    console.log("click");
    APM.play("click_sound");
  };
  </script>
  
  <style scoped>
  /* 你可以在这里添加自定义样式 */
  </style>