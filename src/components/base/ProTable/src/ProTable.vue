<template>
  <div ref="ProTableWrapperRef" class="pro-table__wrapper">
    <Filter
      v-show="filters && filters.length > 0"
      ref="FilterRef"
      :filters="filters"
      :custom-id="customId"
      :loading="loading"
      :is-show-custom-view="false"
      @query="onFilterQuery"
      @filter-reset="emit('filter-reset')"
      @open-filter-custom-view="openFilterCustomView"
    >
      <!-- Filter 插槽透传 -->
      <template v-for="itemSlot in filterSlots" :key="itemSlot" v-slot:[itemSlot]="temp">
        <slot :name="itemSlot" v-bind="temp"></slot>
      </template>
    </Filter>

    <!-- 全屏时将表格容器挂载到 body，避免受父级布局约束；非全屏时仍在原位置渲染。 -->
    <Teleport to="body" :disabled="!isFullScreen">
      <div ref="tableContainerRef" class="pro-table__container" :class="{ 'pro-table__container--full-screen': isFullScreen }">
        <!-- Table顶部 -->
        <div class="table-top__container">
          <!-- Table顶部按钮区插槽 -->
          <div class="table-top-slot"><slot name="table-top"></slot></div>

          <!-- Table顶部右上角功能区按钮 [切换全屏、自定义设置] -->
          <div class="table-top-setting">
            <!-- Table[刷新数据] -->
            <el-tooltip  placement="bottom" effect="dark" content="刷新数据">
              <el-button @click="refreshPageData" circle size="small" class="table-top-setting-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 1024 1024"><path fill="currentColor" d="M168 504.2c1-43.7 10-86.1 26.9-126c17.3-41 42.1-77.7 73.7-109.4S337 212.3 378 195c42.4-17.9 87.4-27 133.9-27s91.5 9.1 133.8 27A341.5 341.5 0 0 1 755 268.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.7 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c0-6.7-7.7-10.5-12.9-6.3l-56.4 44.1C765.8 155.1 646.2 92 511.8 92C282.7 92 96.3 275.6 92 503.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8m756 7.8h-60c-4.4 0-7.9 3.5-8 7.8c-1 43.7-10 86.1-26.9 126c-17.3 41-42.1 77.8-73.7 109.4A342.45 342.45 0 0 1 512.1 856a342.24 342.24 0 0 1-243.2-100.8c-9.9-9.9-19.2-20.4-27.8-31.4l60.2-47a8 8 0 0 0-3-14.1l-175.7-43c-5-1.2-9.9 2.6-9.9 7.7l-.7 181c0 6.7 7.7 10.5 12.9 6.3l56.4-44.1C258.2 868.9 377.8 932 512.2 932c229.2 0 415.5-183.7 419.8-411.8a8 8 0 0 0-8-8.2"/></svg>
              </el-button>
            </el-tooltip>
            <!-- Table[切换全屏] -->
            <el-tooltip  placement="bottom" effect="dark" :content="isFullScreen ? 'ESC 关闭全屏' : '打开全屏'">
              <el-button @click="toggleFullScreen" circle size="small" class="table-top-setting-item">
                <svg v-if="isFullScreen" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 15 15"><path fill="currentColor" d="M5.5 9a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V10H2.5a.5.5 0 0 1 0-1zm7 0a.5.5 0 0 1 0 1H10v2.5a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5zm-7-7a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H5V2.5a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5V5h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 15 15"><path fill="currentColor" d="M2.5 9a.5.5 0 0 1 .5.5V12h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m10 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H12V9.5a.5.5 0 0 1 .5-.5m-7-7a.5.5 0 0 1 0 1H3v2.5a.5.5 0 0 1-1 0v-3l.01-.1A.5.5 0 0 1 2.5 2zm7.1.01a.5.5 0 0 1 .4.49v3a.5.5 0 0 1-1 0V3H9.5a.5.5 0 0 1 0-1h3z"/></svg>
              </el-button>
            </el-tooltip>
            <!-- Table[自定义设置] -->
            <el-tooltip  placement="bottom" effect="dark" content="自定义设置">
              <el-button @click="openTableCustomView" circle size="small" class="table-top-setting-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 1024 1024"><path fill="currentColor" d="m924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 0 0 9.3-35.2l-.9-2.6a443.7 443.7 0 0 0-79.7-137.9l-1.8-2.1a32.12 32.12 0 0 0-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 0 0-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 0 0-25.8 25.7l-15.8 85.4a351.9 351.9 0 0 0-99 57.4l-81.9-29.1a32 32 0 0 0-35.1 9.5l-1.8 2.1a446 446 0 0 0-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1c0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 0 0-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0 0 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0 0 25.8 25.7l2.7.5a449.4 449.4 0 0 0 159 0l2.7-.5a32.05 32.05 0 0 0 25.8-25.7l15.7-85a350 350 0 0 0 99.7-57.6l81.3 28.9a32 32 0 0 0 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35M788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1l74.7 63.9a370 370 0 0 1-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3l-17.9 97a377.5 377.5 0 0 1-85 0l-17.9-97.2l-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9l-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5l-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5c0-15.3 1.2-30.6 3.7-45.5l6.5-40l-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2l31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3l17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97l38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8l92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176s176-78.8 176-176s-78.8-176-176-176m79.2 255.2A111.6 111.6 0 0 1 512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 0 1 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390s58 11.6 79.2 32.8A111.6 111.6 0 0 1 624 502c0 29.9-11.7 58-32.8 79.2"/></svg>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <!-- Table 核心内容 -->
        <Table
          ref="TableRef"
          v-bind="{ ...attrs, class: undefined, style: undefined /*移除 style*/}"
          v-loading="loading"
          :columns="customColumns"
          :data="data"
          :pro-table-global-config="proTableGlobalConfig"
          :max-height="tableMaxHeight"
        >
          <!-- TableColumn 插槽透传 -->
          <template v-for="itemSlot in tableColumnSlots" :key="itemSlot" v-slot:[itemSlot]="temp">
            <slot :name="itemSlot" v-bind="temp"></slot>
          </template>
        </Table>

        <!-- Table底部 -->
        <div ref="tableBottomContentRef" class="bottom-content">
          <div class="bottom-before">
            <slot name="table-bottom"></slot>
          </div>
          <!-- 分页组件 -->
          <Pagination
            v-if="isPage"
            ref="PaginationRef"
            :total="total"
            :pro-table-global-config="proTableGlobalConfig"
            @query-page="onPaginationQuery"
          ></Pagination>
        </div>
      </div>
    </Teleport>


    <!-- Table/Filter字段自定义设置组件 -->
    <CustomView
      ref="ProTableCustomViewRef"
      :custom-id="customStoreId"
      :source-filters="filters"
      :sourceColumns="columns"
      @update:custom-global="onUpdateCustomGlobal"
      @update:custom-filter="onUpdateCustomFilter"
      @update:custom-columns="onUpdateCustomColumns"
    >
      <!-- Filter 插槽透传 -->
      <template v-for="itemSlot in filterSlots" :key="itemSlot" v-slot:[itemSlot]="temp">
        <slot :name="itemSlot" v-bind="temp"></slot>
      </template>
      <!-- TableColumn表头插槽透传 -->
      <template v-for="itemSlot in getTableColumnHeaderSlot(columns)" :key="itemSlot" v-slot:[itemSlot]="temp">
        <slot :name="itemSlot" v-bind="temp"></slot>
      </template>
    </CustomView>

  </div>
</template>

<script setup lang="ts">
  import '../style/index.scss'
  import { ref, computed, useSlots, useAttrs, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import {Table, Filter, FilterItem, getInitFilterParam, CustomView, Pagination, TableColumnItem, ProTableGlobalConfig , PageParam, PageResponse, PAGE_REQUEST_NUM_KEY, PAGE_REQUEST_SIZE_KEY, PAGE_RESPONSE_DATA_KEY, PAGE_RESPONSE_TOTAL_KEY} from "@/components/base/ProTable"
  import { getProTableFilterSlots, getProTableColumnSlots, getTableColumnHeaderSlot } from "@/components/base/ProTable/utils"
  import { loadGlobalConfig, getInitPageParam } from '@/components/base/ProTable/components/CustomView/utils/useGlobalConfig'
  import { resolveFilterItems } from '@/components/base/ProTable/components/CustomView/utils/useFilterColumnConfig'
  import { resolveTableColumns } from '@/components/base/ProTable/components/CustomView/utils/useTableColumnConfig'
  import { ElTableFns, getElTableFns } from '@/components/base/ProTable/utils'
  const route = useRoute()
  const attrs = useAttrs()
  const slots = useSlots()
  const props = withDefaults(
    defineProps<{
      filters?: FilterItem[]        // 搜索条件
      columns?: TableColumnItem[]   // 列表字段
      getTableData: (params: { [key:string]:any } & PageParam) => PageResponse | Promise<PageResponse> // 获取数据方法
      customId: string,             // 自定义配置的id 区别每个custom
      filterCustom?: boolean        // Filter是否开启搜索条件设置工具
      isPage?: boolean              // 是否展示分页
      // 是否自动计算表格最大高度，默认开启 (优先级 props传入配置 > 自定义全局配置)
      // - 关闭：非全屏时 高度随数量内容增多而变高 表格内部无滚动条  
      // - 开启：非全屏时 默认继续用视口可用高度，若检测到外层存在可计算高度边界，则取 min(视口可用, 外层可用)
      //    --作用: 数据多时滚动条在表格body内部 滚动数据时候表头位置固定方便查看
      autoMaxHeight?: boolean       
      drag?: {}                      // vue-draggable-plus 组件参数与配置
    }>(),
    {
      filters: () => [],
      columns: () => [],
      customId: undefined,
      filterCustom: true,
      isPage: true,
      autoMaxHeight: undefined,   // 不需要默认值 有全局配置兜底
      drag: undefined
    }
  )

  const emit = defineEmits<{
    (e: 'filter-reset'),
  }>()

  const FilterRef = ref<InstanceType<typeof Filter>>()
  const TableRef = ref<InstanceType<typeof Table>>()
  const PaginationRef = ref<InstanceType<typeof Pagination>>()
  const filterSlots: string[] = getProTableFilterSlots(props.filters)
  // table的column插槽集合, 插槽字段: TableColumnItem.slot | TableColumnItem.slotHeader
  const tableColumnSlots: string[] = getProTableColumnSlots(props.columns)
  const ProTableCustomViewRef = ref<InstanceType<typeof CustomView>>()


  // 加载状态
  const loading = ref<boolean>(false)
  // 查询令牌：仅允许最新一次查询结果落地（防止并发请求响应乱序覆盖）
  const latestQueryToken = ref<number>(0)
  // 搜索条件参数
  const filterParam = ref(getInitFilterParam(props.filters))
  // 分页参数
  const pageParam = ref<PageParam>(getInitPageParam())
  // 列表数据
  const data = ref<any[]>([])
  // 总行数
  const total = ref<number>(0)

  // 自定义设置id customId未设置时使用route地址兜底, 这样同一路由下刷新仍可命中缓存，不同页面互不污染
  const customStoreId = computed(() => String(props.customId || route.path || ''))

  // 表格是否全屏
  const isFullScreen = ref(false)
  const ProTableWrapperRef = ref<HTMLElement>()
  const tableContainerRef = ref<HTMLElement>()
  const tableBottomContentRef = ref<HTMLElement>()


  // --------------------   Table数据查询基础功能   ----------------------------------------

  /**
   * 查询数据
   */
  const queryData = async () => {
    // 查询令牌 用于防止并发请求数据覆盖
    const queryToken = ++latestQueryToken.value
    loading.value = true
    try {
      const param = {
        ...filterParam.value,
        [PAGE_REQUEST_NUM_KEY]: pageParam.value.pageNum,
        [PAGE_REQUEST_SIZE_KEY]: pageParam.value.pageSize
      }
      // 兼容 getTableData 同步返回对象和异步返回 Promise 两种场景
      const pageResponse: PageResponse = await Promise.resolve(props.getTableData(param))

      // 仅处理最新一次查询，避免旧请求响应覆盖新状态
      if (queryToken !== latestQueryToken.value) {
        return
      }

      data.value = pageResponse[PAGE_RESPONSE_DATA_KEY]
      total.value = Number(pageResponse[PAGE_RESPONSE_TOTAL_KEY])
    } finally {
      // 仅最新请求可关闭 loading，避免旧请求 finally 抢先结束加载态
      if (queryToken === latestQueryToken.value) {
        loading.value = false
      }
    }
  }
  queryData()

  /**
   * 获取Filter搜索条件查询参数
   */
  const getQueryParam = () => {
      return FilterRef.value.getQueryParam()
  }

  /**
   * 搜索条件参数变更触发查询事件
   * @param newFilterParam 新的搜索过滤条件参数
   */
  const onFilterQuery = (newFilterParam) => {
    filterParam.value = newFilterParam
    pageParam.value = PaginationRef.value?.reset(true) ?? getInitPageParam()
    queryData()
  }


  /**
   * 分页参数变更触发查询事件
   * @param newPageParam 新的分页参数
   */
  const onPaginationQuery = (newPageParam:PageParam) => {
    pageParam.value = newPageParam
    queryData()
  }

 

  // --------------------   ProTable全局配置-自定义设置   ----------------------------------------
  // ProTable全局配置
  const proTableGlobalConfig = ref<ProTableGlobalConfig>(loadGlobalConfig())
  // 事件 [全局配置] 自定义配置完成 
  const onUpdateCustomGlobal = () =>{
    proTableGlobalConfig.value = loadGlobalConfig()
    // 通知[Filter]全局配置已修改
    FilterRef.value.onUpdateCustomGlobal()
  }


  // --------------------   Filter列字段-自定义设置   ----------------------------------------

  // [搜索条件字段]自定义配置完成
  // 直接调用[Filter]内部[onUpdateCustomFilter] [Filter]为了单独使用，内部也引入了[CustomView] 
  const onUpdateCustomFilter = (customFilters: FilterItem[]) =>{
      FilterRef.value.onUpdateCustomFilter(customFilters)
  }


  // --------------------   Table列字段-自定义设置   ----------------------------------------

  // [最终渲染列表字段] 用户自定义设置列表字段（字段顺序+ fixed + visible）
  const customColumns = ref<TableColumnItem[]>([])
  // 外部 columns 发生变化后，重新生成内部可渲染列。
  watch(
    () => props.columns,
    (newColumns) => {
      // 代码配置列字段信息 和 浏览器保存用户自定义配置(列顺序+列字段属性[fixed、visible]) 进行合并
      const { mergedColumns } = resolveTableColumns(newColumns || [], {
        storageId: customStoreId.value,
        // 父表格初始化默认恢复用户已保存配置；
        // 若后续引入“未保存预览”流程，可按场景改为 false。
        usePersisted: true
      })
      customColumns.value = mergedColumns
    },
    {
      // 深度监听：支持外部在原数组引用不变的情况下，直接修改列内部字段。
      // 例如：columns[i].visible = false / columns[i].label = '新标题'
      deep: true,
      // 立即执行：组件初始化时也会进行一次列处理，替代原先的手动初始化赋值。
      immediate: true,
    }
  )
  // 自定义列设置更新事件（保存生效语义）：
  // - 这里的 newColumns 来自 TableCustomView 保存后的最终结果；
  // - 直接用于渲染，不在这里二次回读 localStorage，避免覆盖用户当次保存状态；
  // - 因此“实时预览”与“保存生效”边界明确：当前仅保存后才更新父表格。
  const onUpdateCustomColumns = (newColumns: TableColumnItem[]) =>{
    customColumns.value = newColumns
  }



  // --------------------   Table/Filter操作按钮   ----------------------------------------

  // [Table操作-刷新数据] 刷新当前页数据
  const refreshPageData = () => {
    PaginationRef.value?.queryPage()
  }
  // [Filter操作-打开自定义设置] 打开Table列字段自定义设置组件
  const openFilterCustomView = () => {
    ProTableCustomViewRef.value.openDialog('filter_config')
  }
  // [Table操作-打开自定义设置] 打开Table列字段自定义设置组件
  const openTableCustomView = () => {
    ProTableCustomViewRef.value.openDialog('table_config')
  }

  // [Table操作-全屏] 切换全屏
  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value 
    // 同步开启浏览器本身的F11全屏
    // document.fullscreenElement判断浏览器是不是F11全屏
    if (isFullScreen.value && !document.fullscreenElement) {
      // 当前不是全屏，请求进入全屏
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`浏览器尝试全屏失败 err: ${err.message}`);
      });
    } else {
      // 当前是全屏，退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  // [Table操作-全屏] 监听全屏状态变化：负责切换滚动锁，并在状态切换后触发表格布局重算。
  watch(isFullScreen, (val) => {
    // 全屏时锁定页面滚动，避免滚轮滚动到底层页面。
    document.body.classList.toggle('pro-table-fullscreen-lock', val)
    // 切换全屏后强制刷新 高度和布局
    scheduleHeightAndLayout()
  })
  onBeforeUnmount(() => {
    // 兜底移除滚动锁，避免异常路径下页面残留不可滚动状态。
    document.body.classList.remove('pro-table-fullscreen-lock')
  })
  // [Table操作-全屏] 监听浏览器全屏状态变化事件[fullscreenchange]（包含 ESC 退出）
  const onFullscreenChange = () => {
    isFullScreen.value = !!document.fullscreenElement // !! 等效于Boolean(xx)类型转换
  }
  onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
  onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreenChange))


  // --------------------   Table高度&布局刷新   ----------------------------------------

  // 刷新高度和布局
  const scheduleHeightAndLayout = () => {
    // 刷新高度
    refreshTableMaxHeight()
    // 刷新布局
    scheduleDoLayout()
  }

  // 触发表格重排：等待 DOM 更新并进入下一帧后执行，减少宽度计算时机不稳定的问题。
  const scheduleDoLayout = () => {
    nextTick(() => {
      requestAnimationFrame(() => {
        TableRef.value?.doLayout?.()
      })
    })
  }




  // --------------------   Table高度设置()   ----------------------------------------
  // 作用: 开关 数据多时滚动条在表格body内部 滚动数据时候表头位置固定方便查看

  // 读取调用方透传的 max-height（自动高度关闭时回退使用）
  const attrMaxHeight = computed<number | string | undefined>(() => {
    const maxHeight = attrs['max-height'] ?? attrs.maxHeight
    if (maxHeight == null || maxHeight === '') {
      return undefined
    }
    return maxHeight as number | string
  })


  // 自动高度计算失败时使用固定兜底值（单位：px）
  const TABLE_FALLBACK_MAX_HEIGHT = 360
  // 最小可用高度（单位：px）：避免极端小视窗下 maxHeight 过小导致可用性下降
  const TABLE_MIN_MAX_HEIGHT = 200
  // 预留底部安全间距（单位：px）：防止容器和页面边界出现轻微溢出滚动
  const TABLE_HEIGHT_SAFE_GAP = 12
  // 这些 overflow 值通常意味着容器具备“可视区域边界”（滚动或裁剪）
  const BOUNDED_OVERFLOW_VALUES = ['auto', 'scroll', 'hidden', 'clip', 'overlay']

  // 判断容器是否显式声明了高度约束（例如 <ProTable style="height: 600px">）
  const hasInlineHeightConstraint = (el: HTMLElement) => {
    return !!(el.style.height || el.style.maxHeight)
  }

  // 非全屏模式下，向上查找最近的“高度边界容器”，用于混合策略。
  // 当前调用约定：startEl 传入 ProTable 外层 wrapper 元素。
  const getBoundedAncestorBottom = (startEl: HTMLElement) => {
    // 先检查自身，再逐级向上检查父级；
    // 这样当起点元素本身有 height/max-height 约束时也能被正确识别。
    let current: HTMLElement | null = startEl
    while (current && current !== document.body && current !== document.documentElement) {
      const style = window.getComputedStyle(current)
      const overflowY = String(style.overflowY || '').toLowerCase()
      const overflow = String(style.overflow || '').toLowerCase()
      const hasBoundedOverflow = BOUNDED_OVERFLOW_VALUES.includes(overflowY) || BOUNDED_OVERFLOW_VALUES.includes(overflow)
      const hasMaxHeightConstraint = !!style.maxHeight && style.maxHeight !== 'none'
      const hasActualOverflow = current.scrollHeight - current.clientHeight > 1

      // 命中以下任一条件即视作“高度边界”：
      // 1) 内联显式高度约束（最常见：组件 style height/max-height）
      // 2) CSS max-height 约束
      // 3) overflow 形成了真实滚动/裁剪边界
      if (
        current.clientHeight > 0 &&
        (hasInlineHeightConstraint(current) || hasMaxHeightConstraint || (hasBoundedOverflow && hasActualOverflow))
      ) {
        return current.getBoundingClientRect().bottom
      }

      current = current.parentElement
    }
    return undefined
  }

  // 通过版本号触发 computed 重新计算，避免直接依赖 DOM 尺寸导致无法响应窗口变化
  const tableHeightVersion = ref(0)
  const refreshTableMaxHeight = () => {
    tableHeightVersion.value += 1
  }

  // Table最大高度
  const tableMaxHeight = computed<number | string | undefined>(() => {
    // 读取版本号，确保在 ResizeObserver / resize 事件触发后重新计算
    tableHeightVersion.value

    const tableRootEl = TableRef.value?.getTableRootEl?.()
    const tableContainerEl = tableContainerRef.value
    if (!tableRootEl || !tableContainerEl) {
      // 首帧尚未挂载完成时使用透传值兜底
      return attrMaxHeight.value
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
    if (!viewportHeight) {
      return attrMaxHeight.value
    }

    const tableRect = tableRootEl.getBoundingClientRect()
    const containerRect = tableContainerEl.getBoundingClientRect()
    const tableBottomRect = tableBottomContentRef.value?.getBoundingClientRect()

    // 当前视口中从表格顶部到底部的可用空间（全屏始终使用该策略）
    const viewportAvailable = viewportHeight - tableRect.top
    // 表格下方只预留真实底部区域占位（分页 + table-bottom 插槽），
    // 避免把“当前表格高度”误算进保留空间，导致全屏后高度无法放大。
    const reservedBelow = Math.max(tableBottomRect?.height ?? 0, 0)

    // 兜底：当底部区域节点尚未完成布局时，使用容器底部差值保守回退。
    const reservedFallback = Math.max(containerRect.bottom - tableRect.bottom, 0)
    const effectiveReservedBelow = reservedBelow > 0 ? reservedBelow : reservedFallback

    // 全屏：始终使用纯视口策略，不参与外层容器边界判断。
    if (isFullScreen.value) {
      const fullScreenHeight = Math.floor(viewportAvailable - effectiveReservedBelow - TABLE_HEIGHT_SAFE_GAP)
      if (fullScreenHeight <= 0) {
        return TABLE_FALLBACK_MAX_HEIGHT
      }
      return Math.max(fullScreenHeight, TABLE_MIN_MAX_HEIGHT)
    }

    // 非全屏下关闭自动模式时，不设置 max-height，保持 el-table 默认高度行为。
    // 优先级 props传入配置 > 自定义全局配置
    const autoMaxHeightFlag = props.autoMaxHeight ?? proTableGlobalConfig.value?.proTableAutoMaxHeight  ?? true
    if (!autoMaxHeightFlag) {
      return undefined
    }

    // 非全屏混合策略：
    // - 默认继续用视口可用高度（兼容当前大多数页面体验）
    // - 若检测到外层存在可计算高度边界（自定义场景 <ProTable> 或 <ProTable>引用方外层），则取 min(视口可用, 外层可用)

    // 本轮可用高度基线：默认使用视口可用高度。
    let availableHeight = viewportAvailable
    // 是否命中外层高度边界容器：用于后续决定是否跳过最小高度下限。
    let isBoundedByContainer = false
    // 非全屏仅从 ProTable 外层 wrapper 开始找边界（不再回退到 container），
    // 使 <ProTable style="height: xxx" /> 这类约束在第一层即可命中。
    const boundedAncestorBottom = getBoundedAncestorBottom(ProTableWrapperRef.value)
    if (typeof boundedAncestorBottom === 'number') {
      const containerAvailable = boundedAncestorBottom - tableRect.top
      if (containerAvailable > 0) {
        availableHeight = Math.min(viewportAvailable, containerAvailable)
        isBoundedByContainer = true
      }
    }

    const nextHeight = Math.floor(availableHeight - effectiveReservedBelow - TABLE_HEIGHT_SAFE_GAP)
    if (nextHeight <= 0) {
      // 高度受限容器中不回退 undefined，避免失去 max-height 约束后再次溢出裁剪。
      if (isBoundedByContainer) {
        return 1
      }
      return attrMaxHeight.value
    }

    // 关键：当命中外层高度边界（如 <ProTable style="height: 300px" />）时，
    // 不再强制 TABLE_MIN_MAX_HEIGHT 下限，否则会把计算结果抬高并导致超出容器被裁剪。
    if (isBoundedByContainer) {
      return nextHeight
    }

    return Math.max(nextHeight, TABLE_MIN_MAX_HEIGHT)
  })
  // 监听容器尺寸变化，窗口缩放、侧边栏伸缩等场景都触发表格重排
  const filterResizeObserver = new ResizeObserver(() => scheduleHeightAndLayout())
  const tableContainerResizeObserver = new ResizeObserver(() => scheduleHeightAndLayout())
  const onWindowResize = () => {
    scheduleHeightAndLayout()
  }
  onMounted(() => {
    if (tableContainerRef.value) {
      filterResizeObserver.observe(FilterRef.value.$el)
      tableContainerResizeObserver.observe(tableContainerRef.value)
    }
    // 全局窗口变化（浏览器缩放/布局变化）时重算，确保内部滚动优先于页面滚动
    window.addEventListener('resize', onWindowResize)
    // 初始化后补一次重算，拿到稳定的 DOM 尺寸
    nextTick(() => {
      scheduleHeightAndLayout()
    })
  })
  // 组件卸载前断开监听，避免 ResizeObserver 持有引用导致内存泄漏
  onBeforeUnmount(() => {
    filterResizeObserver.disconnect()
    tableContainerResizeObserver.disconnect()
    window.removeEventListener('resize', onWindowResize)
  })
  


  // --------------------   对外暴露方法   --------------------

  const expose: any & ElTableFns = {
    // 获取查询参数
    getQueryParam: getQueryParam,
    // 搜索条件参数变更触发查询事件
    onFilterQuery: onFilterQuery,
    // 刷新数据
    refreshData: queryData,
    // element-plus table 方法
    clearSelection: () => null,
    getSelectionRows: () => null,
    doLayout: () => null,
    // 进一步封装 只返回[row-id] 不返回整行数据
    getSelectionRowIds: (rowKey) => {
      return TableRef.value?.getSelectionRowIds(rowKey)
    },
    toggleRowSelection: () => null,
    toggleAllSelection: () => null,
    toggleRowExpansion: () => null,
    setCurrentRow:  () => null,
  }

  onMounted(() => {
    Object.assign(expose, getElTableFns(TableRef.value))
  })

  defineExpose(expose)

</script>
