<template>
  <div class="tags-view-wrapper">

      
  </div>
</template>


<script setup lang="ts" name="TagsView">
  import '../style/tags-view.scss'
  import { computed, unref } from 'vue'
  import { useAppStore } from '@/store/modules/app'
  import { Icon } from '@/components'

  const appStore = useAppStore()

</script>