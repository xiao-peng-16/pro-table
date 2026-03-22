<template>
  <div ref="TableRootRef" class="table-wrapper">
    <!-- 统一渲染一份 el-table，外层根据 isDrag 决定是否启用拖拽容器 -->
    <component :is="tableWrapper" v-bind="tableWrapperProps" @update="tableWrapperOnUpdate">
      <el-table
          ref="ElTableRef"
          v-bind="attrs"
          :data="dataList"
          style="width: 100%"
          :size="proTableGlobalConfig?.proTableSize ?? 'default'"
          :border="(proTableGlobalConfig?.tableIsBorder as boolean) ?? proTableGlobalConfig?.tableIsBorder"
          :stripe="(proTableGlobalConfig?.tableIsStripe as boolean) ?? proTableGlobalConfig?.tableIsStripe"
          :show-overflow-tooltip="true"
          :highlight-current-row="true"
      >
        <template #default>
          <TableColumn v-for="(item, index) in handleColumns" :key="item.prop || item.label || index" :item=item>
              <!-- TableColumn插槽透传 -->
              <template v-for="itemSlot in getTableColumnSlots(item)" :key="itemSlot" v-slot:[itemSlot]="temp">
                <slot :name="itemSlot" v-bind="temp"></slot>
              </template>
          </TableColumn>
          <slot v-if="!isDrag" name=default></slot>
        </template>
        <template #empty>
          <div class="emptyData">
            <div>暂无数据</div>
          </div>
        </template>
      </el-table>
    </component>

  </div>

</template>

<script setup lang="ts">
  import '../style/index.scss'
  import { h, ref, computed, watch, useAttrs, nextTick, onMounted } from "vue";
  import { ElMessage, ElTable, ElImage, ElTag, ElTooltip } from "element-plus";
  import TableColumn from './TableColumn.vue'
  import { VueDraggableProps, ElTableProps, TableColumnItem, ProTableGlobalConfig, ElTableColumnTypes, getFieldValue } from '@/components/base/ProTable'
  import { getTableColumnSlots, recursionTableColumnList, useTableDrag } from '@/components/base/ProTable/utils'
  import { ElTableFns, getElTableFns } from '@/components/base/ProTable/utils'
  import { VueDraggable } from 'vue-draggable-plus'
  import type { SortableEvent } from 'sortablejs'
  import DragBtn from './DragBtn.vue'
  import dayjs from 'dayjs'
  const attrs = useAttrs()
  const props = withDefaults(
    defineProps<{
      // 列表字段
      columns?: TableColumnItem[]
      // 自定义配置的id 区别每个custom本地列配置隔离键（优先于 route.path）
      customId?: string
      // 列表数据（注意：拖拽排序会在组件内部原地修改该数组）
      // 修改后会通过 update:data 事件通知外部
      data: any[]
      // ProTable全局配置
      proTableGlobalConfig: ProTableGlobalConfig
      // vue-draggable-plus 组件参数与配置
      drag: VueDraggableProps
    } & /* @vue-ignore */ ElTableProps>(),
    {
      columns: () => [],
      data: () => [],
      drag: () => null
    }
  )

  const emit = defineEmits<{
    (event: 'update:data', value: any[]): void
  }>()

  const ElTableRef = ref<InstanceType<typeof ElTable>>()
  // Table 根节点提供给外层工具函数，避免直接依赖实例内部私有结构。
  const TableRootRef = ref<HTMLElement>()

  // 处理后的 Table 列字段（用于最终渲染）。
  // 这里始终初始化为空数组，避免模板中 v-for / 计算属性在首帧访问 undefined。
  const handleColumns = ref<TableColumnItem[]>([])


  // 是否需要启用拖拽：只要列配置中存在 type === 'drag' 的列即可。
  const isDrag = computed(() => handleColumns.value.some(e => e.type === 'drag'))
  // 外层容器：有拖拽列时使用 VueDraggable，否则使用普通 div 包裹。
  const tableWrapper = computed(() => (isDrag.value ? VueDraggable : 'div'))
  // 外层容器 update 事件：仅在拖拽模式下生效。
  const tableWrapperOnUpdate = computed(() => (isDrag.value ? onDragUpdate : undefined))
  // 外层容器属性：
  // 注意优先级：最终以组件内固定值为准，props.drag 中同名字段会被覆盖。
  // 被覆盖字段：modelValue、target、handle、animation。
  const tableWrapperProps = computed(() => {
    if (!isDrag.value) return {}
    return {
      modelValue: dragDataList.value,
      target: 'tbody',
      handle: '.drag-handle',
      ...(props.drag || {}),
      animation: 150,
    }
  })


  /**
   * 获取prop对应字段值 并继续数据处理
   * @param row 行数据
   * @param fieldSource
   * @returns 旧值，新值，枚举值对应tag标签类型
   */
  const getValue = (row: any, item: TableColumnItem): { oldValue:any, value:any, tagType:TagTypes } => {
    const oldValue = getFieldValue(row, item.prop)
    let value = oldValue
    let tagType = undefined
    if (oldValue !== null && oldValue !== undefined) {
      // 枚举值转换
      if (item.enumItems) {
        let enumItem = item.enumItems.find(e=>e.value === oldValue)
        value = enumItem?.label
        tagType = enumItem?.tagType
      }
      // 日期格式化
      else if (item.dateFormat) {
        value = dayjs(oldValue).format(item.dateFormat)
      }
    }
    value = value ?? oldValue
    return { oldValue, value, tagType }
  }


  // TableColumnmr默认处理器
  const defaultHandle = (item: TableColumnItem) => {
    if(!item.render && !item.slot && item.prop) {
      item.render = (row) => {
        const { oldValue, value, tagType } =getValue(row, item)
        const { isHandle, props } = commonHandle(row, { ...item })
        // 使用了 tagTypeMap 或 枚举项中定义了 tag ，则使用el-tag标签组件
        if (item.tagTypeMap || tagType) {
          // 优先级：tagTypeMap定义 > 枚举项定义 > 默认值info
          const elTagType = item.tagTypeMap?.[oldValue] ?? tagType ?? 'info'
          return h(ElTag, { ...props, type: elTagType }, value)
        } else {
          return isHandle ? h('div', { ...props }, value) : value
        }
      }
    }
  }

  // 公共处理
  const commonHandle = (row: any, item: TableColumnItem) => {
    const props = { ...item }
    props.style = props.style ?? {}
    let { style, clickProps } = props
    let isHandle = false

    // 点击
    if (clickProps) {
      const { clickable, onclick, style: clickStyle  } = clickProps
      if (onclick && (!clickable || clickable(row))) {
        props.onclick = (event) => onclick(row, event)
        style.cursor = 'pointer'
        style = { ...style, clickStyle }
      }
    }
    isHandle = isHandle || Object.keys(style).length > 0
    return {
        isHandle,
        props: {
          ...props,
          style
        }
      }
  }

  // TableColumn类型处理器
  const typeHandles = {
    // 拖拽组件
    drag: (item: TableColumnItem) => {
      item.render = () => h(DragBtn, null, null)
      item.renderHeader = () => h(DragBtn, null, null)
    },
    // el-image图片预览组件
    image: (item: TableColumnItem) => {
      // preview-teleported 是否插入至 body 元素上, 防止图片预览遮挡
      item.previewTeleported = true
      item.render = (row) => {
        const src = getFieldValue(row, item.prop)
        let previewSrcList = getFieldValue(row, item.srcList) ?? [src]
        previewSrcList = Array.isArray(previewSrcList) ? previewSrcList : [previewSrcList]
        return h(ElImage, { ...item, src, previewSrcList }, null)
      }
    },
  }

  /**
   * 深拷贝列配置，避免直接修改 props.columns。
   * handleTableColumn 会给 item 注入 render / renderHeader 等函数，
   * 如果直接改 props.columns，可能污染父组件传入数据，导致后续外部更新行为异常。
   * @param list 原始列配置
   * @returns 克隆后的列配置
   */
  const cloneTableColumns = (list: TableColumnItem[] = []): TableColumnItem[] => {
    return list.map((item) => ({
      // 浅拷贝当前节点
      ...item,
      // 递归拷贝子级列（多级表头场景）
      children: item.children ? cloneTableColumns(item.children) : undefined,
    }))
  }

  /**
   * 处理 TableColumn：
   * 1) 先克隆输入列，确保不修改源数据
   * 2) 递归遍历每个列节点
   * 3) 非 element-plus 原生 type 的列，按扩展规则注入渲染逻辑
   * @param list 原始列配置
   * @returns 处理后的可渲染列配置
   */
  const handleTableColumn = (list: TableColumnItem[] = []) => {
    const nextList = cloneTableColumns(list)
    // 递归TableColumn处理
    recursionTableColumnList(nextList, (item: TableColumnItem) => {
      // element plus 原生类型不处理
      if(!ElTableColumnTypes.includes(item.type)) {
        // 根据类型进行特殊处理 无对应类型使用默认处理器
        item.type && typeHandles[item.type] ? typeHandles[item.type](item) : defaultHandle(item)
      }
    })
    return nextList
  }

  watch(
    () => props.columns,
    (newColumns) => {
      // 外部 columns 发生变化后，重新生成内部可渲染列。
      // 这里统一走 handleTableColumn，保证初始化和更新逻辑一致。
      handleColumns.value = handleTableColumn(newColumns)

      // 列结构变化后，通知 el-table 重新计算布局（列宽、固定列位置等）。
      // nextTick 确保在 DOM 完成更新后再执行 doLayout。
      nextTick(() => {
        ElTableRef.value?.doLayout()
      })
    },
    {
      // 深度监听：支持外部在原数组引用不变的情况下，直接修改列内部字段。
      // 例如：columns[i].visible = false / columns[i].label = '新标题'
      deep: true,
      // 立即执行：组件初始化时也会进行一次列处理，替代原先的手动初始化赋值。
      immediate: true,
    }
  )



  // 列表数据：直接使用 props.data，不再维护本地镜像状态。
  // 当前组件在拖拽场景下采用 in-place mutate（原地修改）策略：
  // - swapItem 会直接调整该数组顺序
  // - 然后通过 emit('update:data', dataList.value) 通知父组件
  // 如果外部依赖“引用变化”触发更新，请在父组件侧使用深监听或主动刷新。
  const dataList = computed<any[]>(() => props.data)

  // vue-draggable-plus 和 element plus table 共用一个dom视图
  // element plus table 会字段将tree结构数据扁平化展示（父级和children在同一层）
  // vue-draggable-plus 绑定的数据要扁平化映射， 防止视图数组的下标无法和绑定的数据进行关联
  const tableDragHandler = useTableDrag(dataList)
  const dragDataList = computed<any[]>(() => {
    return tableDragHandler.getFlatList()
  })

  // vue-draggable-plus 元素位置更新事件
  // 这里会原地调整 dataList（即 props.data）顺序，再通过 update:data 向外同步。
  const onDragUpdate = (event: SortableEvent) => {
    const { oldIndex, newIndex } = event
    if (oldIndex == null || newIndex == null) {
      return
    }

    try {
      tableDragHandler.swapItem(dragDataList.value[oldIndex], dragDataList.value[newIndex])
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '拖拽更新失败'
      ElMessage.warning(message)
      return
    }
    emit('update:data', dataList.value)
    props?.drag?.onUpdateList && props?.drag?.onUpdateList(dataList.value, event)
    props?.drag?.onUpdate && props?.drag?.onUpdate(event)
  }



  // --------------------   触发El-Table重新布局   ----------------------------------------
  watch(
    () => props.proTableGlobalConfig,
    (newColumns) => {
      // 触发表格重排：等待 DOM 更新并进入下一帧后执行，减少宽度计算时机不稳定的问题。
      nextTick(() => {
        requestAnimationFrame(() => {
          ElTableRef.value?.doLayout?.()
        })
      })
    },
    {
      deep: true,
    }
  )

  
  // --------------------   对外暴露方法   ----------------------------------------
  const expose: any & ElTableFns = {
    // element-plus table 方法
    clearSelection: () => null,
    getSelectionRows: () => null,
    doLayout: () => null,
    // 进一步封装 只返回[row-id] 不返回整行数据
    getSelectionRowIds: (rowKey) => {
      const rows = ElTableRef.value?.getSelectionRows() || []; // 确保是数组
      const effectiveKey = rowKey ?? attrs?.['row-key'];
      return effectiveKey 
        ? rows.map(item => item?.[effectiveKey]).filter(rowIds => rowIds != null)
        : rows;
    },
    toggleRowSelection: () => null,
    toggleAllSelection: () => null,
    toggleRowExpansion: () => null,
    setCurrentRow:  () => null,
    getTableRootEl: () => TableRootRef.value || null,
  }

  onMounted(() => {
    Object.assign(expose, getElTableFns(ElTableRef.value))
  })

  defineExpose(expose)

</script>


<style scoped>
</style>
