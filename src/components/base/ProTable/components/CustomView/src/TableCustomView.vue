<template>
  <div class="table-custom-view">
    <p>共 {{ sourceColumns.length }} 个字段</p>

    <Table
      ref="TableRef"
      :tableCustom="false"
      :columns="columns"
      v-model:data="customColumns"
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
      <!-- [是否固定左侧]按钮插槽 -->
      <template #flexLeft="{ row, index }">
        <el-tooltip content="多级表头无法固定列" :disabled="!commonCustom.isChildren(row)">
          <el-switch
            :model-value="row.fixed === true || row.fixed === 'left'"
            :disabled="commonCustom.isChildren(row)"
            inline-prompt
            active-text="是"
            inactive-text="否"
            @update:model-value="(flag: boolean) => commonCustom.switchFixed(row, index, 'left', flag)"
          />
        </el-tooltip>
      </template>
      <!-- [是否固定右侧]按钮插槽 -->
      <template #flexRight="{ row, index }">
        <el-tooltip content="多级表头无法固定列" :disabled="!commonCustom.isChildren(row)">
          <el-switch
            :model-value="row.fixed === true || row.fixed === 'right'"
            :disabled="commonCustom.isChildren(row)"
            inline-prompt
            active-text="是"
            inactive-text="否"
            @update:model-value="(flag: boolean) => commonCustom.switchFixed(row, index, 'right', flag)"
          />
        </el-tooltip>
      </template>
      <!-- 操作区插槽 -->
      <template #operate="{ row, index }">
        <!-- [上移]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(row).up"
          @click="commonCustom.moveUp(row, index)"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M208.49 120.49a12 12 0 0 1-17 0L140 69v147a12 12 0 0 1-24 0V69l-51.51 51.49a12 12 0 0 1-17-17l72-72a12 12 0 0 1 17 0l72 72a12 12 0 0 1 0 17"/></svg>
        上移
        </el-button>
        <!-- [下移]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(row).down"
          @click="commonCustom.moveDown(row, index)"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="m208.49 152.49l-72 72a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L116 187V40a12 12 0 0 1 24 0v147l51.51-51.52a12 12 0 0 1 17 17Z"/></svg>
        下移
        </el-button>
        <!-- [置顶]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(row).top"
          @click="commonCustom.moveTop(row, index)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24.008 14.1V42M12 26l12-12l12 12M12 6h24"/></svg>
          置顶
        </el-button>
        <!-- [置底]按钮 -->
        <el-button
          type="primary" link
          :disabled="commonCustom.isDisabledMove(row).bottom"
          @click="commonCustom.moveBottom(row, index)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24.008 33.9V6M36 22L24 34L12 22m24 20H12"/></svg>
          置底
        </el-button>
      </template>
    </Table>

    <!-- 底部操作按钮 -->
    <div class="custom-btn__container">
      <el-button @click="cancel">取消</el-button>
      <el-button @click="resetColumns">重置</el-button>
      <el-button type="primary" @click="saveConfig">保存设置</el-button>
    </div>
  </div>
</template>


<script setup lang="ts" name="TableCustomView">
  import '../style/index.scss'
  import { ref, useSlots, SlotsType, watch } from "vue";
  import { Table } from "@/components/base/ProTable"
  import { VueDraggableProps, TableColumnItem } from "@/components/base/ProTable"
  import { ElSwitch, ElButton, ElTooltip } from "element-plus"
  import { useTableCustomOperation } from '../utils/useTableCustomOperation'
  import { resolveTableColumns, saveTableOrderConfig, clearTableOrderConfig } from '../utils/useTableColumnConfig'

  const slots: SlotsType = useSlots()
  const props = withDefaults(
    defineProps<{
      // 表格唯一标识（由于ProTable获取后传入）
      customId?: string
      // 字段列表
      sourceColumns: TableColumnItem[]
    }>(),
    {
      customId: '',
      sourceColumns: () => [],
    }
  )

  const emit = defineEmits<{
    // 事件 [列表字段] 自定义配置完成
    (e: 'update:custom-columns', newColumns: TableColumnItem[])
    // 取消
    (e: 'cancel')
  }>()

  const TableRef = ref<InstanceType<typeof Table>>()

  // 锁定列与可自定义列分开维护，最终再合并回传给父组件。
  const lockColumns = ref<TableColumnItem[]>([])
  // 可自定义列（支持 children 树结构）。
  const customColumns = ref<TableColumnItem[]>([])

  // 自定义弹窗内部表格列定义（用于操作 UI，不是业务表格的真实列定义）。
  const columns: TableColumnItem[] = [
    {
      type: 'drag',
      width: '80px',
      align: 'center'
    },
    {
      label: '字段名称',
      prop: 'label',
      minWidth: '120px',
      render: (row, column, cellValue, index) => {
        return row?.renderHeader?.({column, index})     // render
          ?? slots[row?.slotHeader]?.({column, index})  // 插槽
          ?? row?.label                                 // label
      }
    },
    {
      label: '是否显示',
      slot: 'visible',
      align: 'center',
      minWidth: '75px'
    },
    {
      label: '固定在左侧',
      slot: 'flexLeft',
      align: 'center',
      minWidth: '75px'
    },
    {
      label: '固定在右侧',
      slot: 'flexRight',
      align: 'center',
      minWidth: '75px'
    },
    {
      label: '显示顺序设置',
      slot: 'operate',
      align: 'center',
      minWidth: '200px'
    },
  ]



  // 初始化策略：
  // - 永远先以代码里的 sourceColumns 为基准；
  // - 再尝试恢复用户缓存（仅顺序 + fixed + visible）；
  // - 缓存失效时自动回退默认配置。
  // usePersisted 语义：
  // - true：用于常规初始化/打开弹窗，优先展示用户上次保存的列配置；
  // - false：用于重置后强制回到代码默认列，不读取本地缓存。
  const initColumns = (usePersisted = true) => {
    // 将“列拆分 + 缓存恢复”统一交给 resolveTableColumns：
    // 1) 先基于最新 sourceColumns 拆分 lock/custom；
    // 2) 再按 usePersisted 决定是否尝试从 localStorage 恢复 customColumns；
    // 3) 返回可直接写入状态的下一份 lock/custom 结果。
    const { lockColumns: nextLockColumns, customColumns: nextCustomColumns } = resolveTableColumns(
      props.sourceColumns || [],
      {
        // storageId 用于隔离不同页面/不同表格实例的本地配置命名空间。
        storageId: props.customId,
        // 由调用方显式决定本次初始化是否应用缓存（如 reset 场景传 false）。
        usePersisted
      }
    )

    // 原子回写到响应式状态，供弹窗表格与外层表格统一使用。
    lockColumns.value = nextLockColumns
    customColumns.value = nextCustomColumns
  }

  // 首次进入组件时执行一次初始化：
  // 默认按“可恢复缓存”模式加载，让弹窗打开前就持有正确列状态。
  initColumns(true)

  // 表格自定义动作能力（上移/下移/固定/拖拽限制等）。
  const commonCustom = useTableCustomOperation(TableRef, customColumns)

  // 组合最终列：锁定列在前 + 自定义列。
  const getCustomColumns = (): TableColumnItem[] => {
    return [...lockColumns.value, ...customColumns.value]
  }

  // 监听父组件下发的 sourceColumns 变化：
  // - 重新以最新列定义为基准执行初始化（并尝试恢复缓存）；
  // - 然后主动同步给父表格，确保动态列场景下内外状态一致。
  watch(
    () => props.sourceColumns,
    () => {
      initColumns(true)
      emit('update:custom-columns', getCustomColumns())
    },
    {
      deep: true
    }
  )


  // 重置：清理本地缓存并恢复到代码默认列定义。
  const resetColumns = () => {
    clearTableOrderConfig(props.customId)
    // 重置场景显式关闭缓存恢复，避免清理后仍被旧缓存配置覆盖。
    initColumns(false)
  }

  // 保存：
  // - 持久化用户可配置内容（顺序 + fixed）；
  // - 通过事件通知父组件立即重渲染。
  const saveConfig = () => {
    saveTableOrderConfig(props.customId, customColumns.value)
    emit('update:custom-columns', getCustomColumns())
  }

  
  // 取消
  const cancel = () => {
    emit('cancel')
  }
  
  // 拖拽行为配置：这里接入列表字段拖拽校验。
  // 约束与“上移/下移”保持一致：左/中/右分区不允许越界交换。
  const drag: VueDraggableProps = {
    onMove: (event, originalEvent) => {
      return commonCustom.dragMove(event)
    },
    onUpdateList: (newList, event) => {
    },
  }

  // 对外暴露能力：父组件可主动打开弹窗或拉取当前列配置。
  defineExpose({
    getCustomColumns
  })

</script>

