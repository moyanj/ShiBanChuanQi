<script setup lang="ts">
  import { ref } from 'vue'
</script>

<template>
  <div class="about">
    <div class="about-content">
      <div class="about-content-title">
        <div class="about-content-title-text">关于</div>
      </div>
      <div class="about-content-text">
        <div class="about-content-text-item">
          <div class="about-content-text-item-title">版本</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .about{
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
  }
  .about-content{
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    overflow: auto;
    .about-content-title{
        width: 100%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        .about-content-title-text{
            font-size: 30px;
            font-weight: bold;
        }
    }


  }
</style>