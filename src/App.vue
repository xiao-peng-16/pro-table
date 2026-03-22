<template>
  <div style="width: 100%;height: 100%;" class="system-theme" :class="[systemTheme]">
    <ConfigProvider style="width: 100%;height: 100%;">
    <router-view  style="width: 100%;height: 100%;"></router-view>
  </ConfigProvider>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppStore } from '@/store/modules/app'
</script>

<style scoped>


</style>
