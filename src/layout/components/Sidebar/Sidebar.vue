<template>
  <div class="sidebar-wrapper">
    <div class="logo-wrapper">
      <div class="img-wrapper">
        <img src="@/assets/imgs/logo.png"/>
      </div>
      <span v-show="!collapse">ProTabke</span>
    </div>
    <div class="menu-select-wrapper">
      <el-cascader 
        v-model="cascaderPath"
        :options="menuRouters" 
        filterable
        :props="{ label: 'title', value: 'path', emitPath: false, expandTrigger: 'hover' }"
        placeholder="搜索菜单"
        @change="onSelectMenu"
      />
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
        <el-menu
          :defaultActive="activeMenu"
          :collapse="collapse"
        >
          <sidebar-item v-for="(item, index) in menuRouters" :item="item"/>
        </el-menu>
    </el-scrollbar>
  </div>
</template>


<script setup lang="ts" name="Sidebar">
  import '../../style/sidebar.scss'
  import { computed, ref, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElCascader , ElScrollbar } from "element-plus"
  import SidebarItem from './SidebarItem.vue'
  import { useAppStore } from '@/store/modules/app'
  import { usePermissionStore } from '@/store/modules/permission'
  import { menuRouterItem } from '@/types/menuRouterItem'

  const appStore = useAppStore()
  // 菜单折叠
  const collapse = computed(() => appStore.getCollapse)

  const { push, currentRoute } = useRouter()
  // 激活的菜单栏
  const activeMenu = computed(() => {
      const { fullPath } = currentRoute.value
      return fullPath
  })

  const permissionStore = usePermissionStore()
  const menuRouters:menuRouterItem[] = permissionStore.getMenuRouters

  const cascaderPath = ref<string>()
  const onSelectMenu = (path) => {
    push({path})
    nextTick(() => {
        cascaderPath.value = undefined
    })
  }
</script>



