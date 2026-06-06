<template>
    <!-- class 与 vue-draggable-plus 的 handle 保存一致 -->
    <div class="drag-handle">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 5a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2M18 5a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2m-6 0a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-6a1 1 0 1 1 0 2a1 1 0 0 1 0-2m6 12a1 1 0 1 1 0 2a1 1 0 0 1 0-2m-6 0a1 1 0 1 1 0 2a1 1 0 0 1 0-2"/></svg>
    </div>
</template>


<script setup lang="ts" name="DragBtn">

</script>


<style scoped>
  .drag-handle {
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
