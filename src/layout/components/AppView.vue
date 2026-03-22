<template>
  <router-view>
    <template #default="{ Component, route }">
        <keep-alive>
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </template>
  </router-view>
</template>


<script setup lang="ts" name="AppView">
</script>