<template>
  <div class="layout-wrapper not-mobile"
  :class="[collapse ? 'collapse' : 'not-collapse']"
  >
    <!-- 左侧菜单栏 -->
    <div class="layout-left">
      <Sidebar></Sidebar>
    </div>
    <div class="layout-content">
      <div class="layout-content__top" :class="{ 'layout-content__top_fixed': fixedHeader }">
        <!-- 顶部工具栏 -->
        <ToolHeader></ToolHeader>
        <!-- tag标签页 -->
      </div>
      <!-- 占位 -->
      <div v-show="fixedHeader" style="height: var(--top-tool-height);"></div>
      <div v-show="fixedHeader && tagsView" style="height: var(--tags-view-height)"></div>
      <!-- 内容区 -->
      <div class="layout-content__app-wrapper">
          <div class="layout-content-app">
            <AppView></AppView>
          </div>
      </div>
    </div>
    <!-- 返回顶部 -->
    <el-backtop :right="20" :bottom="100" />
  </div>
</template>


<script setup lang="ts" name="AppView">
  import './style/index.scss'
  import { computed, unref } from 'vue'
  import { useAppStore } from '@/store/modules/app'
  import Sidebar from "./components/Sidebar/Sidebar.vue"
  import ToolHeader from "./components/ToolHeader/ToolHeader.vue"
  import AppView from "./components/AppView.vue"
  import { ElBacktop, ElScrollbar } from "element-plus"

  const appStore = useAppStore()
  // fixed固定头部工具栏和tag标签页
  const fixedHeader = computed(() => appStore.getFixedHeader)
  // 菜单折叠
  const collapse = computed(() => appStore.getCollapse)
  // 标签页
  const tagsView = computed(() => appStore.getTagsView)
</script>