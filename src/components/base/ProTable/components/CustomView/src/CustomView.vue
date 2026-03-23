<template>
  <ElDialog
    v-model="dialogVisible"
    :title="title"
    class="dialog-wrapper"
    draggable
    destroy-on-close
    width="950px"
  >

  <el-tabs
    v-model="tabs_active"
    class="demo-tabs"
    tab-position="left"
  >
  
    <!-- [全局] 设置 -->
    <el-tab-pane label="全局设置" name="global_config">
      <GlobalCustomView
        v-if="tabs_active === 'global_config'"
        @update:custom-global="onUpdateCustomGlobal"
        @cancel="cancel"
      >
      </GlobalCustomView>
    </el-tab-pane>

    <!-- [搜索条件] 设置 -->
    <el-tab-pane label="搜索条件" name="filter_config" v-if="sourceFilters && sourceFilters.length > 0">
    <!-- Filter列字段自定义设置组件 -->
      <FilterCustomView
        v-if="tabs_active === 'filter_config'"
        ref="FilterCustomViewRef"
        :custom-id="customId"
        :sourceFilters="sourceFilters"
        @update:custom-filter="onUpdateCustomFilter"
        @update:custom-global="onUpdateCustomGlobal"
        @cancel="cancel"
      >
        <!-- Filter 插槽透传 -->
        <template v-for="itemSlot in getProTableFilterSlots(sourceFilters)" :key="itemSlot" v-slot:[itemSlot]="temp">
          <slot :name="itemSlot" v-bind="temp"></slot>
        </template>
      </FilterCustomView>
    </el-tab-pane>

    <!-- [列表字段] 设置 -->
    <el-tab-pane label="列表字段" name="table_config"  v-if="sourceColumns && sourceColumns.length > 0">
        <!-- Table列字段自定义设置组件 -->
        <TableCustomView
          v-if="tabs_active === 'table_config'"
          ref="TableCustomViewRef"
          :custom-id="customId"
          :sourceColumns="sourceColumns"
          @update:custom-columns="onUpdateCustomColumns"
          @cancel="cancel"
        >
          <!-- TableColumn表头插槽透传 -->
          <template v-for="itemSlot in getTableColumnHeaderSlot(sourceColumns)" :key="itemSlot" v-slot:[itemSlot]="temp">
            <slot :name="itemSlot" v-bind="temp"></slot>
          </template>
        </TableCustomView>
    </el-tab-pane>
  </el-tabs>

  </ElDialog>
</template>

<script setup lang="ts">
  import { watch, useAttrs, ref, useSlots } from 'vue'
  import { ElDialog, ElTabs, ElTabPane } from 'element-plus'
  import FilterCustomView from './FilterCustomView.vue'
  import TableCustomView from './TableCustomView.vue'
  import GlobalCustomView from './GlobalCustomView.vue'
  import { FilterItem, TableColumnItem } from "@/components/base/ProTable"
  import { getProTableFilterSlots, getTableColumnHeaderSlot } from '@/components/base/ProTable/utils'
  const slots  = useSlots()
  const attrs = useAttrs()
  const props = withDefaults(
    defineProps<{
      // 表格唯一标识（由于ProTable获取后传入）
      customId?: string
      // 搜索条件字段列表
      sourceFilters?: FilterItem[],
      // 列表字段列表
      sourceColumns?: TableColumnItem[]
    }>(),
    {
      customId: '',
      sourceFilters: () => [],
      sourceColumns: () => [],
    }
  )

  const emit = defineEmits<{
    // [全局配置]自定义配置完成
    (e: 'update:custom-global')
    // [搜索条件字段]自定义配置完成
    (e: 'update:custom-filter', customConfig: FilterItem[])
    // [列表字段]自定义配置完成
    (e: 'update:custom-columns', newColumns: TableColumnItem[])
  }>()

  const title = ref()
  type tabs_active_type = 'global_config' | 'filter_config' | 'table_config'
  const tabs_active = ref<tabs_active_type>()

  watch(
    () => tabs_active.value,
    (active) => {
      if(active === 'global_config') {
        title.value = '全局设置'
      }
      if(active === 'filter_config') {
        title.value = '搜索条件设置'
      }
      if(active === 'table_config') {
        title.value = '列表字段设置'
      }
    },
    { immediate: true }  // 立即执行：组件初始化时也会进行一次列处理，替代原先的手动初始化赋值。
  )

  // 事件 取消 关闭弹框
  const cancel = () =>{
    dialogVisible.value = false
  }

  // 事件 [全局配置] 自定义配置完成
  const onUpdateCustomGlobal = () =>{
    emit('update:custom-global')
    dialogVisible.value = false
  }

  // 事件 [搜索条件字段] 自定义配置完成
  const onUpdateCustomFilter = (newFilters: FilterItem[]) =>{
    emit('update:custom-filter', newFilters)
    dialogVisible.value = false
  }

  // 事件 [列表字段] 自定义配置完成
  const onUpdateCustomColumns = (newColumns: TableColumnItem[]) =>{
    emit('update:custom-columns', newColumns)
    dialogVisible.value = false
  }
  

  // 打开弹窗前重新初始化，避免展示上次未保存的临时改动
  const dialogVisible = ref(false)
  const openDialog = (active: tabs_active_type = 'global_config') => {
    tabs_active.value = active
    dialogVisible.value = true
  }



  // 对外暴露能力：父组件可主动打开弹窗或拉取当前列配置
  defineExpose({
    openDialog,
  })

</script>

<style lang="scss">
.dialog-wrapper.el-dialog{
  .el-dialog__title {
    font-size: 18px !important;
    font-weight: bold !important;
  }
  .el-dialog__body {
    padding: 20px 24px 0px 10px!important;
  }
}

</style>
