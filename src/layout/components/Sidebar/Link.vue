<template>
  <a v-if="isExternal()" :href="path" target="_blank" rel="noopener" style="text-decoration: none;">
    <slot></slot>
  </a>
  <router-link v-else :to="path" style="text-decoration: none;">
    <slot></slot>
  </router-link>
</template>

<script setup lang="ts" name="SidebarItemLink">
  const props = withDefaults(
    defineProps<{
      path: string
    }>(),
    {
      path: () => null
    }
  )
  // 是否外部地址
  function isExternal() {
    return /^(https?:|mailto:|tel:)/.test(props.path)
  }
</script>