<template>
  <div class="tool-header-wrapper">
    <div class="tool-header__left">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" v-show="breadcrumb" class="breadcrumb" style="transition: all 0.2;">
        <el-breadcrumbItem v-for="item in breadcrumbItemList">
         
          <span>{{ item.title }}</span>
        </el-breadcrumbItem>
      </el-breadcrumb>
    </div>
    <div class="tool-header__right">
      <el-tooltip placement="bottom" effect="dark" content="个性化主题设置">
      </el-tooltip>
      <UserInfo></UserInfo>
    </div>
    <ThemeSetting ref="ThemeSettingRef"></ThemeSetting>
  </div>
</template>


<script setup lang="ts" name="ToolHeader">
  import '../../style/tool-header.scss'
  import { computed, ref, unref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElBreadcrumb, ElBreadcrumbItem, ElTooltip } from "element-plus"
  import UserInfo from './UserInfo.vue'
  import ThemeSetting from './ThemeSetting.vue'
  import { useAppStore } from '@/store/modules/app'
  import { usePermissionStore } from '@/store/modules/permission'
  import { menuRouterItem } from '@/types/menuRouterItem'
  
  const ThemeSettingRef = ref<InstanceType<typeof ThemeSetting>>()

  const appStore = useAppStore()

  const { push, currentRoute } = useRouter()
  const permissionStore = usePermissionStore()
  const menuRouters:menuRouterItem[] = permissionStore.getMenuRouters

  
  // 菜单折叠
  const collapse = computed(() => appStore.getCollapse)
  // 菜单折叠Icon
  const collapseIcon = computed(() => appStore.getCollapseIcon)
  // 切换菜单折叠
  const toggleCollapse = () => {
    const collapsed = unref(collapse)
    appStore.setCollapse(!collapsed)
  }

  // 面包屑
  const breadcrumb = computed(() => appStore.getBreadcrumb)
  // 面包屑Icon
  const breadcrumbIcon = computed(() => appStore.getBreadcrumbIcon)


  // 面包屑list 根据route地址
  const fintBreadcrumbItemListByPath = (list:menuRouterItem[], path:string):menuRouterItem[] => {
    for (let index in list) {
      const item:menuRouterItem = list[index]
      if (item?.path === path) {
          return [ item ]
      } else if (item?.children && item?.children?.length > 0) {
        const fullRouteList = fintBreadcrumbItemListByPath(item?.children, path)
        return (fullRouteList && fullRouteList.length > 0) ? [ item, ...fullRouteList ] : []
      }
    }
    return []
  }

  // 面包屑list
  const breadcrumbItemList = computed(() => {
    const { fullPath } = currentRoute.value
    return fintBreadcrumbItemListByPath(menuRouters, fullPath)
  })

  // 打开个性化主题设置
  const openThemeSetting = () => {
    ThemeSettingRef.value.openDrawer()
  }
</script>