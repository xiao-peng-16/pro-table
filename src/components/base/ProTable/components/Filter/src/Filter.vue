<template>
  <div class="filter-wrapper">
    <el-form
      ref="FormRef"
      :model="form"
      :label-position="(attrs.labelPosition as 'left' | 'right' | 'top') ?? 'left'"
      class="filter-form"
      :class="[`flex-${columnNum}`]"
    >
      <el-form-item
        v-for="(item, index) in handleFilters"
        v-show="isShowFilterItem(item, index)"
        :prop="item.prop"
        v-bind="item"
        class="filter-item"
      >
        <el-tooltip placement="bottom" effect="dark" :disabled="!Boolean(item.valueTooltip)" :content="item.valueTooltip">
          <!-- 嵌套一层 div 防止tooltip和el-date-picker不兼容， tooltip监听子节点事件 el-date-picker内部有自己的复杂逻辑-->
          <div style="width:100%;height: 100%;" @mouseenter="updateFilterValueTooltip(item)" > 
            <!-- 插槽 -->
            <slot v-if="item.slot" :name="item.slot" :form="form" :prop="getFormItemProp(item)"  :value="form[getFormItemProp(item)]" :bind="getItemBind(item)"></slot>
            <!-- 输入框 -->
            <el-input v-else-if="!item.type || item.type === 'input'" v-model.trim="form[getFormItemProp(item)]" v-bind="getItemBind(item)"/>
            <!-- 数字输入框 -->
            <el-input-number v-else-if="item.type === 'input-number'" v-model="form[getFormItemProp(item)]" v-bind="getItemBind(item)"/>
            <!-- 选择器 -->
            <el-select v-else-if="item.type === 'select'" v-model="form[getFormItemProp(item)]" v-bind="getItemBind(item)">
              <el-option v-for="option in item.enumItems" :key="option.value" :label="option.label" :value="option.value" />
              <!-- 选择器 调用remote-method 根据搜索词拉取下拉框内容时 [加载中..]插槽 -->
              <template #loading>
                数据加载中...
              </template>
            </el-select>
            <!-- 级联选择器 -->
            <el-cascader v-else-if="item.type === 'cascader'" v-model="form[getFormItemProp(item)]" :options="item.enumItems" v-bind="getItemBind(item)"/>
            <!-- 日期选择器 -->
            <el-date-picker v-else-if="dateTypes.includes(item.type)" v-model="form[getFormItemProp(item)]" v-bind="getItemBind(item)"/>
            <!-- 日期范围选择器 -->
            <el-date-picker v-else-if="dateRangeTypes.includes(item.type)" v-model="form[getFormItemProp(item)]" v-bind="getItemBind(item)"/>
          </div>
        </el-tooltip>
      </el-form-item>

      <div class="filter-item filter-item-btn-wrapper">
        <!-- [查询]按钮 -->
        <el-button @click="query" type="primary" :loading="loading" style="width: 80px;">
          <svg v-show="!loading" xmlns="http://www.w3.org/2000/svg" width="16" height="16" style="margin-right: 5px;" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"/></svg>
          查询
        </el-button>
        <!-- [重置搜索条件]按钮 -->
        <el-button @click="reset">
          <svg xmlns="http://www.w3.org/2000/svg" style="margin-right: 5px;" width="16" height="16" viewBox="0 0 1024 1024"><path fill="currentColor" d="M168 504.2c1-43.7 10-86.1 26.9-126c17.3-41 42.1-77.7 73.7-109.4S337 212.3 378 195c42.4-17.9 87.4-27 133.9-27s91.5 9.1 133.8 27A341.5 341.5 0 0 1 755 268.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.7 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c0-6.7-7.7-10.5-12.9-6.3l-56.4 44.1C765.8 155.1 646.2 92 511.8 92C282.7 92 96.3 275.6 92 503.8a8 8 0 0 0 8 8.2h60c4.4 0 7.9-3.5 8-7.8m756 7.8h-60c-4.4 0-7.9 3.5-8 7.8c-1 43.7-10 86.1-26.9 126c-17.3 41-42.1 77.8-73.7 109.4A342.45 342.45 0 0 1 512.1 856a342.24 342.24 0 0 1-243.2-100.8c-9.9-9.9-19.2-20.4-27.8-31.4l60.2-47a8 8 0 0 0-3-14.1l-175.7-43c-5-1.2-9.9 2.6-9.9 7.7l-.7 181c0 6.7 7.7 10.5 12.9 6.3l56.4-44.1C258.2 868.9 377.8 932 512.2 932c229.2 0 415.5-183.7 419.8-411.8a8 8 0 0 0-8-8.2"/></svg>
          重置
        </el-button>
        <!-- [展开/缩小]按钮 -->
        <el-tooltip v-if="!isOneRow" placement="bottom" effect="dark"
          :content="isShowAllByRow ? '默认显示行数过大,请调整自定义设置' : (isShowAll ? '显示部分搜索条件' : '显示所有搜索条件')"
        >
          <el-button @click="switchIsShowAll" style="padding: 0px;min-width: 35px;" :disabled="isShowAllByRow">
            <svg v-if="isShowAll" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m19 13l-7-6l-7 6"/><path d="m19 17l-7-6l-7 6" opacity="0.5"/></g></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m19 11l-7 6l-7-6"/><path d="m19 7l-7 6l-7-6" opacity="0.5"/></g></svg>
          </el-button>
        </el-tooltip>
        <!-- [自定义设置]按钮 -->
        <el-tooltip placement="bottom" effect="dark" content="自定义设置">
          <el-button @click="openFilterCustomView" style="padding: 0px;min-width: 35px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M18 4a1 1 0 1 0-2 0v1H4a1 1 0 0 0 0 2h12v1a1 1 0 1 0 2 0V7h2a1 1 0 1 0 0-2h-2zM4 11a1 1 0 1 0 0 2h2v1a1 1 0 1 0 2 0v-1h12a1 1 0 1 0 0-2H8v-1a1 1 0 0 0-2 0v1zm-1 7a1 1 0 0 1 1-1h12v-1a1 1 0 1 1 2 0v1h2a1 1 0 1 1 0 2h-2v1a1 1 0 1 1-2 0v-1H4a1 1 0 0 1-1-1"/></g></svg>
          </el-button>
        </el-tooltip>
      </div>
    </el-form>

    <!-- Filter字段自定义设置组件 -->
    <CustomView
      v-if="isShowCustomView"
      ref="ProTableCustomViewRef"
      :custom-id="customStoreId"
      :source-filters="filters"
      @update:custom-global="onUpdateCustomGlobal"
      @update:custom-filter="onUpdateCustomFilter"
    >
      <!-- TableColumn表头插槽透传 -->
      <template v-for="itemSlot in filterSlots" :key="itemSlot" v-slot:[itemSlot]="temp">
        <slot :name="itemSlot" v-bind="temp"></slot>
      </template>
    </CustomView>

  </div>
</template>


<script setup lang="ts" name="Filter">
import '../style/index.scss'
import { ref, computed, watch, useAttrs, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from 'vue-router'
import { ElForm, ElInput, ElInputNumber, ElSelect, ElCascader, ElDatePicker, ElButton, ElTooltip } from "element-plus";
import { CustomView, FilterItem, ProTableGlobalConfig, getInitFilterForm, getFilterParam, getFormItemProp, dateTypes, dateRangeTypes } from '@/components/base/ProTable'
import { getProTableFilterSlots, getShortcuts } from '@/components/base/ProTable/utils'
import { resolveFilterItems } from '@/components/base/ProTable/components/CustomView/utils/useFilterColumnConfig'
import { loadGlobalConfig } from '@/components/base/ProTable/components/CustomView/utils/useGlobalConfig'
import dayjs from 'dayjs'
const route = useRoute()
const attrs = useAttrs()
const props = withDefaults(
  defineProps<{
    // 搜索条件-[Form表单]用于请求接口 使用v-model绑定
    modelValue?: any
    // 搜索条件-字段信息集合
    filters?: FilterItem[],
    // 自定义配置的id 区别每个custom
    customId: string,
    // 加载状态
    loading?: boolean
    // 是否加载自定义配置组件[CustomView] 默认开启， [ProTable]调用Filter设置False 由[ProTable]自己加载完整[CustomView]
    // 既保证[ProTable]使用正常  同时[Filter]可以脱离[ProTable]正常使用（可以一个[Filter]搜索条件同时控制多个列表）
    isShowCustomView?: boolean
  }>(),
  {
    filters: () => [],
    loading: false,
    isShowCustomView: true,
  }
)
const emit = defineEmits<{
  // 更新-搜索条件-[Form表单]用于请求接口 使用v-model绑定
  (e: 'update:modelValue', filterParams),
  // 点击查询
  (e: 'query', filterParams),
  // [搜索条件]重置
  (e: 'filter-reset'),
  // 打开[搜索条件]自定义设置
  (e: 'open-filter-custom-view'),
}>()


const FormRef = ref<InstanceType<typeof ElForm>>()
const ProTableCustomViewRef = ref<InstanceType<typeof CustomView>>()
const filterSlots: string[] = getProTableFilterSlots(props.filters)

// 自定义设置id customId未设置时使用route地址兜底, 这样同一路由下刷新仍可命中缓存，不同页面互不污染
const customStoreId = computed(() => String(props.customId || route.path || ''))

// ProTable全局配置
const proTableGlobalConfig = ref<ProTableGlobalConfig>(loadGlobalConfig())
// 事件 [全局配置] 自定义配置完成
const onUpdateCustomGlobal = () =>{
  proTableGlobalConfig.value = loadGlobalConfig()
}

// [全局配置] 展示行数
const filterShowRow = computed(() => proTableGlobalConfig.value?.filterShowRow ?? 1)
// 是否展开展示所有搜索条件
const isShowAll = ref<boolean>(false)
watch(
  () => proTableGlobalConfig.value?.filterIsShowAll ?? false,
  (filterIsShowAll) => {
    isShowAll.value = filterIsShowAll
  },
  { immediate: true }  // 立即执行：组件初始化时也会进行一次列处理，替代原先的手动初始化赋值。
)

// 是否只有一行搜索添条件
const isOneRow = computed(() => {
  // 这个元素之前已经展示的搜索条件数量
  const alreadyShowNum = handleFilters.value.filter((item: any) => (item.visible ?? true)).length;
  return alreadyShowNum <= columnNum.value
})
// 可能不需要 isShowAll 单凭showRow便把所有搜索条件显示出来了
const isShowAllByRow = computed(() => {
  // 可展示的搜索条件总数 = 展示行数 * 每行个数
  const totalShowNum =  filterShowRow.value * columnNum.value
  // 这个元素之前已经展示的搜索条件数量
  const alreadyShowNum = handleFilters.value.filter((item: any) => (item.visible ?? true)).length;
  return alreadyShowNum <= totalShowNum
})


// 一行放多少个搜索条件
const columnNum = ref(4)
// 根据表单容器宽度计算每行可展示的筛选项数量
const updateColumnNum = () => {
  if (!FormRef.value) return
  const width = FormRef.value.$el.offsetWidth
  // 列数断点：不同宽度显示不同列数
  if (width >= 1650) {
    columnNum.value = 6
  } else if (width >= 1300) {
    columnNum.value = 5
  } else if (width >= 1000) {
    columnNum.value = 4
  } else {
    columnNum.value = 3
  }
}
// 监听容器尺寸变化，窗口缩放或布局变化时实时更新列数
const resizeObserver = new ResizeObserver(() => {
  updateColumnNum()
})
// 组件挂载后开始监听表单容器宽度变化，用于动态计算每行显示的筛选项数量
onMounted(()=>{
  // 首次挂载后先主动计算一次，避免首屏未触发 ResizeObserver 时列数不准确
  updateColumnNum()
  FormRef.value && resizeObserver.observe(FormRef.value.$el)
})
// 组件卸载前断开监听，避免 ResizeObserver 持有引用导致内存泄漏
onBeforeUnmount(() => {
  resizeObserver.disconnect()
})


// 处理后的Filter
const handleFilters = ref<FilterItem[]>([])

// 刷新handleFilters 让vue重新渲染 避免数据变革页面未重新渲染
const refreshHandleFilters = () => {
  handleFilters.value = [...(handleFilters.value || [])]
}

// 是否展示该FilterItem
const isShowFilterItem = (currentItem: any, currentIndex: number):boolean => {
  // 如果当前搜索条件配置了 visible = false 则不展示
  if (currentItem.visible === false) {
    return false
  }

  // 可展示的搜索条件总数 = 展示行数 * 每行个数
  const totalShowNum =  filterShowRow.value * columnNum.value
  // 这个元素之前已经展示的搜索条件数量
  const alreadyShowNum = handleFilters.value.filter((item: any, index: number) => (item.visible ?? true) && index < currentIndex).length;
  return isShowAll.value || alreadyShowNum < totalShowNum
}

// 获取item的bind
const getItemBind = (item: FilterItem) => {
  const itemBind = {...item}
  // 自定义字段初始默认值[value] 和element-plus[el-input]组件冲突 需要排除
  delete itemBind.value
  delete itemBind.slot
  return itemBind
}

// Filters校验处理器
const checkHandle = (item: FilterItem) => {
  // 日期范围类型  prop才可以是数据
  if (!dateRangeTypes.includes(item.type) && Array.isArray(item.prop)) {
    throw new Error(`[Filter] 日期范围类型[${item.type}]的prop才可以使用数组`)
  } else if (dateRangeTypes.includes(item.type) && (!Array.isArray(item.prop) || item.prop.length != 2)) {
    throw new Error(`[Filter] 日期范围类型[${item.type}]的prop数组必须包括开始时间和结束时间字段`)
  }
}

// Filters公共处理器
const commonHandle = (item: FilterItem) => {
  // 是否显示清除按钮
  item.clearable = item.clearable ?? true
}


// 日期范围处理器
const daterangeHandle = (item: FilterItem) => {
  // 范围选择时选中日期所使用的当日内默认时刻
  item.defaultTime = item.defaultTime ?? [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]
  // 快捷选项
  item.shortcuts = item.shortcuts ?? getShortcuts()
}

// Filters类型处理器
const typeHandles = {
  // Selecet选择器组件
  select: (item: FilterItem) => {
    // 多选情况下
    if (item.multiple) {
      item.collapseTags = item.collapseTags ?? true
      item.collapseTagsTooltip = item.collapseTagsTooltip ?? true
    }
    // tag 标签类型
    item.tagType = 'primary'
    // 选项是否可以被搜索
    item.filterable = item.filterable ?? true
    // 是否 远程调用接口获取下拉框的选项（枚举项）， 适用于后端枚举项来源于数据库 数据量过大需要搜索词过滤匹配场景（如下拉框选择用户表信息）
    if (item.filterable && item.getSelectEnumItems && !item.enumItems) {
      // 是否从服务器远程加载 参考 Element-plus[select] remote属性
      item.remote = true
      // 当输入值发生变化时触发的函数 参考 Element-plus[select] remote-method属性
      item.remoteMethod = async (searchKey: string) => {
        if (searchKey) {
          try {
            item.loading = true                 // 设置数据加载状态
            refreshHandleFilters()  // 页面重新渲染
            // 调用方法获取searchKey匹配的枚举项
            const result = item.getSelectEnumItems(searchKey)
            // 统一兼容 直接同步返回数据和异步返回(Promise<数据>)：避免把Promise本身赋给enumItems
            item.enumItems = await Promise.resolve(result ?? [])
            refreshHandleFilters()  // 页面重新渲染
            } finally {
            item.loading = false
            refreshHandleFilters()  // 页面重新渲染
          }
        }
      }
    }
  },
  // Cascader级联选择器
  cascader: (item: FilterItem) => {
    item.props = item.props ?? {}
    // 	次级菜单的展开方式 'click' | 'hover'
    item.props.expandTrigger = 'hover'
    // 多选情况下
    item.props.multiple = item.props.multiple ?? item.multiple
    if (item.props.multiple) {
      item.collapseTags = item.collapseTags ?? true
      item.collapseTagsTooltip = item.collapseTagsTooltip ?? true
    }
    // 在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
    item.props.emitPath = item.props.emitPath ?? false
    // tag 标签类型
    item.tagType = 'primary'
    // 选项是否可以被搜索
    item.filterable = item.filterable ?? true
  },
  yearrange: daterangeHandle,
  monthrange: daterangeHandle,
  daterange: daterangeHandle,
  datetimerange: daterangeHandle
}


// 处理Filter 并设置[handleFilters.value]
const handleFilter = (list: FilterItem[]) => {
  // 递归TableColumn处理
  list.forEach(item => {
    // 校验
    checkHandle(item)
    // 公共处理
    commonHandle(item)
    // 根据类型进行特殊处理 无对应类型使用默认处理器
    item.type && typeHandles[item.type] ? typeHandles[item.type](item) : false
  })
  handleFilters.value = list
}


// 更新Filter内容区Tooltip提示  item.valueTooltip 如果有内容时 Tooltip组件会展示提示
const updateFilterValueTooltip = (item: FilterItem) =>{
  // 日期范围选择器
  if (dateRangeTypes.includes(item.type)) {
    const dateArray = form.value[getFormItemProp(item)]
    if (Array.isArray(dateArray) && dateArray.length === 2) {
      // 设置[Tooltip]提示内容
      const dateFormat = getDateFormatByType(item.type)
      const startText = dayjs(dateArray[0]).format(dateFormat)
      const endText =   dayjs(dateArray[1]).format(dateFormat)
      item.valueTooltip =  `[ ${startText}  至  ${endText} ]`
      return
    }

  }
  // 设置[false]不展示Tooltip提示
  item.valueTooltip = false
}
// 获取日期type对应的格式
const getDateFormatByType = (type?: FilterItem['type']) => {
  switch (type) {
    case 'yearrange':
      return 'YYYY'
    case 'monthrange':
      return 'YYYY-MM'
    case 'daterange':
      return 'YYYY-MM-DD'
    case 'datetimerange':
      return 'YYYY-MM-DD HH:mm:ss'
    default:
      return 'YYYY-MM-DD HH:mm:ss'
  }
}



// ----------   监听外部Filters变化 按Custom自定义搜索条件(顺序+列字段属性[visible]) 并调用handleFilter重新渲染 ----------------
watch(
  () => props.filters,
  (newFilters) => {
    // [最终渲染列表字段] 用户自定义设置搜索条件字段（字段顺序 + visible）
    // 代码配置搜索字段信息 和 浏览器保存用户自定义配置(搜索条件顺序+列字段属性[visible]) 进行合并
    const customFilters = resolveFilterItems(newFilters || [], {
      storageId: customStoreId.value,
      usePersisted: true,
    })
    handleFilter(customFilters)
  },
  {
    // 深度监听：支持外部在原数组引用不变的情况下，直接修改列内部字段。
    // 例如：columns[i].visible = false / columns[i].label = '新标题'
    deep: true,
    // 立即执行：组件初始化时也会进行一次列处理，替代原先的手动初始化赋值。
    immediate: true,
  }
)

  
// [搜索条件字段]自定义配置完成
const onUpdateCustomFilter = (customFilters: FilterItem[]) =>{
  handleFilter(customFilters)
}


// ----------   搜索条件-[Form表单]用于请求接口 （支持外部参数同步搜索过滤）  --------------------
const form = ref(getInitFilterForm(props.filters))
// 获取查询参数
const getQueryParam = () => {
  const filterParam = getFilterParam(handleFilters.value, form.value)
  // 优先filterParam
  return {
    ...(props.modelValue ?? {}),
    ...filterParam
  }
}

// 监听form同步到外部modelValue
if (props.modelValue !== undefined){
  watch(() => form.value, () => {
    emit('update:modelValue', getQueryParam())
  }, { deep: true, immediate: true })
}

// 监听外部modelValue同步到内部form
let isUpdateFromLock = false  // 枷锁防止父子组件互相无限调用
if (props.modelValue !== undefined){
  watch(() => props.modelValue, (newModelValue) => {
    if (newModelValue !== undefined && !isUpdateFromLock) {
      isUpdateFromLock = true
      // 优先ModelValue
      form.value = { ...form.value, ...newModelValue }
      nextTick(() => {
        isUpdateFromLock = false
      })
    }
  }, {  deep: true })
}



// 查询
const query = () => {
  const queryParam = getQueryParam()
  emit('update:modelValue', queryParam)
  emit('query', queryParam)
}

// 重置
const reset = () => {
  form.value = getInitFilterForm(props.filters)
  emit('filter-reset')
}

// 切换是否展开展示所有搜索条件
const switchIsShowAll = () => {
  isShowAll.value = !isShowAll.value
}

// [Filter操作-打开自定义设置] 打开Table列字段自定义设置组件
const openFilterCustomView = () => {
  // 是否加载自定义配置组件[CustomView] 默认开启， [ProTable]调用Filter设置False 由[ProTable]自己加载完整[CustomView]
  if (props.isShowCustomView) {
    ProTableCustomViewRef.value.openDialog('filter_config')
  } else {
    emit('open-filter-custom-view')
  }
}

// 导出方法
const expose = {
  // 获取Filter搜索条件查询参数
  getQueryParam: getQueryParam,
  // [全局配置] 自定义配置完成
  onUpdateCustomGlobal: onUpdateCustomGlobal,
  // [搜索条件字段]自定义配置完成
  onUpdateCustomFilter: onUpdateCustomFilter
}

defineExpose(expose)

</script>

