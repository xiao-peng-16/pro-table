<template>
  <el-sub-menu  v-if="item.children" :index="item.title + index">
    <template #title>
      <span>{{ item.title }}</span>
    </template>
    <sidebar-item
      v-for="(child, index) in item.children"
      :item="child"
    />
  </el-sub-menu>
  <Link v-else :path="item.path">
    <el-menu-item :index="item.path">
      <span>{{ item.title }}</span>
    </el-menu-item>
  </Link>
</template>


<script setup lang="ts" name="SidebarItem">
  import '../../style/sidebar.scss'
  import { computed, unref } from 'vue'
  import { ElSubMenu, ElMenuItem } from "element-plus";
  import Link from './Link.vue';
  import { usePermissionStore } from '@/store/modules/permission'
  import { menuRouterItem } from '@/types/menuRouterItem'

  const props = withDefaults(
    defineProps<{
      index: string
      item: menuRouterItem
    }>(),
    {
      index: () => null,
      item: () => null
    }
  )

  
  const permissionStore = usePermissionStore()
  const menuRouters:menuRouterItem[] = permissionStore.getMenuRouters

</script>
