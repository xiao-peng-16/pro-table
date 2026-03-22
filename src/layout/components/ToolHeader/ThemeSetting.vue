<template>
   <el-drawer
    class="theme-setting-wrapper"
    v-model="drawerVisible"
    title="项目设置"
    size="350px" 
    :z-index="100"
  >
    <el-divider>主题</el-divider>
    <div class="system-theme-wrapper">
      <el-radio-group v-model="systemTheme" @change="onChangeSystemTheme">
        <el-radio value="system-theme-default">默认</el-radio>
        <el-radio value="system-theme-light">明亮</el-radio>
        <el-radio value="system-theme-dark">暗黑</el-radio>
      </el-radio-group>
    </div>

    <div class="setting-item-wrapper">
      <span>固定头部</span>
      <el-switch :model-value="fixedHeader" @change="toggleFixedHeader" />
    </div>
    <div class="setting-item-wrapper">
      <span>菜单折叠图标</span>
      <el-switch :model-value="collapseIcon" @change="toggleCollapseIcon" />
    </div>
    <div class="setting-item-wrapper">
      <span>面包屑</span>
      <el-switch :model-value="breadcrumb" @change="toggleBreadcrumb" />
    </div>
    <div class="setting-item-wrapper">
      <span>面包屑图标</span>
      <el-switch :model-value="breadcrumbIcon" @change="toggleBreadcrumbIcon" />
    </div>
    <div class="setting-item-wrapper">
      <span>标签页</span>
      <el-switch :model-value="tagsView" @change="toggleTagsView" />
    </div>
    <div class="setting-item-wrapper">
      <span>标签页图标</span>
      <el-switch :model-value="tagsViewIcon" @change="toggleTagsViewIcon" />
    </div>
    <el-divider/>
    <el-button 
      type="danger" 
      style="width: 100%;"
      @click="resetSetting"
    >
        清除缓存并重置
    </el-button>
  </el-drawer>
</template>


<script setup lang="ts" name="ThemeSetting">
  import '../../style/theme-setting.scss' 
  import { ref, unref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAppStore } from '@/store/modules/app'
  import { ElDrawer, ElDivider , ElRadioGroup, ElRadio, ElSwitch , ElButton } from "element-plus"

  const appStore = useAppStore()
  const drawerVisible = ref(false)

  // 开启抽屉
  const openDrawer = () => {
    drawerVisible.value = true
  }

  // 系统主题
  const systemTheme = computed(() => appStore.getSystemTheme)
  const onChangeSystemTheme = (systemTheme) => {
    appStore.setSystemTheme(systemTheme)
  }

  // fixed固定头部工具栏和tag标签页
  const fixedHeader = computed(() => appStore.getFixedHeader)
  // 切换fixed固定头部工具栏和tag标签页
  const toggleFixedHeader = (show: boolean) => {
    appStore.setFixedHeader(show)
  }

  // 菜单折叠Icon
  const collapseIcon = computed(() => appStore.getCollapseIcon)
  // 切换菜单折叠Icon
  const toggleCollapseIcon = (show: boolean) => {
    appStore.setCollapseIcon(show)
  }

  // 面包屑
  const breadcrumb = computed(() => appStore.getBreadcrumb)
  // 切换面包屑
  const toggleBreadcrumb = (show: boolean) => {
    appStore.setBreadcrumb(show)
    appStore.setBreadcrumbIcon(show)
  }

  // 面包屑Icon
  const breadcrumbIcon = computed(() => appStore.getBreadcrumbIcon)
  // 切换面包屑Icon
  const toggleBreadcrumbIcon = (show: boolean) => {
    appStore.setBreadcrumbIcon(show)
  }

  // 标签页
  const tagsView = computed(() => appStore.getTagsView)
  // 切换面包屑
  const toggleTagsView = (show: boolean) => {
    appStore.setTagsView(show)
    appStore.setTagsViewIcon(show)
  }

  // 面包屑Icon
  const tagsViewIcon = computed(() => appStore.getTagsViewIcon)
  // 切换标签页Icon
  const toggleTagsViewIcon = (show: boolean) => {
    appStore.setTagsViewIcon(show)
  }



  // 重置设置
  const resetSetting = () => {
    appStore.$reset()
  }


  defineExpose({
    openDrawer
  })

</script>