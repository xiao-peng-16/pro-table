<template>
  <div class="filter-custom-view">
    <el-form label-position="left">
      <!-- 搜索条件展示行数 -->
      <el-radio-group v-model="proTableGlobalConfig.filterIsShowAll">
        <el-radio :value="true">显示所有</el-radio>
        <el-radio :value="false">
          <span>默认显示</span>
          <span v-if="proTableGlobalConfig.filterIsShowAll">N</span>
          <el-input-number v-else v-model="proTableGlobalConfig.filterShowRow" :min="1" :max="99" :precision="0" style="margin: 0 5px;"/>
          <span>行, 可展开显示所有</span>
        </el-radio>
      </el-radio-group>
    </el-form>

    <p>共 {{ sourceFilters.length }} 个搜索条件</p>

    <Table
      ref="TableRef"
      :tableCustom="false"
      :columns="columns"
      v-model:data="customFilters"
      :drag="drag"
      row-key="label"
      default-expand-all
    >
      <!-- [是否展示]按钮插槽 -->
      <template #visible="{ row }">
        <el-switch
          :model-value="row.visible ?? true"
          inline-prompt
          active-text="是"
          inactive-text="否"
          @update:model-value="(visible: boolean) => row.visible = visible"
        />
      </template>
      <!-- 操作区插槽 -->
      <template #operate="{ row, index }">
        <!-- [上移]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(index).up"
          @click="commonCustom.moveUp(index)"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M208.49 120.49a12 12 0 0 1-17 0L140 69v147a12 12 0 0 1-24 0V69l-51.51 51.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0l72 72a12 12 0 0 1 0 17"/></svg>
        上移
        </el-button>
        <!-- [下移]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(index).down"
          @click="commonCustom.moveDown(index)"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="m208.49 152.49l-72 72a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L116 187V40a12 12 0 0 1 24 0v147l51.51-51.52a12 12 0 0 1 17 17Z"/></svg>
        下移
        </el-button>
        <!-- [置顶]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(index).top"
          @click="commonCustom.moveTop(index)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24.008 14.1V42M12 26l12-12l12 12M12 6h24"/></svg>
          置顶
        </el-button>
        <!-- [置底]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(index).bottom"
          @click="commonCustom.moveBottom(index)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24.008 33.9V6M36 22L24 34L12 22m24 20H12"/></svg>
          置底
        </el-button>
      </template>
    </Table>

    <!-- 底部操作按钮 -->
    <div class="custom-btn__container">
      <el-button @click="cancel">取消</el-button>
      <el-button @click="resetConfig">重置</el-button>
      <el-button type="primary" @click="saveConfig">保存设置</el-button>
    </div>
  </div>
</template>


<script setup lang="ts" name="FilterCustomView">
  import '../style/index.scss'
  import { ref } from "vue";
  import { Table } from "@/components/base/ProTable"
  import { VueDraggableProps, TableColumnItem, FilterItem, ProTableGlobalConfig } from "@/components/base/ProTable"
  import { ElRadioGroup, ElRadio, ElInputNumber, ElButton } from "element-plus"
  import { useFilterCustom  } from '../utils/useFilterCustomOperation'
  import { clearFilterOrderConfig, resolveFilterItems, saveFilterOrderConfig } from '../utils/useFilterColumnConfig'
  import { clearGlobalConfig, loadGlobalConfig, saveGlobalConfig } from '../utils/useGlobalConfig'
  const props = defineProps<{
    // 自定义配置的id 区别每个custom
    customId: string,
    // 搜索条件字段列表
    sourceFilters: FilterItem[],
  }>()
  const emit = defineEmits<{
    // [全局]自定义配置完成
    (e: 'update:custom-global')
    // [搜索条件字段]自定义配置完成
    (e: 'update:custom-filter', newFilters: FilterItem[])
    // 取消
    (e: 'cancel')
  }>()

  const TableRef = ref<InstanceType<typeof Table>>()
  // 自定义列
  const customFilters = ref<FilterItem[]>([])
  // 全局配置
  const proTableGlobalConfig = ref<ProTableGlobalConfig>(loadGlobalConfig())

  // 列表字段
  const columns: TableColumnItem[] = [
    {
      type: 'drag',
      width: '80px',
      align: 'center'
    },
    {
      label: '搜索条件',
      prop: 'label',
      minWidth: '120px'
    },
    {
      label: '是否显示',
      slot: 'visible',
      align: 'center'
    },
    {
      label: '显示顺序设置',
      slot: 'operate',
      align: 'center',
      minWidth: '210px'
    },
  ]


  /**
   * 初始化
   * @param usePersisted 是否读取本地保存的筛选项配置
   */
  const initFilters = (usePersisted = true) => {
    // 全局配置
    proTableGlobalConfig.value = loadGlobalConfig()

    // 筛选项列表支持持久化恢复：
    // - usePersisted=true：优先恢复用户已保存的顺序与 visible；
    // - usePersisted=false：忽略缓存，直接使用代码侧 sourceFilters 默认配置。
    customFilters.value = resolveFilterItems(props.sourceFilters, {
      storageId: props.customId,
      usePersisted,
    })
  }
  initFilters();

  const commonCustom = useFilterCustom(TableRef, customFilters)

  // 重置配置
  const resetConfig = () => {
    // 清空当前全局配置浏览器保存配置
    clearGlobalConfig()
    // 清空当前Filter浏览器保存配置
    clearFilterOrderConfig(props.customId)
    // 初始化
    initFilters(false)
  }

  // 保存配置
  const saveConfig = () => {
    // [全局配置]设置
    saveGlobalConfig(proTableGlobalConfig.value)
    emit('update:custom-global')

    // [搜索条件字段]设置 仅保存筛选项列表配置（顺序 + visible）
    saveFilterOrderConfig(props.customId, customFilters.value)
    // 通知父组件：更新当前筛选项配置（用于当次页面立即生效）。
    emit('update:custom-filter', customFilters.value)
  }

  // 取消
  const cancel = () => {
    emit('cancel')
  }

  // VueDraggableProps 拖拽组件参数
  const drag: VueDraggableProps = {

    onMove: (event, originalEvent) => {
        // console.log('移动')
        // console.log(event)
    },
    onUpdateList: (newList, event) => {

    },
  }


</script>

